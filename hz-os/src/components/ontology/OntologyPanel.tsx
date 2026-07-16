"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { annualHoursSaved, objectRoiScore, priorityRank, type OntObject } from "@/lib/roi";
import { automateBottleneck } from "@/lib/actions/ontology";

export interface OntEdge {
  id: number;
  src_id: number;
  dst_id: number;
  rel_type: string;
  props?: Record<string, unknown> | null;
}

const TYPE_LABEL: Record<string, string> = {
  bottleneck: "병목",
  task: "업무",
  tool: "도구",
  automation: "자동화",
  process: "프로세스",
  metric: "지표",
  deliverable: "산출물",
  owner: "담당",
};

const REL_LABEL: Record<string, string> = {
  replaces: "대체",
  uses: "사용",
  owned_by: "담당",
  measures: "측정",
  blocks: "가로막음",
  produces: "생성",
};

const PRIORITY_STYLE: Record<string, string> = {
  높음: "bg-destructive/15 text-destructive",
  중간: "bg-primary/15 text-primary",
  낮음: "bg-secondary text-muted-foreground",
};

// 병목의 절감 추정치가 있으면 "연 N시간 절감" 문구를, 없으면 null.
function savingsLabel(o: OntObject): string | null {
  if (objectRoiScore(o) == null) return null;
  const t = Number(o.props?.timeSavedMinPerRun);
  const r = Number(o.props?.runsPerWeek);
  return `연 ${Math.round(annualHoursSaved(t, r)).toLocaleString("ko-KR")}시간 절감`;
}

export function OntologyPanel({
  companyId,
  objects,
  edges,
}: {
  companyId: number;
  objects: OntObject[];
  edges: OntEdge[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [selected, setSelected] = useState<number | null>(null);

  const labelOf = useMemo(() => {
    const m = new Map<number, OntObject>();
    for (const o of objects) m.set(o.id, o);
    return m;
  }, [objects]);

  const bottlenecks = useMemo(() => priorityRank(objects), [objects]);

  // 병목 → 그 병목을 대체하는 automation 엔티티(있으면). 엣지: automation -replaces-> bottleneck.
  const replacedBy = useMemo(() => {
    const m = new Map<number, OntObject[]>();
    for (const e of edges) {
      if (e.rel_type !== "replaces") continue;
      const src = labelOf.get(e.src_id);
      if (!src) continue;
      const list = m.get(e.dst_id) ?? [];
      list.push(src);
      m.set(e.dst_id, list);
    }
    return m;
  }, [edges, labelOf]);

  const grouped = useMemo(() => {
    const m = new Map<string, OntObject[]>();
    for (const o of objects) {
      const list = m.get(o.type) ?? [];
      list.push(o);
      m.set(o.type, list);
    }
    return m;
  }, [objects]);

  const selectedEdges = useMemo(
    () => (selected == null ? [] : edges.filter((e) => e.src_id === selected || e.dst_id === selected)),
    [edges, selected]
  );

  function automate(bottleneckId: number) {
    start(async () => {
      await automateBottleneck(companyId, bottleneckId);
      router.refresh();
    });
  }

  if (objects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        아직 온톨로지 엔티티가 없습니다. 미팅 상세에서 &quot;온톨로지로 가져오기&quot;로 니즈를 병목으로 추가하세요.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">병목 우선순위 (ROI 정렬)</h3>
        {bottlenecks.length === 0 ? (
          <p className="text-sm text-muted-foreground">병목 엔티티가 없습니다.</p>
        ) : (
          bottlenecks.map((b) => {
            const priority = String(b.props?.priority ?? "중간");
            const savings = savingsLabel(b);
            const autos = replacedBy.get(b.id) ?? [];
            const active = selected === b.id;
            return (
              <div
                key={b.id}
                className={`flex flex-col gap-2 rounded-md border px-4 py-3 text-left transition-colors ${
                  active ? "border-primary/60" : "border-border"
                }`}
              >
                <button type="button" onClick={() => setSelected(active ? null : b.id)} className="flex flex-col gap-1 text-left">
                  <div className="flex items-center gap-2">
                    <Badge className={PRIORITY_STYLE[priority]}>{priority}</Badge>
                    <span className="text-sm font-medium text-foreground">{b.label}</span>
                  </div>
                  {savings && <span className="text-xs text-primary">{savings}</span>}
                  {b.props?.context ? (
                    <span className="text-xs text-muted-foreground">{String(b.props.context)}</span>
                  ) : null}
                </button>
                <div className="flex items-center justify-between gap-2">
                  {autos.length > 0 ? (
                    <span className="text-xs text-muted-foreground">자동화 연결됨: {autos.map((a) => a.label).join(", ")}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">미착수</span>
                  )}
                  <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => automate(b.id)}>
                    자동화 만들기
                  </Button>
                </div>
              </div>
            );
          })
        )}

        {selected != null && (
          <Card className="mt-1">
            <CardHeader>
              <CardTitle className="text-sm">임팩트맵 — {labelOf.get(selected)?.label}</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedEdges.length === 0 ? (
                <p className="text-sm text-muted-foreground">연결된 관계가 없습니다.</p>
              ) : (
                <ul className="flex flex-col gap-1.5 text-sm">
                  {selectedEdges.map((e) => (
                    <li key={e.id} className="text-foreground/90">
                      {labelOf.get(e.src_id)?.label ?? `#${e.src_id}`}
                      <span className="mx-1.5 text-xs text-primary">{REL_LABEL[e.rel_type] ?? e.rel_type}</span>
                      {labelOf.get(e.dst_id)?.label ?? `#${e.dst_id}`}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">엔티티</h3>
        {[...grouped.entries()].map(([type, list]) => (
          <div key={type} className="flex flex-col gap-1.5 rounded-md border border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              {TYPE_LABEL[type] ?? type} · {list.length}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {list.map((o) => (
                <Badge key={o.id} variant="secondary" className="font-normal">
                  {o.label}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
