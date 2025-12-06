/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
        },
      },
    },
  },
  plugins: [],
};