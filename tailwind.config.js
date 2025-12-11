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
          'light-bg': '#f8f9fa',
          'light-card': '#ffffff',
          'light-text': '#1a1a1a',
          'light-text-secondary': '#666666',
          'light-border': '#e0e0e0',
        },
      },
    },
  },
  plugins: [],
};