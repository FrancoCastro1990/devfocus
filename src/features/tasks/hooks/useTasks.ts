import { useCallback, useEffect, useState } from 'react';
import { listTasksWithActiveSubtasks } from '../../../lib/tauri/commands';
import { useTaskStore } from '../store/taskStore';
import type { TaskStatus } from '../../../shared/types/common.types';

export const useTasks = (statusFilter?: TaskStatus) => {
  const { tasks, setTasks } = useTaskStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listTasksWithActiveSubtasks(statusFilter);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, setTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, refetch: fetchTasks };
};
