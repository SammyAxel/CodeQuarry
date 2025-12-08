/**
 * Course API Client
 * Fetches course data from the backend API
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get all courses
 * @param {boolean} forceRefresh - Skip cache
 * @returns {Promise<Array>} List of courses
 */
export const fetchCourses = async (forceRefresh = false) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE}/api/courses`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'X-User-Token': token })
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch courses');
  }
  
  return response.json();
};

/**
 * Get a single course by ID
 * @param {string} courseId 
 * @returns {Promise<Object>} Course data
 */
export const fetchCourse = async (courseId) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE}/api/courses/${courseId}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'X-User-Token': token })
    }
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch course');
  }
  
  return response.json();
};

/**
 * Create a new course (admin only)
 * @param {Object} courseData 
 * @returns {Promise<Object>} Created course
 */
export const createCourse = async (courseData) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE}/api/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Token': token
    },
    body: JSON.stringify(courseData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create course');
  }
  
  return response.json();
};

/**
 * Update a course (admin only)
 * @param {string} courseId 
 * @param {Object} updates 
 * @returns {Promise<Object>} Updated course
 */
export const updateCourse = async (courseId, updates) => {
  const token = sessionStorage.getItem('adminSessionToken') || localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE}/api/courses/${courseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Token': token,
      'X-User-Token': token
    },
    body: JSON.stringify(updates)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update course');
  }
  
  return response.json();
};

/**
 * Delete a course (admin only)
 * @param {string} courseId 
 * @returns {Promise<void>}
 */
export const deleteCourse = async (courseId) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE}/api/courses/${courseId}/db`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Token': token
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete course');
  }
};

/**
 * Reset course progress (admin only)
 * @param {string} courseId 
 * @returns {Promise<void>}
 */
export const resetCourseProgress = async (courseId) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE}/api/admin/courses/${courseId}/reset-progress`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Token': token
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reset progress');
  }
};
