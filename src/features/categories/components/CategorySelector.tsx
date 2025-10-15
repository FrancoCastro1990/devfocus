import React, { useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import { createCategory } from '../../../lib/tauri/commands';
import { useCategoryStore } from '../store/categoryStore';

interface CategorySelectorProps {
  value?: string;
  onChange: (categoryId: string | undefined) => void;
}

const DEFAULT_COLORS = [
  '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4',
  '#f59e0b', '#ef4444', '#6366f1', '#14b8a6', '#f97316',
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({ value, onChange }) => {
  const { categories } = useCategories();
  const { addCategory } = useCategoryStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);
  const [creating, setCreating] = useState(false);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      setCreating(true);
      const category = await createCategory(newCategoryName.trim(), selectedColor);
      addCategory(category);
      onChange(category.id);
      setNewCategoryName('');
      setShowCreateForm(false);
      setSelectedColor(DEFAULT_COLORS[0]);
    } catch (error) {
      console.error('Failed to create category:', error);
    } finally {
      setCreating(false);
    }
  };

  if (showCreateForm) {
    return (
      <div className="space-y-3 p-3 glass-panel">
        <div>
          <label className="block text-sm font-sans font-medium text-white/80 mb-2">
            Category Name
          </label>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="e.g., frontend, backend..."
            className="glass-input w-full"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateCategory();
              if (e.key === 'Escape') setShowCreateForm(false);
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-sans font-medium text-white/80 mb-2">
            Color
          </label>
          <div className="flex gap-2 flex-wrap">
            {DEFAULT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 border rounded-lg transition-all ${
                  selectedColor === color ? 'border-white shadow-glass scale-110' : 'border-white/20'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCreateCategory}
            disabled={creating || !newCategoryName.trim()}
            className="flex-1 glass-button font-sans text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
          <button
            onClick={() => {
              setShowCreateForm(false);
              setNewCategoryName('');
            }}
            className="glass-button font-sans text-sm bg-white/5 border-white/20"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-sans font-medium text-white/80">
        Category (optional)
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="glass-input w-full font-sans text-sm"
      >
        <option value="">No category</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => setShowCreateForm(true)}
        className="text-sm text-accent-purple hover:text-accent-blue font-sans font-medium transition-colors"
      >
        + Create New Category
      </button>
    </div>
  );
};
