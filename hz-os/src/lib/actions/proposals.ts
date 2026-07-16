"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { logActivity } from "@/lib/activity";
import { createContractFromProposal } from "@/lib/actions/contracts";

export interface ProposalLineInput {
  label: string;
  role?: string;
  manMonths: number;
  unitPrice: number;
}
export interface ProposalLine {
  label: string;
  role: string;
  manMonths: number;
  unitPrice: number;
  amount: number;
}

// 라인아이템 정규화 + M/M 합계·금액 자동계산 (amount = manMonths × unitPrice 합). 값을 신뢰하지 않고 서버가 재계산한다.
function normalizeLines(input: ProposalLineInput[]): { lines: ProposalLine[]; mmTotal: number; amount: number } {
  const lines: ProposalLine[] = [];
  let mmTotal = 0;
  let amount = 0;
  for (const l of input) {
    const label = (l.label ?? "").trim();
    if (!label) continue;
    const manMonths = Number(l.manMonths) || 0;
    const unitPrice = Math.round(Number(l.unitPrice) || 0);
    const lineAmount = Math.round(manMonths * unitPrice);
    lines.push({ label, role: (l.role ?? "").trim(), manMonths, unitPrice, amount: lineAmount });
    mmTotal += manMonths;
    amount += lineAmount;
  }
  return { lines, mmTotal, amount };
}

export async function createProposal(
  companyId: number,
  dealId: number | null,
  lineItems: ProposalLineInput[]
): Promise<number | null> {
  await requireStaff();
  const db = await getDb();
  const { lines, mmTotal, amount } = normalizeLines(lineItems);
  if (lines.length === 0) return null;
  const { rows } = await db.query(
    `INSERT INTO proposals (company_id, deal_id, line_items, mm_total, amount)
     VALUES ($1, $2, $3::jsonb, $4, $5) RETURNING id`,
    [companyId, dealId, JSON.stringify(lines), mmTotal, amount]
  );
  const id = Number(rows[0].id);
  await logActivity(db, {
    companyId,
    objectType: "proposal",
    objectId: id,
    verb: "create",
    toState: "draft",
    payload: { mmTotal, amount },
  });
  revalidatePath(`/c/${companyId}`);
  return id;
}

const PROPOSAL_STATES = ["draft", "sent", "viewed", "accepted"];

export async function setProposalStatus(id: number, status: string): Promise<void> {
  await requireStaff();
  if (!PROPOSAL_STATES.includes(status)) return;
  const db = await getDb();
  const { rows } = await db.query("SELECT company_id, status FROM proposals WHERE id = $1", [id]);
  if (rows.length === 0) return;
  const companyId = Number(rows[0].company_id);
  const from = String(rows[0].status);
  if (from === status) return;
  await db.query("UPDATE proposals SET status = $1 WHERE id = $2", [status, id]);
  await logActivity(db, { companyId, objectType: "proposal", objectId: id, verb: "status_change", fromState: from, toState: status });
  revalidatePath(`/c/${companyId}`);
}

// 제안 수락 → status=accepted + 계약 자동 생성(proposal_id 참조). 이미 계약이 있으면 재사용(멱등).
export async function acceptProposal(id: number): Promise<number | null> {
  await requireStaff();
  const db = await getDb();
  const { rows } = await db.query("SELECT company_id, status FROM proposals WHERE id = $1", [id]);
  if (rows.length === 0) return null;
  const companyId = Number(rows[0].company_id);
  if (String(rows[0].status) !== "accepted") {
    await db.query("UPDATE proposals SET status = 'accepted' WHERE id = $1", [id]);
    await logActivity(db, { companyId, objectType: "proposal", objectId: id, verb: "status_change", toState: "accepted" });
  }
  const existing = await db.query("SELECT id FROM contracts WHERE proposal_id = $1 LIMIT 1", [id]);
  if (existing.rows.length > 0) {
    revalidatePath(`/c/${companyId}`);
    return Number(existing.rows[0].id);
  }
  const contractId = await createContractFromProposal(id);
  revalidatePath(`/c/${companyId}`);
  return contractId;
}
