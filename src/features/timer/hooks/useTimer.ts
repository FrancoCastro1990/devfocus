import { useState, useEffect, useRef } from 'react';

interface UseTimerProps {
  initialSeconds?: number;
  isActive: boolean;
  onTick?: (seconds: number) => void;
  tickInterval?: number;
}

export const useTimer = ({
  initialSeconds = 0,
  isActive,
  onTick,
  tickInterval = 1000
}: UseTimerProps) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<number | null>(null);

  // Update seconds when initialSeconds changes
  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((prev) => {
          const newSeconds = prev + 1;
          onTick?.(newSeconds);
          return newSeconds;
        });
      }, tickInterval);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, onTick, tickInterval]);

  return { seconds, setSeconds };
};
