/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'status-todo': '#f3f4f6',
        'status-in-progress': '#dbeafe',
        'status-paused': '#fef3c7',
        'status-done': '#d1fae5',
      },
    },
  },
  plugins: [],
}
