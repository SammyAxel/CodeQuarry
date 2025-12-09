/**
 * Admin Routes
 * Handles admin-only operations (user management, progress reset, gems, course management)
 */

import { Router } from 'express';
import { verifySession, verifyUserSession, requireAdmin } from '../middleware/auth.middleware.js';
import db from '../../database/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COURSES_DIR = path.join(__dirname, '../../src/data');

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

    if (!role || !['user', 'mod', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "user", "mod", or "admin"' });
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
 * PATCH /api/admin/users/:userId/custom-role
 * Set custom role for a user (admin only)
 */
router.patch('/users/:userId/custom-role', verifyUserSession, async (req, res) => {
  try {
    const fullUser = await db.getUserById(req.user.id);
    if (fullUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;
    const { customRole } = req.body;

    if (customRole && customRole.length > 50) {
      return res.status(400).json({ error: 'Custom role must be 50 characters or less' });
    }

    await db.updateUserCustomRole(userId, customRole || null);
    res.json({ 
      success: true, 
      message: `Updated custom role for user ${userId}`,
      customRole 
    });
  } catch (error) {
    console.error('Error updating custom role:', error);
    res.status(500).json({ error: 'Failed to update custom role' });
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

// ============================================
// COURSE FILE MANAGEMENT
// ============================================

/**
 * Helper function to format values for JSX output
 */
function formatValue(value, key = '') {
  if (value === null || value === undefined) {
    return 'null';
  }
  if (typeof value === 'string') {
    if (value.includes('\n') || value.includes('`') || value.includes('data:image') || value.length > 500) {
      const escaped = value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
      return '`' + escaped + '`';
    }
    return JSON.stringify(value);
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map(item => formatValue(item));
    if (items.join(', ').length < 60) {
      return '[' + items.join(', ') + ']';
    }
    return '[\n        ' + items.join(',\n        ') + '\n      ]';
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value).map(([k, v]) => `${k}: ${formatValue(v, k)}`);
    if (entries.join(', ').length < 60) {
      return '{ ' + entries.join(', ') + ' }';
    }
    return '{\n        ' + entries.join(',\n        ') + '\n      }';
  }
  return JSON.stringify(value);
}

/**
 * Helper function to generate course file content
 */
function generateCourseFileContent(course, courseId, coursesContent = '') {
  let varName = null;
  const existingImportMatch = coursesContent.match(new RegExp(`import\\s*\\{\\s*(\\w+)\\s*\\}\\s*from\\s*['\"]\\.\/${courseId}\\.jsx['\"]`));
  if (existingImportMatch) {
    varName = existingImportMatch[1];
  } else {
    varName = courseId.replace(/-/g, '') + 'Course';
  }
  
  const serializableCourse = JSON.parse(JSON.stringify(course));
  delete serializableCourse.icon;
  
  const modulesStr = serializableCourse.modules.map(mod => {
    let modStr = '    {\n';
    for (const [key, value] of Object.entries(mod)) {
      if (key === 'requiredSyntax' || key === 'stepSyntax') continue;
      modStr += `      ${key}: ${formatValue(value, key)},\n`;
    }
    modStr += '    }';
    return modStr;
  }).join(',\n');

  let iconImport = 'Code2';
  let iconColor = 'text-blue-400';
  if (courseId.includes('py')) {
    iconColor = 'text-blue-400';
  } else if (courseId.includes('js')) {
    iconColor = 'text-yellow-400';
  } else if (courseId.includes('c-')) {
    iconImport = 'Terminal';
    iconColor = 'text-cyan-400';
  }
  
  return `import React from 'react';
import { ${iconImport} } from 'lucide-react';

export const ${varName} = {
  id: '${courseId}',
  title: ${formatValue(serializableCourse.title)},
  description: ${formatValue(serializableCourse.description)},
  icon: <${iconImport} className="w-8 h-8 ${iconColor}" />,
  level: ${formatValue(serializableCourse.level || 'Copper')},
  modules: [
${modulesStr}
  ]
};
`;
}

/**
 * GET /api/admin/courses
 * List all course files
 */
router.get('/courses', verifySession, requireAdmin, (req, res) => {
  try {
    const files = fs.readdirSync(COURSES_DIR)
      .filter(f => f.endsWith('.jsx') && f !== 'courses.jsx');
    res.json({ courses: files });
  } catch (err) {
    console.error('Error listing courses:', err);
    res.status(500).json({ error: 'Failed to list courses' });
  }
});

/**
 * POST /api/admin/courses/:courseId
 * Create or update a course file
 */
router.post('/courses/:courseId', verifySession, requireAdmin, (req, res) => {
  const { courseId } = req.params;
  const { course } = req.body;
  
  if (!course) {
    return res.status(400).json({ error: 'No course data provided' });
  }
  
  const sanitizedId = courseId.replace(/[^a-zA-Z0-9-_]/g, '');
  if (sanitizedId !== courseId) {
    return res.status(400).json({ error: 'Invalid course ID' });
  }
  
  const filePath = path.join(COURSES_DIR, `${sanitizedId}.jsx`);
  
  try {
    const coursesFilePath = path.join(COURSES_DIR, 'courses.jsx');
    let coursesContent = '';
    if (fs.existsSync(coursesFilePath)) {
      coursesContent = fs.readFileSync(coursesFilePath, 'utf8');
    }
    
    const fileContent = generateCourseFileContent(course, sanitizedId, coursesContent);
    fs.writeFileSync(filePath, fileContent, 'utf8');
    
    console.log(`[${new Date().toISOString()}] Saved course: ${sanitizedId}`);
    res.json({ success: true, message: `Course ${sanitizedId} saved successfully` });
  } catch (err) {
    console.error('Error saving course:', err);
    res.status(500).json({ error: 'Failed to save course: ' + err.message });
  }
});

/**
 * DELETE /api/admin/courses/:courseId
 * Delete a course file (custom courses only)
 */
router.delete('/courses/:courseId', verifySession, requireAdmin, (req, res) => {
  const { courseId } = req.params;
  
  const protectedCourses = ['py-101', 'js-101', 'c-101'];
  if (protectedCourses.includes(courseId)) {
    return res.status(403).json({ error: 'Cannot delete built-in courses' });
  }
  
  const sanitizedId = courseId.replace(/[^a-zA-Z0-9-_]/g, '');
  const filePath = path.join(COURSES_DIR, `${sanitizedId}.jsx`);
  
  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    fs.unlinkSync(filePath);
    console.log(`[${new Date().toISOString()}] Deleted course: ${sanitizedId}`);
    res.json({ success: true, message: `Course ${sanitizedId} deleted` });
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

/**
 * PUT /api/admin/courses/:courseId/update
 * Update courses.jsx to include/exclude a course
 */
router.put('/courses/:courseId/update', verifySession, requireAdmin, (req, res) => {
  const { courseId } = req.params;
  const { action } = req.body;
  
  const coursesFilePath = path.join(COURSES_DIR, 'courses.jsx');
  
  try {
    let content = fs.readFileSync(coursesFilePath, 'utf8');
    const sanitizedId = courseId.replace(/[^a-zA-Z0-9-_]/g, '');
    
    let importName = null;
    const existingImportMatch = content.match(new RegExp(`import\\s*\\{\\s*(\\w+)\\s*\\}\\s*from\\s*['\"]\\.\/${sanitizedId}\\.jsx['\"]`));
    if (existingImportMatch) {
      importName = existingImportMatch[1];
    } else {
      importName = sanitizedId.replace(/-/g, '') + 'Course';
    }
    
    if (action === 'add') {
      const importLine = `import { ${importName} } from './${sanitizedId}.jsx';`;
      if (!content.includes(importLine)) {
        const lastImportIndex = content.lastIndexOf("import {");
        const lineEnd = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, lineEnd + 1) + importLine + '\n' + content.slice(lineEnd + 1);
      }
      
      if (!content.includes(importName)) {
        content = content.replace(
          /export const COURSES = \[/,
          `export const COURSES = [\n  ${importName},`
        );
      }
    }
    
    fs.writeFileSync(coursesFilePath, content, 'utf8');
    res.json({ success: true, message: `courses.jsx updated` });
  } catch (err) {
    console.error('Error updating courses.jsx:', err);
    res.status(500).json({ error: 'Failed to update courses.jsx' });
  }
});

export default router;
