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
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${category.color}20`,
        color: category.color,
      }}
    >
      {category.name}
    </span>
  );
};
