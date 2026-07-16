// documents.content(JSONB) → 마크다운 텍스트 변환. 순수 함수 (부수효과 없음).
// hz-os 에디터는 {format:'md', text} 포맷으로 저장하므로 그 경우 원문을 그대로 돌려준다.
// Plate/Slate 노드 배열이 들어오는 경우(레거시/향후 호환)를 대비해 핵심 블록만 변환한다.

export interface MdContent {
  format: "md";
  text: string;
}

interface SlateNode {
  type?: string;
  text?: string;
  checked?: boolean;
  lang?: string;
  children?: SlateNode[];
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  strikethrough?: boolean;
}

export type DocContent = MdContent | SlateNode[] | null | undefined;

function isMd(c: DocContent): c is MdContent {
  return !!c && !Array.isArray(c) && (c as MdContent).format === "md";
}

function leaf(n: SlateNode): string {
  const t = n.text ?? "";
  if (!t) return "";
  if (n.code) return "`" + t + "`";
  let out = t;
  if (n.bold) out = "**" + out + "**";
  if (n.italic) out = "*" + out + "*";
  if (n.strikethrough) out = "~~" + out + "~~";
  return out;
}

function inline(children: SlateNode[] | undefined): string {
  return (children ?? [])
    .map((c) => (c.children ? inline(c.children) : leaf(c)))
    .join("");
}

const HEADINGS: Record<string, number> = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 };

function block(node: SlateNode): string {
  const type = node.type ?? "p";

  if (HEADINGS[type]) return "#".repeat(HEADINGS[type]) + " " + inline(node.children);

  if (type === "hr" || type === "horizontal_rule") return "---";

  if (type === "blockquote") {
    const inner = (node.children ?? []).map(block).join("\n");
    return inner
      .split("\n")
      .map((l) => (l ? "> " + l : ">"))
      .join("\n");
  }

  if (type === "code_block") {
    const lines = (node.children ?? []).map((c) => inline(c.children) || c.text || "").join("\n");
    return "```" + (node.lang ?? "") + "\n" + lines + "\n```";
  }

  if (type === "ul" || type === "ol") {
    return (node.children ?? [])
      .map((li, i) => {
        const marker = type === "ol" ? `${i + 1}. ` : "- ";
        return marker + inline(li.children);
      })
      .join("\n");
  }

  // 체크리스트: Plate todo/action_item 노드
  if (type === "action_item" || type === "todo") {
    return (node.checked ? "- [x] " : "- [ ] ") + inline(node.children);
  }

  if (type === "table") {
    const rows = node.children ?? [];
    const cells = (row: SlateNode) => (row.children ?? []).map((c) => inline(c.children));
    const out: string[] = [];
    rows.forEach((row, i) => {
      const c = cells(row);
      out.push("| " + c.join(" | ") + " |");
      if (i === 0) out.push("| " + c.map(() => "---").join(" | ") + " |");
    });
    return out.join("\n");
  }

  // 기본: 문단
  return inline(node.children);
}

export function toMarkdown(content: DocContent): string {
  if (!content) return "";
  if (isMd(content)) return content.text ?? "";
  if (Array.isArray(content)) return content.map(block).join("\n\n").trim() + "\n";
  return "";
}
