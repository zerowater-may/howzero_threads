import { describe, expect, it } from "vitest";
import { buildMeetingMarkdown, parseAnalysis } from "./meeting-analysis";

describe("parseAnalysis", () => {
  it("순수 JSON 응답을 파싱한다", () => {
    const raw = JSON.stringify({
      summary: "요약입니다.",
      needs: [{ need: "대시보드 필요", context: "매일 수기 집계 중", priority: "높음" }],
    });
    expect(parseAnalysis(raw)).toEqual({
      summary: "요약입니다.",
      needs: [{ need: "대시보드 필요", context: "매일 수기 집계 중", priority: "높음" }],
    });
  });

  it("코드펜스와 앞뒤 설명 텍스트를 제거하고 파싱한다", () => {
    const raw = [
      "물론입니다, 분석 결과는 다음과 같습니다:",
      "```json",
      JSON.stringify({ summary: "요약", needs: [] }),
      "```",
      "감사합니다.",
    ].join("\n");
    expect(parseAnalysis(raw)).toEqual({ summary: "요약", needs: [] });
  });

  it("알 수 없는 priority는 중간으로 보정한다", () => {
    const raw = JSON.stringify({
      summary: "요약",
      needs: [{ need: "니즈", context: "", priority: "urgent" }],
    });
    expect(parseAnalysis(raw).needs[0].priority).toBe("중간");
  });

  it("need가 없는 항목은 제외한다", () => {
    const raw = JSON.stringify({
      summary: "요약",
      needs: [{ context: "맥락만 있음", priority: "높음" }, { need: "유효", priority: "낮음" }],
    });
    expect(parseAnalysis(raw).needs).toEqual([{ need: "유효", context: "", priority: "낮음" }]);
  });

  it("summary가 없으면 에러를 던진다", () => {
    expect(() => parseAnalysis(JSON.stringify({ needs: [] }))).toThrow();
  });

  it("JSON을 찾지 못하면 에러를 던진다", () => {
    expect(() => parseAnalysis("죄송합니다, 분석할 수 없습니다.")).toThrow();
  });
});

describe("buildMeetingMarkdown", () => {
  it("요약과 니즈를 마크다운으로 조립한다", () => {
    const md = buildMeetingMarkdown("요약입니다.", [
      { need: "대시보드", context: "수기 집계 중", priority: "높음" },
    ]);
    expect(md).toBe("## 요약\n\n요약입니다.\n\n## 니즈\n\n- **[높음]** 대시보드 — 수기 집계 중\n");
  });

  it("니즈가 없으면 안내 문구를 넣는다", () => {
    const md = buildMeetingMarkdown("요약", []);
    expect(md).toContain("추출된 니즈가 없습니다.");
  });
});
