import { useCallback, useEffect, useRef, useState } from "react";

type Status =
  | "idle"
  | "recording"
  | "processing"
  | "stopped"
  | "error";

interface UseRealtimeTranscriptionProps {
  apiKey: string;

  // Live browser interim text
  onInterimTranscript?: (text: string) => void;

  // Final accurate Groq transcript
  onFinalTranscript?: (text: string) => void;
}

export function useRealtimeTranscription({
  apiKey,
  onInterimTranscript,
  onFinalTranscript,
}: UseRealtimeTranscriptionProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    !!navigator.mediaDevices &&
    !!window.MediaRecorder;

  const isSpeechRecognitionSupported =
    typeof window !== "undefined" &&
    ("webkitSpeechRecognition" in window ||
      "SpeechRecognition" in window);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const transcribeWithGroq = useCallback(
    async (audioBlob: Blob) => {
      try {
        setStatus("processing");

        const file = new File([audioBlob], "recording.webm", {
          type: audioBlob.type || "audio/webm",
        });

        const formData = new FormData();

        formData.append("file", file);
        formData.append("model", "whisper-large-v3");
        formData.append("response_format", "json");

        const response = await fetch(
          "https://api.groq.com/openai/v1/audio/transcriptions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();

          console.error("Groq Error:", errorText);

          throw new Error(errorText);
        }

        const data = await response.json();

        const text = data.text?.trim();

        if (text) {
          onFinalTranscript?.(text);
        }

        setStatus("stopped");
      } catch (err: any) {
        console.error(err);

        setError(err.message || "Groq transcription failed");

        setStatus("error");
      }
    },
    [apiKey, onFinalTranscript]
  );

  const startRecording = useCallback(async () => {
    try {
      if (!isSupported) {
        throw new Error("MediaRecorder not supported");
      }

      setError(null);
      setRecordingTime(0);

      audioChunksRef.current = [];

      // AUDIO RECORDING
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const recorder = new MediaRecorder(stream, {
        mimeType,
      });

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setError("Audio recording failed");

        setStatus("error");
      };

      recorder.onstart = () => {
        setStatus("recording");

        startTimer();
      };

      recorder.start();

      // LIVE INTERIM TRANSCRIPTION
      if (isSpeechRecognitionSupported) {
        const SpeechRecognition =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition;

        const recognition = new SpeechRecognition();

        recognitionRef.current = recognition;

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let finalizedText = "";
          let interimText = "";

          // Rebuild the live transcript each event so newer chunks append
          // without replacing earlier recognized words.
          for (let i = 0; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
              finalizedText += `${transcript} `;
            } else {
              interimText += `${transcript} `;
            }
          }

          onInterimTranscript?.(`${finalizedText}${interimText}`.trim());
        };

        recognition.onerror = (event: any) => {
          console.warn(
            "SpeechRecognition warning:",
            event.error
          );
        };

        recognition.start();
      }
    } catch (err: any) {
      console.error(err);

      setError(err.message || "Failed to start recording");

      setStatus("error");
    }
  }, [
    isSupported,
    isSpeechRecognitionSupported,
    onInterimTranscript,
  ]);

  const stopRecording = useCallback(async () => {
    try {
      recognitionRef.current?.stop();

      mediaRecorderRef.current?.stop();

      stopTimer();

      const recorder = mediaRecorderRef.current;

      if (!recorder) return;

      recorder.onstop = async () => {
        const mimeType =
          recorder.mimeType || "audio/webm";

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType,
        });

        streamRef.current?.getTracks().forEach((track) => {
          track.stop();
        });

        await transcribeWithGroq(audioBlob);
      };
    } catch (err: any) {
      console.error(err);

      setError(err.message || "Failed to stop recording");

      setStatus("error");
    }
  }, [transcribeWithGroq]);

  useEffect(() => {
    return () => {
      stopTimer();

      recognitionRef.current?.stop();

      mediaRecorderRef.current?.stop();

      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, []);

  return {
    status,
    recordingTime,
    isSupported,
    isSpeechRecognitionSupported,
    startRecording,
    stopRecording,
    error,
  };
}