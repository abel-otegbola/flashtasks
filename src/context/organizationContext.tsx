'use client'
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { ADMIN_PERMISSIONS, Organization, OrgInvite, OrgMember, Team, CreateOrganizationPayload, CreateTeamPayload } from '../interface/organization';
import { databases, teams } from '../appwrite/appwrite';
import { ID, Query } from 'appwrite';
import toast from 'react-hot-toast';
import { useUser } from './authContext';

type OrganizationContextValues = {
  organizations: Organization[];
  currentOrg?: Organization | null;
  loading: boolean;
  createOrganization: (payload: CreateOrganizationPayload) => Promise<Organization>;
  selectOrganization: (orgId: string) => void;
  addTeam: (payload: CreateTeamPayload) => Promise<Team>;
  removeTeam: (orgId: string, teamId: string) => Promise<boolean>;
  addMemberToOrg: (orgId: string, member: OrgMember) => Promise<boolean>;
  createOrgInvite: (orgId: string, invite: Omit<OrgInvite, '$id' | 'status' | 'orgId' | 'orgName' | 'createdAt' | 'acceptedAt' | 'inviterEmail'>) => Promise<boolean>;
  updateOrganization: (orgId: string, data: Partial<any>) => Promise<Organization>;
  deleteOrganization: (orgId: string) => Promise<boolean>;
  removeMemberFromOrg: (orgId: string, memberId: string) => Promise<boolean>;
  updateTeamMembers: (orgId: string, teamId: string, memberIds: string[]) => Promise<boolean>;
}

const OrganizationContext = createContext({} as OrganizationContextValues);

