CREATE TABLE IF NOT EXISTS pipeline_logs (
  id TEXT PRIMARY KEY,
  pipeline_id TEXT NOT NULL REFERENCES comment_pipelines(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'SUCCESS', -- SUCCESS, FAILED
  comments_found INT DEFAULT 0,
  emails_extracted INT DEFAULT 0,
  emails_sent INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pipeline_logs_pipeline_id ON pipeline_logs(pipeline_id, created_at DESC);
