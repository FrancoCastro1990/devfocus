import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="max-w-md bg-white shadow-sm rounded-lg p-6 text-center space-y-3">
          <h1 className="text-2xl font-semibold text-gray-900">Task Summary</h1>
          <p className="text-gray-600">No task identifier was provided.</p>
          <Button variant="secondary" onClick={async () => await getCurrentWindow().close()}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Summary</h1>
            <p className="text-gray-600 mt-1">
              Review performance metrics and point breakdown for your completed task.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => fetchMetrics(taskId)} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="danger" onClick={async () => await getCurrentWindow().close()}>
              Close
            </Button>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading && !metrics ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
            Loading metrics...
          </div>
        ) : null}

        {metrics && (
          <div className="space-y-6">
            <section className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{metrics.taskTitle}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Completed on {toReadableDate(metrics.completedAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => fetchMetrics(taskId)} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Recalculate'}
                  </Button>
                  <Button variant="success" onClick={handleMarkDone} disabled={updating}>
                    {updating ? 'Marking...' : 'Mark Task as Done'}
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium">Total Time</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">
                    {formatTimeVerbose(metrics.totalTimeSeconds)}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">Total Points</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {metrics.totalPoints}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-700 font-medium">Subtasks</p>
                  <p className="text-3xl font-bold text-purple-900 mt-1">
                    {metrics.subtasksCompleted}/{metrics.subtasksTotal}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-orange-700 font-medium">Efficiency Rate</p>
                  <p className="text-3xl font-bold text-orange-900 mt-1">
                    {metrics.efficiencyRate.toFixed(0)}%
                  </p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 font-medium">Average Time / Subtask</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {formatTimeVerbose(Math.floor(metrics.averageTimePerSubtask))}
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900">Time distribution per subtask</h3>
              <p className="text-sm text-gray-500 mt-2">
                Compare how much time each completed subtask required.
              </p>
              <div className="h-72 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      formatter={(value: number, _name, props) => [
                        formatTimeVerbose(value as number),
                        props?.payload?.title ?? 'Time',
                      ]}
                    />
                    <Bar dataKey="timeSeconds" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm p-6 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Subtask breakdown</h3>
              <p className="text-sm text-gray-500">
                Detailed list of each subtask and the total time invested.
              </p>
              <div className="divide-y divide-gray-100">
                {metrics.subtasksWithTime.map((entry) => (
                  <div key={entry.subtask.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{entry.subtask.title}</p>
                      <p className="text-sm text-gray-500">
                        Status: {entry.subtask.status.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
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
  );
};

export default TaskSummaryWindow;
