import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { contractMargin, isLowMargin } from "@/lib/margin";
import {
  addExpense,
  addMilestone,
  addTimelog,
  attachProjectToContract,
  setContractFile,
  updateContractStatus,
  type Milestone,
} from "@/lib/actions/contracts";

interface ContractRow {
  id: number;
  company_id: number;
  company_name: string;
  margin_threshold: number;
  proposal_id: number | null;
  amount: number;
  file_url: string | null;
  milestones: Milestone[] | null;
  status: string;
}
interface TimelogRow {
  id: number;
  member: string | null;
  man_days: number;
  day_rate: number;
  note: string | null;
}
interface ExpenseRow {
  id: number;
  label: string | null;
  amount: number;
}
interface ProjectRow {
  id: number;
  name: string;
  status: string;
}
interface ProposalLine {
  label: string;
  role: string;
  manMonths: number;
  unitPrice: number;
  amount: number;
}

const CONTRACT_STATUS_LABEL: Record<string, string> = { active: "진행중", done: "완료", canceled: "해지" };
const won = (n: number) => Number(n).toLocaleString("ko-KR");

export default async function ContractPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const contractId = Number(id);
  const db = await getDb();

  const { rows: cRows } = await db.query(
    `SELECT c.id, c.company_id, co.name AS company_name, co.margin_threshold,
            c.proposal_id, c.amount, c.file_url, c.milestones, c.status
     FROM contracts c JOIN companies co ON co.id = c.company_id
     WHERE c.id = $1`,
    [contractId]
  );
  const contract = cRows[0] as unknown as ContractRow | undefined;
  if (!contract) notFound();

  const [{ rows: tRows }, { rows: eRows }, { rows: pjRows }] = await Promise.all([
    db.query("SELECT id, member, man_days, day_rate, note FROM timelogs WHERE contract_id = $1 ORDER BY created_at ASC", [contractId]),
    db.query("SELECT id, label, amount FROM expenses WHERE contract_id = $1 ORDER BY created_at ASC", [contractId]),
    db.query("SELECT id, name, status FROM projects WHERE contract_id = $1 ORDER BY created_at DESC", [contractId]),
  ]);
  const timelogs = tRows as unknown as TimelogRow[];
  const expenses = eRows as unknown as ExpenseRow[];
  const projects = pjRows as unknown as ProjectRow[];

  const { rows: attachable } = await db.query(
    "SELECT id, name FROM projects WHERE company_id = $1 AND contract_id IS NULL ORDER BY created_at DESC",
    [contract.company_id]
  );

  let proposalLines: ProposalLine[] = [];
  if (contract.proposal_id) {
    const { rows } = await db.query("SELECT line_items FROM proposals WHERE id = $1", [contract.proposal_id]);
    proposalLines = ((rows[0]?.line_items as ProposalLine[] | null) ?? []) as ProposalLine[];
  }

  const amount = Number(contract.amount) || 0;
  const margin = contractMargin({
    amount,
    timelogs: timelogs.map((t) => ({ man_days: Number(t.man_days), day_rate: Number(t.day_rate) })),
    expenses: expenses.map((e) => ({ amount: Number(e.amount) })),
  });
  const low = isLowMargin(margin.marginPct, contract.margin_threshold);
  const milestones = (contract.milestones ?? []) as Milestone[];

  async function addTimelogAction(formData: FormData) {
    "use server";
    await addTimelog(contractId, {
      member: String(formData.get("member") || ""),
      manDays: Number(formData.get("manDays") || 0),
      dayRate: Number(formData.get("dayRate") || 0),
      note: String(formData.get("note") || ""),
    });
  }
  async function addExpenseAction(formData: FormData) {
    "use server";
    await addExpense(contractId, {
      label: String(formData.get("label") || ""),
      amount: Number(formData.get("amount") || 0),
    });
  }
  async function addMilestoneAction(formData: FormData) {
    "use server";
    await addMilestone(contractId, {
      label: String(formData.get("label") || ""),
      amount: Number(formData.get("amount") || 0),
      due: String(formData.get("due") || ""),
    });
  }
  async function setFileAction(formData: FormData) {
    "use server";
    await setContractFile(contractId, String(formData.get("url") || ""));
  }
  async function attachProjectAction(formData: FormData) {
    "use server";
    const pid = Number(formData.get("projectId") || 0);
    if (pid) await attachProjectToContract(contractId, pid);
  }
  async function statusAction(formData: FormData) {
    "use server";
    await updateContractStatus(contractId, String(formData.get("status") || ""));
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div>
          <Link href={`/c/${contract.company_id}`} className="text-sm text-muted-foreground hover:text-foreground">
            ← {contract.company_name}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="display text-2xl">계약 #{contract.id}</h1>
            <Badge variant="secondary">{CONTRACT_STATUS_LABEL[contract.status] ?? contract.status}</Badge>
          </div>
        </div>

        {/* 요약 + 실시간 마진 */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">계약 금액</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-xl">{won(amount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">원가 (인건비+지출)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-xl">{won(margin.cost)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">마진</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`font-mono text-xl ${margin.margin < 0 ? "text-destructive" : "text-foreground"}`}>{won(margin.margin)}</p>
            </CardContent>
          </Card>
          <Card className={low ? "border-destructive/60" : undefined}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">마진율</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <p className={`font-mono text-xl ${low ? "text-destructive" : "text-foreground"}`}>{margin.marginPct.toFixed(1)}%</p>
                {low && <Badge className="bg-destructive/15 text-destructive">저마진</Badge>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">임계 {contract.margin_threshold}%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* 투입공수 */}
          <section className="flex flex-col gap-3">
            <h2 className="display text-lg">투입공수</h2>
            {timelogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">아직 기록된 공수가 없습니다.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {timelogs.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-4 py-2.5 text-sm">
                    <span className="min-w-0 truncate text-foreground">
                      {t.member || "미기재"} · <span className="font-mono">{Number(t.man_days)}</span>일 × <span className="font-mono">{won(t.day_rate)}</span>
                    </span>
                    <span className="shrink-0 font-mono text-muted-foreground">{won(Number(t.man_days) * Number(t.day_rate))}</span>
                  </li>
                ))}
              </ul>
            )}
            <form action={addTimelogAction} className="grid grid-cols-[1fr_72px_100px_auto] items-center gap-2">
              <Input name="member" placeholder="투입 인력" />
              <Input name="manDays" inputMode="decimal" placeholder="일수" />
              <Input name="dayRate" inputMode="numeric" placeholder="일단가" />
              <Button type="submit" size="sm">추가</Button>
            </form>
          </section>

          {/* 지출 */}
          <section className="flex flex-col gap-3">
            <h2 className="display text-lg">지출 (외주/기타)</h2>
            {expenses.length === 0 ? (
              <p className="text-sm text-muted-foreground">아직 지출이 없습니다.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {expenses.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-4 py-2.5 text-sm">
                    <span className="min-w-0 truncate text-foreground">{e.label || "미기재"}</span>
                    <span className="shrink-0 font-mono text-muted-foreground">{won(e.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
            <form action={addExpenseAction} className="grid grid-cols-[1fr_120px_auto] items-center gap-2">
              <Input name="label" placeholder="지출 항목" />
              <Input name="amount" inputMode="numeric" placeholder="금액" />
              <Button type="submit" size="sm">추가</Button>
            </form>
          </section>
        </div>

        {/* 마일스톤 스케줄 */}
        <section className="flex flex-col gap-3">
          <h2 className="display text-lg">마일스톤 스케줄</h2>
          {milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground">아직 마일스톤이 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {milestones.map((m, i) => (
                <li key={i} className="flex items-center justify-between gap-3 rounded-md border border-border px-4 py-2.5 text-sm">
                  <span className="min-w-0 truncate text-foreground">{m.label}</span>
                  <span className="flex shrink-0 items-center gap-3 text-muted-foreground">
                    {m.due && <span className="text-xs">{m.due}</span>}
                    <span className="font-mono">{won(m.amount)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <form action={addMilestoneAction} className="grid grid-cols-[1fr_140px_120px_auto] items-center gap-2">
            <Input name="label" placeholder="마일스톤" />
            <Input type="date" name="due" />
            <Input name="amount" inputMode="numeric" placeholder="금액" />
            <Button type="submit" size="sm">추가</Button>
          </form>
        </section>

        {/* 연결된 제안 */}
        <section className="flex flex-col gap-3">
          <h2 className="display text-lg">연결된 제안</h2>
          {proposalLines.length === 0 ? (
            <p className="text-sm text-muted-foreground">연결된 제안 라인아이템이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-4 py-2 font-normal">항목</th>
                    <th className="px-4 py-2 font-normal">역할</th>
                    <th className="px-4 py-2 text-right font-normal">M/M</th>
                    <th className="px-4 py-2 text-right font-normal">단가</th>
                    <th className="px-4 py-2 text-right font-normal">금액</th>
                  </tr>
                </thead>
                <tbody>
                  {proposalLines.map((l, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="px-4 py-2 text-foreground">{l.label}</td>
                      <td className="px-4 py-2 text-muted-foreground">{l.role || "-"}</td>
                      <td className="px-4 py-2 text-right font-mono">{l.manMonths}</td>
                      <td className="px-4 py-2 text-right font-mono">{won(l.unitPrice)}</td>
                      <td className="px-4 py-2 text-right font-mono">{won(l.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 연결된 프로젝트 */}
        <section className="flex flex-col gap-3">
          <h2 className="display text-lg">연결된 프로젝트</h2>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">연결된 프로젝트가 없습니다.</p>
          ) : (
            projects.map((p) => (
              <Link key={p.id} href={`/p/${p.id}`} className="flex items-center justify-between gap-2 rounded-md border border-border px-4 py-3 hover:border-primary/50">
                <span className="truncate text-sm text-foreground">{p.name}</span>
                <StatusBadge status={p.status} />
              </Link>
            ))
          )}
          {attachable.length > 0 && (
            <form action={attachProjectAction} className="flex items-center gap-2">
              <select name="projectId" className="h-9 flex-1 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring">
                {(attachable as unknown as { id: number; name: string }[]).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <Button type="submit" size="sm" variant="outline">프로젝트 연결</Button>
            </form>
          )}
        </section>

        {/* 계약서 파일 + 상태 */}
        <section className="flex flex-col gap-3">
          <h2 className="display text-lg">계약서 · 상태</h2>
          {contract.file_url && (
            <a href={contract.file_url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
              계약서 파일 열기 ↗
            </a>
          )}
          <form action={setFileAction} className="flex items-center gap-2">
            <Input name="url" type="url" placeholder="계약서 파일 URL" defaultValue={contract.file_url ?? ""} />
            <Button type="submit" size="sm" variant="outline">저장</Button>
          </form>
          <form action={statusAction} className="flex items-center gap-2">
            <select name="status" defaultValue={contract.status} className="h-9 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring">
              <option value="active">진행중</option>
              <option value="done">완료</option>
              <option value="canceled">해지</option>
            </select>
            <Button type="submit" size="sm" variant="outline">상태 변경</Button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
