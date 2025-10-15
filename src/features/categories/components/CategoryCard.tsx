import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { CategoryStats } from '../../../shared/types/common.types';
import { ProgressBar } from '../../../shared/components/ProgressBar';

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
    <div
      className="glass-panel p-5 transition-all hover:shadow-glass-lg font-sans"
      style={{
        borderColor: `${category.color}40`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 border rounded-xl flex items-center justify-center font-bold text-lg backdrop-blur-md"
            style={{
              backgroundColor: `${category.color}20`,
              borderColor: `${category.color}60`,
              color: category.color,
            }}
          >
            {level}
          </div>
          <div>
            <h3
              className="text-lg font-semibold"
              style={{
                color: category.color,
              }}
            >
              {category.name}
            </h3>
            <p className="text-xs text-white/60">Level {level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{totalXp.toLocaleString()}</p>
          <p className="text-xs text-white/60">Total XP</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-white/60 font-sans mb-2">
          <span>{xpInCurrentLevel.toLocaleString()} XP</span>
          <span className="flex items-center gap-1">
            <TrendingUp size={12} />
            {xpNeededForNext.toLocaleString()} to Lvl {level + 1}
          </span>
        </div>
        <ProgressBar
          percentage={progressPercentage}
          color={category.color}
          showLabels={false}
          additionalInfo={`${progressPercentage.toFixed(1)}% Complete`}
        />
      </div>
    </div>
  );
};
