-- Bootcamp Live Sessions & Enrollments
-- Migration for CodeQuarry Bootcamp feature

-- Bootcamp sessions table
CREATE TABLE IF NOT EXISTS bootcamp_sessions (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor_id INTEGER NOT NULL,
  instructor_name TEXT NOT NULL,
  room_id TEXT UNIQUE,                          -- 100ms room ID or Jitsi room name
  provider TEXT DEFAULT 'jitsi',                -- 'jitsi', '100ms', 'daily' etc.
  provider_room_data JSONB DEFAULT '{}',        -- provider-specific metadata
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 75,
  status TEXT DEFAULT 'scheduled',              -- 'scheduled', 'live', 'ended', 'cancelled'
  max_participants INTEGER DEFAULT 50,
  tags TEXT[] DEFAULT '{}',                     -- e.g. {'javascript', 'beginner'}
  recording_url TEXT,                           -- optional recording after session
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bootcamp enrollments table
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
);

-- Bootcamp live interactions (quiz/code triggers sent during class)
CREATE TABLE IF NOT EXISTS bootcamp_interactions (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL,
  type TEXT NOT NULL,                            -- 'quiz', 'code_editor', 'poll'
  payload JSONB NOT NULL,                        -- question/code template/poll data
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES bootcamp_sessions(id) ON DELETE CASCADE
);

-- Student responses to interactions
CREATE TABLE IF NOT EXISTS bootcamp_responses (
  id SERIAL PRIMARY KEY,
  interaction_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  response JSONB NOT NULL,                       -- answer/code submission
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  score INTEGER,
  UNIQUE(interaction_id, user_id),
  FOREIGN KEY (interaction_id) REFERENCES bootcamp_interactions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bootcamp_sessions_status ON bootcamp_sessions(status);
CREATE INDEX IF NOT EXISTS idx_bootcamp_sessions_scheduled ON bootcamp_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_bootcamp_enrollments_user ON bootcamp_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_bootcamp_enrollments_session ON bootcamp_enrollments(session_id);
CREATE INDEX IF NOT EXISTS idx_bootcamp_interactions_session ON bootcamp_interactions(session_id);
