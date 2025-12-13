-- Migration: Add has_visited_practice column to users table
-- Purpose: Track whether users have seen the practice page tutorial
-- This is server-side to support shared classroom computers

-- Add the column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS has_visited_practice BOOLEAN DEFAULT false;

-- Create index for efficiency (optional, for faster lookups)
CREATE INDEX IF NOT EXISTS idx_users_has_visited_practice ON users(has_visited_practice);

-- Set all existing users as having visited (they already have the tutorial disabled)
-- Comment this out if you want new users to see the tutorial
-- UPDATE users SET has_visited_practice = true WHERE has_visited_practice IS NULL;
