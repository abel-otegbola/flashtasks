'use client';
import { useEffect, useState } from 'react';
import { XIcon } from '@phosphor-icons/react';
import { useOutsideClick } from '../../customHooks/useOutsideClick';
import Button from '../button/button';
import Input from '../input/input';
import Dropdown from '../dropdown/dropdown';
import TaskCheckbox from '../ui/taskCheckbox';
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
    return { $id: member, name: member, email: member, role: 'member', permissions: [] };
  }

  return {
    ...member,
    $id: member?.$id || member?.userId || member?.email,
    name: member?.name || member?.fullname || member?.email || member?.$id || member?.userId || '',
    email: member?.email || member?.userId || member?.$id || '',
    role: member?.role || 'member',
    permissions: Array.isArray(member?.permissions) ? member.permissions : [],
  };
};

export default function AddMemberModal({ isOpen, onClose, member }: AddMemberModalProps) {
  const { currentOrg, createOrgInvite, updateOrganization, loading } = useOrganizations();
  const modalRef = useOutsideClick(onClose, false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [permissions, setPermissions] = useState<string[]>(MEMBER_PERMISSIONS);
  const [error, setError] = useState('');
  const initialMember = member ? normalizeMember(member) : null;
  const editingMember = Boolean(initialMember?.$id);

  useEffect(() => {
    if (!isOpen) return;
    if (initialMember) {
      setName(initialMember.name || '');
      setEmail(initialMember.email || '');
      setRole((initialMember.role as 'admin' | 'member') || 'member');
      setPermissions(initialMember.permissions?.length ? initialMember.permissions : defaultPermissionsForRole(initialMember.role || 'member'));
    } else {
      setName('');
      setEmail('');
      setRole('member');
      setPermissions(MEMBER_PERMISSIONS);
    }
    setError('');
  }, [isOpen, member]);

  if (!isOpen || !currentOrg) return null;

  const defaultPermissionsForRole = (nextRole: string) => (nextRole === 'admin' ? ADMIN_PERMISSIONS : MEMBER_PERMISSIONS);

  const handleRoleChange = (nextRole: string) => {
    setRole(nextRole);
    setPermissions(defaultPermissionsForRole(nextRole));
  };

  const togglePermission = (permission: string) => {
    setPermissions((prev) =>
      prev.includes(permission) ? prev.filter((item) => item !== permission) : [...prev, permission]
    );
  };

  const handleSubmit = async () => {
    const nextName = name.trim();
    const nextEmail = email.trim().toLowerCase();

    if (!nextName || !nextEmail) {
      setError('Name and email are required.');
      return;
    }

    if (editingMember && initialMember) {
      const nextMembers = (currentOrg.members || []).map((item) => {
        const normalized = normalizeMember(item);
        if (normalized.$id !== initialMember.$id) return item;

        return {
          ...normalized,
          name: nextName,
          email: nextEmail,
          role: role as 'admin' | 'member',
          permissions,
        };
      });

      await updateOrganization(currentOrg.$id, { members: nextMembers });
      onClose();
      return;
    }

    const invite: Omit<OrgInvite, '$id' | 'status' | 'orgId' | 'orgName' | 'createdAt' | 'acceptedAt' | 'inviterEmail'> = {
      name: nextName,
      email: nextEmail,
      role: role as 'admin' | 'member',
      permissions,
    };

    const invited = await createOrgInvite(currentOrg.$id, invite);
    if (!invited) {
      setError('Failed to send invite.');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
      <div ref={modalRef} className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-lg border border-gray-500/[0.2] bg-white shadow-xl dark:bg-dark-bg">
        <div className="sticky top-0 z-[2] flex items-center justify-between border-b border-gray-500/[0.1] bg-white p-4 dark:bg-dark-bg">
          <h2 className="px-2 leading-4 opacity-[0.7]">{editingMember ? 'Edit member' : 'Invite member'}</h2>
          <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-dark-bg">
            <XIcon size={16} />
          </button>
        </div>

        <div className="space-y-4 p-6 pb-24">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={name} onChange={(e: any) => setName(e.target.value)} placeholder="Member name" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="Member email" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Role</label>
            <Dropdown
              value={role}
              onChange={handleRoleChange}
              options={roleOptions}
              placeholder="Select role"
            />
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium">Permissions</h3>
              <p className="text-xs text-gray-500">Toggle the capabilities this member should have.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {(role === 'admin' ? ADMIN_PERMISSIONS : MEMBER_PERMISSIONS).map((permission) => {
                const checked = permissions.includes(permission);

                return (
                  <label
                    key={permission}
                    className="flex items-start gap-3 rounded-lg border border-gray-500/[0.1] p-3 transition-colors hover:bg-gray-500/[0.03]"
                  >
                    <TaskCheckbox
                      checked={checked}
                      ariaLabel={permission}
                      onCheckedChange={() => togglePermission(permission)}
                      className="mt-0.5"
                    />
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
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : editingMember ? 'Save changes' : 'Send invite'}</Button>
        </div>
      </div>
    </div>
  );
}
