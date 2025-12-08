/**
 * Database Module for CodeQuarry - PostgreSQL Version
 * Uses PostgreSQL for user management, authentication, and progress tracking
 */

import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Connected to PostgreSQL database');
  }
});

/**
 * Initialize database tables
 */
const initDatabase = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        display_name TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);

    // User sessions table (for persistent login)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Course progress table
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        course_id TEXT NOT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        UNIQUE(user_id, course_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Module progress table
    await client.query(`
      CREATE TABLE IF NOT EXISTS module_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        course_id TEXT NOT NULL,
        module_id TEXT NOT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        saved_code TEXT,
        hints_used INTEGER DEFAULT 0,
        time_spent_seconds INTEGER DEFAULT 0,
        UNIQUE(user_id, course_id, module_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Step progress table (granular tracking)
    await client.query(`
      CREATE TABLE IF NOT EXISTS step_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        course_id TEXT NOT NULL,
        module_id TEXT NOT NULL,
        step_index INTEGER NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        hints_used INTEGER DEFAULT 0,
        code_snapshot TEXT,
        UNIQUE(user_id, course_id, module_id, step_index),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // User stats table (aggregated for dashboard)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        user_id INTEGER PRIMARY KEY,
        total_modules_completed INTEGER DEFAULT 0,
        total_courses_completed INTEGER DEFAULT 0,
        total_steps_completed INTEGER DEFAULT 0,
        total_time_spent_seconds INTEGER DEFAULT 0,
        current_streak_days INTEGER DEFAULT 0,
        longest_streak_days INTEGER DEFAULT 0,
        last_activity_date DATE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Activity log table (for streaks and activity tracking)
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        activity_type TEXT NOT NULL,
        course_id TEXT,
        module_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Course translations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_translations (
        id SERIAL PRIMARY KEY,
        course_id TEXT NOT NULL,
        language TEXT NOT NULL,
        translation_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(course_id, language)
      )
    `);

    await client.query('COMMIT');
    console.log('✅ Database tables initialized');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Initialize on module load
initDatabase().catch(console.error);

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * Create a new user
 * @param {string} username 
 * @param {string} email 
 * @param {string} password 
 * @returns {Object} Created user (without password)
 */
export const createUser = async (username, email, password) => {
  const passwordHash = bcrypt.hashSync(password, 10);
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const result = await client.query(
      `INSERT INTO users (username, email, password_hash, display_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, display_name, created_at`,
      [username, email.toLowerCase(), passwordHash, username]
    );
    
    const user = result.rows[0];
    
    // Initialize user stats
    await client.query('INSERT INTO user_stats (user_id) VALUES ($1)', [user.id]);
    
    await client.query('COMMIT');
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
      createdAt: user.created_at
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Find user by username or email
 * @param {string} identifier - Username or email
 * @returns {Object|null} User object or null
 */
export const findUser = async (identifier) => {
  const result = await pool.query(
    `SELECT id, username, email, password_hash, display_name, avatar_url, created_at, last_login_at
     FROM users 
     WHERE (username = $1 OR email = $2) AND is_active = true`,
    [identifier, identifier.toLowerCase()]
  );
  return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {number} id 
 * @returns {Object|null}
 */
export const findUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, username, email, display_name, avatar_url, created_at, last_login_at
     FROM users 
     WHERE id = $1 AND is_active = true`,
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Verify user password
 * @param {string} password 
 * @param {string} hash 
 * @returns {boolean}
 */
export const verifyPassword = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};

/**
 * Update user's last login time
 * @param {number} userId 
 */
export const updateLastLogin = async (userId) => {
  await pool.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
};

/**
 * Update user profile
 * @param {number} userId 
 * @param {Object} updates 
 */
export const updateUserProfile = async (userId, updates) => {
  const allowedFields = ['display_name', 'avatar_url'];
  const setClause = [];
  const values = [];
  let paramIndex = 1;
  
  for (const [key, value] of Object.entries(updates)) {
    const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbKey)) {
      setClause.push(`${dbKey} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }
  
  if (setClause.length === 0) return null;
  
  values.push(userId);
  await pool.query(
    `UPDATE users SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`,
    values
  );
  
  return await findUserById(userId);
};

/**
 * Change user password
 * @param {number} userId 
 * @param {string} newPassword 
 */
export const changePassword = async (userId, newPassword) => {
  const passwordHash = bcrypt.hashSync(newPassword, 10);
  await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [passwordHash, userId]
  );
};

/**
 * Check if username exists
 * @param {string} username 
 * @returns {boolean}
 */
export const usernameExists = async (username) => {
  const result = await pool.query('SELECT 1 FROM users WHERE username = $1', [username]);
  return result.rows.length > 0;
};

/**
 * Check if email exists
 * @param {string} email 
 * @returns {boolean}
 */
export const emailExists = async (email) => {
  const result = await pool.query('SELECT 1 FROM users WHERE email = $1', [email.toLowerCase()]);
  return result.rows.length > 0;
};

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Create a session for a user
 * @param {number} userId 
 * @param {string} token 
 * @param {number} expiresInHours 
 */
export const createSession = async (userId, token, expiresInHours = 24 * 7) => {
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  await pool.query(
    'INSERT INTO user_sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );
};

/**
 * Find session by token
 * @param {string} token 
 * @returns {Object|null}
 */
export const findSession = async (token) => {
  const result = await pool.query(
    `SELECT s.*, u.id as user_id, u.username, u.email, u.display_name
     FROM user_sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.token = $1 AND s.expires_at > NOW()`,
    [token]
  );
  return result.rows[0] || null;
};

/**
 * Delete session (logout)
 * @param {string} token 
 */
export const deleteSession = async (token) => {
  await pool.query('DELETE FROM user_sessions WHERE token = $1', [token]);
};

/**
 * Delete all sessions for a user
 * @param {number} userId 
 */
export const deleteAllUserSessions = async (userId) => {
  await pool.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
};

/**
 * Clean up expired sessions
 */
export const cleanupExpiredSessions = async () => {
  const result = await pool.query("DELETE FROM user_sessions WHERE expires_at < NOW()");
  return result.rowCount;
};

// ============================================
// PROGRESS TRACKING
// ============================================

/**
 * Save or update module progress
 * @param {number} userId 
 * @param {string} courseId 
 * @param {string} moduleId 
 * @param {Object} data 
 */
export const saveModuleProgress = async (userId, courseId, moduleId, data = {}) => {
  const { savedCode, hintsUsed, timeSpentSeconds, completed } = data;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Upsert course progress
    await client.query(
      `INSERT INTO course_progress (user_id, course_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, course_id) DO NOTHING`,
      [userId, courseId]
    );
    
    // Upsert module progress
    await client.query(
      `INSERT INTO module_progress (user_id, course_id, module_id, saved_code, hints_used, time_spent_seconds, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, course_id, module_id) DO UPDATE SET
         saved_code = COALESCE($4, module_progress.saved_code),
         hints_used = COALESCE($5, module_progress.hints_used),
         time_spent_seconds = module_progress.time_spent_seconds + COALESCE($6, 0),
         completed_at = CASE WHEN $8 = true THEN CURRENT_TIMESTAMP ELSE module_progress.completed_at END`,
      [userId, courseId, moduleId, savedCode || null, hintsUsed || 0, timeSpentSeconds || 0, completed ? new Date() : null, !!completed]
    );
    
    await client.query('COMMIT');
    
    // Log activity
    await logActivity(userId, completed ? 'module_completed' : 'module_progress', courseId, moduleId);
    
    // Update stats if completed
    if (completed) {
      await updateUserStats(userId);
    }
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Save step completion
 * @param {number} userId 
 * @param {string} courseId 
 * @param {string} moduleId 
 * @param {number} stepIndex 
 * @param {Object} data 
 */
export const saveStepProgress = async (userId, courseId, moduleId, stepIndex, data = {}) => {
  const { hintsUsed, codeSnapshot } = data;
  
  await pool.query(
    `INSERT INTO step_progress (user_id, course_id, module_id, step_index, hints_used, code_snapshot)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id, course_id, module_id, step_index) DO UPDATE SET
       hints_used = COALESCE($5, step_progress.hints_used),
       code_snapshot = COALESCE($6, step_progress.code_snapshot)`,
    [userId, courseId, moduleId, stepIndex, hintsUsed || 0, codeSnapshot || null]
  );
  
  // Log activity
  await logActivity(userId, 'step_completed', courseId, moduleId);
};

/**
 * Get all progress for a user
 * @param {number} userId 
 * @returns {Object}
 */
export const getUserProgress = async (userId) => {
  // Get course progress
  const coursesResult = await pool.query(
    `SELECT course_id, started_at, completed_at FROM course_progress WHERE user_id = $1`,
    [userId]
  );
  
  // Get module progress
  const modulesResult = await pool.query(
    `SELECT course_id, module_id, started_at, completed_at, saved_code, hints_used, time_spent_seconds
     FROM module_progress WHERE user_id = $1`,
    [userId]
  );
  
  // Get step progress
  const stepsResult = await pool.query(
    `SELECT course_id, module_id, step_index, completed_at, hints_used
     FROM step_progress WHERE user_id = $1`,
    [userId]
  );
  
  return {
    courses: coursesResult.rows,
    modules: modulesResult.rows,
    steps: stepsResult.rows
  };
};

/**
 * Get progress for a specific course
 * @param {number} userId 
 * @param {string} courseId 
 * @returns {Object}
 */
export const getCourseProgress = async (userId, courseId) => {
  const courseResult = await pool.query(
    'SELECT * FROM course_progress WHERE user_id = $1 AND course_id = $2',
    [userId, courseId]
  );
  
  const modulesResult = await pool.query(
    'SELECT * FROM module_progress WHERE user_id = $1 AND course_id = $2',
    [userId, courseId]
  );
  
  const stepsResult = await pool.query(
    'SELECT * FROM step_progress WHERE user_id = $1 AND course_id = $2',
    [userId, courseId]
  );
  
  return {
    course: courseResult.rows[0] || null,
    modules: modulesResult.rows,
    steps: stepsResult.rows
  };
};

/**
 * Get saved code for a module
 * @param {number} userId 
 * @param {string} courseId 
 * @param {string} moduleId 
 * @returns {string|null}
 */
export const getSavedCode = async (userId, courseId, moduleId) => {
  const result = await pool.query(
    `SELECT saved_code FROM module_progress 
     WHERE user_id = $1 AND course_id = $2 AND module_id = $3`,
    [userId, courseId, moduleId]
  );
  
  return result.rows[0]?.saved_code || null;
};

// ============================================
// STATS & ANALYTICS
// ============================================

/**
 * Log user activity
 * @param {number} userId 
 * @param {string} activityType 
 * @param {string} courseId 
 * @param {string} moduleId 
 */
export const logActivity = async (userId, activityType, courseId = null, moduleId = null) => {
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, course_id, module_id)
     VALUES ($1, $2, $3, $4)`,
    [userId, activityType, courseId, moduleId]
  );
  
  // Update streak
  await updateStreak(userId);
};

/**
 * Update user streak
 * @param {number} userId 
 */
const updateStreak = async (userId) => {
  const today = new Date().toISOString().split('T')[0];
  const statsResult = await pool.query(
    'SELECT last_activity_date, current_streak_days, longest_streak_days FROM user_stats WHERE user_id = $1',
    [userId]
  );
  
  const stats = statsResult.rows[0];
  if (!stats) return;
  
  const lastActivity = stats.last_activity_date ? stats.last_activity_date.toISOString().split('T')[0] : null;
  
  if (lastActivity !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let newStreak = stats.current_streak_days;
    
    if (lastActivity === yesterday) {
      // Continuing streak
      newStreak = stats.current_streak_days + 1;
    } else if (!lastActivity || lastActivity < yesterday) {
      // Streak broken, start new one
      newStreak = 1;
    }
    
    const longestStreak = Math.max(newStreak, stats.longest_streak_days);
    
    await pool.query(
      `UPDATE user_stats 
       SET last_activity_date = $1, current_streak_days = $2, longest_streak_days = $3
       WHERE user_id = $4`,
      [today, newStreak, longestStreak, userId]
    );
  }
};

/**
 * Update user stats (call after completing modules)
 * @param {number} userId 
 */
export const updateUserStats = async (userId) => {
  // Count completed modules
  const modulesResult = await pool.query(
    `SELECT COUNT(*) as count FROM module_progress 
     WHERE user_id = $1 AND completed_at IS NOT NULL`,
    [userId]
  );
  const modulesCompleted = parseInt(modulesResult.rows[0]?.count) || 0;
  
  // Count completed courses
  const coursesResult = await pool.query(
    `SELECT COUNT(*) as count FROM course_progress 
     WHERE user_id = $1 AND completed_at IS NOT NULL`,
    [userId]
  );
  const coursesCompleted = parseInt(coursesResult.rows[0]?.count) || 0;
  
  // Count completed steps
  const stepsResult = await pool.query(
    'SELECT COUNT(*) as count FROM step_progress WHERE user_id = $1',
    [userId]
  );
  const stepsCompleted = parseInt(stepsResult.rows[0]?.count) || 0;
  
  // Total time spent
  const timeResult = await pool.query(
    'SELECT SUM(time_spent_seconds) as total FROM module_progress WHERE user_id = $1',
    [userId]
  );
  const timeSpent = parseInt(timeResult.rows[0]?.total) || 0;
  
  await pool.query(
    `UPDATE user_stats 
     SET total_modules_completed = $1, total_courses_completed = $2, 
         total_steps_completed = $3, total_time_spent_seconds = $4
     WHERE user_id = $5`,
    [modulesCompleted, coursesCompleted, stepsCompleted, timeSpent, userId]
  );
};

/**
 * Get user stats for dashboard
 * @param {number} userId 
 * @returns {Object}
 */
export const getUserStats = async (userId) => {
  const statsResult = await pool.query('SELECT * FROM user_stats WHERE user_id = $1', [userId]);
  const stats = statsResult.rows[0];
  
  // Get recent activity (last 7 days)
  const activityResult = await pool.query(
    `SELECT DATE(created_at) as date, COUNT(*) as count
     FROM activity_log
     WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days'
     GROUP BY DATE(created_at)
     ORDER BY date DESC`,
    [userId]
  );
  
  // Get courses in progress
  const coursesResult = await pool.query(
    `SELECT course_id, started_at
     FROM course_progress
     WHERE user_id = $1 AND completed_at IS NULL`,
    [userId]
  );
  
  return {
    ...stats,
    recentActivity: activityResult.rows,
    coursesInProgress: coursesResult.rows
  };
};

/**
 * Get completed module IDs for a user
 * @param {number} userId 
 * @returns {string[]}
 */
export const getCompletedModuleIds = async (userId) => {
  const result = await pool.query(
    `SELECT module_id FROM module_progress 
     WHERE user_id = $1 AND completed_at IS NOT NULL`,
    [userId]
  );
  
  return result.rows.map(r => r.module_id);
};

// ============================================
// COURSE TRANSLATIONS
// ============================================

/**
 * Save course translation
 * @param {string} courseId 
 * @param {string} language - Language code (id, es, fr, etc.)
 * @param {Object} translationData - Translation object with title, description, modules
 * @returns {Object} Saved translation
 */
export const saveCourseTranslation = async (courseId, language, translationData) => {
  const result = await pool.query(
    `INSERT INTO course_translations (course_id, language, translation_data, updated_at)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
     ON CONFLICT (course_id, language) 
     DO UPDATE SET 
       translation_data = $3,
       updated_at = CURRENT_TIMESTAMP
     RETURNING id, course_id, language, created_at, updated_at`,
    [courseId, language, JSON.stringify(translationData)]
  );
  
  return result.rows[0];
};

/**
 * Get course translation
 * @param {string} courseId 
 * @param {string} language 
 * @returns {Object|null} Translation data or null
 */
export const getCourseTranslation = async (courseId, language) => {
  const result = await pool.query(
    `SELECT translation_data, updated_at
     FROM course_translations
     WHERE course_id = $1 AND language = $2`,
    [courseId, language]
  );
  
  return result.rows[0] ? {
    ...result.rows[0].translation_data,
    updatedAt: result.rows[0].updated_at
  } : null;
};

/**
 * Get all translations for a course
 * @param {string} courseId 
 * @returns {Object} Map of language -> translation data
 */
export const getAllCourseTranslations = async (courseId) => {
  const result = await pool.query(
    `SELECT language, translation_data, updated_at
     FROM course_translations
     WHERE course_id = $1`,
    [courseId]
  );
  
  const translations = {};
  result.rows.forEach(row => {
    translations[row.language] = {
      ...row.translation_data,
      updatedAt: row.updated_at
    };
  });
  
  return translations;
};

/**
 * Get available languages for a course
 * @param {string} courseId 
 * @returns {string[]} Array of language codes
 */
export const getCourseLanguages = async (courseId) => {
  const result = await pool.query(
    `SELECT language FROM course_translations WHERE course_id = $1`,
    [courseId]
  );
  
  return result.rows.map(r => r.language);
};

/**
 * Delete course translation
 * @param {string} courseId 
 * @param {string} language 
 */
export const deleteCourseTranslation = async (courseId, language) => {
  await pool.query(
    `DELETE FROM course_translations WHERE course_id = $1 AND language = $2`,
    [courseId, language]
  );
};

// Graceful shutdown
process.on('SIGTERM', () => {
  pool.end(() => {
    console.log('PostgreSQL pool has ended');
  });
});

export default {
  // User management
  createUser,
  findUser,
  findUserById,
  verifyPassword,
  updateLastLogin,
  updateUserProfile,
  changePassword,
  usernameExists,
  emailExists,
  
  // Session management
  createSession,
  findSession,
  deleteSession,
  deleteAllUserSessions,
  cleanupExpiredSessions,
  
  // Progress tracking
  saveModuleProgress,
  saveStepProgress,
  getUserProgress,
  getCourseProgress,
  getSavedCode,
  getCompletedModuleIds,
  
  // Stats & analytics
  logActivity,
  updateUserStats,
  getUserStats,
  
  // Course translations
  saveCourseTranslation,
  getCourseTranslation,
  getAllCourseTranslations,
  getCourseLanguages,
  deleteCourseTranslation,
  
  // Pool for advanced queries
  pool
};
