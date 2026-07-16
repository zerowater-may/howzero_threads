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

-- 인바운드 리드 — howzero 랜딩(ax-web) 상담 신청이 포워딩되는 문의함 (2026-07-16)
CREATE TABLE IF NOT EXISTS leads (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'landing',
  name TEXT,
  contact TEXT,
  email TEXT,
  company TEXT,
  role TEXT,
  referral TEXT,
  industry TEXT,
  areas TEXT,
  budget TEXT,
  start_timing TEXT,
  pain_summary TEXT,
  agreed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'converted', 'archived')),
  project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

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

-- 고객사(Company) — 테넌트 루트 (A2Z §1). 사업자정보는 세금계산서용. (2026-07-16)
CREATE TABLE IF NOT EXISTS companies (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  business_no TEXT,
  ceo_name TEXT,
  address TEXT,
  industry TEXT,
  size TEXT,
  hourly_rate BIGINT NOT NULL DEFAULT 0,
  margin_threshold INT NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

-- 기존 배포 데이터 보존용 확장 컬럼 (멱등: ADD COLUMN IF NOT EXISTS, CHECK 없이 TEXT DEFAULT).
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_id BIGINT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT '상담신청';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS owner TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_content TEXT;
CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company_id);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS company_id BIGINT;
CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company_id);

-- 고객 포털 접근 토큰 — client_token만으로 인증 없이 자기 딜 전체를 본다 (share_token 패턴).
ALTER TABLE companies ADD COLUMN IF NOT EXISTS client_token TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_client_token ON companies(client_token);

-- append-only 이벤트 로그 (A2Z §3). 자동 히스토리·타임라인 원천.
CREATE TABLE IF NOT EXISTS activity_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_id BIGINT,
  object_type TEXT NOT NULL,
  object_id BIGINT,
  actor TEXT NOT NULL DEFAULT 'staff',
  verb TEXT NOT NULL,
  from_state TEXT,
  to_state TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_company ON activity_log(company_id);
CREATE INDEX IF NOT EXISTS idx_activity_object ON activity_log(object_type, object_id);

-- 온톨로지 엔티티 — 고객사 운영 OS의 명사 (A2Z §3, Step4). 단일 테이블 + JSONB props.
-- type: process/task/tool/automation/bottleneck/metric/deliverable/owner (CHECK 없이 TEXT).
CREATE TABLE IF NOT EXISTS objects (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_id BIGINT NOT NULL,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  state TEXT DEFAULT 'identified',
  props JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_objects_company ON objects(company_id);
CREATE INDEX IF NOT EXISTS idx_objects_company_type ON objects(company_id, type);

-- 엔티티 사이 typed 그래프 엣지 (A2Z §3, Step4). rel_type: uses/owned_by/replaces/measures/blocks/produces.
-- 1-hop 순회는 단순 조인으로 충분 (재귀 CTE 불필요).
CREATE TABLE IF NOT EXISTS edges (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_id BIGINT NOT NULL,
  src_id BIGINT NOT NULL,
  dst_id BIGINT NOT NULL,
  rel_type TEXT NOT NULL,
  props JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_edges_company ON edges(company_id);
CREATE INDEX IF NOT EXISTS idx_edges_src ON edges(src_id);
CREATE INDEX IF NOT EXISTS idx_edges_dst ON edges(dst_id);

-- 제안(proposals) — M/M 견적 (A2Z Step5). line_items = [{label, role, manMonths, unitPrice, amount}].
-- mm_total·amount는 라인아이템에서 서버가 계산해 저장한다(스냅샷). status: draft/sent/viewed/accepted.
CREATE TABLE IF NOT EXISTS proposals (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_id BIGINT NOT NULL,
  deal_id BIGINT,
  line_items JSONB,
  mm_total NUMERIC NOT NULL DEFAULT 0,
  amount BIGINT NOT NULL DEFAULT 0,
  version INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_proposals_company ON proposals(company_id);
CREATE INDEX IF NOT EXISTS idx_proposals_deal ON proposals(deal_id);

-- 계약(contracts) — 1계약=1진실페이지 (A2Z Step5). milestones = [{label, amount, due, status}].
-- 라인아이템을 복사하지 않고 proposal_id로 참조. status: active/done/canceled.
CREATE TABLE IF NOT EXISTS contracts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_id BIGINT NOT NULL,
  deal_id BIGINT,
  proposal_id BIGINT,
  amount BIGINT NOT NULL DEFAULT 0,
  file_url TEXT,
  milestones JSONB,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_contracts_company ON contracts(company_id);
CREATE INDEX IF NOT EXISTS idx_contracts_proposal ON contracts(proposal_id);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS contract_id BIGINT;
CREATE INDEX IF NOT EXISTS idx_projects_contract ON projects(contract_id);

-- 투입공수(timelogs) — 계약 원가(인건비) 파생 원천. cost += man_days × day_rate.
CREATE TABLE IF NOT EXISTS timelogs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_id BIGINT NOT NULL,
  contract_id BIGINT,
  member TEXT,
  man_days NUMERIC NOT NULL DEFAULT 0,
  day_rate BIGINT NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_timelogs_contract ON timelogs(contract_id);

-- 지출(expenses) — 외주/기타 원가. cost += amount.
CREATE TABLE IF NOT EXISTS expenses (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_id BIGINT NOT NULL,
  contract_id BIGINT,
  label TEXT,
  amount BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_expenses_contract ON expenses(contract_id);
