'use client';
import { useEffect, useState } from "react";
import { todo } from "../../interface/todo";
import { PenNewSquare, Play } from "@solar-icons/react";
import { useTasks } from "../../context/tasksContext";
import { useOrganizations } from '../../context/organizationContext';
import { TrashIcon, XIcon } from "@phosphor-icons/react";
import Confirmationmessage from "./confirmation";
import EditTaskModal from "./editTaskModal";
import { useOutsideClick } from "../../customHooks/useOutsideClick";
import { formatDateTime } from "../../helpers/dateTime";
import GetAvatar from "../../customHooks/useGetAvatar";
import Button from "../button/button";
import FocusMode from "../focusMode/focusMode";
import { useUser } from "../../context/authContext";
import toast from "react-hot-toast";

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: todo;
  permissions?: string[]
}

export default function TaskDetailsModal({ isOpen, onClose, task, permissions }: TaskDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const { tasks, deleteTask, updateTask, loading } = useTasks();
  const { organizations } = useOrganizations();
  const { user } = useUser();
  const modalRef = useOutsideClick(onClose, false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const activeTask = tasks.find((currentTask) => currentTask.$id === task.$id) ?? task;

  // determine user's role in the task's organization (if any)
  const taskOrg = organizations?.find(o => o.$id === (activeTask as any).organizationId);
  const ownTask = activeTask.userEmail === user?.email;
  const assignedTask = Array.isArray(activeTask?.assignees) && activeTask.assignees.includes(user?.email);
  const canEdit = !activeTask.organizationId || ((permissions && (permissions.includes("edit_task") || permissions.includes("edit_all_tasks"))) && (ownTask || assignedTask));
  const canDelete = !activeTask.organizationId || ((permissions && (permissions.includes("delete_task") || permissions.includes("edit_all_tasks"))) && (ownTask || assignedTask));
  const canComplete = !activeTask.organizationId || ((permissions && permissions.includes("complete_task")) && (ownTask || assignedTask));

  useEffect(() => {
    console.log(permissions, task)
  }, [permissions])

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setShowDeleteConfirmation(false);
      setIsFocusMode(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async () => {
    await deleteTask(activeTask.$id);
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
      <div ref={modalRef} className="bg-white dark:bg-dark-bg shadow-xl w-[94%] overflow-y-auto max-w-2xl max-h-[80vh] border border-gray-500/[0.1] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-dark-bg border-b border-gray-500/[0.1] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="px-2 opacity-[0.7] leading-4 text-sm">Created on {formatDateTime(activeTask.$createdAt, { year: 'numeric', month: 'long', day: 'numeric' })}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!canEdit) {
                  toast.error('You do not have permission to edit this task');
                  return;
                }
                setIsEditing(!isEditing);
              }}
              disabled={!canEdit}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg transition-colors"
              title={isEditing ? "Cancel Edit" : "Edit Task"}
            >
              <PenNewSquare size={16} />
            </button>
            <button
              onClick={() => {
                if (!canDelete) {
                  toast.error('You do not have permission to delete this task');
                  return;
                }
                setShowDeleteConfirmation(true);
              }}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
              title="Delete Task"
            >
              <TrashIcon size={16} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg transition-colors">
              <XIcon size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div className="">
            <h3 className="font-medium text-sm">{activeTask.title}</h3>
          </div>

          {/* Task Details Grid */}
          <div className="p-3 rounded-lg border border-gray-500/[0.1]">
            <div className="grid sm:grid-cols-4 grid-cols-2 gap-4">
              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="text-xs opacity-75 uppercase py-1 flex items-center gap-2">
                  Category
                </label>
                <span className="col-span-2 inline-block py-1 rounded-lg text-sm">
                  {activeTask.category}
                </span>
              </div>                  

              {/* Status */}
              <div className="flex flex-col gap-2">
                <label className="text-xs opacity-75 uppercase py-1 flex items-center gap-2">
                  Status
                </label>
                <span className={`col-span-2 inline-block px-3 py-1 rounded-lg text-sm w-fit font-medium ${getStatusColor(activeTask.status)}`}>
                  {activeTask.status}
                </span>
              </div>

              {/* Priority */}
              <div className="flex flex-col gap-2">
                <label className="text-xs opacity-75 uppercase py-1 flex items-center gap-2">
                  Priority
                </label>
                <span className={`col-span-2 inline-block px-3 py-1 rounded-lg w-fit text-sm font-medium ${getPriorityColor(activeTask.priority)}`}>
                  {activeTask.priority || 'medium'}
                </span>
              </div>

              {/* Due Date */}
              <div className="flex flex-col gap-2">
                <label className="text-xs opacity-75 uppercase py-1 flex items-center gap-2">
                  Due Date
                </label>
                <p className="col-span-2 text-gray-700 dark:text-gray-300">
                  {activeTask.dueDate ? formatDateTime(activeTask.dueDate, { year: 'numeric', month: 'long', day: 'numeric' }) : 'No due date'}
                </p>
              </div>
            </div>
          </div>
          

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-xs opacity-75 uppercase py-1 flex items-center gap-2">
              Description
            </label>
            <p className="whitespace-pre-wrap text-[12px]">{activeTask.description || 'No description provided'}</p>
          </div>

          {/* Organization / Team Display */}
          {
            taskOrg && (
            <div className="flex flex-col gap-2">
              <label className="text-xs opacity-75 uppercase py-1 flex items-center gap-2">
                Organization
              </label>
              <div>
                {taskOrg ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{taskOrg.name}</span>
                  </div>
                ) : (
                  <div className="mt-2">Personal / No organization</div>
                )}
              </div>
            </div>
            )
          }

          {/* Assignees Section */}
          {activeTask?.assignees && activeTask?.assignees?.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-xs opacity-75 uppercase py-1 flex items-center gap-2">
              Assignees
            </label>

            {/* Assignees List */}
            <div className="space-y-2 ">
              {/* Main Assignee */}
              {
                activeTask.assignees.map((assigneeEmail) => (
                  <div key={assigneeEmail} className="flex items-center gap-3">
                    <GetAvatar email={assigneeEmail} className="w-12 h-12" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{assigneeEmail}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Main Assignee</p>
                  </div>
                </div>
                ))
              }

              {!activeTask.assignees && (!activeTask.invites || activeTask.invites.length === 0) && (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic">No assignees yet</p>
              )}
            </div>
          </div>
          )}

          {/* Comments Count */}
          {
            activeTask.comments !== "0" && (
              <div className="flex flex-col gap-2">
                <label className="text-xs opacity-75 uppercase py-1 flex items-center gap-2">
                  Comments
                </label>
                <p className="">{activeTask.comments} comments</p>
              </div>
            )
          }

        </div>

          <div className="sticky bottom-0 bg-white dark:bg-dark-bg overflow-x-auto flex flex-wrap justify-center gap-4 p-4 border-t border-gray-500/[0.1] ">
            <Button size="small" variant="secondary" onClick={() => setIsFocusMode(true)}><Play /> Start focus mode</Button>
          {
            activeTask.status === "in progress" || activeTask.status === "pending" ? (
            <Button size="small" variant="secondary" onClick={() => updateTask(activeTask.$id, { status: "suspended" })}>Suspend task</Button>
            ) : (
              <Button size="small" variant="secondary" onClick={() => updateTask(activeTask.$id, { status: "in progress" })}>Resume task</Button>
            )
          }
          {
            activeTask.status !== "completed" ? 
              <Button size="small" onClick={() => {
                if (!canComplete) {
                  toast.error('You do not have permission to complete this task');
                  return;
                }
                updateTask(activeTask.$id, { status: "completed" });
              }}>Complete task</Button>
              :
              <Button size="small" onClick={() => {
                if (!canComplete) {
                  toast.error('You do not have permission to restart this task');
                  return;
                }
                updateTask(activeTask.$id, { status: "pending" });
              }}>Restart task</Button>
          }
          </div>
        {/* Footer */}
        {isEditing && (
          <EditTaskModal 
            task={activeTask}
            isOpen={isEditing}
            onClose={() => setIsEditing(false)}
          />
        )}
        
        {showDeleteConfirmation && (
          <Confirmationmessage
            title="Delete task?"
            text="Are you sure you want to delete this task? This action cannot be undone."
            buttonText="Delete"
            setOpen={setShowDeleteConfirmation}
            onConfirm={handleDelete}
            loading={loading}
          />
        )}
      </div>

      {isFocusMode && (
        <FocusMode 
          task={activeTask}
          setOpen={(value) => setIsFocusMode(value)}
        />
      )}
    </div>
  );
}
