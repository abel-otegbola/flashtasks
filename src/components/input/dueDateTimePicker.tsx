'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Calendar from 'react-calendar';
import { Calendar as CalendarIcon, XIcon } from '@phosphor-icons/react';
import Input from './input';

type DueDateTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
};

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function toLocalDateParts(value: string) {
  if (!value) {
    const now = new Date();

    return {
      datePart: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      timePart: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    const now = new Date();

    return {
      datePart: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      timePart: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    };
  }

  return {
    datePart: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    timePart: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

function combineDateAndTime(datePart: string, timePart: string) {
  if (!datePart) {
    return '';
  }

  return `${datePart}T${timePart || '00:00'}`;
}

export default function DueDateTimePicker({
  value,
  onChange,
  label = 'Due Date',
  error,
  required = false,
  className = '',
}: DueDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { datePart, timePart } = useMemo(() => toLocalDateParts(value), [value]);

  const selectedDate = useMemo(() => {
    const candidate = value ? new Date(value) : new Date();
    return Number.isNaN(candidate.getTime()) ? new Date() : candidate;
  }, [value]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      if (
        popupRef.current &&
        !popupRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, []);

  const updateDate = (nextDate: Date) => {
    const nextDatePart = `${nextDate.getFullYear()}-${pad(nextDate.getMonth() + 1)}-${pad(nextDate.getDate())}`;
    onChange(combineDateAndTime(nextDatePart, timePart));
  };

  const updateTime = (nextTime: string) => {
    onChange(combineDateAndTime(datePart, nextTime));
  };

  return (
    <div className={`relative ${className}`}>
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`mt-2 flex w-full items-center justify-between gap-3 rounded-[6px] border p-2 duration-500 bg-white dark:bg-[#000] dark:text-gray outline-none ${
          error ? 'border-red-500 text-red-500' : 'border-gray-500/[0.2] dark:border-gray-500/[0.4]'
        }`}
      >
        <span className="flex items-center gap-2">
          <CalendarIcon size={16} />
          <span>{selectedDate.toLocaleDateString()} at {timePart || '00:00'}</span>
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">Choose</span>
      </button>

      {isOpen && (
        <div className="z-[60] p-4 fixed sm:right-[32%] right-0 bottom-20">
          <div
            ref={popupRef}
            className="w-full max-w-md rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-bg-secondary shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pick a date and time</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-dark-bg"
              >
                <XIcon size={16} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <Calendar
                value={selectedDate}
                onChange={(nextValue) => {
                  if (Array.isArray(nextValue) || !nextValue) {
                    return;
                  }

                  updateDate(nextValue);
                }}
              />

              <div>
                <Input
                  type="time"
                  value={timePart}
                  name="dueTime"
                  onChange={(event) => updateTime(event.target.value)}
                  label="Time"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </div>
        </div>
      )}

      {error && !isOpen && <p className="mt-1 text-red-500 text-sm">{error}</p>}
    </div>
  );
}