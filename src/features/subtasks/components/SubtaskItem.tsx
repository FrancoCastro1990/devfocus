import React, { useState, useEffect } from 'react';
import { Play, Pause, CheckCircle2, X } from 'lucide-react';
import type { Subtask, TimeSession } from '../../../shared/types/common.types';
import { useTimeCalculation } from '../../../shared/hooks/useTimeCalculation';
import { Button } from '../../../shared/components/Button';
import { CategoryBadge } from '../../categories/components/CategoryBadge';

interface SubtaskItemProps {
  subtask: Subtask;
  session?: TimeSession | null;
  onStart: () => void;
  onPause: (duration: number) => void;
  onResume: () => void;
  onComplete: (duration: number) => void;
  onDelete: () => void;
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  session,
  onStart,
  onPause,
  onResume,
  onComplete,
  onDelete,
}) => {
  const isActive = subtask.status === 'in_progress';
  const [borderPulse, setBorderPulse] = useState(false);

  // Use centralized time calculation hook
  const { totalSeconds, formattedTime } = useTimeCalculation({
    subtask,
    session,
    isActive,
  });

  // Border pulse animation for in_progress status
  useEffect(() => {
    if (subtask.status !== 'in_progress') return;

    const interval = setInterval(() => {
      setBorderPulse(true);
      setTimeout(() => setBorderPulse(false), 400);
    }, 5000);

    return () => clearInterval(interval);
  }, [subtask.status]);

  // Status-specific styles with glow effects
  const statusStyles = {
    todo: {
      bg: 'rgb(80, 115, 160)',
      bgBlur: 'rgba(147, 197, 253, 0.2)',
      border: 'rgba(147, 197, 253, 0.4)',
      shadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
      hoverShadow: '0 0 18px rgba(147, 197, 253, 0.25)',
    },
    in_progress: {
      bg: 'rgb(100, 90, 150)',
      bgBlur: 'rgba(167, 139, 250, 0.2)',
      border: 'rgba(167, 139, 250, 0.4)',
      shadow: '0 4px 16px rgba(0, 0, 0, 0.15), 0 0 20px rgba(167, 139, 250, 0.3)',
      hoverShadow: '0 0 24px rgba(167, 139, 250, 0.35)',
    },
    paused: {
      bg: 'rgb(85, 95, 145)',
      bgBlur: 'rgba(129, 140, 248, 0.2)',
      border: 'rgba(129, 140, 248, 0.4)',
      shadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
      hoverShadow: '0 0 18px rgba(129, 140, 248, 0.25)',
    },
    done: {
      bg: 'rgb(50, 120, 100)',
      bgBlur: 'rgba(52, 211, 153, 0.2)',
      border: 'rgba(52, 211, 153, 0.4)',
      shadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
      hoverShadow: '0 0 18px rgba(52, 211, 153, 0.25)',
    },
  };

  const currentStatus = statusStyles[subtask.status] || statusStyles.todo;

  const renderActions = () => {
    switch (subtask.status) {
      case 'todo':
        return (
          <Button size="sm" variant="primary" onClick={onStart}>
            Start
          </Button>
        );
      case 'in_progress':
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => onPause(totalSeconds)}>
              Pause
            </Button>
            <Button size="sm" variant="success" onClick={() => onComplete(totalSeconds)}>
              Done
            </Button>
          </div>
        );
      case 'paused':
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={onResume}>
              Resume
            </Button>
            <Button size="sm" variant="success" onClick={() => onComplete(totalSeconds)}>
              Done
            </Button>
          </div>
        );
      case 'done':
        return (
          <div className="flex items-center gap-1">
            <CheckCircle2 size={16} className="text-accent-emerald" />
            <span className="text-sm text-white/80 font-sans font-medium">
              Done
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  // Show timer if there's any time tracked or if currently active
  const showTimer = (subtask.status !== 'todo' || (session && session.durationSeconds > 0)) && session !== null;

  return (
    <div
      className="relative p-4 rounded-xl transition-all backdrop-blur-md font-sans border-2 subtask-item-status overflow-hidden"
      data-status={subtask.status}
      style={{
        backgroundColor: currentStatus.bg,
        borderColor: currentStatus.border,
        boxShadow: currentStatus.shadow,
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      }}
    >
      {/* Animated border for in_progress status */}
      {subtask.status === 'in_progress' && borderPulse && (
        <div
          className="absolute inset-0 rounded-xl animate-border-sweep pointer-events-none"
          style={{
            border: '2px solid rgba(167, 139, 250, 0.8)',
            opacity: 0.6,
          }}
        />
      )}

      <div className="flex justify-between items-center relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {subtask.status === 'in_progress' && <Play size={16} className="text-accent-purple animate-pulse" />}
            {subtask.status === 'paused' && <Pause size={16} className="text-accent-indigo" />}
            {subtask.status === 'done' && <CheckCircle2 size={16} className="text-accent-emerald" />}
            <h4 className="font-medium text-white">{subtask.title}</h4>
            {subtask.category && <CategoryBadge category={subtask.category} />}
          </div>
          {showTimer && (
            <p className="text-2xl font-sans font-bold mt-2 text-white">
              {formattedTime}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {renderActions()}
          {subtask.status !== 'done' && (
            <button
              onClick={onDelete}
              className="p-1.5 text-red-300 hover:bg-red-500/20 border border-transparent hover:border-red-400/40 rounded-lg transition-colors ml-2"
              title="Delete subtask"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
