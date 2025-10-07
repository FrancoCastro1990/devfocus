import { create } from 'zustand';
import type { TaskWithActiveSubtask, TaskWithSubtasksAndSessions } from '../../../shared/types/common.types';

interface TaskStore {
  tasks: TaskWithActiveSubtask[];
  currentTask: TaskWithSubtasksAndSessions | null;
  setTasks: (tasks: TaskWithActiveSubtask[]) => void;
  addTask: (task: TaskWithActiveSubtask) => void;
  updateTask: (task: TaskWithActiveSubtask) => void;
  removeTask: (taskId: string) => void;
  setCurrentTask: (task: TaskWithSubtasksAndSessions | null) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  currentTask: null,
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (task) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    })),
  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),
  setCurrentTask: (task) => set({ currentTask: task }),
}));
