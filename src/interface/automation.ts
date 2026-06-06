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
  data: ActionData; // original data for the action, useful for retries
  executedAt?: string;
  error?: string;
}

export interface Automation {
  $id?: string;
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
  $createdAt?: string;
  $updatedAt?: string;
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

export type ActionData =
  | { type: "create_task";          data: { userId: string; title: string; description: string } }
  | { type: "update_task";          data: { taskId: string; data: Record<string, unknown> } }
  | { type: "complete_task";        data: { taskId: string } }
  | { type: "review_tasks";         data: { userId: string } }
  | { type: "generate_followups";   data: { userId: string } }
  | { type: "prioritize_tasks";     data: { taskIds: string[] } }
  | { type: "send_email";           data: { to: string; subject: string; body: string } }
  | { type: "send_summary_email";   data: { to: string; subject: string; body: string } }
  | { type: "send_reminder";        data: { to: string; subject: string; body: string } }
  | { type: "notify_team";          data: { teamMembers?: string[]; body: string } }
  | { type: "searchEmails";         data: { query: string; maxResults: number } }
  | { type: "createDraft";          data: { to: string; subject: string; body: string } };
