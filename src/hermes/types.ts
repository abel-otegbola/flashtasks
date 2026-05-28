export type HermesProvider = 'slack' | 'gmail';

export type HermesTenant = {
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
  userEmail?: string;
  accountId?: string;
};

export type HermesIntegrationStatus = 'connected' | 'disconnected' | 'error';

export interface ConnectedAccount {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  provider: HermesProvider;
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
  userEmail?: string;
  accountId: string;
  externalAccountId: string;
  externalWorkspaceId?: string;
  accountName: string;
  tokenType: string;
  accessToken: string;
  refreshToken?: string;
  scope?: string;
  status: HermesIntegrationStatus;
  metadata?: string;
  connectedAt: string;
}

export interface IntegrationModuleManifest {
  provider: HermesProvider;
  scopes: string[];
  oauthAuthorizeUrl: string;
  supportsWebhooks: boolean;
}

export type TaskScheduleStatus = 'unscheduled' | 'scheduled' | 'drafted' | 'sent' | 'failed';

export interface ConversationThread {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  organizationId?: string;
  provider: HermesProvider;
  workspaceId?: string;
  accountId?: string;
  userId?: string;
  userEmail?: string;
  threadKey: string;
  subject?: string;
  lastInboundAt?: string;
  lastOutboundAt?: string;
  status: 'open' | 'pending' | 'stalled' | 'closed';
  taskId?: string;
}

export interface TaskSchedule {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  organizationId?: string;
  provider: HermesProvider;
  userId?: string;
  userEmail?: string;
  taskId?: string;
  status: TaskScheduleStatus;
  scheduledAt: string;
  scheduleSource?: 'hermes' | 'user' | 'integration';
  payload: Record<string, unknown>;
}

export interface ActivityLog {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  organizationId?: string;
  provider: HermesProvider;
  userId?: string;
  userEmail?: string;
  entityType: 'event' | 'action' | 'job' | 'task';
  entityId: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  payload: Record<string, unknown>;
}

export interface HermesEvent {
  provider: HermesProvider;
  eventType: string;
  organizationId?: string;
  workspaceId?: string;
  accountId?: string;
  conversationId?: string;
  messageId?: string;
  direction: 'inbound' | 'outbound';
  actorEmail?: string;
  occurredAt: string;
  payload: Record<string, unknown>;
}

export interface HermesAction {
  type: 'schedule_task' | 'update_task_status' | 'send_message';
  payload: Record<string, unknown>;
  dueAt?: string;
}
