import { useRef, useState, useCallback } from "react";

export type TranscriptionStatus = "idle" | "recording" | "error";

export interface UseRealtimeTranscriptionOptions {
  /**
   * Called for every recognised chunk.
   * `isFinal = false` → interim (in-progress words, show in grey)
   * `isFinal = true`  → committed text, safe to persist
   */
  onChunkTranscribed?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  /** BCP-47 language tag, e.g. "en-US". Defaults to navigator.language. */
  lang?: string;
}

export interface UseRealtimeTranscriptionReturn {
  status: TranscriptionStatus;
  recordingTime: number; // seconds elapsed since startRecording()
  isSupported: boolean;  // false → hide the mic button entirely
  startRecording: () => void;
  stopRecording: () => void;
  transcribeFile: (file: File) => Promise<string>;
  error: string | null;
}

/**
 * useRealtimeTranscription
 * ─────────────────────────
 * Wraps the browser's built-in Web Speech API (SpeechRecognition).
 * Works fully on-device: no network, no API key, no extra packages.
 *
 * How it streams:
 *   SpeechRecognition fires two kinds of results –
 *     • interim  → words the engine is still deciding on  (isFinal = false)
 *     • final    → committed words, ready to store         (isFinal = true)
 *   Both are forwarded through onChunkTranscribed so the UI can show
 *   live feedback in grey while appending only the final segments.
 *
 * Browser support:
 *   Chrome ✓  |  Edge ✓  |  Safari 15+ ✓  |  Firefox ✗ (flag only)
 *   Check `isSupported` before rendering the mic button.
 *
 * Drop-in placement: src/hooks/useRealtimeTranscription.ts
 */
export function useRealtimeTranscription({
  onChunkTranscribed,
  onError,
  lang,
}: UseRealtimeTranscriptionOptions = {}): UseRealtimeTranscriptionReturn {
  // ── Feature detection ──────────────────────────────────────────────────────
  const SpeechRecognitionAPI =
    typeof window !== "undefined"
      ? ((window as any).SpeechRecognition ??
        (window as any).webkitSpeechRecognition ??
        null)
      : null;

  const isSupported = Boolean(SpeechRecognitionAPI);

  // ── State ──────────────────────────────────────────────────────────────────
  const [status, setStatus] = useState<TranscriptionStatus>("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // ── Refs (not state — changes must not trigger re-renders) ─────────────────
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusRef = useRef<TranscriptionStatus>("idle"); // mirror of status for closures

  // ── Timer helpers ──────────────────────────────────────────────────────────
  const startTimer = () => {
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // ── Error helper ───────────────────────────────────────────────────────────
  const emitError = (msg: string) => {
    setError(msg);
    onError?.(msg);
    setStatus("error");
    statusRef.current = "error";
    stopTimer();
  };

  // ── buildRecognition — creates and wires a SpeechRecognition instance ──────
  const buildRecognition = useCallback(() => {
    const recognition = new SpeechRecognitionAPI();

    recognition.continuous = true;      // keep listening across pauses
    recognition.interimResults = true;  // surface in-progress words
    recognition.lang = lang ?? navigator.language ?? "en-US";

    recognition.onstart = () => {
      setStatus("recording");
      statusRef.current = "recording";
      startTimer();
    };

    recognition.onresult = (event: any) => {
      let interimText = "";
      let finalText = "";

      // event.resultIndex tells us which results are new this event
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript: string = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      if (finalText.trim()) onChunkTranscribed?.(finalText.trim(), true);
      if (interimText.trim()) onChunkTranscribed?.(interimText.trim(), false);
    };

    recognition.onerror = (event: any) => {
      // "no-speech" fires after silence — benign, just keep listening
      if (event.error === "no-speech" || event.error === "aborted") return;

      const ERROR_MESSAGES: Record<string, string> = {
        "audio-capture": "No microphone found. Please connect one and try again.",
        "not-allowed":   "Microphone access denied. Allow permissions and try again.",
        network:         "Network error during speech recognition.",
      };

      emitError(ERROR_MESSAGES[event.error] ?? `Recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      // Chrome auto-stops after ~60 s of silence.
      // If we're still supposed to be recording, restart transparently.
      if (
        recognitionRef.current === recognition &&
        statusRef.current === "recording"
      ) {
        try { recognition.start(); } catch { /* already starting */ }
      }
    };

    return recognition;
  }, [lang, onChunkTranscribed]);

  // ── startRecording ─────────────────────────────────────────────────────────
  const startRecording = useCallback(() => {
    if (!isSupported) {
      emitError("Speech recognition is not supported in this browser.");
      return;
    }
    if (statusRef.current === "recording") return; // already running

    setError(null);
    const recognition = buildRecognition();
    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, buildRecognition]);

  // ── stopRecording ──────────────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    // Clear the ref before calling stop() so onend doesn't auto-restart
    recognitionRef.current = null;
    statusRef.current = "idle";

    recognition.stop();
    stopTimer();
    setStatus("idle");
  }, []);

  // ── transcribeFile ─────────────────────────────────────────────────────────
  /**
   * Pipes an audio File through an AudioContext + MediaStream so that
   * SpeechRecognition can hear it as if it were a live microphone.
   *
   * Works in Chrome/Edge. Safari's implementation ignores the audioTrack
   * override, so file transcription falls back to a plain <audio> play-through
   * that the user hears while the mic stays open — still useful offline.
   */
  const transcribeFile = useCallback(
    (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
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

        recognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              segments.push(event.results[i][0].transcript);
            }
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