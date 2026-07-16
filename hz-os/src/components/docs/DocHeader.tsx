"use client";

import { useState, useTransition } from "react";
import { Download, Globe, History, Lock } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MarkdownView } from "./MarkdownView";
import { renameDocument, restoreVersion, setVisibility } from "@/lib/actions/documents";

export interface VersionItem {
  id: number;
  saved_at: string;
  text: string;
}

function fmt(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function DocHeader({
  docId,
  projectId,
  initialTitle,
  visibility,
  versions,
}: {
  docId: number;
  projectId: number;
  initialTitle: string;
  visibility: string;
  versions: VersionItem[];
}) {
  const [title, setTitle] = useState(initialTitle);
  const [preview, setPreview] = useState<VersionItem | null>(null);
  const [pending, startTransition] = useTransition();
  const shared = visibility === "shared";

  function commitTitle() {
    const clean = title.trim();
    if (!clean || clean === initialTitle) return;
    startTransition(() => renameDocument(docId, clean));
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={commitTitle}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        aria-label="문서 제목"
        className="display w-full bg-transparent text-2xl outline-none focus-visible:ring-0"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(() => setVisibility(docId, shared ? "internal" : "shared"))
          }
          className="gap-1.5"
        >
          {shared ? <Globe className="size-4" /> : <Lock className="size-4" />}
          <Badge className={shared ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}>
            {shared ? "고객 공유" : "내부 전용"}
          </Badge>
        </Button>

        <a
          href={`/p/${projectId}/docs/${docId}/export`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <Download className="size-4" />
          마크다운 내보내기
        </a>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="gap-1.5">
              <History className="size-4" />
              버전 기록
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {versions.length === 0 ? (
              <DropdownMenuItem disabled>저장된 버전이 없습니다.</DropdownMenuItem>
            ) : (
              versions.map((v) => (
                <DropdownMenuItem key={v.id} onSelect={() => setPreview(v)}>
                  {fmt(v.saved_at)}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{preview ? fmt(preview.saved_at) : ""} 버전 미리보기</DialogTitle>
          </DialogHeader>
          {preview && <MarkdownView text={preview.text} />}
          <DialogFooter>
            <Button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!preview) return;
                const id = preview.id;
                startTransition(() => restoreVersion(docId, id));
                setPreview(null);
              }}
            >
              이 버전으로 복원
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
