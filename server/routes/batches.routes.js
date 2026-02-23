/**
 * Batches Routes
 * Manages paid bootcamp programs (batches) and their enrollments.
 *
 * Payment flow A – Midtrans (online):
 *   1. POST /api/batches/:id/enroll/online  → creates pending enrollment + returns Snap token
 *   2. Frontend opens window.snap.pay(token)
 *   3. POST /api/batches/payment/notification (Midtrans webhook) → marks enrollment paid
 *
 * Payment flow B – Manual transfer:
 *   1. POST /api/batches/:id/enroll/manual  → creates pending enrollment with transfer notes
 *   2. Admin sees it on GET /api/batches/admin/pending
 *   3. PUT /api/batches/enrollments/:id/approve  → marks enrollment paid
 *      PUT /api/batches/enrollments/:id/reject   → rejects with reason
 */

import { Router } from 'express';
import midtransClient from 'midtrans-client';
import { verifyUserSession } from '../middleware/auth.middleware.js';
import db from '../../database/index.js';

const router = Router();

// Midtrans Snap instance
const snap = new midtransClient.Snap({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const requireAdmin = async (req, res) => {
  const user = await db.getUserById(req.user.id);
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return null;
  }
  return user;
};

// ─────────────────────────────────────────────
// Static / non-parameterised routes (must come before /:id)
// ─────────────────────────────────────────────

/**
 * GET /api/batches/my-enrollments
 * All batches the current user has enrolled in (any payment status).
 */
router.get('/my-enrollments', verifyUserSession, async (req, res) => {
  try {
    const enrollments = await db.getUserBatchEnrollments(req.user.id);
    res.json({ enrollments });
  } catch (err) {
    console.error('Error fetching user batch enrollments:', err);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

/**
 * GET /api/batches/admin/pending
 * All pending payment requests (admin only).
 */
router.get('/admin/pending', verifyUserSession, async (req, res) => {
  try {
    if (!await requireAdmin(req, res)) return;
    const enrollments = await db.getPendingBatchEnrollments();
    res.json({ enrollments });
  } catch (err) {
    console.error('Error fetching pending enrollments:', err);
    res.status(500).json({ error: 'Failed to fetch pending enrollments' });
  }
});

/**
 * POST /api/batches/payment/notification
 * Midtrans payment notification webhook.
 * Must be publicly accessible (no auth); Midtrans POSTs here after payment.
 */
router.post('/payment/notification', async (req, res) => {
  try {
    // Verify & decode the notification via Midtrans SDK
    const statusResponse = await snap.transaction.notification(req.body);
    const { order_id, transaction_status, fraud_status } = statusResponse;

    let newStatus = null;

    if (transaction_status === 'capture') {
      newStatus = fraud_status === 'accept' ? 'paid' : 'rejected';
    } else if (transaction_status === 'settlement') {
      newStatus = 'paid';
    } else if (['deny', 'cancel', 'expire', 'failure'].includes(transaction_status)) {
      newStatus = 'rejected';
    } else if (transaction_status === 'pending') {
      newStatus = 'pending'; // bank transfer waiting for payment
    }

    if (newStatus) {
      await db.updateBatchEnrollmentByRef(order_id, { paymentStatus: newStatus });
      console.log(`[Midtrans] Order ${order_id} → ${newStatus}`);
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Midtrans webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * PUT /api/batches/enrollments/:id/approve
 * Admin manually approves a pending enrollment (manual transfer confirmed).
 */
router.put('/enrollments/:id/approve', verifyUserSession, async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const enrollment = await db.updateBatchEnrollmentStatus(parseInt(req.params.id), {
      paymentStatus: 'paid',
      approvedBy: admin.id,
      approvedAt: new Date(),
    });
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
    res.json({ success: true, enrollment });
  } catch (err) {
    console.error('Error approving enrollment:', err);
    res.status(500).json({ error: 'Failed to approve enrollment' });
  }
});

/**
 * PUT /api/batches/enrollments/:id/reject
 * Admin rejects a pending enrollment.
 */
router.put('/enrollments/:id/reject', verifyUserSession, async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const { reason } = req.body;
    const enrollment = await db.updateBatchEnrollmentStatus(parseInt(req.params.id), {
      paymentStatus: 'rejected',
      approvedBy: admin.id,
      approvedAt: new Date(),
      rejectedReason: reason || 'Rejected by admin',
    });
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
    res.json({ success: true, enrollment });
  } catch (err) {
    console.error('Error rejecting enrollment:', err);
    res.status(500).json({ error: 'Failed to reject enrollment' });
  }
});

// ─────────────────────────────────────────────
// Batch CRUD
// ─────────────────────────────────────────────

/**
 * GET /api/batches
 * List all non-cancelled batches (public).
 * Admin gets all batches including cancelled.
 */
router.get('/', async (req, res) => {
  try {
    // Peek at auth header to check if admin (don't block non-authed requests)
    let isAdmin = false;
    const token = req.headers['x-user-token'];
    if (token) {
      try {
        const session = await db.findSession(token);
        if (session?.role === 'admin') isAdmin = true;
      } catch (_) { /* ignore */ }
    }
    const batches = await db.getBatches(isAdmin);
    res.json({ batches });
  } catch (err) {
    console.error('Error fetching batches:', err);
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
});

/**
 * POST /api/batches
 * Create a new batch (admin only).
 */
router.post('/', verifyUserSession, async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const {
      title, description, price, currency,
      maxParticipants, startDate, endDate,
      isPublic, bankAccount, tags,
    } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const batch = await db.createBatch({
      title, description, price: price ?? 0, currency: currency || 'IDR',
      instructorId: admin.id, instructorName: admin.display_name || admin.username,
      maxParticipants, startDate, endDate, isPublic, bankAccount, tags,
    });
    res.json({ success: true, batch });
  } catch (err) {
    console.error('Error creating batch:', err);
    res.status(500).json({ error: 'Failed to create batch' });
  }
});

/**
 * GET /api/batches/:id
 * Single batch with its sessions.
 */
router.get('/:id', async (req, res) => {
  try {
    const batch = await db.getBatch(parseInt(req.params.id));
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    res.json({ batch });
  } catch (err) {
    console.error('Error fetching batch:', err);
    res.status(500).json({ error: 'Failed to fetch batch' });
  }
});

/**
 * PUT /api/batches/:id
 * Update a batch (admin only).
 */
router.put('/:id', verifyUserSession, async (req, res) => {
  try {
    if (!await requireAdmin(req, res)) return;
    const batch = await db.updateBatch(parseInt(req.params.id), req.body);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    res.json({ success: true, batch });
  } catch (err) {
    console.error('Error updating batch:', err);
    res.status(500).json({ error: 'Failed to update batch' });
  }
});

/**
 * DELETE /api/batches/:id
 * Delete a batch (admin only).
 */
router.delete('/:id', verifyUserSession, async (req, res) => {
  try {
    if (!await requireAdmin(req, res)) return;
    await db.deleteBatch(parseInt(req.params.id));
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting batch:', err);
    res.status(500).json({ error: 'Failed to delete batch' });
  }
});

/**
 * GET /api/batches/:id/enrollment
 * Check if the logged-in user is enrolled (paid) in this batch.
 */
router.get('/:id/enrollment', verifyUserSession, async (req, res) => {
  try {
    const enrollment = await db.getBatchEnrollment(parseInt(req.params.id), req.user.id);
    res.json({ enrollment: enrollment || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check enrollment' });
  }
});

/**
 * GET /api/batches/:id/enrollments
 * All enrollments for a batch (admin only).
 */
router.get('/:id/enrollments', verifyUserSession, async (req, res) => {
  try {
    if (!await requireAdmin(req, res)) return;
    const enrollments = await db.getBatchEnrollments(parseInt(req.params.id));
    res.json({ enrollments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch batch enrollments' });
  }
});

// ─────────────────────────────────────────────
// Enrollment / Payment
// ─────────────────────────────────────────────

/**
 * POST /api/batches/:id/enroll/online
 * Start Midtrans Snap checkout for a batch.
 * Returns { snapToken, clientKey, enrollmentId }.
 */
router.post('/:id/enroll/online', verifyUserSession, async (req, res) => {
  try {
    const batchId = parseInt(req.params.id);
    const userId = req.user.id;

    const batch = await db.getBatch(batchId);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    if (batch.status !== 'open') return res.status(400).json({ error: 'Batch is not accepting enrollments' });

    const existing = await db.getBatchEnrollment(batchId, userId);
    if (existing?.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'You are already enrolled in this batch' });
    }

    // Check capacity
    if (batch.enrollmentCount >= batch.maxParticipants) {
      return res.status(400).json({ error: 'This batch is full' });
    }

    const user = await db.getUserById(userId);
    const orderId = `CQ-${batchId}-${userId}-${Date.now()}`;

    if (!process.env.MIDTRANS_SERVER_KEY) {
      return res.status(500).json({ error: 'Payment gateway not configured. Please use manual transfer.' });
    }

    // Create Midtrans Snap transaction
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(batch.price), // Midtrans requires integer IDR
      },
      customer_details: {
        first_name: user.display_name || user.username,
        email: user.email || `${user.username}@codequarry.app`,
      },
      item_details: [{
        id: `batch-${batchId}`,
        price: Math.round(batch.price),
        quantity: 1,
        name: batch.title.substring(0, 50),
      }],
      expiry: { unit: 'hours', duration: 24 },
    };

    const transaction = await snap.createTransaction(parameter);

    // Create/update enrollment as pending
    const enrollment = await db.createOrUpdateBatchEnrollment({
      batchId, userId,
      paymentMethod: 'midtrans',
      paymentStatus: 'pending',
      paymentRef: orderId,
      amountPaid: batch.price,
      snapToken: transaction.token,
    });

    res.json({
      snapToken: transaction.token,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
      enrollmentId: enrollment.id,
    });
  } catch (err) {
    console.error('Midtrans enrollment error:', err);
    res.status(500).json({ error: err.message || 'Failed to create payment' });
  }
});

/**
 * POST /api/batches/:id/enroll/manual
 * Register a manual bank-transfer enrollment.
 * Body: { transferRef, transferNotes }
 * Creates a pending enrollment; admin must approve.
 */
router.post('/:id/enroll/manual', verifyUserSession, async (req, res) => {
  try {
    const batchId = parseInt(req.params.id);
    const userId = req.user.id;

    const batch = await db.getBatch(batchId);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    if (batch.status !== 'open') return res.status(400).json({ error: 'Batch is not accepting enrollments' });

    const existing = await db.getBatchEnrollment(batchId, userId);
    if (existing?.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'You are already enrolled in this batch' });
    }

    if (batch.enrollmentCount >= batch.maxParticipants) {
      return res.status(400).json({ error: 'This batch is full' });
    }

    const { transferRef, transferNotes } = req.body;
    if (!transferRef?.trim()) {
      return res.status(400).json({ error: 'Transfer reference number is required' });
    }

    const ref = `MANUAL-${batchId}-${userId}-${Date.now()}`;
    const enrollment = await db.createOrUpdateBatchEnrollment({
      batchId, userId,
      paymentMethod: 'manual',
      paymentStatus: 'pending',
      paymentRef: ref,
      transferNotes: `Ref: ${transferRef.trim()}${transferNotes ? ` | Notes: ${transferNotes}` : ''}`,
      amountPaid: batch.price,
    });

    res.json({ success: true, enrollment });
  } catch (err) {
    console.error('Manual enrollment error:', err);
    res.status(500).json({ error: 'Failed to register enrollment' });
  }
});

export default router;
