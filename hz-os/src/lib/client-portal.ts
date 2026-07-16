import { getDb } from "@/lib/db";
import { PIPELINE_STAGES } from "@/lib/pipeline";

// 고객 포털 전용 조회 — 인증 없이 client_token만으로 회사 전체 현황을 본다 (share_token 패턴).

export interface PortalCompany {
  id: number;
  name: string;
  client_token: string | null;
}

export interface PortalProposal {
  id: number;
  version: number;
  amount: number;
  mm_total: number;
  status: string;
  line_labels: string[]; // line_items 요약 — 항목 라벨(길이 = 항목 수)
  created_at: string;
}

export interface PortalMilestone {
  label: string;
  amount: number;
  due: string | null;
  status: string;
}

export interface PortalContract {
  id: number;
  amount: number;
  status: string;
  milestones: PortalMilestone[];
  done_count: number;
  total_count: number;
  done_ratio: number; // 0..1
  created_at: string;
}

export interface PortalDoc {
  id: number;
  title: string;
  share_token: string | null; // 소속 프로젝트의 share_token (있으면 /share 링크)
}

export interface PortalTimelineItem {
  id: number;
  object_type: string;
  verb: string;
  from_state: string | null;
  to_state: string | null;
  created_at: string;
}

export interface ClientPortalData {
  company: PortalCompany;
  currentStage: string;
  proposals: PortalProposal[];
  contracts: PortalContract[];
  sharedDocs: PortalDoc[];
  timeline: PortalTimelineItem[];
}

export async function getCompanyByToken(token: string): Promise<PortalCompany | null> {
  if (!token) return null;
  const db = await getDb();
  const { rows } = await db.query(
    "SELECT id, name, client_token FROM companies WHERE client_token = $1",
    [token]
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: Number(row.id),
    name: String(row.name),
    client_token: row.client_token == null ? null : String(row.client_token),
  };
}

// JSONB 배열은 postgres/PGlite 모두 파싱된 객체로 돌아온다. 문자열/undefined면 빈 배열로 안전 처리.
function asArray(v: unknown): Record<string, unknown>[] {
  return Array.isArray(v) ? (v as Record<string, unknown>[]) : [];
}

export async function getClientPortalData(companyId: number): Promise<ClientPortalData> {
  const db = await getDb();

  const { rows: companyRows } = await db.query(
    "SELECT id, name, client_token FROM companies WHERE id = $1",
    [companyId]
  );
  const cr = companyRows[0] ?? {};
  const company: PortalCompany = {
    id: Number(cr.id ?? companyId),
    name: String(cr.name ?? ""),
    client_token: cr.client_token == null ? null : String(cr.client_token),
  };

  // 현재 단계 = non-archived 딜들의 stage 중 PIPELINE_STAGES 인덱스 최대. 없으면 첫 단계.
  const { rows: stageRows } = await db.query(
    "SELECT stage FROM leads WHERE company_id = $1 AND status <> 'archived'",
    [companyId]
  );
  let maxIdx = 0;
  for (const r of stageRows) {
    const idx = (PIPELINE_STAGES as readonly string[]).indexOf(String(r.stage));
    if (idx > maxIdx) maxIdx = idx;
  }
  const currentStage = PIPELINE_STAGES[maxIdx];

  const { rows: proposalRows } = await db.query(
    "SELECT id, version, amount, mm_total, status, line_items, created_at FROM proposals WHERE company_id = $1 ORDER BY created_at DESC",
    [companyId]
  );
  const proposals: PortalProposal[] = proposalRows.map((p) => ({
    id: Number(p.id),
    version: Number(p.version),
    amount: Number(p.amount),
    mm_total: Number(p.mm_total),
    status: String(p.status),
    line_labels: asArray(p.line_items).map((li) => String(li.label ?? "")).filter(Boolean),
    created_at: String(p.created_at),
  }));

  const { rows: contractRows } = await db.query(
    "SELECT id, amount, status, milestones, created_at FROM contracts WHERE company_id = $1 ORDER BY created_at DESC",
    [companyId]
  );
  const contracts: PortalContract[] = contractRows.map((c) => {
    const milestones: PortalMilestone[] = asArray(c.milestones).map((m) => ({
      label: String(m.label ?? ""),
      amount: Number(m.amount ?? 0),
      due: m.due == null || m.due === "" ? null : String(m.due),
      status: String(m.status ?? "pending"),
    }));
    const total = milestones.length;
    const done = milestones.filter((m) => m.status === "done").length;
    return {
      id: Number(c.id),
      amount: Number(c.amount),
      status: String(c.status),
      milestones,
      done_count: done,
      total_count: total,
      done_ratio: total > 0 ? done / total : 0,
      created_at: String(c.created_at),
    };
  });

  const { rows: docRows } = await db.query(
    `SELECT d.id, d.title, p.share_token
     FROM documents d JOIN projects p ON d.project_id = p.id
     WHERE p.company_id = $1 AND d.visibility = 'shared'
     ORDER BY d.sort_order, d.id`,
    [companyId]
  );
  const sharedDocs: PortalDoc[] = docRows.map((d) => ({
    id: Number(d.id),
    title: String(d.title),
    share_token: d.share_token == null ? null : String(d.share_token),
  }));

  const { rows: tlRows } = await db.query(
    "SELECT id, object_type, verb, from_state, to_state, created_at FROM activity_log WHERE company_id = $1 ORDER BY created_at DESC LIMIT 15",
    [companyId]
  );
  const timeline: PortalTimelineItem[] = tlRows.map((t) => ({
    id: Number(t.id),
    object_type: String(t.object_type),
    verb: String(t.verb),
    from_state: t.from_state == null ? null : String(t.from_state),
    to_state: t.to_state == null ? null : String(t.to_state),
    created_at: String(t.created_at),
  }));

  return { company, currentStage, proposals, contracts, sharedDocs, timeline };
}
