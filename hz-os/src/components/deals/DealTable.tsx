"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PIPELINE_STAGES } from "@/lib/pipeline";
import { moveDealStage, assignOwner } from "@/lib/actions/deals";
import type { DealRow } from "@/components/DealKanban";

type SortKey = "company" | "stage";

function stageIndex(s: string | null): number {
  const i = (PIPELINE_STAGES as readonly string[]).indexOf(s ?? "");
  return i === -1 ? 0 : i;
}

export function DealTable({ deals }: { deals: DealRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [asc, setAsc] = useState(true);

  const sorted = useMemo(() => {
    if (!sortKey) return deals;
    const arr = [...deals];
    arr.sort((a, b) => {
      const cmp =
        sortKey === "company"
          ? (a.company || a.name || "").localeCompare(b.company || b.name || "", "ko")
          : stageIndex(a.stage) - stageIndex(b.stage);
      return asc ? cmp : -cmp;
    });
    return arr;
  }, [deals, sortKey, asc]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setAsc((v) => !v);
    else {
      setSortKey(k);
      setAsc(true);
    }
  }

  if (deals.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
        진행 중인 딜이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <SortableTh
              label="회사"
              active={sortKey === "company"}
              asc={asc}
              onClick={() => toggleSort("company")}
            />
            <th className="px-3 py-2 font-medium">담당자</th>
            <SortableTh
              label="단계"
              active={sortKey === "stage"}
              asc={asc}
              onClick={() => toggleSort("stage")}
            />
            <th className="px-3 py-2 font-medium">업종</th>
            <th className="px-3 py-2 font-medium">예산</th>
            <th className="px-3 py-2 font-medium">소스</th>
            <th className="px-3 py-2 font-medium">UTM</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((d) => (
            <DealTableRow key={d.id} deal={d} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortableTh({
  label,
  active,
  asc,
  onClick,
}: {
  label: string;
  active: boolean;
  asc: boolean;
  onClick: () => void;
}) {
  return (
    <th
      className="px-3 py-2 font-medium"
      aria-sort={active ? (asc ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn("inline-flex items-center gap-1 hover:text-foreground", active && "text-foreground")}
      >
        {label}
        <ArrowUpDown
          className={cn("h-3 w-3", active ? "opacity-100" : "opacity-40")}
          strokeWidth={1.75}
        />
      </button>
    </th>
  );
}

function DealTableRow({ deal }: { deal: DealRow }) {
  const [pending, start] = useTransition();
  const title = deal.company || deal.name || "이름 미기재";
  const utm = [deal.utm_source, deal.utm_campaign, deal.utm_content].filter(Boolean).join(" · ");

  return (
    <tr className="border-b border-border/60 last:border-0 hover:bg-muted/30">
      <td className="px-3 py-2">
        {deal.company_id ? (
          <Link href={`/c/${deal.company_id}`} className="font-medium hover:text-primary">
            {title}
          </Link>
        ) : (
          <span className="font-medium">{title}</span>
        )}
        {deal.company && deal.name && (
          <span className="ml-2 text-xs text-muted-foreground">{deal.name}</span>
        )}
      </td>
      <td className="px-3 py-2">
        <input
          defaultValue={deal.owner ?? ""}
          placeholder="담당자"
          disabled={pending}
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v !== (deal.owner ?? "")) start(() => assignOwner(deal.id, v));
          }}
          className="h-7 w-24 rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring"
        />
      </td>
      <td className="px-3 py-2">
        <select
          value={deal.stage ?? PIPELINE_STAGES[0]}
          disabled={pending}
          onChange={(e) => start(() => moveDealStage(deal.id, e.target.value))}
          className="h-7 rounded-md border border-input bg-transparent px-2 text-xs text-foreground outline-none focus-visible:border-ring"
        >
          {PIPELINE_STAGES.map((s) => (
            <option key={s} value={s} className="bg-card text-foreground">
              {s}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2 text-muted-foreground">{deal.industry || "—"}</td>
      <td className="px-3 py-2 tabular-nums text-muted-foreground">{deal.budget || "—"}</td>
      <td className="px-3 py-2 text-muted-foreground">
        {deal.source === "landing" ? "랜딩" : deal.source}
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground">{utm || "—"}</td>
    </tr>
  );
}
