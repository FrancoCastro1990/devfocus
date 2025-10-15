import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, TrendingUp, Award, Target } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { WindowLayout } from '../../../shared/components/WindowLayout';
import { StatCard } from '../../../shared/components/StatCard';
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
    <WindowLayout title="General Summary" onClose={handleClose}>
      <div className="max-w-5xl mx-auto space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between glass-panel p-4">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Metrics Dashboard
                </h1>
                <p className="text-white/60 mt-1 text-sm">
                  Cumulative stats and activity
                </p>
              </div>
              <div className="flex">
                <Button variant="secondary" onClick={fetchMetrics} disabled={loading}>
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
            Loading summary...
          </div>
        ) : null}

        {metrics && (
          <div className="space-y-6">
            <section>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                  <StatCard key={card.title} label={card.title} value={card.value} />
                ))}
              </div>
            </section>

            {categoryStats.length > 0 && (
              <section>
                <div className="mb-4 glass-panel p-4">
                  <div className="flex items-center gap-2">
                    <Award size={24} className="text-accent-purple" />
                    <h2 className="text-2xl font-semibold text-white">
                      Categories
                    </h2>
                  </div>
                  <p className="text-white/60 mt-1 text-sm">Skill levels & XP progress</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryStats.map((stats) => (
                    <CategoryCard key={stats.category.id} stats={stats} />
                  ))}
                </div>
              </section>
            )}

            <section className="grid gap-4 md:grid-cols-2">
              <div className="glass-panel p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={20} className="text-accent-pink" />
                  <h2 className="text-lg font-semibold text-white">Best Day</h2>
                </div>
                {metrics.bestDay ? (
                  <div className="mt-3 space-y-2">
                    <p className="text-3xl font-bold text-accent-pink font-sans">
                      {metrics.bestDay.points.toLocaleString()} pts
                    </p>
                    <p className="text-white/60 font-sans text-sm">{toLongDate(metrics.bestDay.date)}</p>
                    <p className="text-sm text-white/50 font-sans">
                      Subtasks: {metrics.bestDay.subtasksCompleted.toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-white/50 mt-3 font-sans text-sm">Not enough data yet.</p>
                )}
              </div>

              <div className="glass-panel p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={20} className="text-accent-blue" />
                  <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                </div>
                <p className="text-sm text-white/50 mt-2 font-sans">
                  Last 7 days
                </p>
                <div className="mt-4 -mx-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead>
                      <tr className="text-left text-sm text-white/60">
                        <th className="px-4 py-2 font-sans">Day</th>
                        <th className="px-4 py-2 font-sans">Points</th>
                        <th className="px-4 py-2 font-sans">Subs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-white/80">
                      {metrics.pointsLast7Days.map((day) => (
                        <tr key={day.date} className="hover:bg-white/5">
                          <td className="px-4 py-2 font-sans">{toReadableDate(day.date)}</td>
                          <td className="px-4 py-2 font-medium font-sans text-white">{day.points.toLocaleString()}</td>
                          <td className="px-4 py-2 font-sans">{day.subtasksCompleted.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="glass-panel p-6">
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <h2 className="text-lg font-semibold text-white font-sans">
                  Points vs Subtasks
                </h2>
                <p className="text-sm text-white/60 font-sans">Last 7 days</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" opacity={0.3} />
                    <XAxis
                      dataKey="dateLabel"
                      stroke="#ffffff80"
                      style={{ fontFamily: 'sans-serif', fontSize: '12px' }}
                    />
                    <YAxis
                      yAxisId="left"
                      allowDecimals={false}
                      stroke="#ffffff80"
                      style={{ fontFamily: 'sans-serif', fontSize: '12px' }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      allowDecimals={false}
                      stroke="#a78bfa"
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
                      formatter={(value: number, name) => {
                        if (name === 'Subtasks') {
                          return [value.toLocaleString(), 'Subtasks'];
                        }
                        return [`${value.toLocaleString()} pts`, 'Points'];
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontFamily: 'sans-serif', color: '#ffffff' }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="points"
                      name="Points"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="subtasks"
                      name="Subtasks"
                      stroke="#a78bfa"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#a78bfa' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        )}
      </div>
    </WindowLayout>
  );
};

export default GeneralSummaryWindow;
