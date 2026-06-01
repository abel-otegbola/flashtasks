export const OWNER_PERMISSIONS = [
  'create_task',
  'edit_tasks',
  'delete_task',
  'delete_tasks',
  'assign_task',
  'complete_tasks',
  'view_task',
  'manage_org',
  'manage_teams',
  'manage_members',
  'edit_assigned_task',
];

export const ADMIN_PERMISSIONS = [
  'create_task',
  'edit_tasks',
  'delete_task',
  'assign_task',
  'complete_tasks',
  'view_task',
  'manage_teams',
];

export const MEMBER_PERMISSIONS = [
  'create_task',
  'view_task',
  'edit_assigned_task',
  'complete_tasks'
];

export interface OrgInvite {
  $id: string;
  orgId: string;
  orgName?: string;
  name?: string;
  email: string;
  roles: string[];
  status: 'pending' | 'accepted' | 'declined';
  joined?: string;
  inviterEmail?: string;
  acceptedAt?: string;
}

// Simplified organization interfaces used across the app
export interface OrgMember {
  $id: string;
  name?: string;
  email?: string;
  role?: string;
  roles?: string[];
}

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface Team {
  $id: string;
  title: string;
  description?: string;
  userId: string;
  orgId: string;
  userEmail: string;
  activities: JsonValue;
  members: string[];
  $createdAt?: string;
  $updatedAt?: string;
}

export interface Organization {
  $id: string;
  name: string;
  total?: number;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface CreateOrganizationPayload {
  name: string;
  description?: string;
  members?: OrgMember[];
  teams?: CreateTeamPayload[];
}

export interface CreateTeamPayload {
  title: string;
  description?: string;
  members?: string[];
  activities?: JsonValue;
  orgId?: string;
  userId?: string;
  userEmail?: string;
}

export interface ChatMessage {
  $id: string;
  orgId: string;
  userId?: string;
  userEmail?: string;
  text?: string;
  attachments?: string[];
  $createdAt?: string;
}