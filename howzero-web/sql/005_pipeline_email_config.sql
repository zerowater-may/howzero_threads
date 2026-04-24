-- 파이프라인별 이메일 설정: 제목, 본문 메시지
ALTER TABLE comment_pipelines ADD COLUMN IF NOT EXISTS email_subject TEXT;
ALTER TABLE comment_pipelines ADD COLUMN IF NOT EXISTS email_body TEXT;

-- 파이프라인별 첨부파일
CREATE TABLE IF NOT EXISTS pipeline_attachments (
  id TEXT PRIMARY KEY,
  pipeline_id TEXT NOT NULL REFERENCES comment_pipelines(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  content_type TEXT,
  data TEXT NOT NULL, -- base64
  size_bytes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_attachments_pipeline_id
  ON pipeline_attachments(pipeline_id);
