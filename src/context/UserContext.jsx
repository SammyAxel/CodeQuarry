/**
 * User Context
 * Manages user authentication, profile, and progress tracking
 * Uses localStorage for persistence
 */

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { STORAGE_KEYS } from '../constants/appConfig';

const UserContext = createContext();

/**
 * UserProvider component - wraps app and provides user context
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState({});
  const [isLoading, setIsLoading] = useState(true);

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
    localStorage.setItem(STORAGE_KEYS.LAST_USER, username);
  }, [users]);

  /**
   * Logout current user
   */
  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.LAST_USER);
  }, []);

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

  const value = {
    currentUser,
    users,
    isLoading,
    login,
    logout,
    markModuleComplete,
    saveModuleCode,
    getUserProgress,
    getCompletedModules,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

/**
 * Hook to use User Context
 * @returns {Object} User context value
 */
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export default UserContext;
