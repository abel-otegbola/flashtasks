import { getStoredTimezone } from './appPreferences';

export const formatDateTime = (value: string | Date | number | undefined, opts?: Intl.DateTimeFormatOptions) => {
  if (!value) return '';
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
  const timeZone = getStoredTimezone();
  try {
    return new Intl.DateTimeFormat(undefined, { timeZone, ...(opts || {}) }).format(date);
  } catch {
    return date.toLocaleString();
  }
};

export const formatDateOnly = (value: string | Date | number | undefined) =>
  formatDateTime(value, { year: 'numeric', month: 'long', day: 'numeric' });

export const formatDateShort = (value: string | Date | number | undefined) =>
  formatDateTime(value, { year: 'numeric', month: 'short', day: 'numeric' });

export const formatTime = (value: string | Date | number | undefined) =>
  formatDateTime(value, { hour: '2-digit', minute: '2-digit' });
