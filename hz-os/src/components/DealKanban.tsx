"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const byStage = new Map<string, DealRow[]>();
  for (const s of PIPELINE_STAGES) byStage.set(s, []);
  for (const d of deals) {
    const stage = d.stage && byStage.has(d.stage) ? d.stage : PIPELINE_STAGES[0];
    byStage.get(stage)!.push(d);
  }

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="display text-lg">딜 파이프라인</h2>
        <Badge variant="secondary">{deals.length}</Badge>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {PIPELINE_STAGES.map((stage) => {
          const items = byStage.get(stage)!;
          return (
            <div key={stage} className="flex w-64 shrink-0 flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-medium text-foreground">{stage}</span>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {items.map((d) => (
                  <DealCard key={d.id} deal={d} />
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
    </section>
  );
}

function DealCard({ deal }: { deal: DealRow }) {
  const [pending, start] = useTransition();
  const meta = [deal.industry, deal.budget, deal.start_timing].filter(Boolean).join(" · ");
  const utm = [deal.utm_source, deal.utm_campaign, deal.utm_content].filter(Boolean) as string[];
  const title = deal.company || deal.name || "이름 미기재";

  return (
    <div className="rounded-lg border border-border bg-card p-3">
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

      <div className="mt-3 flex items-center gap-2">
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

      <div className="mt-2 flex gap-2">
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
