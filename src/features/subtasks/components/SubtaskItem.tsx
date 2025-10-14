import React from 'react';
import type { Subtask, TimeSession } from '../../../shared/types/common.types';
import { useTimer } from '../../timer/hooks/useTimer';
import { formatTime } from '../../../shared/utils/timeFormatter';
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
  // Use total accumulated time plus current session time
  const totalAccumulatedTime = subtask.totalTimeSeconds || 0;

  // Calculate initial time based on session state
  let initialTime = totalAccumulatedTime;
  if (session) {
    if (isActive) {
      // If active, calculate elapsed time from start or from resume point
      const now = Date.now();
      const startTime = session.resumedAt
        ? new Date(session.resumedAt).getTime()
        : new Date(session.startedAt).getTime();
      const elapsedMs = now - startTime;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      initialTime = totalAccumulatedTime + session.durationSeconds + elapsedSeconds;
      console.log(`Active session calc: total=${totalAccumulatedTime}, stored=${session.durationSeconds}, elapsed=${elapsedSeconds}, total=${initialTime}`);
    } else {
      // If paused, use stored duration
      initialTime = totalAccumulatedTime + session.durationSeconds;
      console.log(`Paused session calc: total=${totalAccumulatedTime}, stored=${session.durationSeconds}, initialTime=${initialTime}`);
    }
  } else {
    initialTime = 0; // No session yet
  }

  console.log(`Final initialTime for ${subtask.title} (${subtask.status}): ${initialTime}, session: ${!!session}`);

  const { seconds } = useTimer({
    initialSeconds: initialTime,
    isActive,
  });

  // Temporary debug
  console.log(`SubtaskItem ${subtask.title}:`, {
    status: subtask.status,
    isActive,
    hasSession: !!session,
    session: session ? { ...session, duration_seconds: session.durationSeconds } : null,
    totalAccumulatedTime,
    initialTime,
    seconds,
    timeShown: formatTime(seconds),
    calculation: session && !isActive ? `paused: ${totalAccumulatedTime} + ${session.durationSeconds}` : isActive ? 'active: calculating elapsed' : 'no session',
  });

  const statusColors = {
    todo: 'bg-gray-100 border-gray-300',
    in_progress: 'bg-blue-100 border-blue-400',
    paused: 'bg-yellow-100 border-yellow-400',
    done: 'bg-green-100 border-green-400',
  };

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
            <Button size="sm" variant="secondary" onClick={() => onPause(seconds)}>
              Pause
            </Button>
            <Button size="sm" variant="success" onClick={() => onComplete(seconds)}>
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
            <Button size="sm" variant="success" onClick={() => onComplete(seconds)}>
              Done
            </Button>
          </div>
        );
      case 'done':
        return (
          <span className="text-sm text-green-700 font-medium">
            ✓ Completed
          </span>
        );
      default:
        return null;
    }
  };

  // Show timer if there's any time tracked or if currently active
  const showTimer = (subtask.status !== 'todo' || (session && session.durationSeconds > 0)) && session !== null;

  return (
    <div className={`p-4 border-2 rounded-lg transition-all ${statusColors[subtask.status]}`}>
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{subtask.title}</h4>
            {subtask.category && <CategoryBadge category={subtask.category} />}
          </div>
          {showTimer && (
            <p className="text-2xl font-mono font-bold mt-2">
              {formatTime(seconds)} ({seconds}s)
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {renderActions()}
          {subtask.status !== 'done' && (
            <button
              onClick={onDelete}
              className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors ml-2"
              title="Delete subtask"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
