"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { leadToProject, archiveLead } from "@/lib/actions/leads";

export interface LeadRow {
  id: number;
  source: string;
  name: string | null;
  company: string | null;
  contact: string | null;
  email: string | null;
  industry: string | null;
  budget: string | null;
  start_timing: string | null;
  pain_summary: string | null;
  created_at: string;
}

export function InboundLeads({ leads }: { leads: LeadRow[] }) {
  if (leads.length === 0) return null;
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="display text-lg">새 문의</h2>
        <Badge variant="secondary">{leads.length}</Badge>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {leads.map((l) => (
          <LeadCard key={l.id} lead={l} />
        ))}
      </div>
    </section>
  );
}

function LeadCard({ lead }: { lead: LeadRow }) {
  const [pending, start] = useTransition();
  const meta = [lead.industry, lead.budget, lead.start_timing].filter(Boolean).join(" · ");
  return (
    <div className="rounded-lg border border-primary/30 bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium">{lead.company || lead.name || "이름 미기재"}</p>
          <p className="truncate text-sm text-muted-foreground">
            {[lead.name, lead.contact || lead.email].filter(Boolean).join(" · ") || "연락처 미기재"}
          </p>
        </div>
        <Badge variant="outline" className="shrink-0 text-xs">
          {lead.source === "landing" ? "랜딩" : lead.source}
        </Badge>
      </div>
      {meta && <p className="mt-2 text-xs text-muted-foreground">{meta}</p>}
      {lead.pain_summary && (
        <p className="mt-2 line-clamp-3 text-sm text-foreground/80">{lead.pain_summary}</p>
      )}
      <div className="mt-4 flex gap-2">
        <Button
          size="sm"
          disabled={pending}
          onClick={() => start(() => leadToProject(lead.id))}
        >
          프로젝트로 전환
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => start(() => archiveLead(lead.id))}
        >
          보관
        </Button>
      </div>
    </div>
  );
}
