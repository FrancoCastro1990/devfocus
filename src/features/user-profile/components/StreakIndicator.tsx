import React from 'react';
import { Flame, AlertTriangle } from 'lucide-react';

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
      className={`p-4 border rounded-2xl transition-all backdrop-blur-md font-sans ${
        isAtRisk
          ? 'border-red-400/40 bg-red-500/10'
          : 'border-accent-pink/40 bg-accent-pink/10'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <Flame className="text-accent-pink animate-pulse" size={32} />
        <div>
          <div className="text-2xl font-bold text-accent-pink">
            {currentStreak} Day Streak!
          </div>
          {bonusPercentage > 0 && (
            <div className="text-sm font-medium text-white/80">
              +{bonusPercentage}% XP Bonus
            </div>
          )}
        </div>
      </div>

      {isAtRisk && currentStreak > 0 && (
        <div className="mt-2 p-2 bg-red-500/20 border border-red-400/40 rounded-lg text-sm text-red-300 font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>At risk! Complete 1 subtask today</span>
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex justify-between text-xs text-white/60">
          <span>Next: {nextMilestone} days</span>
          <span>Best: {longestStreak} days</span>
        </div>
      </div>
    </div>
  );
};
