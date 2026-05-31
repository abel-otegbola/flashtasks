"use client";
import { useEffect, useState } from 'react';
import { useOrganizations } from '../../../context/organizationContext';
import Button from '../../../components/button/button';
import Input from '../../../components/input/input';
import CreateOrganizationModal from '../../../components/modals/createOrganizationModal';
import EditOrganizationModal from '../../../components/modals/editOrganizationModal';
import AddMemberModal from '../../../components/modals/addMemberModal';
import AddTeamModal from '../../../components/modals/addTeamModal';
import AddTeamMemberModal from '../../../components/modals/addTeamMemberModal';
import { PencilSimpleLineIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { OrganizationSkeletonLoader } from '../../../components/skeletons';
import Confirmationmessage from '../../../components/modals/confirmation';
import { Organization, OWNER_PERMISSIONS, Team } from '../../../interface/organization';
import { useTasks } from '../../../context/tasksContext';
import TaskListView from '../../../components/cards/taskListView';
import { todo } from '../../../interface/todo';
import TaskDetailsModal from '../../../components/modals/taskDetailsModal';
import CreateTaskModal from '../../../components/modals/createTaskModal';
import GetAvatar from '../../../customHooks/useGetAvatar';
import { useUser } from '../../../context/authContext';

export default function OrganizationsPage() {
  const orgCtx = useOrganizations();
  const { organizations, currentOrg, teams, invitedMembers, loadOrganizations, loadTeams, selectOrganization, addTeam, updateTeam, removeTeam, removeMemberFromOrg, deleteOrganization, getAllInvitedMembers, loading } = orgCtx;
  const { tasks, getOrganizationTasks } = useTasks(); 
  const [showCreate, setShowCreate] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showAddTeamMembers, setShowAddTeamMembers] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(currentOrg || null);
  const [selectedTab, setSelectedTab] = useState("Tasks");
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamTitle, setEditingTeamTitle] = useState('');
  const [editingTeamDescription, setEditingTeamDescription] = useState('');
  const [editingTeamMembers, setEditingTeamMembers] = useState<string[]>([]);
  const [settingsName, setSettingsName] = useState('');
  const [settingsSlug, setSettingsSlug] = useState('');
  const [settingsDescription, setSettingsDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<todo | null>(null);
  const { user } = useUser()
  const [confirmRemoveMember, setConfirmRemoveMember] = useState<string | boolean>(false);
  const permissions = invitedMembers?.find(m => m.email === user?.email)?.roles[0] === "owner" ? OWNER_PERMISSIONS : invitedMembers?.find(m => m.email === user?.email)?.roles || [];

  useEffect(() => {
    loadOrganizations()
  }, [])

  useEffect(() => {
    setSelectedOrg(currentOrg || null);
  }, [currentOrg]);
  
  useEffect(() => {
      if (!selectedOrg?.$id) return;

      getOrganizationTasks(selectedOrg.$id);
      getAllInvitedMembers(selectedOrg.$id);
      loadTeams(selectedOrg.$id);
  }, [selectedOrg?.$id]);

  const initialLoading = loading && organizations.length === 0 && !currentOrg;

  const isOwner = permissions.includes("owner") || permissions.includes('manage_org')

  const isAdmin = permissions.includes('manage_teams') || permissions.includes('manage_members')

  const openTaskDetails = (task: todo) => {
      setSelectedTask(task);
      setDetailsOpen(true);
  };

  const openTeamEditor = (team: Team) => {
    setEditingTeamId(team.$id);
    setEditingTeamTitle(team.title || '');
    setEditingTeamDescription(team.description || '');
    setEditingTeamMembers(team.members || []);
  };

  const closeTeamEditor = () => {
    setEditingTeamId(null);
    setEditingTeamTitle('');
    setEditingTeamDescription('');
    setEditingTeamMembers([]);
  };

  const handleSaveTeam = async () => {
    if (!editingTeamId) return;

    await updateTeam(editingTeamId, {
      title: editingTeamTitle.trim(),
      description: editingTeamDescription.trim(),
      members: editingTeamMembers,
    });
    closeTeamEditor();
  };

  const handleRemoveMember = async (memberId: string) => {
    console.log("Removing member with ID:", memberId);
    if (!currentOrg) return;
    await removeMemberFromOrg(currentOrg.$id, memberId);
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

  const openAddTeamMembers = (team: Team) => {
    setSelectedTeam(team);
    setShowAddTeamMembers(true);
  };

  const getTeamMemberLabel = (memberId: string) => {
    const member = invitedMembers.find((item) => item.$id === memberId || item.email === memberId || item.name === memberId);
    return member?.name || member?.email || memberId;
  };

  if (initialLoading) {
    return <OrganizationSkeletonLoader />;
  }

  return (
    <div className="flex flex-col md:p-0 px-4 h-full">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-4 bg-white dark:bg-dark-bg p-4 rounded-lg border border-gray-500/[0.1] dark:border-gray-500/[0.2]">
        <h1 className="text-2xl font-semibold">Organizations</h1>
        <Button onClick={() => setShowCreate(true)} size="small">Create Organization</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 md:flex-1 mb-4 bg-white dark:bg-dark-bg border border-gray-500/[0.1] dark:border-gray-500/[0.2] rounded-lg">
        <div className="md:col-span-1 md:p-6 p-4">
          <h3 className="mb-4 text-sm text-gray-400">Your organizations</h3>
          <div className="flex flex-col gap-2">
            {organizations.length === 0 && <div className="text-gray-500">No organizations yet</div>}
            {organizations.map(org => (
              <button 
                key={org.$id} 
                className={`p-3 text-start flex items-center gap-2 rounded-lg ${currentOrg?.$id === org.$id ? 'bg-bg-gray-100 dark:bg-dark-bg border border-gray-500/[0.1] dark:border-gray-500/[0.2]' : ''}`}
                onClick={() => { selectOrganization(org.$id); setSelectedOrg(org); }} 
              >
                <span className="w-12 h-12 aspect-square flex items-center justify-center bg-primary/10 text-primary rounded-full font-bold">{org.name.charAt(0).toUpperCase()}</span>
                <div className="flex flex-col gap-2 text-start justify-start">
                    <div className="font-medium">{org.name}</div>
                    <div className="text-xs text-gray-500 line-clamp-2 md:line-clamp-1">{org?.total || 0} members</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 md:border-l border-gray-500/[0.1] dark:border-gray-500/[0.2] md:p-6 p-4">
          {!currentOrg ? (
            <div className="text-gray-500">Select an organization to manage teams and members.</div>
          ) : (
            <div className="mx-auto">

              <div className='flex gap-4 justify-between flex-wrap mb-6'>
                <div className='flex gap-6 border-b border-gray-500/[0.1] flex-1 overflow-x-auto'>
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
                  <div className="mb-4 ">
                    <h2 className="font-semibold text-lg mb-2">Organization Tasks</h2>
                    {tasks.filter(t => t.organizationId === currentOrg.$id).length === 0 ? (
                      <div className="text-gray-500 mb-8">No tasks in this organization yet.</div>
                    ) : (
                      <div className="space-y-2 mb-8">
                        {tasks.filter(t => t.organizationId === currentOrg.$id).map((task, index) => (
                          <TaskListView
                              key={task.$id}
                              task={task}
                              openTaskDetails={openTaskDetails}
                              index={index}
                              permissions={permissions}
                          />
                        ))}
                      </div>
                    )}
                    {
                      permissions.includes("create_task") &&
                      <Button onClick={() => setShowCreateTask(true)} size="small">
                        <PlusIcon />
                        Create New Task
                      </Button>
                    }
                    {showCreateTask && (
                      <CreateTaskModal
                        isOpen={showCreateTask}
                        task={{ organizationId: currentOrg?.$id } as todo}
                        onClose={() => setShowCreateTask(false)}
                      />
                    )}
                  </div>
                )
              }
              {
                selectedTab === "About" && (
                  <div className="mb-4">
                    <h2 className="font-semibold text-lg mb-2">{currentOrg.name}</h2>
                    <div className="my-4">
                      <p>{currentOrg.total || 0} members</p>
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
                  <div className="mb-4 space-y-4">
                    <div className="rounded-lg border border-gray-500/[0.1] bg-white dark:bg-dark/[0.4] p-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
                        <h4 className="font-semibold text-lg">Teams</h4>
                        <span className="text-sm text-gray-500">{teams.length} team{teams.length === 1 ? '' : 's'}</span>
                      </div>
                      <Button size="small" onClick={() => setShowAddTeam(true)}>
                        Add team
                      </Button>
                    </div>

                    {teams.length === 0 ? (
                      <div className="text-gray-500">No teams created for this organization yet.</div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {teams.map((team) => (
                          <div key={team.$id} className="rounded-lg border border-gray-500/[0.1] bg-white dark:bg-dark/[0.4] p-4">
                            {editingTeamId === team.$id ? (
                              <div className="flex flex-col gap-4">
                                <div className="grid gap-3 md:grid-cols-2">
                                  <Input
                                    value={editingTeamTitle}
                                    onChange={(e: any) => setEditingTeamTitle(e.target.value)}
                                    placeholder="Team title"
                                  />
                                  <Input
                                    value={editingTeamDescription}
                                    onChange={(e: any) => setEditingTeamDescription(e.target.value)}
                                    placeholder="Team description"
                                  />
                                </div>

                                <div>
                                  <h5 className="text-xs uppercase tracking-wide text-gray-500 mb-2">Members</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {(invitedMembers || []).map((member) => {
                                      const checked = editingTeamMembers.includes(member.$id);
                                      return (
                                        <label key={member.$id} className="flex items-center gap-3 p-2 rounded border border-gray-500/[0.1] cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={(event) => {
                                              setEditingTeamMembers((previous) => event.target.checked
                                                ? [...previous, member.$id]
                                                : previous.filter((id) => id !== member.$id));
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
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                  <Button size="small" onClick={handleSaveTeam} disabled={!editingTeamTitle.trim()}>
                                    Save
                                  </Button>
                                  <Button size="small" variant="secondary" onClick={closeTeamEditor}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="font-medium">{team.title}</div>
                                  {team.description ? <div className="text-sm text-gray-500 mt-1">{team.description}</div> : null}
                                  <div className="text-xs text-gray-500 mt-2">
                                    {(team.members || []).length} member{(team.members || []).length === 1 ? '' : 's'}
                                    {' '}• {(Array.isArray(team.activities) ? team.activities.length : 0)} activities
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
                                {(isOwner || isAdmin) ? (
                                  <div className="flex gap-2 shrink-0">
                                    <button onClick={() => openAddTeamMembers(team)} className="text-xs px-3 py-1 rounded border border-gray-500/[0.2]">
                                      Add members
                                    </button>
                                    <button onClick={() => openTeamEditor(team)} className="text-xs px-3 py-1 rounded border border-gray-500/[0.2]">
                                      Edit
                                    </button>
                                    <button onClick={() => removeTeam(currentOrg.$id, team.$id)}>
                                      <TrashIcon color="red" size={16} />
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }
              {
                selectedTab === "members" && (
                  <div className="mb-4">
                    <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
                      <h2 className="font-semibold text-lg">Members</h2>
                      {isOwner ? (
                        <Button size="small" onClick={() => { setSelectedMember(null); setShowAddMember(true); }}>
                          Add new member
                        </Button>
                      ) : null}
                    </div>

                    <div className="border border-gray-500/[0.1] rounded-lg bg-white dark:bg-dark/[0.4]">
                      <h4 className="text-sm font-medium p-4 border-b border-gray-500/[0.1]">Members</h4>
                      <div className="flex flex-col gap-2">
                        {/* List Header - Hidden on mobile */}
                        <div className={`hidden md:grid md:grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-gray-500 uppercase border-b border-gray-500/[0.2]`}>
                            <div className="col-span-3 px-4">User</div>
                            <div className="col-span-2 px-4">Role</div>
                            <div className="col-span-3 px-4">Permissions</div>
                            <div className="col-span-2 px-4">Status</div>
                            <div className="col-span-2 px-4">Actions</div>
                        </div>
                      </div>
                      <div className="flex flex-col p-4">
                        {(invitedMembers || []).map(m => (
                          <div 
                            key={m.$id}
                            role="button"
                            tabIndex={0}
                            className={`grid md:grid-cols-12 grid-cols-6 flex flex-col md:gap-4 gap-2 px-4 py-3 flex-1 border-b border-gray-500/[0.2] last:border-0 pb-4`}
                          >
                            <div className={`md:col-span-3 col-span-4 flex items-center gap-1 `}>
                              <GetAvatar email={m.email} className='w-12 h-12' />
                              <div>
                                <h3 className={`font-semibold text-sm`}>
                                    {m.name}
                                </h3>
                                <p className="text-xs text-gray-400 line-clamp-2 md:line-clamp-1">{m.email}</p>
                              </div>
                            </div>  
                            
                            <div className="col-span-2 flex items-center md:justify-start">
                              <span className="rounded bg-gray-100 px-4 py-[2px] text-[12px] dark:bg-[#202022]">
                                {m.roles[0]}
                              </span>
                            </div>
                            <div className="md:col-span-3 col-span-6 flex flex-wrap items-center md:justify-start">
                              {m.roles?.length ? (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {m.roles.slice(1, m.roles.length).map((role) => (
                                    <span key={role} className="rounded bg-gray-100 px-4 py-[2px] text-[12px] dark:bg-[#202022]">
                                      {role.replace(/_/g, ' ')}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                            <div className="col-span-2 md:px-4 flex items-center md:justify-start">
                              <p className={`rounded  px-4 py-[2px] text-[12px] ${m.joined ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                                {m.joined ? `Active` : "Pending"}
                              </p>
                            </div>
                            <div className="col-span-2 md:px-4 flex items-center md:justify-start">
                              {(isOwner) && (
                                <div className="flex items-center gap-2 shrink-0">
                                  <button onClick={() => { setSelectedMember(m); setShowAddMember(true); }} className="text-xs px-3 py-1 rounded border border-gray-500/[0.2]">
                                    Edit
                                  </button>
                                  {!m.roles?.includes('owner') && (
                                    <button onClick={() => setConfirmRemoveMember(true)} className="text-xs px-3 py-1 rounded border border-red-500/30 text-red-600">
                                      Remove
                                    </button>
                                  )}
                                  {
                                    confirmRemoveMember && (
                                      <Confirmationmessage
                                        title={`Remove ${m.name || m.email} from organization?`}
                                        text="This will revoke their access to all organization resources."
                                        buttonText="Remove"
                                        setOpen={setConfirmRemoveMember}
                                        onConfirm={() => {handleRemoveMember(m.$id); setConfirmRemoveMember(false);}}
                                       />
                                     )
                                  }
                                </div>
                                )}
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
    <AddTeamModal isOpen={showAddTeam} onClose={() => setShowAddTeam(false)} />
    <AddTeamMemberModal
      isOpen={showAddTeamMembers}
      team={selectedTeam}
      onClose={() => {
        setShowAddTeamMembers(false);
        setSelectedTeam(null);
      }}
    />
    <EditOrganizationModal isOpen={showEdit} onClose={() => setShowEdit(false)} org={selectedOrg} />
    <AddMemberModal
      isOpen={showAddMember}
      onClose={() => {
        setShowAddMember(false);
        setSelectedMember(null);
      }}
      member={selectedMember}
      currentUserPermissions={permissions}
    />
      {/* Task Details Modal (for list/grid/calendar clicks) */}
              {selectedTask && (
                  <TaskDetailsModal
                      isOpen={detailsOpen}
                      onClose={() => { setDetailsOpen(false); setSelectedTask(null);}}
                      task={selectedTask}
                      permissions={permissions}
                  />
              )}
  </div>
  )
}
