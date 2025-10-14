import React from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { StreakIndicator } from './StreakIndicator';

const TITLE_COLORS: Record<string, string> = {
  novice: '#6b7280',    // Gray
  junior: '#3b82f6',    // Blue
  mid: '#8b5cf6',       // Purple
  senior: '#10b981',    // Green
  expert: '#f59e0b',    // Amber
  master: '#ef4444',    // Red
  legend: '#ec4899',    // Pink
};

const TITLE_LABELS: Record<string, string> = {
  novice: 'Novice',
  junior: 'Junior Developer',
  mid: 'Mid Developer',
  senior: 'Senior Developer',
  expert: 'Expert Developer',
  master: 'Master Developer',
  legend: 'Legendary Developer',
};

export const GlobalLevelHeader: React.FC = () => {
  const { userProfile, loading } = useUserProfile();

  if (loading || !userProfile) {
    return (
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  const titleColor = TITLE_COLORS[userProfile.currentTitle] || TITLE_COLORS.novice;
  const titleLabel = TITLE_LABELS[userProfile.currentTitle] || 'Developer';

  return (
    <div
      className="bg-gradient-to-r rounded-lg shadow-lg p-6 mb-8 text-white"
      style={{
        background: `linear-gradient(135deg, ${titleColor}dd 0%, ${titleColor}aa 100%)`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Level Badge */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-2xl border-4 border-white shadow-lg"
            style={{ backgroundColor: titleColor }}
          >
            {userProfile.level}
          </div>

          {/* Title and XP Info */}
          <div>
            <h2 className="text-2xl font-bold">{titleLabel}</h2>
            <p className="text-sm opacity-90">Level {userProfile.level}</p>
          </div>
        </div>

        {/* Total XP */}
        <div className="text-right">
          <p className="text-3xl font-bold">{userProfile.totalXp.toLocaleString()}</p>
          <p className="text-sm opacity-90">Total XP</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 space-y-1">
        <div className="flex justify-between text-sm opacity-90">
          <span>Level {userProfile.level}</span>
          <span>Level {userProfile.level + 1}</span>
        </div>
        <div className="w-full bg-black bg-opacity-20 rounded-full h-4 overflow-hidden border border-white border-opacity-20">
          <div
            className="h-full bg-white rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${userProfile.progressPercentage}%`,
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
            }}
          />
        </div>
        <div className="text-right text-sm font-medium">
          {userProfile.progressPercentage.toFixed(1)}% • {userProfile.xpForNextLevel.toLocaleString()} XP to next level
        </div>
      </div>

      {/* Streak Indicator */}
      {userProfile.currentStreak > 0 && (
        <div className="mt-4">
          <StreakIndicator
            currentStreak={userProfile.currentStreak}
            longestStreak={userProfile.longestStreak}
            lastWorkDate={userProfile.lastWorkDate}
          />
        </div>
      )}
    </div>
  );
};
