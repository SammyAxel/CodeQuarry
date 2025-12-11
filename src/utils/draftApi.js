/**
 * Draft API Utilities
 * Handles communication with backend for collaborative draft management
 */

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

/**
 * Get session token from sessionStorage
 */
export const getSessionToken = () => {
  return sessionStorage.getItem('adminSessionToken') || '';
};

/**
 * Get all drafts (filtered by role)
 */
export const getAllDrafts = async () => {
  const response = await fetch(`${API_BASE}/drafts`, {
    headers: { 'X-Session-Token': getSessionToken() }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch drafts');
  }
  
  return response.json();
};

/**
 * Get a specific draft by ID
 */
export const getDraft = async (draftId) => {
  const response = await fetch(`${API_BASE}/drafts/${draftId}`, {
    headers: { 'X-Session-Token': getSessionToken() }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch draft');
  }
  
  return response.json();
};

/**
 * Get all drafts for a course
 */
export const getDraftsByCourse = async (courseId) => {
  const response = await fetch(`${API_BASE}/drafts/course/${courseId}`, {
    headers: { 'X-Session-Token': getSessionToken() }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch course drafts');
  }
  
  return response.json();
};

/**
 * Create a new draft
 */
export const createDraft = async (draftData) => {
  const response = await fetch(`${API_BASE}/drafts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Token': getSessionToken()
    },
    body: JSON.stringify(draftData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create draft');
  }
  
  return response.json();
};

/**
 * Update a draft
 */
export const updateDraft = async (draftId, updates) => {
  const response = await fetch(`${API_BASE}/drafts/${draftId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Token': getSessionToken()
    },
    body: JSON.stringify(updates)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update draft');
  }
  
  return response.json();
};

/**
 * Add a collaborator to a draft
 */
export const addCollaborator = async (draftId, userId, userName) => {
  const response = await fetch(`${API_BASE}/drafts/${draftId}/collaborators`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Token': getSessionToken()
    },
    body: JSON.stringify({ userId, userName })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add collaborator');
  }
  
  return response.json();
};

/**
 * Remove a collaborator from a draft
 */
export const removeCollaborator = async (draftId, userId) => {
  const response = await fetch(`${API_BASE}/drafts/${draftId}/collaborators/${userId}`, {
    method: 'DELETE',
    headers: { 'X-Session-Token': getSessionToken() }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove collaborator');
  }
  
  return response.json();
};

/**
 * Publish a draft (admin only)
 */
export const publishDraft = async (draftId) => {
  const response = await fetch(`${API_BASE}/drafts/${draftId}/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Token': getSessionToken()
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to publish draft');
  }
  
  return response.json();
};

/**
 * Delete a draft
 */
export const deleteDraft = async (draftId) => {
  const response = await fetch(`${API_BASE}/drafts/${draftId}`, {
    method: 'DELETE',
    headers: { 'X-Session-Token': getSessionToken() }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete draft');
  }
  
  return response.json();
};
