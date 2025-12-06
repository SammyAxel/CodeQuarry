/**
 * Course API Utilities
 * Handles communication with the backend server for course file management
 */

const API_BASE = 'http://localhost:5000/api/admin';

/**
 * Get the admin secret from sessionStorage (set during login)
 */
const getAdminAuth = () => {
  return sessionStorage.getItem('adminSecret') || '';
};

/**
 * Set the admin secret (call this after successful admin login)
 */
export const setAdminAuth = (secret) => {
  sessionStorage.setItem('adminSecret', secret);
};

/**
 * Clear admin auth (call on logout)
 */
export const clearAdminAuth = () => {
  sessionStorage.removeItem('adminSecret');
};

/**
 * List all course files
 */
export const listCourses = async () => {
  const response = await fetch(`${API_BASE}/courses`, {
    headers: {
      'X-Admin-Auth': getAdminAuth()
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to list courses');
  }
  
  return response.json();
};

/**
 * Save a course to a file
 * @param {string} courseId - The course ID (will be used as filename)
 * @param {Object} course - The course object to save
 */
export const saveCourse = async (courseId, course) => {
  const response = await fetch(`${API_BASE}/courses/${courseId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Auth': getAdminAuth()
    },
    body: JSON.stringify({ course })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save course');
  }
  
  return response.json();
};

/**
 * Delete a course file
 * @param {string} courseId - The course ID to delete
 */
export const deleteCourse = async (courseId) => {
  const response = await fetch(`${API_BASE}/courses/${courseId}`, {
    method: 'DELETE',
    headers: {
      'X-Admin-Auth': getAdminAuth()
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete course');
  }
  
  return response.json();
};

/**
 * Update courses.jsx to add or remove a course
 * @param {string} courseId - The course ID
 * @param {string} action - 'add' or 'remove'
 */
export const updateCoursesRegistry = async (courseId, action) => {
  const response = await fetch(`${API_BASE}/courses/${courseId}/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Auth': getAdminAuth()
    },
    body: JSON.stringify({ action })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update courses registry');
  }
  
  return response.json();
};

/**
 * Publish a draft course - saves to file and updates registry
 * @param {Object} course - The course to publish
 */
export const publishCourse = async (course) => {
  // First save the course file
  await saveCourse(course.id, course);
  
  // Then update the courses.jsx registry
  await updateCoursesRegistry(course.id, 'add');
  
  return { success: true, message: `Course ${course.id} published successfully!` };
};

/**
 * Check if the server is available
 */
export const checkServerHealth = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    return response.ok;
  } catch {
    return false;
  }
};
