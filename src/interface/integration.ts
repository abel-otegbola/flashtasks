export type Provider = 'slack' | 'gmail';

export type IntegrationTenant = {
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
  userEmail?: string;
  accountId?: string;
};

export type IntegrationStatus = "connected" | "pending" | "failed" | "disconnected";

export type IntegrationConnectionRecord = {
  provider: Provider;
  status: IntegrationStatus;
  lastConnectedAt: string | null;
  accountId: string | null;
  userId: string | null;
  workspaceId: string | null;
  error: string | null;
  updatedAt: string;
};

export type IntegrationConnectionStore = Record<Provider, IntegrationConnectionRecord>;

export type TaskScheduleStatus = 'unscheduled' | 'scheduled' | 'drafted' | 'sent' | 'failed';