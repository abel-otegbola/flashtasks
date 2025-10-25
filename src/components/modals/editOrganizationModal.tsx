'use client'
import React, { useEffect, useState } from 'react';
import Button from '../button/button';
import Input from '../input/input';
import { Organization, OrgMember, Team } from '../../interface/organization';
import { ID } from 'appwrite';
import { useOrganizations } from '../../context/organizationContext';
import { CloseCircle } from '@solar-icons/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  org?: Organization | null;
}

export default function EditOrganizationModal({ isOpen, onClose, org }: Props) {
  const { updateOrganization } = useOrganizations();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!org) return;
    setName(org.name || '');
    setDescription(org.description || '');
    setMembers((org.members || []).map(m => ({ ...m })));
    setTeams((org.teams || []).map(t => ({ ...t })));
  }, [org]);

  if (!isOpen || !org) return null;

  const handleAddMember = () => {
    if (!newMemberEmail.trim()) return;
    const id = ID.unique();
    const mem: OrgMember = { $id: id, email: newMemberEmail.trim(), name: newMemberEmail.split('@')[0], role: 'member' };
    setMembers(prev => [...prev, mem]);
    setNewMemberEmail('');
  };

  const handleRemoveMember = (memberId: string) => {
    // Prevent removing owner
    const m = members.find(x => x.$id === memberId);
    if (m && m.role === 'owner') return;
    setMembers(prev => prev.filter(x => x.$id !== memberId));
  };

  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;
    const t: Team = { $id: ID.unique(), name: newTeamName.trim(), members: [] };
    setTeams(prev => [...prev, t]);
    setNewTeamName('');
  };

  const handleRemoveTeam = (teamId: string) => {
    setTeams(prev => prev.filter(t => t.$id !== teamId));
  };

  const handleToggleTeamMember = (teamId: string, memberId: string) => {
    setTeams(prev => prev.map(t => {
      if (t.$id !== teamId) return t;
      const has = (t.members || []).includes(memberId);
      return { ...t, members: has ? (t.members || []).filter(m => m !== memberId) : [...(t.members || []), memberId] };
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // normalize members and teams
      const membersPayload = members.map(m => ({ $id: m.$id || ID.unique(), name: m.name || '', email: m.email || '', role: m.role || 'member' }));
      const teamsPayload = teams.map(t => ({ $id: t.$id || ID.unique(), name: t.name, members: t.members || [] }));

      await updateOrganization(org.$id, { name: name.trim(), description: description.trim(), members: membersPayload, teams: teamsPayload });
      onClose();
    } catch (e) {
      // errors handled in context
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#0b0b0b] rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-[#0b0b0b] border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Organization</h2>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary rounded-lg">
                <CloseCircle size={20} color='currentColor' />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className='flex flex-col gap-2'>
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e:any) => setName(e.target.value)} placeholder="Organization name" />
          </div>

          <div className='flex flex-col gap-2'>
            <label className="text-sm font-medium">Description</label>
            <textarea value={description} onChange={(e:any) => setDescription(e.target.value)} className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-bg outline-none" />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Members</h4>
            <div className="flex gap-2 mb-3">
              <Input value={newMemberEmail} onChange={(e:any) => setNewMemberEmail(e.target.value)} placeholder="email@example.com" />
              <Button onClick={handleAddMember}>Add member</Button>
            </div>
            <div className="flex flex-col gap-2">
              {members.map(m => (
                <div key={m.$id} className="flex items-center justify-between p-2 border border-gray-500/[0.2] rounded">
                  <div>
                    <div className="font-medium">{m.name || m.email}</div>
                    <div className="text-xs text-gray-500">{m.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={m.role} onChange={(e:any) => setMembers(prev => prev.map(x => x.$id === m.$id ? { ...x, role: e.target.value } : x))} className="p-1 border rounded">
                      <option value="owner">owner</option>
                      <option value="admin">admin</option>
                      <option value="member">member</option>
                    </select>
                    <Button variant="secondary" size='small' onClick={() => handleRemoveMember(m.$id)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Teams</h4>
            <div className="flex gap-2 mb-3">
              <Input value={newTeamName} onChange={(e:any) => setNewTeamName(e.target.value)} placeholder="Team name" />
              <Button onClick={handleAddTeam}>Add team</Button>
            </div>
            <div className="flex flex-col gap-3">
              {teams.map(team => (
                <div key={team.$id} className="p-3 border border-gray-500/[0.2] rounded">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{team.name}</div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size='small' onClick={() => handleRemoveTeam(team.$id)}>Remove</Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Members</div>
                  <div className="flex flex-wrap gap-2">
                    {members.map(mm => (
                      <label key={mm.$id} className={`p-2 border rounded cursor-pointer ${ (team.members || []).includes(mm.$id) ? 'bg-primary/10 border-primary' : ''}`}>
                        <input type="checkbox" checked={(team.members || []).includes(mm.$id)} onChange={() => handleToggleTeamMember(team.$id, mm.$id)} className="mr-2" />
                        {mm.name || mm.email}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-[#0b0b0b] border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-3">
          <span tabIndex={1} className='p-4 cursor-pointer' onClick={onClose}>Close</span>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
        </div>
      </div>
    </div>
  );
}
