export interface action {
  id: string;
  type: string;
  params: object;
  scheduledFor: string | null;
  status: "pending" | "done" | "failed";
  priority?: "low" | "medium" | "high";
  retryCount?: number;
  maxRetries?: number;
  recurring?: {
    type: "daily" | "weekly" | "monthly";
    interval?: number;
  };
  data: actionData; // original data for the action, useful for retries
  executedAt?: string;
  error?: string;
}

export interface Automation {
  $id: string;
  title: string;
  instruction: string;
  status: "active" | "inactive" | "paused" | "failed";
  schedule: string;
  actions?: action[]; // JSON stringified array of actions
  lastRunAt?: string;
  nextRunAt?: string;
  lastError?: string;
  userId: string;
  organizationId?: string;
  teamId?: string;
  description?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface GmailAuthParams {
  accessToken: string;
}

export interface SendEmailParams extends GmailAuthParams {
  to: string;
  subject: string;
  body: string;
}

export interface SearchEmailsParams extends GmailAuthParams {
  query: string;
  maxResults?: number;
}

export interface GetEmailParams extends GmailAuthParams {
  messageId: string;
}

export interface GetThreadParams extends GmailAuthParams {
  threadId: string;
}

export interface ReplyEmailParams extends GmailAuthParams {
  threadId: string;
  to: string;
  subject: string;
  body: string;
}

export interface actionData {
    userId?: string;
    [key: string]: any;
    title?: string;
    description?: string;
    dueDate?: string;
    taskId?: string;
    taskIds?: string[];
    query?: string;
    to?: string;
    subject?: string;
    body?: string;
    summary?: string;
    teamMembers?: string[];
}