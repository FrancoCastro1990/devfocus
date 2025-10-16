import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Palette } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="glass-button flex items-center gap-2 px-4 py-2"
      title={`Switch to ${theme === 'glass' ? 'Retro' : 'Glass'} theme`}
      aria-label="Toggle theme"
    >
      <Palette size={18} />
      <span className="text-sm font-medium uppercase tracking-wide">
        {theme === 'glass' ? 'Glass' : 'Retro'}
      </span>
    </button>
  );
};
