import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/guard";

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
    "SELECT id, name, business_no, ceo_name, address, industry, size, hourly_rate, margin_threshold FROM companies WHERE id = $1",
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
