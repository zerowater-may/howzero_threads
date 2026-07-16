import { describe, expect, it } from "vitest";
import { toMarkdown } from "./md-export";

describe("toMarkdown", () => {
  it("md 포맷은 원문을 그대로 반환한다", () => {
    expect(toMarkdown({ format: "md", text: "# 제목\n본문" })).toBe("# 제목\n본문");
  });

  it("빈 값은 빈 문자열", () => {
    expect(toMarkdown(null)).toBe("");
    expect(toMarkdown(undefined)).toBe("");
    expect(toMarkdown({ format: "md", text: "" })).toBe("");
  });

  it("Slate 노드 배열의 핵심 블록을 마크다운으로 변환한다", () => {
    const md = toMarkdown([
      { type: "h1", children: [{ text: "제목" }] },
      {
        type: "p",
        children: [
          { text: "굵게", bold: true },
          { text: " 그리고 " },
          { text: "기울임", italic: true },
        ],
      },
      { type: "blockquote", children: [{ type: "p", children: [{ text: "인용문" }] }] },
      { type: "ul", children: [
        { type: "li", children: [{ text: "첫째" }] },
        { type: "li", children: [{ text: "둘째" }] },
      ] },
      { type: "code_block", lang: "ts", children: [{ children: [{ text: "const a = 1" }] }] },
      { type: "hr", children: [{ text: "" }] },
    ]);
    expect(md).toBe(
      [
        "# 제목",
        "",
        "**굵게** 그리고 *기울임*",
        "",
        "> 인용문",
        "",
        "- 첫째",
        "- 둘째",
        "",
        "```ts\nconst a = 1\n```",
        "",
        "---",
        "",
      ].join("\n")
    );
  });

  it("체크리스트와 표를 변환한다", () => {
    expect(toMarkdown([{ type: "action_item", checked: true, children: [{ text: "완료" }] }])).toBe(
      "- [x] 완료\n"
    );
    const table = toMarkdown([
      { type: "table", children: [
        { type: "tr", children: [{ children: [{ text: "A" }] }, { children: [{ text: "B" }] }] },
        { type: "tr", children: [{ children: [{ text: "1" }] }, { children: [{ text: "2" }] }] },
      ] },
    ]);
    expect(table).toBe("| A | B |\n| --- | --- |\n| 1 | 2 |\n");
  });
});
