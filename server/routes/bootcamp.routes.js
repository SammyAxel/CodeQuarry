/**
 * Bootcamp Routes
 * Handles bootcamp session management, enrollment, live interactions
 */

import { Router } from 'express';
import { verifyUserSession } from '../middleware/auth.middleware.js';
import db from '../../database/index.js';
import crypto from 'crypto';

const router = Router();

// 100ms configuration
const HMS_ACCESS_KEY = process.env.HMS_ACCESS_KEY;
const HMS_SECRET = process.env.HMS_SECRET;
const HMS_TEMPLATE_ID = process.env.HMS_TEMPLATE_ID;

/**
 * Generate a 100ms management token (server-side, for creating rooms)
 */
function generateManagementToken() {
  const payload = {
    access_key: HMS_ACCESS_KEY,
    type: 'management',
    version: 2,
    iat: Math.floor(Date.now() / 1000),
    nbf: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    jti: crypto.randomUUID()
  };
  return jwtSign(payload, HMS_SECRET);
}

/**
 * Generate a 100ms auth token for a user to join a room
 */
function generateAuthToken(roomId, userId, role) {
  const payload = {
    access_key: HMS_ACCESS_KEY,
    type: 'app',
    version: 2,
    room_id: roomId,
    user_id: String(userId),
    role: role, // 'host' or 'guest'
    iat: Math.floor(Date.now() / 1000),
    nbf: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400,
    jti: crypto.randomUUID()
  };
  return jwtSign(payload, HMS_SECRET);
}

/**
 * Minimal JWT HS256 signing (no external dependency needed)
 */
