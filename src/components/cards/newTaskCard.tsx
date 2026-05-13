import { todo } from "../../interface/todo"
import SwipeDeleteItem from "../ui/swipeDeleteItem";
import { formatDeliveredTime } from "../../helpers/messageTime";
import { TrashBinTrash } from "@solar-icons/react";
import { useState } from "react";
import { CheckIcon, PenIcon, XIcon } from "@phosphor-icons/react";
import Input from "../input/input";
import Dropdown from "../dropdown/dropdown";
import DueDateTimePicker from "../input/dueDateTimePicker";
import Button from "../button/button";

export default function NewTaskCard({ task, deleteTask, saveTask, index, editGeneratedTask }: { task: todo, deleteTask: (id: string) => void, saveTask: (task: todo) => void, index: number, editGeneratedTask: (task: todo) => void}) {
    const [isEditting, setIsEditting] = useState(false)

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
                    <span>{task.dueDate ? formatDeliveredTime(task.dueDate, undefined, 'future') : 'No date'}</span>
                </div>
            </div>
        
            <div className="flex gap-2">
                {isEditting ? (
                    <button className="flex items-start md:items-center p-4 pl-0 md:col-span-1" onClick={() => setIsEditting(false)}>
                        <CheckIcon size={20} className="text-gray-400" />
                    </button>
                )                
                : (
                    <button className="flex items-start md:items-center p-4 pl-0 md:col-span-1" onClick={() => setIsEditting(true)}>
                        <PenIcon size={20} className="text-gray-400" />
                    </button>
                )}
                <button className="flex items-start md:items-center p-4 pl-0 md:col-span-1" onClick={() => deleteTask(task.$id)}>
                    <TrashBinTrash size={20} className="text-gray-400" />
                </button>
            </div>
        </div>
        </SwipeDeleteItem>

        {
            isEditting && (
                <div className='fixed inset-0 flex items-center justify-center p-4 z-50'>
                    <div className="bg-white dark:bg-dark flex flex-col justify-between sm:w-[400px] w-full max-[460px]:w-[80%] rounded-lg shadow-lg border border-gray-500/[0.2]">
                        <div className="sticky top-0 border-b border-gray-500/[0.2] z-[2] p-4 flex items-center justify-between">
                            <h2 className="px-2 opacity-[0.7] leading-4">Edit task</h2>
                            <button onClick={() => setIsEditting(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg transition-colors">
                                <XIcon size={16} />
                            </button>
                        </div>
                        <div className="space-y-4 md:p-6 p-4">
                            <Input
                                type="text"
                                value={task.title}
                                onChange={(e) => editGeneratedTask({ ...task, title: e.target.value })}
                                label="Title"
                            />
                            <Input
                                value={task.description}
                                onChange={(e) => editGeneratedTask({ ...task, description: e.target.value })}
                                label="Description"
                            />
                            <Input
                                type="text"
                                value={task.category}
                                onChange={(e) => editGeneratedTask({ ...task, category: e.target.value })}
                                label="Category"
                            />
                            <Dropdown
                                options={[
                                    { id: 'completed', title: 'Completed' },
                                    { id: 'in progress', title: 'In Progress' },
                                    { id: 'suspended', title: 'Suspended' },
                                    { id: 'pending', title: 'Pending' },
                                ]}
                                value={task.status}
                                onChange={(value) => editGeneratedTask({ ...task, status: value as todo['status'] })}
                                label="Status"
                            />
                            <Dropdown
                                options={[
                                    { id: 'low', title: 'Low' },
                                    { id: 'medium', title: 'Medium' },
                                    { id: 'high', title: 'High' },
                                ]}
                                value={task.priority || 'medium'}
                                onChange={(value) => editGeneratedTask({ ...task, priority: value as todo['priority'] })}
                                label="Priority"
                            />
                        </div>
        
                        <div className="p-4 flex justify-center items-center gap-4">
                            <Button variant="secondary" size="small" onClick={() => setIsEditting(false)}>Discard</Button>
                            <Button onClick={() => setIsEditting(false)} size="small">Continue</Button>
                        </div>
                    </div> 
                </div>
            )
        }
        
        </>
    )
}