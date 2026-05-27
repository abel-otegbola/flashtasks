import { useEffect, useState } from "react";
import { useTasks } from "../../../context/tasksContext";
import { useUser } from "../../../context/authContext";
import TasksPerDay from "../../../components/charts/TasksPerDay";
import TaskStatusPie from "../../../components/charts/TaskStatusPie";
import { todo } from "../../../interface/todo";
import TaskDetailsModal from "../../../components/modals/taskDetailsModal";
import Button from "../../../components/button/button";
import { FileIcon } from "@phosphor-icons/react";
import { DashboardSkeletonLoader } from "../../../components/skeletons";
import TaskListView from "../../../components/cards/taskListView";
import { OWNER_PERMISSIONS } from "../../../interface/organization";

function Dashboard() {
  const { tasks, loading, getTasks } = useTasks();
  const { user } = useUser();
  const [selectedTask, setSelectedTask] = useState<todo | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = tasks.filter(t => t.status === 'pending').length;

  const recent = tasks.slice(0, 6);

  useEffect(() => {
    getTasks(user?.email || "");
  }, [user]);

  if (loading) {
    return <DashboardSkeletonLoader />;
  }
  
  const openTaskDetails = (task: todo) => {
      setSelectedTask(task);
      setDetailsOpen(true);
  };
  
  const closeTaskDetails = () => {
      setDetailsOpen(false);
      setSelectedTask(null);
  };

  return (
    <div className="flex md:flex-row flex-col w-full mx-auto gap-4 md:p-0 px-4 mb-4">
      <div className="flex flex-1 flex-col  h-full gap-4">
        <div className="flex flex-col gap-4 gap-4 p-4 md:p-6 bg-white dark:bg-dark-bg border border-gray-500/[0.1] rounded-[10px]">
          <div>
            <h1 className="font-semibold text-2xl">Welcome back, {user.name}</h1>
            <p className="text-sm text-gray-500">Here's a quick overview of your tasks</p>
          </div>
          <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 dark:bg-dark-bg rounded-lg">
            <div className="text-center p-4 bg-gray-50 bg-white dark:bg-dark rounded-md border border-gray-500/[0.1]">
              <div className="text-xs text-gray-500">Total</div>
              <div className="font-bold text-xl">{total}</div>
            </div>
            <div className="text-center p-4 bg-gray-50 bg-white dark:bg-dark rounded-md border border-gray-500/[0.1]">
              <div className="text-xs text-gray-500">Completed</div>
              <div className="font-bold text-xl">{completed}</div>
            </div>
            <div className="text-center p-4 bg-gray-50 bg-white dark:bg-dark rounded-md border border-gray-500/[0.1]">
              <div className="text-xs text-gray-500">Pending</div>
              <div className="font-bold text-xl">{pending}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col bg-white dark:bg-dark-bg border border-gray-500/[0.1] rounded-[10px]">
          <div className="flex justify-between items-center gap-4 flex-wrap border-b border-gray-500/[0.1] md:px-6 p-4">
            <h2 className="font-semibold">Recent tasks</h2>
            <div className="flex items-center gap-2">
              {/* <Button href="/account/tasks/new" size="small"><AddCircle /> Convert voice to tasks</Button> */}
              <Button href={"/account/tasks"} variant="secondary" size="small" className="">View all</Button>
            </div>
          </div>
          {/* Task Details Modal (for list/grid/calendar clicks) */}
          {selectedTask && (
            <TaskDetailsModal
                isOpen={detailsOpen}
                onClose={closeTaskDetails}
                task={selectedTask}
            />
          )}

          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : recent.length === 0 ? (
            <div className="text-gray-500 flex flex-col items-center justify-center gap-4 py-10">
              <FileIcon size={48} color="currentColor" />
              <p>No tasks yet. Create one using the Create button.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-4 md:p-6">
              {recent.map((task, index) => (
                <TaskListView 
                    key={task.$id}
                    task={task}
                    openTaskDetails={openTaskDetails}
                    index={index}
                    permissions={OWNER_PERMISSIONS}
                />
              ))}
            </div>
          )}
        </div>
        
      </div>

      <div className="flex flex-col gap-4 md:w-[35%] w-full">
        <div className="p-4 border border-primary/[0.12] bg-white dark:bg-dark-bg rounded-[10px]">
          <TasksPerDay tasks={tasks} />
        </div>
        <div className="p-4 border border-primary/[0.12] bg-white dark:bg-dark-bg rounded-[10px] h-[360px]">
          <TaskStatusPie tasks={tasks} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard