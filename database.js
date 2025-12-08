/**
 * Database Module for CodeQuarry - PostgreSQL Version
 * Uses PostgreSQL for user management, authentication, and progress tracking
 */

import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Connected to PostgreSQL database');
  }
});

/**
 * Initialize database tables
 */
const initDatabase = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        display_name TEXT,
        avatar_url TEXT,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);

    // User sessions table (for persistent login)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // NOTE: course_progress removed in schema simplification
    // Course completion is now derived from module_progress

    // Module progress table
    await client.query(`
      CREATE TABLE IF NOT EXISTS module_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        course_id TEXT NOT NULL,
        module_id TEXT NOT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        saved_code TEXT,
        hints_used INTEGER DEFAULT 0,
        time_spent_seconds INTEGER DEFAULT 0,
        UNIQUE(user_id, course_id, module_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // NOTE: step_progress removed in schema simplification
    // Step tracking is handled at module level via saved_code

    // User stats table (aggregated for dashboard)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        user_id INTEGER PRIMARY KEY,
        total_modules_completed INTEGER DEFAULT 0,
        total_courses_completed INTEGER DEFAULT 0,
        total_steps_completed INTEGER DEFAULT 0,
        total_time_spent_seconds INTEGER DEFAULT 0,
        current_streak_days INTEGER DEFAULT 0,
        longest_streak_days INTEGER DEFAULT 0,
        last_activity_date DATE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Activity log table (for streaks and activity tracking)
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        activity_type TEXT NOT NULL,
        course_id TEXT,
        module_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Courses table - stores full course data as JSONB
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        custom_icon_url TEXT,
        language TEXT DEFAULT 'javascript',
        difficulty TEXT DEFAULT 'copper',
        is_published BOOLEAN DEFAULT false,
        is_premium BOOLEAN DEFAULT false,
        author_id INTEGER,
        modules JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Course translations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_translations (
        id SERIAL PRIMARY KEY,
        course_id TEXT NOT NULL,
        language TEXT NOT NULL,
        translation_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(course_id, language),
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);

    // Migration: Add role column if it doesn't exist (for existing databases)
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'role'
        ) THEN
          ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
        END IF;
      END $$;
    `);

    await client.query('COMMIT');
    console.log('✅ Database tables initialized');
    
    // Auto-seed courses if table is empty
    await seedCoursesIfEmpty();
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Auto-seed courses if the courses table is empty
 */
