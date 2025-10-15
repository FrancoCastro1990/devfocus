import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pause, Play, CheckCircle2, X } from 'lucide-react';
import { pauseSubtask, resumeSubtask, completeSubtask } from '../../../lib/tauri/commands';
import { formatTime } from '../../../shared/utils/timeFormatter';
import { emit, listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useCategoryStore } from '../../categories/store/categoryStore';

const parseSecondsParam = (value: string | null) => {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
};

const SubtaskTrackerWindow: React.FC = () => {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  const initialSubtaskId = params.get('subtaskId') ?? '';
  const initialTitle = params.get('title') ? decodeURIComponent(params.get('title') as string) : 'Subtask';
  const initialSeconds = parseSecondsParam(params.get('seconds'));
  const initialPaused = params.get('paused') === '1';
  const categoryName = params.get('categoryName') ? decodeURIComponent(params.get('categoryName') as string) : null;
  const categoryColor = params.get('categoryColor') || null;

  const [subtaskId, setSubtaskId] = useState(initialSubtaskId);
  const [title, setTitle] = useState(initialTitle);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(initialPaused);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [xpPulse, setXpPulse] = useState(false);

  const { activeXpGains, removeXpGainAnimation } = useCategoryStore();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSeconds((prev) => (isPaused ? prev : prev + 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    let unlistenLoad: (() => void) | undefined;
    let unlistenClose: (() => void) | undefined;

    listen<{ subtaskId: string; title: string; seconds: number; paused?: boolean }>(
      'subtask-tracker:load',
      (event) => {
        if (!event.payload) return;
        const { subtaskId: id, title: newTitle, seconds: secs, paused } = event.payload;
        if (id) {
          setSubtaskId(id);
        }
        if (typeof newTitle === 'string') {
          setTitle(newTitle);
        }
        if (typeof secs === 'number' && Number.isFinite(secs)) {
          setSeconds(Math.max(0, Math.floor(secs)));
        }
        if (typeof paused === 'boolean') {
          setIsPaused(paused);
        } else {
          setIsPaused(false);
        }
      },
    )
      .then((fn) => {
        unlistenLoad = fn;
      })
      .catch((err) => {
        console.error('Failed to listen for tracker load events', err);
      });

    listen('subtask-tracker:close', async () => {
      await getCurrentWindow().close();
    })
      .then((fn) => {
        unlistenClose = fn;
      })
      .catch((err) => {
        console.error('Failed to listen for tracker close events', err);
      });

    return () => {
      unlistenLoad?.();
      unlistenClose?.();
    };
  }, []);

  // XP gain animation effect - trigger pulse every 5 seconds
  useEffect(() => {
    // Only trigger animations if:
    // 1. Subtask has a category
    // 2. Subtask is not paused
    if (!categoryName || !categoryColor || isPaused) return;

    // Trigger XP pulse animation every 5 seconds
    const interval = setInterval(() => {
      setXpPulse(true);
      // Reset pulse after animation completes
      setTimeout(() => setXpPulse(false), 600);
    }, 5000);

    return () => clearInterval(interval);
  }, [categoryName, categoryColor, isPaused]);

  // Clean up XP gains store (no longer needed for display)
  useEffect(() => {
    if (activeXpGains.length > 0) {
      activeXpGains.forEach(gain => removeXpGainAnimation(gain.id));
    }
  }, [activeXpGains, removeXpGainAnimation]);

  const handlePauseResume = useCallback(async () => {
    if (!subtaskId) return;
    try {
      setLoading(true);
      setError(null);
      if (!isPaused) {
        const session = await pauseSubtask(subtaskId, seconds);
        setSeconds(session.durationSeconds ?? seconds);
        setIsPaused(true);
        await emit('subtask-tracker:updated', { action: 'pause', subtaskId });
      } else {
        const session = await resumeSubtask(subtaskId);
        setSeconds(session.durationSeconds ?? seconds);
        setIsPaused(false);
        await emit('subtask-tracker:updated', { action: 'resume', subtaskId });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update the subtask.');
    } finally {
      setLoading(false);
    }
  }, [isPaused, seconds, subtaskId]);

  const handleDone = useCallback(async () => {
    if (!subtaskId) return;
    try {
      setLoading(true);
      setError(null);
      await completeSubtask(subtaskId, seconds);
      await emit('subtask-tracker:updated', { action: 'done', subtaskId });
      await getCurrentWindow().close();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete the subtask.');
    } finally {
      setLoading(false);
    }
  }, [seconds, subtaskId]);

  const handleClose = useCallback(async () => {
    await getCurrentWindow().close();
  }, []);

  const formattedTime = formatTime(seconds);

  return (
    <div 
      className="h-screen w-screen text-white select-none flex flex-col overflow-hidden font-sans relative"
      style={{
        background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.15), transparent 50%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.15), transparent 50%), linear-gradient(135deg, rgb(15, 15, 35) 0%, rgb(26, 26, 46) 50%, rgb(20, 20, 40) 100%)',
      }}
    >
      {/* Header with glass effect */}
      <div 
        className="relative flex items-center justify-between px-3 py-2.5 text-sm border-b cursor-move flex-shrink-0 z-20 backdrop-blur-xl" 
        data-tauri-drag-region
        style={{
          backgroundColor: 'rgba(100, 90, 150, 0.35)',
          borderColor: 'rgba(167, 139, 250, 0.3)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 pointer-events-none">
          <span className="font-semibold truncate text-white">{title}</span>
        </div>
        <button
          type="button"
          aria-label="Close tracker"
          onClick={handleClose}
          className="text-white/60 hover:text-white transition-all pl-3 pointer-events-auto hover:scale-110"
          data-tauri-drag-region-exclude
        >
          <X size={20} />
        </button>
      </div>

      {/* Main content area with glass panel */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 min-h-0 z-20">
        {/* Timer display - clean without borders */}
        <div className="text-7xl font-bold tracking-wider text-white">
          {formattedTime}
        </div>

        {categoryName && categoryColor && (
          <div 
            className={`relative flex items-center gap-3 px-4 py-2 rounded-xl border backdrop-blur-xl transition-all duration-200 overflow-hidden`}
            style={{
              backgroundColor: `${categoryColor}15`,
              borderColor: `${categoryColor}40`,
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              boxShadow: `0 4px 16px ${categoryColor}15`,
            }}
          >
            {/* Animated border shimmer */}
            {xpPulse && (
              <div 
                className="absolute inset-0 rounded-xl animate-border-sweep"
                style={{
                  border: `2px solid ${categoryColor}`,
                  opacity: 0.6,
                }}
              />
            )}
            
            <span
              className="font-sans font-semibold text-sm relative z-10"
              style={{ color: categoryColor }}
            >
              {categoryName}
            </span>
            <div className="h-4 w-px bg-white/20 relative z-10"></div>
            <span 
              className={`text-white/80 text-sm font-sans font-medium transition-all duration-200 relative z-10 ${
                xpPulse ? 'text-white font-semibold' : ''
              }`}
            >
              +{seconds} XP
            </span>
          </div>
        )}

        {error && (
          <div 
            className="text-xs text-center font-sans border rounded-xl px-4 py-2 backdrop-blur-xl"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            }}
          >
            {error}
          </div>
        )}

        {/* Action buttons with glass effect */}
        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={handlePauseResume}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border-2 font-sans font-semibold text-sm transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 backdrop-blur-xl flex items-center gap-2"
            style={{
              backgroundColor: 'rgba(100, 90, 150, 0.3)',
              borderColor: 'rgba(167, 139, 250, 0.5)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            {isPaused ? (
              <>
                <Play size={16} />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause size={16} />
                <span>Pause</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleDone}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border-2 font-sans font-semibold text-sm transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 backdrop-blur-xl flex items-center gap-2"
            style={{
              backgroundColor: 'rgba(52, 211, 153, 0.25)',
              borderColor: 'rgba(52, 211, 153, 0.5)',
              color: '#6ee7b7',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              boxShadow: '0 4px 16px rgba(52, 211, 153, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <CheckCircle2 size={16} />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubtaskTrackerWindow;
