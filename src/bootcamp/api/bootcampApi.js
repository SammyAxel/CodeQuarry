/**
 * Bootcamp API Utility
 * Client-side API calls for bootcamp features
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getHeaders() {
  const token = localStorage.getItem('userToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'x-user-token': token } : {})
  };
}

// ============ SESSIONS ============

export async function fetchSessions(status = null) {
  const url = status 
    ? `${API_URL}/api/bootcamp/sessions?status=${status}`
    : `${API_URL}/api/bootcamp/sessions`;
  // Include auth headers for ended sessions (visibility filtering)
  const headers = status === 'ended' ? getHeaders() : {};
  const res = await fetch(url, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.sessions;
}

export async function fetchSession(sessionId) {
  const res = await fetch(`${API_URL}/api/bootcamp/sessions/${sessionId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.session;
}

export async function createSession(sessionData) {
  const res = await fetch(`${API_URL}/api/bootcamp/sessions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(sessionData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.session;
}

export async function updateSession(sessionId, updates) {
  const res = await fetch(`${API_URL}/api/bootcamp/sessions/${sessionId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.session;
}

export async function deleteSession(sessionId) {
  const res = await fetch(`${API_URL}/api/bootcamp/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function goLive(sessionId) {
  const res = await fetch(`${API_URL}/api/bootcamp/sessions/${sessionId}/go-live`, {
    method: 'POST',
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.session;
}

export async function endSession(sessionId) {
  const res = await fetch(`${API_URL}/api/bootcamp/sessions/${sessionId}/end`, {
    method: 'POST',
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.session;
}

// ============ ENROLLMENT ============

export async function enrollInSession(sessionId) {
  const res = await fetch(`${API_URL}/api/bootcamp/sessions/${sessionId}/enroll`, {
    method: 'POST',
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function unenrollFromSession(sessionId) {
  const res = await fetch(`${API_URL}/api/bootcamp/sessions/${sessionId}/enroll`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function checkEnrollment(sessionId) {
  const res = await fetch(`${API_URL}/api/bootcamp/sessions/${sessionId}/enrollment`, {
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.enrolled;
}

export async function fetchMyEnrollments() {
  const res = await fetch(`${API_URL}/api/bootcamp/my-enrollments`, {
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.enrollments;
}

export async function joinSession(sessionId) {
  const res = await fetch(`${API_URL}/api/bootcamp/sessions/${sessionId}/join`, {
    method: 'POST',
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.room;
}

// ============ INTERACTIONS ============

export async function fetchActiveInteractions(sessionId) {
  const res = await fetch(`${API_URL}/api/bootcamp/sessions/${sessionId}/interactions`, {
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.interactions;
}

export async function triggerInteraction(sessionId, type, payload) {
  const res = await fetch(`${API_URL}/api/bootcamp/sessions/${sessionId}/interaction`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ type, payload })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.interaction;
}

export async function closeInteraction(interactionId) {
  const res = await fetch(`${API_URL}/api/bootcamp/interactions/${interactionId}/close`, {
    method: 'POST',
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.interaction;
}

export async function submitResponse(interactionId, response, score = null) {
  const res = await fetch(`${API_URL}/api/bootcamp/interactions/${interactionId}/respond`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ response, score })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function fetchResponses(interactionId) {
  const res = await fetch(`${API_URL}/api/bootcamp/interactions/${interactionId}/responses`, {
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.responses;
}

// ============ ADMIN ============

export async function fetchSessionEnrollments(sessionId) {
  const res = await fetch(`${API_URL}/api/bootcamp/sessions/${sessionId}/enrollments`, {
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.enrollments;
}
