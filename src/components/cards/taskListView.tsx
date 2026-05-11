import { todo } from "../../interface/todo"
import { useTasks } from "../../context/tasksContext"
import TaskCheckbox from "../ui/taskCheckbox"
import SwipeDeleteItem from "../ui/swipeDeleteItem";
import Confirmationmessage from "../modals/confirmation";
import { useState, type DragEvent } from "react";
import { formatDeliveredTime } from "../../helpers/messageTime";
import { PlayIcon } from "@phosphor-icons/react";
import FocusMode from "../focusMode/focusMode";
import { shouldConfirmBeforeDeletingTasks } from "../../helpers/appPreferences";
import { useOrganizations } from "../../context/organizationContext";
import toast from 'react-hot-toast';

type Props = {
    task: todo;
    openTaskDetails: (task: todo) => void;
    index: number;
    draggable?: boolean;
    onDragStart?: (task: todo, event: DragEvent<HTMLDivElement>) => void;
    onDragEnd?: (task: todo, event: DragEvent<HTMLDivElement>) => void;
    onDrop?: (task: todo, event: DragEvent<HTMLDivElement>) => void;
};

export default function TaskListView({ task, openTaskDetails, index, draggable = false, onDragStart, onDragEnd, onDrop }: Props) {
    const { updateTask, deleteTask } = useTasks();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [startPomodoro, setStartPomodoro] = useState<todo | null>(null);
    const confirmBeforeDelete = shouldConfirmBeforeDeletingTasks();
    const { organizations } = useOrganizations();

  const canEdit = !organizations.find((org) => org.$id === task.organizationId);

  return (
    <>
    {showDeleteConfirm && (
        <Confirmationmessage
            title={`Delete task: ${task.title}?`}
            text="This action cannot be undone."
            buttonText="Delete"
            setOpen={(open) => !open && setShowDeleteConfirm(false)}
            onConfirm={() => deleteTask(task.$id)}
        />
    )}
    <SwipeDeleteItem 
        onSwipeLeft={() => {
            if (!canEdit) {
                toast.error('You do not have permission to delete this task');
                return;
            }

            if (confirmBeforeDelete) {
                setShowDeleteConfirm(true);
                return;
            }

            void deleteTask(task.$id);
        }} 
        onSwipeRight={() => {
            if (!canEdit) {
                toast.error('You do not have permission to update this task');
                return;
            }
            return updateTask(task.$id, { status: task.status === 'completed' ? 'pending' : 'completed' });
        }}
        onLongPress={() => setStartPomodoro(task)}
        className={`relative flex flex-col overflow-hidden transition-all cursor-pointer ${isDragging ? 'opacity-50 scale-[0.98]' : ''}`}
    >
    <div className={`flex md:items-center items-start border border-gray-500/[0.1] rounded-lg hover:shadow-sm transition-shadow cursor-pointer ${index % 2 !== 0 ? 'bg-white dark:bg-dark-bg' : 'bg-white dark:bg-dark-bg/[0.6]'}`}
        draggable={draggable}
        onDragStart={(event) => {
            if (!draggable) return;
            setIsDragging(true);
            onDragStart?.(task, event);
        }}
        onDragEnd={(event) => {
            if (!draggable) return;
            setIsDragging(false);
            onDragEnd?.(task, event);
        }}
        onDragOver={(event) => {
            if (draggable) event.preventDefault();
        }}
        onDrop={(event) => {
            if (!draggable) return;
            event.preventDefault();
            onDrop?.(task, event);
        }}
    >
        <div className="flex items-start md:items-center p-4 pr-0 md:col-span-1">
            {
                task.status === 'completed' ? (
                    <TaskCheckbox
                        ariaLabel="completed"
                        checked={true}
                        onCheckedChange={() => {}}
                    />
                ) : (
                    <button
                        className=""
                        aria-label="Start Pomodoro for task"
                        title="Focus mode"
                        onClick={(e) => {
                            e.stopPropagation();
                            setStartPomodoro(task);
                        }}
                    >
                        <PlayIcon size={16} className="text-gray-400" />
                    </button>
                )
            }
        </div>
        <div 
            key={task.$id}
            onClick={() => openTaskDetails(task)}
            role="button"
            tabIndex={0}
            className={`md:grid md:grid-cols-12 flex flex-col gap-4 px-4 py-3 flex-1`}
        >
            {/* Mobile Layout */}
            <div className="md:col-span-4 flex flex-col gap-1 md:order-none order-1">
                <h3 className="font-semibold text-sm">{task.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 md:line-clamp-1">{task.description}</p>
            </div>
            
            {/* Desktop Layout - Remaining columns */}
            <div className="md:col-span-2 md:flex hidden items-center md:justify-start">
                <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700">
                    {task.category}
                </span>
            </div>
            <div className="md:col-span-2 md:flex hidden items-center md:justify-start text-nowrap">
                <span className={`text-xs px-2 py-1 rounded-full ${
                    task.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    task.status === 'in progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    task.status === 'suspended' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    task.status === 'pending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                    {task.status}
                </span>
            </div>
            <div className="md:col-span-2 flex items-center md:justify-start md:order-none order-0">
                <span className={`text-xs px-2 py-1 rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                    {task.priority || 'medium'}
                </span>
            </div>
            <div className="md:col-span-2 flex items-center text-xs text-gray-500 dark:text-gray-400 md:order-none order-1">
                {task.dueDate ? formatDeliveredTime(task.dueDate, undefined, 'future') : 'No date'}
            </div>
        </div>
    
    </div>
    </SwipeDeleteItem>

    {
        startPomodoro && (
            <FocusMode task={startPomodoro} setOpen={(open) => !open && setStartPomodoro(null)} />
        )
    }
    
    </>
    )
}