/**
 * useTheme Hook
 * Manages light/dark theme preference with localStorage persistence
 */

import { useState, useEffect, useCallback } from 'react';

export const useTheme = () => {
  const [isDark, setIsDark] = useState(true); // Default to dark

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle theme and persist to localStorage
  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const newIsDark = !prev;
      if (newIsDark) {
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.add('dark');
      } else {
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.remove('dark');
      }
      return newIsDark;
    });
  }, []);

  return { isDark, toggleTheme };
};

export default useTheme;
