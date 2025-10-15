/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Liquid Glass Theme Colors
      colors: {
        // Glass backgrounds - Enhanced opacity
        'glass': {
          primary: 'rgba(255, 255, 255, 0.08)',
          secondary: 'rgba(255, 255, 255, 0.05)',
          tertiary: 'rgba(255, 255, 255, 0.12)',
          border: 'rgba(255, 255, 255, 0.18)',
          hover: 'rgba(255, 255, 255, 0.15)',
        },

        // Accent colors (soft pastels)
        'accent': {
          purple: '#a78bfa',
          'purple-light': '#c4b5fd',
          blue: '#60a5fa',
          'blue-light': '#93c5fd',
          pink: '#f472b6',
          'pink-light': '#f9a8d4',
          indigo: '#818cf8',
          'indigo-light': '#a5b4fc',
          emerald: '#34d399',
          'emerald-light': '#6ee7b7',
        },

        // Status colors (glass style)
        'status': {
          todo: 'rgba(147, 197, 253, 0.2)',
          'todo-border': 'rgba(147, 197, 253, 0.4)',
          'in-progress': 'rgba(167, 139, 250, 0.2)',
          'in-progress-border': 'rgba(167, 139, 250, 0.4)',
          paused: 'rgba(129, 140, 248, 0.2)',
          'paused-border': 'rgba(129, 140, 248, 0.4)',
          done: 'rgba(52, 211, 153, 0.2)',
          'done-border': 'rgba(52, 211, 153, 0.4)',
        },
      },

      // Modern fonts
      fontFamily: {
        sans: ["'Inter'", "'SF Pro Display'", '-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'sans-serif'],
        display: ["'Inter'", "'SF Pro Display'", 'sans-serif'],
      },

      // Glass shadows
      boxShadow: {
        'glass-sm': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'glass': '0 4px 16px rgba(0, 0, 0, 0.15)',
        'glass-lg': '0 8px 32px rgba(0, 0, 0, 0.2)',
        'glass-xl': '0 12px 48px rgba(0, 0, 0, 0.25)',
        'inner-glass': 'inset 0 1px 2px rgba(255, 255, 255, 0.1)',
      },

      // Backdrop blur utilities
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '20px',
        xl: '32px',
      },

      // Animations
      keyframes: {
        'float-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(0) scale(0.95)',
          },
          '20%': {
            opacity: '1',
            transform: 'translateY(-10px) scale(1)',
          },
          '80%': {
            opacity: '1',
            transform: 'translateY(-40px) scale(1)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(-60px) scale(0.95)',
          },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'float-up': 'float-up 2s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
