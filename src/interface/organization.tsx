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

export interface Team {
  $id: string;
  name: string;
  members?: string[]; // list of member $ids
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
  name: string;
  members?: string[];
}