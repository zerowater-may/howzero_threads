import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { isLowMargin } from "@/lib/margin";
import { PIPELINE_STAGES } from "@/lib/pipeline";
import type { Milestone } from "@/lib/actions/contracts";

const won = (n: number) => Number(n).toLocaleString("ko-KR");

// ponytail: budget는 랜딩에서 온 자유 텍스트라 정확 합산 불가. 앞자리 숫자 + 억/천만/만 단위만 뽑는 근사치.
// 정확한 금액이 필요하면 제안·계약 amount(BIGINT)를 쓴다. 파서를 키우기 전에 랜딩 폼을 구조화하는 게 옳다.
function parseBudgetWon(text: string | null): number {
  if (!text) return 0;
  const m = text.replace(/,/g, "").match(/(\d+(?:\.\d+)?)\s*(억|천만|만)?/);
  if (!m) return 0;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return 0;
  if (m[2] === "억") return Math.round(n * 100_000_000);
  if (m[2] === "천만") return Math.round(n * 10_000_000);
  if (m[2] === "만") return Math.round(n * 10_000);
  return Math.round(n);
}

export default async function DashboardPage() {
  await requireStaff();
  const db = await getDb();

  // 파이프라인: 단계별 딜 수 + 근사 예산 합
  const { rows: leadRows } = await db.query(
    "SELECT stage, budget FROM leads WHERE status <> 'archived'"
  );
  const stageCount = new Map<string, number>();
  const stageBudget = new Map<string, number>();
  let totalLeads = 0;
  for (const r of leadRows) {
    totalLeads++;
    const stage = r.stage && PIPELINE_STAGES.includes(r.stage as never) ? String(r.stage) : PIPELINE_STAGES[0];
    stageCount.set(stage, (stageCount.get(stage) ?? 0) + 1);
    stageBudget.set(stage, (stageBudget.get(stage) ?? 0) + parseBudgetWon(r.budget as string | null));
  }

  // 전환율: 계약 수 / 전체 리드
  const { rows: contractRows } = await db.query(
    `SELECT c.id, c.amount, c.status, co.margin_threshold,
            COALESCE((SELECT SUM(t.man_days * t.day_rate) FROM timelogs t WHERE t.contract_id = c.id), 0) AS labor,
            COALESCE((SELECT SUM(e.amount) FROM expenses e WHERE e.contract_id = c.id), 0) AS spend
     FROM contracts c JOIN companies co ON co.id = c.company_id`
  );
  const totalContracts = contractRows.length;
  const convRate = totalLeads > 0 ? (totalContracts / totalLeads) * 100 : 0;

  // 진행 중 계약 마진 합 + 저마진 경고 수
  let marginSum = 0;
  let lowCount = 0;
  let activeCount = 0;
  let contractedTotal = 0;
  for (const r of contractRows) {
    const amount = Number(r.amount) || 0;
    contractedTotal += amount;
    if (String(r.status) !== "active") continue;
    activeCount++;
    const cost = Number(r.labor) + Number(r.spend);
    const margin = amount - cost;
    marginSum += margin;
    const pct = amount > 0 ? (margin / amount) * 100 : 0;
    if (isLowMargin(pct, Number(r.margin_threshold))) lowCount++;
  }

  // 예상 현금흐름: active 계약 milestones의 due·amount 월별 롤업
  const { rows: msRows } = await db.query("SELECT milestones FROM contracts WHERE status = 'active'");
  const cash = new Map<string, number>();
  for (const r of msRows) {
    const list = (r.milestones as Milestone[] | null) ?? [];
    for (const m of list) {
      if (!m || !m.due) continue;
      const month = String(m.due).slice(0, 7);
      cash.set(month, (cash.get(month) ?? 0) + (Number(m.amount) || 0));
    }
  }
  const cashflow = [...cash.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  // UTM 채널별 리드 수
  const { rows: utmRows } = await db.query(
    "SELECT COALESCE(NULLIF(utm_source, ''), '(직접)') AS src, count(*)::int AS n FROM leads WHERE status <> 'archived' GROUP BY 1 ORDER BY n DESC"
  );

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <h1 className="display text-2xl">운영 대시보드</h1>

        {/* KPI 요약 */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Kpi label="상담 → 계약 전환율" value={`${convRate.toFixed(1)}%`} sub={`계약 ${totalContracts} / 리드 ${totalLeads}`} />
          <Kpi label="계약 총액" value={`${won(contractedTotal)}원`} sub={`계약 ${totalContracts}건`} />
          <Kpi label="진행 중 마진 합" value={`${won(marginSum)}원`} sub={`진행 계약 ${activeCount}건`} tone={marginSum < 0 ? "bad" : "default"} />
          <Kpi label="저마진 경고" value={`${lowCount}건`} sub="임계 미만 진행 계약" tone={lowCount > 0 ? "bad" : "default"} />
        </div>

        {/* 파이프라인 */}
        <section className="flex flex-col gap-3">
          <h2 className="display text-lg">파이프라인 (단계별 딜 · 예산)</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {PIPELINE_STAGES.map((s) => (
              <Card key={s}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground">{s}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-mono text-2xl">{stageCount.get(s) ?? 0}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{won(stageBudget.get(s) ?? 0)}원</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* 예상 현금흐름 */}
          <section className="flex flex-col gap-3">
            <h2 className="display text-lg">예상 현금흐름 (마일스톤)</h2>
            {cashflow.length === 0 ? (
              <p className="text-sm text-muted-foreground">예정된 마일스톤이 없습니다.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {cashflow.map(([month, amt]) => (
                  <li key={month} className="flex items-center justify-between gap-3 rounded-md border border-border px-4 py-2.5 text-sm">
                    <span className="font-mono text-muted-foreground">{month}</span>
                    <span className="font-mono text-foreground">{won(amt)}원</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* UTM 채널 */}
          <section className="flex flex-col gap-3">
            <h2 className="display text-lg">UTM 채널별 리드</h2>
            {utmRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">리드가 없습니다.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {utmRows.map((r, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 rounded-md border border-border px-4 py-2.5 text-sm">
                    <Badge variant="secondary">{String(r.src)}</Badge>
                    <span className="font-mono text-foreground">{Number(r.n)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← 홈 (딜 파이프라인)
        </Link>
      </div>
    </AppShell>
  );
}

function Kpi({ label, value, sub, tone = "default" }: { label: string; value: string; sub: string; tone?: "default" | "bad" }) {
  return (
    <Card className={tone === "bad" ? "border-destructive/50" : undefined}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`font-mono text-2xl ${tone === "bad" ? "text-destructive" : "text-foreground"}`}>{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}
