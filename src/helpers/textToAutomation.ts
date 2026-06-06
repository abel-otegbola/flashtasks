// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

import { action, ActionData, Automation } from "../interface/automation";

export type AutomationStatus = "active" | "inactive" | "paused" | "failed";
export type ActionStatus = "pending" | "done" | "failed";
export type ActionPriority = "low" | "medium" | "high";
export type RecurringType = "daily" | "weekly" | "monthly";

/**
 * IDs that are known at call-time and will be injected into actions after
 * Groq returns. Pass only what is relevant to your context.
 */
export interface AutomationArgs {
  userId?: string;
  teamId?: string;
  organizationId?: string;
  /** Map taskId placeholders → real IDs when known upfront */
  taskIds?: string[];
  /** Map teamMember placeholders → real member IDs */
  teamMembers?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Groq Configuration
// ─────────────────────────────────────────────────────────────────────────────

const GROQ_MODEL   = "llama-3.1-8b-instant";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY ?? "";

// ─────────────────────────────────────────────────────────────────────────────
// System prompt
// ─────────────────────────────────────────────────────────────────────────────

const SUPPORTED_ACTION_TYPES = [
  "create_task",
  "update_task",
  "search_tasks",
  "complete_task",
  "review_tasks",
  "generate_followups",
  "prioritize_tasks",
  "send_email",
  "send_summary_email",
  "send_reminder",
  "notify_team",
  "searchEmails",
  "createDraft",
] as const;

export type SupportedActionType = (typeof SUPPORTED_ACTION_TYPES)[number];

function buildSystemPrompt(nowISO: string): string {
  return `You are an automation-design engine. Given a natural-language description of an automation workflow, return a single JSON object that matches the schema below exactly.

TODAY = ${nowISO}

────────────────────────────────────────────
SCHEMA (return ONLY this JSON, no fences)
────────────────────────────────────────────
{
  "title":       string,          // ≤80 chars, imperative phrase
  "description": string,          // 1-2 sentences expanding on what this automation does
  "instruction": string,          // full natural-language restatement of what was requested
  "status":      "active",        // always "active" for a new automation
  "schedule":    string,          // cron expression OR human label ("daily at 9am", "every Monday")
  "actions": [                    // ordered list of actions this automation performs
    {
      "type":         string,     // MUST be one of the supported types listed below
      "params":       object,     // extra runtime params (can be {})
      "scheduledFor": string | null, // ISO datetime offset from TODAY if determinable, else null
      "status":       "pending",
      "priority":     "low" | "medium" | "high",
      "retryCount":   0,
      "maxRetries":   3,
      "recurring": {              // omit if action is one-off
        "type":     "daily" | "weekly" | "monthly",
        "interval": number        // e.g. 2 = every 2 days/weeks/months
      } | null,
      "data": {                   // shape depends on "type" — see rules below
        ...
      }
    }
  ]
}

────────────────────────────────────────────
SUPPORTED ACTION TYPES & data shapes
────────────────────────────────────────────
create_task         → data: { userId: "{{userId}}", title: string, description: string }
update_task         → data: { taskId: "{{taskId}}", data: object }
complete_task       → data: { taskId: "{{taskId}}" }
review_tasks        → data: { userId: "{{userId}}" }
generate_followups  → data: { userId: "{{userId}}" }
prioritize_tasks    → data: { taskIds: ["{{taskId}}"] }
search_tasks        → data: { userId: "{{userId}}", query: string, filters?: object }
send_email          → data: { to: string, subject: string, body: string }
send_summary_email  → data: { to: string, subject: string, body: string }
send_reminder       → data: { to: string, subject: string, body: string }
notify_team         → data: { teamMembers: ["{{teamMember}}"], body: string }
searchEmails        → data: { query: string, maxResults: number }
createDraft         → data: { to: string, subject: string, body: string }

────────────────────────────────────────────
PLACEHOLDER RULES (critical)
────────────────────────────────────────────
- Use {{userId}}      wherever a user ID is needed — caller will inject the real value.
- Use {{taskId}}      wherever a task ID is needed.
- Use {{teamMember}}  wherever a team-member ID is needed.
- For email addresses, subjects, and bodies: generate realistic placeholder values
  based on context (e.g. "user@example.com", "Weekly Summary", "Here is your weekly summary…").
- DO NOT invent real UUIDs or database IDs.

────────────────────────────────────────────
EXTRA RULES
────────────────────────────────────────────
- Only use action types from the supported list above.
- Order actions logically (e.g. search before draft, create before notify).
- If no clear schedule is mentioned, default schedule to "daily".
- If no priority is inferable, use "medium".
- Return ONLY valid JSON. No markdown, no explanation, no extra text.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Groq call
// ─────────────────────────────────────────────────────────────────────────────

interface RawAutomation {
  title: string;
  description?: string;
  instruction: string;
  status?: AutomationStatus;
  schedule: string;
  actions?: RawAction[];
}

interface RawAction {
  type: string;
  params?: object;
  scheduledFor?: string | null;
  status?: ActionStatus;
  priority?: ActionPriority;
  retryCount?: number;
  maxRetries?: number;
  recurring?: { type: RecurringType; interval?: number } | null;
  data?: Record<string, unknown>;
}

async function callGroq(text: string, nowISO: string): Promise<RawAutomation | null> {
  if (!GROQ_API_KEY) {
    throw new Error("VITE_GROQ_API_KEY environment variable is not set.");
  }

  const payload = {
    model: GROQ_MODEL,
    messages: [
      { role: "system" as const, content: buildSystemPrompt(nowISO) },
      { role: "user"   as const, content: text },
    ],
    temperature: 0.15,
    max_tokens: 1500,
    response_format: { type: "json_object" },
  };

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Groq API error ${res.status}: ${errText}`);
  }

  const body = await res.json();
  const raw: string = body?.choices?.[0]?.message?.content?.trim() ?? "{}";

  try {
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    return parsed as RawAutomation;
  } catch (e) {
    console.error("[textToAutomation] Failed to parse Groq response:", raw, e);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ID injection — replaces {{placeholder}} tokens with real runtime args
// ─────────────────────────────────────────────────────────────────────────────

function injectPlaceholders(
  value: unknown,
  args: AutomationArgs,
  taskIdCursor = { i: 0 },
  teamMemberCursor = { i: 0 }
): unknown {
  if (typeof value === "string") {
    if (value === "{{userId}}")     return args.userId     ?? value;
    if (value === "{{teamMember}}") {
      const member = args.teamMembers?.[teamMemberCursor.i] ?? value;
      teamMemberCursor.i++;
      return member;
    }
    if (value === "{{taskId}}") {
      const id = args.taskIds?.[taskIdCursor.i] ?? value;
      taskIdCursor.i++;
      return id;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(v => injectPlaceholders(v, args, taskIdCursor, teamMemberCursor));
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        injectPlaceholders(v, args, taskIdCursor, teamMemberCursor),
      ])
    );
  }
  return value;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cast raw → action[]
