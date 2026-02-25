/**
 * Database Module - Modular Entry Point
 * Consolidates all database models and provides initialization
 */

import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
import pool from './connection.js';

// Import models
import * as User from './models/User.js';
import * as Progress from './models/Progress.js';
import * as Cosmetic from './models/Cosmetic.js';
import * as Course from './models/Course.js';
import * as Draft from './models/Draft.js';
import * as Admin from './models/Admin.js';
import * as Bootcamp from './models/Bootcamp.js';
import * as Batch from './models/Batch.js';

const { Pool } = pg;

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
        bio TEXT,
        role TEXT DEFAULT 'user',
        custom_role VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);
    
    // Add bio, custom_role, and total_gems columns if they don't exist (migration)
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS custom_role VARCHAR(50),
      ADD COLUMN IF NOT EXISTS total_gems INTEGER DEFAULT 0
    `);

    // Add has_visited_practice and has_completed_onboarding columns separately
    try {
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS has_visited_practice BOOLEAN DEFAULT false
      `);
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false
      `);
    } catch (err) {
      // Column may already exist, that's OK
      if (err.code !== '42701') { // 42701 = duplicate column
        console.warn('⚠️  Warning adding onboarding columns:', err.message);
      }
    }

    // User sessions table
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

    // User stats table
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
        total_gems INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Activity log table
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

    // Refinery progress table
    await client.query(`
      CREATE TABLE IF NOT EXISTS refinery_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        course_id TEXT NOT NULL,
        module_id TEXT NOT NULL,
        best_score INTEGER DEFAULT 0,
        best_rank TEXT,
        gems_earned INTEGER DEFAULT 0,
        metrics JSONB,
        achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, course_id, module_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Cosmetics inventory table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cosmetics_inventory (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        cosmetic_id TEXT NOT NULL,
        purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, cosmetic_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // User cosmetics (equipped) table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_cosmetics (
        user_id INTEGER PRIMARY KEY,
        equipped_theme TEXT,
        equipped_title TEXT,
        equipped_name_color TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Courses table
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
        modules JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    // Course Drafts table (for collaborative course creation/editing)
    await client.query(`
      CREATE TABLE IF NOT EXISTS drafts (
        id SERIAL PRIMARY KEY,
        course_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        custom_icon_url TEXT,
        language TEXT DEFAULT 'javascript',
        difficulty TEXT DEFAULT 'easy',
        tier TEXT DEFAULT 'Copper',
        modules JSONB DEFAULT '[]',
        created_by INTEGER NOT NULL,
        creator_name TEXT NOT NULL,
        last_edited_by INTEGER,
        editor_name TEXT,
        status TEXT DEFAULT 'in_progress',
        review_notes TEXT,
        commission DECIMAL(10, 2) DEFAULT 0,
        completion_percentage INTEGER DEFAULT 0,
        collaborators JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (last_edited_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Bootcamp batches table (paid programs; sessions belong to a batch)
    await client.query(`
      CREATE TABLE IF NOT EXISTS bootcamp_batches (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        price DECIMAL(12, 2) NOT NULL DEFAULT 0,
        currency TEXT DEFAULT 'IDR',
        instructor_id INTEGER NOT NULL,
        instructor_name TEXT NOT NULL,
        max_participants INTEGER DEFAULT 30,
        start_date DATE,
        end_date DATE,
        status TEXT DEFAULT 'open',
        is_public BOOLEAN DEFAULT false,
        bank_account JSONB DEFAULT '{}',
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Bootcamp sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bootcamp_sessions (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        instructor_id INTEGER NOT NULL,
        instructor_name TEXT NOT NULL,
        room_id TEXT UNIQUE,
        provider TEXT DEFAULT '100ms',
        provider_room_data JSONB DEFAULT '{}',
        scheduled_at TIMESTAMP NOT NULL,
        duration_minutes INTEGER DEFAULT 75,
        status TEXT DEFAULT 'scheduled',
        max_participants INTEGER DEFAULT 50,
        tags TEXT[] DEFAULT '{}',
        recording_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Add batch_id to sessions if not present (safe on existing DBs)
    await client.query(`
      ALTER TABLE bootcamp_sessions
        ADD COLUMN IF NOT EXISTS batch_id INTEGER REFERENCES bootcamp_batches(id) ON DELETE SET NULL
    `);

    // Bootcamp enrollments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bootcamp_enrollments (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        attended BOOLEAN DEFAULT false,
        joined_at TIMESTAMP,
        left_at TIMESTAMP,
        UNIQUE(session_id, user_id),
        FOREIGN KEY (session_id) REFERENCES bootcamp_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Bootcamp live interactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bootcamp_interactions (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        payload JSONB NOT NULL,
        triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        closed_at TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES bootcamp_sessions(id) ON DELETE CASCADE
      )
    `);

    // Bootcamp responses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bootcamp_responses (
        id SERIAL PRIMARY KEY,
        interaction_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        response JSONB NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        score INTEGER,
        UNIQUE(interaction_id, user_id),
        FOREIGN KEY (interaction_id) REFERENCES bootcamp_interactions(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Batch enrollments table (payment tracking for paid batches)
    await client.query(`
      CREATE TABLE IF NOT EXISTS batch_enrollments (
        id SERIAL PRIMARY KEY,
        batch_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        payment_method TEXT NOT NULL DEFAULT 'manual',
        payment_status TEXT NOT NULL DEFAULT 'pending',
        payment_ref TEXT,
        transfer_notes TEXT,
        amount_paid DECIMAL(12, 2) DEFAULT 0,
        snap_token TEXT,
        approved_by INTEGER,
        approved_at TIMESTAMP,
        rejected_reason TEXT,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(batch_id, user_id),
        FOREIGN KEY (batch_id) REFERENCES bootcamp_batches(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Certificate templates (one per batch, admin-authored)
    await client.query(`
      CREATE TABLE IF NOT EXISTS batch_certificate_templates (
        id SERIAL PRIMARY KEY,
        batch_id INTEGER NOT NULL UNIQUE,
        title TEXT NOT NULL DEFAULT 'Certificate of Completion',
        subtitle TEXT DEFAULT 'This certifies that',
        body_text TEXT DEFAULT '{{studentName}} has successfully completed {{batchTitle}}.',
        instructor_name TEXT,
        footer_text TEXT DEFAULT 'CodeQuarry Online Learning Platform',
        accent_color TEXT DEFAULT '#7c3aed',
        attendance_threshold INTEGER DEFAULT 75,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (batch_id) REFERENCES bootcamp_batches(id) ON DELETE CASCADE
      )
    `);

    // Issued certificates (one per student per batch)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_certificates (
        id SERIAL PRIMARY KEY,
        cert_uuid TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
        batch_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        student_name TEXT NOT NULL,
        batch_title TEXT NOT NULL,
        instructor_name TEXT,
        completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        issued_by INTEGER,
        UNIQUE(batch_id, user_id),
        FOREIGN KEY (batch_id) REFERENCES bootcamp_batches(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await client.query('COMMIT');
    console.log('✅ Database tables initialized');

    // Check if courses exist
    const courseCount = await pool.query('SELECT COUNT(*) FROM courses');
    console.log(`📚 Courses table has ${courseCount.rows[0].count} courses`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Reseed courses (import from data files)
 */
export const reseedCourses = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Dynamic import of course data
    const { default: c101 } = await import('../src/data/c-101.jsx');
    const { default: js101 } = await import('../src/data/js-101.jsx');
    const { default: py101 } = await import('../src/data/py-101.jsx');
    
    const courses = [c101, js101, py101];
    
    for (const course of courses) {
      await client.query(
        `INSERT INTO courses (id, title, description, icon, language, difficulty, is_published, modules)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           title = $2, description = $3, icon = $4, language = $5, difficulty = $6, is_published = $7, modules = $8, updated_at = CURRENT_TIMESTAMP`,
        [course.id, course.title, course.description, course.icon, course.language, course.difficulty, course.isPublished, JSON.stringify(course.modules)]
      );
    }
    
    await client.query('COMMIT');
    console.log(`✅ Reseeded ${courses.length} courses`);
    return { success: true, coursesReseeded: courses.length };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error reseeding courses:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

// Initialize on module load
initDatabase().catch(console.error);

// Graceful shutdown
process.on('SIGTERM', () => {
  pool.end(() => {
    console.log('PostgreSQL pool has ended');
  });
});

// Export all functions from models
export default {
  // User management
  ...User,
  getUserById: User.findUserById, // Alias for consistency
  
  // Progress tracking
  ...Progress,
  
  // Cosmetics system
  ...Cosmetic,
  
  // Course management
  ...Course,
  
  // Draft management (collaborative course creation)
  ...Draft,
  
  // Admin operations
  ...Admin,
  reseedCourses,

  // Bootcamp operations
  ...Bootcamp,

  // Batch (paid programs) operations
  ...Batch,
  
  // Pool for advanced queries
  pool
};
