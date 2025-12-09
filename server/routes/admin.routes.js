/**
 * Admin Routes
 * Handles admin-only operations (user management, progress reset, gems)
 */

import { Router } from 'express';
import { verifySession, verifyUserSession, requireAdmin } from '../middleware/auth.middleware.js';
import db from '../../database/index.js';

const router = Router();

/**
 * GET /api/admin/users
 * Get all users (admin only)
 */
router.get('/users', verifyUserSession, async (req, res) => {
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
router.get('/users/:id', verifyUserSession, async (req, res) => {
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
router.delete('/users/:id', verifyUserSession, async (req, res) => {
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
router.patch('/users/:id/role', verifyUserSession, async (req, res) => {
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
 * PATCH /api/admin/users/:userId/gems
 * Update user's gem balance (admin only)
 */
router.patch('/users/:userId/gems', verifyUserSession, async (req, res) => {
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

/**
 * POST /api/admin/courses/:courseId/reset-progress
 * Reset all student progress for a course (use when updating course structure)
 */
router.post('/courses/:courseId/reset-progress', verifySession, requireAdmin, async (req, res) => {
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
router.post('/users/:userId/reset-progress', verifySession, requireAdmin, async (req, res) => {
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
router.post('/users/:userId/reset-course/:courseId', verifySession, requireAdmin, async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    await db.resetUserCourseProgress(userId, courseId);
    res.json({ success: true, message: `Progress reset for user ${userId} in course ${courseId}` });
  } catch (error) {
    console.error('Error resetting user course progress:', error);
    res.status(500).json({ error: 'Failed to reset user course progress' });
  }
});

export default router;
