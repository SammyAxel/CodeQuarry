/**
 * Bootcamp Model
 * Handles bootcamp session CRUD, enrollments, interactions, and responses
 */

import pool from '../connection.js';

// ============ SESSION MANAGEMENT ============

/**
 * Create a new bootcamp session
 */
export const createBootcampSession = async (sessionData) => {
  const {
    title, description, instructorId, instructorName,
    roomId, provider, scheduledAt, durationMinutes,
    maxParticipants, tags, batchId
  } = sessionData;

  const result = await pool.query(
    `INSERT INTO bootcamp_sessions 
      (title, description, instructor_id, instructor_name, room_id, provider, scheduled_at, duration_minutes, max_participants, tags, batch_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [title, description, instructorId, instructorName, roomId, provider || 'jitsi', scheduledAt, durationMinutes || 75, maxParticipants || 50, tags || [], batchId || null]
  );
  return formatSession(result.rows[0]);
};

/**
 * Get all bootcamp sessions, optionally filtered by status
 */
export const getBootcampSessions = async (status = null) => {
  let query = 'SELECT * FROM bootcamp_sessions';
  const params = [];

  if (status) {
    query += ' WHERE status = $1';
    params.push(status);
  }

  query += ' ORDER BY scheduled_at ASC';
  const result = await pool.query(query, params);
  return result.rows.map(formatSession);
};

/**
 * Get upcoming sessions (scheduled or live)
 */
export const getUpcomingSessions = async () => {
  const result = await pool.query(
    `SELECT bs.*, 
      (SELECT COUNT(*) FROM bootcamp_enrollments WHERE session_id = bs.id) as enrollment_count
     FROM bootcamp_sessions bs 
     WHERE bs.status IN ('scheduled', 'live') AND bs.scheduled_at >= NOW() - INTERVAL '2 hours'
     ORDER BY bs.scheduled_at ASC`
  );
  return result.rows.map(formatSession);
};

/**
 * Get a single session by ID with enrollment count
 */
export const getBootcampSession = async (sessionId) => {
  const result = await pool.query(
    `SELECT bs.*,
      (SELECT COUNT(*) FROM bootcamp_enrollments WHERE session_id = bs.id) as enrollment_count
     FROM bootcamp_sessions bs WHERE bs.id = $1`,
    [sessionId]
  );
  return result.rows[0] ? formatSession(result.rows[0]) : null;
};

/**
 * Update session status
 */
export const updateSessionStatus = async (sessionId, status) => {
  const result = await pool.query(
    `UPDATE bootcamp_sessions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
    [status, sessionId]
  );
  return result.rows[0] ? formatSession(result.rows[0]) : null;
};

/**
 * Update session details
 */
