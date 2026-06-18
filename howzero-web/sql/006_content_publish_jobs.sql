CREATE TABLE IF NOT EXISTS content_publish_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bundle_path TEXT NOT NULL,
  target TEXT NOT NULL CHECK (target IN ('instagram_reel', 'instagram_carousel', 'threads_carousel')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status post_status DEFAULT 'PENDING',
  zernio_post_id TEXT,
  duplicate_of_existing BOOLEAN DEFAULT FALSE,
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_publish_jobs_user_scheduled
  ON content_publish_jobs(user_id, scheduled_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_publish_jobs_status_scheduled
  ON content_publish_jobs(status, scheduled_at);
