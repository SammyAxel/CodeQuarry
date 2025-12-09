/**
 * Authentication Routes
 * Handles admin/mod login and logout endpoints
 */

import { Router } from 'express';
import { 
  sessions, 
  constantTimeCompare, 
  generateSessionToken 
} from '../middleware/auth.middleware.js';
import { ADMIN_PASSWORD, MOD_PASSWORD } from '../config/constants.js';

const router = Router();

/**
 * POST /api/auth/login
 * Authenticate admin/mod with password
 * Returns session token to be used for subsequent requests
 */
router.post('/login', (req, res) => {
  const { password, role } = req.body;
  
  if (!password || !role) {
    return res.status(400).json({ error: 'Missing password or role' });
  }
  
  if (role !== 'admin' && role !== 'mod') {
    return res.status(400).json({ error: 'Invalid role' });
  }
  
  // Verify password (constant-time comparison)
  const expectedPassword = role === 'admin' ? ADMIN_PASSWORD : MOD_PASSWORD;
  const isValid = constantTimeCompare(password, expectedPassword);
  
  if (!isValid) {
    // Log failed attempt
    console.warn(`[SECURITY] Failed login attempt for role: ${role}`);
    // Delay response to prevent brute force
    setTimeout(() => {
      res.status(401).json({ error: 'Invalid password' });
    }, 1000);
    return;
  }
  
  // Generate session token
  const token = generateSessionToken();
  const expiresAt = Date.now() + (30 * 60 * 1000); // 30 minutes
  
  sessions.set(token, {
    role,
    createdAt: Date.now(),
    expiresAt,
  });
  
  console.log(`[SECURITY] Successful login for role: ${role}`);
  
  res.json({
    success: true,
    token,
    role,
    expiresIn: 30 * 60, // seconds
  });
});

/**
 * POST /api/auth/logout
 * Invalidate session token
 */
router.post('/logout', (req, res) => {
  const token = req.headers['x-session-token'];
  if (token) {
    sessions.delete(token);
  }
  res.json({ success: true });
});

export default router;
