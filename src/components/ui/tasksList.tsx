import { todo } from '../../interface/todo';
import { useTasks } from '../../context/tasksContext';
import TaskCheckbox from './taskCheckbox';

type Props = {
  tasks: todo[];
};

const TasksList = ({ tasks }: Props) => {
  const { updateTask } = useTasks();

  // Group tasks by due date (fall back to createdAt when no dueDate)
  const grouped = tasks.reduce<Record<string, todo[]>>((acc, t) => {
    const key = t.dueDate ? new Date(t.dueDate).toDateString() : new Date(t.$createdAt).toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div className="p-2 text-dark-500">
      <div className="max-w-2xl mx-auto">
        {Object.entries(grouped).map(([date, dayTasks]) => (
          <div key={date} className="mb-8">
            <div className="flex mb-4 items-center justify-between gap-4 w-full">
              <h2 className="font-semibold text-lg">{date}</h2>
            </div>

            <div className="space-y-3">
              {dayTasks.map((task, index) => (
                <div key={task.$id || index} className="flex items-center gap-4 p-3 bg-white dark:bg-[#0f0f0f] rounded-lg border border-gray-100 dark:border-gray-500/[0.2]">
                  <TaskCheckbox
                    checked={task.status === 'completed'}
                    onCheckedChange={(checked) => void updateTask(task.$id, { status: checked ? 'completed' : 'pending' })}
                    aria-label={`Mark ${task.title} as completed`}
                  />

                  <div className="w-[2px] h-8 bg-gradient-to-b from-primary rounded-full" />

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{task.title}</div>
                        {task.description && <div className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</div>}
                      </div>
                      <div className="text-right text-xs text-gray-400">
                        <div>Priority: <span className="font-semibold text-gray-700 dark:text-gray-200">{task.priority || 'medium'}</span></div>
                        <div className="mt-1">Status: <span className="font-semibold">{task.status}</span></div>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2 text-[12px] text-gray-500">
                      <div className="px-2 py-1 bg-gray-100 dark:bg-dark rounded">Created: {new Date(task.$createdAt).toLocaleString()}</div>
                      {task.dueDate && <div className="px-2 py-1 bg-gray-100 dark:bg-dark rounded">Due: {new Date(task.dueDate).toLocaleString()}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksList;
