/**
 * Batch Model
 * Handles paid bootcamp batches (programs) and their enrollments.
 *
 * Structure:
 *   bootcamp_batches   - the "product" students purchase (e.g. "Web Dev Cohort 3")
 *   batch_enrollments  - one row per student per batch, tracks payment
 *   bootcamp_sessions  - individual class meetings, linked to a batch via batch_id
 *
 * payment_method:  'midtrans' | 'manual'
 * payment_status:  'pending' | 'paid' | 'refunded' | 'rejected'
 */

import pool from '../connection.js';

// ─────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────

const formatBatch = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  price: parseFloat(row.price) || 0,
  currency: row.currency || 'IDR',
  instructorId: row.instructor_id,
  instructorName: row.instructor_name,
  maxParticipants: row.max_participants,
  startDate: row.start_date,
  endDate: row.end_date,
  status: row.status,         // open | closed | full | cancelled
  isPublic: row.is_public,    // true = free/open event; false = paid batch
  bankAccount: row.bank_account || {},
  tags: row.tags || [],
  enrollmentCount: parseInt(row.enrollment_count) || 0,
  sessionCount: parseInt(row.session_count) || 0,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const formatEnrollment = (row) => ({
  id: row.id,
  batchId: row.batch_id,
  userId: row.user_id,
  paymentMethod: row.payment_method,
  paymentStatus: row.payment_status,
  paymentRef: row.payment_ref,
  transferNotes: row.transfer_notes,
  amountPaid: parseFloat(row.amount_paid) || 0,
  snapToken: row.snap_token,
  approvedBy: row.approved_by,
  approvedAt: row.approved_at,
  rejectedReason: row.rejected_reason,
  enrolledAt: row.enrolled_at,
  updatedAt: row.updated_at,
  // Joined fields
  username: row.username,
  displayName: row.display_name,
  email: row.email,
  batchTitle: row.batch_title,
});

// ─────────────────────────────────────────────
// Batch CRUD
// ─────────────────────────────────────────────

export const createBatch = async (data) => {
  const {
    title, description, price, currency,
    instructorId, instructorName,
    maxParticipants, startDate, endDate,
    isPublic, bankAccount, tags,
  } = data;

  const result = await pool.query(
    `INSERT INTO bootcamp_batches
      (title, description, price, currency, instructor_id, instructor_name,
       max_participants, start_date, end_date, is_public, bank_account, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      title, description || null,
      price ?? 0, currency || 'IDR',
      instructorId, instructorName,
      maxParticipants || 30,
      startDate || null, endDate || null,
      isPublic || false,
      JSON.stringify(bankAccount || {}),
      tags || [],
    ]
  );
  return formatBatch(result.rows[0]);
};

export const getBatches = async (includeNonPublic = false) => {
  const result = await pool.query(
    `SELECT bb.*,
       (SELECT COUNT(*) FROM batch_enrollments
        WHERE batch_id = bb.id AND payment_status = 'paid') AS enrollment_count,
       (SELECT COUNT(*) FROM bootcamp_sessions
        WHERE batch_id = bb.id) AS session_count
     FROM bootcamp_batches bb
     ${includeNonPublic ? '' : "WHERE bb.status NOT IN ('cancelled')"}
     ORDER BY bb.start_date ASC NULLS LAST, bb.created_at DESC`
  );
  return result.rows.map(formatBatch);
};

export const getBatch = async (batchId) => {
  const result = await pool.query(
    `SELECT bb.*,
       (SELECT COUNT(*) FROM batch_enrollments
        WHERE batch_id = bb.id AND payment_status = 'paid') AS enrollment_count,
       (SELECT COUNT(*) FROM bootcamp_sessions WHERE batch_id = bb.id) AS session_count
     FROM bootcamp_batches bb WHERE bb.id = $1`,
    [batchId]
  );
  if (!result.rows[0]) return null;
  const batch = formatBatch(result.rows[0]);

  // Attach sessions
  const sessions = await pool.query(
    `SELECT * FROM bootcamp_sessions WHERE batch_id = $1 ORDER BY scheduled_at ASC`,
    [batchId]
  );
  batch.sessions = sessions.rows;
  return batch;
};

export const updateBatch = async (batchId, updates) => {
  const allowed = ['title', 'description', 'price', 'currency', 'max_participants',
    'start_date', 'end_date', 'status', 'is_public', 'bank_account', 'tags'];
  const fields = [];
  const values = [];
  let idx = 1;

  const keyMap = {
    title: 'title', description: 'description', price: 'price', currency: 'currency',
    maxParticipants: 'max_participants', startDate: 'start_date', endDate: 'end_date',
    status: 'status', isPublic: 'is_public', bankAccount: 'bank_account', tags: 'tags',
  };

  for (const [jsKey, colKey] of Object.entries(keyMap)) {
    if (updates[jsKey] !== undefined) {
      fields.push(`${colKey} = $${idx}`);
      let val = updates[jsKey];
      if (jsKey === 'bankAccount') val = JSON.stringify(val);
      values.push(val);
      idx++;
    }
  }

  if (fields.length === 0) return getBatch(batchId);
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(batchId);

  const result = await pool.query(
    `UPDATE bootcamp_batches SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] ? formatBatch(result.rows[0]) : null;
};

