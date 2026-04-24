-- 파이프라인 스케줄 범위: 언제부터 언제까지 실행할지
ALTER TABLE comment_pipelines ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ;
ALTER TABLE comment_pipelines ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ;
