import { useCallback, useEffect, useState } from 'react';
import { Modal } from './shared/components/Modal';
import { Button } from './shared/components/Button';
import { TaskList } from './features/tasks/components/TaskList';
import { TaskForm } from './features/tasks/components/TaskForm';
import { SubtaskList } from './features/subtasks/components/SubtaskList';
import { useTasks } from './features/tasks/hooks/useTasks';
import { useTaskActions } from './features/tasks/hooks/useTaskActions';
import { useTaskStore } from './features/tasks/store/taskStore';
import { useSubtaskStore } from './features/subtasks/store/subtaskStore';
import { GlobalLevelHeader } from './features/user-profile/components/GlobalLevelHeader';
import { XpGainPopup } from './features/categories/components/XpGainPopup';
import { StatusBadge } from './shared/components/StatusBadge';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { emitTo, listen } from '@tauri-apps/api/event';
import * as commands from './lib/tauri/commands';
import type { TaskWithActiveSubtask, TaskWithSubtasksAndSessions } from './shared/types/common.types';

const TRACKER_LABEL = 'subtask-tracker';

function App() {
  const [showTaskForm, setShowTaskForm] = useState(false);

  const { tasks, loading, refetch } = useTasks();
  const { create, deleteTask: removeTask, loadTaskWithSubtasks, updateStatus } = useTaskActions();
  const { currentTask, setCurrentTask } = useTaskStore();
  const { activeSubtaskId, setActiveSubtask } = useSubtaskStore();
  const isTauri =
    typeof window !== 'undefined' &&
    Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);

  const computeTrackerState = useCallback(
    (subtaskId: string) => {
      const task = useTaskStore.getState().currentTask;
      if (!task) return null;

      const entry = task.subtasksWithSessions.find((item) => item.subtask.id === subtaskId);
      if (!entry) return null;

      const { subtask, session } = entry;
      const baseTotal = subtask.totalTimeSeconds ?? 0;
      const storedDuration = session?.durationSeconds ?? 0;
      let seconds = baseTotal + storedDuration;

      if (subtask.status === 'in_progress' && session) {
        const referenceTimestamp = session.resumedAt ?? session.startedAt;
        if (referenceTimestamp) {
          const referenceMs = new Date(referenceTimestamp).getTime();
          if (!Number.isNaN(referenceMs)) {
            const elapsedSeconds = Math.max(0, Math.floor((Date.now() - referenceMs) / 1000));
            seconds = baseTotal + storedDuration + elapsedSeconds;
          }
        }
      }

      return {
        subtaskId,
        title: subtask.title ?? 'Subtask',
        seconds,
        paused: subtask.status === 'paused',
        categoryName: subtask.category?.name,
        categoryColor: subtask.category?.color,
      };
    },
    [],
  );

  const openOrUpdateTrackerWindow = useCallback(
    async (subtaskId: string, { focus = true }: { focus?: boolean } = {}) => {
      const trackerState = computeTrackerState(subtaskId);
      if (!trackerState) return;

      if (!isTauri) {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams({
          view: 'subtask-tracker',
          subtaskId: trackerState.subtaskId,
          title: encodeURIComponent(trackerState.title),
          seconds: trackerState.seconds.toString(),
          paused: trackerState.paused ? '1' : '0',
        });
        if (trackerState.categoryName) {
          params.set('categoryName', encodeURIComponent(trackerState.categoryName));
        }
        if (trackerState.categoryColor) {
          params.set('categoryColor', trackerState.categoryColor);
        }
        const fallbackUrl = `${window.location.origin}?${params.toString()}`;
        window.open(fallbackUrl, '_blank', 'noopener');
        return;
      }

      try {
        let trackerWindow = await WebviewWindow.getByLabel(TRACKER_LABEL);

        const params = new URLSearchParams({
          view: 'subtask-tracker',
          subtaskId: trackerState.subtaskId,
          title: encodeURIComponent(trackerState.title),
          seconds: trackerState.seconds.toString(),
          paused: trackerState.paused ? '1' : '0',
        });
        if (trackerState.categoryName) {
          params.set('categoryName', encodeURIComponent(trackerState.categoryName));
        }
        if (trackerState.categoryColor) {
          params.set('categoryColor', trackerState.categoryColor);
        }

        const trackerUrl = import.meta.env.PROD
          ? `index.html?${params.toString()}`
          : `${window.location.origin}?${params.toString()}`;

        if (!trackerWindow) {
          trackerWindow = new WebviewWindow(TRACKER_LABEL, {
            url: trackerUrl,
            title: 'Subtask Tracker',
            width: 340,
            height: 260,
            resizable: false,
            decorations: false,
            alwaysOnTop: true,
          });

          trackerWindow.once('tauri://error', (event) => {
            console.error('Error opening subtask tracker window', event);
          });

          trackerWindow.once('tauri://created', async () => {
            try {
              await emitTo(TRACKER_LABEL, 'subtask-tracker:load', trackerState);
            } catch (emitError) {
              console.error('Failed to send initial tracker state', emitError);
            }
          });
        } else {
          if (focus) {
            await trackerWindow.setFocus();
          }
          await emitTo(TRACKER_LABEL, 'subtask-tracker:load', trackerState);
        }
      } catch (error) {
        console.error('Unable to open Tauri tracker window, falling back to browser', error);
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams({
          view: 'subtask-tracker',
          subtaskId: trackerState.subtaskId,
          title: encodeURIComponent(trackerState.title),
          seconds: trackerState.seconds.toString(),
          paused: trackerState.paused ? '1' : '0',
        });
        if (trackerState.categoryName) {
          params.set('categoryName', encodeURIComponent(trackerState.categoryName));
        }
        if (trackerState.categoryColor) {
          params.set('categoryColor', trackerState.categoryColor);
        }
        const fallbackUrl = `${window.location.origin}?${params.toString()}`;
        window.open(fallbackUrl, '_blank', 'noopener');
      }
    },
    [computeTrackerState, isTauri],
  );

  const closeSubtaskTrackerWindow = useCallback(async () => {
    if (!isTauri) return;
    try {
      const trackerWindow = await WebviewWindow.getByLabel(TRACKER_LABEL);
      if (trackerWindow) {
        await trackerWindow.close();
      }
    } catch (error) {
      console.error('Failed to close subtask tracker window', error);
    }
  }, [isTauri]);

  const handleBack = useCallback(() => {
    setCurrentTask(null);
    setActiveSubtask(null, null);
    void closeSubtaskTrackerWindow();
  }, [closeSubtaskTrackerWindow, setActiveSubtask, setCurrentTask]);

  const refreshCurrentTask = useCallback(async (): Promise<TaskWithSubtasksAndSessions | null> => {
    const task = useTaskStore.getState().currentTask;
    if (!task) return null;

    try {
      const updated = await commands.getTaskWithSubtasksAndSessions(task.id);
      setCurrentTask(updated);

      const { activeSubtaskId: currentActiveId } = useSubtaskStore.getState();
      if (currentActiveId) {
        try {
          const [, updatedSession] = await commands.getSubtaskWithSession(currentActiveId);
          if (updatedSession) {
            setActiveSubtask(currentActiveId, updatedSession);
          }
        } catch (error) {
          console.error('Error refreshing active subtask session:', error);
        }
      }

      return updated;
    } catch (error) {
      console.error('Error refreshing current task:', error);
      return null;
    }
  }, [setActiveSubtask, setCurrentTask]);

  const openTaskSummaryWindow = useCallback(async (taskId: string) => {
    if (typeof window === 'undefined') return;

    const isTauri = Boolean(
      (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__
    );

    if (!isTauri) {
      const fallbackUrl = `${window.location.origin}?view=task-summary&taskId=${encodeURIComponent(taskId)}`;
      window.open(fallbackUrl, '_blank', 'noopener');
      return;
    }

    try {
      const existing = await WebviewWindow.getByLabel('task-summary');
      if (existing) {
        await emitTo('task-summary', 'task-summary:load', { taskId });
        await existing.setFocus();
        return;
      }

      const summaryUrl = import.meta.env.PROD
        ? `index.html?view=task-summary&taskId=${encodeURIComponent(taskId)}`
        : `${window.location.origin}?view=task-summary&taskId=${encodeURIComponent(taskId)}`;

      const taskSummaryWindow = new WebviewWindow('task-summary', {
        url: summaryUrl,
        title: 'Task Summary',
        width: 860,
        height: 640,
        resizable: false,
        decorations: false,
        alwaysOnTop: true,
      });

      taskSummaryWindow.once('tauri://created', () => {
        console.log('✅ Task Summary window created with decorations: false, alwaysOnTop: true');
      });

      taskSummaryWindow.once('tauri://error', (event) => {
        console.error('Error opening task summary window', event);
      });
    } catch (error) {
      console.error('Falling back to browser window for task summary', error);
      const fallbackUrl = `${window.location.origin}?view=task-summary&taskId=${encodeURIComponent(taskId)}`;
      window.open(fallbackUrl, '_blank', 'noopener');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isTauri = Boolean(
      (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__
    );

    if (!isTauri) return;

    let unlisten: (() => void) | undefined;

    listen('task-summary:refresh', async () => {
      await refetch();
      await refreshCurrentTask();
      handleBack();
    })
      .then((fn) => {
        unlisten = fn;
      })
      .catch((error) => {
        console.error('Failed to register task summary listener', error);
      });

    return () => {
      unlisten?.();
    };
  }, [handleBack, refetch, refreshCurrentTask]);

  useEffect(() => {
    if (!isTauri) return;

    if (!activeSubtaskId) {
      void closeSubtaskTrackerWindow();
      return;
    }

    if (!currentTask) return;

    void openOrUpdateTrackerWindow(activeSubtaskId, { focus: false });
  }, [activeSubtaskId, closeSubtaskTrackerWindow, currentTask, isTauri, openOrUpdateTrackerWindow]);

  useEffect(() => {
    if (!isTauri) return;

    let unlisten: (() => void) | undefined;

    listen<{ action: 'pause' | 'resume' | 'done'; subtaskId: string }>('subtask-tracker:updated', async (event) => {
      const { action, subtaskId } = event.payload ?? {};
      if (!action || !subtaskId) return;

      if (action === 'done') {
        setActiveSubtask(null, null);
        await refetch();
        const updatedTask = await refreshCurrentTask();
        await closeSubtaskTrackerWindow();

        const task = updatedTask ?? useTaskStore.getState().currentTask;
        if (task && task.subtasksWithSessions.length > 0) {
          const allDone = task.subtasksWithSessions.every((s) => s.subtask.status === 'done');
          if (allDone) {
            await openTaskSummaryWindow(task.id);
          }
        }
        return;
      }

      await refetch();
      await refreshCurrentTask();
      await openOrUpdateTrackerWindow(subtaskId, { focus: false });
    })
      .then((fn) => {
        unlisten = fn;
      })
      .catch((error) => {
        console.error('Failed to register subtask tracker listener', error);
      });

    return () => {
      unlisten?.();
    };
  }, [
    closeSubtaskTrackerWindow,
    isTauri,
    openOrUpdateTrackerWindow,
    openTaskSummaryWindow,
    refetch,
    refreshCurrentTask,
    setActiveSubtask,
  ]);

  const handleOpenGeneralSummary = async () => {
    if (typeof window === 'undefined') return;

    if (!isTauri) {
      const fallbackUrl = `${window.location.origin}?view=summary`;
      window.open(fallbackUrl, '_blank', 'noopener');
      return;
    }

    try {
      const existing = await WebviewWindow.getByLabel('general-summary');
      if (existing) {
        await existing.setFocus();
        return;
      }

      const summaryUrl = import.meta.env.PROD
        ? 'index.html?view=summary'
        : `${window.location.origin}?view=summary`;

      const summaryWindow = new WebviewWindow('general-summary', {
        url: summaryUrl,
        title: 'General Summary',
        width: 960,
        height: 680,
        resizable: false,
        decorations: false,
        alwaysOnTop: true,
      });

      summaryWindow.once('tauri://created', () => {
        console.log('✅ General Summary window created with decorations: false, alwaysOnTop: true');
      });

      summaryWindow.once('tauri://error', (event) => {
        console.error('Error opening general summary window', event);
      });
    } catch (error) {
      console.error('Falling back to browser window for summary view', error);
      const fallbackUrl = `${window.location.origin}?view=summary`;
      window.open(fallbackUrl, '_blank', 'noopener');
    }
  };

  const handleMinimizeToTray = async () => {
    if (!isTauri) return;
    try {
      await commands.minimizeToTray();
    } catch (error) {
      console.error('Error minimizing to tray:', error);
    }
  };

  const handleCreateTask = async (title: string, description?: string) => {
    await create(title, description);
    setShowTaskForm(false);
    await refetch(); // Refresh task list to show new task
  };

  const handleTaskClick = async (task: TaskWithActiveSubtask) => {
    await loadTaskWithSubtasks(task.id);

    // Si la tarea tiene una subtarea activa, cargar la sesión
    if (task.activeSubtask) {
      try {
        const [, session] = await commands.getSubtaskWithSession(task.activeSubtask.id);
        if (session) {
          setActiveSubtask(task.activeSubtask.id, session);
          await openOrUpdateTrackerWindow(task.activeSubtask.id, { focus: false });
        }
      } catch (error) {
        console.error('Error loading active session:', error);
      }
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await updateStatus(taskId, status);
      // Refresh the task list to show updated active subtasks
      await refetch();
      await refreshCurrentTask();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleCreateSubtask = async (title: string, categoryId?: string) => {
    if (!currentTask) return;
    const subtask = await commands.createSubtask(currentTask.id, title, categoryId);
    setCurrentTask({
      ...currentTask,
      subtasksWithSessions: [...currentTask.subtasksWithSessions, { subtask, session: null }],
    });
    await refetch(); // Refresh task list in case task status changed
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!currentTask) return;
    await commands.deleteSubtask(subtaskId);
    setCurrentTask({
      ...currentTask,
      subtasksWithSessions: currentTask.subtasksWithSessions.filter((s) => s.subtask.id !== subtaskId),
    });
    if (activeSubtaskId === subtaskId) {
      setActiveSubtask(null, null);
      void closeSubtaskTrackerWindow();
    }
    await refetch(); // Refresh task list in case active subtask was deleted
  };

  const handleStartSubtask = async (subtaskId: string) => {
    try {
      const session = await commands.startSubtask(subtaskId);
      setActiveSubtask(subtaskId, session);
      await refetch(); // Refresh task list to show active subtask
      await refreshCurrentTask();
      await openOrUpdateTrackerWindow(subtaskId);

      // Minimizar la app al tray automáticamente al iniciar una subtask
      if (isTauri) {
        await commands.minimizeToTray();
      }
    } catch (error) {
      console.error('Error starting subtask:', error);
    }
  };

  const handlePauseSubtask = async (subtaskId: string, duration: number) => {
    try {
      const session = await commands.pauseSubtask(subtaskId, duration);
      setActiveSubtask(subtaskId, session);
      await refetch(); // Refresh task list to update active subtask time
      await refreshCurrentTask();
      await openOrUpdateTrackerWindow(subtaskId, { focus: false });
    } catch (error) {
      console.error('Error pausing subtask:', error);
    }
  };

  const handleResumeSubtask = async (subtaskId: string) => {
    try {
      const session = await commands.resumeSubtask(subtaskId);
      setActiveSubtask(subtaskId, session);
      await refetch(); // Refresh task list to show active subtask
      await refreshCurrentTask();
      await openOrUpdateTrackerWindow(subtaskId, { focus: false });
    } catch (error) {
      console.error('Error resuming subtask:', error);
    }
  };

  const handleCompleteSubtask = async (subtaskId: string, duration: number) => {
    try {
      const completion = await commands.completeSubtask(subtaskId, duration);

      // Log streak bonus if present
      if (completion.streakBonusPercentage > 0) {
        console.log(
          `🔥 Streak bonus! +${(completion.streakBonusPercentage * 100).toFixed(0)}% XP (${completion.bonusXp} bonus XP)`
        );
      }

      setActiveSubtask(null, null);
      await refetch(); // Refresh task list since active subtask is now completed
      const updatedTask = await refreshCurrentTask();
      await closeSubtaskTrackerWindow();

      const task = updatedTask ?? useTaskStore.getState().currentTask;
      if (task && task.subtasksWithSessions.length > 0) {
        const allDone = task.subtasksWithSessions.every((s) => s.subtask.status === 'done');
        if (allDone) {
          await openTaskSummaryWindow(task.id);
        }
      }
    } catch (error) {
      console.error('Error completing subtask:', error);
    }
  };

  return (
    <div className="h-screen w-screen relative flex flex-col overflow-hidden font-sans">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/assets/image/background.jpg)',
          backgroundSize: 'auto',
          backgroundRepeat: 'repeat',
          opacity: 0.4, //TODO: revisar
        }}
      />
      {/* Dark overlay for better contrast - Enhanced for Linux */}
      <div className="fixed inset-0 z-0 bg-black/65" />

      <XpGainPopup />

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 glass-panel p-6">
          <h1 className="text-4xl font-bold text-white">
            DevFocus
          </h1>
          <p className="text-white/60 mt-2 text-sm">
            Task Management System v2.0 | Timer + XP + Gamification
          </p>
        </div>

        {/* Global Level Header */}
        <GlobalLevelHeader />

        {/* Main Content */}
        {!currentTask ? (
          // Task List View
          <div>
            <div className="flex justify-between items-center mb-6 glass-panel p-4">
              <h2 className="text-2xl font-semibold text-white">
                Tasks
              </h2>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleOpenGeneralSummary}>
                  Summary
                </Button>
                <Button variant="secondary" size="sm" onClick={handleMinimizeToTray}>
                  Min. Tray
                </Button>
                <Button variant="primary" size="sm" onClick={() => setShowTaskForm(true)}>
                  + New Task
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 glass-panel">
                <p className="text-white/60">
                  Loading tasks...
                </p>
              </div>
            ) : (
              <TaskList
                tasks={tasks}
                onTaskClick={handleTaskClick}
                onDeleteTask={removeTask}
              />
            )}

            <Modal isOpen={showTaskForm} onClose={() => setShowTaskForm(false)} title="Create New Task">
              <TaskForm onSubmit={handleCreateTask} onCancel={() => setShowTaskForm(false)} />
            </Modal>
          </div>
        ) : (
          // Task Detail View
          <div>
            <div className="mb-6">
              <Button variant="secondary" size="sm" onClick={handleBack}>
                ← Back
              </Button>
            </div>

            <div
              className="glass-panel p-6 mb-6 border-2 transition-all task-detail-status"
              data-status={currentTask.status}
              style={{
                backgroundColor:
                  currentTask.status === 'done'
                    ? 'rgb(50, 120, 100)'
                    : currentTask.status === 'in_progress'
                      ? 'rgb(100, 90, 150)'
                      : 'rgb(80, 115, 160)',
                borderColor:
                  currentTask.status === 'done'
                    ? 'rgba(52, 211, 153, 0.7)'
                    : currentTask.status === 'in_progress'
                      ? 'rgba(167, 139, 250, 0.8)'
                      : 'rgba(147, 197, 253, 0.7)',
                boxShadow:
                  currentTask.status === 'done'
                    ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 20px rgba(52, 211, 153, 0.4)'
                    : currentTask.status === 'in_progress'
                      ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 24px rgba(167, 139, 250, 0.5)'
                      : '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 20px rgba(147, 197, 253, 0.4)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white">
                    {currentTask.title}
                  </h2>
                  {currentTask.description && (
                    <p className="text-white/60 mt-3 text-sm">{currentTask.description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <select
                    value={currentTask.status}
                    onChange={(e) => handleUpdateTaskStatus(currentTask.id, e.target.value)}
                    className="glass-input px-3 py-1 text-sm"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openTaskSummaryWindow(currentTask.id)}
                  >
                    Summary
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <StatusBadge
                  status={currentTask.status as 'todo' | 'in_progress' | 'done'}
                  variant="colored"
                  size="sm"
                />
                <span className="px-3 py-1 rounded-full text-sm font-medium border border-accent-pink/40 bg-accent-pink/20 text-accent-pink backdrop-blur-sm">
                  {currentTask.subtasksWithSessions.filter((s) => s.subtask.status === 'done').length}/
                  {currentTask.subtasksWithSessions.length} done
                </span>
              </div>
            </div>

            <div className="glass-panel p-6">
              <SubtaskList
                subtasksWithSessions={currentTask.subtasksWithSessions}
                onCreateSubtask={handleCreateSubtask}
                onDeleteSubtask={handleDeleteSubtask}
                onStart={handleStartSubtask}
                onPause={handlePauseSubtask}
                onResume={handleResumeSubtask}
                onComplete={handleCompleteSubtask}
              />
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
