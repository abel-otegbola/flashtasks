export const APP_PREFERENCE_KEYS = {
  timezone: 'timezone',
  defaultLandingPage: 'defaultLandingPage',
  confirmBeforeDeletingTasks: 'confirmBeforeDeletingTasks',
} as const;

export type DefaultLandingPage = 'dashboard' | 'tasks' | 'workspace';

export const DEFAULT_LANDING_PAGE_OPTIONS: Array<{
  value: DefaultLandingPage;
  label: string;
  path: string;
}> = [
  { value: 'dashboard', label: 'Dashboard', path: '/account/dashboard' },
  { value: 'tasks', label: 'My Tasks', path: '/account/tasks' },
  { value: 'workspace', label: 'Workspace', path: '/account/organizations' },
];

const COMMON_TIMEZONES = [
  'UTC',
  'Africa/Lagos',
  'America/Los_Angeles',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

const readStorage = (key: string, fallback: string) => {
  if (typeof window === 'undefined') return fallback;

  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};

export const setStoredPreference = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures and keep the in-memory state only.
  }
};

export const getSystemTimezone = () => {
  if (typeof Intl === 'undefined') return 'UTC';

  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
};

export const getTimezoneOptions = () => {
  const systemTimezone = getSystemTimezone();

  return Array.from(new Set([systemTimezone, ...COMMON_TIMEZONES])).map((value) => ({
    value,
    label: value,
  }));
};

export const getStoredTimezone = () => readStorage(APP_PREFERENCE_KEYS.timezone, getSystemTimezone());

export const getDefaultLandingPage = (): DefaultLandingPage => {
  const stored = readStorage(APP_PREFERENCE_KEYS.defaultLandingPage, 'dashboard');

  return DEFAULT_LANDING_PAGE_OPTIONS.some((option) => option.value === stored)
    ? (stored as DefaultLandingPage)
    : 'dashboard';
};

export const resolveAccountLandingPath = () => {
  const landingPage = getDefaultLandingPage();
  return DEFAULT_LANDING_PAGE_OPTIONS.find((option) => option.value === landingPage)?.path || '/account/dashboard';
};

export const shouldConfirmBeforeDeletingTasks = () => {
  return readStorage(APP_PREFERENCE_KEYS.confirmBeforeDeletingTasks, 'true') !== 'false';
};