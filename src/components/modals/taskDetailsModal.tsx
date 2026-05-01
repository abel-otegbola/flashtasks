'use client';
import { useState } from "react";
import { todo } from "../../interface/todo";
import { CloseCircle, Calendar, User, Flag, TrashBinTrash, PenNewSquare, House } from "@solar-icons/react";
import Button from "../button/button";
import { useTasks } from "../../context/tasksContext";
import { useOrganizations } from '../../context/organizationContext';
import { useUser } from '../../context/authContext';
import { ChatCenteredDotsIcon, FileIcon, GridFourIcon, InfoIcon, TrashIcon, XIcon } from "@phosphor-icons/react";

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: todo;
}

export default function TaskDetailsModal({ isOpen, onClose, task }: TaskDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [newAssignee, setNewAssignee] = useState("");
  const { updateTask, deleteTask } = useTasks();
  const { organizations, currentOrg } = useOrganizations();
  const { user } = useUser();

  // determine user's role in the task's organization (if any)
  const taskOrg = organizations.find(o => o.$id === (task as any).organizationId);
  const taskTeam = taskOrg?.teams?.find((t: any) => t.$id === (task as any).teamId);
  const member = taskOrg?.members?.find((m: any) => m.$id === (user as any)?.$id || m.email === (user as any)?.email);
  const userRole: 'owner' | 'admin' | 'member' | undefined = (member as any)?.role;

  if (!isOpen) return null;

  const handleSave = async () => {
    await updateTask(task.$id, editedTask);
    setIsEditing(false);
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await deleteTask(task.$id);
      onClose();
    }
  };

  const handleAddAssignee = () => {
    if (!newAssignee.trim()) return;
    
    const currentInvites = editedTask.invites || [];
    const updatedTask = {
      ...editedTask,
      invites: [...currentInvites, newAssignee.trim()]
    };
    
    setEditedTask(updatedTask);
    setNewAssignee("");
  };

  const handleRemoveAssignee = (email: string) => {
    const updatedTask = {
      ...editedTask,
      invites: (editedTask.invites || []).filter(e => e !== email)
    };
    setEditedTask(updatedTask);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: todo['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'suspended': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'pending': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'upcoming': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-end z-50 p-4">
      <div className="bg-white dark:bg-[#101010] shadow-xl w-full max-w-xl max-[500px]:w-full h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#101010] border-b border-gray-500/[0.1] dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary rounded-lg transition-colors">
              <XIcon size={16} />
            </button>
            <h2 className="px-4 border-l border-gray-500/[0.1] opacity-[0.7] leading-4">Created on {new Date(task.$createdAt).toLocaleDateString()}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary rounded-lg transition-colors"
              title={isEditing ? "Cancel Edit" : "Edit Task"}
            >
              <PenNewSquare size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
              title="Delete Task"
            >
              <TrashIcon size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div className="">
            {isEditing ? (
              <input
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-bg outline-none focus:ring-2 focus:ring-primary"
                placeholder="Task title"
              />
            ) : (
              <h3 className="text-xl font-medium">{task.title}</h3>
            )}
          </div>

          {/* Description */}
          <div className="">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
              <FileIcon size={16} /> Description
            </label>
            {isEditing ? (
              <textarea
                value={editedTask.description}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                className="w-full min-h-[100px] p-3 rounded-lg border border-gray-500/[0.1] bg-white dark:bg-dark-bg outline-none focus:ring-2 focus:ring-primary"
                placeholder="Task description"
              />
            ) : (
              <p className="p-3 rounded-lg text-sm border border-gray-500/[0.1] whitespace-pre-wrap">{task.description || 'No description provided'}</p>
            )}
          </div>

          {/* Task Details Grid */}
          <div className="p-3 rounded-lg border border-gray-500/[0.1]">
            <div className="grid grid-cols-3 gap-4">
              {/* Category */}
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 py-1 flex items-center gap-2">
                  <GridFourIcon size={16} /> Category
                </label>
                {isEditing ? (
                  <input
                    value={editedTask.category}
                    onChange={(e) => setEditedTask({ ...editedTask, category: e.target.value })}
                    placeholder="e.g. Design, Dev"
                    className="col-span-2 w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-bg outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <span className="col-span-2 inline-block py-1 rounded-lg text-sm">
                    {task.category}
                  </span>
                )}

              {/* Status */}
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <InfoIcon size={16} /> Status
                </label>
                {isEditing ? (
                  <select
                    value={editedTask.status}
                    onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as todo['status'] })}
                    className="col-span-2 w-full p-2 rounded-lg border border-border-gray-100 dark:border-gray-700 bg-white dark:bg-dark-bg outline-none"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="in progress">In Progress</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="suspended">Suspended</option>
                  </select>
                ) : (
                  <span className={`col-span-2 inline-block px-3 py-1 rounded-lg text-sm w-fit font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                )}

              {/* Priority */}
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Flag size={16} /> Priority
                </label>
                {isEditing ? (
                  <select
                    value={editedTask.priority || 'medium'}
                    onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as todo['priority'] })}
                    className="col-span-2 w-full p-2 rounded-lg border border-border-gray-100 dark:border-gray-700 bg-white dark:bg-dark-bg outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                ) : (
                  <span className={`col-span-2 inline-block px-3 py-1 rounded-lg w-fit text-sm font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority || 'medium'}
                  </span>
                )}

              {/* Due Date */}
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Calendar size={16} /> Due Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedTask.dueDate || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                    className="col-span-2 w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-bg outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="col-span-2 text-gray-700 dark:text-gray-300">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'No due date'}
                  </p>
                )}
            </div>
          </div>

          {/* Organization / Team Display */}
          <div className="">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
              <House size={16} /> Organization
            </label>
            <div>
              {taskOrg ? (
                <div className="flex items-center gap-2 p-3 rounded-lg text-sm border border-gray-500/[0.1]">
                  <span className="text-sm font-medium">{taskOrg.name}</span>
                  {taskTeam && <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">{taskTeam.name}</span>}
                </div>
              ) : (
                <div className="p-3 rounded-lg text-sm border border-gray-500/[0.1] mt-2">Personal / No organization</div>
              )}
            </div>

            {/* When editing, allow changing org/team only for owners/admins */}
            {isEditing && userRole && (userRole === 'owner' || userRole === 'admin') && (
              <div className="mt-3 grid grid-cols-1 gap-2">
                <select
                  value={(editedTask as any).organizationId || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, organizationId: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-bg outline-none"
                >
                  <option value="">Personal</option>
                  {organizations.map(org => (
                    <option key={org.$id} value={org.$id}>{org.name}</option>
                  ))}
                </select>

                <select
                  value={(editedTask as any).teamId || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, teamId: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-bg outline-none"
                >
                  <option value="">No team</option>
                  {organizations.find(o => o.$id === (editedTask as any).organizationId)?.teams?.map((t: any) => (
                    <option key={t.$id} value={t.$id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Assignees Section */}
          <div className="">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
              <User size={16} /> Assignees
            </label>
            
            {/* Add Assignee Input */}
            {isEditing && (
              <div className="flex gap-2 mb-3 p-3 rounded-lg text-sm border border-gray-500/[0.1]">
                <input
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  placeholder="Enter email address"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAssignee();
                    }
                  }}
                  className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-bg outline-none focus:ring-2 focus:ring-primary"
                />
                <Button onClick={handleAddAssignee} size="small">
                  Add
                </Button>
              </div>
            )}

            {/* Assignees List */}
            <div className="space-y-2 ">
              {/* Main Assignee */}
              {task.assignee && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-dark-bg border border-border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-fuchsia-400 flex items-center justify-center text-white font-bold text-sm">
                    {task?.assignee}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.assignee}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Main Assignee</p>
                  </div>
                </div>
              )}

              {/* Additional Assignees */}
              {(isEditing ? editedTask.invites : task.invites)?.map((email, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-dark-bg border border-border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
                    {email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Collaborator</p>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveAssignee(email)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"
                    >
                      <CloseCircle size={16} />
                    </button>
                  )}
                </div>
              ))}

              {!task.assignee && (!task.invites || task.invites.length === 0) && (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic">No assignees yet</p>
              )}
            </div>
          </div>

          {/* Comments Count */}
          <div className="">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
              <ChatCenteredDotsIcon size={16} /> Comments
            </label>
            <p className="p-3 rounded-lg text-sm border border-gray-500/[0.1]">{task.comments || 0} comments</p>
          </div>
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="sticky bottom-0 bg-white dark:bg-[#101010] border-t border-border-gray-100 dark:border-gray-700 p-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => {
              setIsEditing(false);
              setEditedTask(task);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
