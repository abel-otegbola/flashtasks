import { todo } from "../../interface/todo"
import SwipeDeleteItem from "../ui/swipeDeleteItem";
import { formatDeliveredTime } from "../../helpers/messageTime";
import { TrashBinTrash } from "@solar-icons/react";

export default function NewTaskCard({ task, deleteTask, saveTask, index }: { task: todo, deleteTask: (id: string) => void, saveTask: (task: todo) => void, index: number}) {

  return (
    <>
    <SwipeDeleteItem 
        onSwipeLeft={() => deleteTask(task.$id)} 
        onSwipeRight={() => saveTask(task) }
    >
    <div className={`flex md:items-center items-start border border-gray-500/[0.1] rounded-lg hover:shadow-sm transition-shadow cursor-pointer ${index % 2 !== 0 ? 'bg-white dark:bg-dark-bg' : 'bg-white dark:bg-dark/[0.4]'}`}
        
    >
        <div 
            key={task.$id}
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
                {task.dueDate ? formatDeliveredTime(task.dueDate, undefined, 'future') : 'No date'}
            </div>
        </div>
    
        <button className="flex items-start md:items-center p-4 pl-0 md:col-span-1" onClick={() => deleteTask(task.$id)}>
            <TrashBinTrash size={20} className="text-gray-400" />
        </button>
    </div>
    </SwipeDeleteItem>
    
    </>
    )
}