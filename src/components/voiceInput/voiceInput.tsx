import { Microphone2, Pause } from "@solar-icons/react";
import { useState, useRef, useEffect } from "react";
import { AudioTranscriber } from "../../helpers/audioTranscriber";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  maxRecordingTime?: number; // in seconds
  onRecordingTimeUpdate?: (time: number) => void;
}

function VoiceInput({ onTranscript, disabled = false, maxRecordingTime = 600, onRecordingTimeUpdate }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const audioTranscriberRef = useRef<AudioTranscriber | null>(null);
  const activeSessionRef = useRef(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  const startRecording = async () => {
    try {
      const sessionId = activeSessionRef.current + 1;
      activeSessionRef.current = sessionId;

      audioTranscriberRef.current?.stop();
      audioTranscriberRef.current = new AudioTranscriber({
        onChunk: (chunk) => {
          const text = chunk.text.trim();

          if (!text || sessionId !== activeSessionRef.current) {
            return;
          }

          if (chunk.isFinal) {
            onTranscript(text);
          }
        },
        onError: (message) => {
          console.error('Error processing audio transcription:', message);
          alert(message);
          stopRecording();
        },
      });

      await audioTranscriberRef.current.start();

      setIsRecording(true);

      // Start timer
      recordingStartTimeRef.current = Date.now();
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
        setRecordingTime(elapsed);
        if (onRecordingTimeUpdate) onRecordingTimeUpdate(elapsed);
        
        // Auto-stop when max time reached
        if (elapsed >= maxRecordingTime) {
          stopRecording();
        }
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert(error instanceof Error ? error.message : 'Unable to access microphone. Please ensure you have granted permission.');
    }
  };

  const stopRecording = () => {
    if (audioTranscriberRef.current && isRecording) {
      activeSessionRef.current += 1;
      audioTranscriberRef.current.stop();
      audioTranscriberRef.current.reset();
      setIsRecording(false);
      setRecordingTime(0);
      if (onRecordingTimeUpdate) onRecordingTimeUpdate(0);
      
      // Clear timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const handleClick = () => {
    if (disabled) return;
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioTranscriberRef.current?.stop();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`p-3 rounded-full transition-all duration-300 ${
        isRecording
          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
          : 'bg-primary hover:bg-primary/90 text-white'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {isRecording ? (
        <Pause size={24} />
      ) : (
        <Microphone2 size={24} />
      )}
    </button>
  );
}

export default VoiceInput;
