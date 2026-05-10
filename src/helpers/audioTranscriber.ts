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
            onChunkTranscribed?.(transcript.trim(), true);
          }
        } else {
          interimText += transcript;
        }
      }

      if (interimText.trim()) {
        onChunkTranscribed?.(interimText.trim(), false);
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
        }, 300);
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
        // Local dedup set — isolated from the live recording ref
        const seen = new Set<string>();

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
            } else {
              latestInterimText = transcript;
            }
          }

          if (latestInterimText.trim()) {
            onChunkTranscribed?.(latestInterimText.trim(), false);
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