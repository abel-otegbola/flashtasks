import { useState } from "react";
import { todo } from "../../interface/todo";
import { useTasks } from "../../context/tasksContext";
import TodoCard from "../cards/todoCard";

export default function Kanban({ tasks, filteredStatus }: { tasks: todo[]; filteredStatus: string }) {
    const [openSections, setOpenSections] = useState<string>("");
    const [dragOverSectionKey, setDragOverSectionKey] = useState<string | null>(null);
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const { updateTask } = useTasks();
    
    const filteredTasks = filteredStatus === 'all' ? tasks : tasks.filter(task => task.status === filteredStatus);
    
    const colorClasses: Record<string, string> = {
        yellow: "border-yellow-400/[0.2]",
        blue: "border-blue-400/[0.2]",
        orange: "border-orange-400/[0.2]",
        green: "border-green-400/[0.2]",
        red: "border-red-400/[0.2]",
    };

    const sections = [
        { key: "todo", title: "Todo", filter: "upcoming", color: "blue" },
        { key: "reviewed", title: "Reviewed", filter: "pending", color: "orange" },
        { key: "inProgress", title: "In Progress", filter: "in progress", color: "yellow" },
        { key: "completed", title: "Completed", filter: "completed", color: "green" },
        { key: "suspended", title: "Suspended", filter: "suspended", color: "red" },
    ] as const;

    const handleSectionDrop = async (sectionKey: string, taskStatus: todo['status']) => {
        if (!draggedTaskId) return;

        const draggedTask = tasks.find(task => task.$id === draggedTaskId);
        if (!draggedTask || draggedTask.status === taskStatus) {
            setDraggedTaskId(null);
            setDragOverSectionKey(null);
            return;
        }

        setOpenSections(sectionKey);
        await updateTask(draggedTaskId, { status: taskStatus });
        setDraggedTaskId(null);
        setDragOverSectionKey(null);
    };


    return (
        <div className="grid lg:grid-cols-5 sm:grid-cols-2 grid-cols-1 gap-4 items-stretch rounded-lg max-h-[72vh] overflow-y-auto">
            {/* Task Statistics */}
            {sections.map(({ key, title, filter, color }) => (
                <div
                    key={key}
                    className={`flex flex-col h-full gap-2 rounded-lg transition-all ${dragOverSectionKey === key ? 'ring-2 ring-primary/30 bg-primary/[0.03]' : ''}`}
                    onDragOver={(event) => event.preventDefault()}
                    onDragEnter={() => setDragOverSectionKey(key)}
                    onDragLeave={() => setDragOverSectionKey((current) => current === key ? null : current)}
                    onDrop={async (event) => {
                        event.preventDefault();
                        await handleSectionDrop(key, filter);
                    }}
                >
                    <button 
                        key={key} 
                        className={`p-4 md:text-center text-start z-[2] sticky top-0 rounded-lg border ${colorClasses[color]} bg-white dark:bg-dark-bg`}
                        onClick={() => setOpenSections(prev => prev === key ? '' : key)}                                
                    >
                        <p className="text-gray-400 text-xs mb-1">{title}</p>
                        <p className="text-2xl font-bold">{tasks.filter((t) => t.status === filter).length}</p>
                    </button>
                    <div
                        className={`flex flex-col gap-4 overflow-hidden transition-all duration-300
                            ${openSections === key ? "max-h-[2000px]" : "max-h-0 md:max-h-none"}
                        `}
                    >
                        {filteredTasks.filter((t) => t.status === filter).length === 0 ? (
                            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                No tasks in {title.toLowerCase()}
                            </div>
                        ) : (
                            filteredTasks
                                .filter((t) => t.status === filter)
                                .map((task) => (
                                    <TodoCard
                                        key={task.$id}
                                        {...task}
                                        draggable
                                        onDragStart={(dragTask, event) => {
                                            setDraggedTaskId(dragTask.$id);
                                            event.dataTransfer.effectAllowed = 'move';
                                            event.dataTransfer.setData('text/plain', dragTask.$id);
                                        }}
                                        onDragEnd={() => setDraggedTaskId(null)}
                                    />
                                ))
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}