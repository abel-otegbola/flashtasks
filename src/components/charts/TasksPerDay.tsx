import React, { useEffect, useState } from 'react';
import { useOrganizations } from '../../context/organizationContext';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const getBackend = () => import.meta.env.VITE_BACKEND_URL || '';

type Bucket = { date: string; count: number };

export default function TasksPerDay({ days = 14 }: { days?: number }) {
  const { currentOrg } = useOrganizations();
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const backend = getBackend();
        const res = await fetch(`${backend}api/tasks-per-day`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({ orgId: currentOrg?.$id, days })
        });
        const json = await res.json();
        if (mounted && json && Array.isArray(json.buckets)) setBuckets(json.buckets);
      } catch (e) {
        console.error('Failed to load metrics', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [currentOrg, days]);

  useEffect(() => {
    console.log(buckets.map(b => ({ date: b.date?.split('T')[0], count: b.count })))
  }, [buckets])

  const values = buckets.map(b => b.count);
  const max = Math.max(...values, 1);

  return (
    <div className="p-4 rounded-lg border border-border-gray-100 dark:border-gray-500/[0.2] bg-white dark:bg-dark-bg/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Tasks created ({days}d)</h3>
        <div className="text-xs text-gray-400">{loading ? 'Loading...' : ''}</div>
      </div>
      {buckets.length === 0 ? (
        <div className="text-sm text-gray-500">No data yet.</div>
      ) : 
      (
        <ResponsiveContainer width={"100%"} height={200}>
            <BarChart
                data={buckets.map(b => ({ date: new Date(b.date).getDate().toString(), count: b.count }))}
                margin={{ top: 5, left: -32, bottom: 5 }}
            >
                <XAxis dataKey="date" />
                <YAxis/>
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
        </ResponsiveContainer>
      )}
      <div className="mt-3 text-xs text-gray-500">Showing tasks created per day for {days} days{currentOrg ? ` — ${currentOrg.name}` : ''}.</div>
    </div>
  );
}
