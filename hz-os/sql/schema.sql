-- hz-os — AX 프로젝트 포털 스키마 (스펙 §4)
CREATE TABLE IF NOT EXISTS projects (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  client_name TEXT,
  status TEXT NOT NULL DEFAULT '진단' CHECK (status IN ('진단', '설계', '구축', '운영')),
  share_token TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_id BIGINT REFERENCES documents(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT '제목 없음',
  content JSONB,
  visibility TEXT NOT NULL DEFAULT 'internal' CHECK (visibility IN ('internal', 'shared')),
  sort_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);

CREATE TABLE IF NOT EXISTS doc_versions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  document_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content JSONB,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_doc_versions_document ON doc_versions(document_id);

CREATE TABLE IF NOT EXISTS meetings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  held_at DATE,
  transcript TEXT,
  summary TEXT,
  needs JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_meetings_project ON meetings(project_id);

CREATE TABLE IF NOT EXISTS updates (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'progress' CHECK (kind IN ('progress', 'decision', 'ask')),
  body TEXT NOT NULL,
  author_role TEXT NOT NULL DEFAULT 'staff' CHECK (author_role IN ('staff', 'client')),
  author_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_updates_project ON updates(project_id);

CREATE TABLE IF NOT EXISTS comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('document', 'update', 'meeting', 'project')),
  target_id BIGINT NOT NULL DEFAULT 0,
  author_role TEXT NOT NULL CHECK (author_role IN ('staff', 'client')),
  author_name TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comments_project ON comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id);
