'use client';
import { useState } from "react";
import { todo } from "../../interface/todo";
import { Calendar, Flag, PenNewSquare } from "@solar-icons/react";
import { useTasks } from "../../context/tasksContext";
import { useOrganizations } from '../../context/organizationContext';
import { GridFourIcon, InfoIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
import Confirmationmessage from "./confirmation";
import EditTaskModal from "./editTaskModal";
import { useOutsideClick } from "../../customHooks/useOutsideClick";

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: todo;
}

export default function TaskDetailsModal({ isOpen, onClose, task }: TaskDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const { deleteTask } = useTasks();
  const { organizations } = useOrganizations();
  const modalRef = useOutsideClick(onClose, false);

  // determine user's role in the task's organization (if any)
  const taskOrg = organizations.find(o => o.$id === (task as any).organizationId);
  const taskTeam = taskOrg?.teams?.find((t: any) => t.$id === (task as any).teamId);

  if (!isOpen) return null;

  const handleDelete = async () => {
    await deleteTask(task.$id);
    setShowDeleteConfirmation(false);
    onClose();
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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white dark:bg-[#0b0b0b] shadow-xl w-[94%] max-w-2xl max-h-[80vh] border border-gray-500/[0.2] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#101010] border-b border-gray-500/[0.1] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="px-2 opacity-[0.7] leading-4">Created on {new Date(task.$createdAt).toLocaleDateString()}</h2>
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
              onClick={() => setShowDeleteConfirmation(true)}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
              title="Delete Task"
            >
              <TrashIcon size={16} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary rounded-lg transition-colors">
              <XIcon size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div className="">
            <h3 className="text-xl font-medium">{task.title}</h3>
          </div>

          {/* Task Details Grid */}
          <div className="p-3 rounded-lg border border-gray-500/[0.2]">
            <div className="grid sm:grid-cols-4 grid-cols-2 gap-4">
              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="text-xs opacity-75 uppercase py-1 flex items-center gap-2">
                  Category
                </label>
                <span className="col-span-2 inline-block py-1 rounded-lg text-sm">
                  {task.category}
                </span>
              </div>                  

              {/* Status */}
              <div className="flex flex-col gap-2">
                <label className="text-xs opacity-75 uppercase py-1 flex items-center gap-2">
                  Status
                </label>
                <span className={`col-span-2 inline-block px-3 py-1 rounded-lg text-sm w-fit font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>

              {/* Priority */}
              <div className="flex flex-col gap-2">
                <label className="text-xs opacity-75 uppercase py-1 flex items-center gap-2">
                  Priority
                </label>
                <span className={`col-span-2 inline-block px-3 py-1 rounded-lg w-fit text-sm font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority || 'medium'}
                </span>
              </div>

              {/* Due Date */}
              <div className="flex flex-col gap-2">
                <label className="text-xs opacity-75 uppercase py-1 flex items-center gap-2">
                  Due Date
                </label>
                <p className="col-span-2 text-gray-700 dark:text-gray-300">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'No due date'}
                </p>
              </div>
            </div>
          </div>
          

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-xs opacity-75 uppercase py-1 flex items-center gap-2">
              Description
            </label>
            <p className="whitespace-pre-wrap">{task.description || 'No description provided'}</p>
          </div>

          {/* Organization / Team Display */}
          <div className="flex flex-col gap-2">
            <label className="text-xs opacity-75 uppercase py-1 flex items-center gap-2">
              Organization
            </label>
            <div>
              {taskOrg ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{taskOrg.name}</span>
                  {taskTeam && <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">{taskTeam.name}</span>}
                </div>
              ) : (
                <div className="mt-2">Personal / No organization</div>
              )}
            </div>
          </div>

          {/* Assignees Section */}
          <div className="flex flex-col gap-2">
            <label className="text-xs opacity-75 uppercase py-1 flex items-center gap-2">
              Assignees
            </label>

            {/* Assignees List */}
            <div className="space-y-2 ">
              {/* Main Assignee */}
              {task.assignees && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-fuchsia-400 flex items-center justify-center text-white font-bold text-sm">
                    {task?.assignees[0]?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task?.assignees[0]}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Main Assignee</p>
                  </div>
                </div>
              )}

              {!task.assignees && (!task.invites || task.invites.length === 0) && (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic">No assignees yet</p>
              )}
            </div>
          </div>

          {/* Comments Count */}
          <div className="flex flex-col gap-2">
            <label className="text-xs opacity-75 uppercase py-1 flex items-center gap-2">
              Comments
            </label>
            <p className="">{task.comments || 0} comments</p>
          </div>
        </div>

        {/* Footer */}
        {isEditing && (
          <EditTaskModal 
            task={task}
            isOpen={isEditing}
            onClose={() => setIsEditing(false)}
          />
        )}
      </div>

      {showDeleteConfirmation && (
        <Confirmationmessage
          title="Delete task?"
          text="Are you sure you want to delete this task? This action cannot be undone."
          buttonText="Delete"
          setOpen={setShowDeleteConfirmation}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
