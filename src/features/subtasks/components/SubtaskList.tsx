import React, { useState } from 'react';
import type { SubtaskWithSession } from '../../../shared/types/common.types';
import { SubtaskItem } from './SubtaskItem';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';

interface SubtaskListProps {
  subtasksWithSessions: SubtaskWithSession[];
  onCreateSubtask: (title: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onStart: (subtaskId: string) => void;
  onPause: (subtaskId: string, duration: number) => void;
  onResume: (subtaskId: string) => void;
  onComplete: (subtaskId: string, duration: number) => void;
}

export const SubtaskList: React.FC<SubtaskListProps> = ({
  subtasksWithSessions,
  onCreateSubtask,
  onDeleteSubtask,
  onStart,
  onPause,
  onResume,
  onComplete,
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onCreateSubtask(newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Subtasks</h3>
        {!isAdding && (
          <Button size="sm" variant="primary" onClick={() => setIsAdding(true)}>
            + Add Subtask
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="flex gap-2">
          <Input
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="Enter subtask title..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSubtask();
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewSubtaskTitle('');
              }
            }}
          />
          <Button size="sm" variant="primary" onClick={handleAddSubtask}>
            Add
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setIsAdding(false);
              setNewSubtaskTitle('');
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {subtasksWithSessions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No subtasks yet. Add your first subtask to get started!
          </p>
        ) : (
          subtasksWithSessions.map(({ subtask, session }) => (
            <SubtaskItem
              key={subtask.id}
              subtask={subtask}
              session={session}
              onStart={() => onStart(subtask.id)}
              onPause={(duration) => onPause(subtask.id, duration)}
              onResume={() => onResume(subtask.id)}
              onComplete={(duration) => onComplete(subtask.id, duration)}
              onDelete={() => onDeleteSubtask(subtask.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
