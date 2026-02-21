/**
 * Compile Routes
 * Handles C code compilation via Piston API
 */

import { Router } from 'express';
import fetch from 'node-fetch';
import { API_ENDPOINT } from '../config/constants.js';

const router = Router();

/**
 * POST /api/v1/compile-c
 * Compiles and runs C code using Piston API (free, unlimited)
 * @param {string} code - C source code to compile
 * @returns {Object} { output: string } or error
 */
router.post('/v1/compile-c', async (req, res) => {
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
        ],
        stdin: req.body.stdin || ''
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

/**
 * POST /api/compile-c
 * Fallback for v0 (backward compatibility)
 */
router.post('/compile-c', (req, res, next) => {
  console.warn('[DEPRECATED] Using /api/compile-c. Please use /api/v1/compile-c instead.');
  // Forward to v1 handler
  req.url = '/v1/compile-c';
  next();
});

/**
 * POST /api/v1/execute
 * Multi-language code execution via Piston API
 * Supports: javascript, python, c, java, typescript, ruby, go, rust, php, etc.
 */
const PISTON_LANGUAGES = {
  javascript: { language: 'javascript', version: '18.15.0', filename: 'main.js' },
  python: { language: 'python', version: '3.10.0', filename: 'main.py' },
  c: { language: 'c', version: '10.2.0', filename: 'main.c' },
  cpp: { language: 'c++', version: '10.2.0', filename: 'main.cpp' },
  java: { language: 'java', version: '15.0.2', filename: 'Main.java' },
  typescript: { language: 'typescript', version: '5.0.3', filename: 'main.ts' },
  ruby: { language: 'ruby', version: '3.0.1', filename: 'main.rb' },
  go: { language: 'go', version: '1.16.2', filename: 'main.go' },
  rust: { language: 'rust', version: '1.68.2', filename: 'main.rs' },
  php: { language: 'php', version: '8.2.3', filename: 'main.php' }
};

router.post('/v1/execute', async (req, res) => {
  const { code, language, stdin } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  const lang = (language || 'javascript').toLowerCase();
  const config = PISTON_LANGUAGES[lang];
  if (!config) {
    return res.status(400).json({ error: `Unsupported language: ${lang}. Supported: ${Object.keys(PISTON_LANGUAGES).join(', ')}` });
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: config.language,
        version: config.version,
        files: [{ name: config.filename, content: code }],
        stdin: stdin || '',
        compile_timeout: 10000,
        run_timeout: 5000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Piston API error: ${response.status}`);
    }

    const result = await response.json();
    let output = '';
    let stderr = '';

    if (result.compile?.stderr) {
      stderr = result.compile.stderr;
    }
    if (result.run?.output) {
      output = result.run.output;
    }
    if (result.run?.stderr) {
      stderr += (stderr ? '\n' : '') + result.run.stderr;
    }
    if (result.compile?.output && !output) {
      output = result.compile.output;
    }

    res.json({ output: output || '', stderr: stderr || '', language: lang });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Execution error (${lang}):`, err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
