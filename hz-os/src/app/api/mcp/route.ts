import { timingSafeEqual } from "crypto";
import { getDb } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { isPipelineStage, PIPELINE_STAGES } from "@/lib/pipeline";
import { contractMargin, isLowMargin } from "@/lib/margin";

// 사내 MCP 내부 API — Claude(stdio MCP server)가 Bearer 시크릿으로만 호출하는 서버간 엔드포인트.
// 공개 폼이 아니라 stdio 브릿지 전용. inbound/route.ts의 authorized 패턴을 그대로 따른다.

function authorized(req: Request): boolean {
  const secret = process.env.HZOS_MCP_SECRET || process.env.HZOS_INBOUND_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

type Params = Record<string, unknown>;
const str = (v: unknown): string => (v == null ? "" : String(v)).trim();
const int = (v: unknown): number => Math.trunc(Number(v)) || 0;

// leads=딜. 아카이브 제외 + 선택적 stage 필터.
async function listDeals(p: Params) {
  const db = await getDb();
  const stage = str(p.stage);
  const where = stage ? "status <> 'archived' AND stage = $1" : "status <> 'archived'";
  const args = stage ? [stage] : [];
  const { rows } = await db.query(
    `SELECT id, source, name, company, company_id, contact, email, industry, budget, start_timing, stage, owner, status, created_at
     FROM leads WHERE ${where} ORDER BY created_at DESC`,
    args
  );
  return { deals: rows };
}

// 회사 루트 + 그 회사의 딜/제안/계약 요약.
async function getCompany(p: Params) {
  const id = int(p.id);
  if (!id) throw new Error("id_required");
  const db = await getDb();
  const { rows: cRows } = await db.query("SELECT * FROM companies WHERE id = $1", [id]);
  if (cRows.length === 0) throw new Error("company_not_found");
  const [{ rows: leads }, { rows: proposals }, { rows: contracts }] = await Promise.all([
    db.query("SELECT id, name, stage, status, budget FROM leads WHERE company_id = $1 AND status <> 'archived' ORDER BY created_at DESC", [id]),
    db.query("SELECT id, deal_id, mm_total, amount, version, status, created_at FROM proposals WHERE company_id = $1 ORDER BY created_at DESC", [id]),
    db.query("SELECT id, deal_id, proposal_id, amount, status, created_at FROM contracts WHERE company_id = $1 ORDER BY created_at DESC", [id]),
  ]);
  return { company: cRows[0], leads, proposals, contracts };
}

// 딜 단계 이동 + activity_log 기록. requireStaff 리다이렉트를 피해 직접 SQL로 처리(Bearer 컨텍스트).
async function moveDeal(p: Params) {
  const id = int(p.id);
  const stage = str(p.stage);
  if (!id) throw new Error("id_required");
  if (!isPipelineStage(stage)) throw new Error("invalid_stage");
  const db = await getDb();
  const { rows } = await db.query("SELECT stage, company_id FROM leads WHERE id = $1 AND status <> 'archived'", [id]);
  if (rows.length === 0) throw new Error("deal_not_found");
  const from = rows[0].stage ? String(rows[0].stage) : null;
  const companyId = rows[0].company_id != null ? Number(rows[0].company_id) : null;
  if (from !== stage) {
    await db.query("UPDATE leads SET stage = $1 WHERE id = $2", [stage, id]);
    await logActivity(db, { companyId, objectType: "lead", objectId: id, verb: "stage_change", fromState: from, toState: stage });
  }
  return { id, stage, from };
}

// 라인아이템으로 mm_total·amount 서버 재계산 후 proposals insert. 값을 신뢰하지 않는다.
async function createProposal(p: Params) {
  const companyId = int(p.companyId);
  if (!companyId) throw new Error("companyId_required");
  const dealId = p.dealId != null ? int(p.dealId) || null : null;
  const input = Array.isArray(p.lineItems) ? (p.lineItems as Params[]) : [];
  const lines: { label: string; role: string; manMonths: number; unitPrice: number; amount: number }[] = [];
  let mmTotal = 0;
  let amount = 0;
  for (const l of input) {
    const label = str(l.label);
    if (!label) continue;
    const manMonths = Number(l.manMonths) || 0;
    const unitPrice = Math.round(Number(l.unitPrice) || 0);
    const lineAmount = Math.round(manMonths * unitPrice);
    lines.push({ label, role: str(l.role), manMonths, unitPrice, amount: lineAmount });
    mmTotal += manMonths;
    amount += lineAmount;
  }
  if (lines.length === 0) throw new Error("no_line_items");
  const db = await getDb();
  const { rows } = await db.query(
    `INSERT INTO proposals (company_id, deal_id, line_items, mm_total, amount)
     VALUES ($1, $2, $3::jsonb, $4, $5) RETURNING id`,
    [companyId, dealId, JSON.stringify(lines), mmTotal, amount]
  );
  const proposalId = Number(rows[0].id);
  await logActivity(db, { companyId, objectType: "proposal", objectId: proposalId, verb: "create", toState: "draft", payload: { mmTotal, amount } });
  return { id: proposalId, mmTotal, amount, lineItems: lines };
}

// 계약 원가/마진을 timelogs·expenses에서 파생해 담은 active 계약 rows.
async function activeContractRows() {
  const db = await getDb();
  const { rows } = await db.query(
    `SELECT c.id, c.company_id, co.name AS company_name, co.margin_threshold, c.amount, c.status,
            COALESCE((SELECT SUM(t.man_days * t.day_rate) FROM timelogs t WHERE t.contract_id = c.id), 0) AS labor,
            COALESCE((SELECT SUM(e.amount) FROM expenses e WHERE e.contract_id = c.id), 0) AS spend
     FROM contracts c JOIN companies co ON co.id = c.company_id`
  );
  return rows;
}

// 단계별 딜 수 · 계약 총액 · 진행중 마진 합 · 상담→계약 전환율.
async function dashboardMetrics() {
  const db = await getDb();
  const { rows: leadRows } = await db.query("SELECT stage FROM leads WHERE status <> 'archived'");
  const stages: Record<string, number> = {};
  for (const s of PIPELINE_STAGES) stages[s] = 0;
  for (const r of leadRows) {
    const s = r.stage && isPipelineStage(String(r.stage)) ? String(r.stage) : PIPELINE_STAGES[0];
    stages[s] += 1;
  }
  const totalLeads = leadRows.length;

  const contracts = await activeContractRows();
  let contractedTotal = 0;
  let activeMarginSum = 0;
  let activeCount = 0;
  for (const r of contracts) {
    // labor는 이미 Σ(man_days×day_rate)라 day_rate=1로 넘기면 cost=labor+spend로 정확히 재현된다.
    const m = contractMargin({ amount: Number(r.amount), timelogs: [{ man_days: Number(r.labor), day_rate: 1 }], expenses: [{ amount: Number(r.spend) }] });
    contractedTotal += Number(r.amount) || 0;
    if (String(r.status) !== "active") continue;
    activeCount += 1;
    activeMarginSum += m.margin;
  }
  const totalContracts = contracts.length;
  const conversionRate = totalLeads > 0 ? (totalContracts / totalLeads) * 100 : 0;
  return { stages, totalLeads, totalContracts, activeContracts: activeCount, contractedTotal, activeMarginSum, conversionRate };
}

// active 계약 중 마진율 < 회사 margin_threshold 인 것만.
async function lowMarginContracts() {
  const rows = await activeContractRows();
  const out: Params[] = [];
  for (const r of rows) {
    if (String(r.status) !== "active") continue;
    const amount = Number(r.amount) || 0;
    // labor는 이미 man_days×day_rate 합이므로 day_rate=1로 넘겨 그대로 원가에 반영.
    const m = contractMargin({ amount, timelogs: [{ man_days: Number(r.labor), day_rate: 1 }], expenses: [{ amount: Number(r.spend) }] });
    const threshold = Number(r.margin_threshold);
    if (!isLowMargin(m.marginPct, threshold)) continue;
    out.push({ id: Number(r.id), companyId: Number(r.company_id), companyName: r.company_name, amount, cost: m.cost, margin: m.margin, marginPct: m.marginPct, threshold });
  }
  return { contracts: out };
}

const ACTIONS: Record<string, (p: Params) => Promise<unknown>> = {
  list_deals: listDeals,
  get_company: getCompany,
  move_deal: moveDeal,
  create_proposal: createProposal,
  dashboard_metrics: dashboardMetrics,
  low_margin_contracts: lowMarginContracts,
};

export async function POST(req: Request) {
  if (!authorized(req)) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  let body: { action?: string; params?: Params };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const handler = body.action ? ACTIONS[body.action] : undefined;
  if (!handler) {
    return Response.json({ ok: false, error: "unknown_action", actions: Object.keys(ACTIONS) }, { status: 400 });
  }
  try {
    const data = await handler(body.params ?? {});
    return Response.json({ ok: true, data });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "internal_error" }, { status: 400 });
  }
}
