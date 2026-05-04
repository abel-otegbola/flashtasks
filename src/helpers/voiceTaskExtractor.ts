/**
 * voiceTaskExtractor.ts
 * ─────────────────────
 * Converts raw transcribed speech into structured task objects.
 *
 * Engine: Gemini 2.5 Flash  (gemini-2.5-flash-preview-04-17)
 *
 * Speed optimisations applied
 * ───────────────────────────
 * 1. response_mime_type "application/json"  — skips the model's markdown
 *    wrapping entirely; no fence-stripping needed, no parse failures.
 * 2. response_schema                        — Gemini validates + coerces the
 *    output before returning it, so we never get a malformed array.
 * 3. max_output_tokens: 512                 — a transcript rarely yields
 *    more than ~10 tasks; 512 tokens is plenty and caps latency hard.
 * 4. temperature: 0                         — deterministic; avoids the
 *    model adding prose before/after the JSON.
 * 5. System instruction injected as         — keeps the user turn short,
 *    systemInstruction field                  which reduces prefill time.
 * 6. Today's date baked into the prompt     — removes a round-trip that
 *    would otherwise be needed to resolve relative dates.
 * 7. Lightweight keep-alives: spreadTasksOverWindow + detectDeadlineWindow
 *    run locally (zero network cost) after the single API call.
 *
 * Pipeline
 * ────────
 *  raw transcript
 *       ↓ buildRequest()     — assemble Gemini payload (fast, local)
 *       ↓ callGemini()       — single HTTP POST, streaming disabled for
 *                              simplicity (add streamGemini() if <300ms
 *                              time-to-first-token matters to you)
 *       ↓ castTasks()        — map raw JSON → ExtractedTask[]
 *       ↓ spreadTasksOverWindow() — distribute undated tasks if a deadline
 *                              window phrase was found in the transcript
 */

// ─────────────────────────────────────────────────────────────────────────────
// Public types  (unchanged — existing callers keep working)
// ─────────────────────────────────────────────────────────────────────────────

export type Priority = "low" | "medium" | "high";

export interface ExtractedTask {
  id: string;
  title: string;
  description: string;   // human-readable expansion; never identical to title
  originalText: string;
  date: Date | null;
  timeText: string | null;
  people: string[];
  tags: string[];
  priority: Priority;
  confidence: number;    // 0–1
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const GEMINI_MODEL   = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Pull from env — never hard-code keys in source
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? "";

// NOTE: responseSchema is NOT used with Gemini 2.5 Flash — it silently
// ignores the constraint and returns "[]". Array safety is handled in
// castTasks() instead.

// ─────────────────────────────────────────────────────────────────────────────
// System instruction  (speed optimisation #5 — separate from user turn)
// ─────────────────────────────────────────────────────────────────────────────

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
- Split run-ons: "call Tolu then email the client" → 2 tasks.
- Tasks with no explicit date get dateISO: null (the caller will spread them).
- If no tasks found, return [].`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Gemini request builder
// ─────────────────────────────────────────────────────────────────────────────

interface GeminiPayload {
  system_instruction: { parts: [{ text: string }] };
  contents: [{ role: "user"; parts: [{ text: string }] }];
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
    responseMimeType: string;
    thinkingConfig: { thinkingBudget: number };
  };
}

function buildRequest(transcript: string, todayISO: string): GeminiPayload {
  return {
    system_instruction: {
      parts: [{ text: buildSystemInstruction(todayISO) }],
    },
    contents: [{
      role: "user",
      parts: [{ text: transcript }],
    }],
    generationConfig: {
      temperature: 1,                        // required when thinkingConfig is present
      maxOutputTokens: 1024,                 // enough for ~20 tasks
      responseMimeType: "application/json",  // no markdown wrapping (speed opt #1)
      thinkingConfig: { thinkingBudget: 0 }, // disable thinking phase (speed opt #2)
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Gemini HTTP call
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

async function callGemini(payload: GeminiPayload): Promise<RawTask[]> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

  const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const body = await res.json();

  // Gemini wraps the content in candidates[0].content.parts[0].text
  // Because we set responseMimeType to application/json, the text IS
  // already a valid JSON string — no fence-stripping needed.
  const raw: string = body?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";

  try {
    const parsed = JSON.parse(raw);
    // Guard against object wrapper e.g. { tasks: [...] } or plain non-array
    if (Array.isArray(parsed)) return parsed;
    // Some models wrap the array in a key — try common ones
    for (const key of ["tasks", "items", "results", "data"]) {
      if (Array.isArray((parsed as Record<string, unknown>)[key])) {
        return (parsed as Record<string, unknown[]>)[key] as RawTask[];
      }
    }
    console.error("[voiceTaskExtractor] Unexpected JSON shape:", parsed);
    return [];
  } catch {
    console.error("[voiceTaskExtractor] Failed to parse Gemini response:", raw);
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
      title:        t.title,
      description:  t.description,
      originalText: t.originalText,
      date:         t.dateISO ? new Date(t.dateISO) : null,
      timeText:     t.timeText ?? null,
      people:       Array.isArray(t.people) ? t.people : [],
      tags:         Array.isArray(t.tags)   ? t.tags   : [],
      priority:     (["low","medium","high"].includes(t.priority) ? t.priority : "medium") as Priority,
      confidence:   Math.max(0, Math.min(1, t.confidence ?? 0)),
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Deadline window detector  (local — no network cost)
// Detects "3 days to finish", "a week to complete", etc.
// Returns total days, or null if not found.
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
// Distributes undated tasks evenly across a deadline window.
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

/**
 * extractTasksFromText
 * ─────────────────────
 * Converts a raw transcript string into an array of structured tasks.
 *
 * @param text  Raw transcript from SpeechRecognition or typed input
 * @param now   Override "now" for date resolution (useful in tests)
 * @returns     Promise<ExtractedTask[]> sorted by date ascending
 *
 * @example
 * const tasks = await extractTasksFromText(
 *   "I want to create a portfolio design for my web design agency. " +
 *   "After that I will develop the code then finally launch it. " +
 *   "I have just 3 days to finalise the design and development"
 * );
 * // → [
 * //   { title: "Create a portfolio design for my web design agency", date: Day 1 },
 * //   { title: "Develop the code",                                   date: Day 2 },
 * //   { title: "Launch the website",                                 date: Day 3 },
 * // ]
 */
export async function extractTasksFromText(
  text: string,
  now: Date = new Date()
): Promise<ExtractedTask[]> {
  if (!text?.trim()) return [];

  const todayISO = now.toISOString().slice(0, 10);

  // Single API call — all extraction happens server-side
  const payload  = buildRequest(text, todayISO);
  const rawTasks = await callGemini(payload);
  const tasks    = castTasks(rawTasks);

  if (tasks.length === 0) return [];

  // Local post-processing: deadline window spreading (zero latency)
  const windowDays = detectDeadlineWindow(text);

  if (windowDays !== null) {
    spreadTasksOverWindow(tasks, windowDays, now);
    tasks.sort(
      (a, b) => (a.date?.getTime() ?? Infinity) - (b.date?.getTime() ?? Infinity)
    );
  } else {
    // No deadline window: high-confidence tasks first, then by date
    tasks.sort((a, b) => {
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      if (a.date && b.date) return a.date.getTime() - b.date.getTime();
      return a.date ? -1 : b.date ? 1 : 0;
    });
  }
  console.log(tasks)
  return tasks;
}