"use client";
import React, { useState } from 'react';
import { useOrganizations } from '../../../context/organizationContext';
import Button from '../../../components/button/button';
import Input from '../../../components/input/input';
import CreateOrganizationModal from '../../../components/modals/createOrganizationModal';
import EditOrganizationModal from '../../../components/modals/editOrganizationModal';
import { Formik } from 'formik';
import { createOrganizationSchema } from '../../../schema/organizationSchema';
import { GridFourIcon, PencilSimpleLineIcon, TrashIcon } from '@phosphor-icons/react';
import { OrganizationSkeletonLoader } from '../../../components/skeletons';

export default function OrganizationsPage() {
  const { organizations, currentOrg, selectOrganization, addTeam, removeTeam, loading } = useOrganizations();
  const [teamName, setTeamName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);

  const handleAddTeam = async () => {
    if (!teamName || !currentOrg) return;
    await addTeam({ name: teamName });
    setTeamName('');
  };

  if (loading) {
    return <OrganizationSkeletonLoader />;
  }

  return (
    <div className="md:p-0 px-4">
      <div className="flex items-center justify-between mb-4 bg-white dark:bg-dark-bg p-4 rounded-lg border border-gray-500/[0.1] dark:border-gray-500/[0.2]">
        <h1 className="text-2xl font-semibold">Organizations</h1>
        <Button onClick={() => setShowCreate(true)} size="small">Create Organization</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 h-full bg-white dark:bg-dark-bg border border-gray-500/[0.1] dark:border-gray-500/[0.2] rounded-lg">
        <div className="col-span-1 md:p-6 p-4">
          <h3 className="mb-2 text-sm text-gray-400">Your organizations</h3>
          <div className="flex flex-col gap-2">
            {organizations.length === 0 && <div className="text-gray-500">No organizations yet</div>}
            {organizations.map(org => (
              <button 
                key={org.$id} 
                className={`p-3 text-start flex items-center gap-2 rounded-lg border ${currentOrg?.$id === org.$id ? 'border-primary bg-bg-gray-100' : 'border-border-gray-100'}`}
                onClick={() => { selectOrganization(org.$id); setSelectedOrg(org); }} 
              >
                <span className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-full font-bold">{org.name.charAt(0).toUpperCase()}</span>
                <div className="flex flex-col gap-2 text-start justify-start">
                    <div className="font-medium">{org.name}</div>
                    <div className="text-xs text-gray-500">{org.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-2 md:border-l border-gray-500/[0.1] dark:border-gray-500/[0.2] md:p-6 p-4">
          {!currentOrg ? (
            <div className="text-gray-500">Select an organization to manage teams and members.</div>
          ) : (
            <div className="py-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold">{currentOrg.name}</h2>
                  <div className="text-xs text-gray-500">{currentOrg.description}</div>
                </div>
                <div>
                  <button className='p-2 border border-gray-500/[0.1] rounded' onClick={() => { setSelectedOrg(currentOrg); setShowEdit(true); }}>
                    <PencilSimpleLineIcon size={14} />
                  </button>
                </div>
              </div>

              <div className="mb-4 border border-gray-500/[0.1] rounded-lg">
                <div className="flex justify-between items-center gap-2 p-4 border-b border-gray-500/[0.1]">
                <h4 className="text-sm font-medium">Teams</h4>
                  {/* <Input value={teamName} className='flex-1 py-[2px]' leftIcon={<GridFourIcon />} onKeyDown={(e) => (["Enter"].includes(e.key)) ? handleAddTeam : {}} onChange={(e:any) => setTeamName(e.target.value)} placeholder="Add team and press Enter" /> */}
                </div>
                <div className="flex flex-col gap-2 p-4">
                  {(currentOrg.teams || []).map(team => (
                    <div key={team.$id} className="flex items-center justify-between p-2 border border-gray-500/[0.2] rounded">
                      <div>{team.name}</div>
                      <div className="flex gap-2">
                        <button onClick={() => removeTeam(currentOrg.$id, team.$id)}><TrashIcon color='red' size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-500/[0.1] rounded-lg">
                <h4 className="text-sm font-medium p-4 border-b border-gray-500/[0.1]">Members</h4>
                <div className="flex flex-col gap-2 p-4">
                  {(currentOrg.members || []).map(m => (
                    <div key={m.$id} className="flex items-center justify-between p-2 border border-gray-500/[0.2] rounded">
                      <div>
                        <div className="font-medium">{m.name || m.email}</div>
                        <div className="text-xs text-gray-500">{m.role}</div>
                      </div>
                      <div className="text-xs text-gray-400">{m.email}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    <CreateOrganizationModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    <EditOrganizationModal isOpen={showEdit} onClose={() => setShowEdit(false)} org={selectedOrg} />
  </div>
  )
}
