import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Clock, Target, CheckCircle2, TrendingUp } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { WindowLayout } from '../../../shared/components/WindowLayout';
import { StatCard } from '../../../shared/components/StatCard';
import {
  getTaskMetrics,
  updateTaskStatus,
} from '../../../lib/tauri/commands';
import type { TaskMetrics } from '../../../shared/types/common.types';
import { formatTimeVerbose } from '../../../shared/utils/timeFormatter';
import { formatDateTime } from '../../../shared/utils/dateFormatter';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { emit, listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';


const toReadableDate = (iso: string) => formatDateTime(iso);

const TaskSummaryWindow: React.FC = () => {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const initialTaskId = params.get('taskId');
  const isTauri = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
  }, []);

  const [taskId, setTaskId] = useState<string | null>(initialTaskId);
  const [metrics, setMetrics] = useState<TaskMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchMetrics = useCallback(
    async (id: string) => {
      if (!isTauri) {
        setError('Task summary is only available in the desktop application.');
        setMetrics(null);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await getTaskMetrics(id);
        setMetrics(data);
        document.title = `${data.taskTitle} | Task Summary`;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load task metrics.');
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    },
    [isTauri],
  );

  useEffect(() => {
    if (!taskId) {
      return;
    }
    fetchMetrics(taskId);
  }, [taskId, fetchMetrics]);

  useEffect(() => {
    if (!isTauri) return;

    let unlisten: (() => void) | undefined;

    listen<{ taskId?: string }>('task-summary:load', (event) => {
      const nextTaskId = event.payload?.taskId;
      if (nextTaskId) {
        setTaskId(nextTaskId);
      }
    })
      .then((fn) => {
        unlisten = fn;
      })
      .catch((err) => {
        console.error('Failed to listen for task summary events', err);
      });

    return () => {
      unlisten?.();
    };
  }, [isTauri]);

  const handleMarkDone = useCallback(async () => {
    if (!taskId) return;
    if (!isTauri) {
      setError('Marking tasks as done is only available in the desktop application.');
      return;
    }
    try {
      setUpdating(true);
      await updateTaskStatus(taskId, 'done');
      await emit('task-summary:refresh', { taskId });
      await getCurrentWindow().close();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to mark the task as done.');
    } finally {
      setUpdating(false);
    }
  }, [isTauri, taskId]);

  const handleClose = useCallback(async () => {
    await getCurrentWindow().close();
  }, []);

  const chartData = useMemo(() => {
    if (!metrics) return [];
    return metrics.subtasksWithTime.map((entry, index) => ({
      name: `Sub ${index + 1}`,
      title: entry.subtask.title,
      timeSeconds: entry.totalTimeSeconds,
    }));
  }, [metrics]);

  if (!taskId) {
    return (
      <WindowLayout title="Task Summary" onClose={handleClose}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="max-w-md glass-panel p-6 text-center space-y-3">
            <h1 className="text-2xl font-semibold text-white">Task Summary</h1>
            <p className="text-white/60 text-sm">No task identifier was provided.</p>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </WindowLayout>
    );
  }

  return (
    <WindowLayout title="Task Summary" onClose={handleClose}>
      <div className="max-w-4xl mx-auto space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between glass-panel p-4">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Task Metrics
                </h1>
                <p className="text-white/60 mt-1 text-sm">
                  Performance metrics and point breakdown
                </p>
              </div>
              <div className="flex">
                <Button variant="secondary" onClick={() => fetchMetrics(taskId)} disabled={loading}>
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            </header>

        {error && (
          <div className="border border-red-400/40 bg-red-500/20 text-red-300 px-4 py-3 rounded-xl font-sans">
            {error}
          </div>
        )}

        {loading && !metrics ? (
          <div className="glass-panel p-8 text-center text-white/60">
            Loading metrics...
          </div>
        ) : null}

        {metrics && (
          <div className="space-y-6">
            <section className="glass-panel p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">{metrics.taskTitle}</h2>
                  <p className="text-sm text-white/60 mt-1 font-sans">
                    Completed on {toReadableDate(metrics.completedAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => fetchMetrics(taskId)} disabled={loading}>
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    {loading ? 'Refreshing...' : 'Recalculate'}
                  </Button>
                  <Button variant="primary" onClick={handleMarkDone} disabled={updating}>
                    <CheckCircle2 size={16} />
                    {updating ? 'Marking...' : 'Mark Done'}
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
                <StatCard
                  label="Total Time"
                  value={formatTimeVerbose(metrics.totalTimeSeconds)}
                  icon={Clock}
                />
                <StatCard
                  label="Total Points"
                  value={metrics.totalPoints}
                  icon={Target}
                />
                <StatCard
                  label="Subtasks"
                  value={`${metrics.subtasksCompleted}/${metrics.subtasksTotal}`}
                  icon={CheckCircle2}
                />
                <StatCard
                  label="Efficiency Rate"
                  value={`${metrics.efficiencyRate.toFixed(0)}%`}
                  icon={TrendingUp}
                />
                <StatCard
                  label="Average Time / Subtask"
                  value={formatTimeVerbose(Math.floor(metrics.averageTimePerSubtask))}
                  icon={Clock}
                  className="lg:col-span-2"
                />
              </div>
            </section>

            <section className="glass-panel p-6">
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <h3 className="text-lg font-semibold text-white font-sans">
                  Time Distribution
                </h3>
                <p className="text-sm text-white/60 font-sans">Per Subtask</p>
              </div>
              <p className="text-sm text-white/50 mb-4 font-sans">
                Compare how much time each completed subtask required
              </p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" opacity={0.3} />
                    <XAxis
                      dataKey="name"
                      stroke="#ffffff80"
                      style={{ fontFamily: 'sans-serif', fontSize: '12px' }}
                    />
                    <YAxis
                      allowDecimals={false}
                      stroke="#ffffff80"
                      style={{ fontFamily: 'sans-serif', fontSize: '12px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 15, 35, 0.95)',
                        border: '1px solid rgba(167, 139, 250, 0.4)',
                        borderRadius: '12px',
                        fontFamily: 'sans-serif',
                        color: '#ffffff'
                      }}
                      formatter={(value: number, _name, props) => [
                        formatTimeVerbose(value as number),
                        props?.payload?.title ?? 'Time',
                      ]}
                    />
                    <Bar dataKey="timeSeconds" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="glass-panel p-6 space-y-3">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-lg font-semibold text-white font-sans">
                  Subtask Breakdown
                </h3>
                <p className="text-sm text-white/50 mt-1 font-sans">
                  Detailed list of each subtask and time invested
                </p>
              </div>
              <div className="divide-y divide-white/5">
                {metrics.subtasksWithTime.map((entry) => (
                  <div key={entry.subtask.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{entry.subtask.title}</p>
                      <p className="text-sm text-white/60 font-sans mt-1">
                        Status: {entry.subtask.status.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-white font-sans">
                      {formatTimeVerbose(entry.totalTimeSeconds)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </WindowLayout>
  );
};

export default TaskSummaryWindow;
