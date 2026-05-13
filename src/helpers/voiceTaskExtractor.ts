export type Priority = "low" | "medium" | "high";

export interface ExtractedTask {
  id: string;
  title: string;
  description: string;
  originalText: string;
  date: Date | null;
  timeText: string | null;
  people: string[];
  tags: string[];
  priority: Priority;
  confidence: number;    // 0–1
}

// ─────────────────────────────────────────────────────────────────────────────
// Groq Configuration (Direct API)
// ─────────────────────────────────────────────────────────────────────────────

const GROQ_MODEL = "llama-3.1-8b-instant"; // Groq's optimized Llama 3.1 8B
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY ?? "";

function buildSystemInstruction(todayISO: string): string {
  return `You are a task extraction engine. Extract every actionable task from the voice transcript the user provides.

Return a JSON array. Each element must follow the schema exactly.

Field rules:
- title        : clean imperative phrase, ≤80 chars. Strip spoken prefixes like
                 "I need to", "remind me to", "don't forget to".
- description  : one sentence expanding context. Must differ from title.
- originalText : verbatim fragment this task came from.
- dateISO      : ISO 8601 string if a date/time is explicitly mentioned, else null.
                 Resolve relative phrases from today = ${todayISO}.
- timeText     : human-readable date phrase ("tomorrow", "next Monday"), else null.
- people       : proper names of people involved (empty array if none).
- tags         : up to 3 tags from this set only:
                 work | finance | health | personal | learning | design | dev | comms | agency
- priority     : "high" if urgent/asap/deadline/today, "low" if whenever/eventually,
                 else "medium".
- confidence   : 0–1 float. How confident you are this is a real actionable task.

Extra rules:
- Omit items with confidence < 0.35.
- Tasks with no explicit date get dateISO: null (the caller will spread them).
- If no tasks found, return [].

IMPORTANT: Return ONLY valid JSON. No markdown fences, no explanations, no extra text.`;
}

interface GroqPayload {
  model: string;
  messages: Array<{ role: "system" | "user"; content: string }>;
  temperature: number;
  max_tokens: number;
  response_format?: { type: "json_object" };
}

function buildRequest(transcript: string, todayISO: string): GroqPayload {
  return {
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: buildSystemInstruction(todayISO) },
      { role: "user", content: transcript }
    ],
    temperature: 0.1, // Lower temp for deterministic JSON output
    max_tokens: 1024,
    response_format: { type: "json_object" } // Groq supports JSON mode
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Groq HTTP call
// ─────────────────────────────────────────────────────────────────────────────

