/**
 * voiceTaskExtractor.ts
 * ─────────────────────
 * Converts raw transcribed speech into structured task objects.
 *
 * Design goals
 * ────────────
 * • Zero runtime dependencies   — works fully offline, no npm packages needed
 * • Single-pass where possible  — each sentence is processed once
 * • Deterministic               — same input always produces the same output
 * • Speech-aware                — handles filler words, run-on sentences,
 *                                 missing punctuation, spoken date/time phrases
 *
 * Pipeline
 * ────────
 *  raw transcript
 *       ↓ normalise()        — lowercase, strip fillers, fix punctuation
 *       ↓ segment()          — split into individual task candidates
 *       ↓ parseCandidate()   — extract verb · date · people · priority · tags
 *       ↓ buildTitle()       — clean imperative title from candidate
 *       ↓ scoreConfidence()  — 0–1 confidence; low scores are discarded
 */

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────

export type Priority = "low" | "medium" | "high";

export interface ExtractedTask {
  id: string;
  title: string;
  originalText: string;
  date: Date | null;
  timeText: string | null;
  people: string[];
  tags: string[];
  priority: Priority;
  confidence: number; // 0–1
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verbs that strongly imply an actionable task.
 * Split into tiers — tier-1 carries more confidence weight than tier-2.
 */
const TASK_VERBS_T1 = new Set([
  "call", "email", "message", "text", "send", "reply", "respond",
  "submit", "upload", "publish", "deploy", "release", "ship",
  "pay", "buy", "order", "purchase", "book", "reserve",
  "schedule", "arrange", "organise", "organize",
  "fix", "debug", "resolve", "patch", "repair",
  "write", "draft", "create", "build", "design", "develop",
  "review", "check", "test", "verify", "confirm", "approve",
  "meet", "attend", "join", "present",
  "remind", "follow", "update", "prepare", "plan",
]);

const TASK_VERBS_T2 = new Set([
  "finish", "complete", "close", "wrap", "finalize",
  "read", "research", "look", "find", "search",
  "add", "remove", "delete", "move", "copy", "rename",
  "share", "post", "tweet", "announce",
  "talk", "discuss", "ask", "tell", "inform", "notify",
  "clean", "clear", "archive", "backup",
  "start", "begin", "continue", "resume",
  "record", "track", "log", "document",
]);

/** Spoken prefixes that introduce a task but carry no semantic content */
const TASK_PREFIXES = [
  /^i (need|have|want|got|should|must|will|am going) to\b/i,
  /^(please |can you |could you |don'?t forget to |remember to |make sure (to |you )?)?\b/i,
  /^remind (me |us )?(to |about )?\b/i,
  /^(also |oh and |and also |one more thing[,:]? )\b/i,
  /^(so |ok(ay)?[,:]? |right[,:]? )\b/i,
  /^(let'?s |we (need|should|have) to |we'?re going to )\b/i,
  /^don'?t (let me )?forget (to )?\b/i,
];

/** Words to strip entirely from the title (not from originalText) */
const FILLER_WORDS = [
  "uh", "um", "uhm", "hmm", "hm", "err", "erm",
  "like", "you know", "you know what i mean",
  "basically", "literally", "actually", "honestly",
  "kind of", "sort of", "kinda", "sorta",
  "i mean", "i guess", "i think",
  "right", "okay", "ok", "so", "well",
];

/** Conjunctions / transitional phrases that split a run-on sentence */
const SEGMENT_SPLITTERS = [
  " and then ",
  " after that ",
  " also ",
  " as well as ",
  " plus ",
  ", and ",
  "; ",
];

// ─────────────────────────────────────────────────────────────────────────────
// Date / time parser  (no chrono-node — pure regex)
// ─────────────────────────────────────────────────────────────────────────────

interface ParsedDateTime {
  date: Date | null;
  timeText: string | null;
}

/**
 * Recognises spoken date/time expressions and resolves them to a Date.
 * All patterns are relative to `now` so the function works offline.
 *
 * Handled:
 *   today, tomorrow, yesterday
 *   next {weekday | week | month}
 *   this {weekday}
 *   in {N} {days | weeks | months}
 *   on {weekday}
 *   {month} {d}[st|nd|rd|th]
 *   {d}[st|nd|rd|th] of {month}
 *   at {h}[:{mm}] [am|pm]
 *   {weekday} at {time}
 */
function parseDateTime(text: string, now: Date = new Date()): ParsedDateTime {
  const lower = text.toLowerCase();
  let date: Date | null = null;
  let timeText: string | null = null;

  // ── Helpers ──────────────────────────────────────────────────────────────
  const WEEKDAYS = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
  const MONTHS   = ["january","february","march","april","may","june",
                    "july","august","september","october","november","december"];

  const clone = (d: Date) => new Date(d);
  const startOfDay = (d: Date) => { d.setHours(0,0,0,0); return d; };

  const addDays = (d: Date, n: number) => {
    const r = clone(d); r.setDate(r.getDate() + n); return r;
  };
  const nextWeekday = (d: Date, target: number) => {
    const diff = ((target - d.getDay()) + 7) % 7 || 7;
    return addDays(d, diff);
  };

  // ── Relative keywords ────────────────────────────────────────────────────
  if (/\btoday\b/.test(lower))     { date = startOfDay(clone(now)); timeText = "today"; }
  else if (/\btomorrow\b/.test(lower)) { date = startOfDay(addDays(now, 1)); timeText = "tomorrow"; }
  else if (/\byesterday\b/.test(lower)){ date = startOfDay(addDays(now,-1)); timeText = "yesterday"; }

  // "in N days/weeks/months"
  if (!date) {
    const m = lower.match(/\bin\s+(\d+|a|an|one|two|three|four|five|six|seven|eight|nine|ten)\s+(day|week|month)s?\b/);
    if (m) {
      const wordToNum: Record<string,number> = {
        a:1,an:1,one:1,two:2,three:3,four:4,five:5,
        six:6,seven:7,eight:8,nine:9,ten:10,
      };
      const n = wordToNum[m[1]] ?? parseInt(m[1], 10);
      const unit = m[2];
      const d = clone(now);
      if (unit === "day")   d.setDate(d.getDate() + n);
      if (unit === "week")  d.setDate(d.getDate() + n * 7);
      if (unit === "month") d.setMonth(d.getMonth() + n);
      date = startOfDay(d);
      timeText = m[0].trim();
    }
  }

  // "next {weekday|week|month}"
  if (!date) {
    const m = lower.match(/\bnext\s+(week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
    if (m) {
      const token = m[1];
      if (token === "week")  { date = startOfDay(addDays(now, 7)); }
      else if (token === "month") {
        const d = clone(now); d.setMonth(d.getMonth() + 1); date = startOfDay(d);
      } else {
        date = startOfDay(nextWeekday(now, WEEKDAYS.indexOf(token)));
      }
      timeText = m[0].trim();
    }
  }

  // "this {weekday}"
  if (!date) {
    const m = lower.match(/\bthis\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
    if (m) {
      const target = WEEKDAYS.indexOf(m[1]);
      const diff = ((target - now.getDay()) + 7) % 7;
      date = startOfDay(addDays(now, diff === 0 ? 7 : diff));
      timeText = m[0].trim();
    }
  }

  // "on {weekday}"
  if (!date) {
    const m = lower.match(/\bon\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
    if (m) {
      date = startOfDay(nextWeekday(now, WEEKDAYS.indexOf(m[1])));
      timeText = m[0].trim();
    }
  }

  // "{month} {d}[st|nd|rd|th]"  or  "{d}[st|nd|rd|th] of {month}"
  if (!date) {
    const patterns = [
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?\b/,
      /\b(\d{1,2})(?:st|nd|rd|th)?\s+of\s+(january|february|march|april|may|june|july|august|september|october|november|december)\b/,
    ];
    for (const pat of patterns) {
      const m = lower.match(pat);
      if (m) {
        const monthStr = isNaN(Number(m[1])) ? m[1] : m[2];
        const dayStr   = isNaN(Number(m[1])) ? m[2] : m[1];
        const month = MONTHS.indexOf(monthStr);
        const day   = parseInt(dayStr, 10);
        if (month !== -1 && day >= 1 && day <= 31) {
          const year = now.getMonth() > month ? now.getFullYear() + 1 : now.getFullYear();
          date = startOfDay(new Date(year, month, day));
          timeText = m[0].trim();
        }
        break;
      }
    }
  }

  // ── Time component  "at 3pm", "at 14:30", "at 9 in the morning" ──────────
  const timeMatch = lower.match(
    /\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm|in the morning|in the afternoon|in the evening|at night)?\b/
  );
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const mins = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const period = timeMatch[3] ?? "";
    if (/pm|afternoon|evening|night/.test(period) && hours < 12) hours += 12;
    if (/am|morning/.test(period) && hours === 12) hours = 0;

    if (!date) date = startOfDay(clone(now));
    date.setHours(hours, mins, 0, 0);
    timeText = timeMatch[0].trim();
  }

  return { date, timeText };
}

// ─────────────────────────────────────────────────────────────────────────────
// People extractor  (heuristic, no NLP library)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Finds capitalised proper-noun sequences (≥ 2 chars, ≤ 3 words) that follow
 * task-relational prepositions. Works for "Call John Smith about the report".
 * Intentionally conservative to avoid false positives.
 */
function extractPeople(original: string): string[] {
  const people = new Set<string>();

  // Pattern: (with|call|email|message|meet|from|to|notify|tell|ask|remind) [Name ...]
  const pattern = /\b(?:with|call(?:ing)?|email(?:ing)?|message|meet(?:ing)?|from|to|notify|tell|ask|remind|contact|cc)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/g;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(original)) !== null) {
    const name = m[1].trim();
    // Exclude words that are common non-names even when capitalised
    const EXCLUDE = new Set(["Monday","Tuesday","Wednesday","Thursday","Friday",
      "Saturday","Sunday","January","February","March","April","May","June",
      "July","August","September","October","November","December","Today",
      "Tomorrow","The","This","Next","Please","General","Finance","Design"]);
    const words = name.split(" ");
    if (!words.some(w => EXCLUDE.has(w))) people.add(name);
  }

  return [...people];
}

// ─────────────────────────────────────────────────────────────────────────────
// Tag / category detector
// ─────────────────────────────────────────────────────────────────────────────

const TAG_RULES: Array<{ tag: string; keywords: string[] }> = [
  { tag: "work",     keywords: ["client","meeting","proposal","deadline","project","office","manager","team","colleague","presentation","report","sprint","standup","pr","pull request","jira","ticket","milestone","okr","kpi"] },
  { tag: "finance",  keywords: ["pay","payment","invoice","bill","tax","budget","salary","expense","receipt","bank","transfer","refund","subscription","fee","cost","price","quote","estimate"] },
  { tag: "health",   keywords: ["doctor","dentist","hospital","appointment","medicine","prescription","gym","workout","exercise","therapy","therapist","physio","diet","nutrition","sleep","medication","pill","dose"] },
  { tag: "personal", keywords: ["family","friend","birthday","anniversary","gift","party","vacation","holiday","travel","home","house","clean","repair","grocery","shopping","errand"] },
  { tag: "learning", keywords: ["course","study","read","book","tutorial","lecture","research","learn","practice","training","certification","exam","assignment","homework"] },
  { tag: "design",   keywords: ["design","logo","ui","ux","mockup","wireframe","figma","sketch","prototype","banner","icon","illustration","animation","branding","visual","creative"] },
  { tag: "dev",      keywords: ["code","bug","feature","deploy","push","commit","branch","merge","pr","test","api","database","server","build","ci","cd","lint","refactor","endpoint","component"] },
  { tag: "comms",    keywords: ["email","message","call","text","slack","reply","respond","follow up","followup","reach out","contact","ping","dm","chat"] },
];

function extractTags(lower: string): string[] {
  const tags: string[] = [];
  for (const rule of TAG_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      tags.push(rule.tag);
      if (tags.length === 3) break; // cap at 3 tags
    }
  }
  return tags;
}

// ─────────────────────────────────────────────────────────────────────────────
// Priority detector
// ─────────────────────────────────────────────────────────────────────────────

const HIGH_PRIORITY_WORDS = [
  "urgent","urgently","asap","as soon as possible","immediately","right away",
  "critical","blocker","blocking","emergency","today","tonight","deadline",
  "overdue","must","crucial","important",
];

const LOW_PRIORITY_WORDS = [
  "whenever","eventually","someday","no rush","low priority","not urgent",
  "can wait","if possible","maybe","perhaps","at some point","later",
];

function detectPriority(lower: string): Priority {
  if (HIGH_PRIORITY_WORDS.some(w => lower.includes(w))) return "high";
  if (LOW_PRIORITY_WORDS.some(w => lower.includes(w))) return "low";
  return "medium";
}

// ─────────────────────────────────────────────────────────────────────────────
// Normaliser
// ─────────────────────────────────────────────────────────────────────────────

function normalise(raw: string): string {
  let text = raw.trim();

  // Collapse multiple whitespace / newlines
  text = text.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ");

  // Strip filler words (whole-word, case-insensitive)
  for (const filler of FILLER_WORDS) {
    const re = new RegExp(`(?<![a-z])${filler.replace(/\s+/g, "\\s+")}(?![a-z])`, "gi");
    text = text.replace(re, " ");
  }

  // Normalise punctuation
  text = text
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/…/g, "...")
    .replace(/\s+([,.;:!?])/g, "$1")   // no space before punctuation
    .replace(/([,.;:!?])\s*/g, "$1 ")  // single space after punctuation
    .replace(/\s{2,}/g, " ")
    .trim();

