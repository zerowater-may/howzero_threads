import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PIPELINE_STAGES } from "@/lib/pipeline";
import { getCompanyByToken, getClientPortalData } from "@/lib/client-portal";
import { cn } from "@/lib/utils";

const PROPOSAL_STATUS_LABEL: Record<string, string> = {
  draft: "준비 중",
  sent: "전달드림",
  viewed: "열람",
  accepted: "수락 완료",
};

const won = (n: number) => Number(n).toLocaleString("ko-KR");

export default async function ClientPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const company = await getCompanyByToken(token);
  if (!company) notFound();

  const { currentStage, proposals, contracts, sharedDocs, timeline } = await getClientPortalData(company.id);
  const currentIdx = (PIPELINE_STAGES as readonly string[]).indexOf(currentStage);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="display text-2xl">{company.name} 프로젝트 룸</h1>
        <p className="text-sm text-muted-foreground">
          안녕하세요. howzero가 함께하는 프로젝트 진행 현황을 이곳에서 언제든 확인하실 수 있습니다.
        </p>
      </div>

      {/* (1) 진행 타임라인 */}
      <section className="flex flex-col gap-4">
        <h2 className="display text-lg">진행 단계</h2>
        <ol className="flex items-start">
          {PIPELINE_STAGES.map((stage, i) => {
            const done = i <= currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <li key={stage} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full items-center">
                  <span className={cn("h-0.5 flex-1", i === 0 ? "opacity-0" : done ? "bg-primary" : "bg-border")} />
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full border text-xs tabular-nums",
                      isCurrent
                        ? "border-primary bg-primary text-primary-foreground"
                        : done
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border text-muted-foreground"
                    )}
                  >
                    {done && !isCurrent ? <Check className="size-4" strokeWidth={1.75} /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      "h-0.5 flex-1",
                      i === PIPELINE_STAGES.length - 1 ? "opacity-0" : i < currentIdx ? "bg-primary" : "bg-border"
                    )}
                  />
                </div>
                <span className={cn("text-center text-xs", done ? "text-foreground" : "text-muted-foreground")}>
                  {stage}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="text-sm text-muted-foreground">
          현재 <span className="text-foreground">{currentStage}</span> 단계입니다.
        </p>
      </section>

      {/* (2) 받은 제안 */}
      <section className="flex flex-col gap-4">
        <h2 className="display text-lg">받은 제안</h2>
        {proposals.length === 0 ? (
          <p className="text-sm text-muted-foreground">아직 전달드린 제안이 없습니다. 준비되는 대로 이곳에 올려드리겠습니다.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {proposals.map((p) => (
              <Card key={p.id}>
                <CardContent className="flex flex-wrap items-start justify-between gap-3 pt-6">
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="text-sm text-foreground">제안 v{p.version}</p>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        투입 M/M <span className="font-mono tabular-nums text-foreground">{p.mm_total}</span>
                      </span>
                      {p.line_labels.length > 0 && <span>항목 {p.line_labels.length}개</span>}
                    </p>
                    {p.line_labels.length > 0 && (
                      <p className="truncate text-xs text-muted-foreground">{p.line_labels.join(" · ")}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="font-mono text-base tabular-nums text-foreground">{won(p.amount)}원</span>
                    <Badge variant="secondary">{PROPOSAL_STATUS_LABEL[p.status] ?? p.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* (3) 계약·마일스톤 */}
      <section className="flex flex-col gap-4">
        <h2 className="display text-lg">계약 진행</h2>
        {contracts.length === 0 ? (
          <p className="text-sm text-muted-foreground">아직 진행 중인 계약이 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {contracts.map((c) => {
              const pct = Math.round(c.done_ratio * 100);
              return (
                <Card key={c.id}>
                  <CardContent className="flex flex-col gap-4 pt-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm text-foreground">계약 금액</span>
                      <span className="font-mono text-base tabular-nums text-foreground">{won(c.amount)}원</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>마일스톤 진척</span>
                        <span className="tabular-nums">
                          {c.done_count}/{c.total_count} · {pct}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    {c.milestones.length > 0 && (
                      <ul className="flex flex-col gap-1.5">
                        {c.milestones.map((m, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <span
                              className={cn(
                                "flex size-4 shrink-0 items-center justify-center rounded-full",
                                m.status === "done" ? "bg-primary text-primary-foreground" : "border border-border"
                              )}
                            >
                              {m.status === "done" && <Check className="size-3" strokeWidth={1.75} />}
                            </span>
                            <span className={cn("flex-1", m.status === "done" ? "text-foreground" : "text-muted-foreground")}>
                              {m.label || "마일스톤"}
                            </span>
                            {m.due && <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{m.due}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* (4) 산출물 */}
      <section className="flex flex-col gap-4">
        <h2 className="display text-lg">공유 산출물</h2>
        {sharedDocs.length === 0 ? (
          <p className="text-sm text-muted-foreground">공유된 산출물이 아직 없습니다. 문서가 준비되면 이곳에서 열람하실 수 있습니다.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sharedDocs.map((d) =>
              d.share_token ? (
                <Link
                  key={d.id}
                  href={`/share/${d.share_token}/docs/${d.id}`}
                  className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-sm text-foreground hover:border-primary/50"
                >
                  <FileText className="size-4 text-muted-foreground" strokeWidth={1.75} />
                  {d.title}
                </Link>
              ) : (
                <div
                  key={d.id}
                  className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-sm text-muted-foreground"
                >
                  <FileText className="size-4" strokeWidth={1.75} />
                  {d.title}
                </div>
              )
            )}
          </div>
        )}
      </section>

      {timeline.length > 0 && (
        <p className="text-xs text-muted-foreground">
          최근 업데이트 {timeline.length}건이 반영되어 있습니다. 궁금한 점은 담당자에게 편하게 연락 주세요.
        </p>
      )}
    </div>
  );
}
