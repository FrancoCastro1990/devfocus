import React, { useState } from 'react';
import { Button } from '../../../shared/components/Button';
import { Input, Textarea } from '../../../shared/components/Input';

interface TaskFormProps {
  onSubmit: (title: string, description?: string) => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim(), description.trim() || undefined);
      setTitle('');
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter task title..."
        required
        autoFocus
      />

      <Textarea
        label="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter task description..."
        rows={3}
      />

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={!title.trim()}>
          Create Task
        </Button>
      </div>
    </form>
  );
};
