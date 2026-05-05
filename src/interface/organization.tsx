export const ADMIN_PERMISSIONS = [
  'Invite/remove members',
  'Create/edit/delete all tasks',
  'Manage projects',
  'Assign tasks',
];

export const MEMBER_PERMISSIONS = [
  'Create tasks',
  'Edit their own tasks',
  'Complete tasks',
  'View shared tasks/projects',
  'Edit tasks assigned to them',
];

export interface OrgInvite {
  $id: string;
  orgId: string;
  orgName?: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  permissions: string[];
  status: 'pending' | 'accepted' | 'declined';
  inviterEmail?: string;
  acceptedAt?: string;
}

// Simplified organization interfaces used across the app
export interface OrgMember {
  $id: string;
  name?: string;
  email?: string;
  role?: string;
  permissions?: string[];
}

export interface Team {
  $id: string;
  name: string;
  members?: string[]; // list of member $ids
}

export interface Organization {
  $id: string;
  name: string;
  ownerEmail?: string;
  slug?: string;
  description?: string;
  members?: OrgMember[];
  teams?: Team[];
  createdAt?: string;
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