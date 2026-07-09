import { z } from "zod";
import { getDb } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/ratelimit";

const LeadSchema = z.object({
  name: z.string().trim().max(100).optional(),
  contact: z.string().trim().min(5).max(200),
  company: z.string().trim().max(200).optional(),
  painSummary: z.string().trim().max(2000).optional(),
  // 상세 상담 폼 확장 (2026-07-10). 채팅 리드는 안 보내므로 전부 optional — 폼 필수 검증은 클라이언트 required가 담당.
  email: z.string().trim().email().max(200).optional(),
  role: z.string().trim().max(100).optional(),
  referral: z.string().trim().max(100).optional(),
  industry: z.string().trim().max(100).optional(),
  areas: z.array(z.string().trim().max(50)).max(10).optional(),
  budget: z.string().trim().max(100).optional(),
  startTiming: z.string().trim().max(100).optional(),
  privacyAgreed: z.boolean().optional(),
});

export async function POST(req: Request) {
  if (!rateLimit(`leads:${clientIp(req)}`, 5)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
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
  const { name, contact, company, painSummary, email, role, referral, industry, areas, budget, startTiming, privacyAgreed } =
    parsed.data;
  try {
    const db = await getDb();
    await db.query(
      `INSERT INTO leads (name, contact, company, pain_summary, source, email, role, referral, industry, areas, budget, start_timing, agreed_at)
       VALUES ($1, $2, $3, $4, 'form', $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        name ?? null,
        contact,
        company ?? null,
        painSummary ?? null,
        email ?? null,
        role ?? null,
        referral ?? null,
        industry ?? null,
        areas && areas.length ? areas.join(", ") : null,
        budget ?? null,
        startTiming ?? null,
        privacyAgreed ? new Date().toISOString() : null,
      ]
    );
  } catch (e) {
    console.error("[leads] db error:", e);
    return Response.json({ error: "storage_unavailable" }, { status: 503 });
  }
  return Response.json({ ok: true });
}
