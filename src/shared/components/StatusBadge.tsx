import React from 'react';

type TaskStatus = 'todo' | 'in_progress' | 'done';
type SubtaskStatus = 'todo' | 'in_progress' | 'paused' | 'done';
type Status = TaskStatus | SubtaskStatus;

interface StatusBadgeProps {
  status: Status;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'colored';
  className?: string;
}

/**
 * StatusBadge Component
 *
 * A unified component for displaying status badges across the application.
 * Provides consistent styling and colors for task and subtask statuses.
 *
 * @param status - The status to display ('todo', 'in_progress', 'paused', 'done')
 * @param label - Optional custom label (defaults to formatted status)
 * @param size - Badge size: 'sm', 'md', or 'lg' (default: 'md')
 * @param variant - Visual variant: 'default' or 'colored' (default: 'default')
 * @param className - Additional CSS classes
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  variant = 'default',
  className = '',
}) => {
  const statusColors: Record<Status, string> = {
    todo: 'bg-status-todo border-status-todo-border',
    in_progress: 'bg-status-in-progress border-status-in-progress-border shadow-glass',
    paused: 'bg-accent-indigo/10 border-accent-indigo/40',
    done: 'bg-status-done border-status-done-border',
  };

  const statusTextColors: Record<Status, string> = {
    todo: 'text-white/70',
    in_progress: 'text-white',
    paused: 'text-accent-indigo',
    done: 'text-white',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const displayLabel = label || status.replace(/_/g, ' ');

  const baseClasses = 'inline-flex items-center justify-center font-sans font-medium rounded-full border uppercase tracking-wide transition-all';
  const colorClasses = variant === 'colored' ? statusColors[status] : 'bg-white/10 border-white/20';
  const textColor = variant === 'colored' ? statusTextColors[status] : 'text-white/80';

  return (
    <span className={`${baseClasses} ${colorClasses} ${textColor} ${sizeClasses[size]} ${className}`}>
      {displayLabel}
    </span>
  );
};
