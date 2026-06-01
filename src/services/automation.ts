export type AutomationRunStatus = 'pending_approval' | 'ready_to_execute' | string;

export type AutomationAnalysis = Record<string, unknown> & {
  intent?: string;
  goal?: string;
  status?: AutomationRunStatus;
  tool?: string;
  plan?: string[];
  summary?: string;
  nextStep?: string;
  needsApproval?: boolean;
  memoryNote?: string;
};

export type AutomationTranscriptEntry = {
  type: string;
  name: string | null;
  content: string;
  toolCalls: unknown[];
};

export type AutomationRunResponse = {
  ok: boolean;
  runId: string;
  status: AutomationRunStatus;
  analysis: AutomationAnalysis;
  result: {
    finalMessage?: AutomationAnalysis;
    transcript?: AutomationTranscriptEntry[];
  };
};

export type AutomationRunRecord = {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  workspaceId: string;
  task: string;
  context?: string;
  status: AutomationRunStatus;
  provider?: string;
  model?: string;
  tool?: string;
  needsApproval?: boolean;
  planJson?: string;
  summary?: string;
  nextStep?: string;
  analysisJson?: string;
  resultJson?: string;
};

export type AutomationReminderRecord = {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  workspaceId: string;
  task: string;
  note?: string;
  dueAt?: string;
  status: string;
  source?: string;
  tool?: string;
  attempts?: number;
};

export type AutomationRunRequest = {
  task: string;
  context?: string | null;
  userId?: string | null;
  workspaceId?: string | null;
};

export type AutomationQueryParams = {
  limit?: number;
  userId?: string | null;
  workspaceId?: string | null;
  status?: string | null;
};

export type AutomationRunsResponse = {
  ok: boolean;
  runs: AutomationRunRecord[];
};

export type AutomationRemindersResponse = {
  ok: boolean;
  reminders: AutomationReminderRecord[];
};

const getBackend = () => import.meta.env.VITE_BACKEND_URL || '';

const buildUrl = (path: string) => `${getBackend()}${path.startsWith('/') ? path : `/${path}`}`;

const toQueryString = (params: Record<string, string | number | null | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    searchParams.set(key, String(value));
  });

  return searchParams.toString();
};

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error || payload?.message || response.statusText || 'Request failed');
  }

  return (await response.json()) as T;
}

export async function runAutomation(payload: AutomationRunRequest): Promise<AutomationRunResponse> {
  return requestJson<AutomationRunResponse>('/automation/run', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listAutomationRuns(params: AutomationQueryParams): Promise<AutomationRunsResponse> {
  const query = toQueryString(params);
  return requestJson<AutomationRunsResponse>(`/automation/runs${query ? `?${query}` : ''}`, {
    method: 'GET',
  });
}

export async function listAutomationReminders(params: AutomationQueryParams): Promise<AutomationRemindersResponse> {
  const query = toQueryString(params);
  return requestJson<AutomationRemindersResponse>(`/automation/reminders${query ? `?${query}` : ''}`, {
    method: 'GET',
  });
}
