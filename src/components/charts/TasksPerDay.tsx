import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { todo } from '../../interface/todo';

type TasksPerDayDatum = {
  date: string;
  completed: number;
  others: number;
};

const pad = (value: number) => String(value).padStart(2, '0');

const toLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  return `${year}-${month}-${day}`;
};

const getTaskDateKey = (task: todo) => {
  const sourceDate = task.dueDate || task.$createdAt;
  return toLocalDateKey(new Date(sourceDate));
};

const getDisplayLabel = (dateKey: string) => {
  const date = new Date(`${dateKey}T00:00:00`);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export default function TasksPerDay({ tasks = [] }: { tasks?: todo[] }) {
  const [data, setData] = useState<TasksPerDayDatum[]>([]);

  useEffect(() => {
    if (tasks.length === 0) {
      setData([]);
      return;
    }

    const sortedDates = tasks
      .map(getTaskDateKey)
      .sort((left, right) => left.localeCompare(right));

    const start = new Date(`${sortedDates[0]}T00:00:00`);
    const end = new Date(`${sortedDates[sortedDates.length - 1]}T00:00:00`);

    const buckets = new Map<string, TasksPerDayDatum>();

    const cursor = new Date(start);
    while (cursor <= end) {
      const key = toLocalDateKey(cursor);
      buckets.set(key, { date: key, completed: 0, others: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    tasks.forEach(task => {
      const taskDate = getTaskDateKey(task);
      const bucket = buckets.get(taskDate);
      if (bucket) {
        if (task.status === 'completed') {
          bucket.completed++;
        } else {
          bucket.others++;
        }
      }
    });

    setData(Array.from(buckets.values()));
  }, [tasks]);

  const visibleData = data.map(b => ({
    date: getDisplayLabel(b.date),
    completed: b.completed,
    others: b.others,
  }));

  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold">Tasks per day</h3>
          <p className="text-xs text-gray-500">All-time view</p>
        </div>
      </div>
        <ResponsiveContainer width={"100%"} height={200}>
            <BarChart
                data={visibleData}
                margin={{ top: 5, left: -32, bottom: 5 }}
            >
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" stackId="tasks" fill="#22c55e" radius={[0, 0, 4, 4]} />
                <Bar dataKey="others" stackId="tasks" fill="#60a5fa" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
      <div className="mt-3 text-xs text-gray-500">Showing completed tasks under other statuses across all task dates.</div>
    </div>
  );
}
