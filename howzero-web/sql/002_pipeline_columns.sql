ALTER TABLE comment_pipelines ADD COLUMN IF NOT EXISTS post_text TEXT;
ALTER TABLE comment_pipelines ADD COLUMN IF NOT EXISTS keyword TEXT;