const seedCoursesIfEmpty = async () => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM courses');
    const count = parseInt(result.rows[0].count);
    
    if (count > 0) {
      console.log(`📚 Courses table has ${count} courses`);
      return;
    }
    
    console.log('🌱 Seeding courses...');
    
    // JS-101 Course
    await pool.query(
      `INSERT INTO courses (id, title, description, icon, language, difficulty, is_published, modules)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      ['js-101', 'JavaScript for Newbs', 'The backbone of the web. Make websites come alive with JS.', '📜', 'javascript', 'copper', true, JSON.stringify([
        { id: 'js-m0', title: 'Welcome (Course Overview)', type: 'video', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', duration: '3:12', description: 'A short intro to what you will learn in this JavaScript mini-course.' },
        { id: 'js-m1', title: 'The Mic Check (Output)', type: 'practice', theory: '### Outputting Data\nIn JavaScript we use `console.log()` to display output.\n\n```javascript\nconsole.log("Hello World");\n```', instruction: 'Use `console.log()` to print "Hello World".', initialCode: '// Your journey begins here\n', language: 'javascript', expectedOutput: 'Hello World', hints: ['Type: console.log("Hello World")'], solution: 'console.log("Hello World");' },
        { id: 'js-m2', title: 'The Container Store (Variables)', type: 'article', readTime: '5 min', content: '### Variables in JavaScript\n\nUse `const` for constants and `let` when the value will change.\n\n```javascript\nconst name = "Player";\nlet score = 0;\n```' },
        { id: 'js-m3', title: 'Types & Math', type: 'practice', theory: '### Data Types & Math\nJavaScript has numbers, strings, booleans. Math operators: `+ - * / %`\n\n```javascript\nconsole.log(10 * 10); // 100\n```', instruction: 'Calculate and print `10 * 10`.', initialCode: '// console.log( ... )', language: 'javascript', expectedOutput: '100', hints: ['console.log(10 * 10)'], solution: 'console.log(10 * 10);' },
        { id: 'js-m4', title: 'Decisions (Conditionals)', type: 'article', readTime: '6 min', content: '### Conditionals\n\n```javascript\nif (age >= 18) {\n  console.log("Adult");\n} else {\n  console.log("Minor");\n}\n```' },
        { id: 'js-m5', title: 'Loops', type: 'practice', theory: '### Loops\n\n```javascript\nfor (let i = 0; i < 5; i++) {\n  console.log(i);\n}\n```', instruction: 'Print numbers 1 to 5 using a for loop.', initialCode: '// Write a loop\n', language: 'javascript', expectedOutput: '1\n2\n3\n4\n5', hints: ['for (let i = 1; i <= 5; i++)'], solution: 'for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}' },
        { id: 'js-m6', title: 'Functions', type: 'article', readTime: '7 min', content: '### Functions\n\n```javascript\nfunction greet(name) {\n  return "Hello, " + name + "!";\n}\n```' },
        { id: 'js-m7', title: 'Arrays', type: 'practice', theory: '### Arrays\n\n```javascript\nconst fruits = ["apple", "banana"];\nconsole.log(fruits[0]); // apple\n```', instruction: 'Create an array `colors` with "red", "green", "blue" and log the second item.', initialCode: '// Create array\n', language: 'javascript', expectedOutput: 'green', hints: ['const colors = ["red", "green", "blue"]'], solution: 'const colors = ["red", "green", "blue"];\nconsole.log(colors[1]);' },
        { id: 'js-m8', title: 'Objects', type: 'article', readTime: '6 min', content: '### Objects\n\n```javascript\nconst player = { name: "Alex", score: 100 };\nconsole.log(player.name); // Alex\n```' },
        { id: 'js-m9', title: 'Final Challenge', type: 'practice', theory: '### Putting It All Together', instruction: 'Create a function `sum(a, b)` that returns `a + b`. Print `sum(5, 3)`.', initialCode: '// Define sum\n', language: 'javascript', expectedOutput: '8', hints: ['function sum(a, b) { return a + b; }'], solution: 'function sum(a, b) {\n  return a + b;\n}\nconsole.log(sum(5, 3));' }
      ])]
    );
    
    // PY-101 Course
    await pool.query(
      `INSERT INTO courses (id, title, description, icon, language, difficulty, is_published, modules)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      ['py-101', 'Python for Newbs', 'The most beginner-friendly language. Perfect for AI, data, and automation.', '🐍', 'python', 'copper', true, JSON.stringify([
        { id: 'py-m0', title: 'Welcome to Python', type: 'video', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', duration: '4:30', description: 'Introduction to Python.' },
        { id: 'py-m1', title: 'Hello Python (Output)', type: 'practice', theory: '### The print() Function\n\n```python\nprint("Hello, World!")\n```', instruction: 'Use `print()` to display "Hello World".', initialCode: '# Start here\n', language: 'python', expectedOutput: 'Hello World', hints: ['print("Hello World")'], solution: 'print("Hello World")' },
        { id: 'py-m2', title: 'Variables & Types', type: 'article', readTime: '5 min', content: '### Variables in Python\n\n```python\nname = "Alex"\nage = 25\n```' },
        { id: 'py-m3', title: 'Math Operations', type: 'practice', theory: '### Math in Python\n\n```python\nprint(10 + 5)  # 15\n```', instruction: 'Calculate and print `7 * 8`.', initialCode: '# Calculate\n', language: 'python', expectedOutput: '56', hints: ['print(7 * 8)'], solution: 'print(7 * 8)' },
        { id: 'py-m4', title: 'Conditionals', type: 'article', readTime: '6 min', content: '### If Statements\n\n```python\nif age >= 18:\n    print("Adult")\n```' },
        { id: 'py-m5', title: 'Loops', type: 'practice', theory: '### For Loops\n\n```python\nfor i in range(5):\n    print(i)\n```', instruction: 'Print 1 through 5 using a for loop.', initialCode: '# Print 1 to 5\n', language: 'python', expectedOutput: '1\n2\n3\n4\n5', hints: ['for i in range(1, 6):'], solution: 'for i in range(1, 6):\n    print(i)' },
        { id: 'py-m6', title: 'Functions', type: 'article', readTime: '7 min', content: '### Functions\n\n```python\ndef greet(name):\n    return f"Hello, {name}!"\n```' },
        { id: 'py-m7', title: 'Lists', type: 'practice', theory: '### Lists\n\n```python\nfruits = ["apple", "banana"]\nprint(fruits[0])\n```', instruction: 'Create a list `numbers` with 10, 20, 30 and print `sum(numbers)`.', initialCode: '# Create list\n', language: 'python', expectedOutput: '60', hints: ['numbers = [10, 20, 30]'], solution: 'numbers = [10, 20, 30]\nprint(sum(numbers))' },
        { id: 'py-m8', title: 'Dictionaries', type: 'article', readTime: '6 min', content: '### Dictionaries\n\n```python\nperson = {"name": "Alex", "age": 25}\n```' },
        { id: 'py-m9', title: 'Final Challenge', type: 'practice', theory: '### Putting It All Together', instruction: 'Create a function `double(n)` that returns `n * 2`. Print `double(21)`.', initialCode: '# Define double\n', language: 'python', expectedOutput: '42', hints: ['def double(n): return n * 2'], solution: 'def double(n):\n    return n * 2\n\nprint(double(21))' }
      ])]
    );
    
    // C-101 Course
    await pool.query(
      `INSERT INTO courses (id, title, description, icon, language, difficulty, is_published, modules)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      ['c-101', 'C for Newbs', 'The foundation of modern computing. Learn memory, pointers, and raw power.', '⚙️', 'c', 'copper', true, JSON.stringify([
        { id: 'c-m0', title: 'Welcome to C', type: 'video', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', duration: '5:00', description: 'Introduction to C programming.' },
        { id: 'c-m1', title: 'Hello C (Output)', type: 'practice', theory: '### The printf() Function\n\n```c\n#include <stdio.h>\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}\n```', instruction: 'Print "Hello World" using printf.', initialCode: '#include <stdio.h>\n\nint main() {\n    // Your code\n    return 0;\n}\n', language: 'c', expectedOutput: 'Hello World', hints: ['printf("Hello World\\n");'], solution: '#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}' },
        { id: 'c-m2', title: 'Variables & Types', type: 'article', readTime: '6 min', content: '### C Data Types\n\n```c\nint age = 25;\nfloat price = 19.99;\nchar grade = \'A\';\n```' },
        { id: 'c-m3', title: 'Math & Operators', type: 'practice', theory: '### Math in C\n\n```c\nprintf("%d\\n", 10 + 5);\n```', instruction: 'Calculate and print `12 * 4`.', initialCode: '#include <stdio.h>\n\nint main() {\n    // Calculate\n    return 0;\n}\n', language: 'c', expectedOutput: '48', hints: ['printf("%d\\n", 12 * 4);'], solution: '#include <stdio.h>\n\nint main() {\n    printf("%d\\n", 12 * 4);\n    return 0;\n}' },
        { id: 'c-m4', title: 'Conditionals', type: 'article', readTime: '5 min', content: '### If Statements\n\n```c\nif (age >= 18) {\n    printf("Adult\\n");\n}\n```' },
        { id: 'c-m5', title: 'Loops', type: 'practice', theory: '### For Loop\n\n```c\nfor (int i = 0; i < 5; i++) {\n    printf("%d\\n", i);\n}\n```', instruction: 'Print 1 through 5 using a for loop.', initialCode: '#include <stdio.h>\n\nint main() {\n    // Loop\n    return 0;\n}\n', language: 'c', expectedOutput: '1\n2\n3\n4\n5', hints: ['for (int i = 1; i <= 5; i++)'], solution: '#include <stdio.h>\n\nint main() {\n    for (int i = 1; i <= 5; i++) {\n        printf("%d\\n", i);\n    }\n    return 0;\n}' },
        { id: 'c-m6', title: 'Functions', type: 'article', readTime: '7 min', content: '### Functions\n\n```c\nint add(int a, int b) {\n    return a + b;\n}\n```' },
        { id: 'c-m7', title: 'Arrays', type: 'practice', theory: '### Arrays\n\n```c\nint nums[3] = {10, 20, 30};\nprintf("%d", nums[0]);\n```', instruction: 'Create an array with 2, 4, 6 and print index 1.', initialCode: '#include <stdio.h>\n\nint main() {\n    // Array\n    return 0;\n}\n', language: 'c', expectedOutput: '4', hints: ['int arr[3] = {2, 4, 6};'], solution: '#include <stdio.h>\n\nint main() {\n    int arr[3] = {2, 4, 6};\n    printf("%d\\n", arr[1]);\n    return 0;\n}' },
        { id: 'c-m8', title: 'Pointers (Intro)', type: 'article', readTime: '8 min', content: '### Pointers\n\n```c\nint x = 42;\nint *ptr = &x;\nprintf("%d", *ptr); // 42\n```' },
        { id: 'c-m9', title: 'Final Challenge', type: 'practice', theory: '### Putting It All Together', instruction: 'Create a function `square(n)` that returns `n * n`. Print `square(7)`.', initialCode: '#include <stdio.h>\n\n// Define square\n\nint main() {\n    // Call square(7)\n    return 0;\n}\n', language: 'c', expectedOutput: '49', hints: ['int square(int n) { return n * n; }'], solution: '#include <stdio.h>\n\nint square(int n) {\n    return n * n;\n}\n\nint main() {\n    printf("%d\\n", square(7));\n    return 0;\n}' }
      ])]
    );
    
    console.log('✅ Courses seeded successfully (3 courses, 30 modules)');
  } catch (error) {
    console.error('⚠️ Error seeding courses:', error.message);
    // Don't throw - seeding failure shouldn't crash the app
  }
};

