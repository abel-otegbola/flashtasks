import { useState } from "react";
import SwipeDeleteItem from "../ui/swipeDeleteItem";
import TaskCheckbox from "../ui/taskCheckbox";
import FocusMode from "../focusMode/focusMode";
import { shouldConfirmBeforeDeletingTasks } from "../../helpers/appPreferences";


export default function Calendar({ tasks, openTaskDetails, handleQuickComplete, setTaskToDelete, deleteTask }: { tasks: any[]; openTaskDetails: (task: any) => void; handleQuickComplete: (taskId: string, checked: boolean) => void; setTaskToDelete: (task: any) => void; deleteTask: (taskId: string) => Promise<void> | void }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [focusModeTask, setFocusModeTask] = useState<any | null>(null);
    const confirmBeforeDelete = shouldConfirmBeforeDeletingTasks();

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

    return (
        <div className="flex flex-col gap-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 bg-bg-gray-100 dark:bg-dark-bg/50 rounded-lg border border-gray-500/[0.2]">
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
                    <div key={`empty-${i}`} className="p-2 min-h-[100px] bg-gray-50 dark:bg-dark-bg/20 rounded-lg" />
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
                                    : 'border-gray-500/[0.2] bg-bg-gray-100 dark:bg-dark-bg/50'
                            } hover:shadow-md transition-shadow`}
                        >
                            <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-primary' : ''}`}>
                                {day}
                            </div>
                            <div className="flex flex-col gap-1">
                                {tasksForDay.slice(0, 3).map(task => (
                                    <SwipeDeleteItem
                                        key={task.$id}
                                        onSwipeLeft={() => {
                                            if (confirmBeforeDelete) {
                                                setTaskToDelete(task);
                                                return;
                                            }

                                            void deleteTask(task.$id);
                                        }}
                                        onLongPress={() => setFocusModeTask(task)}
                                        className="rounded"
                                    >
                                        <div
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
                                            <div className="flex items-center gap-2">
                                                <TaskCheckbox
                                                    checked={task.status === 'completed'}
                                                    onCheckedChange={(checked) => {
                                                        void handleQuickComplete(task.$id, checked);
                                                    }}
                                                    ariaLabel={`Mark ${task.title} as completed`}
                                                    className="shrink-0"
                                                />
                                                <span className="truncate">{task.title}</span>
                                            </div>
                                        </div>
                                    </SwipeDeleteItem>
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

            {focusModeTask && (
                <FocusMode task={focusModeTask} setOpen={(open) => !open && setFocusModeTask(null)} />
            )}
        </div>
    );
}