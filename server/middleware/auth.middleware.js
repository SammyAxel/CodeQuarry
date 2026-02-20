/**
 * Authentication Middleware
 * Handles session verification for both admin and user sessions
 */

import crypto from 'crypto';
import db from '../../database/index.js';
import { ADMIN_PASSWORD, MOD_PASSWORD } from '../config/constants.js';

// In-memory session store (use Redis for production)
export const sessions = new Map();

/**
 * Constant-time password comparison to prevent timing attacks
 */
export const constantTimeCompare = (a, b) => {
  if (!a || !b) return false;
  const aLen = a.length;
  const bLen = b.length;
  let result = aLen === bLen ? 0 : 1;
  const maxLen = Math.max(aLen, bLen);
  for (let i = 0; i < maxLen; i++) {
    const aChar = i < aLen ? a.charCodeAt(i) : 0;
    const bChar = i < bLen ? b.charCodeAt(i) : 0;
    result |= aChar ^ bChar;
  }
  return result === 0;
};

/**
 * Generate secure session token
 */
export const generateSessionToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Middleware to verify admin/mod session token
 */
export const verifySession = (req, res, next) => {
  const token = req.headers['x-session-token'];
  
  if (!token) {
    return res.status(401).json({ error: 'Missing session token' });
  }
  
  const session = sessions.get(token);
  
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
  
  // Check expiration
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Session expired' });
  }
  
  // Attach session info to request
  req.session = session;
  req.sessionToken = token;
  
  next();
};

/**
 * Middleware to verify user session from database
 */
export const verifyUserSession = async (req, res, next) => {
  const token = req.headers['x-user-token'];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const session = await db.findSession(token);
  
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  
  // Attach user info to request
  req.user = {
    id: session.user_id,
    username: session.username,
    email: session.email,
    displayName: session.display_name,
    role: session.role
  };
  req.userToken = token;
  
  next();
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = (req, res, next) => {
  if (req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * Helper function to validate admin login
 */
export const validateAdminLogin = (password, role) => {
  if (role !== 'admin' && role !== 'mod') {
    return { valid: false, error: 'Invalid role' };
  }
  
  const expectedPassword = role === 'admin' ? ADMIN_PASSWORD : MOD_PASSWORD;
  const isValid = constantTimeCompare(password, expectedPassword);
  
  if (!isValid) {
    console.warn(`[SECURITY] Failed login attempt for role: ${role}`);
    return { valid: false, error: 'Invalid password' };
  }
  
  console.log(`[SECURITY] Successful login for role: ${role}`);
  return { valid: true };
};
