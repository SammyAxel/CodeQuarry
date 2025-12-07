/**
 * User API Utilities
 * Handles user authentication and progress tracking with backend server
 */

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

/**
 * Get the user session token from localStorage
 */
export const getUserToken = () => {
  return localStorage.getItem('userToken') || '';
};

/**
 * Set the user session token
 */
const setUserToken = (token) => {
  if (token) {
    localStorage.setItem('userToken', token);
  } else {
    localStorage.removeItem('userToken');
  }
};

/**
 * Get stored user data
 */
export const getStoredUser = () => {
  const data = localStorage.getItem('userData');
  return data ? JSON.parse(data) : null;
};

/**
 * Set stored user data
 */
const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('userData', JSON.stringify(user));
  } else {
    localStorage.removeItem('userData');
  }
};

/**
 * Register a new user
 * @param {string} username 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} User data and token
 */
export const register = async (username, email, password) => {
  const response = await fetch(`${API_BASE}/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  
  setUserToken(data.token);
  setStoredUser(data.user);
  
  return data;
};

/**
 * Login user
 * @param {string} identifier - Username or email
 * @param {string} password 
 * @returns {Promise<Object>} User data and token
 */
export const loginUser = async (identifier, password) => {
  const response = await fetch(`${API_BASE}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }
  
  setUserToken(data.token);
  setStoredUser(data.user);
  
  return data;
};

/**
 * Logout user
 */
export const logoutUser = async () => {
  const token = getUserToken();
  if (token) {
    try {
      await fetch(`${API_BASE}/user/logout`, {
        method: 'POST',
        headers: { 'X-User-Token': token }
      });
    } catch (e) {
      // Ignore logout errors
    }
  }
  setUserToken(null);
  setStoredUser(null);
};

/**
 * Get current user info and stats
 * @returns {Promise<Object>} User data and stats
 */
export const getCurrentUser = async () => {
  const token = getUserToken();
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(`${API_BASE}/user/me`, {
    headers: { 'X-User-Token': token }
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      setUserToken(null);
      setStoredUser(null);
      throw new Error('Session expired');
    }
    throw new Error('Failed to get user info');
  }
  
  const data = await response.json();
  setStoredUser(data.user);
  
  return data;
};

/**
 * Update user profile
 * @param {Object} updates - { displayName, avatarUrl }
 * @returns {Promise<Object>} Updated user
 */
export const updateProfile = async (updates) => {
  const response = await fetch(`${API_BASE}/user/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Token': getUserToken()
    },
    body: JSON.stringify(updates)
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Update failed');
  }
  
  return data;
};

/**
 * Change password
 * @param {string} currentPassword 
 * @param {string} newPassword 
 * @returns {Promise<Object>} New token
 */
export const changePassword = async (currentPassword, newPassword) => {
  const response = await fetch(`${API_BASE}/user/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Token': getUserToken()
    },
    body: JSON.stringify({ currentPassword, newPassword })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Password change failed');
  }
  
  // Update token after password change
  setUserToken(data.token);
  
  return data;
};

// ============================================
// PROGRESS API
// ============================================

/**
 * Get all user progress
 * @returns {Promise<Object>} Progress data
 */
export const getProgress = async () => {
  const token = getUserToken();
  if (!token) return { progress: {}, completedModules: [] };
  
  const response = await fetch(`${API_BASE}/progress`, {
    headers: { 'X-User-Token': token }
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Session expired');
    }
    throw new Error('Failed to get progress');
  }
  
  return response.json();
};

/**
 * Get progress for a specific course
 * @param {string} courseId 
 * @returns {Promise<Object>}
 */
export const getCourseProgress = async (courseId) => {
  const response = await fetch(`${API_BASE}/progress/${courseId}`, {
    headers: { 'X-User-Token': getUserToken() }
  });
  
  if (!response.ok) {
    throw new Error('Failed to get course progress');
  }
  
  return response.json();
};

/**
 * Save module progress
 * @param {string} courseId 
 * @param {string} moduleId 
 * @param {Object} data 
 */
export const saveModuleProgress = async (courseId, moduleId, data = {}) => {
  const token = getUserToken();
  if (!token) return; // Skip if not logged in
  
  await fetch(`${API_BASE}/progress/module`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Token': token
    },
    body: JSON.stringify({ courseId, moduleId, ...data })
  });
};

/**
 * Save step completion
 * @param {string} courseId 
 * @param {string} moduleId 
 * @param {number} stepIndex 
 * @param {Object} data 
 */
export const saveStepProgress = async (courseId, moduleId, stepIndex, data = {}) => {
  const token = getUserToken();
  if (!token) return;
  
  await fetch(`${API_BASE}/progress/step`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Token': token
    },
    body: JSON.stringify({ courseId, moduleId, stepIndex, ...data })
  });
};

/**
 * Get saved code for a module
 * @param {string} courseId 
 * @param {string} moduleId 
 * @returns {Promise<string|null>}
 */
export const getSavedCode = async (courseId, moduleId) => {
  const token = getUserToken();
  if (!token) return null;
  
  const response = await fetch(`${API_BASE}/progress/code/${courseId}/${moduleId}`, {
    headers: { 'X-User-Token': token }
  });
  
  if (!response.ok) return null;
  
  const data = await response.json();
  return data.savedCode;
};

/**
 * Get user stats for dashboard
 * @returns {Promise<Object>}
 */
export const getUserStats = async () => {
  const response = await fetch(`${API_BASE}/user/stats`, {
    headers: { 'X-User-Token': getUserToken() }
  });
  
  if (!response.ok) {
    throw new Error('Failed to get stats');
  }
  
  return response.json();
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getUserToken();
};

export default {
  getUserToken,
  getStoredUser,
  register,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateProfile,
  changePassword,
  getProgress,
  getCourseProgress,
  saveModuleProgress,
  saveStepProgress,
  getSavedCode,
  getUserStats,
  isAuthenticated
};
