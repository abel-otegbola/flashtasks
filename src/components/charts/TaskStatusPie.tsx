import { useMemo } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { todo } from '../../interface/todo';

type TaskStatusSlice = {
  name: todo['status'];
  value: number;
};

const COLORS = ['#22c55e', '#60a5fa', '#f59e0b', '#ef4444'];

export default function TaskStatusPie({ tasks = [] }: { tasks?: todo[] }) {
  const data = useMemo<TaskStatusSlice[]>(() => {
    const completed = tasks.filter(task => task.status === 'completed').length;
    const pending = tasks.filter(task => task.status === 'pending').length;
    const upcoming = tasks.filter(task => task.status === 'upcoming').length;
    const inProgress = tasks.filter(task => task.status === 'in progress').length;
    const suspended = tasks.filter(task => task.status === 'suspended').length;

    return [
      { name: 'completed', value: completed },
      { name: 'pending', value: pending },
      { name: 'upcoming', value: upcoming },
      { name: 'in progress', value: inProgress },
      { name: 'suspended', value: suspended },
    ].filter(entry => entry.value > 0) as TaskStatusSlice[];
  }, [tasks]);

  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div>
      <div className="flex items-center justify-between p-4">
        <h3 className="font-semibold">Task Status Distribution</h3>
      </div>

      <div className="relative w-full h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={86}
              paddingAngle={3}
              stroke="transparent"
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center -mt-6">
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-xs text-gray-500">tasks</div>
          </div>
        </div>
      </div>
    </div>
  );
}