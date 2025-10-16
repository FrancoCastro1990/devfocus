/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // All theme configuration moved to @theme directive in index.css
  // This keeps the config minimal and centralized in CSS
  theme: {},
  plugins: [],
}