export const updateBootcampSession = async (sessionId, updates) => {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  const allowedFields = ['title', 'description', 'scheduled_at', 'duration_minutes', 'max_participants', 'tags', 'status', 'room_id', 'provider', 'recording_url', 'batch_id'];
  const fieldMap = {
    title: 'title', description: 'description', scheduledAt: 'scheduled_at',
    durationMinutes: 'duration_minutes', maxParticipants: 'max_participants',
    tags: 'tags', status: 'status', roomId: 'room_id', provider: 'provider',
    recordingUrl: 'recording_url', batchId: 'batch_id'
  };

  for (const [key, dbField] of Object.entries(fieldMap)) {
    if (updates[key] !== undefined) {
      fields.push(`${dbField} = $${paramIndex}`);
      values.push(updates[key]);
      paramIndex++;
    }
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(sessionId);

  const result = await pool.query(
    `UPDATE bootcamp_sessions SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0] ? formatSession(result.rows[0]) : null;
};

/**
 * Delete a session
 */
export const deleteBootcampSession = async (sessionId) => {
  await pool.query('DELETE FROM bootcamp_sessions WHERE id = $1', [sessionId]);
};

// ============ ENROLLMENT MANAGEMENT ============

/**
 * Enroll a user in a session
 */
export const enrollInSession = async (sessionId, userId) => {
  const result = await pool.query(
    `INSERT INTO bootcamp_enrollments (session_id, user_id) VALUES ($1, $2)
     ON CONFLICT (session_id, user_id) DO NOTHING
     RETURNING *`,
    [sessionId, userId]
  );
  return result.rows[0] || null;
};

/**
 * Unenroll a user from a session
 */
export const unenrollFromSession = async (sessionId, userId) => {
  await pool.query(
    'DELETE FROM bootcamp_enrollments WHERE session_id = $1 AND user_id = $2',
    [sessionId, userId]
  );
};

/**
 * Check if user is enrolled
 */
export const isUserEnrolled = async (sessionId, userId) => {
  const result = await pool.query(
    'SELECT id FROM bootcamp_enrollments WHERE session_id = $1 AND user_id = $2',
    [sessionId, userId]
  );
  return result.rows.length > 0;
};

/**
 * Mark user as attended (when they join the live session)
 */
export const markAttendance = async (sessionId, userId) => {
  await pool.query(
    `UPDATE bootcamp_enrollments SET attended = true, joined_at = CURRENT_TIMESTAMP 
     WHERE session_id = $1 AND user_id = $2`,
    [sessionId, userId]
  );
};

/**
 * Get all enrollments for a session (with user info)
 */
export const getSessionEnrollments = async (sessionId) => {
  const result = await pool.query(
    `SELECT be.*, u.username, u.display_name, u.avatar_url
     FROM bootcamp_enrollments be
     JOIN users u ON be.user_id = u.id
     WHERE be.session_id = $1
     ORDER BY be.enrolled_at ASC`,
    [sessionId]
  );
  return result.rows.map(row => ({
    id: row.id,
    sessionId: row.session_id,
    userId: row.user_id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    enrolledAt: row.enrolled_at,
    attended: row.attended,
    joinedAt: row.joined_at,
    leftAt: row.left_at
  }));
};

/**
 * Get sessions a user is enrolled in
 */
export const getUserEnrollments = async (userId) => {
  const result = await pool.query(
    `SELECT bs.*, be.enrolled_at, be.attended,
      (SELECT COUNT(*) FROM bootcamp_enrollments WHERE session_id = bs.id) as enrollment_count
     FROM bootcamp_sessions bs
     JOIN bootcamp_enrollments be ON bs.id = be.session_id
     WHERE be.user_id = $1
     ORDER BY bs.scheduled_at ASC`,
    [userId]
  );
  return result.rows.map(row => ({
    ...formatSession(row),
    enrolledAt: row.enrolled_at,
    attended: row.attended
  }));
};

// ============ LIVE INTERACTIONS ============

/**
 * Create a live interaction (quiz/code challenge/poll)
 */
export const createInteraction = async (sessionId, type, payload) => {
  const result = await pool.query(
    `INSERT INTO bootcamp_interactions (session_id, type, payload) VALUES ($1, $2, $3) RETURNING *`,
    [sessionId, type, JSON.stringify(payload)]
  );
  return formatInteraction(result.rows[0]);
};

/**
 * Close an interaction
 */
export const closeInteraction = async (interactionId) => {
  const result = await pool.query(
    `UPDATE bootcamp_interactions SET closed_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
    [interactionId]
  );
  return result.rows[0] ? formatInteraction(result.rows[0]) : null;
};

/**
 * Get active interactions for a session
 */
export const getActiveInteractions = async (sessionId) => {
  const result = await pool.query(
    `SELECT * FROM bootcamp_interactions WHERE session_id = $1 AND closed_at IS NULL ORDER BY triggered_at DESC`,
    [sessionId]
  );
  return result.rows.map(formatInteraction);
};

/**
 * Get all interactions for a session
 */
export const getSessionInteractions = async (sessionId) => {
  const result = await pool.query(
    `SELECT * FROM bootcamp_interactions WHERE session_id = $1 ORDER BY triggered_at ASC`,
    [sessionId]
  );
  return result.rows.map(formatInteraction);
};

// ============ RESPONSES ============

/**
 * Submit a response to an interaction
 */
export const submitResponse = async (interactionId, userId, response, score = null) => {
  const result = await pool.query(
    `INSERT INTO bootcamp_responses (interaction_id, user_id, response, score)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (interaction_id, user_id) DO UPDATE SET response = $3, score = $4, submitted_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [interactionId, userId, JSON.stringify(response), score]
  );
  return result.rows[0];
};

/**
 * Get responses for an interaction
 */
export const getInteractionResponses = async (interactionId) => {
  const result = await pool.query(
    `SELECT br.*, u.username, u.display_name
     FROM bootcamp_responses br
     JOIN users u ON br.user_id = u.id
     WHERE br.interaction_id = $1
     ORDER BY br.submitted_at ASC`,
    [interactionId]
  );
  return result.rows;
};

// ============ FORMATTERS ============

const formatSession = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  instructorId: row.instructor_id,
  instructorName: row.instructor_name,
  roomId: row.room_id,
  provider: row.provider,
  providerRoomData: row.provider_room_data,
  scheduledAt: row.scheduled_at,
  durationMinutes: row.duration_minutes,
  status: row.status,
  maxParticipants: row.max_participants,
  tags: row.tags,
  recordingUrl: row.recording_url,
  batchId: row.batch_id || null,
  enrollmentCount: row.enrollment_count ? parseInt(row.enrollment_count) : undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const formatInteraction = (row) => ({
  id: row.id,
  sessionId: row.session_id,
  type: row.type,
  payload: row.payload,
  triggeredAt: row.triggered_at,
  closedAt: row.closed_at
});
