import { z } from "zod";
import { getDb } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/ratelimit";

const LeadSchema = z.object({
  name: z.string().trim().max(100).optional(),
  contact: z.string().trim().min(5).max(200),
  company: z.string().trim().max(200).optional(),
  painSummary: z.string().trim().max(2000).optional(),
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
  const { name, contact, company, painSummary } = parsed.data;
  try {
    const db = await getDb();
    await db.query(
      `INSERT INTO leads (name, contact, company, pain_summary, source) VALUES ($1, $2, $3, $4, 'form')`,
      [name ?? null, contact, company ?? null, painSummary ?? null]
    );
  } catch (e) {
    console.error("[leads] db error:", e);
    return Response.json({ error: "storage_unavailable" }, { status: 503 });
  }
  return Response.json({ ok: true });
}
