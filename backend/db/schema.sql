CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name VARCHAR(40) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0),
  duration_seconds SMALLINT NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A server-side record makes each signed game ticket single-use and lets the
-- API validate a run against server time rather than the browser clock.
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  score_id UUID REFERENCES scores(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS game_sessions_user_id_started_at_idx
  ON game_sessions (user_id, started_at DESC);
