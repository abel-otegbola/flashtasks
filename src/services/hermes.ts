import type { HermesProvider, HermesTenant } from '../hermes/types';

export type ApiBaseResponse = {
  ok: boolean;
};

export type StartConnectResponse = ApiBaseResponse & {
  provider: HermesProvider;
  authUrl: string;
};

export type CallbackConnectResponse = ApiBaseResponse & {
  provider: HermesProvider;
  userId: string;
  accountId: string;
  expiresAt: string | null;
  authUrl: string;
};

export type HermesRunStatus = 'pending_approval' | 'ready_to_execute';

export type HermesRunResponse = ApiBaseResponse & {
  runId: string;
  status: HermesRunStatus;
  analysis: Record<string, unknown>;
  result: Record<string, unknown>;
};

export type HermesRunsResponse = ApiBaseResponse & {
  runs: Array<Record<string, unknown>>;
};

export type HermesRunRequest = {
  task: string;
  context?: string | null;
  userId?: string | null;
  workspaceId?: string | null;
};

const getBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;

  if (!configuredBaseUrl) {
    throw new Error('Missing VITE_API_BASE_URL environment variable');
  }

  return configuredBaseUrl.replace(/\/$/, '');
};

const buildUrl = (path: string) => `${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

const parseErrorMessage = async (response: Response) => {
  const payload = await response.json().catch(() => ({}));
  return payload?.error || payload?.message || response.statusText || 'Request failed';
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
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as T;
}

const toQueryString = (params: Record<string, string | number | null | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    searchParams.set(key, String(value));
  });

  return searchParams.toString();
};

export async function startIntegration(provider: HermesProvider, tenant: HermesTenant): Promise<StartConnectResponse> {
  const query = toQueryString({ userId: tenant.userId || '', workspaceId: tenant.workspaceId || '' });
  return requestJson<StartConnectResponse>(`/connect/${provider}/start${query ? `?${query}` : ''}`, {
    method: 'GET',
  });
}

export async function completeIntegrationCallback(
  provider: HermesProvider,
  payload: { code: string; state: string },
  method: 'GET' | 'POST' = 'GET'
): Promise<CallbackConnectResponse> {
  if (method === 'GET') {
    const query = toQueryString(payload);
    return requestJson<CallbackConnectResponse>(`/connect/${provider}/callback?${query}`, { method: 'GET' });
  }

  return requestJson<CallbackConnectResponse>(`/connect/${provider}/callback`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function runHermesTask(payload: HermesRunRequest): Promise<HermesRunResponse> {
  return requestJson<HermesRunResponse>('/hermes/run', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listHermesRuns(): Promise<HermesRunsResponse> {
  return requestJson<HermesRunsResponse>('/hermes/runs', { method: 'GET' });
}

export async function getHealth(): Promise<ApiBaseResponse> {
  return requestJson<ApiBaseResponse>('/health', { method: 'GET' });
}

export const connectSlack = (tenant: HermesTenant) => startIntegration('slack', tenant);

export const connectGmail = (tenant: HermesTenant) => startIntegration('gmail', tenant);

export const connectEmail = connectGmail;
