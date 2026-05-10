import { useRef, useState, useCallback } from "react";

export type TranscriptionStatus = "idle" | "recording" | "error";

export interface UseRealtimeTranscriptionOptions {
  onChunkTranscribed?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  lang?: string;
}

export interface UseRealtimeTranscriptionReturn {
  status: TranscriptionStatus;
  recordingTime: number;
  isSupported: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  transcribeFile: (file: File) => Promise<string>;
  error: string | null;
}

export function useRealtimeTranscription({
  onChunkTranscribed,
  onError,
  lang,
}: UseRealtimeTranscriptionOptions = {}): UseRealtimeTranscriptionReturn {
  const SpeechRecognitionAPI =
    typeof window !== "undefined"
      ? ((window as any).SpeechRecognition ??
        (window as any).webkitSpeechRecognition ??
        null)
      : null;

  const isSupported = Boolean(SpeechRecognitionAPI);

  const [status, setStatus] = useState<TranscriptionStatus>("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusRef = useRef<TranscriptionStatus>("idle");
  const seenFinalTextsRef = useRef<Set<string>>(new Set());
  const isRestartingRef = useRef(false);
  const lastInterimRef = useRef<string>("");

  const startTimer = () => {
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
  };

// Normalize & dedupe transcript text while preserving order.
function dedupeTranscript(text: string): string {
  if (!text) return text;

  // Split into candidate fragments by sentence punctuation or newlines
  const fragments = text
    .split(/(?:\n|(?<=[.!?])\s+)/)
    .map(s => s.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const out: string[] = [];

  for (const frag of fragments) {
    // Normalize: collapse whitespace, lowercase, strip leading/trailing punctuation
    const norm = frag
      .replace(/[\u2018\u2019\u201C\u201D]/g, '"')
      .replace(/[\p{P}\p{S}]+/gu, '') // remove punctuation/symbols for comparison
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    if (!norm) continue;
    if (seen.has(norm)) continue;
    seen.add(norm);
    out.push(frag);
  }

  // Join using a single space for short fragments or newline when fragments are longer
  if (out.length === 0) return '';
  if (out.length === 1) return out[0];
  return out.join(' ');
}

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const emitError = (msg: string) => {
    setError(msg);
    onError?.(msg);
    setStatus("error");
    statusRef.current = "error";
    stopTimer();
  };

  const buildRecognition = useCallback(() => {
    const recognition = new SpeechRecognitionAPI();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang ?? navigator.language ?? "en-US";

    recognition.onstart = () => {
      setStatus("recording");
      statusRef.current = "recording";
      if (!isRestartingRef.current) {
        startTimer();
      }
      isRestartingRef.current = false;
    };

    // Helper: return trailing new words from `current` that are not already
    // present at the end of `prev`. Comparison is word-based and case-insensitive.
    const getTrailingNewText = (prev: string, current: string) => {
      if (!current) return "";
      if (!prev) return current;
      const prevWords = prev.trim().split(/\s+/).filter(Boolean);
      const curWords = current.trim().split(/\s+/).filter(Boolean);
      if (curWords.length === 0) return "";

      let overlap = 0;
      const maxCheck = Math.min(prevWords.length, curWords.length);
      for (let k = maxCheck; k >= 1; k--) {
        const prevSlice = prevWords.slice(prevWords.length - k).join(' ').toLowerCase();
        const curSlice = curWords.slice(0, k).join(' ').toLowerCase();
        if (prevSlice === curSlice) {
          overlap = k;
          break;
        }
      }

      const trailing = curWords.slice(overlap).join(' ');
      return trailing;
    };

    recognition.onresult = (event: any) => {
      let interimText = "";

      // Iterate from 0 every time — mobile browsers reset resultIndex to 0
      // so lastCommittedIndexRef is unreliable. seenFinalTextsRef handles dedup.
      for (let i = 0; i < event.results.length; i++) {
        const transcript: string = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          const key = transcript.trim().toLowerCase().replace(/\s+/g, " ");

          if (!seenFinalTextsRef.current.has(key)) {
            seenFinalTextsRef.current.add(key);
            // On final results, clear interim tracker to avoid overlap with next interim
            lastInterimRef.current = "";
            onChunkTranscribed?.(transcript.trim(), true);
          }
        } else {
          interimText += transcript;
        }
      }

      if (interimText.trim()) {
        const trailing = getTrailingNewText(lastInterimRef.current, interimText.trim());
        if (trailing.trim()) {
          onChunkTranscribed?.(trailing.trim(), false);
        }
        lastInterimRef.current = interimText.trim();
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech" || event.error === "aborted") return;

      const ERROR_MESSAGES: Record<string, string> = {
        "audio-capture": "No microphone found. Please connect one and try again.",
        "not-allowed": "Microphone access denied. Allow permissions and try again.",
        network: "Network error during speech recognition.",
      };

      emitError(ERROR_MESSAGES[event.error] ?? `Recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      if (
        recognitionRef.current === recognition &&
        statusRef.current === "recording" &&
        !isRestartingRef.current
      ) {
        isRestartingRef.current = true;

        // Slightly longer restart delay to avoid rapid restarts on flaky mobile
        const RESTART_DELAY_MS = 700;
        setTimeout(() => {
          if (
            recognitionRef.current === recognition &&
            statusRef.current === "recording"
          ) {
            try {
              recognition.start();
            } catch {
              isRestartingRef.current = false;
            }
          } else {
            isRestartingRef.current = false;
          }
        }, RESTART_DELAY_MS);
      }
    };

    return recognition;
  }, [lang, onChunkTranscribed]);

  const startRecording = useCallback(() => {
    if (!isSupported) {
      emitError("Speech recognition is not supported in this browser.");
      return;
    }
    if (statusRef.current === "recording") return;

    setError(null);
    seenFinalTextsRef.current = new Set();
    isRestartingRef.current = false;

    const recognition = buildRecognition();
    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, buildRecognition]);

  const stopRecording = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognitionRef.current = null;
    statusRef.current = "idle";
    isRestartingRef.current = false;
    seenFinalTextsRef.current = new Set();

    recognition.stop();
    stopTimer();
    setStatus("idle");
  }, []);

  const transcribeFile = useCallback(
    (file: File): Promise<string> =>
      new Promise(async (resolve, reject) => {
        // Try Groq transcription endpoint first (if API key provided)
        const GROQ_API_BASE = "https://api.groq.com/openai/v1";
        const GROQ_TRANSCRIBE_URL = `${GROQ_API_BASE}/audio/transcriptions`;
        const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY ?? "";
        const GROQ_MODEL = import.meta.env.VITE_GROQ_STT_MODEL ?? "whisper-1";

        if (GROQ_API_KEY) {
          try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("model", GROQ_MODEL);

            const res = await fetch(GROQ_TRANSCRIBE_URL, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`,
              },
              body: fd,
            });

            if (!res.ok) {
              const txt = await res.text().catch(() => "");
              throw new Error(`Groq transcription error ${res.status}: ${txt}`);
            }

            const body = await res.json().catch(() => ({}));

            // Groq / OpenAI-style responses vary; attempt to extract transcript
            let transcript = "";
            if (typeof body.text === "string") transcript = body.text;
            else if (typeof body.transcript === "string") transcript = body.transcript;
            else if (Array.isArray(body.choices) && body.choices[0]?.message?.content) transcript = body.choices[0].message.content;
            else if (body?.result?.[0]?.content?.text) transcript = body.result[0].content.text;

            transcript = (transcript || "").trim();

            // Deduplicate repeated fragments that some STT backends emit
            if (transcript) {
              const deduped = dedupeTranscript(transcript);
              resolve(deduped);
              return;
            }
            // if empty, fall through to local fallback
          } catch (err) {
            // Non-fatal - fall back to browser SpeechRecognition approach below
            // eslint-disable-next-line no-console
            console.warn("Groq transcription failed, falling back to browser recognition:", err);
          }
        }

        // Fallback: local/browser SpeechRecognition-based transcription (original behavior)
        if (!isSupported) {
          reject(new Error("Speech recognition not supported in this browser."));
          return;
        }

        const url = URL.createObjectURL(file);
        const audio = new Audio(url);

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = lang ?? navigator.language ?? "en-US";

        const segments: string[] = [];
        // Local dedup set — isolated from the live recording ref
        const seen = new Set<string>();
        let lastInterimLocal = "";

        recognition.onresult = (event: any) => {
          let latestInterimText = "";

          for (let i = 0; i < event.results.length; i++) {
            const transcript: string = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
              const key = transcript.trim().toLowerCase().replace(/\s+/g, " ");
              // Use local `seen`, not the shared seenFinalTextsRef
              if (!seen.has(key)) {
                seen.add(key);
                segments.push(transcript.trim());
              }
              // clear local interim tracker when we commit a final
              lastInterimLocal = "";
            } else {
              latestInterimText = transcript;
            }
          }

          if (latestInterimText.trim()) {
            const trailing = (function(prev: string, current: string) {
              if (!current) return "";
              if (!prev) return current;
              const prevWords = prev.trim().split(/\s+/).filter(Boolean);
              const curWords = current.trim().split(/\s+/).filter(Boolean);
              if (curWords.length === 0) return "";
              let overlap = 0;
              const maxCheck = Math.min(prevWords.length, curWords.length);
              for (let k = maxCheck; k >= 1; k--) {
                const prevSlice = prevWords.slice(prevWords.length - k).join(' ').toLowerCase();
                const curSlice = curWords.slice(0, k).join(' ').toLowerCase();
                if (prevSlice === curSlice) { overlap = k; break; }
              }
              return curWords.slice(overlap).join(' ');
            })(lastInterimLocal, latestInterimText.trim());

            if (trailing.trim()) onChunkTranscribed?.(trailing.trim(), false);
            lastInterimLocal = latestInterimText.trim();
          }
        };

        recognition.onerror = (event: any) => {
          URL.revokeObjectURL(url);
          reject(new Error(`File transcription error: ${event.error}`));
        };

        recognition.onend = () => {
          URL.revokeObjectURL(url);
          resolve(segments.join(" ").trim());
        };

        audio.onended = () => recognition.stop();
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Failed to load audio file."));
        };

        recognition.start();
        audio.play().catch(reject);
      }),
    [isSupported, lang]
  );

  return {
    status,
    recordingTime,
    isSupported,
    startRecording,
    stopRecording,
    transcribeFile,
    error,
  };
}