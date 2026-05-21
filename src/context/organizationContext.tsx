'use client'
import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { ADMIN_PERMISSIONS, MEMBER_PERMISSIONS, Organization, OrgInvite, OrgMember, Team, CreateOrganizationPayload, CreateTeamPayload } from '../interface/organization';
import { teams } from '../appwrite/appwrite';
import { ID } from 'appwrite';
import toast from 'react-hot-toast';
import { useUser } from './authContext';

type OrganizationContextValues = {
  organizations: Organization[];
  currentOrg?: Organization | null;
  invitedMembers: OrgInvite[];
  loading: boolean;
  createOrganization: (payload: CreateOrganizationPayload) => void;
  selectOrganization: (orgId: string) => void;
  addTeam: (payload: CreateTeamPayload) => Promise<Team>;
  removeTeam: (orgId: string, teamId: string) => Promise<boolean>;
  getAllInvitedMembers: (orgId: string) => void;
  createOrgInvite: (orgId: string, invite: Omit<OrgInvite, '$id' | 'status' | 'orgId' | 'orgName' | 'createdAt' | 'acceptedAt' | 'inviterEmail'>) => void;
  updateOrganization: (orgId: string, data: Partial<any>) => void;
  deleteOrganization: (orgId: string) => Promise<boolean>;
  removeMemberFromOrg: (orgId: string, memberId: string) => Promise<boolean>;
  updateTeamMember: (orgId: string, memberId: string, roles: string[]) => Promise<boolean>;
  hasPermission?: (permission: string, orgId?: string) => boolean;
}

const OrganizationContext = createContext({} as OrganizationContextValues);

export function useOrganizations() {
  return useContext(OrganizationContext);
}

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [invitedMembers, setInvitedMembers] = useState<OrgInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '';
  const ORG_COLLECTION_ID = import.meta.env.VITE_APPWRITE_ORGANIZATIONS_COLLECTION_ID || 'organizations';
  
  const loadOrganizations = async () => {
    if (!user?.$id || !user?.email) {
      setOrganizations([]);
      setCurrentOrg(null);
      return;
    }

    try {
      // ✅ user is in members
      teams.list()
      .then(res => res.teams || [])
      .then(teams => {
        setOrganizations(teams)
      })
      .catch(err => {
        console.error('Error loading organizations from teams endpoint', err);
        toast.error('Failed to load organizations');
      });
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
      teams.create({ teamId: ID.unique(), name: payload.name, roles: ['owner'] })
      .then((team) => {
        const newOrg: Organization = {
          $id: team.$id,
          name: team.name,
          total: 1,
        };
        
        setOrganizations(prev => [newOrg, ...prev]);
        setCurrentOrg(newOrg);
        toast.success('Organization created');
        return newOrg;
      })
      .catch(err => {
        console.error('Error creating team in Appwrite:', err);
        toast.error('Failed to create organization');
        throw err;
      });
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
      // If name is being updated, also update the Appwrite team
      if (data.name) {
        try {
          await teams.updateName({ teamId: orgId, name: data.name })
          .then(res => {
            loadOrganizations();
            toast.success('Organization updated');
            return res;
          })
        } catch (err) {
          console.warn('Could not update team name in Appwrite:', err);
        }
      }
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
      await teams.delete({ teamId: orgId });

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

  const getAllInvitedMembers = async (orgId: string) => {
    try {
      const memberships = await teams.listMemberships({ teamId: orgId });

      setInvitedMembers((memberships.memberships || []).map((membership: any) => ({
        ...membership,
        $id: membership.$id,
        email: membership.userEmail,
        name: membership.userName,
        role: membership.roles?.[0] || 'member',
        orgId,
        permissions: membership.roles?.includes('owner') ? ADMIN_PERMISSIONS : MEMBER_PERMISSIONS,
        status: membership.confirm ? 'accepted' : 'pending',
      })) as OrgInvite[]);
    } catch (err) {
      console.error('Error fetching team memberships', err);
      return [];
    }
  };


  const addTeam = async (payload: CreateTeamPayload) => {
    if (!currentOrg) throw new Error('No organization selected');
    setLoading(true);
    try {
      const newTeam: Team = { $id: ID.unique(), name: payload.name, members: payload.members || [] };
      toast.success('Team added');
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
      toast.success('Team removed');
      return true;
    } catch (err) {
      console.error('Error removing team', err);
      toast.error('Failed to remove team');
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
      
      try {
        await teams.createMembership({
          teamId: orgId,
          roles: invite.roles?.includes('owner') ? ['owner'] : invite.roles?.includes('admin') ? ['admin'] : ['member'],
          email: invite.email,
          url: `https://flashtasks.app/account/notifications?teamId=${encodeURIComponent(orgId)}`,
        });
        toast.success('Invite sent');
        getAllInvitedMembers(orgId);
        return true;
      } catch (err) {
        console.warn('Could not add member to team:', err);
        // Continue anyway - member might already be added
      }
    } catch (err) {
      console.error('Error creating team in Appwrite:', err);
      toast.error('Failed to create organization');
      return false;
    }
  };

  const removeMemberFromOrg = async (orgId: string, memberId: string) => {
    setLoading(true);
    try {
      await teams.deleteMembership({ teamId: orgId, membershipId: memberId });
      getAllInvitedMembers(orgId);
      toast.success('Member removed');
      return true;
    } catch (err) {
      console.error('Error removing member', err);
      toast.error('Failed to remove member');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTeamMember = async (orgId: string, memberId: string, roles: string[]) => {
    setLoading(true);
    try {
      await teams.updateMembership({
        teamId: orgId,
        membershipId: memberId,  
        roles: roles
      });
      getAllInvitedMembers(orgId);
      toast.success('Team updated');
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
    <OrganizationContext.Provider 
      value={{ 
        organizations, 
        currentOrg, 
        invitedMembers,
        loading, 
        createOrganization, 
        selectOrganization, 
        addTeam, 
        removeTeam, 
        getAllInvitedMembers,
        createOrgInvite, 
        updateOrganization, 
        deleteOrganization, 
        removeMemberFromOrg, 
        updateTeamMember, 
      }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export default OrganizationContext;
