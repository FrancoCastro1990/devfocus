import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { pauseSubtask, resumeSubtask, completeSubtask } from '../../../lib/tauri/commands';
import { formatTime } from '../../../shared/utils/timeFormatter';
import { emit, listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';

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
    <div className="h-screen w-screen bg-gray-900 text-white select-none flex flex-col overflow-hidden">
      <div className="relative flex items-center justify-between px-3 py-2.5 text-sm bg-gray-800 cursor-move flex-shrink-0" data-tauri-drag-region>
        <div className="flex items-center gap-2 flex-1 min-w-0 pointer-events-none">
          <span aria-hidden className="text-lg leading-none text-gray-400">⋮⋮</span>
          <span className="font-semibold truncate">{title}</span>
        </div>
        <button
          type="button"
          aria-label="Close tracker"
          onClick={handleClose}
          className="text-gray-400 hover:text-white transition-colors pl-3 text-xl leading-none pointer-events-auto"
          data-tauri-drag-region-exclude
        >
          ×
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 min-h-0">
        <div className="text-4xl font-bold tracking-widest">
          {formattedTime}
        </div>

        {categoryName && categoryColor && (
          <div className="flex items-center gap-2 text-sm">
            <span
              className="px-3 py-1 rounded-full font-medium text-xs"
              style={{
                backgroundColor: `${categoryColor}30`,
                color: categoryColor,
              }}
            >
              {categoryName}
            </span>
            <span className="text-gray-300 text-xs">
              +{seconds} XP
            </span>
          </div>
        )}

        {error && (
          <div className="text-xs text-red-400 text-center">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 mt-1">
          <button
            type="button"
            onClick={handlePauseResume}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            type="button"
            onClick={handleDone}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-md bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubtaskTrackerWindow;
