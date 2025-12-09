/**
 * Progress Routes
 * Handles user progress tracking, stats, and refinery progress
 */

import { Router } from 'express';
import { verifyUserSession } from '../middleware/auth.middleware.js';
import db from '../../database/index.js';

const router = Router();

/**
 * GET /api/progress
 * Get all progress for current user
 */
router.get('/', verifyUserSession, async (req, res) => {
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
router.get('/:courseId', verifyUserSession, async (req, res) => {
  const { courseId } = req.params;
  const progress = await db.getCourseProgress(req.user.id, courseId);
  
  res.json(progress);
});

/**
 * POST /api/progress/module
 * Save module progress
 */
router.post('/module', verifyUserSession, async (req, res) => {
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

/**
 * GET /api/progress/code/:courseId/:moduleId
 * Get saved code for a module
 */
router.get('/code/:courseId/:moduleId', verifyUserSession, async (req, res) => {
  const { courseId, moduleId } = req.params;
  const savedCode = await db.getSavedCode(req.user.id, courseId, moduleId);
  
  res.json({ savedCode });
});

/**
 * GET /api/progress/stats
 * Get user stats for dashboard
 */
router.get('/stats', verifyUserSession, async (req, res) => {
  const stats = await db.getUserStats(req.user.id);
  res.json(stats);
});

/**
 * GET /api/progress/refinery/:courseId/:moduleId
 * Get refinery progress for a specific module
 */
router.get('/refinery/:courseId/:moduleId', verifyUserSession, async (req, res) => {
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
 * POST /api/progress/refinery/save
 * Save refinery progress and award gems
 */
router.post('/refinery/save', verifyUserSession, async (req, res) => {
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
 * GET /api/progress/refinery/all
 * Get all refinery achievements for current user
 */
router.get('/refinery/all', verifyUserSession, async (req, res) => {
  try {
    const progress = await db.getAllRefineryProgress(req.user.id);
    res.json(progress);
  } catch (error) {
    console.error('Error fetching all refinery progress:', error);
    res.status(500).json({ error: 'Failed to fetch refinery progress' });
  }
});

export default router;