// Initialize on module load
initDatabase().catch(console.error);

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * Create a new user
 * @param {string} username 
 * @param {string} email 
 * @param {string} password 
 * @returns {Object} Created user (without password)
 */
export const createUser = async (username, email, password) => {
  const passwordHash = bcrypt.hashSync(password, 10);
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const result = await client.query(
      `INSERT INTO users (username, email, password_hash, display_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, display_name, created_at`,
      [username, email.toLowerCase(), passwordHash, username]
    );
    
    const user = result.rows[0];
    
    // Initialize user stats
    await client.query('INSERT INTO user_stats (user_id) VALUES ($1)', [user.id]);
    
    await client.query('COMMIT');
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
      createdAt: user.created_at
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Find user by username or email
 * @param {string} identifier - Username or email
 * @returns {Object|null} User object or null
 */
export const findUser = async (identifier) => {
  const result = await pool.query(
    `SELECT id, username, email, password_hash, display_name, avatar_url, role, created_at, last_login_at
     FROM users 
     WHERE (username = $1 OR email = $2) AND is_active = true`,
    [identifier, identifier.toLowerCase()]
  );
  return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {number} id 
 * @returns {Object|null}
 */
export const findUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, username, email, display_name, avatar_url, role, created_at, last_login_at
     FROM users 
     WHERE id = $1 AND is_active = true`,
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Verify user password
 * @param {string} password 
 * @param {string} hash 
 * @returns {boolean}
 */
export const verifyPassword = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};

/**
 * Update user's last login time
 * @param {number} userId 
 */
export const updateLastLogin = async (userId) => {
  await pool.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
};

/**
 * Update user profile
 * @param {number} userId 
 * @param {Object} updates 
 */
export const updateUserProfile = async (userId, updates) => {
  const allowedFields = ['display_name', 'avatar_url'];
  const setClause = [];
  const values = [];
  let paramIndex = 1;
  
  for (const [key, value] of Object.entries(updates)) {
    const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbKey)) {
      setClause.push(`${dbKey} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }
  
  if (setClause.length === 0) return null;
  
  values.push(userId);
  await pool.query(
    `UPDATE users SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`,
    values
  );
  
  return await findUserById(userId);
};

