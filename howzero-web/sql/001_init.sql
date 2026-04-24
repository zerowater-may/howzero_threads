-- 001_init.sql
-- Howzero Web 초기 스키마

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

CREATE TABLE IF NOT EXISTS invite_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  max_uses INT DEFAULT 1,
  used_count INT DEFAULT 0,
  created_by TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS threads_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  threads_user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  profile_picture_url TEXT,
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  app_id TEXT NOT NULL,
  app_secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_token_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, threads_user_id)
);

DO $$ BEGIN
  CREATE TYPE media_type AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'CAROUSEL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE post_status AS ENUM ('PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS scheduled_posts (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES threads_accounts(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  media_type media_type DEFAULT 'TEXT',
  image_url TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status post_status DEFAULT 'PENDING',
  threads_media_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status_scheduled ON scheduled_posts(status, scheduled_at);

CREATE TABLE IF NOT EXISTS comment_pipelines (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES threads_accounts(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL,
  interval_minutes INT DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  last_processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, media_id)
);

CREATE TABLE IF NOT EXISTS smtp_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  host TEXT DEFAULT 'smtp.gmail.com',
  port INT DEFAULT 587,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  CREATE TYPE email_status AS ENUM ('SENT', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS email_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pipeline_id TEXT REFERENCES comment_pipelines(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  comment_count INT NOT NULL,
  status email_status DEFAULT 'SENT',
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rate_limit_entries (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES threads_accounts(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rate_limit_entries ON rate_limit_entries(account_id, action_type, created_at);
