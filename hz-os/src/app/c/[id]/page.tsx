import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { OntologyPanel, type OntEdge } from "@/components/ontology/OntologyPanel";
import type { OntObject } from "@/lib/roi";
import { ProposalForm } from "@/components/proposals/ProposalForm";
import { setProposalStatus, acceptProposal } from "@/lib/actions/proposals";
import { ensureClientToken } from "@/lib/actions/client";
import { CopyButton } from "@/components/CopyButton";

interface CompanyRow {
  id: number;
  name: string;
  business_no: string | null;
  ceo_name: string | null;
  address: string | null;
  industry: string | null;
  size: string | null;
  hourly_rate: number;
  margin_threshold: number;
  client_token: string | null;
}

interface DealRow {
  id: number;
  name: string | null;
  stage: string | null;
  owner: string | null;
  status: string;
}

interface ProjectRow {
  id: number;
  name: string;
  status: string;
}

interface ActivityRow {
  id: number;
  object_type: string;
  object_id: number | null;
  actor: string;
  verb: string;
  from_state: string | null;
  to_state: string | null;
  created_at: string;
}

interface ProposalRow {
  id: number;
  version: number;
  mm_total: number;
  amount: number;
  status: string;
  has_contract: boolean;
}

interface ContractRow2 {
  id: number;
  amount: number;
  status: string;
}

const PROPOSAL_STATUS_LABEL: Record<string, string> = { draft: "작성중", sent: "발송", viewed: "열람", accepted: "수락" };
const CONTRACT_STATUS_LABEL: Record<string, string> = { active: "진행중", done: "완료", canceled: "해지" };

