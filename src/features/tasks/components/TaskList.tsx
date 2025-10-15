import React from 'react';
import { FileQuestion } from 'lucide-react';
import { TaskCard } from './TaskCard';
import type { TaskWithActiveSubtask } from '../../../shared/types/common.types';

interface TaskListProps {
  tasks: TaskWithActiveSubtask[];
  onTaskClick: (task: TaskWithActiveSubtask) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskClick,
  onDeleteTask,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 glass-panel">
        <FileQuestion className="mx-auto mb-4 text-white/40" size={48} />
        <p className="text-lg font-sans text-white/80">
          No tasks found
        </p>
        <p className="text-sm mt-2 font-sans text-white/50">
          Create your first task to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onClick={() => onTaskClick(task)}
          onDelete={() => onDeleteTask(task.id)}
        />
      ))}
    </div>
  );
};
