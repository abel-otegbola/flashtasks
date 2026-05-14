'use client';
import { useEffect, useState } from 'react';
import { XIcon } from '@phosphor-icons/react';
import { useOutsideClick } from '../../customHooks/useOutsideClick';
import Button from '../button/button';
import Input from '../input/input';
import Dropdown from '../dropdown/dropdown';
import { ADMIN_PERMISSIONS, MEMBER_PERMISSIONS, OrgInvite } from '../../interface/organization';
import { useOrganizations } from '../../context/organizationContext';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: any;
}

const roleOptions = [
  { id: 'admin', title: 'admin' },
  { id: 'member', title: 'member' },
];

const normalizeMember = (member: any) => {
  if (typeof member === 'string') {
    return { $id: member, name: member, email: member, roles: [] };
  }

  return {
    ...member,
    $id: member?.$id || member?.userId || member?.email,
    name: member?.name || member?.fullname || member?.email || member?.$id || member?.userId || '',
    email: member?.email || member?.userId || member?.$id || '',
    roles: Array.isArray(member?.roles) ? member.roles : [],
  };
};

export default function AddMemberModal({ isOpen, onClose, member }: AddMemberModalProps) {
  const { currentOrg, createOrgInvite, updateTeamMember, loading } = useOrganizations();
  const modalRef = useOutsideClick(onClose, false);
  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState<string>("member");
  const [error, setError] = useState('');
  const initialMember = member ? normalizeMember(member) : null;
  const editingMember = Boolean(initialMember?.$id);

  useEffect(() => {
    if (!isOpen) return;
    
    if (initialMember) {
      setEmail(initialMember.email || '');
      setRoles(initialMember.roles[0]);
    } else {
      setEmail('');
      setRoles('member');
    }
    setError('');
  }, [isOpen, member]);

  if (!isOpen || !currentOrg) return null;

  const handleSubmit = async () => {
    const nextEmail = email.trim().toLowerCase();

    if (!nextEmail) {
      setError('Email is required.');
      return;
    }
    const invite: Omit<OrgInvite, '$id' | 'status' | 'orgId' | 'orgName' | 'createdAt' | 'acceptedAt' | 'inviterEmail'> = {
      email: nextEmail,
      roles: [roles],
    };
    if (editingMember) {
      await updateTeamMember(currentOrg.$id, initialMember.$id, invite.roles);
      onClose();
      return;
    }
    else {
      const invited = await createOrgInvite(currentOrg.$id, invite);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 dark:bg-black/30 backdrop-blur-xs px-4">
      <div ref={modalRef} className="w-full sm:w-2xl w-full max-h-[85vh] overflow-y-auto rounded-lg border border-gray-500/[0.2] bg-white shadow-xl dark:bg-dark-bg">
        <div className="sticky top-0 z-[2] flex items-center justify-between border-b border-gray-500/[0.1] bg-white p-4 dark:bg-dark-bg">
          <h2 className="px-2 leading-4 opacity-[0.7]">{editingMember ? 'Edit member' : 'Invite member'}</h2>
          <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-dark-bg">
            <XIcon size={16} />
          </button>
        </div>

        <div className="space-y-4 p-6 pb-24">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Email</label>
            <Input value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="Member email" disabled={editingMember} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Role</label>
            <Dropdown
              value={roles}
              onChange={(value) => setRoles(value)}
              options={roleOptions}
              placeholder="Select role"
            />
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="font-medium">Permissions</h3>
              <p className="text-xs text-gray-500">Actions that can be carried out by this member.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {(roles === 'admin' ? ADMIN_PERMISSIONS : MEMBER_PERMISSIONS).map((permission) => {
                const checked = roles.includes(permission);
                const disabledToggle = permission === 'Invite/remove members';

                return (
                  <label
                    key={permission}
                    className={`flex items-start gap-3 rounded-lg border border-gray-500/[0.1] p-3 transition-colors ${disabledToggle ? 'opacity-60' : 'hover:bg-gray-500/[0.03]'}`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{permission}</div>
                      <div className="text-xs text-gray-500">
                        {permission === 'Invite/remove members' && 'Invite or remove people from the organization.'}
                        {permission === 'Create/edit/delete all tasks' && 'Manage every task in the organization.'}
                        {permission === 'Manage projects' && 'Create and manage shared projects.'}
                        {permission === 'Assign tasks' && 'Assign work to other members.'}
                        {permission === 'Create tasks' && 'Create new tasks for yourself or the team.'}
                        {permission === 'Edit their own tasks' && 'Update the tasks you created.'}
                        {permission === 'Complete tasks' && 'Mark tasks as finished.'}
                        {permission === 'View shared tasks/projects' && 'See shared workspaces and tasks.'}
                        {permission === 'Edit tasks assigned to them' && 'Modify tasks assigned directly to them.'}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-500/[0.2] bg-white p-6 py-4 dark:bg-dark-bg">
          <Button variant="secondary" size="small" onClick={onClose}>Close</Button>
          <Button onClick={handleSubmit} size="small" disabled={loading}>{loading ? 'Saving...' : editingMember ? 'Save changes' : 'Send invite'}</Button>
        </div>
      </div>
    </div>
  );
}
