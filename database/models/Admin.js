/**
 * Admin Model
 * Handles admin operations like progress reset
 */

import pool from '../connection.js';

/**
 * Reset all progress for a course
 */
export const resetCourseProgress = async (courseId) => {
  await pool.query(
    `DELETE FROM module_progress WHERE course_id = $1`,
    [courseId]
  );
};

/**
 * Reset all progress for a specific user
 */
export const resetUserProgress = async (userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    await client.query(
      `DELETE FROM module_progress WHERE user_id = $1`,
      [userId]
    );
    
    await client.query(
      `UPDATE user_stats SET 
        total_modules_completed = 0,
        total_courses_completed = 0,
        total_steps_completed = 0,
        total_time_spent_seconds = 0,
        current_streak_days = 0
       WHERE user_id = $1`,
      [userId]
    );
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Reset progress for a specific user in a specific course
 */
export const resetUserCourseProgress = async (userId, courseId) => {
  await pool.query(
    `DELETE FROM module_progress WHERE user_id = $1 AND course_id = $2`,
    [userId, courseId]
  );
};
