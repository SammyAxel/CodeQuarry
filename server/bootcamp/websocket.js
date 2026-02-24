/**
 * WebSocket Server for Bootcamp Live Interactions
 * Handles real-time communication between instructor and students:
 * - Interaction triggers (quiz, code editor, poll)
 * - Chat messages
 * - Session status updates
 * - Participant presence
 */

import { WebSocketServer } from 'ws';
import db from '../../database/index.js';

// Room -> Set of connected clients
const rooms = new Map();

// ─── Constants ──────────────────────────────
const MAX_CHAT_LENGTH = 2000; // Max characters per chat message
const CHAT_RATE_WINDOW = 10_000; // 10 seconds
const CHAT_RATE_MAX = 15; // Max messages per window

/**
 * Initialize WebSocket server on existing HTTP server
 */
export function initBootcampWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws/bootcamp' });

  wss.on('connection', async (ws, req) => {
    // Parse query params from URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    const sessionId = url.searchParams.get('sessionId');
    const token = url.searchParams.get('token');

    if (!sessionId || !token) {
      ws.close(4000, 'Missing sessionId or token');
      return;
    }

    // ── Server-side auth: verify token against DB ──
    let userSession;
    try {
      userSession = await db.findSession(token);
    } catch (_) { /* DB error */ }

    if (!userSession) {
      ws.close(4001, 'Invalid or expired session');
      return;
    }

    const userId = String(userSession.user_id);
    const username = userSession.display_name || userSession.username;
    const role = userSession.role === 'admin' ? 'admin' : 'student';

    // Attach metadata to the socket
    ws.sessionId = sessionId;
    ws.userId = userId;
    ws.username = username;
    ws.role = role;
    ws.isAlive = true;
    ws._chatTimestamps = []; // for rate-limiting

    // Add to room
    if (!rooms.has(sessionId)) {
      rooms.set(sessionId, new Set());
    }
    rooms.get(sessionId).add(ws);

    // Notify room about new participant
    broadcastToRoom(sessionId, {
      type: 'participant_joined',
      userId,
      username,
      role,
      timestamp: Date.now()
    }, ws);

    // Send current participant list to the new joiner
    const participants = getParticipants(sessionId);
    ws.send(JSON.stringify({
      type: 'participants_list',
      participants,
      timestamp: Date.now()
    }));

    // Handle incoming messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        handleMessage(ws, message);
      } catch (err) {
        console.error('Invalid WS message:', err);
      }
    });

    // Handle pong for heartbeat
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Handle disconnect
    ws.on('close', () => {
      const room = rooms.get(sessionId);
      if (room) {
        room.delete(ws);
        if (room.size === 0) {
          rooms.delete(sessionId);
        } else {
          broadcastToRoom(sessionId, {
            type: 'participant_left',
            userId,
            username,
            timestamp: Date.now()
          });
        }
      }
    });
  });

  // Heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeat);
  });

  console.log('✅ Bootcamp WebSocket server initialized at /ws/bootcamp');
  return wss;
}

/**
 * Handle different message types
 */
function handleMessage(ws, message) {
  const { type } = message;

  switch (type) {
    // Chat message from any participant
    case 'chat': {
      // ── Validate length ──
      const text = typeof message.text === 'string' ? message.text.trim() : '';
      if (!text || text.length > MAX_CHAT_LENGTH) return;

      // ── Rate-limit: max N messages per window ──
      const now = Date.now();
      ws._chatTimestamps = (ws._chatTimestamps || []).filter(t => now - t < CHAT_RATE_WINDOW);
      if (ws._chatTimestamps.length >= CHAT_RATE_MAX) return; // silently drop
      ws._chatTimestamps.push(now);

      broadcastToRoom(ws.sessionId, {
        type: 'chat',
        userId: ws.userId,
        username: ws.username,
        role: ws.role,
        text,
        timestamp: now
      });
      break;
    }

    // Admin triggers an interaction (quiz/code/poll)
    case 'trigger_interaction':
      if (ws.role !== 'admin') return;
      broadcastToRoom(ws.sessionId, {
        type: 'interaction_triggered',
        interaction: message.interaction,
        timestamp: Date.now()
      });
      break;

    // Admin closes an interaction
    case 'close_interaction':
      if (ws.role !== 'admin') return;
      broadcastToRoom(ws.sessionId, {
        type: 'interaction_closed',
        interactionId: message.interactionId,
        timestamp: Date.now()
      });
      break;

    // Student submits a response
    case 'submit_response':
      // Send to admins only
      broadcastToAdmins(ws.sessionId, {
        type: 'response_received',
        userId: ws.userId,
        username: ws.username,
        interactionId: message.interactionId,
        response: message.response,
        timestamp: Date.now()
      });
      break;

    // Admin updates session status
    case 'session_status':
      if (ws.role !== 'admin') return;
      broadcastToRoom(ws.sessionId, {
        type: 'session_status',
        status: message.status,
        timestamp: Date.now()
      });
      break;

    // Typing indicator for chat
    case 'typing':
      broadcastToRoom(ws.sessionId, {
        type: 'typing',
        userId: ws.userId,
        username: ws.username,
        timestamp: Date.now()
      }, ws); // exclude sender
      break;

    default:
      break;
  }
}

/**
 * Broadcast a message to all clients in a room, optionally excluding sender
 */
function broadcastToRoom(sessionId, message, excludeWs = null) {
  const room = rooms.get(sessionId);
  if (!room) return;

  const data = JSON.stringify(message);
  room.forEach((client) => {
    if (client !== excludeWs && client.readyState === 1) {
      client.send(data);
    }
  });
}

/**
 * Broadcast a message to admins only in a room
 */
function broadcastToAdmins(sessionId, message) {
  const room = rooms.get(sessionId);
  if (!room) return;

  const data = JSON.stringify(message);
  room.forEach((client) => {
    if (client.role === 'admin' && client.readyState === 1) {
      client.send(data);
    }
  });
}

/**
 * Get participant list for a room
 */
function getParticipants(sessionId) {
  const room = rooms.get(sessionId);
  if (!room) return [];

  return Array.from(room).map((ws) => ({
    userId: ws.userId,
    username: ws.username,
    role: ws.role
  }));
}

/**
 * Get count of participants in a room (used by REST API)
 */
export function getRoomParticipantCount(sessionId) {
  const room = rooms.get(String(sessionId));
  return room ? room.size : 0;
}
