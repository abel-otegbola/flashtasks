"use client";
import { useEffect, useState } from 'react';
import { useOrganizations } from '../../../context/organizationContext';
import Button from '../../../components/button/button';
import Input from '../../../components/input/input';
import CreateOrganizationModal from '../../../components/modals/createOrganizationModal';
import EditOrganizationModal from '../../../components/modals/editOrganizationModal';
import AddMemberModal from '../../../components/modals/addMemberModal';
import { GridFourIcon, PencilSimpleLineIcon, TrashIcon } from '@phosphor-icons/react';
import { OrganizationSkeletonLoader } from '../../../components/skeletons';
import Confirmationmessage from '../../../components/modals/confirmation';
import { ADMIN_PERMISSIONS } from '../../../interface/organization';
import { useUser } from '../../../context/authContext';
import { useTasks } from '../../../context/tasksContext';
import TaskListView from '../../../components/cards/taskListView';
import { todo } from '../../../interface/todo';
import TaskDetailsModal from '../../../components/modals/taskDetailsModal';

export default function OrganizationsPage() {
  const { organizations, currentOrg, selectOrganization, addTeam, removeTeam, removeMemberFromOrg, updateOrganization, deleteOrganization, loading } = useOrganizations();
  const { tasks, getTasks } = useTasks(); 
  const [teamName, setTeamName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState("Tasks");
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState('');
  const [editingTeamMembers, setEditingTeamMembers] = useState<string[]>([]);
  const [settingsName, setSettingsName] = useState('');
  const [settingsSlug, setSettingsSlug] = useState('');
  const [settingsDescription, setSettingsDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<todo | null>(null);
  const { user } = useUser();

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
      permissions: member?.permissions || [],
    };
  };

  useEffect(() => {
  if (user) {
      getTasks(user.email || "");
  }
  }, [user]);

  const initialLoading = loading && organizations.length === 0 && !currentOrg;

  const organizationMembers = currentOrg
    ? [
        ...(currentOrg.members || []).map(normalizeMember),
        ...(currentOrg.ownerEmail && !(currentOrg.members || []).some((member) => normalizeMember(member).email === currentOrg.ownerEmail)
          ? [{ $id: currentOrg.ownerEmail, name: currentOrg.ownerEmail, email: currentOrg.ownerEmail, role: 'owner' as const, permissions: ADMIN_PERMISSIONS }]
          : []),
      ]
    : [];

  useEffect(() => {
    if (!currentOrg) return;
    setSettingsName(currentOrg.name || '');
    setSettingsSlug(currentOrg.slug || '');
    setSettingsDescription(currentOrg.description || '');
  }, [currentOrg]);

  const isOwner = currentOrg?.ownerEmail === user?.email;

  const isAdmin = currentOrg?.members?.some((member) => normalizeMember(member).email === user?.email && normalizeMember(member).role === 'admin');

  const openTaskDetails = (task: todo) => {
      setSelectedTask(task);
      setDetailsOpen(true);
  };

  const getTeamMemberLabel = (memberId: string) => {
    const member = organizationMembers.find((item) => item.$id === memberId);
    return member?.name || member?.email || memberId;
  };

  const openTeamEditor = (team: any) => {
    setEditingTeamId(team.$id);
    setEditingTeamName(team.name || '');
    setEditingTeamMembers(team.members || []);
  };

  const closeTeamEditor = () => {
    setEditingTeamId(null);
    setEditingTeamName('');
    setEditingTeamMembers([]);
  };

  const handleSaveTeam = async () => {
    if (!currentOrg || !editingTeamId) return;

    const nextTeams = (currentOrg.teams || []).map((team) => {
      if (team.$id !== editingTeamId) return team;

      return {
        ...team,
        name: editingTeamName.trim() || team.name,
        members: editingTeamMembers,
      };
    });

    await updateOrganization(currentOrg.$id, { teams: nextTeams });
    closeTeamEditor();
  };

  const handleAddTeam = async () => {
    if (!teamName || !currentOrg) return;
    await addTeam({ name: teamName });
    setTeamName('');
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!currentOrg) return;
    await removeMemberFromOrg(currentOrg.$id, memberId);
  };

  const handleSaveSettings = async () => {
    if (!currentOrg) return;

    const nextName = settingsName.trim();
    const nextSlug = settingsSlug.trim() || nextName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    await updateOrganization(currentOrg.$id, {
      name: nextName,
      slug: nextSlug,
      description: settingsDescription.trim(),
    });
  };

  const handleCopyOrganizationId = async () => {
    if (!currentOrg?.$id || !navigator.clipboard) return;
    await navigator.clipboard.writeText(currentOrg.$id);
  };

  const handleDeleteOrganization = async () => {
    if (!currentOrg) return;
    await deleteOrganization(currentOrg.$id);
    setShowDeleteConfirm(false);
  };

  if (initialLoading) {
    return <OrganizationSkeletonLoader />;
  }

  return (
    <div className="md:p-0 px-4">
      <div className="flex items-center justify-between mb-4 bg-white dark:bg-dark-bg p-4 rounded-lg border border-gray-500/[0.1] dark:border-gray-500/[0.2]">
        <h1 className="text-2xl font-semibold">Organizations</h1>
        <Button onClick={() => setShowCreate(true)} size="small">Create Organization</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 h-full bg-white dark:bg-dark-bg border border-gray-500/[0.1] dark:border-gray-500/[0.2] rounded-lg">
        <div className="col-span-1 md:p-6 p-4">
          <h3 className="mb-4 text-sm text-gray-400">Your organizations</h3>
          <div className="flex flex-col gap-2">
            {organizations.length === 0 && <div className="text-gray-500">No organizations yet</div>}
            {organizations.map(org => (
              <button 
                key={org.$id} 
                className={`p-3 text-start flex items-center gap-2 rounded-lg ${currentOrg?.$id === org.$id ? 'bg-bg-gray-100 dark:bg-dark-bg border border-gray-500/[0.1] dark:border-gray-500/[0.2]' : ''}`}
                onClick={() => { selectOrganization(org.$id); setSelectedOrg(org); }} 
              >
                <span className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-full font-bold">{org.name.charAt(0).toUpperCase()}</span>
                <div className="flex flex-col gap-2 text-start justify-start">
                    <div className="font-medium">{org.name}</div>
                    <div className="text-xs text-gray-500 line-clamp-2 md:line-clamp-1">{org.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-3 md:border-l border-gray-500/[0.1] dark:border-gray-500/[0.2] md:p-6 p-4">
          {!currentOrg ? (
            <div className="text-gray-500">Select an organization to manage teams and members.</div>
          ) : (
            <div className="mx-auto">

              <div className='flex gap-4 justify-between flex-wrap mb-6'>
                <div className='flex gap-6 border-b border-gray-500/[0.1] flex-1'>
                {
                  ["Tasks", "About", "teams", "members", "settings"].map((tab) => {
                    if (tab === "settings" && !(isOwner || isAdmin)) return null;
                    else return (
                      <button key={tab} onClick={() => setSelectedTab(tab)} className={`py-2 px-1 text-sm capitalize rounded-tl rounded-tr ${tab === selectedTab ? 'border-b border-primary text-primary' : 'text-gray-500'}`}>
                        {tab}
                      </button>
                    )
                  })
                }
                </div>
              

              </div>
              {
                selectedTab === "Tasks" && (
                  <div className="mb-4">
                    <h2 className="font-semibold text-lg mb-2">Organization Tasks</h2>
                    {tasks.filter(t => t.organizationId === currentOrg.$id).length === 0 ? (
                      <div className="text-gray-500">No tasks in this organization yet.</div>
                    ) : (
                      <div className="space-y-2">
                        {tasks.filter(t => t.organizationId === currentOrg.$id).map((task, index) => (
                          <TaskListView
                              key={task.$id}
                              task={task}
                              openTaskDetails={openTaskDetails}
                              index={index}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              }
              {
                selectedTab === "About" && (
                  <div className="mb-4">
                    <h2 className="font-semibold text-lg mb-2">{currentOrg.name}</h2>
                    <p className="text-gray-500">{currentOrg.description}</p>
                    
                    <div className="my-4">
                      <p>{currentOrg.members?.length || 0} members </p>
                      <p>{currentOrg.teams?.length || 0} teams</p>
                    </div>
                    
                    <div>
                      <Button variant='secondary' size="small" className='p-2 border border-gray-500/[0.1] rounded' onClick={() => { setSelectedOrg(currentOrg); setShowEdit(true); }}>
                        Edit Organization <PencilSimpleLineIcon size={14} />
                      </Button>
                    </div>
                  </div>
                )
              }
              {
                selectedTab === "teams" && (
                  <div className="mb-4">
                    <div className="mb-4">
                      <div className="flex justify-between items-center gap-2">
                        <h4 className="font-semibold text-lg mb-2">Teams</h4>
                        <div className="flex items-center gap-2">
                          <Input
                            value={teamName}
                            className="flex-1 py-[2px] bg-transparent"
                            leftIcon={<GridFourIcon />}
                            onKeyDown={(e) => (["Enter"].includes(e.key) ? handleAddTeam() : undefined)}
                            onChange={(e: any) => setTeamName(e.target.value)}
                            placeholder="Add team and press Enter"
                          />
                          <Button size="small" onClick={handleAddTeam} disabled={!teamName.trim()}>
                            Add
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 py-4">
                        {(currentOrg.teams || []).map((team) => (
                          <div key={team.$id} className="p-3 border border-gray-500/[0.2] rounded">
                            {editingTeamId === team.$id ? (
                              <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Input
                                    value={editingTeamName}
                                    onChange={(e: any) => setEditingTeamName(e.target.value)}
                                    placeholder="Team name"
                                    className="flex-1 py-[2px] min-w-[220px]"
                                  />
                                  <Button size="small" onClick={handleSaveTeam} disabled={!editingTeamName.trim()}>
                                    Save
                                  </Button>
                                  <Button size="small" variant="secondary" onClick={closeTeamEditor}>
                                    Cancel
                                  </Button>
                                </div>

                                <div>
                                  <h5 className="text-xs uppercase tracking-wide text-gray-500 mb-2">Team Members</h5>
                                  {organizationMembers.length === 0 ? (
                                    <div className="text-sm text-gray-500">No members available yet.</div>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {organizationMembers.map((member) => {
                                        const checked = editingTeamMembers.includes(member.$id);

                                        return (
                                          <label key={member.$id} className="flex items-center gap-3 p-2 rounded border border-gray-500/[0.1] cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={checked}
                                              onChange={(e) => {
                                                setEditingTeamMembers((prev) =>
                                                  e.target.checked
                                                    ? [...prev, member.$id]
                                                    : prev.filter((id) => id !== member.$id)
                                                );
                                              }}
                                            />
                                            <div className="min-w-0">
                                              <div className="text-sm font-medium truncate">{member.name || member.email}</div>
                                              <div className="text-xs text-gray-500 truncate">{member.email}</div>
                                            </div>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="font-medium">{team.name}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {(team.members || []).length} member{(team.members || []).length === 1 ? '' : 's'}
                                  </div>
                                  {(team.members || []).length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                      {(team.members || []).map((memberId) => (
                                        <span key={memberId} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-[#1c1c1c]">
                                          {getTeamMemberLabel(memberId)}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {
                                  isOwner || isAdmin ? (
                                  <div className="flex gap-2 shrink-0">
                                    <button onClick={() => openTeamEditor(team)} className="text-xs px-3 py-1 rounded border border-gray-500/[0.2]">
                                      Edit
                                    </button>
                                    <button onClick={() => removeTeam(currentOrg.$id, team.$id)}>
                                      <TrashIcon color="red" size={16} />
                                    </button>
                                  </div>
                                  ) : null
                                }
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              }
              {
                selectedTab === "members" && (
                  <div className="mb-4">
                    <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
                      <h2 className="font-semibold text-lg">Members</h2>
                      {isOwner || isAdmin ? (
                        <Button size="small" onClick={() => { setSelectedMember(null); setShowAddMember(true); }}>
                          Add new member
                        </Button>
                      ): null}
                    </div>
                    
                    <div className="border border-gray-500/[0.1] rounded-lg mb-4 bg-white dark:bg-dark/[0.4]">
                      <h4 className="text-sm font-medium p-4 border-b border-gray-500/[0.1]">Organization owner</h4>
                      <div className="flex flex-col gap-2 p-4">
                          <div className="flex items-center justify-between rounded">
                            <div>
                              <div className="font-medium">{currentOrg.ownerEmail}</div>
                              <div className="text-xs text-gray-500">Owner</div>
                            </div>
                            <div className="text-xs text-gray-400">{currentOrg.ownerEmail}</div>
                          </div>
                      </div>
                    </div>

                    <div className="border border-gray-500/[0.1] rounded-lg bg-white dark:bg-dark/[0.4]">
                      <h4 className="text-sm font-medium p-4 border-b border-gray-500/[0.1]">Members</h4>
                      <div className="flex flex-col gap-2 p-4">
                        {(currentOrg.members || []).map(m => (
                          <div key={m.$id} className="flex items-start justify-between gap-3 p-4 rounded bg-gray-100 dark:bg-dark-bg">
                            <div className='w-full'>
                              <div className='flex justify-between w-full'>
                                <div>
                                  <div className="font-medium">{m.name || m.email}</div>
                                  <div className="text-xs text-gray-500">{m.role}</div>
                                </div>
                                {(isOwner || (isAdmin && m.role !== 'owner')) && (
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={() => { setSelectedMember(m); setShowAddMember(true); }} className="text-xs px-3 py-1 rounded border border-gray-500/[0.2]">
                                      Edit
                                    </button>
                                    {m.role !== 'owner' && (
                                      <button onClick={() => handleRemoveMember(m.$id)} className="text-xs px-3 py-1 rounded border border-red-500/30 text-red-600">
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                  )}
                              </div>
                              {m.permissions?.length ? (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {m.permissions.map((permission) => (
                                    <span key={permission} className="rounded-full bg-gray-100 px-4 py-[6px] text-[10px] dark:bg-[#202022]">
                                      {permission}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                              <div className="text-xs text-gray-400 mt-1">{m.email}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              }
              {
                selectedTab === "settings" && (
                  <div className="mb-4 space-y-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <h2 className="font-semibold text-lg">Settings</h2>
                        <p className="text-sm text-gray-500">Update organization details and manage important actions.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="small" onClick={handleCopyOrganizationId}>
                          Copy Org ID
                        </Button>
                        <Button variant="secondary" size="small" onClick={() => { setSelectedOrg(currentOrg); setShowEdit(true); }}>
                          Open Editor
                        </Button>
                      </div>
                    </div>

                    <div className="border border-gray-500/[0.1] rounded-lg bg-white dark:bg-dark-bg">
                      <h4 className="text-sm font-medium p-4 border-b border-gray-500/[0.1]">Organization profile</h4>
                      <div className="grid grid-cols-1 gap-4 p-4">
                          <Input
                            value={settingsName}
                            onChange={(e: any) => setSettingsName(e.target.value)}
                            placeholder="Organization name"
                            className="w-full bg-transparent"
                            label='Organization title'
                          />
                        <div className='flex flex-col gap-2'>
                          <label className="text-sm font-medium">Description</label>
                          <textarea
                            value={settingsDescription}
                            onChange={(e) => setSettingsDescription(e.target.value)}
                            className="w-full min-h-[120px] p-3 rounded-md border border-gray-500/[0.2] bg-white dark:bg-dark-bg outline-none"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="text-xs text-gray-500">
                            {currentOrg.members?.length || 0} members · {currentOrg.teams?.length || 0} teams
                          </div>
                          <Button size="small" onClick={handleSaveSettings} disabled={!settingsName.trim()}>
                            Save changes
                          </Button>
                        </div>
                      </div>
                    </div>

                    {
                      isOwner && (
                        <div className="border border-red-500/20 rounded-lg bg-red-50 dark:bg-red-950/10">
                          <div className="p-4 border-b border-red-500/20">
                            <h4 className="text-sm font-medium text-red-700 dark:text-red-300">Danger zone</h4>
                            <p className="text-sm text-red-700/80 dark:text-red-300/80">Deleting an organization removes it for all members.</p>
                          </div>
                          <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              Delete the current organization if you no longer need this workspace.
                            </div>
                            <Button size="small" onClick={() => setShowDeleteConfirm(true)}>
                              Delete Organization
                            </Button>
                          </div>
                        </div>
                      )
                    }
                  </div>
                )
              }

              

            </div>
          )}
        </div>
      </div>
      {showDeleteConfirm && currentOrg && (
        <Confirmationmessage
          title={`Delete organization: ${currentOrg.name}?`}
          text="This permanently deletes the organization and removes access for all members."
          buttonText="Delete"
          setOpen={setShowDeleteConfirm}
          onConfirm={handleDeleteOrganization}
        />
      )}
    <CreateOrganizationModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    <EditOrganizationModal isOpen={showEdit} onClose={() => setShowEdit(false)} org={selectedOrg} />
    <AddMemberModal
      isOpen={showAddMember}
      onClose={() => {
        setShowAddMember(false);
        setSelectedMember(null);
      }}
      member={selectedMember}
    />
      {/* Task Details Modal (for list/grid/calendar clicks) */}
              {selectedTask && (
                  <TaskDetailsModal
                      isOpen={detailsOpen}
                      onClose={() => { setDetailsOpen(false); setSelectedTask(null);}}
                      task={selectedTask}
                  />
              )}
  </div>
  )
}
