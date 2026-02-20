-- ============================================================
-- CodeQuarry: Fix Missing Database Constraints on Heroku
-- ============================================================
-- The Node.js export script created tables WITHOUT constraints.
-- Since initDatabase uses CREATE TABLE IF NOT EXISTS, the 
-- constraint-less tables were never recreated.
-- This script adds all missing PRIMARY KEYs, UNIQUEs, and FKs.
-- ============================================================
-- Run with: heroku pg:psql < fix-heroku-constraints.sql
-- ============================================================

BEGIN;

-- ========== 1. users table ==========
-- Add PRIMARY KEY on id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_pkey'
  ) THEN
    ALTER TABLE users ADD PRIMARY KEY (id);
  END IF;
END $$;

-- Add UNIQUE on username
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_username_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
  END IF;
END $$;

-- Add UNIQUE on email
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_email_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
  END IF;
END $$;

-- Ensure has_completed_onboarding column exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false;

-- ========== 2. user_sessions table ==========
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_sessions_pkey'
  ) THEN
    ALTER TABLE user_sessions ADD PRIMARY KEY (id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_sessions_token_key'
  ) THEN
    ALTER TABLE user_sessions ADD CONSTRAINT user_sessions_token_key UNIQUE (token);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_sessions_user_id_fkey'
  ) THEN
    ALTER TABLE user_sessions ADD CONSTRAINT user_sessions_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ========== 3. module_progress table ==========
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'module_progress_pkey'
  ) THEN
    ALTER TABLE module_progress ADD PRIMARY KEY (id);
  END IF;
END $$;

-- Remove duplicate rows before adding UNIQUE constraint
DELETE FROM module_progress a
  USING module_progress b
  WHERE a.id < b.id
    AND a.user_id = b.user_id
    AND a.course_id = b.course_id
    AND a.module_id = b.module_id;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'module_progress_user_id_course_id_module_id_key'
  ) THEN
    ALTER TABLE module_progress ADD CONSTRAINT module_progress_user_id_course_id_module_id_key 
      UNIQUE (user_id, course_id, module_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'module_progress_user_id_fkey'
  ) THEN
    ALTER TABLE module_progress ADD CONSTRAINT module_progress_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ========== 4. user_stats table ==========
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_stats_pkey'
  ) THEN
    ALTER TABLE user_stats ADD PRIMARY KEY (user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_stats_user_id_fkey'
  ) THEN
    ALTER TABLE user_stats ADD CONSTRAINT user_stats_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ========== 5. activity_log table ==========
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'activity_log_pkey'
  ) THEN
    ALTER TABLE activity_log ADD PRIMARY KEY (id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'activity_log_user_id_fkey'
  ) THEN
    ALTER TABLE activity_log ADD CONSTRAINT activity_log_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ========== 6. refinery_progress table ==========
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'refinery_progress_pkey'
  ) THEN
    ALTER TABLE refinery_progress ADD PRIMARY KEY (id);
  END IF;
END $$;

-- Remove duplicate rows before adding UNIQUE constraint
DELETE FROM refinery_progress a
  USING refinery_progress b
  WHERE a.id < b.id
    AND a.user_id = b.user_id
    AND a.course_id = b.course_id
    AND a.module_id = b.module_id;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'refinery_progress_user_id_course_id_module_id_key'
  ) THEN
    ALTER TABLE refinery_progress ADD CONSTRAINT refinery_progress_user_id_course_id_module_id_key 
      UNIQUE (user_id, course_id, module_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'refinery_progress_user_id_fkey'
  ) THEN
    ALTER TABLE refinery_progress ADD CONSTRAINT refinery_progress_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ========== 7. cosmetics_inventory table ==========
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cosmetics_inventory_pkey'
  ) THEN
    ALTER TABLE cosmetics_inventory ADD PRIMARY KEY (id);
  END IF;
END $$;

-- Remove duplicate rows before adding UNIQUE constraint
DELETE FROM cosmetics_inventory a
  USING cosmetics_inventory b
  WHERE a.id < b.id
    AND a.user_id = b.user_id
    AND a.cosmetic_id = b.cosmetic_id;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cosmetics_inventory_user_id_cosmetic_id_key'
  ) THEN
    ALTER TABLE cosmetics_inventory ADD CONSTRAINT cosmetics_inventory_user_id_cosmetic_id_key 
      UNIQUE (user_id, cosmetic_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cosmetics_inventory_user_id_fkey'
  ) THEN
    ALTER TABLE cosmetics_inventory ADD CONSTRAINT cosmetics_inventory_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ========== 8. user_cosmetics table ==========
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_cosmetics_pkey'
  ) THEN
    ALTER TABLE user_cosmetics ADD PRIMARY KEY (user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_cosmetics_user_id_fkey'
  ) THEN
    ALTER TABLE user_cosmetics ADD CONSTRAINT user_cosmetics_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ========== 9. courses table ==========
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'courses_pkey'
  ) THEN
    ALTER TABLE courses ADD PRIMARY KEY (id);
  END IF;
END $$;

-- ========== 10. course_translations table ==========
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'course_translations_pkey'
  ) THEN
    ALTER TABLE course_translations ADD PRIMARY KEY (id);
  END IF;
END $$;

-- Remove duplicate rows before adding UNIQUE constraint
DELETE FROM course_translations a
  USING course_translations b
  WHERE a.id < b.id
    AND a.course_id = b.course_id
    AND a.language = b.language;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'course_translations_course_id_language_key'
  ) THEN
    ALTER TABLE course_translations ADD CONSTRAINT course_translations_course_id_language_key 
      UNIQUE (course_id, language);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'course_translations_course_id_fkey'
  ) THEN
    ALTER TABLE course_translations ADD CONSTRAINT course_translations_course_id_fkey 
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ========== 11. drafts table ==========
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'drafts_pkey'
  ) THEN
    ALTER TABLE drafts ADD PRIMARY KEY (id);
  END IF;
END $$;

COMMIT;

-- ============================================================
-- Done! All constraints should now be in place.
-- Restart your Heroku dyno after running this:
--   heroku ps:restart
-- ============================================================
