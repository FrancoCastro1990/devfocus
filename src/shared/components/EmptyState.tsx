import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * EmptyState Component
 *
 * A reusable empty state component for displaying when there's no content.
 * Shows an icon, title, optional description, and optional action button.
 *
 * @param icon - Lucide icon component to display
 * @param title - Main title text
 * @param description - Optional description text
 * @param action - Optional action button config with label and onClick handler
 * @param className - Additional CSS classes
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 glass-panel ${className}`}>
      <Icon className="mx-auto mb-4 text-white/40" size={48} />
      <p className="text-lg font-sans text-white/80">{title}</p>
      {description && (
        <p className="text-sm mt-2 font-sans text-white/50">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          <Button variant="primary" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};
