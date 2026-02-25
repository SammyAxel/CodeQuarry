/**
 * Batch API — client-side calls for paid bootcamp batches
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getHeaders() {
  const token = localStorage.getItem('userToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'x-user-token': token } : {}),
  };
}

// ─────────────────────────────────────────────
// Batches
// ─────────────────────────────────────────────

export async function fetchBatches() {
  const res = await fetch(`${API_URL}/api/batches`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.batches;
}

export async function fetchBatch(batchId) {
  const res = await fetch(`${API_URL}/api/batches/${batchId}`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.batch;
}

export async function createBatch(batchData) {
  const res = await fetch(`${API_URL}/api/batches`, {
    method: 'POST', headers: getHeaders(), body: JSON.stringify(batchData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.batch;
}

export async function updateBatch(batchId, updates) {
  const res = await fetch(`${API_URL}/api/batches/${batchId}`, {
    method: 'PUT', headers: getHeaders(), body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.batch;
}

export async function deleteBatch(batchId) {
  const res = await fetch(`${API_URL}/api/batches/${batchId}`, {
    method: 'DELETE', headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

// ─────────────────────────────────────────────
// Enrollment
// ─────────────────────────────────────────────

export async function fetchMyBatchEnrollments() {
  const res = await fetch(`${API_URL}/api/batches/my-enrollments`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.enrollments;
}

export async function fetchBatchEnrollment(batchId) {
  const res = await fetch(`${API_URL}/api/batches/${batchId}/enrollment`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.enrollment; // null if not enrolled
}

/**
 * Fetch the logged-in user's per-session attendance for a batch.
 * Returns [{ sessionId, attended, joinedAt }]
 */
export async function fetchBatchAttendance(batchId) {
  const res = await fetch(`${API_URL}/api/batches/${batchId}/attendance`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.attendance;
}

/** Start Midtrans Snap checkout. Returns { snapToken, clientKey }. */
export async function enrollOnline(batchId) {
  const res = await fetch(`${API_URL}/api/batches/${batchId}/enroll/online`, {
    method: 'POST', headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data; // { snapToken, clientKey, enrollmentId }
}

/** Submit a manual bank-transfer enrollment. */
export async function enrollManual(batchId, transferRef, transferNotes) {
  const res = await fetch(`${API_URL}/api/batches/${batchId}/enroll/manual`, {
    method: 'POST', headers: getHeaders(),
    body: JSON.stringify({ transferRef, transferNotes }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.enrollment;
}

// ─────────────────────────────────────────────
// Admin
// ─────────────────────────────────────────────

export async function fetchPendingEnrollments() {
  const res = await fetch(`${API_URL}/api/batches/admin/pending`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.enrollments;
}

export async function approveEnrollment(enrollmentId) {
  const res = await fetch(`${API_URL}/api/batches/enrollments/${enrollmentId}/approve`, {
    method: 'PUT', headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.enrollment;
}

export async function rejectEnrollment(enrollmentId, reason) {
  const res = await fetch(`${API_URL}/api/batches/enrollments/${enrollmentId}/reject`, {
    method: 'PUT', headers: getHeaders(),
    body: JSON.stringify({ reason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.enrollment;
}

export async function refundEnrollment(enrollmentId, reason) {
  const res = await fetch(`${API_URL}/api/batches/enrollments/${enrollmentId}/refund`, {
    method: 'PUT', headers: getHeaders(),
    body: JSON.stringify({ reason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.enrollment;
}

export async function fetchBatchEnrollments(batchId) {
  const res = await fetch(`${API_URL}/api/batches/${batchId}/enrollments`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.enrollments;
}

// ─────────────────────────────────────────────
// Certificates
// ─────────────────────────────────────────────

export async function fetchCertificateTemplate(batchId) {
  const res = await fetch(`${API_URL}/api/batches/${batchId}/certificate/template`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.template;
}

export async function saveCertificateTemplate(batchId, templateData) {
  const res = await fetch(`${API_URL}/api/batches/${batchId}/certificate/template`, {
    method: 'PUT', headers: getHeaders(), body: JSON.stringify(templateData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.template;
}

export async function fetchEligibleStudents(batchId) {
  const res = await fetch(`${API_URL}/api/batches/${batchId}/certificate/eligible`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return { eligible: data.eligible, threshold: data.threshold };
}

export async function issueCertificates(batchId, userIds) {
  const res = await fetch(`${API_URL}/api/batches/${batchId}/certificate/issue`, {
    method: 'POST', headers: getHeaders(),
    body: JSON.stringify(userIds ? { userIds } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function fetchMyCertificate(batchId) {
  const res = await fetch(`${API_URL}/api/batches/${batchId}/certificate`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.certificate;
}

export async function fetchBatchCertificates(batchId) {
  const res = await fetch(`${API_URL}/api/batches/${batchId}/certificates`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.certificates;
}

export function getCertificatePdfUrl(certUuid) {
  const token = localStorage.getItem('userToken') || '';
  return `${API_URL}/api/batches/cert/${certUuid}/pdf?token=${encodeURIComponent(token)}`;
}
