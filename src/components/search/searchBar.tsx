import { useEffect, useMemo, useState } from "react";
import { searchTasks, SearchTask } from "../../services/search";
import { useUser } from "../../context/authContext";
import LoadingIcon from "../../assets/icons/loading";
import { Magnifer } from "@solar-icons/react";
import TaskDetailsModal from "../modals/taskDetailsModal";
import { todo } from "../../interface/todo";
import { databases } from '../../appwrite/appwrite';
import { useTasks } from "../../context/tasksContext";
import { useOrganizations } from "../../context/organizationContext";

interface Props {
  onResults?: (results: SearchTask[], query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onResults, placeholder = "Search tasks..." }: Props) {
  const { user } = useUser();
  const { tasks } = useTasks();
  const { organizations } = useOrganizations();
  const [query, setQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<todo | null>(null);

  return (
    <div className="flex items-center relative w-full rounded-lg pl-2 bg-gray-500/[0.04] dark:bg-dark/[0.5]">
      <Magnifer size={16} color="currentColor" />
      <input
        className="w-full p-2 bg-transparent text-sm rounded-lg outline-none"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {setQuery(e.target.value); console.log("Input changed:", e.target.value); }}
      />

      {
        tasks.length > 0 && query && (
        <div className="absolute top-[90%] left-0 mt-2 px-2 pb-2 w-full max-h-2xl sm:w-2xl w-full overflow-auto z-20 bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-500/[0.2] rounded-lg shadow-lg">
          {
              <div>
                <p className="p-2">Tasks</p>
                <div className="p-2 rounded-lg bg-gray-100/[0.4] dark:bg-dark">
                  {tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase()) || t.description?.toLowerCase().includes(query.toLowerCase()) || t.category.toLowerCase().includes(query.toLowerCase())).slice(0, 5).map((t) => (
                    <button
                      key={t.$id}
                      onClick={async () => setSelectedTask(t)}
                      className="w-full text-left p-2 border-b last:border-0 border-gray-300 dark:border-gray-800 rounded cursor-pointer"
                    >
                <div className="text-sm font-medium mb-2">{t.title}</div>
                {t.description && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{t.description}</div>
                )}
              </button>
            ))}
          </div>
        </div>
        }
    </div>
        )}
      {selectedTask && (
        <TaskDetailsModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
        />
      )}
    </div>
  );
}