// ─────────────────────────────────────────────────────────────────────────────

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function castActions(rawActions: RawAction[], args: AutomationArgs): action[] {
  const taskIdCursor      = { i: 0 };
  const teamMemberCursor  = { i: 0 };

  return rawActions
    .filter(a => SUPPORTED_ACTION_TYPES.includes(a.type as SupportedActionType))
    .map(a => {
      const injectedData = injectPlaceholders(
        a.data ?? {},
        args,
        taskIdCursor,
        teamMemberCursor
      ) as ActionData;

      return {
        id:           generateId(),
        type:         a.type,
        params:       a.params ?? {},
        scheduledFor: a.scheduledFor ?? null,
        status:       "pending" as ActionStatus,
        priority:     a.priority ?? "medium",
        retryCount:   a.retryCount ?? 0,
        maxRetries:   a.maxRetries ?? 3,
        ...(a.recurring ? { recurring: a.recurring } : {}),
        data:         injectedData,
      } satisfies action;
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Cast raw → Automation (skeleton — caller fills IDs / timestamps)
// ─────────────────────────────────────────────────────────────────────────────

function castAutomation(
  raw: RawAutomation,
  args: AutomationArgs,
  nowISO: string
): Omit<Automation, "$id" | "$createdAt" | "$updatedAt"> {
  return {
    title:          raw.title?.slice(0, 80) ?? "Untitled Automation",
    description:    raw.description ?? "",
    instruction:    raw.instruction ?? "",
    status:         "active",
    schedule:       raw.schedule ?? "daily",
    actions:        castActions(raw.actions ?? [], args),
    userId:         args.userId ?? "{{userId}}",
    ...(args.organizationId ? { organizationId: args.organizationId } : {}),
    ...(args.teamId          ? { teamId:         args.teamId         } : {}),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public entry point
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract an Automation (with actions) from a natural-language description.
 *
 * @param text  - Natural-language description of the automation.
 * @param args  - Runtime IDs to inject (userId, teamId, taskIds, teamMembers…).
 * @param now   - Reference date (defaults to now).
 *
 * @returns     A partial Automation object (without $id / timestamps).
 *              You are expected to persist it and assign $id, $createdAt, $updatedAt.
 */
export async function extractAutomationFromText(
  text: string,
  args: AutomationArgs = {},
  now: Date = new Date()
): Promise<Omit<Automation, "$id" | "$createdAt" | "$updatedAt"> | null> {
  if (!text?.trim()) return null;

  const nowISO = now.toISOString();
  const raw    = await callGroq(text, nowISO);

  if (!raw) return null;

  return castAutomation(raw, args, nowISO);
}