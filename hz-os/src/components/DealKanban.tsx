"use client";

import { useState, useTransition, type DragEvent } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { PIPELINE_STAGES } from "@/lib/pipeline";
import { moveDealStage, assignOwner } from "@/lib/actions/deals";
import { leadToProject, archiveLead } from "@/lib/actions/leads";

export interface DealRow {
  id: number;
  source: string;
  name: string | null;
  company: string | null;
  company_id: number | null;
  contact: string | null;
  email: string | null;
  industry: string | null;
  budget: string | null;
  start_timing: string | null;
  pain_summary: string | null;
  stage: string | null;
  owner: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
}

export function DealKanban({ deals }: { deals: DealRow[] }) {
  const [, startMove] = useTransition();
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);

  const byStage = new Map<string, DealRow[]>();
  for (const s of PIPELINE_STAGES) byStage.set(s, []);
  for (const d of deals) {
    const stage = d.stage && byStage.has(d.stage) ? d.stage : PIPELINE_STAGES[0];
    byStage.get(stage)!.push(d);
  }

  function handleDrop(stage: string, e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData("text/plain"));
    setOverStage(null);
    setDraggingId(null);
    if (!id) return;
    const deal = deals.find((d) => d.id === id);
    if (deal && deal.stage !== stage) startMove(() => moveDealStage(id, stage));
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {PIPELINE_STAGES.map((stage) => {
        const items = byStage.get(stage)!;
        const isOver = overStage === stage;
        return (
          <div
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              if (overStage !== stage) setOverStage(stage);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverStage(null);
            }}
            onDrop={(e) => handleDrop(stage, e)}
            className={cn(
              "flex w-64 shrink-0 flex-col gap-3 rounded-lg p-1 transition-colors",
              isOver && "bg-primary/5 ring-1 ring-primary/40"
            )}
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-medium text-foreground">{stage}</span>
              <span className="text-xs text-muted-foreground">{items.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {items.map((d) => (
                <DealCard
                  key={d.id}
                  deal={d}
                  dragging={draggingId === d.id}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", String(d.id));
                    e.dataTransfer.effectAllowed = "move";
                    setDraggingId(d.id);
                  }}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setOverStage(null);
                  }}
                />
              ))}
              {items.length === 0 && (
                <div className="rounded-lg border border-dashed border-border/60 px-3 py-6 text-center text-xs text-muted-foreground">
                  비어 있음
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DealCard({
  deal,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  deal: DealRow;
  dragging: boolean;
  onDragStart: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: DragEvent<HTMLDivElement>) => void;
}) {
  const [pending, start] = useTransition();
  const meta = [deal.industry, deal.budget, deal.start_timing].filter(Boolean).join(" · ");
  const utm = [deal.utm_source, deal.utm_campaign, deal.utm_content].filter(Boolean) as string[];
  const title = deal.company || deal.name || "이름 미기재";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab rounded-lg border border-border bg-card p-3 transition-opacity active:cursor-grabbing",
        dragging && "opacity-50 ring-1 ring-primary/50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {deal.company_id ? (
            <Link href={`/c/${deal.company_id}`} className="truncate font-medium hover:text-primary">
              {title}
            </Link>
          ) : (
            <p className="truncate font-medium">{title}</p>
          )}
          <p className="truncate text-xs text-muted-foreground">
            {[deal.name, deal.contact || deal.email].filter(Boolean).join(" · ") || "연락처 미기재"}
          </p>
        </div>
        <Badge variant="outline" className="shrink-0 text-[10px]">
          {deal.source === "landing" ? "랜딩" : deal.source}
        </Badge>
      </div>

      {meta && <p className="mt-2 text-xs text-muted-foreground">{meta}</p>}
      {utm.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {utm.map((u, i) => (
            <Badge key={i} variant="secondary" className="text-[10px]">
              {u}
            </Badge>
          ))}
        </div>
      )}
      {deal.pain_summary && (
        <p className="mt-2 line-clamp-2 text-xs text-foreground/80">{deal.pain_summary}</p>
      )}

      {/* draggable=false: 카드 드래그와 충돌하지 않게 셀렉트/입력 조작 허용 (키보드 대체수단 유지) */}
      <div className="mt-3 flex items-center gap-2" draggable={false}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" disabled={pending}>
              단계 이동
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {PIPELINE_STAGES.map((s) => (
              <DropdownMenuItem
                key={s}
                disabled={s === deal.stage}
                onSelect={() => start(() => moveDealStage(deal.id, s))}
              >
                {s}
                {s === deal.stage && <span className="ml-auto text-xs text-muted-foreground">현재</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <input
          draggable={false}
          defaultValue={deal.owner ?? ""}
          placeholder="담당자"
          disabled={pending}
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v !== (deal.owner ?? "")) start(() => assignOwner(deal.id, v));
          }}
          className="h-7 w-20 rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring"
        />
      </div>

      <div className="mt-2 flex gap-2" draggable={false}>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs"
          disabled={pending}
          onClick={() => start(() => leadToProject(deal.id))}
        >
          프로젝트로 전환
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs text-muted-foreground"
          disabled={pending}
          onClick={() => start(() => archiveLead(deal.id))}
        >
          보관
        </Button>
      </div>
    </div>
  );
}
