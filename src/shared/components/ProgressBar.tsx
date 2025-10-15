import React from 'react';

interface ProgressBarProps {
  percentage: number;
  color: string;
  currentLabel?: string;
  nextLabel?: string;
  showLabels?: boolean;
  height?: 'sm' | 'md' | 'lg';
  additionalInfo?: string;
  className?: string;
}

/**
 * ProgressBar Component
 *
 * A flexible progress bar component with optional labels and customizable styling.
 * Used for displaying level progress, XP progress, and other percentage-based metrics.
 *
 * @param percentage - Progress percentage (0-100)
 * @param color - CSS color value for the progress bar fill (e.g., '#a78bfa')
 * @param currentLabel - Optional label for current state (e.g., "LVL 5")
 * @param nextLabel - Optional label for next milestone (e.g., "LVL 6")
 * @param showLabels - Whether to show current/next labels above the bar (default: true)
 * @param height - Bar height variant: 'sm', 'md', or 'lg' (default: 'md')
 * @param additionalInfo - Optional text below the bar (e.g., "250 XP needed")
 * @param className - Additional CSS classes
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  color,
  currentLabel,
  nextLabel,
  showLabels = true,
  height = 'md',
  additionalInfo,
  className = '',
}) => {
  const heightClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className={`space-y-1 ${className}`}>
      {showLabels && (currentLabel || nextLabel) && (
        <div className="flex justify-between text-sm font-sans text-white/60">
          {currentLabel && <span>{currentLabel}</span>}
          {nextLabel && <span>{nextLabel}</span>}
        </div>
      )}
      <div
        className={`w-full bg-white/5 overflow-hidden border border-white/10 rounded-lg ${heightClasses[height]}`}
      >
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${clampedPercentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {additionalInfo && (
        <div className="text-right text-sm font-sans font-medium text-white/80">
          {additionalInfo}
        </div>
      )}
    </div>
  );
};
