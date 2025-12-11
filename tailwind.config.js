/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // CodeQuarry theme colors
        quarry: {
          dark: '#0d1117',
          card: '#161b22',
          bg: '#010409',
          accent: '#8b5cf6',
          'accent-light': '#a78bfa',
          'accent-bright': '#c4b5fd',
          gem: '#ec4899',
          success: '#10b981',
          error: '#ef4444',
          warning: '#f59e0b',
          // Light mode colors
          'light-bg': '#fafbfc',
          'light-card': '#ffffff',
          'light-text': '#24292f',
          'light-text-secondary': '#57606a',
          'light-border': '#d0d7de',
          'light-hover': '#f6f8fa',
        },
      },
    },
  },
  plugins: [],
};