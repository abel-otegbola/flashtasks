import { useEffect, useMemo, useState } from "react";
import { searchTasks, SearchTask } from "../../services/search";
import { useUser } from "../../context/authContext";
import LoadingIcon from "../../assets/icons/loading";
import { Magnifer } from "@solar-icons/react";
import TaskDetailsModal from "../modals/taskDetailsModal";
import { todo } from "../../interface/todo";
import { databases } from '../../appwrite/appwrite';

interface Props {
  onResults?: (results: SearchTask[], query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onResults, placeholder = "Search tasks..." }: Props) {
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<todo | null>(null);

  // Simple debounce
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const run = async () => {
      console.log(user?.email)
      if (!user?.email) return;
      if (!debouncedQuery || debouncedQuery.trim().length < 2) {
        setResults([]);
        onResults?.([], debouncedQuery);
        return;
      }
      setLoading(true);
      const r = await searchTasks(debouncedQuery, user.email, 10);
      setResults(r);
      onResults?.(r, debouncedQuery);
      setLoading(false);
    };
    run();
  }, [debouncedQuery, user?.email]);

  return (
    <div className="flex items-center relative w-full rounded-lg pl-2">
      <Magnifer size={16} color="currentColor" />
      <input
        className="w-full p-2 bg-transparent text-sm rounded-lg outline-none"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {setQuery(e.target.value); console.log("Input changed:", e.target.value); }}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400"><LoadingIcon className="animate-spin" /></div>
      )}

      {
        results.length > 0 && query && (
        <div className="absolute top-[90%] left-0 mt-2 px-2 pb-2 w-full max-h-72 overflow-auto z-20 bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-500/[0.2] rounded-lg shadow-lg">
          {
            ["_tasks", "_organizations"].map((index) => (
              <div key={index}>
                <p className="p-2">{index === "_tasks" ? "Tasks:" : "Organizations:"}</p>
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-dark">
                  {results.filter(t => t._index === (index === "_tasks" ? "tasks" : "organizations")).map((t) => (
                    <button
                      key={t.$id}
                      onClick={async () => {
                        // Fetch full task document from Appwrite for complete data
                        const DATABASE_ID = (import.meta as any).env.VITE_APPWRITE_DATABASE_ID || '';
                        const TASKS_COLLECTION_ID = (import.meta as any).env.VITE_APPWRITE_TASKS_COLLECTION_ID || '';
                        try {
                          const full = await databases.getDocument(DATABASE_ID, TASKS_COLLECTION_ID, t.$id);
                          // Appwrite returns the full document; cast to todo
                          setSelectedTask(full as unknown as todo);
                        } catch (err) {
                          console.error('Failed to fetch full task document, falling back to search hit', err);
                          // fallback to lightweight mapping if full fetch fails
                          const mapped: todo = {
                            $id: t.$id,
                            title: t.title,
                            description: t.description || "",
                            comments: '0',
                            category: t.category || '',
                            userId: '',
                            userEmail: t.userEmail || '',
                            status: t.status || 'pending',
                            priority: t.priority as any,
                            dueDate: t.dueDate,
                            $createdAt: t.$createdAt || new Date().toISOString()
                          };
                          setSelectedTask(mapped);
                        }
                      }}
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
            ))}
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

function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
