'use client'
import { createContext, useContext, ReactNode, useState } from 'react';
import { ADMIN_PERMISSIONS, MEMBER_PERMISSIONS, Organization, OrgInvite, OrgMember, Team, CreateOrganizationPayload, CreateTeamPayload, ChatMessage } from '../interface/organization';
import { databases, teams as appwriteTeams } from '../appwrite/appwrite';
import { ID, Query } from 'appwrite';
import toast from 'react-hot-toast';
import { useUser } from './authContext';
import { sendTeamInvitationEmail } from '../services/email';
import { AutomationReminderRecord, AutomationRunRecord } from '../services/automation';

type OrganizationContextValues = {
  organizations: Organization[];
  currentOrg?: Organization | null;
  teams: Team[];
  messages: ChatMessage[];
  invitedMembers: OrgInvite[];
  automations: AutomationRunRecord[];
  reminders: AutomationReminderRecord[];
  loading: boolean;
  loadMessages: (orgId: string) => Promise<ChatMessage[]>;
  sendMessage: (orgId: string, payload: { text?: string; attachments?: string[] }) => Promise<ChatMessage | null>;
  uploadFile: (file: File) => Promise<{ url: string } | null>;
  loadOrganizations: () => void;
  createOrganization: (payload: CreateOrganizationPayload) => void;
  selectOrganization: (orgId: string) => void;
  loadTeams: (orgId: string) => Promise<Team[]>;
  addTeam: (payload: CreateTeamPayload) => Promise<Team>;
  removeTeam: (orgId: string, teamId: string) => Promise<boolean>;
  getAllInvitedMembers: (orgId: string) => void;
  createOrgInvite: (orgId: string, invite: Omit<OrgInvite, '$id' | 'status' | 'orgId' | 'orgName' | 'createdAt' | 'acceptedAt' | 'inviterEmail'>) => void;
  updateOrganization: (orgId: string, data: Partial<any>) => void;
  updateTeam: (teamId: string, data: Partial<Team>) => Promise<Team | null>;
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
  const [teams, setTeams] = useState<Team[]>([]);
  const [invitedMembers, setInvitedMembers] = useState<OrgInvite[]>([]);
  const [automations, setAutomations] = useState<AutomationRunRecord[]>([]);
  const [reminders, setReminders] = useState<AutomationReminderRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '';
  const TEAM_COLLECTION_ID = import.meta.env.VITE_APPWRITE_TEAMS_COLLECTION_ID || 'teams';
  const MESSAGES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID || 'chats';

  const serializeJson = (value: unknown) => {
    if (typeof value === 'string') return value;
    return JSON.stringify(value ?? null);
  };

  const deserializeJson = (value: unknown) => {
    if (value == null) return null;
    if (typeof value !== 'string') return value;

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  const normalizeTeam = (team: any): Team => ({
    $id: team.$id,
    title: team.title || team.name || '',
    description: team.description || '',
    userId: team.userId || '',
    orgId: team.orgId || '',
    userEmail: team.userEmail || '',
    activities: deserializeJson(team.activities) ?? [],
    members: Array.isArray(team.members)
      ? team.members
      : deserializeJson(team.members) || [],
    $createdAt: team.$createdAt,
    $updatedAt: team.$updatedAt,
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const normalizeMessage = (doc: any): ChatMessage => ({
    $id: doc.$id,
    orgId: doc.orgId,
    userId: doc.userId,
    userEmail: doc.userEmail,
    text: doc.text || '',
    attachments: Array.isArray(deserializeJson(doc.attachments)) ? deserializeJson(doc.attachments) as string[] : [],
    $createdAt: doc.$createdAt,
  });

  const loadMessages = async (orgId: string) => {
    if (!orgId) return [];
    try {
      const response = await databases.listDocuments(DATABASE_ID, MESSAGES_COLLECTION_ID, [
        Query.equal('orgId', [orgId]),
        Query.orderAsc('$createdAt'),
      ]);
      const next = (response.documents || []).map(normalizeMessage) as ChatMessage[];
      setMessages(next);
      return next;
    } catch (err) {
      console.error('Error loading messages', err);
      return [];
    }
  };

  const sendMessage = async (orgId: string, payload: { text?: string; attachments?: string[] }) => {
    if (!orgId) return null;
    try {
      const response = await databases.createDocument(DATABASE_ID, MESSAGES_COLLECTION_ID, ID.unique(), {
        orgId,
        userId: user?.$id || '',
        userEmail: user?.email || '',
        text: payload.text || '',
        attachments: serializeJson(payload.attachments || []),
      });
      const message = normalizeMessage(response);
      setMessages((prev) => [...prev, message]);
      return message;
    } catch (err) {
      console.error('Error sending message', err);
      return null;
    }
  };

  const uploadFile = async (file: File) => {
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/cloudinary/upload', { method: 'POST', body: form });
      if (!res.ok) return null;
      const json = await res.json();
      return { url: json.secure_url || json.url };
    } catch (err) {
      console.error('Upload failed', err);
      return null;
    }
  };
  
  const loadOrganizations = async () => {
    if (!user?.$id || !user?.email) {
      setOrganizations([]);
      setCurrentOrg(null);
      setTeams([]);
      return;
    }

    try {
      const response = await appwriteTeams.list();
      const nextOrganizations = (response.teams || []).map((team: any) => ({
        $id: team.$id,
        name: team.name,
        total: team.total || team.membersCount || team.memberships || team.members?.length || 0,
        $createdAt: team.$createdAt,
        $updatedAt: team.$updatedAt,
      }));

      setOrganizations(nextOrganizations as Organization[]);
      setCurrentOrg((previous) => {
        if (previous && nextOrganizations.some((org: Organization) => org.$id === previous.$id)) {
          return previous;
        }

        return nextOrganizations[0] || null;
      });
    } catch (err) {
      console.error("Error loading organizations", err);
      toast.error("Failed to load organizations");
    }
  };

  const createOrganization = async (payload: CreateOrganizationPayload) => {
    setLoading(true);
    try {
      const team = await appwriteTeams.create({ teamId: ID.unique(), name: payload.name, roles: ['owner'] });

      const newOrg: Organization = {
        $id: team.$id,
        name: team.name,
        total: 1,
        $createdAt: team.$createdAt,
        $updatedAt: team.$updatedAt,
      };

      setOrganizations(prev => [newOrg, ...prev]);
      setCurrentOrg(newOrg);
      toast.success('Organization created');
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
      // If name is being updated, also update the Appwrite team
      if (data.name) {
        try {
          await appwriteTeams.updateName({ teamId: orgId, name: data.name });
          await loadOrganizations();
          toast.success('Organization updated');
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
      await appwriteTeams.delete({ teamId: orgId });

      const remainingOrganizations = organizations.filter((org) => org.$id !== orgId);
      setOrganizations(remainingOrganizations);
      setCurrentOrg(remainingOrganizations[0] || null);
      setTeams((previous) => previous.filter((team) => team.orgId !== orgId));

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

  const loadTeams = async (orgId: string) => {
    if (!orgId) {
      setTeams([]);
      return [];
    }

    try {
      const response = await databases.listDocuments(DATABASE_ID, TEAM_COLLECTION_ID, [
        Query.equal('orgId', [orgId]),
        Query.orderDesc('$createdAt'),
      ]);

      const nextTeams = (response.documents || []).map(normalizeTeam) as Team[];
      setTeams(nextTeams);
      return nextTeams;
    } catch (err) {
      console.error('Error loading teams', err);
      toast.error('Failed to load teams');
      return [];
    }
  };

  const getAllInvitedMembers = async (orgId: string) => {
    try {
      const memberships = await appwriteTeams.listMemberships({ teamId: orgId });

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
    const orgId = payload.orgId || currentOrg?.$id;
    if (!orgId) throw new Error('No organization selected');
    setLoading(true);
    try {
      const response = await databases.createDocument(DATABASE_ID, TEAM_COLLECTION_ID, ID.unique(), {
        title: payload.title,
        description: payload.description || '',
        userId: payload.userId || user?.$id || '',
        orgId,
        userEmail: payload.userEmail || user?.email || '',
        activities: serializeJson(payload.activities ?? []),
        members: payload.members?.length ? payload.members : [user?.$id].filter(Boolean),
      });

      const newTeam = normalizeTeam(response);
      setTeams((previous) => [newTeam, ...previous.filter((team) => team.$id !== newTeam.$id)]);
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
      await databases.deleteDocument(DATABASE_ID, TEAM_COLLECTION_ID, teamId);
      setTeams((previous) => previous.filter((team) => team.$id !== teamId));
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
        await appwriteTeams.createMembership({
          teamId: orgId,
          roles: invite.roles?.includes('owner') ? ['owner'] : invite.roles?.includes('admin') ? ['admin'] : ['member'],
          email: invite.email,
          url: `https://flashtasks.app/account/invitation/accept?teamId=${encodeURIComponent(orgId)}`,
        });

        const organizationName = org?.name || 'Flashtasks';
        const inviterName = user?.name || user?.email || 'A teammate';
        const inviteLink = `https://flashtasks.app/account/invitation/accept?teamId=${encodeURIComponent(orgId)}`;

        sendTeamInvitationEmail({
          to: invite.email,
          organizationName,
          inviterName: String(inviterName),
          inviteLink,
          role: String(invite.roles?.[0] || 'member'),
        }).catch((emailError) => {
          console.warn('Could not send custom team invitation email:', emailError);
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
      await appwriteTeams.deleteMembership({ teamId: orgId, membershipId: memberId });
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
      await appwriteTeams.updateMembership({
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

  const updateTeam = async (teamId: string, data: Partial<Team>) => {
    setLoading(true);
    try {
      const { $id, $createdAt, $updatedAt, activities, ...updateData } = data as any;
      const response = await databases.updateDocument(DATABASE_ID, TEAM_COLLECTION_ID, teamId, {
        ...updateData,
        ...(activities !== undefined ? { activities: serializeJson(activities) } : {}),
      });
      const updatedTeam = normalizeTeam(response);
      setTeams((previous) => previous.map((team) => team.$id === teamId ? updatedTeam : team));
      toast.success('Team updated');
      return updatedTeam;
    } catch (err) {
      console.error('Error updating team', err);
      toast.error('Failed to update team');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrganizationContext.Provider 
      value={{ 
        organizations, 
        currentOrg, 
        teams,
        messages,
        invitedMembers,
        automations,
        reminders,
        loading, 
        loadOrganizations,
        createOrganization, 
        selectOrganization, 
        loadTeams,
        addTeam, 
        removeTeam, 
        getAllInvitedMembers,
        createOrgInvite, 
        updateOrganization, 
        updateTeam,
        deleteOrganization, 
        removeMemberFromOrg, 
        updateTeamMember, 
        loadMessages,
        sendMessage,
        uploadFile,
      }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export default OrganizationContext;
