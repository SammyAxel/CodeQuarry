/**
 * Course API Utilities
 * Handles communication with the backend server for course file management
 * 
 * ⚠️ SECURITY: Passwords are sent to backend for authentication,
 * not stored in frontend code. Backend returns session tokens.
 */

const API_BASE = 'http://localhost:5000/api';

/**
 * Get the session token from sessionStorage
 */
export const getSessionToken = () => {
  return sessionStorage.getItem('adminSessionToken') || '';
};

/**
 * Login to get a session token
 * @param {string} password - Admin/mod password
 * @param {string} role - 'admin' or 'mod'
 */
export const login = async (password, role) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, role })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
  
  const { token, role: returnedRole } = await response.json();
  sessionStorage.setItem('adminSessionToken', token);
  sessionStorage.setItem('adminRole', returnedRole);
  return { token, role: returnedRole };
};

/**
 * Logout - invalidate session
 */
export const logout = async () => {
  const token = getSessionToken();
  if (token) {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'X-Session-Token': token }
      });
    } catch (e) {
      // Logout failure doesn't block clearing local session
    }
  }
  sessionStorage.removeItem('adminSessionToken');
  sessionStorage.removeItem('adminRole');
};

/**
 * List all course files
 */
export const listCourses = async () => {
  const response = await fetch(`${API_BASE}/admin/courses`, {
    headers: { 'X-Session-Token': getSessionToken() }
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
  const response = await fetch(`${API_BASE}/admin/courses/${courseId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Token': getSessionToken()
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
  const response = await fetch(`${API_BASE}/admin/courses/${courseId}`, {
    method: 'DELETE',
    headers: { 'X-Session-Token': getSessionToken() }
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
  const response = await fetch(`${API_BASE}/admin/courses/${courseId}/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Token': getSessionToken()
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
