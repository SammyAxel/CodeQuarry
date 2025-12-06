/**
 * User Context with Session Management
 * Manages user authentication, profile, progress tracking, and session timeouts
 * Uses localStorage for persistence and sessionStorage for session tracking
 */

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { STORAGE_KEYS } from '../constants/appConfig';
import { logSecurityEvent } from '../utils/securityUtils';

const UserContext = createContext();

/**
 * UserProvider component - wraps app and provides user context with session management
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState(null);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  // Get session timeout from environment (in minutes)
  const SESSION_TIMEOUT_MINUTES = parseInt(import.meta.env.VITE_SESSION_TIMEOUT) || 30;
  const SESSION_TIMEOUT_MS = SESSION_TIMEOUT_MINUTES * 60 * 1000;
  const WARNING_TIME_MS = 5 * 60 * 1000; // 5 minutes before timeout

  // Load users from localStorage on mount
  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const lastUser = localStorage.getItem(STORAGE_KEYS.LAST_USER);

      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        setUsers(parsedUsers);

        // Restore last logged-in user
        if (lastUser && parsedUsers[lastUser]) {
          setCurrentUser(lastUser);
          setLastActivityTime(Date.now());
        }
      }
    } catch (error) {
      console.error('Failed to load user data from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save users to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(users).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      } catch (error) {
        console.error('Failed to save user data to localStorage:', error);
      }
    }
  }, [users]);

  /**
   * Login or create a new user
   * @param {string} username - The username to login/create
   */
  const login = useCallback((username) => {
    if (!users[username]) {
      setUsers(prev => ({
        ...prev,
        [username]: { progress: {} }
      }));
    }
    setCurrentUser(username);
    setIsAdmin(false);
    setAdminRole(null);
    setLastActivityTime(Date.now());
    localStorage.setItem(STORAGE_KEYS.LAST_USER, username);
    
    logSecurityEvent('user_login', {
      username,
      timestamp: new Date().toISOString()
    });
  }, [users]);

  /**
   * Handle admin login with role
   */
  const adminLogin = useCallback((role) => {
    const adminUser = `admin-${role}`;
    setCurrentUser(adminUser);
    setIsAdmin(true);
    setAdminRole(role);
    setLastActivityTime(Date.now());
    localStorage.setItem(STORAGE_KEYS.LAST_USER, adminUser);
    
    logSecurityEvent('admin_session_started', {
      role,
      timestamp: new Date().toISOString()
    });
  }, []);

  /**
   * Logout current user
   */
  const logout = useCallback((reason = 'user_initiated') => {
    const endTime = Date.now();
    
    logSecurityEvent('user_logout', {
      user: currentUser,
      isAdmin,
      adminRole,
      reason,
      sessionDurationMs: endTime - lastActivityTime,
      timestamp: new Date().toISOString()
    });
    
    setCurrentUser(null);
    setIsAdmin(false);
    setAdminRole(null);
    setShowTimeoutWarning(false);
    localStorage.removeItem(STORAGE_KEYS.LAST_USER);
  }, [currentUser, isAdmin, adminRole, lastActivityTime]);

  /**
   * Track user activity to reset inactivity timer
   */
  const updateActivity = useCallback(() => {
    setLastActivityTime(Date.now());
    setShowTimeoutWarning(false);
  }, []);

  /**
   * Monitor session timeout
   */
  useEffect(() => {
    if (!currentUser) return;

    const checkTimeout = setInterval(() => {
      const now = Date.now();
      const sessionDuration = now - lastActivityTime;

      // Show warning 5 minutes before timeout
      if (sessionDuration >= SESSION_TIMEOUT_MS - WARNING_TIME_MS && !showTimeoutWarning) {
        setShowTimeoutWarning(true);
        logSecurityEvent('session_warning_shown', {
          user: currentUser,
          minutesRemaining: 5,
          timestamp: new Date().toISOString()
        });
      }

      // Auto-logout on timeout
      if (sessionDuration >= SESSION_TIMEOUT_MS) {
        clearInterval(checkTimeout);
        logout('session_timeout');
      }
    }, 1000);

    return () => clearInterval(checkTimeout);
  }, [currentUser, lastActivityTime, SESSION_TIMEOUT_MS, showTimeoutWarning, logout]);

  /**
   * Track user activity on window events
   */
  useEffect(() => {
    if (!currentUser) return;

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      updateActivity();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [currentUser, updateActivity]);

  /**
   * Mark a module as complete
   * @param {string} moduleId - Module ID
   * @param {string} savedCode - Optional code to save
   */
  const markModuleComplete = useCallback((moduleId, savedCode = null) => {
    if (!currentUser) return;

    setUsers(prevUsers => {
      const userProgress = prevUsers[currentUser]?.progress || {};
      const moduleProgress = {
        ...userProgress[moduleId],
        completed: true,
      };

      if (savedCode) {
        moduleProgress.savedCode = savedCode;
      }

      return {
        ...prevUsers,
        [currentUser]: {
          ...prevUsers[currentUser],
          progress: {
            ...userProgress,
            [moduleId]: moduleProgress
          }
        }
      };
    });
  }, [currentUser]);

  /**
   * Save code for a module without marking as complete
   * @param {string} moduleId - Module ID
   * @param {string} code - Code to save
   */
  const saveModuleCode = useCallback((moduleId, code) => {
    if (!currentUser) return;

    setUsers(prevUsers => {
      const userProgress = prevUsers[currentUser]?.progress || {};
      return {
        ...prevUsers,
        [currentUser]: {
          ...prevUsers[currentUser],
          progress: {
            ...userProgress,
            [moduleId]: {
              ...userProgress[moduleId],
              savedCode: code
            }
          }
        }
      };
    });
  }, [currentUser]);

  /**
   * Get progress for current user
   * @returns {Object} Progress data
   */
  const getUserProgress = useCallback(() => {
    return currentUser ? users[currentUser]?.progress || {} : {};
  }, [currentUser, users]);

  /**
   * Get completed modules for current user
   * @returns {Set} Set of completed module IDs
   */
  const getCompletedModules = useCallback(() => {
    const progress = getUserProgress();
    return new Set(
      Object.keys(progress).filter(moduleId => progress[moduleId].completed)
    );
  }, [getUserProgress]);

  /**
   * Get remaining session time in seconds
   */
  const getRemainingSessionTime = useCallback(() => {
    if (!currentUser) return 0;
    const sessionDuration = Date.now() - lastActivityTime;
    const remaining = SESSION_TIMEOUT_MS - sessionDuration;
    return Math.max(0, Math.ceil(remaining / 1000));
  }, [currentUser, lastActivityTime, SESSION_TIMEOUT_MS]);

  /**
   * Extend session (called when user clicks "Continue" on warning)
   */
  const extendSession = useCallback(() => {
    updateActivity();
    logSecurityEvent('session_extended', {
      user: currentUser,
      timestamp: new Date().toISOString()
    });
  }, [currentUser, updateActivity]);

  const value = {
    currentUser,
    users,
    isLoading,
    isAdmin,
    adminRole,
    showTimeoutWarning,
    sessionTimeoutMinutes: SESSION_TIMEOUT_MINUTES,
    login,
    adminLogin,
    logout,
    markModuleComplete,
    saveModuleCode,
    getUserProgress,
    getCompletedModules,
    getRemainingSessionTime,
    extendSession,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

/**
 * Hook to use UserContext
 */
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export default UserContext;