/**
 * Change user password
 * @param {number} userId 
 * @param {string} newPassword 
 */
export const changePassword = async (userId, newPassword) => {
  const passwordHash = bcrypt.hashSync(newPassword, 10);
  await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [passwordHash, userId]
  );
};

/**
 * Get all users (admin only)
 * @returns {Array} All users without password hashes
 */
export const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT id, username, email, display_name, avatar_url, role, created_at, last_login_at, updated_at
     FROM users
     ORDER BY created_at DESC`
  );
  return result.rows;
};

/**
 * Delete a user and all related data
 * All related tables have ON DELETE CASCADE, so deleting from users table
 * automatically cleans up: user_sessions, course_progress, module_progress,
 * step_progress, user_stats, activity_log
 * @param {number} userId 
 */
export const deleteUser = async (userId) => {
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
};

/**
 * Update user role
 * @param {number} userId 
 * @param {string} role - 'user' or 'admin'
 */
export const updateUserRole = async (userId, role) => {
  await pool.query(
    'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [role, userId]
  );
};

/**
 * Check if username exists
 * @param {string} username 
 * @returns {boolean}
 */
export const usernameExists = async (username) => {
  const result = await pool.query('SELECT 1 FROM users WHERE username = $1', [username]);
  return result.rows.length > 0;
};

/**
 * Check if email exists
 * @param {string} email 
 * @returns {boolean}
 */
export const emailExists = async (email) => {
  const result = await pool.query('SELECT 1 FROM users WHERE email = $1', [email.toLowerCase()]);
  return result.rows.length > 0;
};

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Create a session for a user
 * @param {number} userId 
 * @param {string} token 
 * @param {number} expiresInHours 
 */
export const createSession = async (userId, token, expiresInHours = 24 * 7) => {
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  await pool.query(
    'INSERT INTO user_sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );
};

/**
 * Find session by token
 * @param {string} token 
 * @returns {Object|null}
 */
export const findSession = async (token) => {
  const result = await pool.query(
    `SELECT s.*, u.id as user_id, u.username, u.email, u.display_name
     FROM user_sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.token = $1 AND s.expires_at > NOW()`,
    [token]
  );
  return result.rows[0] || null;
};

/**
 * Delete session (logout)
 * @param {string} token 
 */
export const deleteSession = async (token) => {
  await pool.query('DELETE FROM user_sessions WHERE token = $1', [token]);
};

/**
 * Delete all sessions for a user
 * @param {number} userId 
 */
export const deleteAllUserSessions = async (userId) => {
  await pool.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
};

/**
 * Clean up expired sessions
 */
export const cleanupExpiredSessions = async () => {
  const result = await pool.query("DELETE FROM user_sessions WHERE expires_at < NOW()");
  return result.rowCount;
};

// ============================================
// PROGRESS TRACKING
// ============================================

/**
 * Save or update module progress
 * @param {number} userId 
 * @param {string} courseId 
 * @param {string} moduleId 
 * @param {Object} data 
 */
export const saveModuleProgress = async (userId, courseId, moduleId, data = {}) => {
  const { savedCode, hintsUsed, timeSpentSeconds, completed } = data;
  
  // Upsert module progress (course progress is derived from this)
  await pool.query(
    `INSERT INTO module_progress (user_id, course_id, module_id, saved_code, hints_used, time_spent_seconds, completed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (user_id, course_id, module_id) DO UPDATE SET
       saved_code = COALESCE($4, module_progress.saved_code),
       hints_used = COALESCE($5, module_progress.hints_used),
       time_spent_seconds = module_progress.time_spent_seconds + COALESCE($6, 0),
       completed_at = CASE WHEN $8 = true THEN CURRENT_TIMESTAMP ELSE module_progress.completed_at END`,
    [userId, courseId, moduleId, savedCode || null, hintsUsed || 0, timeSpentSeconds || 0, completed ? new Date() : null, !!completed]
  );
  
  // Log activity
  await logActivity(userId, completed ? 'module_completed' : 'module_progress', courseId, moduleId);
  
  // Update stats if completed
  if (completed) {
    await updateUserStats(userId);
  }
};

// NOTE: saveStepProgress removed in schema simplification
// Step-level tracking is now handled at module level via saved_code in module_progress

/**
 * Get all progress for a user
 * @param {number} userId 
 * @returns {Object}
 */
export const getUserProgress = async (userId) => {
  // Get module progress (course progress derived from this)
  const modulesResult = await pool.query(
    `SELECT course_id, module_id, started_at, completed_at, saved_code, hints_used, time_spent_seconds
     FROM module_progress WHERE user_id = $1`,
    [userId]
  );
  
  // Derive course progress from modules
  const courseMap = {};
  for (const mod of modulesResult.rows) {
    if (!courseMap[mod.course_id]) {
      courseMap[mod.course_id] = { course_id: mod.course_id, started_at: mod.started_at, modules: [] };
    }
    courseMap[mod.course_id].modules.push(mod);
  }
  
  return {
    courses: Object.values(courseMap),
    modules: modulesResult.rows
  };
};

/**
 * Get progress for a specific course
 * @param {number} userId 
 * @param {string} courseId 
 * @returns {Object}
 */
export const getCourseProgress = async (userId, courseId) => {
  const modulesResult = await pool.query(
    'SELECT * FROM module_progress WHERE user_id = $1 AND course_id = $2',
    [userId, courseId]
  );
  
  // Derive course progress from modules
  const modules = modulesResult.rows;
  const course = modules.length > 0 ? {
    course_id: courseId,
    started_at: modules.reduce((min, m) => m.started_at < min ? m.started_at : min, modules[0].started_at),
    completed_at: modules.every(m => m.completed_at) ? modules.reduce((max, m) => m.completed_at > max ? m.completed_at : max, modules[0].completed_at) : null
  } : null;
  
  return {
    course,
    modules
  };
};

/**
 * Get saved code for a module
 * @param {number} userId 
 * @param {string} courseId 
 * @param {string} moduleId 
 * @returns {string|null}
 */
export const getSavedCode = async (userId, courseId, moduleId) => {
  const result = await pool.query(
    `SELECT saved_code FROM module_progress 
     WHERE user_id = $1 AND course_id = $2 AND module_id = $3`,
    [userId, courseId, moduleId]
  );
  
  return result.rows[0]?.saved_code || null;
};

// ============================================
// STATS & ANALYTICS
// ============================================

/**
 * Log user activity
 * @param {number} userId 
 * @param {string} activityType 
 * @param {string} courseId 
 * @param {string} moduleId 
 */
export const logActivity = async (userId, activityType, courseId = null, moduleId = null) => {
  await pool.query(
    `INSERT INTO activity_log (user_id, activity_type, course_id, module_id)
     VALUES ($1, $2, $3, $4)`,
    [userId, activityType, courseId, moduleId]
  );
  
  // Update streak
  await updateStreak(userId);
};

/**
 * Update user streak
 * @param {number} userId 
 */
const updateStreak = async (userId) => {
  const today = new Date().toISOString().split('T')[0];
  const statsResult = await pool.query(
    'SELECT last_activity_date, current_streak_days, longest_streak_days FROM user_stats WHERE user_id = $1',
    [userId]
  );
  
  const stats = statsResult.rows[0];
  if (!stats) return;
  
  const lastActivity = stats.last_activity_date ? stats.last_activity_date.toISOString().split('T')[0] : null;
  
  if (lastActivity !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let newStreak = stats.current_streak_days;
    
    if (lastActivity === yesterday) {
      // Continuing streak
      newStreak = stats.current_streak_days + 1;
    } else if (!lastActivity || lastActivity < yesterday) {
      // Streak broken, start new one
      newStreak = 1;
    }
    
    const longestStreak = Math.max(newStreak, stats.longest_streak_days);
    
    await pool.query(
      `UPDATE user_stats 
       SET last_activity_date = $1, current_streak_days = $2, longest_streak_days = $3
       WHERE user_id = $4`,
      [today, newStreak, longestStreak, userId]
    );
  }
};

/**
 * Update user stats (call after completing modules)
 * @param {number} userId 
 */
export const updateUserStats = async (userId) => {
  // Count completed modules
  const modulesResult = await pool.query(
    `SELECT COUNT(*) as count FROM module_progress 
     WHERE user_id = $1 AND completed_at IS NOT NULL`,
    [userId]
  );
  const modulesCompleted = parseInt(modulesResult.rows[0]?.count) || 0;
  
  // Count distinct courses with at least one completed module (derived)
  const coursesResult = await pool.query(
    `SELECT COUNT(DISTINCT course_id) as count FROM module_progress 
     WHERE user_id = $1 AND completed_at IS NOT NULL`,
    [userId]
  );
  const coursesCompleted = parseInt(coursesResult.rows[0]?.count) || 0;
  
  // Total time spent
  const timeResult = await pool.query(
    'SELECT SUM(time_spent_seconds) as total FROM module_progress WHERE user_id = $1',
    [userId]
  );
  const timeSpent = parseInt(timeResult.rows[0]?.total) || 0;
  
  // Insert or update user stats
  await pool.query(
    `INSERT INTO user_stats (user_id, total_modules_completed, total_courses_completed, total_time_spent_seconds)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE SET
       total_modules_completed = $2,
       total_courses_completed = $3,
       total_time_spent_seconds = $4`,
    [userId, modulesCompleted, coursesCompleted, timeSpent]
  );
};

/**
 * Get user stats for dashboard
 * @param {number} userId 
 * @returns {Object}
 */
export const getUserStats = async (userId) => {
  const statsResult = await pool.query('SELECT * FROM user_stats WHERE user_id = $1', [userId]);
  const stats = statsResult.rows[0];
  
  // Get recent activity (last 7 days)
  const activityResult = await pool.query(
    `SELECT DATE(created_at) as date, COUNT(*) as count
     FROM activity_log
     WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days'
     GROUP BY DATE(created_at)
     ORDER BY date DESC`,
    [userId]
  );
  
  // Get courses in progress (derived from module_progress)
  const coursesResult = await pool.query(
    `SELECT DISTINCT course_id, MIN(started_at) as started_at
     FROM module_progress
     WHERE user_id = $1
     GROUP BY course_id
     HAVING COUNT(*) > COUNT(completed_at)`,
    [userId]
  );
  
  return {
    ...stats,
    recentActivity: activityResult.rows,
    coursesInProgress: coursesResult.rows
  };
};

/**
 * Get completed module IDs for a user
 * @param {number} userId 
 * @returns {string[]}
 */
export const getCompletedModuleIds = async (userId) => {
  const result = await pool.query(
    `SELECT module_id FROM module_progress 
     WHERE user_id = $1 AND completed_at IS NOT NULL`,
    [userId]
  );
  
  return result.rows.map(r => r.module_id);
};

// ============================================
// COURSE TRANSLATIONS
// ============================================

/**
 * Save course translation
 * @param {string} courseId 
 * @param {string} language - Language code (id, es, fr, etc.)
 * @param {Object} translationData - Translation object with title, description, modules
 * @returns {Object} Saved translation
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
 * @param {string} courseId 
 * @param {string} language 
 * @returns {Object|null} Translation data or null
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
 * @param {string} courseId 
 * @returns {Object} Map of language -> translation data
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
 * @param {string} courseId 
 * @returns {string[]} Array of language codes
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
 * @param {string} courseId 
 * @param {string} language 
 */
export const deleteCourseTranslation = async (courseId, language) => {
  await pool.query(
    `DELETE FROM course_translations WHERE course_id = $1 AND language = $2`,
    [courseId, language]
  );
};

/**
 * Reset all progress for a course (call when updating course structure)
 * @param {string} courseId 
 */
export const resetCourseProgress = async (courseId) => {
  await pool.query(
    `DELETE FROM module_progress WHERE course_id = $1`,
    [courseId]
  );
};

// ============================================
// COURSE MANAGEMENT
// ============================================

/**
 * Create a new course
 * @param {Object} courseData 
 * @returns {Object} Created course
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
 * @param {boolean} publishedOnly 
 * @returns {Array} List of courses
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
 * @param {string} courseId 
 * @returns {Object|null} Course or null
 */
export const getCourse = async (courseId) => {
  const result = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);
  return result.rows[0] ? formatCourse(result.rows[0]) : null;
};

/**
 * Update a course
 * @param {string} courseId 
 * @param {Object} updates 
 * @returns {Object} Updated course
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
 * @param {string} courseId 
 */
export const deleteCourse = async (courseId) => {
  await pool.query('DELETE FROM courses WHERE id = $1', [courseId]);
};

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

// Graceful shutdown
process.on('SIGTERM', () => {
  pool.end(() => {
    console.log('PostgreSQL pool has ended');
  });
});

export default {
  // User management
  createUser,
  findUser,
  findUserById,
  getUserById: findUserById, // Alias for consistency
  verifyPassword,
  updateLastLogin,
  updateUserProfile,
  changePassword,
  usernameExists,
  emailExists,
  getAllUsers,
  deleteUser,
  updateUserRole,
  
  // Session management
  createSession,
  findSession,
  deleteSession,
  deleteAllUserSessions,
  cleanupExpiredSessions,
  
  // Progress tracking
  saveModuleProgress,
  getUserProgress,
  getCourseProgress,
  getSavedCode,
  getCompletedModuleIds,
  
  // Stats & analytics
  logActivity,
  updateUserStats,
  getUserStats,
  
  // Course management
  createCourse,
  getAllCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  
  // Course translations
  saveCourseTranslation,
  getCourseTranslation,
  getAllCourseTranslations,
  getCourseLanguages,
  deleteCourseTranslation,
  resetCourseProgress,
  
  // Pool for advanced queries
  pool
};
