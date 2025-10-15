/**
 * DevFocus Retro Terminal Theme
 * Inspired by classic CRT terminals (VT220, IBM PC, Commodore)
 */

export const retroTheme = {
  // Base colors - Terminal classic
  colors: {
    // Background layers
    bg: {
      primary: '#0a0e0f',      // Deep black with slight tint
      secondary: '#111518',    // Slightly lighter for cards
      tertiary: '#1a1f23',     // Even lighter for hover states
      overlay: 'rgba(10, 14, 15, 0.95)', // Modal backdrop
    },

    // Phosphor green (classic terminal)
    phosphor: {
      50: '#e6fff2',
      100: '#ccffe6',
      200: '#99ffcc',
      300: '#66ffb3',
      400: '#33ff99',
      500: '#00ff80',   // Main phosphor green
      600: '#00cc66',
      700: '#00994d',
      800: '#006633',
      900: '#00331a',
    },

    // Amber (alternative terminal style)
    amber: {
      50: '#fff9e6',
      100: '#fff3cc',
      200: '#ffe799',
      300: '#ffdb66',
      400: '#ffcf33',
      500: '#ffc300',   // Main amber
      600: '#cc9c00',
      700: '#997500',
      800: '#664e00',
      900: '#332700',
    },

    // Cyan (for accents and special elements)
    cyan: {
      50: '#e6ffff',
      100: '#ccffff',
      200: '#99ffff',
      300: '#66ffff',
      400: '#33ffff',
      500: '#00ffff',   // Bright cyan
      600: '#00cccc',
      700: '#009999',
      800: '#006666',
      900: '#003333',
    },

    // Red (errors and warnings)
    red: {
      50: '#ffe6e6',
      100: '#ffcccc',
      200: '#ff9999',
      300: '#ff6666',
      400: '#ff3333',
      500: '#ff0000',   // Bright red
      600: '#cc0000',
      700: '#990000',
      800: '#660000',
      900: '#330000',
    },

    // Status colors (terminal style)
    status: {
      todo: '#2a3f4a',       // Dark blue-gray
      inProgress: '#1a3a2a', // Dark green tint
      paused: '#3a2f1a',     // Dark amber tint
      done: '#1a2f25',       // Dark success tint
    },

    // Border colors
    border: {
      primary: '#00ff80',    // Phosphor green
      secondary: '#006633',  // Darker green
      accent: '#ffc300',     // Amber
      muted: '#1a3f2a',      // Very dark green
    },

    // Text colors
    text: {
      primary: '#00ff80',    // Phosphor green
      secondary: '#00cc66',  // Slightly darker green
      muted: '#00994d',      // More muted green
      accent: '#ffc300',     // Amber for highlights
      warning: '#ff6600',    // Orange-red
      error: '#ff0000',      // Bright red
      inverse: '#0a0e0f',    // Dark for light backgrounds
    },
  },

  // Typography - Monospace fonts for terminal feel
  fonts: {
    mono: "'IBM Plex Mono', 'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    display: "'IBM Plex Mono', 'JetBrains Mono', monospace",
  },

  // Glow effects (CRT simulation)
  effects: {
    glow: {
      text: '0 0 5px currentColor, 0 0 10px currentColor',
      border: '0 0 5px #00ff80, 0 0 10px #00ff80',
      strong: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
    },
    scan: 'repeating-linear-gradient(0deg, rgba(0, 255, 128, 0.05) 0px, transparent 1px, transparent 2px, rgba(0, 255, 128, 0.05) 3px)',
  },

  // Spacing and sizes
  spacing: {
    terminalPadding: '1rem',
    borderWidth: '2px',
  },

  // Animations
  animations: {
    blink: 'blink 1s step-end infinite',
    flicker: 'flicker 0.15s infinite',
    scanline: 'scanline 8s linear infinite',
  },
} as const;

export type RetroTheme = typeof retroTheme;

// Helper function to get color with glow
export const withGlow = (color: string, intensity: 'weak' | 'medium' | 'strong' = 'medium') => {
  const glowSizes = {
    weak: '0 0 5px',
    medium: '0 0 10px',
    strong: '0 0 20px',
  };
  return `${color}; text-shadow: ${glowSizes[intensity]} ${color}`;
};

// ASCII border characters for retro feel
export const asciiBorders = {
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',
  horizontal: '─',
  vertical: '│',
  cross: '┼',
  tDown: '┬',
  tUp: '┴',
  tRight: '├',
  tLeft: '┤',
} as const;
