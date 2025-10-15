import React from 'react';
import { Trophy, Zap } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { StreakIndicator } from './StreakIndicator';
import { ProgressBar } from '../../../shared/components/ProgressBar';

const TITLE_COLORS: Record<string, string> = {
  novice: '#a78bfa',    // Purple
  junior: '#8b5cf6',    // Violet
  mid: '#7c3aed',       // Purple
  senior: '#6366f1',    // Indigo
  expert: '#3b82f6',    // Blue
  master: '#06b6d4',    // Cyan
  legend: '#ec4899',    // Pink
};

const TITLE_LABELS: Record<string, string> = {
  novice: 'Novice',
  junior: 'Junior Dev',
  mid: 'Mid-Level Dev',
  senior: 'Senior Dev',
  expert: 'Expert Dev',
  master: 'Master Dev',
  legend: 'Legend',
};

export const GlobalLevelHeader: React.FC = () => {
  const { userProfile, loading } = useUserProfile();

  if (loading || !userProfile) {
    return (
      <div className="glass-panel p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-white/10 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  const titleColor = TITLE_COLORS[userProfile.currentTitle] || TITLE_COLORS.novice;
  const titleLabel = TITLE_LABELS[userProfile.currentTitle] || 'Developer';

  return (
    <div className="glass-panel p-6 mb-8 relative overflow-hidden">
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          {/* Level Badge */}
          <div
            className="w-16 h-16 flex items-center justify-center font-sans font-bold text-2xl border-2 rounded-2xl backdrop-blur-md"
            style={{
              borderColor: titleColor,
              color: titleColor,
              backgroundColor: `${titleColor}20`,
            }}
          >
            {userProfile.level}
          </div>

          {/* Title and XP Info */}
          <div>
            <div className="flex items-center gap-2">
              <Trophy size={20} style={{ color: titleColor }} />
              <h2 className="text-2xl font-sans font-bold" style={{ color: titleColor }}>
                {titleLabel}
              </h2>
            </div>
            <p className="text-sm font-sans text-white/60 mt-1">
              Level {userProfile.level}
            </p>
          </div>
        </div>

        {/* Total XP */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <Zap size={24} className="text-accent-pink" />
            <p className="text-3xl font-sans font-bold text-white">
              {userProfile.totalXp.toLocaleString()}
            </p>
          </div>
          <p className="text-sm font-sans text-white/60">Total XP</p>
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar
        percentage={userProfile.progressPercentage}
        color={titleColor}
        currentLabel={`LVL ${userProfile.level}`}
        nextLabel={`LVL ${userProfile.level + 1}`}
        additionalInfo={`${userProfile.progressPercentage.toFixed(1)}% • ${userProfile.xpForNextLevel.toLocaleString()} XP needed`}
        className="mt-4 relative z-10"
      />

      {/* Streak Indicator */}
      {userProfile.currentStreak > 0 && (
        <div className="mt-4 relative z-10">
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