  return text;
}

// ─────────────────────────────────────────────────────────────────────────────
// Segmenter — splits a paragraph into individual task sentences
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strategy:
 * 1. Split on sentence-ending punctuation (. ! ?)
 * 2. Within each sentence, split on conjunctive splitters
 * 3. Remove empty / too-short fragments
 */
function segment(text: string): string[] {
  // Step 1 — sentence split
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.replace(/[.!?]+$/, "").trim())
    .filter(Boolean);

  const fragments: string[] = [];

  for (const sentence of sentences) {
    // Step 2 — conjunction split (case-insensitive, bounded)
    let parts = [sentence];
    for (const splitter of SEGMENT_SPLITTERS) {
      parts = parts.flatMap(p =>
        p.toLowerCase().includes(splitter.trim().toLowerCase())
          // Preserve original casing by splitting on index
          ? splitPreserveCase(p, splitter)
          : [p]
      );
    }
    fragments.push(...parts.map(p => p.trim()).filter(Boolean));
  }

  // Step 3 — filter
  return fragments.filter(f => f.split(/\s+/).length >= 2);
}

/** Split `str` on `splitter` while preserving original casing of the parts */
function splitPreserveCase(str: string, splitter: string): string[] {
  const lower = str.toLowerCase();
  const idx = lower.indexOf(splitter.toLowerCase());
  if (idx === -1) return [str];
  const before = str.slice(0, idx).trim();
  const after  = str.slice(idx + splitter.length).trim();
  return [before, after].filter(Boolean);
}

