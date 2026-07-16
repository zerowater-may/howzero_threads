"use server";

import { revalidatePath } from "next/cache";
import type { Db } from "@/lib/db";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { logActivity } from "@/lib/activity";

export interface Milestone {
  label: string;
  amount: number;
  due: string;
  status: string;
}

async function contractCompany(db: Db, contractId: number): Promise<number | null> {
  const { rows } = await db.query("SELECT company_id FROM contracts WHERE id = $1", [contractId]);
  return rows.length ? Number(rows[0].company_id) : null;
}

// 제안 → 계약 전환. 라인아이템을 복사하지 않고 proposal_id로 참조하며 amount만 스냅샷한다.
export async function createContractFromProposal(proposalId: number): Promise<number | null> {
  await requireStaff();
  const db = await getDb();
  const { rows } = await db.query("SELECT company_id, deal_id, amount FROM proposals WHERE id = $1", [proposalId]);
  if (rows.length === 0) return null;
  const companyId = Number(rows[0].company_id);
  const dealId = rows[0].deal_id ? Number(rows[0].deal_id) : null;
  const amount = Number(rows[0].amount) || 0;
  const { rows: c } = await db.query(
    `INSERT INTO contracts (company_id, deal_id, proposal_id, amount, milestones)
     VALUES ($1, $2, $3, $4, '[]'::jsonb) RETURNING id`,
    [companyId, dealId, proposalId, amount]
  );
  const contractId = Number(c[0].id);
  await logActivity(db, {
    companyId,
    objectType: "contract",
    objectId: contractId,
    verb: "create",
    toState: "active",
    payload: { proposalId, amount },
  });
  revalidatePath(`/c/${companyId}`);
  return contractId;
}

// 마일스톤 1건 append (JSONB 배열 concat). status 기본 pending.
export async function addMilestone(
  contractId: number,
  input: { label: string; amount: number; due: string }
): Promise<void> {
  await requireStaff();
  const db = await getDb();
  const companyId = await contractCompany(db, contractId);
  if (companyId == null) return;
  const label = input.label.trim();
  if (!label) return;
  const m: Milestone = { label, amount: Math.round(Number(input.amount) || 0), due: input.due || "", status: "pending" };
  await db.query(
    "UPDATE contracts SET milestones = COALESCE(milestones, '[]'::jsonb) || $1::jsonb WHERE id = $2",
    [JSON.stringify([m]), contractId]
  );
  await logActivity(db, { companyId, objectType: "contract", objectId: contractId, verb: "add_milestone", payload: m });
  revalidatePath(`/contracts/${contractId}`);
}

// 투입공수 기록 → 계약 원가(인건비) 증가 → 마진 감소.
export async function addTimelog(
  contractId: number,
  input: { member: string; manDays: number; dayRate: number; note?: string }
): Promise<void> {
  await requireStaff();
  const db = await getDb();
  const companyId = await contractCompany(db, contractId);
  if (companyId == null) return;
  const manDays = Number(input.manDays) || 0;
  const dayRate = Math.round(Number(input.dayRate) || 0);
  if (manDays <= 0) return;
  await db.query(
    "INSERT INTO timelogs (company_id, contract_id, member, man_days, day_rate, note) VALUES ($1, $2, $3, $4, $5, $6)",
    [companyId, contractId, input.member.trim() || null, manDays, dayRate, input.note?.trim() || null]
  );
  await logActivity(db, { companyId, objectType: "contract", objectId: contractId, verb: "add_timelog", payload: { manDays, dayRate } });
  revalidatePath(`/contracts/${contractId}`);
}

// 지출(외주 등) 기록 → 계약 원가 증가.
export async function addExpense(contractId: number, input: { label: string; amount: number }): Promise<void> {
  await requireStaff();
  const db = await getDb();
  const companyId = await contractCompany(db, contractId);
  if (companyId == null) return;
  const amount = Math.round(Number(input.amount) || 0);
  if (amount <= 0) return;
  await db.query("INSERT INTO expenses (company_id, contract_id, label, amount) VALUES ($1, $2, $3, $4)", [
    companyId,
    contractId,
    input.label.trim() || null,
    amount,
  ]);
  await logActivity(db, { companyId, objectType: "contract", objectId: contractId, verb: "add_expense", payload: { amount } });
  revalidatePath(`/contracts/${contractId}`);
}

const CONTRACT_STATES = ["active", "done", "canceled"];

export async function updateContractStatus(contractId: number, status: string): Promise<void> {
  await requireStaff();
  if (!CONTRACT_STATES.includes(status)) return;
  const db = await getDb();
  const { rows } = await db.query("SELECT company_id, status FROM contracts WHERE id = $1", [contractId]);
  if (rows.length === 0) return;
  const companyId = Number(rows[0].company_id);
  const from = String(rows[0].status);
  if (from === status) return;
  await db.query("UPDATE contracts SET status = $1 WHERE id = $2", [status, contractId]);
  await logActivity(db, { companyId, objectType: "contract", objectId: contractId, verb: "status_change", fromState: from, toState: status });
  revalidatePath(`/contracts/${contractId}`);
  revalidatePath(`/c/${companyId}`);
}

// 계약서 파일 링크 저장.
export async function setContractFile(contractId: number, url: string): Promise<void> {
  await requireStaff();
  const db = await getDb();
  const companyId = await contractCompany(db, contractId);
  if (companyId == null) return;
  await db.query("UPDATE contracts SET file_url = $1 WHERE id = $2", [url.trim() || null, contractId]);
  revalidatePath(`/contracts/${contractId}`);
}

// 기존 회사 프로젝트를 이 계약에 연결(FK 참조, 값 재입력 없음).
export async function attachProjectToContract(contractId: number, projectId: number): Promise<void> {
  await requireStaff();
  const db = await getDb();
  const companyId = await contractCompany(db, contractId);
  if (companyId == null) return;
  await db.query("UPDATE projects SET contract_id = $1 WHERE id = $2 AND company_id = $3", [contractId, projectId, companyId]);
  await logActivity(db, { companyId, objectType: "contract", objectId: contractId, verb: "attach_project", payload: { projectId } });
  revalidatePath(`/contracts/${contractId}`);
}
