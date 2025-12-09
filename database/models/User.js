/**
 * User Model
 * Handles user authentication, profile management, and role operations
 */

import bcrypt from 'bcryptjs';
import pool from '../connection.js';

/**
 * Create a new user
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

export const findUser = async (identifier) => {
  const result = await pool.query(
    `SELECT id, username, email, password_hash, display_name, avatar_url, role, created_at, last_login_at
     FROM users 
     WHERE (username = $1 OR email = $2) AND is_active = true`,
    [identifier, identifier.toLowerCase()]
  );
  return result.rows[0] || null;
};

export const findUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, username, email, display_name, avatar_url, role, created_at, last_login_at
     FROM users 
     WHERE id = $1 AND is_active = true`,
    [id]
  );
  return result.rows[0] || null;
};

export const verifyPassword = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};

export const updateLastLogin = async (userId) => {
  await pool.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
};

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

export const changePassword = async (userId, newPassword) => {
  const passwordHash = bcrypt.hashSync(newPassword, 10);
  await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [passwordHash, userId]
  );
};

export const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT u.id, u.username, u.email, u.display_name, u.avatar_url, u.role, u.created_at, u.last_login_at, u.updated_at,
            COALESCE(s.total_gems, 0) as total_gems
     FROM users u
     LEFT JOIN user_stats s ON u.id = s.user_id
     ORDER BY u.created_at DESC`
  );
  return result.rows;
};

export const deleteUser = async (userId) => {
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
};

export const updateUserRole = async (userId, role) => {
  await pool.query(
    'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [role, userId]
  );
};

export const usernameExists = async (username) => {
  const result = await pool.query('SELECT 1 FROM users WHERE username = $1', [username]);
  return result.rows.length > 0;
};

export const emailExists = async (email) => {
  const result = await pool.query('SELECT 1 FROM users WHERE email = $1', [email.toLowerCase()]);
  return result.rows.length > 0;
};

// Session Management
export const createSession = async (userId, token, expiresInHours = 24 * 7) => {
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  await pool.query(
    'INSERT INTO user_sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );
};

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

export const deleteSession = async (token) => {
  await pool.query('DELETE FROM user_sessions WHERE token = $1', [token]);
};

export const deleteAllUserSessions = async (userId) => {
  await pool.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
};

export const cleanupExpiredSessions = async () => {
  const result = await pool.query("DELETE FROM user_sessions WHERE expires_at < NOW()");
  return result.rowCount;
};

/**
 * Get leaderboard rankings (excludes admins and mods)
 */
export const getLeaderboard = async (orderBy = 'total_gems') => {
  const result = await pool.query(
    `SELECT 
      u.id, 
      u.username, 
      u.display_name, 
      u.avatar_url,
      u.custom_role,
      u.total_gems,
      COALESCE(COUNT(DISTINCT mp.module_id) FILTER (WHERE mp.completed_at IS NOT NULL), 0) as completed_modules,
      COALESCE((SELECT COUNT(DISTINCT course_id) 
                FROM module_progress 
                WHERE user_id = u.id 
                AND completed_at IS NOT NULL
                GROUP BY course_id
                HAVING COUNT(DISTINCT module_id) >= 3), 0) as completed_courses
     FROM users u
     LEFT JOIN module_progress mp ON u.id = mp.user_id
     WHERE u.role = 'user'
     GROUP BY u.id
     ORDER BY ${orderBy} DESC
     LIMIT 100`,
    []
  );
  
  return result.rows.map((row, index) => ({
    rank: index + 1,
    userId: row.id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    customRole: row.custom_role,
    gems: parseInt(row.total_gems || 0),
    modulesCompleted: parseInt(row.completed_modules),
    coursesCompleted: parseInt(row.completed_courses)
  }));
};

/**
 * Get public user profile
 */
export const getUserProfile = async (userId) => {
  const result = await pool.query(
    `SELECT 
      u.id, 
      u.username, 
      u.display_name, 
      u.avatar_url,
      u.bio,
      u.role,
      u.custom_role,
      u.total_gems,
      u.created_at,
      u.last_login_at,
      COALESCE(COUNT(DISTINCT mp.module_id) FILTER (WHERE mp.completed_at IS NOT NULL), 0) as completed_modules
     FROM users u
     LEFT JOIN module_progress mp ON u.id = mp.user_id
     WHERE u.id = $1
     GROUP BY u.id`,
    [userId]
  );
  
  if (!result.rows[0]) return null;
  
  const row = result.rows[0];
  
  // Count completed courses (courses with at least 3 completed modules)
  const coursesResult = await pool.query(
    `SELECT COUNT(DISTINCT course_id) as count
     FROM (
       SELECT course_id, COUNT(DISTINCT module_id) as module_count
       FROM module_progress
       WHERE user_id = $1 AND completed_at IS NOT NULL
       GROUP BY course_id
       HAVING COUNT(DISTINCT module_id) >= 3
     ) as completed`,
    [userId]
  );
  
  return {
    userId: row.id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    role: row.role,
    customRole: row.custom_role,
    gems: parseInt(row.total_gems || 0),
    modulesCompleted: parseInt(row.completed_modules),
    coursesCompleted: parseInt(coursesResult.rows[0]?.count || 0),
    joinedAt: row.created_at,
    lastActive: row.last_login_at
  };
};

/**
 * Update user bio
 */
export const updateUserBio = async (userId, bio) => {
  const result = await pool.query(
    'UPDATE users SET bio = $1 WHERE id = $2 RETURNING bio',
    [bio, userId]
  );
  return result.rows[0];
};

/**
 * Update user custom role (admin only)
 */
export const updateUserCustomRole = async (userId, customRole) => {
  const result = await pool.query(
    'UPDATE users SET custom_role = $1 WHERE id = $2 RETURNING custom_role',
    [customRole, userId]
  );
  return result.rows[0];
};
