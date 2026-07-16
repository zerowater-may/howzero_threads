"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/guard";

// 문의함 리드를 프로젝트로 전환 — 랜딩 상담 신청 → 실제 프로젝트 시작.
export async function leadToProject(leadId: number): Promise<void> {
  await requireStaff();
  const db = await getDb();
  const { rows } = await db.query(
    "SELECT company, name, pain_summary, industry, contact, email, budget, start_timing FROM leads WHERE id = $1 AND status = 'new'",
    [leadId]
  );
  if (rows.length === 0) return;
  const l = rows[0] as Record<string, string | null>;
  const projectName = (l.company || l.name || "새 프로젝트") + " 운영 OS";
  const clientName = l.company || l.name || null;

  const created = await db.query(
    "INSERT INTO projects (name, client_name) VALUES ($1, $2) RETURNING id",
    [projectName, clientName]
  );
  const projectId = Number(created.rows[0].id);

  // 상담 신청 내용을 첫 업데이트로 기록 — 미팅 전 컨텍스트 보존
  const intake = [
    l.pain_summary ? `문의 내용: ${l.pain_summary}` : null,
    l.industry ? `업종: ${l.industry}` : null,
    l.budget ? `예산: ${l.budget}` : null,
    l.start_timing ? `희망 시기: ${l.start_timing}` : null,
    l.contact ? `연락처: ${l.contact}` : null,
    l.email ? `이메일: ${l.email}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  if (intake) {
    await db.query(
      "INSERT INTO updates (project_id, kind, body, author_role) VALUES ($1, 'decision', $2, 'staff')",
      [projectId, `랜딩 상담 신청으로 시작된 프로젝트입니다.\n\n${intake}`]
    );
  }

  await db.query("UPDATE leads SET status = 'converted', project_id = $1 WHERE id = $2", [projectId, leadId]);
  revalidatePath("/");
  redirect(`/p/${projectId}`);
}

export async function archiveLead(leadId: number): Promise<void> {
  await requireStaff();
  const db = await getDb();
  await db.query("UPDATE leads SET status = 'archived' WHERE id = $1 AND status = 'new'", [leadId]);
  revalidatePath("/");
}
