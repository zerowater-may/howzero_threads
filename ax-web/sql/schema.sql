-- 하우제로 AX 랜딩 — 리드/상담 스키마 (스펙 §3)
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);

CREATE TABLE IF NOT EXISTS leads (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
  name TEXT,
  contact TEXT NOT NULL,
  company TEXT,
  pain_summary TEXT,
  source TEXT NOT NULL CHECK (source IN ('chat', 'form')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 상세 상담 폼 확장 필드 (2026-07-10, 윤자동 벤치마킹). 기존 DB에도 부팅 시 안전 적용.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS referral TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS areas TEXT;          -- 자동화 희망 영역 (쉼표 구분)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS budget TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS start_timing TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS agreed_at TIMESTAMPTZ; -- 개인정보 수집·이용 동의 시각 (증빙)
