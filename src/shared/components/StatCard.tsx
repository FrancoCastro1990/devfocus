import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  variant?: 'default' | 'accent';
  iconColor?: string;
  className?: string;
}

/**
 * StatCard Component
 *
 * A reusable card component for displaying statistics with optional icons.
 * Used throughout the app for metrics, summaries, and dashboards.
 *
 * @param label - The stat label/title (e.g., "Total Points", "Avg. time per subtask")
 * @param value - The stat value (string or number)
 * @param icon - Optional Lucide icon component
 * @param variant - Visual variant: 'default' or 'accent' (default: 'default')
 * @param iconColor - Optional CSS class for icon color (e.g., 'text-accent-purple')
 * @param className - Additional CSS classes for customization
 */
export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  variant = 'default',
  iconColor = 'text-white/60',
  className = '',
}) => {
  const baseClasses = 'glass-panel p-5';
  const variantClasses = {
    default: '',
    accent: 'border-accent-purple/30',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <p className={`text-sm font-medium flex items-center gap-2 ${iconColor}`}>
        {Icon && <Icon size={16} />}
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
};
