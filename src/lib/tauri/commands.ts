import { invoke } from '@tauri-apps/api/core';
import type {
  Task,
  Subtask,
  TimeSession,
  TaskWithSubtasks,
  TaskMetrics,
  SubtaskCompletion,
  TaskWithActiveSubtask,
  TaskWithSubtasksAndSessions,
  GeneralMetrics,
  Category,
  CategoryExperience,
  CategoryStats,
  UserProfile,
} from '../../shared/types/common.types';

// Task Commands
export const createTask = async (
  title: string,
  description?: string
): Promise<Task> => {
  return await invoke('create_task', { title, description });
};

export const listTasksWithActiveSubtasks = async (
  statusFilter?: string
): Promise<TaskWithActiveSubtask[]> => {
  return await invoke('list_tasks_with_active_subtasks', { statusFilter });
};

export const getTaskWithSubtasks = async (
  taskId: string
): Promise<TaskWithSubtasks> => {
  return await invoke('get_task_with_subtasks', { taskId });
};

export const getTaskWithSubtasksAndSessions = async (
  taskId: string
): Promise<TaskWithSubtasksAndSessions> => {
  return await invoke('get_task_with_subtasks_and_sessions', { taskId });
};

export const updateTaskStatus = async (
  taskId: string,
  status: string
): Promise<Task> => {
  return await invoke('update_task_status', { taskId, status });
};

export const deleteTask = async (taskId: string): Promise<void> => {
  return await invoke('delete_task', { taskId });
};

// Subtask Commands
export const createSubtask = async (
  taskId: string,
  title: string,
  categoryId?: string
): Promise<Subtask> => {
  return await invoke('create_subtask', { taskId, title, categoryId });
};

export const deleteSubtask = async (subtaskId: string): Promise<void> => {
  return await invoke('delete_subtask', { subtaskId });
};

// State Management Commands
export const startSubtask = async (
  subtaskId: string
): Promise<TimeSession> => {
  return await invoke('start_subtask', { subtaskId });
};

export const pauseSubtask = async (
  subtaskId: string,
  durationSeconds: number
): Promise<TimeSession> => {
  return await invoke('pause_subtask', { subtaskId, durationSeconds });
};

export const resumeSubtask = async (
  subtaskId: string
): Promise<TimeSession> => {
  return await invoke('resume_subtask', { subtaskId });
};

export const completeSubtask = async (
  subtaskId: string,
  durationSeconds: number
): Promise<SubtaskCompletion> => {
  return await invoke('complete_subtask', { subtaskId, durationSeconds });
};

export const updateSessionDuration = async (
  subtaskId: string,
  durationSeconds: number
): Promise<void> => {
  return await invoke('update_session_duration', { subtaskId, durationSeconds });
};

// Metrics Commands
export const getTaskMetrics = async (
  taskId: string
): Promise<TaskMetrics> => {
  return await invoke('get_task_metrics', { taskId });
};

export const getSubtaskWithSession = async (
  subtaskId: string
): Promise<[Subtask, TimeSession | null]> => {
  return await invoke('get_subtask_with_session', { subtaskId });
};

export const getGeneralMetrics = async (): Promise<GeneralMetrics> => {
  return await invoke('get_general_metrics');
};

// Category Commands
export const createCategory = async (
  name: string,
  color: string
): Promise<Category> => {
  return await invoke('create_category', { name, color });
};

export const listCategories = async (): Promise<Category[]> => {
  return await invoke('list_categories');
};

export const getCategoryExperience = async (
  categoryId: string
): Promise<CategoryExperience> => {
  return await invoke('get_category_experience', { categoryId });
};

export const getAllCategoryStats = async (): Promise<CategoryStats[]> => {
  return await invoke('get_all_category_stats');
};

// User Profile Commands
export const getUserProfile = async (): Promise<UserProfile> => {
  return await invoke('get_user_profile');
};