export const deleteBatch = async (batchId) => {
  await pool.query('DELETE FROM bootcamp_batches WHERE id = $1', [batchId]);
};

// ─────────────────────────────────────────────
// Batch Enrollment (Payment)
// ─────────────────────────────────────────────

export const getBatchEnrollment = async (batchId, userId) => {
  const result = await pool.query(
    `SELECT be.*, u.username, u.display_name, u.email
     FROM batch_enrollments be
     JOIN users u ON be.user_id = u.id
     WHERE be.batch_id = $1 AND be.user_id = $2`,
    [batchId, userId]
  );
  return result.rows[0] ? formatEnrollment(result.rows[0]) : null;
};

export const createOrUpdateBatchEnrollment = async (data) => {
  const { batchId, userId, paymentMethod, paymentStatus, paymentRef, amountPaid, snapToken, transferNotes } = data;
  const result = await pool.query(
    `INSERT INTO batch_enrollments
       (batch_id, user_id, payment_method, payment_status, payment_ref, amount_paid, snap_token, transfer_notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (batch_id, user_id) DO UPDATE SET
       payment_method = EXCLUDED.payment_method,
       payment_status = EXCLUDED.payment_status,
       payment_ref    = EXCLUDED.payment_ref,
       amount_paid    = EXCLUDED.amount_paid,
       snap_token     = EXCLUDED.snap_token,
       transfer_notes = EXCLUDED.transfer_notes,
       updated_at     = CURRENT_TIMESTAMP
     RETURNING *`,
    [batchId, userId, paymentMethod, paymentStatus || 'pending', paymentRef || null,
     amountPaid || 0, snapToken || null, transferNotes || null]
  );
  return formatEnrollment(result.rows[0]);
};

export const updateBatchEnrollmentStatus = async (enrollmentId, updates) => {
  const result = await pool.query(
    `UPDATE batch_enrollments
     SET payment_status = $1, approved_by = $2, approved_at = $3, rejected_reason = $4, updated_at = CURRENT_TIMESTAMP
     WHERE id = $5
     RETURNING *`,
    [updates.paymentStatus, updates.approvedBy || null, updates.approvedAt || null, updates.rejectedReason || null, enrollmentId]
  );
  return result.rows[0] ? formatEnrollment(result.rows[0]) : null;
};

export const updateBatchEnrollmentByRef = async (paymentRef, updates) => {
  const result = await pool.query(
    `UPDATE batch_enrollments
     SET payment_status = $1, updated_at = CURRENT_TIMESTAMP
     WHERE payment_ref = $2
     RETURNING *`,
    [updates.paymentStatus, paymentRef]
  );
  return result.rows[0] ? formatEnrollment(result.rows[0]) : null;
};

export const getUserBatchEnrollments = async (userId) => {
  const result = await pool.query(
    `SELECT be.*, bb.title AS batch_title, bb.price, bb.currency,
       bb.start_date, bb.end_date, bb.instructor_name, bb.tags
     FROM batch_enrollments be
     JOIN bootcamp_batches bb ON be.batch_id = bb.id
     WHERE be.user_id = $1
     ORDER BY be.enrolled_at DESC`,
    [userId]
  );
  return result.rows.map(formatEnrollment);
};

export const getPendingBatchEnrollments = async () => {
  const result = await pool.query(
    `SELECT be.*, u.username, u.display_name, u.email,
       bb.title AS batch_title, bb.price, bb.currency
     FROM batch_enrollments be
     JOIN users u ON be.user_id = u.id
     JOIN bootcamp_batches bb ON be.batch_id = bb.id
     WHERE be.payment_status = 'pending'
     ORDER BY be.enrolled_at ASC`
  );
  return result.rows.map(formatEnrollment);
};

export const getBatchEnrollments = async (batchId) => {
  const result = await pool.query(
    `SELECT be.*, u.username, u.display_name, u.email
     FROM batch_enrollments be
     JOIN users u ON be.user_id = u.id
     WHERE be.batch_id = $1
     ORDER BY be.enrolled_at ASC`,
    [batchId]
  );
  return result.rows.map(formatEnrollment);
};

export const isUserEnrolledInBatch = async (batchId, userId) => {
  const result = await pool.query(
    `SELECT id FROM batch_enrollments
     WHERE batch_id = $1 AND user_id = $2 AND payment_status = 'paid'`,
    [batchId, userId]
  );
  return result.rows.length > 0;
};
