import React, { useState } from 'react';
import type { SubtaskWithSession } from '../../../shared/types/common.types';
import { SubtaskItem } from './SubtaskItem';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { CategorySelector } from '../../categories/components/CategorySelector';

interface SubtaskListProps {
  subtasksWithSessions: SubtaskWithSession[];
  onCreateSubtask: (title: string, categoryId?: string) => void;
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onCreateSubtask(newSubtaskTitle.trim(), selectedCategoryId);
      setNewSubtaskTitle('');
      setSelectedCategoryId(undefined);
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-white/10 pb-3">
        <h3 className="text-lg font-sans font-semibold text-white">
          Subtasks
        </h3>
        {!isAdding && (
          <Button size="sm" variant="primary" onClick={() => setIsAdding(true)}>
            + Add
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="space-y-3 p-4 glass-panel">
          <div>
            <label className="block text-sm font-sans font-medium text-white/80 mb-2">
              Subtask Title
            </label>
            <Input
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Enter subtask title..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) handleAddSubtask();
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewSubtaskTitle('');
                  setSelectedCategoryId(undefined);
                }
              }}
            />
          </div>
          <CategorySelector
            value={selectedCategoryId}
            onChange={setSelectedCategoryId}
          />
          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={handleAddSubtask} disabled={!newSubtaskTitle.trim()}>
              Add
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setIsAdding(false);
                setNewSubtaskTitle('');
                setSelectedCategoryId(undefined);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {subtasksWithSessions.length === 0 ? (
          <p className="text-center text-white/60 font-sans py-8">
            No subtasks yet. Add one to get started!
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
