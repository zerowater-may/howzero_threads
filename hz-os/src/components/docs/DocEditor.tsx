"use client";

import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MarkdownView } from "./MarkdownView";
import { saveDocument } from "@/lib/actions/documents";

type Status = "saved" | "dirty" | "saving";

const STATUS_LABEL: Record<Status, string> = {
  saved: "저장됨",
  dirty: "수정됨",
  saving: "저장 중",
};

// 툴바 버튼: 커서 위치 기준으로 마크다운 스니펫을 넣거나 선택 영역을 감싼다.
interface Snippet {
  label: string;
  wrap?: string; // 선택 영역을 감싸는 마크 (예: **)
  prefix?: string; // 줄 시작에 붙이는 접두 (예: "## ", "- ")
  insert?: string; // 커서 위치에 그대로 삽입 (예: 표 템플릿)
}

const SNIPPETS: Snippet[] = [
  { label: "제목", prefix: "## " },
  { label: "굵게", wrap: "**" },
  { label: "리스트", prefix: "- " },
  { label: "표", insert: "\n| 항목 | 값 |\n| --- | --- |\n| A | 1 |\n" },
];

export function DocEditor({ docId, initialText }: { docId: number; initialText: string }) {
  const [text, setText] = useState(initialText);
  const [status, setStatus] = useState<Status>("saved");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const latest = useRef(initialText);
  const saved = useRef(initialText);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function save() {
    if (timer.current) clearTimeout(timer.current);
    const snap = latest.current;
    if (snap === saved.current) {
      setStatus("saved");
      return;
    }
    setStatus("saving");
    await saveDocument(docId, snap);
    saved.current = snap;
    setStatus(latest.current === snap ? "saved" : "dirty");
  }

  function change(value: string) {
    setText(value);
    latest.current = value;
    setStatus(value === saved.current ? "saved" : "dirty");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(save, 2000);
  }

  // 언마운트 시 대기 중인 자동저장 타이머 정리 (마지막 편집은 수동 저장/탭 전환으로 커버)
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function apply(s: Snippet) {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = text.slice(0, start);
    const sel = text.slice(start, end);
    const after = text.slice(end);
    let next: string;
    let caret: number;
    if (s.insert) {
      next = before + s.insert + after;
      caret = start + s.insert.length;
    } else if (s.wrap) {
      const inner = sel || "텍스트";
      next = before + s.wrap + inner + s.wrap + after;
      caret = start + s.wrap.length + inner.length + s.wrap.length;
    } else {
      // 줄 시작에 prefix 삽입
      const prefix = s.prefix ?? "";
      const lineStart = before.lastIndexOf("\n") + 1;
      next = text.slice(0, lineStart) + prefix + text.slice(lineStart);
      caret = end + prefix.length;
    }
    change(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(caret, caret);
    });
  }

  return (
    <Tabs defaultValue="edit" className="gap-3">
      <div className="flex items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value="edit">편집</TabsTrigger>
          <TabsTrigger value="preview">미리보기</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{STATUS_LABEL[status]}</span>
          <Button type="button" size="sm" variant="outline" onClick={save} disabled={status === "saving"}>
            저장
          </Button>
        </div>
      </div>

      <TabsContent value="edit" className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          {SNIPPETS.map((s) => (
            <Button
              key={s.label}
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={() => apply(s)}
            >
              {s.label}
            </Button>
          ))}
        </div>
        <Textarea
          ref={taRef}
          value={text}
          onChange={(e) => change(e.target.value)}
          placeholder="마크다운으로 문서를 작성하세요. 제목은 #, 목록은 -, 체크리스트는 - [ ] 를 사용합니다."
          className="min-h-[420px] resize-y font-mono text-sm leading-relaxed"
        />
      </TabsContent>

      <TabsContent value="preview">
        <div className="min-h-[420px] rounded-md border border-border p-4">
          <MarkdownView text={text} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
