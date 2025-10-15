import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { X, RefreshCw, Clock, Target, CheckCircle2, TrendingUp } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
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
      <div className="h-screen w-screen relative flex flex-col overflow-hidden font-sans">
        {/* Background Image */}
        <div
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: 'url(/assets/image/background.jpg)',
            backgroundSize: 'auto',
            backgroundRepeat: 'repeat',
          }}
        />
        {/* Dark overlay for better contrast */}
        <div className="fixed inset-0 z-0 bg-black/40" />

        {/* Custom Title Bar */}
        <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-glass-primary backdrop-blur-md border-b border-glass-border text-white cursor-move flex-shrink-0" data-tauri-drag-region>
          <div className="flex items-center gap-2 flex-1 min-w-0 pointer-events-none">
            <span className="font-semibold">Task Summary</span>
          </div>
          <button
            type="button"
            aria-label="Close window"
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors pl-3 pointer-events-auto"
            data-tauri-drag-region-exclude
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="max-w-md glass-panel p-6 text-center space-y-3">
            <h1 className="text-2xl font-semibold text-white">Task Summary</h1>
            <p className="text-white/60 text-sm">No task identifier was provided.</p>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative flex flex-col overflow-hidden font-sans">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/assets/image/background.jpg)',
          backgroundSize: 'auto',
          backgroundRepeat: 'repeat',
        }}
      />
      {/* Dark overlay for better contrast */}
      <div className="fixed inset-0 z-0 bg-black/40" />

      {/* Custom Title Bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-glass-primary backdrop-blur-md border-b border-glass-border text-white cursor-move flex-shrink-0" data-tauri-drag-region>
        <div className="flex items-center gap-2 flex-1 min-w-0 pointer-events-none">
          <span className="font-semibold">Task Summary</span>
        </div>
        <button
          type="button"
          aria-label="Close window"
          onClick={handleClose}
          className="text-white/60 hover:text-white transition-colors pl-3 pointer-events-auto"
          data-tauri-drag-region-exclude
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="p-6">
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
                <div className="glass-panel p-5">
                  <p className="text-sm font-medium text-white/60 flex items-center gap-2">
                    <Clock size={16} /> Total Time
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {formatTimeVerbose(metrics.totalTimeSeconds)}
                  </p>
                </div>
                <div className="glass-panel p-5">
                  <p className="text-sm font-medium text-white/60 flex items-center gap-2">
                    <Target size={16} /> Total Points
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {metrics.totalPoints}
                  </p>
                </div>
                <div className="glass-panel p-5">
                  <p className="text-sm font-medium text-white/60 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Subtasks
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {metrics.subtasksCompleted}/{metrics.subtasksTotal}
                  </p>
                </div>
                <div className="glass-panel p-5">
                  <p className="text-sm font-medium text-white/60 flex items-center gap-2">
                    <TrendingUp size={16} /> Efficiency Rate
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {metrics.efficiencyRate.toFixed(0)}%
                  </p>
                </div>
                <div className="glass-panel p-5 lg:col-span-2">
                  <p className="text-sm font-medium text-white/60 flex items-center gap-2">
                    <Clock size={16} /> Average Time / Subtask
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {formatTimeVerbose(Math.floor(metrics.averageTimePerSubtask))}
                  </p>
                </div>
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
        </div>
      </div>
    </div>
  );
};

export default TaskSummaryWindow;
