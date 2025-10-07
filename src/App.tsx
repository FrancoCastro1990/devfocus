import { useState } from 'react';
import { Modal } from './shared/components/Modal';
import { Button } from './shared/components/Button';
import { TaskList } from './features/tasks/components/TaskList';
import { TaskForm } from './features/tasks/components/TaskForm';
import { SubtaskList } from './features/subtasks/components/SubtaskList';
import { MetricsModal } from './features/metrics/components/MetricsModal';
import { useTasks } from './features/tasks/hooks/useTasks';
import { useTaskActions } from './features/tasks/hooks/useTaskActions';
import { useTaskStore } from './features/tasks/store/taskStore';
import { useSubtaskStore } from './features/subtasks/store/subtaskStore';
import * as commands from './lib/tauri/commands';
import type { TaskMetrics, TaskWithActiveSubtask } from './shared/types/common.types';

function App() {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [metrics, setMetrics] = useState<TaskMetrics | null>(null);

  const { tasks, loading, refetch } = useTasks();
  const { create, deleteTask: removeTask, loadTaskWithSubtasks, updateStatus } = useTaskActions();
  const { currentTask, setCurrentTask } = useTaskStore();
  const { activeSession, setActiveSubtask } = useSubtaskStore();

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
        console.log(`Loading active session for subtask ${task.activeSubtask.id}:`, session);
        console.log(`Active subtask info:`, task.activeSubtask);
        if (session) {
          setActiveSubtask(task.activeSubtask.id, session);
        }
      } catch (error) {
        console.error('Error loading active session:', error);
      }
    }
  };

  const handleBack = () => {
    setCurrentTask(null);
    setActiveSubtask(null, null);
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

  const handleCreateSubtask = async (title: string) => {
    if (!currentTask) return;
    const subtask = await commands.createSubtask(currentTask.id, title);
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
    await refetch(); // Refresh task list in case active subtask was deleted
  };

  const handleStartSubtask = async (subtaskId: string) => {
    try {
      const session = await commands.startSubtask(subtaskId);
      setActiveSubtask(subtaskId, session);
      await refetch(); // Refresh task list to show active subtask
      await refreshCurrentTask();
    } catch (error) {
      console.error('Error starting subtask:', error);
    }
  };

  const handlePauseSubtask = async (subtaskId: string, duration: number) => {
    try {
      console.log(`Pausing subtask ${subtaskId} with duration ${duration}`);
      const session = await commands.pauseSubtask(subtaskId, duration);
      console.log(`Pause result session:`, session);
      setActiveSubtask(subtaskId, session);
      await refetch(); // Refresh task list to update active subtask time
      await refreshCurrentTask();
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
    } catch (error) {
      console.error('Error resuming subtask:', error);
    }
  };

  const handleCompleteSubtask = async (subtaskId: string, duration: number) => {
    await commands.completeSubtask(subtaskId, duration);
    setActiveSubtask(null, null);
    await refetch(); // Refresh task list since active subtask is now completed
    await refreshCurrentTask();

    // Check if all subtasks are done
    if (currentTask) {
      const updatedTask = await commands.getTaskWithSubtasksAndSessions(currentTask.id);
      const allDone = updatedTask.subtasksWithSessions.every((s) => s.subtask.status === 'done');
      if (allDone && updatedTask.subtasksWithSessions.length > 0) {
        const taskMetrics = await commands.getTaskMetrics(currentTask.id);
        setMetrics(taskMetrics);
        setShowMetrics(true);
      }
    }
  };

  const handleConfirmComplete = async () => {
    if (!currentTask) return;
    await updateStatus(currentTask.id, 'done');
    setShowMetrics(false);
    setMetrics(null);
    handleBack();
  };

  const refreshCurrentTask = async () => {
    if (!currentTask) return;
    const updated = await commands.getTaskWithSubtasksAndSessions(currentTask.id);
    setCurrentTask(updated);

    // También actualizar la sesión activa si existe
    if (activeSession) {
      try {
        console.log(`Refreshing session for subtask ${activeSession.subtaskId}`);
        const [, updatedSession] = await commands.getSubtaskWithSession(activeSession.subtaskId);
        console.log(`Refreshed session:`, updatedSession);
        if (updatedSession) {
          setActiveSubtask(activeSession.subtaskId, updatedSession);
        }
      } catch (error) {
        console.error('Error refreshing active session:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">DevFocus</h1>
          <p className="text-gray-600 mt-2">Task management with timer and points system</p>
        </div>

        {/* Main Content */}
        {!currentTask ? (
          // Task List View
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Tasks</h2>
              <Button variant="primary" onClick={() => setShowTaskForm(true)}>
                + New Task
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading tasks...</div>
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
                ← Back to Tasks
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900">{currentTask.title}</h2>
                  {currentTask.description && (
                    <p className="text-gray-600 mt-2">{currentTask.description}</p>
                  )}
                </div>
                <select
                  value={currentTask.status}
                  onChange={(e) => handleUpdateTaskStatus(currentTask.id, e.target.value)}
                  className="px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="mt-4 flex gap-2">
                <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 capitalize">
                  {currentTask.status.replace('_', ' ')}
                </span>
                <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800">
                  {currentTask.subtasksWithSessions.filter((s) => s.subtask.status === 'done').length}/
                  {currentTask.subtasksWithSessions.length} subtasks completed
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
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

        {/* Metrics Modal */}
        {metrics && (
          <MetricsModal
            isOpen={showMetrics}
            metrics={metrics}
            onClose={() => setShowMetrics(false)}
            onConfirmComplete={handleConfirmComplete}
          />
        )}
      </div>
    </div>
  );
}

export default App;
