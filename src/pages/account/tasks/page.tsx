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
import ResponsivePagination from "react-responsive-pagination";
import "react-responsive-pagination/themes/minimal-light-dark.css";
import { OWNER_PERMISSIONS } from "../../../interface/organization";


type ViewMode = 'kanban' | 'list' | 'grid' | 'calendar';
const LIST_PAGE_SIZE = 8;

const getTaskOrderIndex = (task: todo) => {
    const orderIndex = (task as todo & { orderIndex?: number }).orderIndex;
    return typeof orderIndex === 'number' ? orderIndex : Number.MAX_SAFE_INTEGER;
};

const sortTasksByOrder = (taskList: todo[]) => [...taskList].sort((left, right) => {
    const orderDiff = getTaskOrderIndex(left) - getTaskOrderIndex(right);
    if (orderDiff !== 0) return orderDiff;

    const createdDiff = new Date(left.$createdAt).getTime() - new Date(right.$createdAt).getTime();
    if (createdDiff !== 0) return createdDiff;

    return left.$id.localeCompare(right.$id);
});

function Tasks() {
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const { tasks, loading, getTasks, movePendingToToday, updateTask, deleteTask, reorderTasks } = useTasks();
    const [showMoveConfirm, setShowMoveConfirm] = useState(false);
    const [selectedTask, setSelectedTask] = useState<todo | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<todo | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [currentListPage, setCurrentListPage] = useState(1);
    const { user } = useUser();
    const compactMode = localStorage.getItem('compactMode') === 'true';
    
    const permissions = OWNER_PERMISSIONS || [];

    useEffect(() => {
    if (user) {
        getTasks(user.email || "");
    }
    }, [user]);

    const sortedTasks = sortTasksByOrder(tasks);
    const filteredTasks = filterStatus === 'all' ? sortedTasks : sortedTasks.filter(task => task.status === filterStatus);
    const listTotalPages = Math.max(1, Math.ceil(filteredTasks.length / LIST_PAGE_SIZE));
    const currentListTasks = filteredTasks.slice((currentListPage - 1) * LIST_PAGE_SIZE, currentListPage * LIST_PAGE_SIZE);

    useEffect(() => {
        setCurrentListPage(1);
    }, [filterStatus, viewMode]);

    useEffect(() => {
        setCurrentListPage((page) => Math.min(page, listTotalPages));
    }, [listTotalPages]);

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

    const reorderVisibleTasks = async (visibleTasks: todo[], targetTaskId: string) => {
        if (!draggedTaskId) return;

        const orderedTasks = sortTasksByOrder(tasks);
        const visibleTaskIds = new Set(visibleTasks.map((task) => task.$id));
        const visibleOrderedTasks = orderedTasks.filter((task) => visibleTaskIds.has(task.$id));

        const draggedIndex = visibleOrderedTasks.findIndex((task) => task.$id === draggedTaskId);
        const targetIndex = visibleOrderedTasks.findIndex((task) => task.$id === targetTaskId);

        if (draggedIndex < 0 || targetIndex < 0 || draggedIndex === targetIndex) {
            return;
        }

        const nextVisibleTasks = [...visibleOrderedTasks];
        const [movedTask] = nextVisibleTasks.splice(draggedIndex, 1);
        nextVisibleTasks.splice(targetIndex, 0, movedTask);

        let cursor = 0;
        const nextOrderedTasks = orderedTasks.map((task) => {
            if (!visibleTaskIds.has(task.$id)) {
                return task;
            }

            const replacement = nextVisibleTasks[cursor];
            cursor += 1;
            return replacement;
        });

        await reorderTasks(nextOrderedTasks.map((task) => task.$id));
    };

    if (loading) {
        return <TaskSkeletonLoader />;
    }

    return (
        <>
        <div className="flex flex-col gap-4 md:m-0 mx-2 pb-6 h-full">
            <div className="flex justify-between gap-4 items-start rounded-[10px] border border-gray-500/[0.1] flex-wrap md:p-6 p-4 bg-white dark:bg-dark-bg">
                <div className="flex gap-4 items-center">
                    <h1 className="font-medium md:text-[24px] text-[18px] leading-[120%]">
                        Your Tasks
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {tasks.length} total tasks
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
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
                                        <Icon size={18} />
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
                
                {/* <p className="md:hidden">Swipe a task to the left to <span className="font-semibold text-red-500">delete</span> and right to <span className="font-semibold text-green-500">complete</span></p> */}
            </div>

            {/* Kanban View */}
            {viewMode === 'kanban' && (
                <Kanban tasks={sortedTasks} filteredStatus={filterStatus} onReorderTasks={reorderVisibleTasks} onTaskDragStart={setDraggedTaskId} onTaskDragEnd={() => setDraggedTaskId(null)} />
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
                            <div className={`hidden md:grid ${!compactMode ? 'md:grid-cols-12' : 'md:grid-cols-6'} gap-4 px-4 pl-11 py-2 text-sm font-medium text-gray-500 uppercase border-b border-gray-500/[0.2]`}>
                                <div className="col-span-4">Task</div>
                                {!compactMode && (
                                    <>
                                    <div className="col-span-2 px-2">Category</div>
                                    <div className="col-span-2 px-2">Status</div>
                                    <div className="col-span-2 px-2">Priority</div>
                                    </>
                                )}
                                <div className="col-span-2 px-1">Due Date</div>
                            </div>
                            
                            {/* List Items */}
                            {currentListTasks.map((task, index) => (
                                <TaskListView
                                    key={task.$id}
                                    task={task}
                                    openTaskDetails={openTaskDetails}
                                    index={(currentListPage - 1) * LIST_PAGE_SIZE + index}
                                    draggable
                                    onDrop={async () => {
                                        await reorderVisibleTasks(currentListTasks, task.$id);
                                        setDraggedTaskId(null);
                                    }}
                                    onDragStart={(dragTask, event) => {
                                        setDraggedTaskId(dragTask.$id);
                                        event.dataTransfer.effectAllowed = 'move';
                                        event.dataTransfer.setData('text/plain', dragTask.$id);
                                    }}
                                    onDragEnd={() => {
                                        setDraggedTaskId(null);
                                    }}
                                    permissions={permissions}
                                />
                            ))}

                            {listTotalPages > 1 && (
                                <div className="flex justify-center pt-4">
                                    <ResponsivePagination
                                        current={currentListPage}
                                        total={listTotalPages}
                                        onPageChange={setCurrentListPage}
                                        className="pagination"
                                    />
                                </div>
                            )}
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
                            <TodoCard
                                key={task.$id}
                                {...task}
                                draggable
                                onDragStart={() => setDraggedTaskId(task.$id)}
                                onDragEnd={() => setDraggedTaskId(null)}
                                onDrop={async () => {
                                    await reorderVisibleTasks(filteredTasks, task.$id);
                                    setDraggedTaskId(null);
                                }}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Calendar View */}
            {viewMode === 'calendar' && (
                <Calendar tasks={sortedTasks} openTaskDetails={openTaskDetails} handleQuickComplete={handleQuickComplete} setTaskToDelete={setTaskToDelete} deleteTask={(id) => deleteTask(id)} />
            )}
        </div>

        {/* Task Details Modal (for list/grid/calendar clicks) */}
        {selectedTask && (
            <TaskDetailsModal
                isOpen={detailsOpen}
                onClose={closeTaskDetails}
                task={selectedTask}
                permissions={permissions}
            />
        )}
        </>
    );
}

export default Tasks;
