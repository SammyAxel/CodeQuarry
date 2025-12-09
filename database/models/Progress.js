/**
 * Progress Model
 * Handles module progress, stats, and refinery system
 */

import pool from '../connection.js';

/**
 * Save module progress
 */
export const saveModuleProgress = async (userId, courseId, moduleId, data = {}) => {
  const { savedCode, hintsUsed, timeSpentSeconds, completed } = data;
  
  await pool.query(
    `INSERT INTO module_progress (user_id, course_id, module_id, saved_code, hints_used, time_spent_seconds, completed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (user_id, course_id, module_id) DO UPDATE SET
       saved_code = COALESCE($4, module_progress.saved_code),
       hints_used = COALESCE($5, module_progress.hints_used),
       time_spent_seconds = module_progress.time_spent_seconds + COALESCE($6, 0),
       completed_at = CASE WHEN $8 = true THEN CURRENT_TIMESTAMP ELSE module_progress.completed_at END`,
    [userId, courseId, moduleId, savedCode || null, hintsUsed || 0, timeSpentSeconds || 0, completed ? new Date() : null, !!completed]
  );
  
  await logActivity(userId, completed ? 'module_completed' : 'module_progress', courseId, moduleId);
  
  if (completed) {
    await updateUserStats(userId);
  }
};

/**
 * Get all progress for a user
 */
export const getUserProgress = async (userId) => {
  const modulesResult = await pool.query(
    `SELECT course_id, module_id, started_at, completed_at, saved_code, hints_used, time_spent_seconds
     FROM module_progress WHERE user_id = $1`,
    [userId]
  );
  
  const courseMap = {};
  for (const mod of modulesResult.rows) {
    if (!courseMap[mod.course_id]) {
      courseMap[mod.course_id] = { course_id: mod.course_id, started_at: mod.started_at, modules: [] };
    }
    courseMap[mod.course_id].modules.push(mod);
  }
  
  return {
    courses: Object.values(courseMap),
    modules: modulesResult.rows
  };
};

/**
 * Get progress for a specific course
 */
export const getCourseProgress = async (userId, courseId) => {
  const modulesResult = await pool.query(
    'SELECT * FROM module_progress WHERE user_id = $1 AND course_id = $2',
    [userId, courseId]
  );
  
  const modules = modulesResult.rows;
  const course = modules.length > 0 ? {
    course_id: courseId,
    started_at: modules.reduce((min, m) => m.started_at < min ? m.started_at : min, modules[0].started_at),
    completed_at: modules.every(m => m.completed_at) ? modules.reduce((max, m) => m.completed_at > max ? m.completed_at : max, modules[0].completed_at) : null
  } : null;
  
  return { course, modules };
};

/**
 * Get saved code for a module
 */
export const getSavedCode = async (userId, courseId, moduleId) => {
  const result = await pool.query(
    `SELECT saved_code FROM module_progress 
     WHERE user_id = $1 AND course_id = $2 AND module_id = $3`,
    [userId, courseId, moduleId]
  );
  
  return result.rows[0]?.saved_code || null;
};

/**
 * Log user activity
 */
export const logActivity = async (userId, activityType, courseId = null, moduleId = null) => {
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, course_id, module_id)
     VALUES ($1, $2, $3, $4)`,
    [userId, activityType, courseId, moduleId]
  );
  
  await updateStreak(userId);
};

/**
 * Update user streak
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
      newStreak = stats.current_streak_days + 1;
    } else if (!lastActivity || lastActivity < yesterday) {
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
 * Update user stats
 */
export const updateUserStats = async (userId) => {
  const modulesResult = await pool.query(
    `SELECT COUNT(*) as count FROM module_progress 
     WHERE user_id = $1 AND completed_at IS NOT NULL`,
    [userId]
  );
  const modulesCompleted = parseInt(modulesResult.rows[0]?.count) || 0;
  
  const coursesResult = await pool.query(
    `SELECT COUNT(DISTINCT course_id) as count FROM module_progress 
     WHERE user_id = $1 AND completed_at IS NOT NULL`,
    [userId]
  );
  const coursesCompleted = parseInt(coursesResult.rows[0]?.count) || 0;
  
  const timeResult = await pool.query(
    'SELECT SUM(time_spent_seconds) as total FROM module_progress WHERE user_id = $1',
    [userId]
  );
  const timeSpent = parseInt(timeResult.rows[0]?.total) || 0;
  
  await pool.query(
    `INSERT INTO user_stats (user_id, total_modules_completed, total_courses_completed, total_time_spent_seconds)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE SET
       total_modules_completed = $2,
       total_courses_completed = $3,
       total_time_spent_seconds = $4`,
    [userId, modulesCompleted, coursesCompleted, timeSpent]
  );
};

/**
 * Get user stats for dashboard
 */
export const getUserStats = async (userId) => {
  const statsResult = await pool.query('SELECT * FROM user_stats WHERE user_id = $1', [userId]);
  const stats = statsResult.rows[0];
  
  const activityResult = await pool.query(
    `SELECT DATE(created_at) as date, COUNT(*) as count
     FROM activity_log
     WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days'
     GROUP BY DATE(created_at)
     ORDER BY date DESC`,
    [userId]
  );
  
  const coursesResult = await pool.query(
    `SELECT DISTINCT course_id, MIN(started_at) as started_at
     FROM module_progress
     WHERE user_id = $1
     GROUP BY course_id
     HAVING COUNT(*) > COUNT(completed_at)`,
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
 */
export const getCompletedModuleIds = async (userId) => {
  const result = await pool.query(
    `SELECT module_id FROM module_progress 
     WHERE user_id = $1 AND completed_at IS NOT NULL`,
    [userId]
  );
  
  return result.rows.map(r => r.module_id);
};

/**
 * Save or update refinery progress
 */
export const saveRefineryProgress = async (userId, courseId, moduleId, data) => {
  const { score, rank, metrics, gemsEarned } = data;
  
  const result = await pool.query(
    `INSERT INTO refinery_progress (user_id, course_id, module_id, best_score, best_rank, gems_earned, metrics)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (user_id, course_id, module_id) DO UPDATE SET
       best_score = CASE WHEN $4 > refinery_progress.best_score THEN $4 ELSE refinery_progress.best_score END,
       best_rank = CASE WHEN $4 > refinery_progress.best_score THEN $5 ELSE refinery_progress.best_rank END,
       gems_earned = refinery_progress.gems_earned + $6,
       metrics = CASE WHEN $4 > refinery_progress.best_score THEN $7 ELSE refinery_progress.metrics END,
       achieved_at = CASE WHEN $4 > refinery_progress.best_score THEN CURRENT_TIMESTAMP ELSE refinery_progress.achieved_at END
     RETURNING *`,
    [userId, courseId, moduleId, score, rank, gemsEarned || 0, JSON.stringify(metrics)]
  );
  
  return result.rows[0];
};

/**
 * Get refinery progress for a user and module
 */
export const getRefineryProgress = async (userId, courseId, moduleId) => {
  const result = await pool.query(
    `SELECT * FROM refinery_progress WHERE user_id = $1 AND course_id = $2 AND module_id = $3`,
    [userId, courseId, moduleId]
  );
  return result.rows[0];
};

/**
 * Get all refinery progress for a user
 */
export const getAllRefineryProgress = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM refinery_progress WHERE user_id = $1 ORDER BY achieved_at DESC`,
    [userId]
  );
  return result.rows;
};
