'use client'
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { Organization, OrgMember, Team, CreateOrganizationPayload, CreateTeamPayload } from '../interface/organization';
import { databases } from '../appwrite/appwrite';
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
  updateOrganization: (orgId: string, data: Partial<any>) => Promise<Organization>;
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

  // load organizations for current user on mount or when user changes
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const res = await databases.listDocuments(
          DATABASE_ID,
          ORG_COLLECTION_ID,
          [
              Query.select(["*", "teams.*", "members.*"]),
              Query.equal('ownerEmail', user?.email) || Query.equal('members.email', user?.email),
          ]
        );
        
        if (!res.documents) {
          setOrganizations([]);
          setCurrentOrg(null);
          return;
        }
        else {
          setOrganizations(res.documents as unknown as Organization[]);
          setCurrentOrg(res.documents[0] as unknown as Organization);
        }
      } catch (err) {
        console.error('Error loading organizations', err);
        toast.error('Failed to load organizations');
      }
    };

    load();
  }, [user]);

  const createOrganization = async (payload: CreateOrganizationPayload) => {
    setLoading(true);
    try {
      // Ensure creator is always included as owner in members
      const ownerMember: OrgMember = {
        $id: (user as any)?.$id || ID.unique(),
        name: (user as any)?.name || (user as any)?.fullname || '',
        email: (user as any)?.email,
        role: 'owner'
      };

      let members: OrgMember[] = [];
      if (payload.members && payload.members.length > 0) {
        members = payload.members.map(m => ({ $id: m.$id || ID.unique(), name: m.name, email: m.email, role: m.role }));
        // If owner not present in provided members, add them
        const hasOwner = members.some(m => m.email === ownerMember.email || m.$id === ownerMember.$id);
        if (!hasOwner) members.unshift(ownerMember);
        else {
          // make sure the owner member has role 'owner'
          members = members.map(m => (m.email === ownerMember.email || m.$id === ownerMember.$id) ? { ...m, role: 'owner' } : m);
        }
      } else {
        members = [ownerMember];
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

      // fetch authoritative document to ensure nested fields (members/teams) are present
      let full: any = res;
      try {
        full = await databases.getDocument(DATABASE_ID, ORG_COLLECTION_ID, res.$id);
      } catch (e) {
        // ignore: fall back to create response
      }

      const newOrg: Organization = {
        $id: full.$id,
        name: full.name,
        ownerEmail: full.ownerEmail || (user as any)?.email,
        slug: full.slug,
        description: full.description,
        members: full.members || [],
        teams: full.teams || [],
        createdAt: full.$createdAt,
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
      const memberWithId = { $id: (member as any)?.$id || ID.unique(), name: member.name, email: member.email, role: member.role };
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
    <OrganizationContext.Provider value={{ organizations, currentOrg, loading, createOrganization, selectOrganization, addTeam, removeTeam, addMemberToOrg, updateOrganization, removeMemberFromOrg, updateTeamMembers }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export default OrganizationContext;
