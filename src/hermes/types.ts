export type HermesProvider = 'slack' | 'gmail';

export type HermesTenant = {
  organizationId: string;
  workspaceId?: string;
  userId?: string;
  userEmail?: string;
  accountId?: string;
};

export type HermesIntegrationStatus = 'connected' | 'disconnected' | 'error';

export interface ConnectedAccount {
  $id?: string;
  provider: HermesProvider;
  organizationId: string;
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
  updatedAt: string;
}

export interface IntegrationModuleManifest {
  provider: HermesProvider;
  scopes: string[];
  oauthAuthorizeUrl: string;
  supportsWebhooks: boolean;
}

export interface AutomationRule {
  $id?: string;
  organizationId: string;
  workspaceId?: string;
  userId?: string;
  userEmail?: string;
  name: string;
  trigger: string;
  conditions: string;
  actions: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationThread {
  $id?: string;
  organizationId: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface FollowupJob {
  $id?: string;
  organizationId: string;
  userId?: string;
  userEmail?: string;
  threadKey: string;
  provider: HermesProvider;
  jobType: 'schedule_reminder' | 'draft_followup' | 'send_followup' | 'create_task' | 'update_task_status';
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  priority: 'low' | 'normal' | 'high';
  payload: Record<string, unknown>;
  runAt: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledTask {
  $id?: string;
  organizationId: string;
  userId?: string;
  userEmail?: string;
  followupJobId?: string;
  taskId?: string;
  status: 'scheduled' | 'sent' | 'drafted' | 'failed';
  dueAt: string;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  $id?: string;
  organizationId: string;
  provider: HermesProvider;
  userId?: string;
  userEmail?: string;
  entityType: 'event' | 'action' | 'job' | 'task';
  entityId: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface HermesEvent {
  provider: HermesProvider;
  eventType: string;
  organizationId: string;
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
  type: 'draft_followup' | 'send_followup' | 'create_task' | 'schedule_reminder' | 'update_task_status';
  payload: Record<string, unknown>;
  dueAt?: string;
}
