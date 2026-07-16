"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FilePlus, Globe, Lock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createDocument } from "@/lib/actions/documents";

export interface DocNode {
  id: number;
  parent_id: number | null;
  title: string;
  visibility: string;
}

export function DocTree({ projectId, docs }: { projectId: number; docs: DocNode[] }) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const childrenOf = (parentId: number | null) =>
    docs.filter((d) => d.parent_id === parentId);

  function render(parentId: number | null, depth: number) {
    return childrenOf(parentId).map((doc) => {
      const active = pathname === `/p/${projectId}/docs/${doc.id}`;
      return (
        <div key={doc.id}>
          <div
            className={cn(
              "group flex items-center gap-1 rounded-md pr-1 text-sm",
              active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"
            )}
          >
            <Link
              href={`/p/${projectId}/docs/${doc.id}`}
              className="flex min-w-0 flex-1 items-center gap-1.5 py-1.5 pl-2"
              style={{ paddingLeft: `${8 + depth * 14}px` }}
            >
              {doc.visibility === "shared" ? (
                <Globe className="size-3.5 shrink-0 text-primary" />
              ) : (
                <Lock className="size-3.5 shrink-0 opacity-60" />
              )}
              <span className="truncate">{doc.title}</span>
            </Link>
            <button
              type="button"
              aria-label="하위 문서 추가"
              disabled={pending}
              onClick={() => startTransition(() => createDocument(projectId, doc.id))}
              className="hidden shrink-0 rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground group-hover:block"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          {render(doc.id, depth + 1)}
        </div>
      );
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground">문서</span>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 gap-1 px-2 text-xs"
          disabled={pending}
          onClick={() => startTransition(() => createDocument(projectId))}
        >
          <FilePlus className="size-3.5" />
          새 문서
        </Button>
      </div>
      <nav className="flex flex-col">
        {docs.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">아직 문서가 없습니다.</p>
        ) : (
          render(null, 0)
        )}
      </nav>
    </div>
  );
}
