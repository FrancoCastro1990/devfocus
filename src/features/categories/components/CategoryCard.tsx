import React from 'react';
import type { CategoryStats } from '../../../shared/types/common.types';

interface CategoryCardProps {
  stats: CategoryStats;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ stats }) => {
  const { category, totalXp, level, xpForNextLevel, progressPercentage } = stats;

  // Calculate XP needed for current level and next level
  const currentLevelXp = ((level - 1) ** 2) * 100;
  const xpInCurrentLevel = totalXp - currentLevelXp;
  const xpNeededForNext = xpForNextLevel - currentLevelXp;

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border-2 transition-all hover:shadow-md" style={{ borderColor: `${category.color}40` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg"
            style={{ backgroundColor: category.color }}
          >
            {level}
          </div>
          <div>
            <h3 className="text-lg font-semibold capitalize" style={{ color: category.color }}>
              {category.name}
            </h3>
            <p className="text-xs text-gray-500">Level {level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{totalXp.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total XP</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-600">
          <span>{xpInCurrentLevel.toLocaleString()} XP</span>
          <span>{xpNeededForNext.toLocaleString()} XP to Level {level + 1}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: category.color,
            }}
          />
        </div>
        <div className="text-right text-xs font-medium" style={{ color: category.color }}>
          {progressPercentage.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};
