'use client';
import { useEffect, useState } from "react";
import { Widget4, List, Calendar as CalendarIcon, Widget } from "@solar-icons/react";
import TodoCard from "../../../components/cards/todoCard";
import TaskDetailsModal from "../../../components/modals/taskDetailsModal";
import { todo } from "../../../interface/todo";
import Button from "../../../components/button/button";
import { useTasks } from "../../../context/tasksContext";
import Confirmationmessage from "../../../components/modals/confirmation";
import { useUser } from "../../../context/authContext";
import CreateTaskModal from "../../../components/modals/createTaskModal";
import { TaskSkeletonLoader } from "../../../components/skeletons";

const sections = [
  { key: "todo", title: "Todo", filter: "upcoming", color: "yellow" },
  { key: "inProgress", title: "In Progress", filter: "in progress", color: "blue" },
  { key: "reviewed", title: "Reviewed", filter: "pending", color: "orange" },
  { key: "completed", title: "Completed", filter: "completed", color: "green" },
  { key: "suspended", title: "Suspended", filter: "suspended", color: "red" },
] as const;

const colorClasses: Record<string, string> = {
  yellow: "border-yellow-200/[0.4] dark:border-gray-500/[0.2]",
  blue: "border-blue-200/[0.4] dark:border-gray-500/[0.2]",
  orange: "border-orange-200/[0.4] dark:border-gray-500/[0.2]",
  green: "border-green-200/[0.4] dark:border-gray-500/[0.2]",
  red: "border-red-200/[0.4] dark:border-gray-500/[0.2]",
};

type ViewMode = 'kanban' | 'list' | 'grid' | 'calendar';

