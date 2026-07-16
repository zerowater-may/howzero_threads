"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { newShareToken } from "@/lib/auth";

// 회사 고객 포털 토큰 보장 — 있으면 그대로, 없으면 발급해 저장 후 반환.
// 공개 엔드포인트(server action)라 mutation 전에 staff 인가를 확인한다.
export async function ensureClientToken(companyId: number): Promise<string> {
  await requireStaff();
  const db = await getDb();
  const { rows } = await db.query("SELECT client_token FROM companies WHERE id = $1", [companyId]);
  const existing = rows[0]?.client_token;
  if (existing) return String(existing);
  const token = newShareToken();
  await db.query("UPDATE companies SET client_token = $1 WHERE id = $2", [token, companyId]);
  revalidatePath(`/c/${companyId}`);
  return token;
}
