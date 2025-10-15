import React from 'react';
import type { Category } from '../../../shared/types/common.types';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'sm' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-sans font-medium border rounded-lg backdrop-blur-sm ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${category.color}15`,
        borderColor: `${category.color}60`,
        color: category.color,
      }}
    >
      {category.name}
    </span>
  );
};