function Tasks() {
    const [openSections] = useState<Record<string, boolean>>({});
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('kanban');
    const [currentDate, setCurrentDate] = useState(new Date());
    const { tasks, loading, getTasks, movePendingToToday } = useTasks();
    const [showMoveConfirm, setShowMoveConfirm] = useState(false);
    const [selectedTask, setSelectedTask] = useState<todo | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const { user } = useUser();

    useEffect(() => {
    if (user) {
        getTasks(user.email || "");
    }
    }, [user]);

    const openTaskDetails = (task: todo) => {
        setSelectedTask(task);
        setDetailsOpen(true);
    };

    const closeTaskDetails = () => {
        setDetailsOpen(false);
        setSelectedTask(null);
    };
    // Calendar helper functions
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const getTasksForDate = (date: Date) => {
        return tasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            return taskDate.getDate() === date.getDate() &&
                   taskDate.getMonth() === date.getMonth() &&
                   taskDate.getFullYear() === date.getFullYear();
        });
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    if (loading) {
        return <TaskSkeletonLoader />;
    }

    return (
        <>
        <div className="flex flex-col gap-6 bg-white dark:bg-dark-bg md:rounded-[10px] p-6 h-full mb-4">
            <div className="flex justify-between gap-6 items-start flex-wrap">
                <div>
                    <h1 className="font-medium md:text-[24px] text-[18px] leading-[120%]">
                        Your Tasks
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {tasks.length} total tasks
                    </p>
                </div>

                <div className="flex items-center flex-wrap gap-4">
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={() => setShowMoveConfirm(true)}
                        className=""
                    >
                        Move pending → today
                    </Button>
                    {showMoveConfirm && (
                        <Confirmationmessage
                            title="Move pending tasks to today?"
                            text="This will set the due date of all tasks with status 'pending' to today."
                            buttonText="Move"
                            setOpen={setShowMoveConfirm}
                            onConfirm={async () => { await movePendingToToday(); setShowMoveConfirm(false); }}
                        />
                    )}
                    {/* View Toggle */}
                    <div className="flex items-center gap-1 bg-bg-gray-100 dark:bg-dark-bg-secondary p-1 rounded-lg border border-gray-500/[0.2]">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1 rounded-md transition-all ${
                                viewMode === 'list' 
                                    ? 'bg-white dark:bg-dark-bg text-primary shadow-sm' 
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                            title="List View"
                        >
                            <List size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-1 rounded-md transition-all ${
                                viewMode === 'kanban' 
                                    ? 'bg-white dark:bg-dark-bg text-primary shadow-sm' 
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                            title="Kanban View"
                        >
                            <Widget4 size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1 rounded-md transition-all ${
                                viewMode === 'grid' 
                                    ? 'bg-white dark:bg-dark-bg text-primary shadow-sm' 
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                            title="Grid View"
                        >
                            <Widget size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`p-1 rounded-md transition-all ${
                                viewMode === 'calendar' 
                                    ? 'bg-white dark:bg-dark-bg text-primary shadow-sm' 
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                            title="Calendar View"
                        >
                            <CalendarIcon size={16} />
                        </button>
                    </div>

                    <Button
                        onClick={() => setShowModal(true)}
                        className="text-dark"
                        size="small"
                        disabled={loading}
                    > 
                        + New Task
                    </Button>

                    <CreateTaskModal
                        isOpen={showModal}
                        onClose={() => setShowModal(false)}
                    />
                </div>
            </div>

            {/* Kanban View */}
            {viewMode === 'kanban' && (
                <div className="grid lg:grid-cols-5 sm:grid-cols-2 grid-cols-1 gap-4 items-start">
                    {/* Task Statistics */}
                    {sections.map(({ key, title, filter, color }) => {
                        const count = tasks.filter((t) => t.status === filter).length;
                        return (
                            <div 
                                key={key} 
                                className={`p-4 rounded-lg border ${colorClasses[color]} bg-white dark:bg-dark-bg-secondary/50`}
                            >
                                <p className="text-gray-400 text-xs mb-1">{title}</p>
                                <p className="text-2xl font-bold">{count}</p>
                            </div>
                        );
                    })}
                    {sections.map(({ key, title, filter, color }) => (
                        <div key={key} className="flex flex-col gap-2">
                            <div
                                className={`flex flex-col gap-4 overflow-hidden transition-all duration-300 
                                    ${openSections[key] ? "max-h-[2000px]" : "max-h-0 md:max-h-none"}
                                `}
                            >
                                {tasks.filter((t) => t.status === filter).length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                        No tasks in {title.toLowerCase()}
                                    </div>
                                ) : (
                                    tasks
                                        .filter((t) => t.status === filter)
                                        .map((task) => (
                                            <TodoCard key={task.$id} {...task} />
                                        ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="flex flex-col gap-3 border border-gray-500/[0.1] rounded-lg p-4 bg-bg-gray-100/[0.2] dark:bg-dark-bg">
                    {tasks.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                            No tasks yet. Create your first task!
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {/* List Header - Hidden on mobile */}
                            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase border-b border-gray-500/[0.2]">
                                <div className="col-span-4">Task</div>
                                <div className="col-span-2">Category</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-2">Priority</div>
                                <div className="col-span-2">Due Date</div>
                            </div>
                            
                            {/* List Items */}
                            {tasks.map((task, index) => (
                                <div 
                                    key={task.$id}
                                    onClick={() => openTaskDetails(task)}
                                    role="button"
                                    tabIndex={0}
                                    className={`md:grid md:grid-cols-12 flex flex-col gap-4 px-4 py-3 border border-gray-500/[0.1] rounded-lg hover:shadow-sm transition-shadow cursor-pointer ${index % 2 !== 0 ? 'bg-white dark:bg-dark-bg' : 'bg-white dark:bg-dark'}`}
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
                                    <div className="md:col-span-2 md:flex hidden items-center md:justify-start">
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
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
                    {tasks.length === 0 ? (
                        <div className="col-span-full text-center py-8 text-gray-400 dark:text-gray-500">
                            No tasks yet. Create your first task!
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <TodoCard key={task.$id} {...task} />
                        ))
                    )}
                </div>
            )}

            {/* Calendar View */}
            {viewMode === 'calendar' && (
                <div className="flex flex-col gap-4">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between p-4 bg-bg-gray-100 dark:bg-dark-bg-secondary/50 rounded-lg border border-gray-500/[0.2]">
                        <button
                            onClick={() => changeMonth(-1)}
                            className="p-2 hover:bg-white dark:hover:bg-dark-bg rounded-lg transition-colors"
                        >
                            <span className="text-xl">←</span>
                        </button>
                        <h2 className="text-xl font-bold">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <button
                            onClick={() => changeMonth(1)}
                            className="p-2 hover:bg-white dark:hover:bg-dark-bg rounded-lg transition-colors"
                        >
                            <span className="text-xl">→</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {/* Day names header */}
                        {dayNames.map(day => (
                            <div key={day} className="p-2 text-center font-semibold text-gray-500 dark:text-gray-400 text-sm">
                                {day}
                            </div>
                        ))}

                        {/* Empty cells for days before month starts */}
                        {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, i) => (
                            <div key={`empty-${i}`} className="p-2 min-h-[100px] bg-gray-50 dark:bg-dark-bg-secondary/20 rounded-lg" />
                        ))}

                        {/* Calendar days */}
                        {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
                            const day = i + 1;
                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                            const tasksForDay = getTasksForDate(date);
                            const isToday = new Date().toDateString() === date.toDateString();

                            return (
                                <div
                                    key={day}
                                    className={`p-2 min-h-[100px] border rounded-lg ${
                                        isToday 
                                            ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                                            : 'border-gray-500/[0.2] bg-bg-gray-100 dark:bg-dark-bg-secondary/50'
                                    } hover:shadow-md transition-shadow`}
                                >
                                    <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-primary' : ''}`}>
                                        {day}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {tasksForDay.slice(0, 3).map(task => (
                                            <div
                                                key={task.$id}
                                                onClick={() => openTaskDetails(task)}
                                                role="button"
                                                tabIndex={0}
                                                className={`text-xs p-1 rounded truncate cursor-pointer ${
                                                    task.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    task.status === 'in progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    task.status === 'suspended' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    task.status === 'pending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}
                                                title={task.title}
                                            >
                                                {task.title}
                                            </div>
                                        ))}
                                        {tasksForDay.length > 3 && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                                                +{tasksForDay.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>

        {/* Task Details Modal (for list/grid/calendar clicks) */}
        {selectedTask && (
            <TaskDetailsModal
                isOpen={detailsOpen}
                onClose={closeTaskDetails}
                task={selectedTask}
            />
        )}
        </>
    );
}

export default Tasks;
