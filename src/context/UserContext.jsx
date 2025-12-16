/**
 * User Context with Server-Side Authentication
 * Manages user authentication, profile, and progress tracking via API
 * Uses server-side session tokens stored in localStorage
 */

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { 
  getUserToken, 
  getStoredUser, 
  getCurrentUser, 
  logoutUser, 
  getProgress, 
  saveModuleProgress as apiSaveModuleProgress,
  saveStepProgress as apiSaveStepProgress,
  isAuthenticated,
  markPracticeVisited as markPracticeVisitedApi
} from '../utils/userApi';
import { logSecurityEvent } from '../utils/securityUtils';

const UserContext = createContext();

/**
 * UserProvider component - wraps app and provides user context with server-side auth
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProgress, setUserProgress] = useState({ modules: [], steps: [], completedModules: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState(null);
  const [showAuthPage, setShowAuthPage] = useState('login'); // 'login' | 'register'
  const [equippedCosmetics, setEquippedCosmetics] = useState({});
  const [hasVisitedPractice, setHasVisitedPractice] = useState(false); // Loaded from server

  /**
   * Initialize user session from stored token
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isAuthenticated()) {
          // Validate session and get user data
          const data = await getCurrentUser();
          setCurrentUser(data.user);
          // Load hasVisitedPractice from user data (server-side)
          setHasVisitedPractice(data.user?.hasVisitedPractice || false);
          
          // Load progress
          const progress = await getProgress();
          setUserProgress({
            modules: progress.progress.modules || [],
            steps: progress.progress.steps || [],
            completedModules: progress.completedModules || []
          });

          // Load equipped cosmetics
          try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('userToken');
            const res = await fetch(`${API_URL}/api/user/cosmetics/equipped`, {
              headers: token ? { 'x-user-token': token } : {}
            });
            if (res.ok) {
              const cosmeticData = await res.json();
              setEquippedCosmetics(cosmeticData.equipped || {});
            }
          } catch (err) {
            console.log('Failed to load equipped cosmetics');
          }
        }
      } catch (error) {
        console.log('Session expired or invalid');
        // Token invalid, user needs to log in
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login user (called after successful API login)
   * @param {Object} user - User object from API
   */
  const login = useCallback(async (user) => {
    setCurrentUser(user);
    setIsAdmin(false);
    setAdminRole(null);
    // Reset practice visited from user data
    setHasVisitedPractice(user.hasVisitedPractice || false);
    
    // Load user progress
    try {
      const progress = await getProgress();
      setUserProgress({
        modules: progress.progress.modules || [],
        steps: progress.progress.steps || [],
        completedModules: progress.completedModules || []
      });
    } catch (err) {
      console.error('Failed to load progress:', err);
    }
    
    logSecurityEvent('user_session_started', {
      username: user.username,
      timestamp: new Date().toISOString()
    });
  }, []);

  /**
   * Handle admin login with role
   */
  const adminLogin = useCallback((role) => {
    const adminUser = { 
      username: `admin-${role}`, 
      displayName: role === 'admin' ? 'Administrator' : 'Moderator',
      role: role === 'admin' ? 'admin' : 'mod'
    };
    setCurrentUser(adminUser);
    setIsAdmin(true);
    setAdminRole(role);
    
    logSecurityEvent('admin_session_started', {
      role,
      timestamp: new Date().toISOString()
    });
  }, []);

  /**
   * Logout current user
   */
  const logout = useCallback(async (reason = 'user_initiated') => {
    logSecurityEvent('user_logout', {
      user: currentUser?.username,
      isAdmin,
      adminRole,
      reason,
      timestamp: new Date().toISOString()
    });
    
    // Clear server session
    await logoutUser();
    
    setCurrentUser(null);
    setIsAdmin(false);
    setAdminRole(null);
    setUserProgress({ modules: [], steps: [], completedModules: [] });
  }, [currentUser, isAdmin, adminRole]);

  /**
   * Mark a module as complete
   * @param {string} courseId - Course ID
   * @param {string} moduleId - Module ID
   * @param {string} savedCode - Optional code to save
   */
  const markModuleComplete = useCallback(async (courseId, moduleId, savedCode = null) => {
    if (!currentUser || isAdmin) return;

    try {
      await apiSaveModuleProgress(courseId, moduleId, {
        savedCode,
        completed: true
      });
      
      // Update local state
      setUserProgress(prev => ({
        ...prev,
        completedModules: [...new Set([...prev.completedModules, moduleId])]
      }));
    } catch (err) {
      console.error('Failed to save module progress:', err);
    }
  }, [currentUser, isAdmin]);

  /**
   * Save step completion
   * @param {string} courseId - Course ID
   * @param {string} moduleId - Module ID
   * @param {number} stepIndex - Step index
   * @param {Object} data - Additional data (hintsUsed, codeSnapshot)
   */
  const saveStepProgress = useCallback(async (courseId, moduleId, stepIndex, data = {}) => {
    if (!currentUser || isAdmin) return;

    try {
      await apiSaveStepProgress(courseId, moduleId, stepIndex, data);
    } catch (err) {
      console.error('Failed to save step progress:', err);
    }
  }, [currentUser, isAdmin]);

  /**
   * Save code for a module without marking as complete
   * @param {string} courseId - Course ID
   * @param {string} moduleId - Module ID
   * @param {string} code - Code to save
   */
  const saveModuleCode = useCallback(async (courseId, moduleId, code) => {
    if (!currentUser || isAdmin) return;

    try {
      await apiSaveModuleProgress(courseId, moduleId, {
        savedCode: code,
        completed: false
      });
    } catch (err) {
      console.error('Failed to save module code:', err);
    }
  }, [currentUser, isAdmin]);

  /**
   * Get completed modules for current user
   * @returns {Set} Set of completed module IDs
   */
  const getCompletedModules = useCallback(() => {
    return new Set(userProgress.completedModules);
  }, [userProgress.completedModules]);

  /**
   * Check if a module is completed
   * @param {string} moduleId 
   * @returns {boolean}
   */
  const isModuleCompleted = useCallback((moduleId) => {
    return userProgress.completedModules.includes(moduleId);
  }, [userProgress.completedModules]);

  /**
   * Refresh user progress from server
   */
  const refreshProgress = useCallback(async () => {
    if (!currentUser || isAdmin) return;
    
    try {
      const progress = await getProgress();
      setUserProgress({
        modules: progress.progress.modules || [],
        steps: progress.progress.steps || [],
        completedModules: progress.completedModules || []
      });
    } catch (err) {
      console.error('Failed to refresh progress:', err);
    }
  }, [currentUser, isAdmin]);

  /**
   * Mark that the user has visited practice page (for tutorial)
   * Sends update to server to persist across sessions
   */
  const markPracticeVisited = useCallback(async () => {
    if (!currentUser || isAdmin) return;

    try {
      const res = await markPracticeVisitedApi();
      // res may contain hasVisitedPractice or has_visited_practice
      const has = (res && (res.hasVisitedPractice || res.has_visited_practice)) || true;
      setHasVisitedPractice(Boolean(has));
      setCurrentUser(prev => prev ? { ...prev, hasVisitedPractice: true } : prev);
      return;
    } catch (err) {
      console.error('Failed to mark practice as visited:', err);
      // Still update local state even if server call fails
      setHasVisitedPractice(true);
      setCurrentUser(prev => prev ? { ...prev, hasVisitedPractice: true } : prev);
    }
  }, [currentUser, isAdmin]);

  /**
   * Check if user is visiting practice for the first time
   */
  const shouldShowPracticeTutorial = useCallback(() => {
    return !hasVisitedPractice && !!currentUser && !isAdmin;
  }, [hasVisitedPractice, currentUser, isAdmin]);

  const value = {
    currentUser,
    isLoading,
    isAdmin,
    adminRole,
    showAuthPage,
    setShowAuthPage,
    equippedCosmetics,
    login,
    adminLogin,
    logout,
    markModuleComplete,
    saveStepProgress,
    saveModuleCode,
    getCompletedModules,
    isModuleCompleted,
    refreshProgress,
    userProgress,
    isAuthenticated: !!currentUser && !isAdmin,
    hasVisitedPractice,
    markPracticeVisited,
    shouldShowPracticeTutorial,
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
