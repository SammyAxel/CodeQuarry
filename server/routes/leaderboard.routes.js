/**
 * Leaderboard Routes
 * Public rankings and user profiles
 */

import { Router } from 'express';
import db from '../../database/index.js';

const router = Router();

/**
 * GET /api/leaderboard
 * Get leaderboard rankings (excludes admins and mods)
 * Query params: sortBy (gems, modules, courses)
 */
router.get('/', async (req, res) => {
  try {
    const { sortBy = 'gems' } = req.query;
    
    let orderBy = 'total_gems';
    if (sortBy === 'modules') orderBy = 'completed_modules';
    if (sortBy === 'courses') orderBy = 'completed_courses';
    
    const leaderboard = await db.getLeaderboard(orderBy);
    res.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
