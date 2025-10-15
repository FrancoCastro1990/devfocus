import { useMemo } from 'react';
import type { Subtask, TimeSession } from '../types/common.types';
import { useTimer } from '../../features/timer/hooks/useTimer';
import { formatTime } from '../utils/timeFormatter';

interface UseTimeCalculationOptions {
  subtask: Subtask;
  session?: TimeSession | null;
  isActive: boolean;
}

interface TimeBreakdown {
  accumulated: number;
  session: number;
  elapsed: number;
}

/**
 * Custom hook: useTimeCalculation
 *
 * Centralizes the complex time calculation logic for subtasks.
 * Handles accumulated time, session duration, and real-time elapsed time.
 *
 * @param subtask - The subtask object containing totalTimeSeconds
 * @param session - Optional TimeSession with duration and timestamps
 * @param isActive - Whether the subtask is currently in_progress
 *
 * @returns Object containing:
 *   - totalSeconds: Total calculated time in seconds
 *   - formattedTime: Formatted time string (HH:MM:SS)
 *   - breakdown: Detailed breakdown of time components
 */
export const useTimeCalculation = ({
  subtask,
  session,
  isActive,
}: UseTimeCalculationOptions) => {
  // Calculate initial time based on session state
  const initialTime = useMemo(() => {
    const totalAccumulatedTime = subtask.totalTimeSeconds || 0;

    // No session yet - use accumulated time or 0
    if (!session) {
      return totalAccumulatedTime || 0;
    }

    // Active session - calculate elapsed time in real-time
    if (isActive) {
      const now = Date.now();
      const startTime = session.resumedAt
        ? new Date(session.resumedAt).getTime()
        : new Date(session.startedAt).getTime();
      const elapsedMs = now - startTime;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);

      return totalAccumulatedTime + session.durationSeconds + elapsedSeconds;
    }

    // Paused session - use stored duration
    return totalAccumulatedTime + session.durationSeconds;
  }, [subtask.totalTimeSeconds, session, isActive]);

  // Use timer to increment time when active
  const { seconds } = useTimer({
    initialSeconds: initialTime,
    isActive,
  });

  // Calculate breakdown for debugging/display
  const breakdown: TimeBreakdown = useMemo(() => {
    const accumulated = subtask.totalTimeSeconds || 0;
    const sessionDuration = session?.durationSeconds || 0;
    const elapsed = seconds - accumulated - sessionDuration;

    return {
      accumulated,
      session: sessionDuration,
      elapsed: Math.max(0, elapsed),
    };
  }, [subtask.totalTimeSeconds, session, seconds]);

  // Format time
  const formattedTime = useMemo(() => formatTime(seconds), [seconds]);

  return {
    totalSeconds: seconds,
    formattedTime,
    breakdown,
  };
};
