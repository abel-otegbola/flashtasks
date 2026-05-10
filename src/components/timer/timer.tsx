import { useEffect, useRef, useState } from 'react';
import { Play, Pause, X } from '@phosphor-icons/react';

interface TimerProps {
  onClose?: () => void;
}

export default function Timer({ onClose }: TimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(25 * 60); // 25 min default (pomodoro)
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update display when remainingSeconds changes
  useEffect(() => {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    setMinutes(mins);
    setSeconds(secs);
  }, [remainingSeconds]);

  // Timer interval
  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // Optional: play a sound or notification here
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, remainingSeconds]);

  const handleSetTime = (newMinutes: number, newSeconds: number) => {
    const totalSecs = newMinutes * 60 + newSeconds;
    setTotalSeconds(totalSecs);
    setRemainingSeconds(totalSecs);
    setMinutes(newMinutes);
    setSeconds(newSeconds);
    setIsRunning(false);
  };

  const handlePlayPause = () => {
    if (remainingSeconds > 0) {
      setIsRunning(!isRunning);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
  };

  // Calculate progress (0 to 1)
  const progress = (totalSeconds - remainingSeconds) / totalSeconds;
  const circumference = 2 * Math.PI * 90; // radius 90
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center justify-center gap-8">

      {/* Analog Timer with Progress Ring */}
      <div className="relative w-64 h-64">
        <svg
          width="260"
          height="260"
          viewBox="0 0 260 260"
          className="absolute -top-6 -left-6"
        >
          {/* Background circle */}
          <circle
            cx="130"
            cy="130"
            r="90"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-300 dark:text-gray-700"
          />

          {/* Progress circle */}
          <circle
            cx="130"
            cy="130"
            r="90"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-primary transition-all duration-300"
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '130px 130px',
            }}
          />

          {/* Center circle */}
          <circle
            cx="130"
            cy="130"
            r="60"
            fill="currentColor"
            className="text-white dark:text-dark"
          />
        </svg>

        {/* Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-dark dark:text-white">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Time Input Controls */}
      <div className="flex gap-4 items-end justify-center w-full">
        <div className="flex flex-col items-center gap-2">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Minutes
          </label>
          <input
            type="number"
            min="0"
            max="99"
            value={minutes}
            onChange={(e) => {
              const newMins = Math.max(0, Math.min(99, parseInt(e.target.value) || 0));
              handleSetTime(newMins, seconds);
            }}
            disabled={isRunning}
            className="w-16 px-2 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark text-dark dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <span className="text-2xl font-bold mb-2">:</span>

        <div className="flex flex-col items-center gap-2">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Seconds
          </label>
          <input
            type="number"
            min="0"
            max="59"
            value={seconds}
            onChange={(e) => {
              const newSecs = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
              handleSetTime(minutes, newSecs);
            }}
            disabled={isRunning}
            className="w-16 px-2 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark text-dark dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 items-center justify-center">
        <button
          onClick={handlePlayPause}
          disabled={remainingSeconds === 0}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? (
            <>
              <Pause size={18} />
              Pause
            </>
          ) : (
            <>
              <Play size={18} />
              Start
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          className="px-6 py-2 bg-gray-200 dark:bg-dark-bg text-dark dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Status Text */}
      {remainingSeconds === 0 && (
        <div className="text-center">
          <p className="text-lg font-semibold text-primary">Time's up! 🎉</p>
        </div>
      )}
    </div>
  );
}