interface RawTask {
  title: string;
  description: string;
  originalText: string;
  dateISO?: string | null;
  timeText?: string | null;
  people: string[];
  tags: string[];
  priority: Priority;
  confidence: number;
}
async function callGroq(payload: GroqPayload): Promise<RawTask[]> {
  if (!GROQ_API_KEY) {
    throw new Error("VITE_GROQ_API_KEY environment variable is not set.");
  }

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Groq API error ${res.status}: ${errText}`);
  }

  const body = await res.json();

  // Groq returns OpenAI-compatible format: choices[0].message.content
  const raw: string = body?.choices?.[0]?.message?.content?.trim() ?? "[]";

  try {
    // Strip markdown code fences if present (defensive parsing)
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleaned);
    
    // ✅ FIX: Always return array (handle single task objects)
    let tasksArray: RawTask[];

    // Case 1: Already an array
    if (Array.isArray(parsed)) {
      tasksArray = parsed;
    }
    // Case 2: Object with common wrapper keys (tasks, items, etc.)
    else if (typeof parsed === 'object' && parsed !== null) {
      const wrapperKeys = ['tasks', 'items', 'results', 'data', 'task', 'item'];
      const foundKey = wrapperKeys.find(key => 
        parsed.hasOwnProperty(key) || parsed.hasOwnProperty(key.charAt(0).toUpperCase() + key.slice(1))
      );
      
      if (foundKey && Array.isArray(parsed[foundKey])) {
        tasksArray = parsed[foundKey];
      }
      // Case 3: Single task object
      else {
        tasksArray = [parsed];
      }
    }
    // Case 4: Unexpected shape
    else {
      console.error("[voiceTaskExtractor] Unexpected JSON shape:", parsed);
      return [];
    }

    return tasksArray;
  } catch (e) {
    console.error("[voiceTaskExtractor] Failed to parse Groq response:", raw);
    console.error("Parse error:", e);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Cast raw API output → ExtractedTask[]
// ─────────────────────────────────────────────────────────────────────────────

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function castTasks(raw: RawTask[]): ExtractedTask[] {
  return raw
    .filter(t => (t.confidence ?? 0) >= 0.35)
    .map(t => ({
      id:           generateId(),
      title:        t.title?.slice(0, 80) ?? "",
      description:  t.description ?? "",
      originalText: t.originalText ?? "",
      date:         t.dateISO ? new Date(t.dateISO) : null,
      timeText:     t.timeText ?? null,
      people:       Array.isArray(t.people) ? t.people : [],
      tags:         Array.isArray(t.tags) ? t.tags.slice(0, 3) : [],
      priority:     (["low","medium","high"].includes(t.priority) ? t.priority : "medium") as Priority,
      confidence:   Math.max(0, Math.min(1, t.confidence ?? 0)),
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Deadline window detector  (local — no network cost)
// ─────────────────────────────────────────────────────────────────────────────

export function detectDeadlineWindow(text: string): number | null {
  const lower = text.toLowerCase();
  const wordToNum: Record<string, number> = {
    a:1, an:1, one:1, two:2, three:3, four:4, five:5,
    six:6, seven:7, eight:8, nine:9, ten:10,
  };
  const m = lower.match(
    /\b(?:just\s+)?(\d+|a|an|one|two|three|four|five|six|seven|eight|nine|ten)\s+(day|week)s?\s+to\b/
  );
  if (!m) return null;
  const n = wordToNum[m[1]] ?? parseInt(m[1], 10);
  return m[2] === "week" ? n * 7 : n;
}

// ─────────────────────────────────────────────────────────────────────────────
// Task spreader  (local — no network cost)
// ─────────────────────────────────────────────────────────────────────────────

export function spreadTasksOverWindow(
  tasks: ExtractedTask[],
  windowDays: number,
  now: Date
): ExtractedTask[] {
  const unscheduled = tasks.filter(t => !t.date);
  const scheduled   = tasks.filter(t =>  t.date);

  if (unscheduled.length === 0) return tasks;

  const step = windowDays / unscheduled.length;

  unscheduled.forEach((task, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + Math.floor(i * step));
    d.setHours(9, 0, 0, 0);
    task.date     = d;
    task.timeText = `Day ${i + 1} of ${windowDays}`;
  });

  return [...scheduled, ...unscheduled].sort(
    (a, b) => (a.date?.getTime() ?? Infinity) - (b.date?.getTime() ?? Infinity)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Public entry point
// ─────────────────────────────────────────────────────────────────────────────

export async function extractTasksFromText(
  text: string,
  now: Date = new Date()
): Promise<ExtractedTask[]> {
  if (!text?.trim()) return [];

  const todayISO = now.toISOString().slice(0, 10);

  const payload  = buildRequest(text, todayISO);
  const rawTasks = await callGroq(payload);
  const tasks    = castTasks(rawTasks);

  if (tasks.length === 0) return [];

  const windowDays = detectDeadlineWindow(text);

  if (windowDays !== null) {
    spreadTasksOverWindow(tasks, windowDays, now);
    tasks.sort(
      (a, b) => (a.date?.getTime() ?? Infinity) - (b.date?.getTime() ?? Infinity)
    );
  } else {
    tasks.sort((a, b) => {
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      if (a.date && b.date) return a.date.getTime() - b.date.getTime();
      return a.date ? -1 : b.date ? 1 : 0;
    });
  }
  return tasks;
}
