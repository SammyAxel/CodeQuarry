import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const API_ENDPOINT = process.env.API_ENDPOINT || 'https://emkc.org/api/v2/piston/execute';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:4000';
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());

/**
 * Health check endpoint for monitoring
 * GET /api/health
 * Returns server status and backend connectivity
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

/**
 * POST /api/v1/compile-c
 * Compiles and runs C code using Piston API (free, unlimited)
 * @param {string} code - C source code to compile
 * @returns {Object} { output: string } or error
 */
app.post('/api/v1/compile-c', async (req, res) => {
  let code = req.body.code;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  // Handle escaped characters from JSON serialization
  if (typeof code === 'string') {
    code = code
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }

  console.log(`[${new Date().toISOString()}] Compiling C code...`);

  try {
    // Use Piston API - free, no auth needed, reliable
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'c',
        version: '10.2.0',
        files: [
          {
            name: 'main.c',
            content: code
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Piston API error: ${response.status}`);
    }

    const result = await response.json();

    console.log(`[${new Date().toISOString()}] Compilation successful`);

    // Piston returns output in different format
    let output = '';
    if (result.run && result.run.output) {
      output = result.run.output;
    } else if (result.compile && result.compile.output) {
      throw new Error(`Compilation error: ${result.compile.output}`);
    } else if (result.run && result.run.stderr) {
      throw new Error(`Runtime error: ${result.run.stderr}`);
    }

    res.json({ output: output || '' });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Compilation error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Fallback for v0 (backward compatibility)
app.post('/api/compile-c', (req, res) => {
  console.warn('[DEPRECATED] Using /api/compile-c. Please use /api/v1/compile-c instead.');
  // Forward to v1 endpoint
  req.url = '/api/v1/compile-c';
  app(req, res);
});

// ============================================
// COURSE FILE MANAGEMENT ENDPOINTS (Admin Only)
// ============================================

const COURSES_DIR = path.join(__dirname, 'src', 'data');
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'GemMiner2025!';

// Middleware to verify admin authentication
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers['x-admin-auth'];
  if (!authHeader || authHeader !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized - Admin authentication required' });
  }
  next();
};

/**
 * GET /api/admin/courses
 * Lists all course files in src/data/
 */
app.get('/api/admin/courses', verifyAdmin, (req, res) => {
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
 * Creates or updates a course file
 * @param {Object} course - The course object to save
 */
app.post('/api/admin/courses/:courseId', verifyAdmin, (req, res) => {
  const { courseId } = req.params;
  const { course } = req.body;
  
  if (!course) {
    return res.status(400).json({ error: 'No course data provided' });
  }
  
  // Sanitize courseId to prevent path traversal
  const sanitizedId = courseId.replace(/[^a-zA-Z0-9-_]/g, '');
  if (sanitizedId !== courseId) {
    return res.status(400).json({ error: 'Invalid course ID' });
  }
  
  const filePath = path.join(COURSES_DIR, `${sanitizedId}.jsx`);
  
  try {
    // Generate the JSX file content
    const fileContent = generateCourseFileContent(course, sanitizedId);
    
    // Write the file
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
 * Deletes a course file (custom courses only, not built-in)
 */
app.delete('/api/admin/courses/:courseId', verifyAdmin, (req, res) => {
  const { courseId } = req.params;
  
  // Protect built-in courses
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
 * Updates courses.jsx to include/exclude a course
 */
app.put('/api/admin/courses/:courseId/update', verifyAdmin, (req, res) => {
  const { courseId } = req.params;
  const { action } = req.body; // 'add' or 'remove'
  
  const coursesFilePath = path.join(COURSES_DIR, 'courses.jsx');
  
  try {
    let content = fs.readFileSync(coursesFilePath, 'utf8');
    const sanitizedId = courseId.replace(/[^a-zA-Z0-9-_]/g, '');
    const varName = sanitizedId.replace(/-/g, '').replace(/(\d+)/, '$1Course'); // e.g., py101 -> py101Course
    const importName = sanitizedId.replace(/-(\d+)/, '$1Course'); // e.g., py-101 -> py101Course
    
    if (action === 'add') {
      // Add import if not exists
      const importLine = `import { ${importName} } from './${sanitizedId}.jsx';`;
      if (!content.includes(importLine)) {
        // Add after the last import
        const lastImportIndex = content.lastIndexOf("import {");
        const lineEnd = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, lineEnd + 1) + importLine + '\n' + content.slice(lineEnd + 1);
      }
      
      // Add to COURSES array if not exists
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

/**
 * Helper function to generate course file content
 */
function generateCourseFileContent(course, courseId) {
  // Convert course object to JSX file format
  const varName = courseId.replace(/-/g, '').replace(/(\d+)/, '$1') + 'Course';
  
  // Deep clone and prepare course for serialization
  const serializableCourse = JSON.parse(JSON.stringify(course));
  
  // Remove any React elements (icon) - they'll be regenerated
  delete serializableCourse.icon;
  
  // Convert modules
  const modulesStr = serializableCourse.modules.map(mod => {
    let modStr = '    {\n';
    for (const [key, value] of Object.entries(mod)) {
      if (key === 'requiredSyntax' || key === 'stepSyntax') {
        // Skip legacy regex fields
        continue;
      }
      modStr += `      ${key}: ${formatValue(value, key)},\n`;
    }
    modStr += '    }';
    return modStr;
  }).join(',\n');

  // Determine icon based on course
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
 * Helper to format values for JSX output
 */
function formatValue(value, key = '') {
  if (value === null || value === undefined) {
    return 'null';
  }
  if (typeof value === 'string') {
    // Use template literals for multiline strings
    if (value.includes('\n') || value.includes('`')) {
      // Escape backticks and ${
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
    const items = value.map(v => formatValue(v));
    if (items.join(', ').length < 60) {
      return '[' + items.join(', ') + ']';
    }
    return '[\n        ' + items.join(',\n        ') + '\n      ]';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2).replace(/\n/g, '\n      ');
  }
  return JSON.stringify(value);
}

app.listen(PORT, () => {
  console.log(`✅ CodeQuarry API server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${NODE_ENV}`);
  console.log(`🔗 CORS Origin: ${CORS_ORIGIN}`);
});