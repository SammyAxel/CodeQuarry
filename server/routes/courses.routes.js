/**
 * Courses Routes
 * Handles course CRUD operations
 */

import { Router } from 'express';
import { verifyUserSession } from '../middleware/auth.middleware.js';
import db from '../../database/index.js';

const router = Router();

/**
 * GET /api/courses
 * Get all published courses (public) or all courses (admin)
 */
router.get('/', async (req, res) => {
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
router.get('/:courseId', async (req, res) => {
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
router.post('/', verifyUserSession, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
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
router.put('/:courseId', verifyUserSession, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
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
 * DELETE /api/courses/:courseId/db
 * Delete a course (admin only)
 */
router.delete('/:courseId/db', verifyUserSession, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
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
 * POST /api/courses/reseed
 * Force reseed all courses with comprehensive content (admin only)
 */
router.post('/reseed', verifyUserSession, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const result = await db.reseedCourses();
    res.json(result);
  } catch (error) {
    console.error('Error reseeding courses:', error);
    res.status(500).json({ error: 'Failed to reseed courses' });
  }
});

export default router;
