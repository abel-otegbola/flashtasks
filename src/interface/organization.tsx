// Simplified organization interfaces used across the app
export interface OrgMember {
  $id: string;
  name?: string;
  email?: string;
  role?: string;
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