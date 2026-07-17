"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { GanttChartSquare, ListTree, ChevronDown } from "lucide-react";
import type { Phase, TimelineRollup } from "@/lib/phases";

type Mode = "staff" | "client";

const STATUS_LABEL: Record<Phase["status"], string> = { done: "완료", active: "진행 중", todo: "예정" };

function statusBar(status: Phase["status"]): string {
  // 단일 accent(primary=코발트). 강도로 상태 구분.
  if (status === "done") return "bg-primary";
  if (status === "active") return "bg-primary/60";
  return "bg-muted-foreground/25";
}
function statusBadge(status: Phase["status"]): string {
  if (status === "done") return "border-primary/40 text-primary";
  if (status === "active") return "border-primary/40 text-foreground";
  return "text-muted-foreground";
}

export function GanttTimeline({ rollup, mode }: { rollup: TimelineRollup; mode: Mode }) {
  const [view, setView] = useState<"timeline" | "gantt">("timeline");
  const { phases, progress, doneTasks, totalTasks, currentPhase } = rollup;

  if (phases.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
        아직 진행 단계가 없습니다.
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      {/* 롤업 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="display text-2xl tabular-nums">{progress}%</span>
          <span className="text-sm text-muted-foreground">
            {mode === "staff" ? `${doneTasks}/${totalTasks} 작업` : "전체 진행률"}
            {currentPhase && <span className="ml-2">· 현재 {currentPhase.name.replace(/^Phase \d+ · /, "")}</span>}
          </span>
        </div>
        <div className="inline-flex items-center gap-1 rounded-lg border border-border p-0.5">
          <button
            onClick={() => setView("timeline")}
            aria-pressed={view === "timeline"}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors",
              view === "timeline" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ListTree className="size-3.5" strokeWidth={1.75} /> 타임라인
          </button>
          <button
            onClick={() => setView("gantt")}
            aria-pressed={view === "gantt"}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors",
              view === "gantt" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <GanttChartSquare className="size-3.5" strokeWidth={1.75} /> 간트
          </button>
        </div>
      </div>

      {/* 전체 진행 막대 */}
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>

      {view === "gantt" ? (
        <GanttView phases={phases} />
      ) : (
        <div className="flex flex-col gap-2">
          {phases.map((p) => (
            <PhaseRow key={p.id} phase={p} mode={mode} />
          ))}
        </div>
      )}
    </section>
  );
}

// 간트: 태스크 수에 비례한 가로 세그먼트, 진행률 채움, 현재 단계 강조
function GanttView({ phases }: { phases: Phase[] }) {
  const weights = phases.map((p) => Math.max(p.tasks_total, 1));
  const sum = weights.reduce((a, b) => a + b, 0);
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-[640px] gap-1">
        {phases.map((p, i) => (
          <div key={p.id} style={{ flexGrow: weights[i], flexBasis: 0 }} className="min-w-0">
            <div
              className={cn(
                "relative h-9 overflow-hidden rounded-md bg-muted ring-1 ring-inset ring-border",
                p.status === "active" && "ring-primary/50"
              )}
              title={`${p.name} · ${p.progress}%`}
            >
              <div className={cn("h-full", statusBar(p.status))} style={{ width: `${p.progress}%` }} />
              <span className="absolute inset-0 flex items-center px-2 text-[11px] font-medium text-foreground/90">
                {p.seq}. {p.name.replace(/^Phase \d+ · /, "").slice(0, 14)}
              </span>
            </div>
            <div className="mt-1 px-0.5 text-[10px] tabular-nums text-muted-foreground">{p.progress}%</div>
          </div>
        ))}
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">막대 폭 = 단계별 작업량 · 채움 = 진행률 · 굵은 테두리 = 현재 단계</p>
    </div>
  );
}

function PhaseRow({ phase, mode }: { phase: Phase; mode: Mode }) {
  const [open, setOpen] = useState(false);
  const body = mode === "client" ? phase.summary_client : phase.deliverable;
  const hasDetail = mode === "staff" ? Boolean(phase.detail) : false;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-3 transition-colors",
        phase.status === "active" ? "border-primary/40" : "border-border"
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium tabular-nums",
            phase.status === "done" ? "bg-primary text-primary-foreground" : phase.status === "active" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          {phase.seq}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{phase.name.replace(/^Phase \d+ · /, "")}</span>
            <Badge variant="outline" className={cn("shrink-0 text-[10px]", statusBadge(phase.status))}>
              {STATUS_LABEL[phase.status]}
            </Badge>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {mode === "staff" && (
            <span className="text-xs tabular-nums text-muted-foreground">
              {phase.tasks_done}/{phase.tasks_total}
            </span>
          )}
          <span className="w-10 text-right text-sm tabular-nums text-foreground">{phase.progress}%</span>
        </div>
      </div>

      {/* 진행 막대 */}
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", statusBar(phase.status))} style={{ width: `${phase.progress}%` }} />
      </div>

      {/* 본문: staff=원문 산출물, client=AI 고객언어 요약 */}
      {body ? (
        <p className="mt-2.5 text-xs leading-relaxed text-foreground/80">{body}</p>
      ) : mode === "client" ? (
        <p className="mt-2.5 text-xs text-muted-foreground">진행 요약을 준비하고 있습니다.</p>
      ) : null}

      {hasDetail && (
        <>
          <button
            onClick={() => setOpen((v) => !v)}
            className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} strokeWidth={2} />
            {open ? "작업 내역 접기" : "작업 내역"}
          </button>
          {open && <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{phase.detail}</p>}
        </>
      )}
    </div>
  );
}
