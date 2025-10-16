import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'glass' | 'retro';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'devfocus-theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize theme from localStorage or default to 'glass'
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
    return savedTheme && (savedTheme === 'glass' || savedTheme === 'retro')
      ? savedTheme
      : 'glass';
  });

  // Apply theme to document element
  useEffect(() => {
    const root = document.documentElement;

    // Remove previous theme
    root.removeAttribute('data-theme');

    // Apply new theme (glass is default, so only set attribute for retro)
    if (theme === 'retro') {
      root.setAttribute('data-theme', 'retro');
    }

    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'glass' ? 'retro' : 'glass'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
