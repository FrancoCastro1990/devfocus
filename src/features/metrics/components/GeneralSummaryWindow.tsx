import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '../../../shared/components/Button';
import { getGeneralMetrics, getAllCategoryStats } from '../../../lib/tauri/commands';
import type { GeneralMetrics, CategoryStats } from '../../../shared/types/common.types';
import { formatTimeVerbose } from '../../../shared/utils/timeFormatter';
import { CategoryCard } from '../../categories/components/CategoryCard';
import { getCurrentWindow } from '@tauri-apps/api/window';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
} from 'recharts';

const toReadableDate = (date: string) => {
  const parsed = new Date(`${date}T00:00:00Z`);
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const toLongDate = (date: string) => {
  const parsed = new Date(`${date}T00:00:00Z`);
  return parsed.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

const GeneralSummaryWindow: React.FC = () => {
  const [metrics, setMetrics] = useState<GeneralMetrics | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [metricsData, categoryData] = await Promise.all([
        getGeneralMetrics(),
        getAllCategoryStats(),
      ]);
      setMetrics(metricsData);
      setCategoryStats(categoryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch the general summary.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClose = useCallback(async () => {
    await getCurrentWindow().close();
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    document.title = 'General Summary | DevFocus';
  }, []);

  const chartData = useMemo(() => {
    if (!metrics) return [];
    return metrics.pointsLast7Days.map((day) => ({
      dateLabel: toReadableDate(day.date),
      date: day.date,
      points: day.points,
      subtasks: day.subtasksCompleted,
    }));
  }, [metrics]);

  const averageTime = metrics
    ? formatTimeVerbose(Math.round(metrics.averageCompletionTimeSeconds))
    : '00m 00s';

  const cards = metrics
    ? [
        {
          title: 'Total points',
          value: metrics.totalPoints.toLocaleString(),
        },
        {
          title: 'Points today',
          value: metrics.pointsToday.toLocaleString(),
        },
        {
          title: 'Last 7 days',
          value: metrics.pointsThisWeek.toLocaleString(),
        },
        {
          title: 'Tasks completed',
          value: metrics.totalTasksCompleted.toLocaleString(),
        },
        {
          title: 'Subtasks completed',
          value: metrics.totalSubtasksCompleted.toLocaleString(),
        },
        {
          title: 'Avg. time per subtask',
          value: averageTime,
        },
      ]
    : [];

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Custom Title Bar */}
      <div className="relative flex items-center justify-between px-4 py-3 bg-gray-800 text-white cursor-move flex-shrink-0" data-tauri-drag-region>
        <div className="flex items-center gap-2 flex-1 min-w-0 pointer-events-none">
          <span aria-hidden className="text-lg leading-none text-gray-400">⋮⋮</span>
          <span className="font-semibold">General Summary</span>
        </div>
        <button
          type="button"
          aria-label="Close window"
          onClick={handleClose}
          className="text-gray-400 hover:text-white transition-colors pl-3 text-2xl leading-none pointer-events-auto"
          data-tauri-drag-region-exclude
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-gray-600 mt-1">
                  Review your cumulative points and recent subtask activity at a glance.
                </p>
              </div>
              <div className="flex">
                <Button variant="secondary" onClick={fetchMetrics} disabled={loading}>
                  {loading ? 'Refreshing...' : 'Refresh'}
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
            Loading summary...
          </div>
        ) : null}

        {metrics && (
          <div className="space-y-6">
            <section>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                  <div key={card.title} className="bg-white rounded-lg shadow-sm p-5">
                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{card.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {categoryStats.length > 0 && (
              <section>
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold text-gray-900">Categories</h2>
                  <p className="text-gray-600 mt-1">Your skill levels and experience progress</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryStats.map((stats) => (
                    <CategoryCard key={stats.category.id} stats={stats} />
                  ))}
                </div>
              </section>
            )}

            <section className="grid gap-4 md:grid-cols-2">
              <div className="bg-white rounded-lg shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900">Best day</h2>
                {metrics.bestDay ? (
                  <div className="mt-3 space-y-2">
                    <p className="text-2xl font-bold text-blue-600">
                      {metrics.bestDay.points.toLocaleString()} pts
                    </p>
                    <p className="text-gray-600">{toLongDate(metrics.bestDay.date)}</p>
                    <p className="text-sm text-gray-500">
                      Subtasks completed: {metrics.bestDay.subtasksCompleted.toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 mt-3">Not enough data yet.</p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm p-5">
                <h2 className="text-lg font-semibold text-gray-900">Recent activity</h2>
                <p className="text-sm text-gray-500 mt-2">
                  Summary of the last 7 days including today.
                </p>
                <div className="mt-4 -mx-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="text-left text-sm text-gray-500">
                        <th className="px-4 py-2">Day</th>
                        <th className="px-4 py-2">Points</th>
                        <th className="px-4 py-2">Subtasks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                      {metrics.pointsLast7Days.map((day) => (
                        <tr key={day.date}>
                          <td className="px-4 py-2">{toReadableDate(day.date)}</td>
                          <td className="px-4 py-2 font-medium">{day.points.toLocaleString()}</td>
                          <td className="px-4 py-2">{day.subtasksCompleted.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Points vs. subtasks</h2>
                <p className="text-sm text-gray-500">Distribution across the last 7 days</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dateLabel" />
                    <YAxis yAxisId="left" allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" allowDecimals={false} />
                    <Tooltip
                      formatter={(value: number, name) => {
                        if (name === 'Subtasks') {
                          return [value.toLocaleString(), 'Subtasks'];
                        }
                        return [`${value.toLocaleString()} pts`, 'Points'];
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="points"
                      name="Points"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="subtasks"
                      name="Subtasks"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
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

export default GeneralSummaryWindow;
