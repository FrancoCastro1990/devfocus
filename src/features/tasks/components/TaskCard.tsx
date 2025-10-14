import React, { useState } from 'react';
import type { TaskWithActiveSubtask } from '../../../shared/types/common.types';
import { formatRelativeTime } from '../../../shared/utils/dateFormatter';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';

interface TaskCardProps {
  task: TaskWithActiveSubtask;
  onClick: () => void;
  onDelete: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const statusColors = {
    todo: 'bg-gray-100 border-gray-300 text-gray-700',
    in_progress: 'bg-blue-100 border-blue-400 text-blue-900',
    done: 'bg-green-100 border-green-400 text-green-900',
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${statusColors[task.status]}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{task.title}</h3>
          {task.description && (
            <p className="text-sm mt-1 opacity-75">{task.description}</p>
          )}

          {/* Active subtask info */}
          {task.activeSubtask && (
            <div className="mt-3 p-3 bg-blue-100 rounded-lg border-2 border-blue-400">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-4 h-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full relative z-10"></div>
                  <div className="absolute w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                </div>
                <span className="text-sm font-medium text-blue-900">
                  Working on: {task.activeSubtask.title}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs opacity-60">
            <span>Created {formatRelativeTime(task.createdAt)}</span>
            {task.status === 'done' && task.completedAt && (
              <span>• Completed {formatRelativeTime(task.completedAt)}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium rounded capitalize bg-white bg-opacity-50">
            {task.status.replace('_', ' ')}
          </span>
          <button
            onClick={handleDelete}
            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
            title="Delete task"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={onDelete}
        title="Delete Task?"
        message={`Are you sure you want to delete "${task.title}"?`}
        confirmText="Delete Task"
        cancelText="Cancel"
        variant="danger"
      >
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          <p className="font-medium">⚠️ This action cannot be undone</p>
          <p className="mt-1 text-yellow-700">All subtasks and time sessions will be permanently deleted.</p>
        </div>
      </ConfirmDialog>
    </div>
  );
};
