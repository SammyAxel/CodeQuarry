/**
 * ThemeToggle Component
 * Button to switch between light and dark mode
 */

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeContext } from '../context/ThemeContext';

export const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useThemeContext();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors ${
        isDark
          ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
      } ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
