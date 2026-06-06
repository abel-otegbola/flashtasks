import { Query } from 'appwrite';
import { databases } from '../appwrite/appwrite';
import type { Provider, IntegrationTenant } from '../interface/integration';

export type ApiBaseResponse = {
  ok: boolean;
};

export type StartConnectResponse = ApiBaseResponse & {
  provider: Provider;
  authUrl: string;
};

export type CallbackConnectResponse = ApiBaseResponse & {
  provider: Provider;
  userId: string;
  accountId: string;
  expiresAt: string | null;
  authUrl: string;
};

export type IntegrationRunStatus = 'pending_approval' | 'ready_to_execute';

export type IntegrationRunResponse = ApiBaseResponse & {
  runId: string;
  status: IntegrationRunStatus;
  analysis: Record<string, unknown>;
  result: Record<string, unknown>;
};

export type IntegrationRunsResponse = ApiBaseResponse & {
  runs: Array<Record<string, unknown>>;
};

export type ConnectedAccountRecord = Record<string, unknown> & {
  provider?: Provider;
  status?: string;
  connectedAt?: string;
  updatedAt?: string;
  $createdAt?: string;
  $updatedAt?: string;
};

export type ConnectedIntegrationsResponse = ApiBaseResponse & {
  connectedAccounts: ConnectedAccountRecord[];
  configured?: boolean;
};

export type IntegrationRunRequest = {
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

export async function startIntegration(provider: Provider, tenant: IntegrationTenant): Promise<StartConnectResponse> {
  const query = toQueryString({ userId: tenant.userId || '', workspaceId: tenant.workspaceId || '' });
  return requestJson<StartConnectResponse>(`/connect/${provider}/start${query ? `?${query}` : ''}`, {
    method: 'GET',
  });
}

export async function completeIntegrationCallback(
  provider: Provider,
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

export async function runIntegrationTask(payload: IntegrationRunRequest): Promise<IntegrationRunResponse> {
  return requestJson<IntegrationRunResponse>('/Integration/run', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listIntegrationRuns(): Promise<IntegrationRunsResponse> {
  return requestJson<IntegrationRunsResponse>('/Integration/runs', { method: 'GET' });
}

export async function listConnectedIntegrations(tenant: IntegrationTenant): Promise<ConnectedIntegrationsResponse> {
  const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID || '';

  if (!databaseId) {
    throw new Error('Missing VITE_APPWRITE_DATABASE_ID environment variable');
  }

  const queries: string[] = [];

  if (tenant.userId) {
    queries.push(Query.equal('userId', tenant.userId));
  }

  if (tenant.workspaceId) {
    queries.push(Query.equal('workspaceId', tenant.workspaceId));
  }

  if (!tenant.userId && tenant.userEmail) {
    queries.push(Query.equal('userEmail', tenant.userEmail));
  }

  if (tenant.organizationId) {
    queries.push(Query.equal('organizationId', tenant.organizationId));
  }

  const response = await databases.listDocuments(databaseId, 'integration', queries);

  return {
    ok: true,
    connectedAccounts: (response.documents || []) as ConnectedAccountRecord[],
    configured: true,
  };
}

export async function getHealth(): Promise<ApiBaseResponse> {
  return requestJson<ApiBaseResponse>('/health', { method: 'GET' });
}

export const connectSlack = (tenant: IntegrationTenant) => startIntegration('slack', tenant);

export const connectGmail = (tenant: IntegrationTenant) => startIntegration('gmail', tenant);

export const connectEmail = connectGmail;