function jwtSign(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const signature = crypto.createHmac('sha256', secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');
  return `${headerB64}.${payloadB64}.${signature}`;
}

// ============ 100ms TOKEN ENDPOINT ============

/**
 * POST /api/bootcamp/100ms/token
 * Generate a 100ms auth token for joining a room
 */
router.post('/100ms/token', verifyUserSession, async (req, res) => {
  try {
    if (!HMS_ACCESS_KEY || !HMS_SECRET) {
      return res.status(500).json({ error: '100ms credentials not configured' });
    }

    const { roomId, role, userName } = req.body;
    if (!roomId) {
      return res.status(400).json({ error: 'roomId is required' });
    }

    // Look up the session to get or create the 100ms room
    // The roomId here is our internal room identifier
    const session = await db.pool.query(
      'SELECT * FROM bootcamp_sessions WHERE room_id = $1',
      [roomId]
    );

    if (session.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    let hmsRoomId = session.rows[0].provider_room_data?.hmsRoomId;

    // If no 100ms room exists yet, create one
    if (!hmsRoomId) {
      const mgmtToken = generateManagementToken();
      const createRes = await fetch('https://api.100ms.live/v2/rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mgmtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: roomId,
          template_id: HMS_TEMPLATE_ID,
          description: session.rows[0].title
        })
      });

      if (!createRes.ok) {
        const err = await createRes.text();
        console.error('100ms room creation failed:', err);
        return res.status(500).json({ error: 'Failed to create video room' });
      }

      const roomData = await createRes.json();
      hmsRoomId = roomData.id;

      // Save the 100ms room ID back to our session
      await db.pool.query(
        `UPDATE bootcamp_sessions SET provider_room_data = jsonb_set(COALESCE(provider_room_data, '{}'), '{hmsRoomId}', $1::jsonb) WHERE room_id = $2`,
        [JSON.stringify(hmsRoomId), roomId]
      );
    }

    // Generate auth token
    const userRole = role === 'host' ? 'host' : 'guest';
    const authToken = generateAuthToken(hmsRoomId, req.user.id, userRole);

    res.json({ authToken });
  } catch (error) {
    console.error('Error generating 100ms token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// ============ PUBLIC ROUTES ============

/**
 * GET /api/bootcamp/sessions
 * Get all upcoming/active sessions
 */
router.get('/sessions', async (req, res) => {
  try {
    const { status } = req.query;
    const sessions = status 
      ? await db.getBootcampSessions(status)
      : await db.getUpcomingSessions();
    res.json({ sessions });
  } catch (error) {
    console.error('Error fetching bootcamp sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

/**
 * GET /api/bootcamp/sessions/:id
 * Get a single session with details
 */
router.get('/sessions/:id', async (req, res) => {
  try {
    const session = await db.getBootcampSession(parseInt(req.params.id));
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ session });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// ============ AUTHENTICATED ROUTES ============

/**
 * POST /api/bootcamp/sessions/:id/enroll
 * Enroll in a session
 */
router.post('/sessions/:id/enroll', verifyUserSession, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const session = await db.getBootcampSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    if (session.status === 'ended' || session.status === 'cancelled') {
      return res.status(400).json({ error: 'Session is no longer available' });
    }
    if (session.enrollmentCount >= session.maxParticipants) {
      return res.status(400).json({ error: 'Session is full' });
    }

    const enrollment = await db.enrollInSession(sessionId, req.user.id);
    res.json({ success: true, enrollment });
  } catch (error) {
    console.error('Error enrolling:', error);
    res.status(500).json({ error: 'Failed to enroll' });
  }
});

/**
 * DELETE /api/bootcamp/sessions/:id/enroll
 * Unenroll from a session
 */
router.delete('/sessions/:id/enroll', verifyUserSession, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    await db.unenrollFromSession(sessionId, req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error unenrolling:', error);
    res.status(500).json({ error: 'Failed to unenroll' });
  }
});

/**
 * GET /api/bootcamp/sessions/:id/enrollment
 * Check if current user is enrolled
 */
router.get('/sessions/:id/enrollment', verifyUserSession, async (req, res) => {
  try {
    const isEnrolled = await db.isUserEnrolled(parseInt(req.params.id), req.user.id);
    res.json({ enrolled: isEnrolled });
  } catch (error) {
    console.error('Error checking enrollment:', error);
    res.status(500).json({ error: 'Failed to check enrollment' });
  }
});

/**
 * GET /api/bootcamp/my-enrollments
 * Get all sessions the current user is enrolled in
 */
router.get('/my-enrollments', verifyUserSession, async (req, res) => {
  try {
    const enrollments = await db.getUserEnrollments(req.user.id);
    res.json({ enrollments });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

/**
 * POST /api/bootcamp/sessions/:id/join
 * Join a live session (marks attendance, returns room info)
 */
router.post('/sessions/:id/join', verifyUserSession, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const session = await db.getBootcampSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const isInstructor = session.instructor_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isEnrolled = await db.isUserEnrolled(sessionId, req.user.id);
    if (!isEnrolled && !isInstructor && !isAdmin) {
      return res.status(403).json({ error: 'You must be enrolled to join' });
    }

    if (session.status !== 'live' && session.status !== 'scheduled') {
      return res.status(400).json({ error: 'Session is not active' });
    }

    // Mark attendance
    await db.markAttendance(sessionId, req.user.id);

    // Return room connection info
    res.json({
      success: true,
      room: {
        roomId: session.roomId,
        provider: session.provider,
        sessionId: session.id,
        title: session.title,
        instructorName: session.instructorName
      }
    });
  } catch (error) {
    console.error('Error joining session:', error);
    res.status(500).json({ error: 'Failed to join session' });
  }
});

/**
 * GET /api/bootcamp/sessions/:id/interactions
 * Get active interactions for a live session
 */
router.get('/sessions/:id/interactions', verifyUserSession, async (req, res) => {
  try {
    const interactions = await db.getActiveInteractions(parseInt(req.params.id));
    res.json({ interactions });
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({ error: 'Failed to fetch interactions' });
  }
});

/**
 * POST /api/bootcamp/interactions/:id/respond
 * Submit a response to a quiz/code challenge
 */
router.post('/interactions/:id/respond', verifyUserSession, async (req, res) => {
  try {
    const { response, score } = req.body;
    const result = await db.submitResponse(parseInt(req.params.id), req.user.id, response, score);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

// ============ ADMIN/INSTRUCTOR ROUTES ============

/**
 * POST /api/bootcamp/sessions
 * Create a new bootcamp session (admin only)
 */
router.post('/sessions', verifyUserSession, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { title, description, scheduledAt, durationMinutes, maxParticipants, tags } = req.body;

    if (!title || !scheduledAt) {
      return res.status(400).json({ error: 'Title and scheduledAt are required' });
    }

    // Generate room ID
    const roomId = `cq-bootcamp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    const session = await db.createBootcampSession({
      title,
      description,
      instructorId: user.id,
      instructorName: user.display_name || user.username,
      roomId,
      provider: '100ms', // Default provider; easily switchable
      scheduledAt,
      durationMinutes: durationMinutes || 75,
      maxParticipants: maxParticipants || 50,
      tags: tags || []
    });

    res.json({ success: true, session });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

/**
 * PUT /api/bootcamp/sessions/:id
 * Update a session (admin only)
 */
router.put('/sessions/:id', verifyUserSession, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const session = await db.updateBootcampSession(parseInt(req.params.id), req.body);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ success: true, session });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

/**
 * POST /api/bootcamp/sessions/:id/go-live
 * Start a live session (admin only)
 */
router.post('/sessions/:id/go-live', verifyUserSession, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const session = await db.updateSessionStatus(parseInt(req.params.id), 'live');
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ success: true, session });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

/**
 * POST /api/bootcamp/sessions/:id/end
 * End a live session (admin only)
 */
router.post('/sessions/:id/end', verifyUserSession, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const session = await db.updateSessionStatus(parseInt(req.params.id), 'ended');
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ success: true, session });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

/**
 * DELETE /api/bootcamp/sessions/:id
 * Delete a session (admin only)
 */
router.delete('/sessions/:id', verifyUserSession, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await db.deleteBootcampSession(parseInt(req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

/**
 * POST /api/bootcamp/sessions/:id/interaction
 * Trigger a quiz/code challenge during a live session (admin only)
 */
router.post('/sessions/:id/interaction', verifyUserSession, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { type, payload } = req.body;
    if (!type || !payload) {
      return res.status(400).json({ error: 'Type and payload are required' });
    }

    const interaction = await db.createInteraction(parseInt(req.params.id), type, payload);
    res.json({ success: true, interaction });
  } catch (error) {
    console.error('Error creating interaction:', error);
    res.status(500).json({ error: 'Failed to create interaction' });
  }
});

/**
 * POST /api/bootcamp/interactions/:id/close
 * Close an active interaction (admin only)
 */
router.post('/interactions/:id/close', verifyUserSession, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const interaction = await db.closeInteraction(parseInt(req.params.id));
    if (!interaction) {
      return res.status(404).json({ error: 'Interaction not found' });
    }
    res.json({ success: true, interaction });
  } catch (error) {
    console.error('Error closing interaction:', error);
    res.status(500).json({ error: 'Failed to close interaction' });
  }
});

/**
 * GET /api/bootcamp/interactions/:id/responses
 * Get all responses for an interaction (admin only)
 */
router.get('/interactions/:id/responses', verifyUserSession, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const responses = await db.getInteractionResponses(parseInt(req.params.id));
    res.json({ responses });
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

/**
 * GET /api/bootcamp/sessions/:id/enrollments
 * Get all enrollments for a session (admin only)
 */
router.get('/sessions/:id/enrollments', verifyUserSession, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const enrollments = await db.getSessionEnrollments(parseInt(req.params.id));
    res.json({ enrollments });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

export default router;
