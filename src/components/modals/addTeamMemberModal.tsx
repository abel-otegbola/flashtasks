'use client';
import { useEffect, useState } from 'react';
import { XIcon } from '@phosphor-icons/react';
import { useOutsideClick } from '../../customHooks/useOutsideClick';
import Button from '../button/button';
import { useOrganizations } from '../../context/organizationContext';
import { Team } from '../../interface/organization';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  team?: Team | null;
}

export default function AddTeamMemberModal({ isOpen, onClose, team }: Props) {
  const { invitedMembers, updateTeam, loading } = useOrganizations();
  const modalRef = useOutsideClick(onClose, false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedMembers(team?.members || []);
  }, [isOpen, team]);

  if (!isOpen || !team) return null;

  const toggleMember = (memberId: string, checked: boolean) => {
    setSelectedMembers((previous) => checked
      ? [...previous, memberId]
      : previous.filter((id) => id !== memberId));
  };

  const handleSubmit = async () => {
    await updateTeam(team.$id, {
      members: selectedMembers,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs px-4">
      <div ref={modalRef} className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-lg border border-gray-500/[0.2] bg-white shadow-xl dark:bg-dark">
        <div className="sticky top-0 z-[2] flex items-center justify-between border-b border-gray-500/[0.1] bg-white p-4 dark:bg-dark">
          <h2 className="px-2 leading-4 opacity-[0.7]">Add members to team</h2>
          <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-dark-bg">
            <XIcon size={16} />
          </button>
        </div>

        <div className="space-y-4 p-6 pb-24">
          <div>
            <h3 className="font-medium">{team.title}</h3>
            {team.description ? <p className="text-sm text-gray-500 mt-1">{team.description}</p> : null}
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-medium">Team members</h4>
              <p className="text-xs text-gray-500">Select organization members to include in this team.</p>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {(invitedMembers || []).map((member) => {
                const checked = selectedMembers.includes(member.$id);
                return (
                  <label key={member.$id} className="flex items-center gap-3 rounded border border-gray-500/[0.1] p-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => toggleMember(member.$id, event.target.checked)}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{member.name || member.email}</div>
                      <div className="text-xs text-gray-500 truncate">{member.email}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-center gap-3 border-t border-gray-500/[0.2] bg-white p-6 py-4 dark:bg-dark">
          <Button variant="secondary" size="small" onClick={onClose}>Close</Button>
          <Button onClick={handleSubmit} size="small" disabled={loading}>
            {loading ? 'Saving...' : 'Save members'}
          </Button>
        </div>
      </div>
    </div>
  );
}