"use client";

import { useState, useRef, useEffect, type DragEvent } from "react";
import { ChatLine, MenuDots, Pen, TrashBinMinimalistic } from "@solar-icons/react";
import { todo } from "../../interface/todo";
import TaskDetailsModal from "../modals/taskDetailsModal";
import { useOrganizations } from '../../context/organizationContext';
import { useTasks } from "../../context/tasksContext";
import Confirmationmessage from "../modals/confirmation";
import EditTaskModal from "../modals/editTaskModal";
import TaskCheckbox from "../ui/taskCheckbox";
import SwipeDeleteItem from "../ui/swipeDeleteItem";
import { formatDeliveredTime } from "../../helpers/messageTime";

type TodoCardProps = todo & {
  draggable?: boolean;
  onDragStart?: (task: todo, event: DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (task: todo, event: DragEvent<HTMLDivElement>) => void;
};

function TodoCard(task: TodoCardProps) {
  const { title, description, comments, category, status } = task;
  const [openMenu, setOpenMenu] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { deleteTask, updateTask } = useTasks();

  const statusColors: Record<
    string,
    { border: string; bg: string; text: string }
  > = {
    upcoming: {
      border: "border-blue-400/30",
      bg: "bg-blue-400/[0.1]",
      text: "text-blue-500",
    },
    "in progress": {
      border: "border-yellow-400/30",
      bg: "bg-yellow-400/[0.1]",
      text: "text-yellow-500",
    },
    pending: {
      border: "border-orange-400/30",
      bg: "bg-orange-400/[0.1]",
      text: "text-orange-500",
    },
    completed: {
      border: "border-green-400/30",
      bg: "bg-green-400/[0.1]",
      text: "text-green-500",
    },
    suspended: {
      border: "border-red-400/30",
      bg: "bg-red-400/[0.1]",
      text: "text-red-500",
    },
  };

  const color = statusColors[status] || statusColors.upcoming;
  const assigneeList = Array.isArray(task?.assignees)
    ? task.assignees
    : [];

  // Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <SwipeDeleteItem
        className={`relative flex flex-col overflow-hidden transition-all cursor-pointer ${isDragging ? 'opacity-50 scale-[0.98]' : ''}`}
        onSwipeLeft={() => setShowDeleteConfirmation(true)}
        onSwipeRight={() => updateTask(task.$id, { status: status === 'completed' ? 'pending' : 'completed' }) }
      >
      <div
        className={`border-t-3 ${color.border} border rounded-[10px] bg-white dark:bg-dark-bg hover:shadow-md `}
        onClick={() => setShowDetails(true)}
        draggable={task.draggable}
        onDragStart={(event) => {
          setIsDragging(true);
          task.onDragStart?.(task, event);
        }}
        onDragEnd={(event) => {
          setIsDragging(false);
          task.onDragEnd?.(task, event);
        }}
        onDragOver={(event) => {
          if (task.draggable) event.preventDefault();
        }}
      >
        <div className="flex flex-col gap-3 p-4">
          <div className="flex justify-between gap-4 items-start">
            <div className="flex items-center gap-2">
              <TaskCheckbox
                checked={status === 'completed'}
                onCheckedChange={(checked) => {
                  void updateTask(task.$id, { status: checked ? 'completed' : 'pending' });
                }}
                ariaLabel={`Mark ${title} as completed`}
              />
              <p
                className={`p-1 px-3 font-medium rounded-full text-[10px] w-fit ${color.bg} ${color.text}`}
              >
                {category}
              </p>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(!openMenu);
                }}
                className="rotate-[90deg] text-gray-500 hover:text-gray-700"
              >
                <MenuDots size={16} color="currentColor" />
              </button>

              {openMenu && (
                <div className="absolute right-0 top-6 bg-white dark:bg-dark-bg border border-gray-100 dark:border-gray-700 rounded-lg shadow-md w-32 z-20 animate-fadeIn">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEditModal(true);
                      setOpenMenu(false);
                    }}
                    className="flex items-center gap-2 w-full text-left text-sm p-2 hover:bg-gray-50 dark:hover:bg-dark-bg text-gray-700 dark:text-gray-300"
                  >
                    <Pen size={14} /> Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirmation(true);
                      setOpenMenu(false);
                    }}
                    className="flex items-center gap-2 w-full text-left text-sm p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500"
                  >
                    <TrashBinMinimalistic size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          <h2 className="font-semibold text-[12px]">{title}</h2>
          <p className="text-[10px] text-gray-400 line-clamp-2">{description}</p>
          {/* Organization / Team display */}
          <div className="mt-2 flex gap-2 items-center justify-between flex-wrap">
            {/* find org/team names */}
            {(() => {
              try {
                const org = (useOrganizations().organizations || []).find(o => o.$id === (task as any).organizationId);
                if (org) {
                  const team = (org.teams || []).find((t: any) => t.$id === (task as any).teamId);
                  return (
                    <>
                      <span className="text-[11px] px-4 py-1 rounded-full bg-gray-100 dark:bg-[#202020]">{org.name}</span>
                      {team && <span className="text-[11px] px-4 py-1 rounded-full bg-gray-100 dark:bg-[#202020]">{team.name}</span>}
                    </>
                  )
                }
                return null;
              } catch { return null }
            })()}
            <p className="text-xs">Due: {task.dueDate ? formatDeliveredTime(task.dueDate, undefined, 'future') : 'No date'}</p>
          </div>
        </div>

        <div className="flex justify-between gap-4 flex-wrap p-2 px-4 border-t border-gray-100 dark:border-gray-500/[0.2]">
          <div className="flex ml-2">
            {[...assigneeList, task.userEmail].filter(Boolean).map((initial, index) => (
              <span key={index} className="border-2 border-white -ml-2 flex items-center w-8 h-8 rounded-full bg-gray-100 dark:bg-[#202020] dark:border-[#151515] flex items-center justify-center text-[10px]">
                {String(initial).trim().charAt(0).toUpperCase()}
              </span>
            ))}
          </div>
          <p className="text-[12px] flex gap-1 items-center text-gray-500">
            <ChatLine size={12} color="currentColor" />
            {comments}
          </p>
        </div>
      </div>
      </SwipeDeleteItem>

      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        task={task}
      />
      <EditTaskModal
        task={task}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />

      {showDeleteConfirmation && (
        <Confirmationmessage
          title={`Delete task: ${title}?`}
          text="This action cannot be undone."
          buttonText="Delete"
          setOpen={setShowDeleteConfirmation}
          onConfirm={async () => {
            await deleteTask(task.$id);
            setShowDeleteConfirmation(false);
          }}
        />
      )}
    </>
  );
}

export default TodoCard;
