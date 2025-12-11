/**
 * ThemeContext
 * Provides global theme state management
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Apply theme to DOM
const applyTheme = (dark) => {
  const root = document.documentElement;
  if (dark) {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Initialize from localStorage or default to dark
    const savedTheme = localStorage.getItem('codeQuarryTheme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  // Apply theme on mount and when isDark changes
  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => {
      const newIsDark = !prev;
      localStorage.setItem('codeQuarryTheme', newIsDark ? 'dark' : 'light');
      return newIsDark;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
};
