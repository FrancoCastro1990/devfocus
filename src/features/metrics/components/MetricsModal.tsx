import React from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import type { TaskMetrics } from '../../../shared/types/common.types';
import { formatTimeVerbose } from '../../../shared/utils/timeFormatter';
import { formatDateTime } from '../../../shared/utils/dateFormatter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MetricsModalProps {
  isOpen: boolean;
  metrics: TaskMetrics;
  onClose: () => void;
  onConfirmComplete: () => void;
}

export const MetricsModal: React.FC<MetricsModalProps> = ({
  isOpen,
  metrics,
  onClose,
  onConfirmComplete,
}) => {
  const chartData = metrics.subtasksWithTime.map((st, index) => ({
    name: `Sub ${index + 1}`,
    fullName: st.subtask.title,
    time: st.totalTimeSeconds,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Completed!" size="xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{metrics.taskTitle}</h2>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
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
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Time Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => formatTimeVerbose(value)}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.fullName;
                    }
                    return label;
                  }}
                />
                <Bar dataKey="time" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Stats */}
        <div className="border-t pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Average Time per Subtask:</span>
            <span className="font-medium">
              {formatTimeVerbose(Math.floor(metrics.averageTimePerSubtask))}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Completed At:</span>
            <span className="font-medium">{formatDateTime(metrics.completedAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Keep Working
          </Button>
          <Button variant="success" onClick={onConfirmComplete}>
            Mark Task as Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