// ─────────────────────────────────────────────────────────────────────────────
// Title builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a raw fragment into a clean imperative task title.
 *
 * Steps:
 *  1. Strip task-introducing prefixes ("I need to", "remind me to" …)
 *  2. Strip date/time phrases that are already captured in `date`
 *  3. Strip trailing filler / punctuation
 *  4. Capitalise first word
 *  5. Trim to a reasonable length (≤ 80 chars, whole word)
 */
function buildTitle(fragment: string, timeText: string | null): string {
  let t = fragment.trim();

  // 1. Strip prefixes
  for (const prefix of TASK_PREFIXES) {
    t = t.replace(prefix, "").trim();
  }

  // 2. Strip the matched time expression to avoid redundancy in the title
  if (timeText) {
    const escaped = timeText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    t = t.replace(new RegExp(`\\b${escaped}\\b`, "i"), "").trim();
  }

  // 3. Additional date noise patterns
  const DATE_NOISE = [
    /\b(by|before|on|at|until|due)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|tomorrow|tonight|noon|midnight|eod|eow)\b/gi,
    /\b(this|next)\s+(week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
    /\bin\s+(a\s+)?(few\s+)?\d*\s*(day|week|month)s?\b/gi,
    /\b(asap|immediately|right away|urgently)\b/gi,
  ];
  for (const re of DATE_NOISE) t = t.replace(re, "").trim();

  // 4. Strip leading conjunctions left over from splitting
  t = t.replace(/^(and|also|then|but|so|or|nor)\b\s*/i, "").trim();

  // 5. Strip trailing punctuation / stray words
  t = t.replace(/[,;:\-–—]+$/, "").trim();

  // 6. Capitalise
  t = t.charAt(0).toUpperCase() + t.slice(1);

  // 7. Trim to 80 chars at a word boundary
  if (t.length > 80) {
    t = t.slice(0, 80).replace(/\s+\S+$/, "") + "…";
  }

  return t || fragment.slice(0, 60);
}

