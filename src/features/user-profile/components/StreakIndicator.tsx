import React from 'react';

interface StreakIndicatorProps {
  currentStreak: number;
  longestStreak: number;
  lastWorkDate?: string;
}

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({
  currentStreak,
  longestStreak,
  lastWorkDate,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const isAtRisk = lastWorkDate !== today;
  const bonusPercentage = Math.min(Math.floor(currentStreak / 7) * 5, 50);

  // Calculate next milestone
  const milestones = [7, 14, 30, 60, 100];
  const nextMilestone = milestones.find((m) => m > currentStreak) || 100;

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all ${
        isAtRisk
          ? 'border-red-500 bg-red-50'
          : 'border-orange-500 bg-orange-50'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl animate-pulse">🔥</span>
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {currentStreak} Day Streak!
          </div>
          {bonusPercentage > 0 && (
            <div className="text-sm font-medium text-orange-600">
              +{bonusPercentage}% XP Bonus
            </div>
          )}
        </div>
      </div>

      {isAtRisk && currentStreak > 0 && (
        <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-700 font-medium">
          ⚠️ At risk! Complete 1 subtask today to maintain your streak.
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-300">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Next milestone: {nextMilestone} days</span>
          <span>Best: {longestStreak} days</span>
        </div>
      </div>
    </div>
  );
};
