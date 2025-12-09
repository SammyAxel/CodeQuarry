/**
 * Translations Routes
 * Handles course translations management
 */

import { Router } from 'express';
import { verifyUserSession } from '../middleware/auth.middleware.js';
import db from '../../database/index.js';

const router = Router();

/**
 * POST /api/translations/save
 * Save a course translation (admin only)
 */
router.post('/save', verifyUserSession, async (req, res) => {
  // Check if user is admin
  const fullUser = await db.getUserById(req.user.id);
  if (fullUser.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { courseId, language, translation } = req.body;
  
  if (!courseId || !language || !translation) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const result = await db.saveCourseTranslation(courseId, language, translation);
    res.json({ success: true, translation: result });
  } catch (error) {
    console.error('Error saving translation:', error);
    res.status(500).json({ error: 'Failed to save translation' });
  }
});

/**
 * GET /api/translations/all
 * Get all translations for all courses
 */
router.get('/all', async (req, res) => {
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
router.get('/:courseId', async (req, res) => {
  const { courseId } = req.params;
  
  try {
    const translations = await db.getAllCourseTranslations(courseId);
    res.json(translations);
  } catch (error) {
    console.error('Error fetching translations:', error);
    res.status(500).json({ error: 'Failed to fetch translations' });
  }
});

/**
 * GET /api/translations/:courseId/languages
 * Get available languages for a course
 */
router.get('/:courseId/languages', async (req, res) => {
  const { courseId } = req.params;
  
  try {
    const languages = await db.getCourseLanguages(courseId);
    res.json({ languages });
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
});

/**
 * GET /api/translations/:courseId/:language
 * Get translation for a specific course and language
 */
router.get('/:courseId/:language', async (req, res) => {
  const { courseId, language } = req.params;
  
  try {
    const translation = await db.getCourseTranslation(courseId, language);
    if (!translation) {
      return res.status(404).json({ error: 'Translation not found' });
    }
    res.json(translation);
  } catch (error) {
    console.error('Error fetching translation:', error);
    res.status(500).json({ error: 'Failed to fetch translation' });
  }
});

/**
 * DELETE /api/translations/:courseId/:language
 * Delete a course translation (admin only)
 */
router.delete('/:courseId/:language', verifyUserSession, async (req, res) => {
  // Check if user is admin
  const fullUser = await db.getUserById(req.user.id);
  if (fullUser.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { courseId, language } = req.params;
  
  try {
    await db.deleteCourseTranslation(courseId, language);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting translation:', error);
    res.status(500).json({ error: 'Failed to delete translation' });
  }
});

export default router;
