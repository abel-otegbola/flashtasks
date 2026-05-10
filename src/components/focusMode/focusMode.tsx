import { XIcon } from "@phosphor-icons/react";
import { todo } from "../../interface/todo";
import Timer from "../timer/timer";

export default function FocusMode({ task, setOpen }: { task: todo, setOpen: (value: boolean) => void }) {
    return (
        <div className='fixed inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center backdrop-blur-sm p-4 z-50'>
            <div className="bg-white dark:bg-dark flex flex-col justify-between w-full max-w-md rounded-lg shadow-2xl border border-gray-500/[0.2]">
                <div className="sticky top-0 border-b border-gray-500/[0.2] z-[2] p-4 flex items-center justify-between">
                    <div className="flex-1">
                        <h2 className="font-semibold text-lg">{task.title}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>
                    </div>
                    <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg transition-colors flex-shrink-0">
                        <XIcon size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <Timer onClose={() => setOpen(false)} />
                </div>
            </div>
        </div>
    )
}