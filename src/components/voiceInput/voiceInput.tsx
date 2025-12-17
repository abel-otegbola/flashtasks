import { Microphone2, Pause } from "@solar-icons/react";
import { useState, useRef, useEffect } from "react";
import { transcribeAudio } from "../../services/gemini";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  maxRecordingTime?: number; // in seconds
  onRecordingTimeUpdate?: (time: number) => void;
}

function VoiceInput({ onTranscript, disabled = false, maxRecordingTime = 600, onRecordingTimeUpdate }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudioWithGemini(audioBlob);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
        
        // Clear timer
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      };

      mediaRecorder.start();
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
      alert('Unable to access microphone. Please ensure you have granted permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const processAudioWithGemini = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const text = await transcribeAudio(audioBlob);
      onTranscript(text);
    } catch (error) {
      console.error('Error processing audio with Gemini:', error);
      alert(error instanceof Error ? error.message : 'Failed to transcribe audio. Please try again.');
    } finally {
      setIsProcessing(false);
      setRecordingTime(0);
      if (onRecordingTimeUpdate) onRecordingTimeUpdate(0);
    }
  };

  const handleClick = () => {
    if (disabled || isProcessing) return;
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className={`p-3 rounded-full transition-all duration-300 ${
        isRecording
          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
          : isProcessing
          ? 'bg-gray-400 text-white cursor-not-allowed'
          : 'bg-primary hover:bg-primary/90 text-white'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isRecording ? 'Stop recording' : isProcessing ? 'Processing...' : 'Start recording'}
    >
      {isProcessing ? (
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : isRecording ? (
        <Pause size={24} />
      ) : (
        <Microphone2 size={24} />
      )}
    </button>
  );
}

export default VoiceInput;
