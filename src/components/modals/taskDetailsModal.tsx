'use client';
import { useEffect, useState } from "react";
import { todo } from "../../interface/todo";
import { PenNewSquare, Play } from "@solar-icons/react";
import { useTasks } from "../../context/tasksContext";
import { useOrganizations } from '../../context/organizationContext';
import { PencilLineIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
import Confirmationmessage from "./confirmation";
import EditTaskModal from "./editTaskModal";
import { useOutsideClick } from "../../customHooks/useOutsideClick";
import { formatDateTime } from "../../helpers/dateTime";
import GetAvatar from "../../customHooks/useGetAvatar";
import Button from "../button/button";
import FocusMode from "../focusMode/focusMode";
import { useUser } from "../../context/authContext";
import toast from "react-hot-toast";
import { parseComments } from "../../helpers/parseComments";

type SubtaskEntry = {
  author: string;
  email?: string;
  title: string;
  completed: boolean;
  createdAt?: string;
};

const parseSubtasks = (subtasks: string): SubtaskEntry[] => {
  if (!subtasks || subtasks === '0') return [];

  try {
    const parsed = JSON.parse(subtasks) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((entry): entry is SubtaskEntry => Boolean(entry && typeof entry === 'object'))
      .map((entry) => ({
        author: String((entry as SubtaskEntry).author || 'Unknown'),
        email: (entry as SubtaskEntry).email ? String((entry as SubtaskEntry).email) : undefined,
        title: String((entry as SubtaskEntry).title || ''),
        completed: Boolean((entry as SubtaskEntry).completed),
        createdAt: (entry as SubtaskEntry).createdAt ? String((entry as SubtaskEntry).createdAt) : undefined,
      }))
      .filter((entry) => entry.title.length > 0);
  } catch {
    return subtasks
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => ({
        author: 'Legacy',
        title: entry,
        completed: false,
      }));
  }
};

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: todo;
  permissions?: string[]
}

