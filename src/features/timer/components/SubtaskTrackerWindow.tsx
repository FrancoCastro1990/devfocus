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

  const { activeXpGains, addXpGainAnimation, removeXpGainAnimation } = useCategoryStore();

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

  // XP gain animation effect - trigger every 5 seconds
  useEffect(() => {
    // Only trigger animations if:
    // 1. Subtask has a category
    // 2. Subtask is not paused
    if (!categoryName || !categoryColor || isPaused) return;

    // Trigger XP gain animation every 5 seconds
    const interval = setInterval(() => {
      addXpGainAnimation({
        id: `xp-${Date.now()}`,
        categoryName,
        categoryColor,
        xpAmount: 5,
        timestamp: Date.now(),
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [categoryName, categoryColor, isPaused, addXpGainAnimation]);

  // Auto-remove XP animations after 2 seconds
  useEffect(() => {
    if (activeXpGains.length === 0) return;

    // Remove oldest animation after 2 seconds
    const timer = setTimeout(() => {
      const oldest = activeXpGains[0];
      if (oldest) {
        removeXpGainAnimation(oldest.id);
      }
    }, 2000);

    return () => clearTimeout(timer);
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
    <div className="h-screen w-screen bg-gradient-to-br from-[#0f0f23] to-[#1a1a2e] text-white select-none flex flex-col overflow-hidden font-sans border-2 border-accent-purple/30 relative">
      <div className="relative flex items-center justify-between px-3 py-2.5 text-sm bg-glass-primary backdrop-blur-md border-b border-glass-border cursor-move flex-shrink-0 z-20" data-tauri-drag-region>
        <div className="flex items-center gap-2 flex-1 min-w-0 pointer-events-none">
          <span className="font-semibold truncate text-white">{title}</span>
        </div>
        <button
          type="button"
          aria-label="Close tracker"
          onClick={handleClose}
          className="text-white/60 hover:text-white transition-colors pl-3 pointer-events-auto"
          data-tauri-drag-region-exclude
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 min-h-0 z-20">
        <div className="text-5xl font-bold tracking-wider text-white">
          {formattedTime}
        </div>

        {categoryName && categoryColor && (
          <div className="flex items-center gap-2 text-sm">
            <span
              className="px-3 py-1 border font-sans font-medium text-xs rounded-lg backdrop-blur-sm"
              style={{
                backgroundColor: `${categoryColor}15`,
                borderColor: `${categoryColor}60`,
                color: categoryColor,
              }}
            >
              {categoryName}
            </span>
            <span className="text-white/60 text-xs font-sans">
              +{seconds} XP
            </span>
          </div>
        )}

        {error && (
          <div className="text-xs text-red-300 text-center font-sans border border-red-400/40 bg-red-500/20 rounded-lg px-3 py-1">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 mt-1">
          <button
            type="button"
            onClick={handlePauseResume}
            disabled={loading}
            className="glass-button flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="glass-button flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 size={16} />
            <span>Done</span>
          </button>
        </div>
      </div>

      {/* XP Gain Animations */}
      {activeXpGains.length > 0 && (
        <div className="absolute top-12 right-4 z-50 pointer-events-none">
          <div className="flex flex-col gap-2">
            {activeXpGains.map((gain, index) => (
              <div
                key={gain.id}
                className="animate-float-up"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div
                  className="px-3 py-1.5 border font-sans font-bold text-sm rounded-xl backdrop-blur-md"
                  style={{
                    borderColor: `${gain.categoryColor}60`,
                    color: gain.categoryColor,
                    backgroundColor: `${gain.categoryColor}15`,
                  }}
                >
                  +{gain.xpAmount} XP [{gain.categoryName}]
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubtaskTrackerWindow;
