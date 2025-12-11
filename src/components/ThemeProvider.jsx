/**
 * ThemeProvider Component
 * Wraps the app to manage light/dark theme
 */

import React, { useEffect, useState } from 'react';
import useTheme from '../hooks/useTheme';

export const ThemeProvider = ({ children }) => {
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Apply theme class to root element
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Avoid hydration mismatch by waiting for mount
  if (!mounted) return children;

  return (
    <div className={isDark ? 'dark' : ''}>
      {children}
    </div>
  );
};

export default ThemeProvider;