export default function TaskDetailsModal({ isOpen, onClose, task, permissions }: TaskDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'subtasks'>('comments');
  const [commentText, setCommentText] = useState("");
  const [subtaskText, setSubtaskText] = useState("");
  const [editingCommentIndex, setEditingCommentIndex] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
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
  const canEdit = !activeTask.organizationId || ((permissions && (permissions.includes("edit_tasks") || permissions.includes("edit_tasks"))) || (ownTask || assignedTask));
  const canDelete = !activeTask.organizationId || ((permissions && (permissions.includes("delete_tasks") || permissions.includes("edit_tasks"))) || (ownTask || assignedTask));
  const canComplete = !activeTask.organizationId || ((permissions && permissions.includes("complete_tasks")) || (ownTask || assignedTask));

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setShowDeleteConfirmation(false);
      setIsFocusMode(false);
      setActiveTab('comments');
      setCommentText("");
      setSubtaskText("");
      setEditingCommentIndex(null);
      setEditingCommentText("");
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

  const comments = parseComments(activeTask.comments);
  const subtasks = parseSubtasks((activeTask as any).subtasks || '[]');

  const handleAddComment = async () => {
    const trimmedComment = commentText.trim();

    if (!trimmedComment) {
      toast.error('Write a comment first');
      return;
    }

    const author = String(user?.name || user?.email || 'Unknown user');
    const email = String(user?.email || '');
    const nextComments = JSON.stringify([
      ...comments,
      {
        author,
        email,
        message: trimmedComment,
        createdAt: new Date().toISOString(),
      },
    ]);

    const updatedTask = await updateTask(activeTask.$id, { comments: nextComments });
    if (updatedTask) {
      setCommentText("");
      toast.success('Comment added');
    }
  };

  const handleStartEditComment = (index: number) => {
    setEditingCommentIndex(index);
    setEditingCommentText(comments[index]?.message || '');
  };

  const handleCancelEditComment = () => {
    setEditingCommentIndex(null);
    setEditingCommentText("");
  };

  const handleSaveCommentEdit = async () => {
    if (editingCommentIndex === null) return;

    const trimmedComment = editingCommentText.trim();
    if (!trimmedComment) {
      toast.error('Write a comment first');
      return;
    }

    const nextComments = comments.map((comment, index) => (
      index === editingCommentIndex
        ? { ...comment, message: trimmedComment }
        : comment
    ));

    const updatedTask = await updateTask(activeTask.$id, { comments: JSON.stringify(nextComments) });
    if (updatedTask) {
      handleCancelEditComment();
      toast.success('Comment updated');
    }
  };

  const handleDeleteComment = async (index: number) => {
    const nextComments = comments.filter((_, commentIndex) => commentIndex !== index);
    const updatedTask = await updateTask(activeTask.$id, { comments: JSON.stringify(nextComments) });
    if (updatedTask) {
      if (editingCommentIndex === index) {
        handleCancelEditComment();
      }
      toast.success('Comment deleted');
    }
  };

  const handleAddSubtask = async () => {
    const trimmedSubtask = subtaskText.trim();

    if (!trimmedSubtask) {
      toast.error('Write a subtask first');
      return;
    }

    const author = String(user?.name || user?.email || 'Unknown user');
    const email = String(user?.email || '');
    const nextSubtasks = JSON.stringify([
      ...subtasks,
      {
        author,
        email,
        title: trimmedSubtask,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ]);

    const updatedTask = await updateTask(activeTask.$id, { subtasks: nextSubtasks } as Partial<todo>);
    if (updatedTask) {
      setSubtaskText('');
      toast.success('Subtask added');
    }
  };

  const handleToggleSubtask = async (index: number) => {
    const nextSubtasks = subtasks.map((subtask, subtaskIndex) => (
      subtaskIndex === index
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    ));

    const updatedTask = await updateTask(activeTask.$id, { subtasks: JSON.stringify(nextSubtasks) } as Partial<todo>);
    if (updatedTask) {
      toast.success(subtasks[index]?.completed ? 'Subtask reopened' : 'Subtask completed');
    }
  };

  const handleDeleteSubtask = async (index: number) => {
    const nextSubtasks = subtasks.filter((_, subtaskIndex) => subtaskIndex !== index);
    const updatedTask = await updateTask(activeTask.$id, { subtasks: JSON.stringify(nextSubtasks) } as Partial<todo>);
    if (updatedTask) {
      toast.success('Subtask deleted');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white dark:bg-dark shadow-xl w-[94%] overflow-y-auto max-w-2xl max-h-[80vh] border border-gray-500/[0.1] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-dark border-b border-gray-500/[0.1] p-4 flex items-center justify-between z-2">
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
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark rounded-lg transition-colors"
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
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-dark rounded-lg transition-colors">
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

          {/* Comment / Subtask Tabs */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-gray-500/[0.1]">
              <button
                type="button"
                onClick={() => setActiveTab('comments')}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'comments' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
              >
                Comments ({comments.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('subtasks')}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'subtasks' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
              >
                Subtasks ({subtasks.length})
              </button>
            </div>

            {activeTab === 'comments' ? (
              <div className="flex flex-col gap-3">
                <div className="max-h-64 overflow-y-auto pr-1 bg-background rounded-lg border border-gray-500/[0.1] py-3 ">
                  {comments.length > 0 ? comments.map((comment, index) => (
                    <div key={`${comment.author}-${comment.createdAt || index}-${index}`} className={`p-3 rounded-lg`}>
                      <div className={`flex items-center gap-2 ${comment.email === user?.email ? 'justify-end' : ''}`}>
                        <GetAvatar email={comment.email || comment.author} className="w-8 h-8" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{comment.author}</span>
                          {comment.email ? <span className="text-[10px] text-gray-500">{comment.email}</span> : null}
                          {comment.createdAt ? (
                            <span className="text-[9px] text-gray-500">{formatDateTime(comment.createdAt, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          ) : null}
                        </div>
                      </div>
                      {editingCommentIndex === index ? (
                        <div className="mt-3 space-y-2">
                          <textarea
                            value={editingCommentText}
                            onChange={(event) => setEditingCommentText(event.target.value)}
                            rows={3}
                            className="w-full resize-none rounded-lg border border-gray-500/[0.1] bg-white dark:bg-dark px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                          />
                          <div className="flex justify-end gap-2">
                            <Button size="small" variant="secondary" onClick={handleCancelEditComment}>Cancel</Button>
                            <Button size="small" onClick={handleSaveCommentEdit}>Save</Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className={`mt-3 text-sm whitespace-pre-wrap p-2 w-[75%] ${comment.email === user?.email ? 'ml-auto bg-blue-100 dark:bg-blue-900/30 text-right rounded-l-lg' : 'bg-gray-100 dark:bg-gray-800 rounded-r-lg'} `}>{comment.message}</p>
                          {comment.email === user?.email ? (
                            <div className="mt-3 flex justify-end gap-2">
                              <Button size="small" variant="secondary" className="px-0" onClick={() => handleStartEditComment(index)}><PencilLineIcon /></Button>
                              <Button size="small" variant="secondary" className="px-0" onClick={() => handleDeleteComment(index)}><TrashIcon /></Button>
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 px-3">No comments yet. Start the conversation below.</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <textarea
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    rows={3}
                    placeholder="Write a comment..."
                    className="w-full resize-none rounded-lg border border-gray-500/[0.1] bg-white dark:bg-dark px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="flex justify-end">
                    <Button size="small" onClick={handleAddComment}>Add comment</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="max-h-64 overflow-y-auto pr-1 bg-background rounded-lg border border-gray-500/[0.1] py-3">
                  {subtasks.length > 0 ? subtasks.map((subtask, index) => (
                    <div key={`${subtask.author}-${subtask.createdAt || index}-${index}`} className="p-3 rounded-lg">
                      <div className={`flex items-start gap-3 rounded-lg p-3 ${subtask.completed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'} `}>
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          onChange={() => handleToggleSubtask(index)}
                          className="mt-1 h-4 w-4 accent-primary"
                        />
                        <div className="flex-1">
                          <p className={`text-sm whitespace-pre-wrap ${subtask.completed ? 'line-through text-gray-500' : ''}`}>{subtask.title}</p>
                        </div>
                        {subtask.email === user?.email ? (
                          <Button size="small" variant="secondary" className="px-0" onClick={() => handleDeleteSubtask(index)}><TrashIcon /></Button>
                        ) : null}
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 px-3">No subtasks yet. Add one below.</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <textarea
                    value={subtaskText}
                    onChange={(event) => setSubtaskText(event.target.value)}
                    rows={3}
                    placeholder="Add a subtask..."
                    className="w-full resize-none rounded-lg border border-gray-500/[0.1] bg-white dark:bg-dark px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="flex justify-end">
                    <Button size="small" onClick={handleAddSubtask}>Add subtask</Button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

          <div className="sticky bottom-0 bg-white dark:bg-dark overflow-x-auto flex flex-wrap justify-center gap-4 p-4 border-t border-gray-500/[0.1] ">
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
