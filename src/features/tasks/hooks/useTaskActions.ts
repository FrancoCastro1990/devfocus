import { useState } from 'react';
import * as commands from '../../../lib/tauri/commands';
import { useTaskStore } from '../store/taskStore';

export const useTaskActions = () => {
  const { addTask, updateTask, removeTask, setCurrentTask } = useTaskStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (title: string, description?: string) => {
    try {
      setLoading(true);
      setError(null);
      const task = await commands.createTask(title, description);
      addTask(task);
      return task;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (taskId: string, status: string) => {
    try {
      setLoading(true);
      setError(null);
      const task = await commands.updateTaskStatus(taskId, status);
      updateTask(task);
      return task;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setLoading(true);
      setError(null);
      await commands.deleteTask(taskId);
      removeTask(taskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadTaskWithSubtasks = async (taskId: string) => {
    try {
      setLoading(true);
      setError(null);
      const task = await commands.getTaskWithSubtasksAndSessions(taskId);
      setCurrentTask(task);
      return task;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    create,
    updateStatus,
    deleteTask,
    loadTaskWithSubtasks,
    loading,
    error,
  };
};
