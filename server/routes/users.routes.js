/**
 * User Routes
 * Handles user registration, login, profile management
 */

import { Router } from 'express';
import { verifyUserSession, generateSessionToken } from '../middleware/auth.middleware.js';
import db from '../../database/index.js';

const router = Router();

/**
 * GET /api/user/register/check-username/:username
 * Check if username is available
 */
router.get('/register/check-username/:username', async (req, res) => {
  const { username } = req.params;
  const exists = await db.usernameExists(username);
  res.json({ available: !exists });
});

/**
 * GET /api/user/register/check-email/:email
 * Check if email is available
 */
router.get('/register/check-email/:email', async (req, res) => {
  const { email } = req.params;
  const exists = await db.emailExists(email);
  res.json({ available: !exists });
});

/**
 * POST /api/user/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  if (await db.usernameExists(username)) {
    return res.status(409).json({ error: 'Username already taken' });
  }
  if (await db.emailExists(email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  
  try {
    const user = await db.createUser(username, email, password);
    
    // Generate session token
    const token = generateSessionToken();
    await db.createSession(user.id, token);
    await db.updateLastLogin(user.id);
    
    console.log(`[USER] New user registered: ${username}`);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role: 'user'
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/user/login
 * Login with username/email and password
 */
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username/email and password are required' });
  }
  
  const user = await db.findUser(identifier);
  
  if (!user) {
    setTimeout(() => {
      res.status(401).json({ error: 'Invalid credentials' });
    }, 500);
    return;
  }
  
  if (!db.verifyPassword(password, user.password_hash)) {
    setTimeout(() => {
      res.status(401).json({ error: 'Invalid credentials' });
    }, 500);
    return;
  }
  
  // Generate session token
  const token = generateSessionToken();
  await db.createSession(user.id, token);
  await db.updateLastLogin(user.id);
  
  console.log(`[USER] User logged in: ${user.username}`);
  
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      role: user.role || 'user'
    }
  });
});

/**
 * POST /api/user/logout
 * Logout user and invalidate session
 */
router.post('/logout', async (req, res) => {
  const token = req.headers['x-user-token'];
  if (token) {
    await db.deleteSession(token);
  }
  res.json({ success: true });
});

/**
 * GET /api/user/me
 * Get current user info
 */
router.get('/me', verifyUserSession, async (req, res) => {
  const user = await db.findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const stats = await db.getUserStats(req.user.id);
  
  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      role: user.role,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at
    },
    stats
  });
});

/**
 * PUT /api/user/profile
 * Update user profile
 */
router.put('/profile', verifyUserSession, async (req, res) => {
  const { displayName, avatarUrl } = req.body;
  
  const updated = await db.updateUserProfile(req.user.id, { displayName, avatarUrl });
  
  if (updated) {
    res.json({ success: true, user: updated });
  } else {
    res.status(400).json({ error: 'No valid updates provided' });
  }
});

/**
 * PUT /api/user/password
 * Change user password
 */
router.put('/password', verifyUserSession, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }
  
  const user = await db.findUserById(req.user.id);
  const fullUser = await db.findUser(user.username);
  
  if (!db.verifyPassword(currentPassword, fullUser.password_hash)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  
  await db.changePassword(req.user.id, newPassword);
  
  // Invalidate all other sessions
  await db.deleteAllUserSessions(req.user.id);
  
  // Create new session for current device
  const token = generateSessionToken();
  await db.createSession(req.user.id, token);
  
  res.json({ success: true, token });
});

export default router;