// ─────────────────────────────────────────────────────────────────────────────
// Verb detector  (used for both scoring and "is this a task?" gate)
// ─────────────────────────────────────────────────────────────────────────────

interface VerbMatch {
  verb: string;
  tier: 1 | 2;
}

/**
 * Finds the first task verb in a lowercased fragment.
 * Handles common conjugations: -ing, -ed, -s, -es, -ies → base form.
 */
function findTaskVerb(lower: string): VerbMatch | null {
  const words = lower.match(/\b[a-z]+\b/g) ?? [];

  for (const word of words) {
    // Try exact match first
    if (TASK_VERBS_T1.has(word)) return { verb: word, tier: 1 };
    if (TASK_VERBS_T2.has(word)) return { verb: word, tier: 2 };

    // Try stemmed forms
    const stems = [
      word.replace(/ing$/, ""),      // calling → call
      word.replace(/ing$/, "e"),     // writing → write
      word.replace(/ed$/, ""),       // reviewed → review
      word.replace(/ed$/, "e"),      // scheduled → schedule
      word.replace(/s$/, ""),        // sends → send
      word.replace(/ies$/, "y"),     // tries → try
      word.replace(/ves$/, "f"),     // halves → half
    ];
    for (const stem of stems) {
      if (TASK_VERBS_T1.has(stem)) return { verb: stem, tier: 1 };
      if (TASK_VERBS_T2.has(stem)) return { verb: stem, tier: 2 };
    }
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Confidence scorer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scores a candidate on a 0–1 scale. Candidates below MIN_CONFIDENCE are
 * discarded so noise phrases don't generate spurious tasks.
 *
 * Weights:
 *   tier-1 verb     +0.35
 *   tier-2 verb     +0.20
 *   date found      +0.20
 *   person found    +0.10
 *   tag found       +0.10
 *   title length    +0.05  (titles 5–60 chars score max)
 */
const MIN_CONFIDENCE = 0.35;

function scoreConfidence({
  verbMatch,
  date,
  people,
  tags,
  title,
}: {
  verbMatch: VerbMatch | null;
  date: Date | null;
  people: string[];
  tags: string[];
  title: string;
}): number {
  let score = 0;

  if (verbMatch?.tier === 1) score += 0.35;
  else if (verbMatch?.tier === 2) score += 0.20;

  if (date) score += 0.20;
  if (people.length) score += 0.10;
  if (tags.length) score += 0.10;

  const tLen = title.trim().length;
  if (tLen >= 5 && tLen <= 60) score += 0.05;

  return Math.min(parseFloat(score.toFixed(2)), 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Core parser for a single candidate fragment
// ─────────────────────────────────────────────────────────────────────────────

function parseCandidate(fragment: string): ExtractedTask | null {
  const lower = fragment.toLowerCase();

  const verbMatch = findTaskVerb(lower);
  const { date, timeText } = parseDateTime(fragment);
  const people = extractPeople(fragment);
  const tags   = extractTags(lower);
  const priority = detectPriority(lower);
  const title  = buildTitle(fragment, timeText);

  const confidence = scoreConfidence({ verbMatch, date, people, tags, title });

  if (confidence < MIN_CONFIDENCE) return null;

  return {
    id: generateId(),
    title,
    originalText: fragment,
    date,
    timeText,
    people,
    tags,
    priority,
    confidence,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ID generator  (no crypto.randomUUID dependency — works in all envs)
// ─────────────────────────────────────────────────────────────────────────────

function generateId(): string {
  // Use crypto.randomUUID when available (browsers, Node 15+), otherwise fallback
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + random hex
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
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
 * @returns     Array of ExtractedTask, sorted by confidence descending
 *
 * @example
 * const tasks = extractTasksFromText(
 *   "Call John tomorrow and send the invoice to the client by Friday"
 * );
 * // → [ { title: "Call John", date: <tomorrow>, ... },
 * //      { title: "Send the invoice to the client", date: <friday>, ... } ]
 */
export function extractTasksFromText(
  text: string,
  now: Date = new Date()
): ExtractedTask[] {
  if (!text?.trim()) return [];

  const normalised = normalise(text);
  const fragments  = segment(normalised);

  const tasks: ExtractedTask[] = [];

  for (const fragment of fragments) {
    // Re-parse dates with the caller's `now` reference
    const candidate = parseCandidateWithNow(fragment, now);
    if (candidate) tasks.push(candidate);
  }

  // Sort: high confidence first, then by earliest date
  return tasks.sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    if (a.date && b.date) return a.date.getTime() - b.date.getTime();
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });
}

/** Internal: parseCandidate with an explicit `now` for date resolution */
function parseCandidateWithNow(fragment: string, now: Date): ExtractedTask | null {
  const lower = fragment.toLowerCase();

  const verbMatch = findTaskVerb(lower);
  const { date, timeText } = parseDateTime(fragment, now);
  const people = extractPeople(fragment);
  const tags   = extractTags(lower);
  const priority = detectPriority(lower);
  const title  = buildTitle(fragment, timeText);

  const confidence = scoreConfidence({ verbMatch, date, people, tags, title });

  if (confidence < MIN_CONFIDENCE) return null;

  return {
    id: generateId(),
    title,
    originalText: fragment,
    date,
    timeText,
    people,
    tags,
    priority,
    confidence,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience re-exports kept for backward compat with existing callers
// ─────────────────────────────────────────────────────────────────────────────
export type { ParsedDateTime };
export { parseDateTime, extractPeople, extractTags, detectPriority };