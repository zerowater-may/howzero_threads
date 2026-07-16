"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Db } from "@/lib/db";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { ensureCompany } from "@/lib/migrate";
import { logActivity } from "@/lib/activity";
import { isPipelineStage } from "@/lib/pipeline";

// 리드에 회사가 없으면 회사명으로 자동 생성/연결하고 company_id를 반환한다.
async function linkLeadCompany(db: Db, leadId: number): Promise<number | null> {
  const { rows } = await db.query("SELECT company_id, company FROM leads WHERE id = $1", [leadId]);
  if (rows.length === 0) return null;
  const row = rows[0];
  if (row.company_id) return Number(row.company_id);
  const name = row.company ? String(row.company).trim() : "";
  if (!name) return null;
  const companyId = await ensureCompany(db, name);
  await db.query("UPDATE leads SET company_id = $1 WHERE id = $2", [companyId, leadId]);
  return companyId;
}

// 딜(리드)을 파이프라인 다음 단계로 이동. 전이 시 activity_log에 stage_change 기록.
export async function moveDealStage(leadId: number, stage: string): Promise<void> {
  await requireStaff();
  if (!isPipelineStage(stage)) return;
  const db = await getDb();
  const { rows } = await db.query("SELECT stage FROM leads WHERE id = $1 AND status <> 'archived'", [leadId]);
  if (rows.length === 0) return;
  const from = rows[0].stage ? String(rows[0].stage) : null;
  if (from === stage) return;
  const companyId = await linkLeadCompany(db, leadId);
  await db.query("UPDATE leads SET stage = $1 WHERE id = $2", [stage, leadId]);
  await logActivity(db, {
    companyId,
    objectType: "lead",
    objectId: leadId,
    verb: "stage_change",
    fromState: from,
    toState: stage,
  });
  revalidatePath("/");
  if (companyId) revalidatePath(`/c/${companyId}`);
}

// 딜 담당자 지정.
export async function assignOwner(leadId: number, owner: string): Promise<void> {
  await requireStaff();
  const db = await getDb();
  const o = owner.trim();
  await db.query("UPDATE leads SET owner = $1 WHERE id = $2 AND status <> 'archived'", [o || null, leadId]);
  revalidatePath("/");
}

export interface NewCompany {
  name: string;
  businessNo?: string;
  ceoName?: string;
  industry?: string;
  size?: string;
}

// 리드 없이도 고객사를 직접 등록 (기존 고객·리퍼럴 온보딩). 이름 기준 dedup 후 상세로 이동.
export async function createCompany(input: NewCompany): Promise<void> {
  await requireStaff();
  const name = input.name.trim();
  if (!name) return;
  const db = await getDb();
  const companyId = await ensureCompany(db, name);
  const patch: Record<string, string | undefined> = {
    business_no: input.businessNo?.trim() || undefined,
    ceo_name: input.ceoName?.trim() || undefined,
    industry: input.industry?.trim() || undefined,
    size: input.size?.trim() || undefined,
  };
  const cols = Object.keys(patch).filter((k) => patch[k] !== undefined);
  if (cols.length > 0) {
    const set = cols.map((c, i) => `${c} = $${i + 1}`).join(", ");
    await db.query(`UPDATE companies SET ${set} WHERE id = $${cols.length + 1}`, [
      ...cols.map((c) => patch[c]),
      companyId,
    ]);
  }
  revalidatePath("/");
  redirect(`/c/${companyId}`);
}
