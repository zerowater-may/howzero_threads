import { z } from "zod";
import { getDb } from "@/lib/db";
import { ensureCompany } from "@/lib/migrate";
import { timingSafeEqual } from "crypto";

// howzero 랜딩(ax-web)이 상담 신청을 포워딩하는 인바운드 엔드포인트.
// Bearer 시크릿(HZOS_INBOUND_SECRET)으로만 허용 — 공개 폼이 아니라 서버간 호출 전용.

const LeadSchema = z.object({
  source: z.string().trim().max(40).optional(),
  name: z.string().trim().max(100).optional(),
  contact: z.string().trim().max(200).optional(),
  email: z.string().trim().max(200).optional(),
  company: z.string().trim().max(200).optional(),
  role: z.string().trim().max(100).optional(),
  referral: z.string().trim().max(100).optional(),
  industry: z.string().trim().max(100).optional(),
  areas: z.union([z.array(z.string().max(50)).max(20), z.string().max(400)]).optional(),
  budget: z.string().trim().max(100).optional(),
  startTiming: z.string().trim().max(100).optional(),
  painSummary: z.string().trim().max(4000).optional(),
  privacyAgreed: z.boolean().optional(),
  utmSource: z.string().trim().max(300).optional(),
  utmCampaign: z.string().trim().max(200).optional(),
  utmContent: z.string().trim().max(200).optional(),
});

function authorized(req: Request): boolean {
  const secret = process.env.HZOS_INBOUND_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = LeadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_lead", issues: parsed.error.issues }, { status: 400 });
  }
  const d = parsed.data;
  const areas = Array.isArray(d.areas) ? d.areas.join(", ") : d.areas ?? null;
  try {
    const db = await getDb();
    // 회사명이 있으면 즉시 company 생성/연결 — 리드가 들어오는 순간 테넌트 루트가 생겨 딜→회사 흐름이 성립.
    const companyName = d.company?.trim();
    const companyId = companyName ? await ensureCompany(db, companyName) : null;
    await db.query(
      `INSERT INTO leads (source, name, contact, email, company, company_id, role, referral, industry, areas, budget, start_timing, pain_summary, agreed_at, utm_source, utm_campaign, utm_content)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        d.source ?? "landing",
        d.name ?? null,
        d.contact ?? null,
        d.email ?? null,
        d.company ?? null,
        companyId,
        d.role ?? null,
        d.referral ?? null,
        d.industry ?? null,
        areas,
        d.budget ?? null,
        d.startTiming ?? null,
        d.painSummary ?? null,
        d.privacyAgreed ? new Date().toISOString() : null,
        d.utmSource ?? null,
        d.utmCampaign ?? null,
        d.utmContent ?? null,
      ]
    );
  } catch (e) {
    console.error("[inbound] db error:", e);
    return Response.json({ error: "storage_unavailable" }, { status: 503 });
  }
  return Response.json({ ok: true });
}
