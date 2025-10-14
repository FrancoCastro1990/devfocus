export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type SubtaskStatus = 'todo' | 'in_progress' | 'paused' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface CategoryExperience {
  id: string;
  categoryId: string;
  totalXp: number;
  level: number;
  updatedAt: string;
}

export interface CategoryStats {
  category: Category;
  totalXp: number;
  level: number;
  xpForNextLevel: number;
  progressPercentage: number;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  status: SubtaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  totalTimeSeconds?: number;
  categoryId?: string;
  category?: Category;
}

export interface TimeSession {
  id: string;
  subtaskId: string;
  startedAt: string;
  pausedAt?: string;
  resumedAt?: string;
  endedAt?: string;
  durationSeconds: number;
}

export interface TaskWithSubtasks {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  subtasks: Subtask[];
}

export interface TaskWithActiveSubtask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  activeSubtask?: {
    id: string;
    title: string;
    totalTimeSeconds: number;
    currentSessionTime?: number;
  };
}

export interface SubtaskWithTime {
  subtask: Subtask;
  totalTimeSeconds: number;
}

export interface TaskMetrics {
  taskId: string;
  taskTitle: string;
  totalTimeSeconds: number;
  totalPoints: number;
  subtasksCompleted: number;
  subtasksTotal: number;
  averageTimePerSubtask: number;
  efficiencyRate: number;
  completedAt: string;
  subtasksWithTime: SubtaskWithTime[];
}

export interface SubtaskCompletion {
  subtask: Subtask;
  pointsEarned: number;
  timeSpentSeconds: number;
  xpGained: number;
  category?: Category;
}

export interface SubtaskWithSession {
  subtask: Subtask;
  session?: TimeSession | null;
}

export interface TaskWithSubtasksAndSessions {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  subtasksWithSessions: SubtaskWithSession[];
}

export interface DailyPoints {
  date: string;
  points: number;
  subtasksCompleted: number;
}

export interface GeneralMetrics {
  totalPoints: number;
  pointsToday: number;
  pointsThisWeek: number;
  pointsLast7Days: DailyPoints[];
  bestDay: DailyPoints | null;
  totalTasksCompleted: number;
  totalSubtasksCompleted: number;
  averageCompletionTimeSeconds: number;
}
