import React, { useState } from 'react';
import { Trash2, Clock, CheckCircle2 } from 'lucide-react';
import type { TaskWithActiveSubtask } from '../../../shared/types/common.types';
import { formatRelativeTime } from '../../../shared/utils/dateFormatter';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { StatusBadge } from '../../../shared/components/StatusBadge';

interface TaskCardProps {
  task: TaskWithActiveSubtask;
  onClick: () => void;
  onDelete: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  // Status-specific styles with glass effect
  const statusStyles = {
    todo: {
      bg: 'rgba(147, 197, 253, 0.15)',
      border: 'rgba(147, 197, 253, 0.4)',
      shadow: '0 0 20px rgba(147, 197, 253, 0.25)',
    },
    in_progress: {
      bg: 'rgba(167, 139, 250, 0.18)',
      border: 'rgba(167, 139, 250, 0.5)',
      shadow: '0 0 24px rgba(167, 139, 250, 0.35)',
    },
    done: {
      bg: 'rgba(52, 211, 153, 0.15)',
      border: 'rgba(52, 211, 153, 0.4)',
      shadow: '0 0 20px rgba(52, 211, 153, 0.25)',
    },
  };

  const currentStatus = statusStyles[task.status as keyof typeof statusStyles] || statusStyles.todo;

  return (
    <div
      onClick={onClick}
      className="p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] backdrop-blur-xl font-sans text-white"
      style={{
        backgroundColor: currentStatus.bg,
        borderColor: currentStatus.border,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1), ${currentStatus.shadow}`,
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{task.title}</h3>
          {task.description && (
            <p className="text-sm mt-1 opacity-75">{task.description}</p>
          )}

          {/* Active subtask info */}
          {task.activeSubtask && (
            <div
              className="mt-3 p-3 bg-accent-purple/10 border border-accent-purple/30 rounded-xl backdrop-blur-md"
              style={{
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                boxShadow: '0 4px 16px rgba(167, 139, 250, 0.15)',
              }}
            >
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-4 h-4">
                  <div className="w-2 h-2 bg-accent-purple rounded-full relative z-10"></div>
                  <div className="absolute w-2 h-2 bg-accent-purple rounded-full animate-ping"></div>
                </div>
                <Clock size={14} className="text-accent-purple" />
                <span className="text-sm font-medium text-white">
                  Working: {task.activeSubtask.title}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
            <span>Created {formatRelativeTime(task.createdAt)}</span>
            {task.status === 'done' && task.completedAt && (
              <>
                <span>•</span>
                <CheckCircle2 size={12} className="inline" />
                <span>Completed {formatRelativeTime(task.completedAt)}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={task.status as 'todo' | 'in_progress' | 'done'} variant="colored" size="sm" />
          <button
            onClick={handleDelete}
            className="p-1.5 text-red-300 hover:bg-red-500/20 border border-transparent hover:border-red-400/40 rounded-lg transition-all backdrop-blur-sm"
            title="Delete task"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <Trash2 size={18} />
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
        <div className="border border-accent-pink/40 bg-accent-pink/10 p-3 text-sm text-accent-pink rounded-xl">
          <p className="font-medium">Warning: Irreversible Action</p>
          <p className="mt-1 text-white/60">All subtasks and time sessions will be permanently deleted.</p>
        </div>
      </ConfirmDialog>
    </div>
  );
};
