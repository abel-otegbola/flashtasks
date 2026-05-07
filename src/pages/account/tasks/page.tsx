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
import TaskListView from "../../../components/cards/taskListView";
import Dropdown from "../../../components/dropdown/dropdown";
import Kanban from "../../../components/views/kanban";
import Calendar from "../../../components/views/calendar";


type ViewMode = 'kanban' | 'list' | 'grid' | 'calendar';

function Tasks() {
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('kanban');
    const { tasks, loading, getTasks, movePendingToToday, updateTask, deleteTask } = useTasks();
    const [showMoveConfirm, setShowMoveConfirm] = useState(false);
    const [selectedTask, setSelectedTask] = useState<todo | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<todo | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const { user } = useUser();

    useEffect(() => {
    if (user) {
        getTasks(user.email || "");
    }
    }, [user]);

    const filteredTasks = filterStatus === 'all' ? tasks : tasks.filter(task => task.status === filterStatus);

    const openTaskDetails = (task: todo) => {
        setSelectedTask(task);
        setDetailsOpen(true);
    };

    const closeTaskDetails = () => {
        setDetailsOpen(false);
        setSelectedTask(null);
    };

    const handleQuickComplete = async (taskId: string, checked: boolean) => {
        await updateTask(taskId, { status: checked ? 'completed' : 'pending' });
    };

    const handleDeleteTask = async () => {
        if (!taskToDelete) return;
        await deleteTask(taskToDelete.$id);
        setTaskToDelete(null);
    };

    if (loading) {
        return <TaskSkeletonLoader />;
    }

    return (
        <>
        <div className="flex flex-col gap-6 md:m-0 mx-4 h-full">
            <div className="flex justify-between gap-4 items-start rounded-[10px] border border-gray-500/[0.1] flex-wrap md:p-6 p-4 bg-white dark:bg-dark-bg">
                <div className="flex gap-4 items-center">
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
                    {taskToDelete && (
                        <Confirmationmessage
                            title={`Delete task: ${taskToDelete.title}?`}
                            text="This action cannot be undone."
                            buttonText="Delete"
                            setOpen={(open) => !open && setTaskToDelete(null)}
                            onConfirm={handleDeleteTask}
                        />
                    )}
                    {/* Filter by status */}
                    <div className="flex items-center gap-2">
                        <Dropdown
                            options={[
                                { id: 'all', title: 'All' },
                                { id: 'pending', title: 'Pending' },
                                { id: 'in progress', title: 'In Progress' },
                                { id: 'completed', title: 'Completed' },
                                { id: 'suspended', title: 'Suspended' },
                            ]}
                            value={filterStatus}
                            onChange={(value) => setFilterStatus(value)}
                            placeholder="Filter by status"
                            className="w-[150px]"
                        />
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-1 bg-bg-gray-100 dark:bg-dark-bg p-1 rounded-lg border border-gray-500/[0.2]">
                        {
                            ['list', 'kanban', 'grid', 'calendar'].map(mode => {
                                const Icon = mode === 'list' ? List : mode === 'kanban' ? Widget4 : mode === 'grid' ? Widget : CalendarIcon;
                                return (
                                    <button
                                        key={mode}
                                        onClick={() => setViewMode(mode as ViewMode)}
                                        className={`p-1 rounded-md transition-all ${
                                            viewMode === mode 
                                                ? 'bg-white dark:bg-dark-bg text-primary shadow-sm'
                                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                        }`}
                                        title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} View`}
                                    >
                                        <Icon size={20} />
                                    </button>
                                );
                            })
                        }
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
                
                <p className="md:hidden">Swipe a task to the left to <span className="font-semibold text-red-500">delete</span> and right to <span className="font-semibold text-green-500">complete</span></p>
            </div>

            {/* Kanban View */}
            {viewMode === 'kanban' && (
                <Kanban tasks={tasks} filteredStatus={filterStatus} />
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="flex flex-col gap-3">
                    {filteredTasks.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                            No tasks yet. Create your first task!
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {/* List Header - Hidden on mobile */}
                            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase border-b border-gray-500/[0.2]">
                                <div className="col-span-4">Task</div>
                                <div className="col-span-2 px-2">Category</div>
                                <div className="col-span-2 px-2">Status</div>
                                <div className="col-span-2 px-2">Priority</div>
                                <div className="col-span-2 px-2">Due Date</div>
                            </div>
                            
                            {/* List Items */}
                            {filteredTasks.map((task, index) => (
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
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
                    {filteredTasks.length === 0 ? (
                        <div className="col-span-full text-center py-8 text-gray-400 dark:text-gray-500">
                            No tasks yet. Create your first task!
                        </div>
                    ) : (
                        filteredTasks.map((task) => (
                            <TodoCard key={task.$id} {...task} />
                        ))
                    )}
                </div>
            )}

            {/* Calendar View */}
            {viewMode === 'calendar' && (
                <Calendar tasks={tasks} openTaskDetails={openTaskDetails} handleQuickComplete={handleQuickComplete} setTaskToDelete={setTaskToDelete} />
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
