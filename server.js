import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Load environment variables FIRST before importing database
dotenv.config();

// Now import database after env vars are loaded
import db from './database.js';
import { getAllCosmetics, getRarityInfo, getCosmeticById } from './src/data/cosmetics.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const API_ENDPOINT = process.env.API_ENDPOINT || 'https://emkc.org/api/v2/piston/execute';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:4000';
const NODE_ENV = process.env.NODE_ENV || 'development';

// ⚠️ SECURITY: Admin passwords MUST be in environment variables (.env or Cloudflare)
// NEVER hardcode or expose to frontend via VITE_ prefix
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const MOD_PASSWORD = process.env.MOD_PASSWORD;

// Ensure passwords are configured
if (!ADMIN_PASSWORD || !MOD_PASSWORD) {
  console.error('❌ ERROR: ADMIN_PASSWORD and MOD_PASSWORD must be set in environment variables (.env file or Cloudflare)');
  process.exit(1);
}

console.log('✅ Authentication passwords loaded from environment');

// In-memory session store (use Redis for production)
const sessions = new Map();

/**
 * Constant-time password comparison to prevent timing attacks
 */
const constantTimeCompare = (a, b) => {
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
const generateSessionToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/**
 * POST /api/auth/login
 * Authenticate admin/mod with password
 * Returns session token to be used for subsequent requests
 */
app.post('/api/auth/login', (req, res) => {
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
app.post('/api/auth/logout', (req, res) => {
  const token = req.headers['x-session-token'];
  if (token) {
    sessions.delete(token);
  }
  res.json({ success: true });
});

/**
 * Middleware to verify session token
 */
const verifySession = (req, res, next) => {
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
 * Middleware to verify admin role
 */
const requireAdmin = (req, res, next) => {
  if (req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * Health check endpoint for monitoring
 * GET /api/health
 * Returns server status and backend connectivity
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

/**
 * POST /api/v1/compile-c
 * Compiles and runs C code using Piston API (free, unlimited)
 * @param {string} code - C source code to compile
 * @returns {Object} { output: string } or error
 */
app.post('/api/v1/compile-c', async (req, res) => {
  let code = req.body.code;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  // Handle escaped characters from JSON serialization
  if (typeof code === 'string') {
    code = code
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }

  console.log(`[${new Date().toISOString()}] Compiling C code...`);

  try {
    // Use Piston API - free, no auth needed, reliable
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'c',
        version: '10.2.0',
        files: [
          {
            name: 'main.c',
            content: code
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Piston API error: ${response.status}`);
    }

    const result = await response.json();

    console.log(`[${new Date().toISOString()}] Compilation successful`);

    // Piston returns output in different format
    let output = '';
    if (result.run && result.run.output) {
      output = result.run.output;
    } else if (result.compile && result.compile.output) {
      throw new Error(`Compilation error: ${result.compile.output}`);
    } else if (result.run && result.run.stderr) {
      throw new Error(`Runtime error: ${result.run.stderr}`);
    }

    res.json({ output: output || '' });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Compilation error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Fallback for v0 (backward compatibility)
app.post('/api/compile-c', (req, res) => {
  console.warn('[DEPRECATED] Using /api/compile-c. Please use /api/v1/compile-c instead.');
  // Forward to v1 endpoint
  req.url = '/api/v1/compile-c';
  app(req, res);
});

// ============================================
// USER AUTHENTICATION ENDPOINTS
// ============================================

/**
 * POST /api/user/register
 * Register a new user account
 */
app.post('/api/user/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  // Validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }
  
  // Username validation
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: 'Username must be 3-20 characters' });
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  // Password validation
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  // Check if username/email already exists
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
app.post('/api/user/login', async (req, res) => {
  const { identifier, password } = req.body;
  
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username/email and password are required' });
  }
  
  const user = await db.findUser(identifier);
  
  if (!user) {
    // Delay to prevent timing attacks
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
app.post('/api/user/logout', async (req, res) => {
  const token = req.headers['x-user-token'];
  if (token) {
    await db.deleteSession(token);
  }
  res.json({ success: true });
});

/**
 * Middleware to verify user session
 */
const verifyUserSession = async (req, res, next) => {
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
    displayName: session.display_name
  };
  req.userToken = token;
  
  next();
};

/**
 * GET /api/user/me
 * Get current user info
 */
app.get('/api/user/me', verifyUserSession, async (req, res) => {
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
app.put('/api/user/profile', verifyUserSession, async (req, res) => {
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
app.put('/api/user/password', verifyUserSession, async (req, res) => {
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

// ============================================
// PROGRESS TRACKING ENDPOINTS
// ============================================

/**
 * GET /api/progress
 * Get all progress for current user
 */
app.get('/api/progress', verifyUserSession, async (req, res) => {
  const progress = await db.getUserProgress(req.user.id);
  const completedModules = await db.getCompletedModuleIds(req.user.id);
  
  res.json({
    progress,
    completedModules
  });
});

/**
 * GET /api/progress/:courseId
 * Get progress for a specific course
 */
app.get('/api/progress/:courseId', verifyUserSession, async (req, res) => {
  const { courseId } = req.params;
  const progress = await db.getCourseProgress(req.user.id, courseId);
  
  res.json(progress);
});

/**
 * POST /api/progress/module
 * Save module progress
 */
app.post('/api/progress/module', verifyUserSession, async (req, res) => {
  const { courseId, moduleId, savedCode, hintsUsed, timeSpentSeconds, completed } = req.body;
  
  if (!courseId || !moduleId) {
    return res.status(400).json({ error: 'courseId and moduleId are required' });
  }
  
  await db.saveModuleProgress(req.user.id, courseId, moduleId, {
    savedCode,
    hintsUsed,
    timeSpentSeconds,
    completed
  });
  
  res.json({ success: true });
});

// NOTE: POST /api/progress/step removed - step tracking simplified to module level

/**
 * GET /api/progress/code/:courseId/:moduleId
 * Get saved code for a module
 */
app.get('/api/progress/code/:courseId/:moduleId', verifyUserSession, async (req, res) => {
  const { courseId, moduleId } = req.params;
  const savedCode = await db.getSavedCode(req.user.id, courseId, moduleId);
  
  res.json({ savedCode });
});

/**
 * GET /api/user/stats
 * Get user stats for dashboard
 */
app.get('/api/user/stats', verifyUserSession, async (req, res) => {
  const stats = await db.getUserStats(req.user.id);
  res.json(stats);
});

// ============================================
// COURSE FILE MANAGEMENT ENDPOINTS (Admin Only)
// ============================================

const COURSES_DIR = path.join(__dirname, 'src', 'data');

/**
 * GET /api/admin/courses
 * Lists all course files in src/data/
 * Requires: valid session token + admin role
 */
app.get('/api/admin/courses', verifySession, requireAdmin, (req, res) => {
  try {
    const files = fs.readdirSync(COURSES_DIR)
      .filter(f => f.endsWith('.jsx') && f !== 'courses.jsx');
    res.json({ courses: files });
  } catch (err) {
    console.error('Error listing courses:', err);
    res.status(500).json({ error: 'Failed to list courses' });
  }
});

/**
 * POST /api/admin/courses/:courseId
 * Creates or updates a course file
 * Requires: valid session token + admin role
 * @param {Object} course - The course object to save
 */
app.post('/api/admin/courses/:courseId', verifySession, requireAdmin, (req, res) => {
  const { courseId } = req.params;
  const { course } = req.body;
  
  if (!course) {
    return res.status(400).json({ error: 'No course data provided' });
  }
  
  // Sanitize courseId to prevent path traversal
  const sanitizedId = courseId.replace(/[^a-zA-Z0-9-_]/g, '');
  if (sanitizedId !== courseId) {
    return res.status(400).json({ error: 'Invalid course ID' });
  }
  
  const filePath = path.join(COURSES_DIR, `${sanitizedId}.jsx`);
  
  try {
    // Read courses.jsx to check for existing export names
    const coursesFilePath = path.join(COURSES_DIR, 'courses.jsx');
    let coursesContent = '';
    if (fs.existsSync(coursesFilePath)) {
      coursesContent = fs.readFileSync(coursesFilePath, 'utf8');
    }
    
    // Generate the JSX file content
    const fileContent = generateCourseFileContent(course, sanitizedId, coursesContent);
    
    // Write the file
    fs.writeFileSync(filePath, fileContent, 'utf8');
    
    console.log(`[${new Date().toISOString()}] Saved course: ${sanitizedId}`);
    res.json({ success: true, message: `Course ${sanitizedId} saved successfully` });
  } catch (err) {
    console.error('Error saving course:', err);
    res.status(500).json({ error: 'Failed to save course: ' + err.message });
  }
});

/**
 * DELETE /api/admin/courses/:courseId
 * Deletes a course file (custom courses only, not built-in)
 * Requires: valid session token + admin role
 */
app.delete('/api/admin/courses/:courseId', verifySession, requireAdmin, (req, res) => {
  const { courseId } = req.params;
  
  // Protect built-in courses
  const protectedCourses = ['py-101', 'js-101', 'c-101'];
  if (protectedCourses.includes(courseId)) {
    return res.status(403).json({ error: 'Cannot delete built-in courses' });
  }
  
  const sanitizedId = courseId.replace(/[^a-zA-Z0-9-_]/g, '');
  const filePath = path.join(COURSES_DIR, `${sanitizedId}.jsx`);
  
  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    fs.unlinkSync(filePath);
    console.log(`[${new Date().toISOString()}] Deleted course: ${sanitizedId}`);
    res.json({ success: true, message: `Course ${sanitizedId} deleted` });
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

/**
 * PUT /api/admin/courses/:courseId/update
 * Updates courses.jsx to include/exclude a course
 * Requires: valid session token + admin role
 */
app.put('/api/admin/courses/:courseId/update', verifySession, requireAdmin, (req, res) => {
  const { courseId } = req.params;
  const { action } = req.body; // 'add' or 'remove'
  
  const coursesFilePath = path.join(COURSES_DIR, 'courses.jsx');
  
  try {
    let content = fs.readFileSync(coursesFilePath, 'utf8');
    const sanitizedId = courseId.replace(/[^a-zA-Z0-9-_]/g, '');
    
    // Check if course already exists in courses.jsx and extract existing export name
    let importName = null;
    const existingImportMatch = content.match(new RegExp(`import\\s*\\{\\s*(\\w+)\\s*\\}\\s*from\\s*['\"]\\./\\$\\{sanitizedId\\}\\.jsx['\"]`));
    if (existingImportMatch) {
      importName = existingImportMatch[1];
    } else {
      // Generate new export name: courseId -> courseIdCourse format (e.g., rust-101 -> rust101Course)
      importName = sanitizedId.replace(/-/g, '') + 'Course';
    }
    
    const varName = importName;
    
    if (action === 'add') {
      // Add import if not exists
      const importLine = `import { ${importName} } from './${sanitizedId}.jsx';`;
      if (!content.includes(importLine)) {
        // Add after the last import
        const lastImportIndex = content.lastIndexOf("import {");
        const lineEnd = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, lineEnd + 1) + importLine + '\n' + content.slice(lineEnd + 1);
      }
      
      // Add to COURSES array if not exists
      if (!content.includes(importName)) {
        content = content.replace(
          /export const COURSES = \[/,
          `export const COURSES = [\n  ${importName},`
        );
      }
    }
    
    fs.writeFileSync(coursesFilePath, content, 'utf8');
    res.json({ success: true, message: `courses.jsx updated` });
  } catch (err) {
    console.error('Error updating courses.jsx:', err);
    res.status(500).json({ error: 'Failed to update courses.jsx' });
  }
});

/**
 * Helper function to generate course file content
 */
function generateCourseFileContent(course, courseId, coursesContent = '') {
  // Convert course object to JSX file format
  // Check if course already exists in courses.jsx and extract existing export name
  let varName = null;
  const existingImportMatch = coursesContent.match(new RegExp(`import\\s*\\{\\s*(\\w+)\\s*\\}\\s*from\\s*['\"]\\./\\$\\{courseId\\}\\.jsx['\"]`));
  if (existingImportMatch) {
    varName = existingImportMatch[1];
  } else {
    // Generate new export name: courseId -> courseIdCourse format (e.g., rust-101 -> rust101Course)
    varName = courseId.replace(/-/g, '') + 'Course';
  }
  
  // Deep clone and prepare course for serialization
  const serializableCourse = JSON.parse(JSON.stringify(course));
  
  // Remove any React elements (icon) - they'll be regenerated
  delete serializableCourse.icon;
  
  // Convert modules
  const modulesStr = serializableCourse.modules.map(mod => {
    let modStr = '    {\n';
    for (const [key, value] of Object.entries(mod)) {
      if (key === 'requiredSyntax' || key === 'stepSyntax') {
        // Skip legacy regex fields
        continue;
      }
      modStr += `      ${key}: ${formatValue(value, key)},\n`;
    }
    modStr += '    }';
    return modStr;
  }).join(',\n');

  // Determine icon based on course
  let iconImport = 'Code2';
  let iconColor = 'text-blue-400';
  if (courseId.includes('py')) {
    iconColor = 'text-blue-400';
  } else if (courseId.includes('js')) {
    iconColor = 'text-yellow-400';
  } else if (courseId.includes('c-')) {
    iconImport = 'Terminal';
    iconColor = 'text-cyan-400';
  }
  
  return `import React from 'react';
import { ${iconImport} } from 'lucide-react';

export const ${varName} = {
  id: '${courseId}',
  title: ${formatValue(serializableCourse.title)},
  description: ${formatValue(serializableCourse.description)},
  icon: <${iconImport} className="w-8 h-8 ${iconColor}" />,
  level: ${formatValue(serializableCourse.level || 'Copper')},
  modules: [
${modulesStr}
  ]
};
`;
}

/**
 * Helper to format values for JSX output
 */
function formatValue(value, key = '') {
  if (value === null || value === undefined) {
    return 'null';
  }
  if (typeof value === 'string') {
    // Use template literals for multiline strings, long strings, and data URLs
    if (value.includes('\n') || value.includes('`') || value.includes('data:image') || value.length > 500) {
      // Escape backticks and ${
      const escaped = value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
      return '`' + escaped + '`';
    }
    return JSON.stringify(value);
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map(v => formatValue(v));
    if (items.join(', ').length < 60) {
      return '[' + items.join(', ') + ']';
    }
    return '[\n        ' + items.join(',\n        ') + '\n      ]';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2).replace(/\n/g, '\n      ');
  }
  return JSON.stringify(value);
}

// ============================================
// COURSE TRANSLATION ENDPOINTS
// ============================================

/**
 * POST /api/translations/save
 * Save course translation (admin only)
 */
app.post('/api/translations/save', verifyUserSession, async (req, res) => {
  // Check if user is admin
  const fullUser = await db.getUserById(req.user.id);
  if (fullUser.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { courseId, language, translation } = req.body;
  
  if (!courseId || !language || !translation) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  db.saveCourseTranslation(courseId, language, translation)
    .then(result => {
      res.json({ success: true, translation: result });
    })
    .catch(error => {
      console.error('Error saving translation:', error);
      res.status(500).json({ error: 'Failed to save translation' });
    });
});

/**
 * GET /api/translations/:courseId/:language
 * Get translation for a specific course and language
 */
app.get('/api/translations/:courseId/:language', (req, res) => {
  const { courseId, language } = req.params;
  
  db.getCourseTranslation(courseId, language)
    .then(translation => {
      if (!translation) {
        return res.status(404).json({ error: 'Translation not found' });
      }
      res.json(translation);
    })
    .catch(error => {
      console.error('Error fetching translation:', error);
      res.status(500).json({ error: 'Failed to fetch translation' });
    });
});

/**
 * GET /api/translations/all
 * Get all translations for all courses
 */
app.get('/api/translations/all', async (req, res) => {
  try {
    // Get all unique course IDs from database
    const result = await db.pool.query('SELECT DISTINCT course_id FROM course_translations');
    const courseIds = result.rows.map(r => r.course_id);
    
    // Fetch translations for each course
    const allTranslations = {};
    for (const courseId of courseIds) {
      allTranslations[courseId] = await db.getAllCourseTranslations(courseId);
    }
    
    res.json(allTranslations);
  } catch (error) {
    console.error('Error fetching all translations:', error);
    res.status(500).json({ error: 'Failed to fetch translations' });
  }
});

/**
 * GET /api/translations/:courseId
 * Get all translations for a course
 */
app.get('/api/translations/:courseId', (req, res) => {
  const { courseId } = req.params;
  
  db.getAllCourseTranslations(courseId)
    .then(translations => {
      res.json(translations);
    })
    .catch(error => {
      console.error('Error fetching translations:', error);
      res.status(500).json({ error: 'Failed to fetch translations' });
    });
});

/**
 * GET /api/translations/:courseId/languages
 * Get available languages for a course
 */
app.get('/api/translations/:courseId/languages', (req, res) => {
  const { courseId } = req.params;
  
  db.getCourseLanguages(courseId)
    .then(languages => {
      res.json({ languages });
    })
    .catch(error => {
      console.error('Error fetching languages:', error);
      res.status(500).json({ error: 'Failed to fetch languages' });
    });
});

/**
 * DELETE /api/translations/:courseId/:language
 * Delete a course translation (admin only)
 */
app.delete('/api/translations/:courseId/:language', verifyUserSession, async (req, res) => {
  // Check if user is admin
  const fullUser = await db.getUserById(req.user.id);
  if (fullUser.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { courseId, language } = req.params;
  
  db.deleteCourseTranslation(courseId, language)
    .then(() => {
      res.json({ success: true });
    })
    .catch(error => {
      console.error('Error deleting translation:', error);
      res.status(500).json({ error: 'Failed to delete translation' });
    });
});

// ============================================
// ADMIN USER MANAGEMENT ENDPOINTS
// ============================================

/**
 * GET /api/admin/users
 * Get all users (admin only)
 */
app.get('/api/admin/users', verifyUserSession, async (req, res) => {
  try {
    const fullUser = await db.getUserById(req.user.id);
    if (fullUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const users = await db.getAllUsers();
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/admin/users/:id
 * Get specific user by ID (admin only)
 */
app.get('/api/admin/users/:id', verifyUserSession, async (req, res) => {
  try {
    const fullUser = await db.getUserById(req.user.id);
    if (fullUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const user = await db.getUserById(parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user (admin only)
 */
app.delete('/api/admin/users/:id', verifyUserSession, async (req, res) => {
  try {
    const fullUser = await db.getUserById(req.user.id);
    if (fullUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const userId = parseInt(req.params.id);
    
    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await db.deleteUser(userId);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

/**
 * PATCH /api/admin/users/:id/role
 * Update user role (admin only)
 */
app.patch('/api/admin/users/:id/role', verifyUserSession, async (req, res) => {
  try {
    const fullUser = await db.getUserById(req.user.id);
    if (fullUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const userId = parseInt(req.params.id);
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
    }

    // Prevent admin from changing their own role
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    await db.updateUserRole(userId, role);
    res.json({ success: true, message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

/**
 * POST /api/admin/courses/:courseId/reset-progress
 * Reset all student progress for a course (use when updating course structure)
 */
app.post('/api/admin/courses/:courseId/reset-progress', verifySession, requireAdmin, async (req, res) => {
  try {
    const { courseId } = req.params;
    await db.resetCourseProgress(courseId);
    res.json({ success: true, message: `Progress reset for course ${courseId}` });
  } catch (error) {
    console.error('Error resetting course progress:', error);
    res.status(500).json({ error: 'Failed to reset course progress' });
  }
});

/**
 * POST /api/admin/users/:userId/reset-progress
 * Reset all progress for a specific user
 */
app.post('/api/admin/users/:userId/reset-progress', verifySession, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    await db.resetUserProgress(userId);
    res.json({ success: true, message: `All progress reset for user ${userId}` });
  } catch (error) {
    console.error('Error resetting user progress:', error);
    res.status(500).json({ error: 'Failed to reset user progress' });
  }
});

/**
 * POST /api/admin/users/:userId/reset-course/:courseId
 * Reset progress for a specific user in a specific course
 */
app.post('/api/admin/users/:userId/reset-course/:courseId', verifySession, requireAdmin, async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    await db.resetUserCourseProgress(userId, courseId);
    res.json({ success: true, message: `Progress reset for user ${userId} in course ${courseId}` });
  } catch (error) {
    console.error('Error resetting user course progress:', error);
    res.status(500).json({ error: 'Failed to reset user course progress' });
  }
});

/**
 * PATCH /api/admin/users/:userId/gems
 * Update user's gem balance (admin only)
 */
app.patch('/api/admin/users/:userId/gems', verifyUserSession, async (req, res) => {
  try {
    const fullUser = await db.getUserById(req.user.id);
    if (fullUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;
    const { amount } = req.body;

    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({ error: 'Amount must be a non-negative number' });
    }

    const newBalance = await db.setUserGems(userId, amount);
    res.json({ 
      success: true, 
      message: `Updated gems for user ${userId}`,
      newBalance 
    });
  } catch (error) {
    console.error('Error updating user gems:', error);
    res.status(500).json({ error: 'Failed to update user gems' });
  }
});

// ============================================
// GEM SYSTEM ENDPOINTS
// ============================================

/**
 * GET /api/user/gems
 * Get current user's gem balance
 */
app.get('/api/user/gems', verifyUserSession, async (req, res) => {
  try {
    const gems = await db.getUserGems(req.user.id);
    res.json({ gems });
  } catch (error) {
    console.error('Error fetching gems:', error);
    res.status(500).json({ error: 'Failed to fetch gems' });
  }
});

/**
 * POST /api/user/gems/award
 * Award gems for completing a module (called by frontend)
 */
app.post('/api/user/gems/award', verifySession, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid gem amount' });
    }
    
    await db.awardGems(req.user.id, amount, reason || 'module_completion');
    const totalGems = await db.getUserGems(req.user.id);
    
    res.json({ success: true, gemsAwarded: amount, totalGems });
  } catch (error) {
    console.error('Error awarding gems:', error);
    res.status(500).json({ error: 'Failed to award gems' });
  }
});

// ============================================
// REFINERY PROGRESS ENDPOINTS
// ============================================

/**
 * GET /api/user/refinery/:courseId/:moduleId
 * Get refinery progress for a specific module
 */
app.get('/api/user/refinery/:courseId/:moduleId', verifySession, async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const progress = await db.getRefineryProgress(req.user.id, courseId, moduleId);
    res.json(progress || { best_score: 0, best_rank: null });
  } catch (error) {
    console.error('Error fetching refinery progress:', error);
    res.status(500).json({ error: 'Failed to fetch refinery progress' });
  }
});

/**
 * POST /api/user/refinery/save
 * Save refinery progress and award gems
 */
app.post('/api/user/refinery/save', verifySession, async (req, res) => {
  try {
    const { courseId, moduleId, score, rank, metrics, gemsEarned } = req.body;
    
    if (!courseId || !moduleId || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const progress = await db.saveRefineryProgress(req.user.id, courseId, moduleId, {
      score,
      rank,
      metrics,
      gemsEarned: gemsEarned || 0
    });
    
    const totalGems = await db.getUserGems(req.user.id);
    
    res.json({ 
      success: true, 
      progress,
      totalGems,
      gemsEarned: gemsEarned || 0
    });
  } catch (error) {
    console.error('Error saving refinery progress:', error);
    res.status(500).json({ error: 'Failed to save refinery progress' });
  }
});

/**
 * GET /api/user/refinery/all
 * Get all refinery achievements for current user
 */
app.get('/api/user/refinery/all', verifySession, async (req, res) => {
  try {
    const progress = await db.getAllRefineryProgress(req.user.id);
    res.json(progress);
  } catch (error) {
    console.error('Error fetching all refinery progress:', error);
    res.status(500).json({ error: 'Failed to fetch refinery progress' });
  }
});

// ============================================
// DATABASE COURSE API (New - replaces file-based)
// ============================================

/**
 * GET /api/courses
 * Get all published courses (public) or all courses (admin)
 */
app.get('/api/courses', async (req, res) => {
  try {
    const token = req.headers['x-user-token'];
    let isAdmin = false;
    
    if (token) {
      const session = await db.findSession(token);
      if (session) {
        const user = await db.findUserById(session.user_id);
        isAdmin = user?.role === 'admin';
      }
    }
    
    const courses = await db.getAllCourses(!isAdmin);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

/**
 * GET /api/courses/:courseId
 * Get a specific course by ID
 */
app.get('/api/courses/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await db.getCourse(courseId);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Check if course is published or user is admin
    if (!course.isPublished) {
      const token = req.headers['x-user-token'];
      if (token) {
        const session = await db.findSession(token);
        if (session) {
          const user = await db.findUserById(session.user_id);
          if (user?.role !== 'admin') {
            return res.status(404).json({ error: 'Course not found' });
          }
        }
      } else {
        return res.status(404).json({ error: 'Course not found' });
      }
    }
    
    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

/**
 * POST /api/courses
 * Create a new course (admin only)
 */
app.post('/api/courses', verifySession, requireAdmin, async (req, res) => {
  try {
    const courseData = req.body;
    
    if (!courseData.id || !courseData.title) {
      return res.status(400).json({ error: 'Course ID and title are required' });
    }
    
    // Check if course already exists
    const existing = await db.getCourse(courseData.id);
    if (existing) {
      return res.status(409).json({ error: 'Course with this ID already exists' });
    }
    
    courseData.authorId = req.user.id;
    const course = await db.createCourse(courseData);
    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

/**
 * PUT /api/courses/:courseId
 * Update a course (admin only)
 */
app.put('/api/courses/:courseId', verifySession, requireAdmin, async (req, res) => {
  try {
    const { courseId } = req.params;
    const updates = req.body;
    
    const course = await db.updateCourse(courseId, updates);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

/**
 * DELETE /api/courses/:courseId
 * Delete a course (admin only)
 */
app.delete('/api/courses/:courseId/db', verifySession, requireAdmin, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await db.getCourse(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    await db.deleteCourse(courseId);
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

/**
 * POST /api/admin/reseed-courses
 * Force reseed all courses with comprehensive content (admin only)
 */
app.post('/api/admin/reseed-courses', verifySession, requireAdmin, async (req, res) => {
  try {
    const result = await db.reseedCourses();
    res.json(result);
  } catch (error) {
    console.error('Error reseeding courses:', error);
    res.status(500).json({ error: 'Failed to reseed courses' });
  }
});

// ============================================
// COSMETICS SHOP ENDPOINTS
// ============================================

/**
 * GET /api/cosmetics/shop
 * Get full cosmetics catalog (public endpoint)
 */
app.get('/api/cosmetics/shop', (req, res) => {
  try {
    const cosmetics = getAllCosmetics();
    const enriched = cosmetics.map(c => ({
      ...c,
      rarityInfo: getRarityInfo(c.rarity)
    }));
    res.json({ cosmetics: enriched });
  } catch (error) {
    console.error('Error fetching cosmetics catalog:', error);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

/**
 * GET /api/user/cosmetics/inventory
 * Get user's owned cosmetics
 */
app.get('/api/user/cosmetics/inventory', verifyUserSession, async (req, res) => {
  try {
    const inventory = await db.getUserCosmetics(req.user.id);
    res.json({ inventory });
  } catch (error) {
    console.error('Error fetching cosmetics inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

/**
 * GET /api/user/cosmetics/equipped
 * Get user's currently equipped cosmetics
 */
app.get('/api/user/cosmetics/equipped', verifyUserSession, async (req, res) => {
  try {
    const equipped = await db.getEquippedCosmetics(req.user.id);
    res.json({ equipped });
  } catch (error) {
    console.error('Error fetching equipped cosmetics:', error);
    res.status(500).json({ error: 'Failed to fetch equipped items' });
  }
});

/**
 * POST /api/user/cosmetics/purchase
 * Purchase a cosmetic with gems
 * Body: { cosmeticId }
 */
app.post('/api/user/cosmetics/purchase', verifyUserSession, async (req, res) => {
  try {
    const { cosmeticId } = req.body;
    
    if (!cosmeticId) {
      return res.status(400).json({ error: 'cosmeticId is required' });
    }

    // Get cosmetic details
    const cosmetic = getCosmeticById(cosmeticId);
    if (!cosmetic) {
      return res.status(404).json({ error: 'Cosmetic not found' });
    }

    // Don't let them "buy" the default theme
    if (cosmetic.rarity === 'default') {
      return res.status(400).json({ error: 'This item cannot be purchased' });
    }

    // Check user's gem balance
    const userGems = await db.getUserGems(req.user.id);
    if (userGems < cosmetic.cost) {
      return res.status(400).json({ 
        error: 'Not enough gems', 
        required: cosmetic.cost,
        current: userGems
      });
    }

    // Purchase the cosmetic
    const result = await db.purchaseCosmetic(req.user.id, cosmeticId);
    
    // Deduct gems
    await db.deductGems(req.user.id, cosmetic.cost);
    
    const newBalance = await db.getUserGems(req.user.id);

    res.json({ 
      success: true,
      message: `Purchased ${cosmetic.name}!`,
      gemsSpent: cosmetic.cost,
      newBalance
    });
  } catch (error) {
    console.error('Error purchasing cosmetic:', error);
    res.status(500).json({ error: 'Failed to purchase cosmetic' });
  }
});

/**
 * PATCH /api/user/cosmetics/equip
 * Equip a cosmetic item
 * Body: { type, cosmeticId }
 * type can be: 'theme', 'title', 'nameColor'
 */
app.patch('/api/user/cosmetics/equip', verifyUserSession, async (req, res) => {
  try {
    const { type, cosmeticId } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: 'type is required' });
    }

    // Validate type
    if (!['theme', 'title', 'nameColor'].includes(type)) {
      return res.status(400).json({ error: 'Invalid cosmetic type' });
    }

    // If cosmeticId is null, allow unequipping
    let cosmetic = null;
    if (cosmeticId !== null && cosmeticId !== undefined) {
      // Verify user owns this cosmetic (or it's a default)
      cosmetic = getCosmeticById(cosmeticId);
      
      if (!cosmetic) {
        return res.status(404).json({ error: 'Cosmetic not found' });
      }

      if (cosmetic.rarity !== 'default') {
        const userInventory = await db.getUserCosmetics(req.user.id);
        if (!userInventory.includes(cosmeticId)) {
          return res.status(403).json({ error: 'You do not own this cosmetic' });
        }
      }
    }

    // Map type to underscore format for database function
    const typeMap = {
      'theme': 'theme',
      'title': 'title',
      'nameColor': 'name_color'
    };

    // Equip the cosmetic (or unequip if cosmeticId is null)
    await db.equipCosmetic(req.user.id, typeMap[type], cosmeticId);
    
    // Get updated equipped items
    const equipped = await db.getEquippedCosmetics(req.user.id);

    const message = cosmeticId ? `Equipped ${cosmetic.name}!` : `Unequipped ${type}!`;
    res.json({ 
      success: true,
      message,
      equipped
    });
  } catch (error) {
    console.error('Error equipping cosmetic:', error);
    res.status(500).json({ error: 'Failed to equip cosmetic' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ CodeQuarry API server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${NODE_ENV}`);
  console.log(`🔗 CORS Origin: ${CORS_ORIGIN}`);
});