export function useOrganizations() {
  return useContext(OrganizationContext);
}

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '';
  const ORG_COLLECTION_ID = import.meta.env.VITE_APPWRITE_ORG_COLLECTION_ID || 'organizations';
  const loadOrganizations = async () => {
  if (!user?.$id || !user?.email) {
    setOrganizations([]);
    setCurrentOrg(null);
    return;
  }

  try {
    const [memberRes, ownerRes] = await Promise.all([
      // ✅ user is in members
      databases.listDocuments(
        DATABASE_ID,
        ORG_COLLECTION_ID,
        [
          Query.equal("members.$id", user.$id),
          Query.select(["*", "teams.*", "members.*"]),
          Query.limit(100),
        ]
      ),

      // ✅ user is owner
      databases.listDocuments(
        DATABASE_ID,
        ORG_COLLECTION_ID,
        [
          Query.equal("ownerEmail", user.email),
          Query.select(["*", "teams.*", "members.*"]),
          Query.limit(100),
        ]
      )
    ]);

    // 🔁 merge + remove duplicates
    const combined = [
      ...memberRes.documents,
      ...ownerRes.documents
    ];

    const unique = Array.from(
      new Map(combined.map(doc => [doc.$id, doc])).values()
    );

    if (!unique.length) {
      setOrganizations([]);
      setCurrentOrg(null);
      return;
    }

    setOrganizations(unique as unknown as Organization[]);
    setCurrentOrg(unique[0] as unknown as Organization);

  } catch (err) {
    console.error("Error loading organizations", err);
    toast.error("Failed to load organizations");
  }
};

  // load organizations for current user on mount or when user changes
  useEffect(() => {
    loadOrganizations();
  }, [user]);

  useEffect(() => {
    const refreshOrganizations = () => {
      loadOrganizations();
    };

    window.addEventListener('organizations:changed', refreshOrganizations);
    return () => window.removeEventListener('organizations:changed', refreshOrganizations);
  }, [user]);

  const createOrganization = async (payload: CreateOrganizationPayload) => {
    setLoading(true);
    try {
      let members: OrgMember[] = [];
      if (payload.members && payload.members.length > 0) {
        members = payload.members.map(m => ({ $id: m.$id || ID.unique(), name: m.name, email: m.email, role: m.role, permissions: m.permissions || [] }));
      }

      const teams = payload.teams && payload.teams.length > 0 ? payload.teams.map(t => ({ $id: ID.unique(), name: t.name, members: t.members || [] })) : [];

      const orgData: any = {
        name: payload.name,
        ownerEmail: (user as any)?.email,
        slug: payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: payload.description || '',
        members,
        teams
      };

      const res = await databases.createDocument(DATABASE_ID, ORG_COLLECTION_ID, ID.unique(), orgData);

      const newOrg: Organization = {
        $id: res.$id,
        name: res.name,
        ownerEmail: res.ownerEmail || (user as any)?.email,
        slug: res.slug,
        description: res.description,
        members: res.members || [],
        teams: res.teams || [],
        createdAt: res.$createdAt,
      };

      setOrganizations(prev => [newOrg, ...prev]);
      setCurrentOrg(newOrg);
      toast.success('Organization created');
      // index organization
      try { await (await import('../services/indexer')).indexOrganization('create', newOrg); } catch {};
      return newOrg;
    } catch (err) {
      console.error('Error creating organization', err);
      toast.error('Failed to create organization');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrganization = async (orgId: string, data: Partial<any>) => {
    setLoading(true);
    try {
      const updated = await databases.updateDocument(DATABASE_ID, ORG_COLLECTION_ID, orgId, data);

      const updatedOrg: Organization = {
        $id: updated.$id,
        name: updated.name,
        slug: updated.slug,
        description: updated.description,
        members: updated.members || [],
        teams: updated.teams || [],
        createdAt: updated.$createdAt,
      };

      setOrganizations(prev => prev.map(o => o.$id === updatedOrg.$id ? updatedOrg : o));
      if (currentOrg?.$id === orgId) setCurrentOrg(updatedOrg);
      try { await (await import('../services/indexer')).indexOrganization('update', updatedOrg); } catch {};
      toast.success('Organization updated');
      return updatedOrg;
    } catch (err) {
      console.error('Error updating organization', err);
      toast.error('Failed to update organization');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrganization = async (orgId: string) => {
    setLoading(true);
    try {
      await databases.deleteDocument(DATABASE_ID, ORG_COLLECTION_ID, orgId);

      const remainingOrganizations = organizations.filter((org) => org.$id !== orgId);
      setOrganizations(remainingOrganizations);
      setCurrentOrg(remainingOrganizations[0] || null);

      toast.success('Organization deleted');
      return true;
    } catch (err) {
      console.error('Error deleting organization', err);
      toast.error('Failed to delete organization');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const selectOrganization = (orgId: string) => {
    const org = organizations.find(o => o.$id === orgId) || null;
    setCurrentOrg(org);
  };

  const addTeam = async (payload: CreateTeamPayload) => {
    if (!currentOrg) throw new Error('No organization selected');
    setLoading(true);
    try {
      const newTeam: Team = { $id: ID.unique(), name: payload.name, members: payload.members || [] };

      // Update in Appwrite
      const updated = await databases.updateDocument(DATABASE_ID, ORG_COLLECTION_ID, currentOrg.$id, {
        teams: [...(currentOrg.teams || []), newTeam]
      });

      const updatedOrg: Organization = {
        $id: updated.$id,
        name: updated.name,
        slug: updated.slug,
        description: updated.description,
        members: updated.members || [],
        teams: updated.teams || [],
        createdAt: updated.$createdAt,
      };

      setOrganizations(prev => prev.map(o => o.$id === updatedOrg.$id ? updatedOrg : o));
      setCurrentOrg(updatedOrg);
      toast.success('Team added');
      try { await (await import('../services/indexer')).indexOrganization('update', updatedOrg); } catch {};
      return newTeam;
    } catch (err) {
      console.error('Error adding team', err);
      toast.error('Failed to add team');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeTeam = async (orgId: string, teamId: string) => {
    setLoading(true);
    try {
      const org = organizations.find(o => o.$id === orgId);
      if (!org) return false;
      const newTeams = (org.teams || []).filter((t: any) => t.$id !== teamId);
      const updated = await databases.updateDocument(DATABASE_ID, ORG_COLLECTION_ID, orgId, { teams: newTeams });

      const updatedOrg: Organization = {
        $id: updated.$id,
        name: updated.name,
        slug: updated.slug,
        description: updated.description,
        members: updated.members || [],
        teams: updated.teams || [],
        createdAt: updated.$createdAt,
      };

      setOrganizations(prev => prev.map(o => o.$id === updatedOrg.$id ? updatedOrg : o));
      if (currentOrg?.$id === orgId) setCurrentOrg(updatedOrg);
      toast.success('Team removed');
      try { await (await import('../services/indexer')).indexOrganization('update', updatedOrg); } catch {};
      return true;
    } catch (err) {
      console.error('Error removing team', err);
      toast.error('Failed to remove team');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addMemberToOrg = async (orgId: string, member: OrgMember) => {
    setLoading(true);
    try {
      const org = organizations.find(o => o.$id === orgId);
      if (!org) return false;
      const memberWithId = { $id: (member as any)?.$id || ID.unique(), name: member.name, email: member.email, role: member.role, permissions: member.permissions || [] };
      const newMembers = [...(org.members || []), memberWithId];
      const updated = await databases.updateDocument(DATABASE_ID, ORG_COLLECTION_ID, orgId, { members: newMembers });

      const updatedOrg: Organization = {
        $id: updated.$id,
        name: updated.name,
        slug: updated.slug,
        description: updated.description,
        members: updated.members || [],
        teams: updated.teams || [],
        createdAt: updated.$createdAt,
      };

      setOrganizations(prev => prev.map(o => o.$id === updatedOrg.$id ? updatedOrg : o));
      if (currentOrg?.$id === orgId) setCurrentOrg(updatedOrg);
      toast.success('Member added');
      try { await (await import('../services/indexer')).indexOrganization('update', updatedOrg); } catch {};
      return true;
    } catch (err) {
      console.error('Error adding member', err);
      toast.error('Failed to add member');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createOrgInvite = async (
    orgId: string,
    invite: Omit<OrgInvite, '$id' | 'status' | 'orgId' | 'orgName' | 'createdAt' | 'acceptedAt' | 'inviterEmail'>
  ) => {
    setLoading(true);
    try {
      const org = organizations.find((item) => item.$id === orgId);
      if (!org) return false;

      const normalizedEmail = invite.email.trim().toLowerCase();
      const existingMember = (org.members || []).some((member) => member.email?.toLowerCase() === normalizedEmail);
      if (existingMember || org.ownerEmail?.toLowerCase() === normalizedEmail) {
        toast.error('Member already belongs to this organization');
        return false;
      }

      try {
        await teams.get({ teamId: orgId });
      } catch {
        await teams.create({ teamId: orgId, name: org.name, roles: ['owner'] });
      }

      await teams.createMembership({
        teamId: orgId,
        roles: [invite.role],
        email: normalizedEmail,
        name: invite.name,
        url: `https://flashtasks.app/account/notifications?teamId=${encodeURIComponent(orgId)}`,
      });

      toast.success('Invite sent');
      return true;
    } catch (err) {
      console.error('Error creating invite', err);
      toast.error('Failed to create invite');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeMemberFromOrg = async (orgId: string, memberId: string) => {
    setLoading(true);
    try {
      const org = organizations.find(o => o.$id === orgId);
      if (!org) return false;
      const newMembers = (org.members || []).filter(m => m.$id !== memberId);

      const updated = await databases.updateDocument(DATABASE_ID, ORG_COLLECTION_ID, orgId, { members: newMembers });

      const updatedOrg: Organization = {
        $id: updated.$id,
        name: updated.name,
        slug: updated.slug,
        description: updated.description,
        members: updated.members || [],
        teams: updated.teams || [],
        createdAt: updated.$createdAt,
      };

      setOrganizations(prev => prev.map(o => o.$id === updatedOrg.$id ? updatedOrg : o));
      if (currentOrg?.$id === orgId) setCurrentOrg(updatedOrg);
      toast.success('Member removed');
      try { await (await import('../services/indexer')).indexOrganization('update', updatedOrg); } catch {};
      return true;
    } catch (err) {
      console.error('Error removing member', err);
      toast.error('Failed to remove member');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTeamMembers = async (orgId: string, teamId: string, memberIds: string[]) => {
    setLoading(true);
    try {
      const org = organizations.find(o => o.$id === orgId);
      if (!org) throw new Error('Organization not found');

      const newTeams = (org.teams || []).map(t => t.$id === teamId ? { ...t, members: memberIds } : t);
      const updated = await databases.updateDocument(DATABASE_ID, ORG_COLLECTION_ID, orgId, { teams: newTeams });

      const updatedOrg: Organization = {
        $id: updated.$id,
        name: updated.name,
        slug: updated.slug,
        description: updated.description,
        members: updated.members || [],
        teams: updated.teams || [],
        createdAt: updated.$createdAt,
      };

      setOrganizations(prev => prev.map(o => o.$id === updatedOrg.$id ? updatedOrg : o));
      if (currentOrg?.$id === orgId) setCurrentOrg(updatedOrg);
      toast.success('Team updated');
      try { await (await import('../services/indexer')).indexOrganization('update', updatedOrg); } catch {};
      return true;
    } catch (err) {
      console.error('Error updating team members', err);
      toast.error('Failed to update team');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrganizationContext.Provider value={{ organizations, currentOrg, loading, createOrganization, selectOrganization, addTeam, removeTeam, addMemberToOrg, createOrgInvite, updateOrganization, deleteOrganization, removeMemberFromOrg, updateTeamMembers }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export default OrganizationContext;
