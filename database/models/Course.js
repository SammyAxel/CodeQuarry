/**
 * Course Model
 * Handles course CRUD operations and translations
 */

import pool from '../connection.js';

/**
 * Format course from DB to API format
 */
const formatCourse = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  icon: row.icon,
  customIconUrl: row.custom_icon_url,
  language: row.language,
  difficulty: row.difficulty,
  isPublished: row.is_published,
  isPremium: row.is_premium,
  authorId: row.author_id,
  modules: row.modules,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

/**
 * Create a new course
 */
export const createCourse = async (courseData) => {
  const { id, title, description, icon, customIconUrl, language, difficulty, isPublished, isPremium, authorId, modules } = courseData;
  
  const result = await pool.query(
    `INSERT INTO courses (id, title, description, icon, custom_icon_url, language, difficulty, is_published, is_premium, author_id, modules)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [id, title, description, icon, customIconUrl, language || 'javascript', difficulty || 'copper', isPublished || false, isPremium || false, authorId, JSON.stringify(modules || [])]
  );
  
  return formatCourse(result.rows[0]);
};

/**
 * Get all courses (optionally filter by published status)
 */
export const getAllCourses = async (publishedOnly = false) => {
  const query = publishedOnly 
    ? 'SELECT * FROM courses WHERE is_published = true ORDER BY created_at DESC'
    : 'SELECT * FROM courses ORDER BY created_at DESC';
  
  const result = await pool.query(query);
  return result.rows.map(formatCourse);
};

/**
 * Get a course by ID
 */
export const getCourse = async (courseId) => {
  const result = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);
  return result.rows[0] ? formatCourse(result.rows[0]) : null;
};

/**
 * Update a course
 */
export const updateCourse = async (courseId, updates) => {
  const { title, description, icon, customIconUrl, language, difficulty, isPublished, isPremium, modules } = updates;
  
  const result = await pool.query(
    `UPDATE courses SET
       title = COALESCE($2, title),
       description = COALESCE($3, description),
       icon = COALESCE($4, icon),
       custom_icon_url = $5,
       language = COALESCE($6, language),
       difficulty = COALESCE($7, difficulty),
       is_published = COALESCE($8, is_published),
       is_premium = COALESCE($9, is_premium),
       modules = COALESCE($10, modules),
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [courseId, title, description, icon, customIconUrl, language, difficulty, isPublished, isPremium, modules ? JSON.stringify(modules) : null]
  );
  
  return result.rows[0] ? formatCourse(result.rows[0]) : null;
};

/**
 * Delete a course
 */
export const deleteCourse = async (courseId) => {
  await pool.query('DELETE FROM courses WHERE id = $1', [courseId]);
};

/**
 * Save course translation
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
 */
export const deleteCourseTranslation = async (courseId, language) => {
  await pool.query(
    `DELETE FROM course_translations WHERE course_id = $1 AND language = $2`,
    [courseId, language]
  );
};