function fmtDateTime(v: string): string {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function activityLine(a: ActivityRow): string {
  if (a.verb === "stage_change") {
    return `딜 단계 ${a.from_state ?? "미지정"} → ${a.to_state ?? "미지정"}`;
  }
  return `${a.object_type} ${a.verb}`;
}

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const companyId = Number(id);

  const db = await getDb();
  const { rows: companyRows } = await db.query(
    "SELECT id, name, business_no, ceo_name, address, industry, size, hourly_rate, margin_threshold, client_token FROM companies WHERE id = $1",
    [companyId]
  );
  const company = companyRows[0] as unknown as CompanyRow | undefined;
  if (!company) notFound();

  const { rows: dealRows } = await db.query(
    "SELECT id, name, stage, owner, status FROM leads WHERE company_id = $1 AND status <> 'archived' ORDER BY created_at DESC",
    [companyId]
  );
  const deals = dealRows as unknown as DealRow[];

  const { rows: projectRows } = await db.query(
    "SELECT id, name, status FROM projects WHERE company_id = $1 ORDER BY created_at DESC",
    [companyId]
  );
  const projects = projectRows as unknown as ProjectRow[];

  const { rows: activityRows } = await db.query(
    "SELECT id, object_type, object_id, actor, verb, from_state, to_state, created_at FROM activity_log WHERE company_id = $1 ORDER BY created_at DESC LIMIT 30",
    [companyId]
  );
  const activities = activityRows as unknown as ActivityRow[];

  const { rows: objectRows } = await db.query(
    "SELECT id, company_id, type, label, state, props FROM objects WHERE company_id = $1 ORDER BY created_at ASC",
    [companyId]
  );
  const objects: OntObject[] = objectRows.map((o) => ({
    id: Number(o.id),
    type: String(o.type),
    label: String(o.label),
    state: o.state == null ? null : String(o.state),
    props: (o.props as Record<string, unknown> | null) ?? null,
  }));

  const { rows: edgeRows } = await db.query(
    "SELECT id, src_id, dst_id, rel_type, props FROM edges WHERE company_id = $1",
    [companyId]
  );
  const edges: OntEdge[] = edgeRows.map((e) => ({
    id: Number(e.id),
    src_id: Number(e.src_id),
    dst_id: Number(e.dst_id),
    rel_type: String(e.rel_type),
    props: (e.props as Record<string, unknown> | null) ?? null,
  }));

  const { rows: proposalRows } = await db.query(
    `SELECT p.id, p.version, p.mm_total, p.amount, p.status,
            EXISTS(SELECT 1 FROM contracts c WHERE c.proposal_id = p.id) AS has_contract
     FROM proposals p WHERE p.company_id = $1 ORDER BY p.created_at DESC`,
    [companyId]
  );
  const proposals = proposalRows as unknown as ProposalRow[];

  const { rows: contractListRows } = await db.query(
    "SELECT id, amount, status FROM contracts WHERE company_id = $1 ORDER BY created_at DESC",
    [companyId]
  );
  const contracts = contractListRows as unknown as ContractRow2[];

  const bottleneckLabels = objects.filter((o) => o.type === "bottleneck").map((o) => o.label);
  const dealOptions = deals.map((d) => ({ id: d.id, label: d.name || `딜 #${d.id}` }));
  const won = (n: number) => Number(n).toLocaleString("ko-KR");

  async function proposalStatusAction(formData: FormData) {
    "use server";
    await setProposalStatus(Number(formData.get("id") || 0), String(formData.get("status") || ""));
  }
  async function acceptProposalAction(formData: FormData) {
    "use server";
    await acceptProposal(Number(formData.get("id") || 0));
  }
  async function createClientLinkAction() {
    "use server";
    await ensureClientToken(companyId);
  }

  const info: [string, string | null][] = [
    ["사업자번호", company.business_no],
    ["대표자", company.ceo_name],
    ["주소", company.address],
    ["업종", company.industry],
    ["규모", company.size],
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← 홈
          </Link>
          <h1 className="display mt-2 text-2xl">{company.name}</h1>
          <p className="text-sm text-muted-foreground">
            시급 {company.hourly_rate.toLocaleString("ko-KR")}원 · 마진 임계 {company.margin_threshold}%
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">고객사 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              {info.map(([label, value]) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="text-sm text-foreground">{value || "미기재"}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">고객 링크</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            {company.client_token ? (
              <>
                <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1 text-xs">
                  /client/{company.client_token}
                </code>
                <CopyButton text={`/client/${company.client_token}`} />
              </>
            ) : (
              <>
                <p className="min-w-0 flex-1 text-sm text-muted-foreground">
                  고객이 진행 현황·제안·계약을 볼 수 있는 전용 링크를 만듭니다.
                </p>
                <form action={createClientLinkAction}>
                  <Button type="submit" size="sm">고객 링크 생성</Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h2 className="display text-lg">딜</h2>
            {deals.length === 0 ? (
              <p className="text-sm text-muted-foreground">아직 딜이 없습니다.</p>
            ) : (
              deals.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-2 rounded-md border border-border px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{d.name || "이름 미기재"}</p>
                    {d.owner && <p className="text-xs text-muted-foreground">담당 {d.owner}</p>}
                  </div>
                  <Badge variant="secondary" className="shrink-0">{d.stage || "상담신청"}</Badge>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="display text-lg">프로젝트</h2>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">아직 프로젝트가 없습니다.</p>
            ) : (
              projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/p/${p.id}`}
                  className="flex items-center justify-between gap-2 rounded-md border border-border px-4 py-3 hover:border-primary/50"
                >
                  <span className="truncate text-sm text-foreground">{p.name}</span>
                  <StatusBadge status={p.status} />
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="display text-lg">제안</h2>
              <ProposalForm companyId={company.id} deals={dealOptions} prefillLabels={bottleneckLabels} />
            </div>
            {proposals.length === 0 ? (
              <p className="text-sm text-muted-foreground">아직 제안이 없습니다. 병목이 라인아이템으로 프리필됩니다.</p>
            ) : (
              proposals.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">
                      제안 v{p.version} · <span className="font-mono">{won(p.amount)}원</span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      M/M <span className="font-mono">{Number(p.mm_total)}</span>
                      <Badge variant="secondary">{PROPOSAL_STATUS_LABEL[p.status] ?? p.status}</Badge>
                      {p.has_contract && <Badge className="bg-primary/15 text-primary">계약됨</Badge>}
                    </p>
                  </div>
                  {p.status !== "accepted" && (
                    <div className="flex shrink-0 items-center gap-2">
                      {p.status === "draft" && (
                        <form action={proposalStatusAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="status" value="sent" />
                          <Button type="submit" size="sm" variant="outline">발송</Button>
                        </form>
                      )}
                      {p.status === "sent" && (
                        <form action={proposalStatusAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="status" value="viewed" />
                          <Button type="submit" size="sm" variant="outline">열람표시</Button>
                        </form>
                      )}
                      <form action={acceptProposalAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <Button type="submit" size="sm">수락 → 계약</Button>
                      </form>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="display text-lg">계약</h2>
            {contracts.length === 0 ? (
              <p className="text-sm text-muted-foreground">아직 계약이 없습니다. 제안을 수락하면 자동 생성됩니다.</p>
            ) : (
              contracts.map((c) => (
                <Link
                  key={c.id}
                  href={`/contracts/${c.id}`}
                  className="flex items-center justify-between gap-2 rounded-md border border-border px-4 py-3 hover:border-primary/50"
                >
                  <span className="text-sm text-foreground">
                    계약 #{c.id} · <span className="font-mono">{won(c.amount)}원</span>
                  </span>
                  <Badge variant="secondary" className="shrink-0">{CONTRACT_STATUS_LABEL[c.status] ?? c.status}</Badge>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h2 className="display text-lg">운영 OS 온톨로지</h2>
            <p className="text-sm text-muted-foreground">
              미팅 니즈에서 뽑은 병목을 ROI로 정렬하고, 무엇부터 자동화할지 데이터로 봅니다.
            </p>
          </div>
          <OntologyPanel companyId={company.id} objects={objects} edges={edges} />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="display text-lg">최근 활동</h2>
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">아직 기록된 활동이 없습니다.</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {activities.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-4 py-2.5 text-sm">
                  <span className="text-foreground">{activityLine(a)}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {a.actor} · {fmtDateTime(a.created_at)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </AppShell>
  );
}
