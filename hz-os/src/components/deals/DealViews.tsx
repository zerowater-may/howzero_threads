"use client";

import { useState, type ReactNode } from "react";
import { Columns3, Table2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DealKanban, type DealRow } from "@/components/DealKanban";
import { DealTable } from "@/components/deals/DealTable";

type View = "kanban" | "table";

export function DealViews({ deals }: { deals: DealRow[] }) {
  const [view, setView] = useState<View>("kanban");

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="display text-lg">딜 파이프라인</h2>
          <Badge variant="secondary">{deals.length}</Badge>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
          <ViewBtn
            active={view === "kanban"}
            onClick={() => setView("kanban")}
            icon={<Columns3 className="h-4 w-4" strokeWidth={1.75} />}
            label="칸반"
          />
          <ViewBtn
            active={view === "table"}
            onClick={() => setView("table")}
            icon={<Table2 className="h-4 w-4" strokeWidth={1.75} />}
            label="테이블"
          />
        </div>
      </div>

      {view === "kanban" ? <DealKanban deals={deals} /> : <DealTable deals={deals} />}
    </section>
  );
}

function ViewBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm transition-colors",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
