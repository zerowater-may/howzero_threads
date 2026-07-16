// 미팅 전사 → AI 분석 결과 파싱/조립 순수 함수. actions/meetings.ts("use server")는
// async 함수만 export할 수 있으므로 파서는 여기 분리해 단위 테스트 가능하게 둔다.

export type Priority = "높음" | "중간" | "낮음";

export interface NeedItem {
  need: string;
  context: string;
  priority: Priority;
}

const PRIORITIES: Priority[] = ["높음", "중간", "낮음"];

export const ANALYSIS_SYSTEM_PROMPT = `당신은 AX(AI 전환) 컨설팅 미팅 전사를 분석하는 어시스턴트입니다.
반드시 아래 형식의 JSON 객체 하나만 출력하세요. 코드 블록, 설명, 다른 텍스트를 절대 덧붙이지 마세요.

{
  "summary": "한국어 존댓말로 작성한 회의 핵심 요약. 최대 8줄(문장) 이내.",
  "needs": [
    { "need": "고객이 표현한 니즈를 한 줄로 요약", "context": "전사에서 근거가 된 맥락 한두 문장", "priority": "높음 | 중간 | 낮음 중 하나" }
  ]
}`;

function stripCodeFence(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

export function parseAnalysis(raw: string): { summary: string; needs: NeedItem[] } {
  const cleaned = stripCodeFence(raw);
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("AI 응답에서 JSON을 찾지 못했습니다");

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw new Error("AI 응답 JSON 파싱에 실패했습니다");
  }

  const obj = (parsed ?? {}) as { summary?: unknown; needs?: unknown };
  const summary = typeof obj.summary === "string" ? obj.summary.trim() : "";
  if (!summary) throw new Error("AI 응답에 summary가 없습니다");

  const rawNeeds = Array.isArray(obj.needs) ? obj.needs : [];
  const needs: NeedItem[] = rawNeeds
    .map((n): NeedItem | null => {
      if (!n || typeof n !== "object") return null;
      const need = String((n as { need?: unknown }).need ?? "").trim();
      if (!need) return null;
      const context = String((n as { context?: unknown }).context ?? "").trim();
      const priorityRaw = String((n as { priority?: unknown }).priority ?? "");
      const priority = (PRIORITIES.find((p) => priorityRaw.includes(p)) ?? "중간") as Priority;
      return { need, context, priority };
    })
    .filter((n): n is NeedItem => n !== null);

  return { summary, needs };
}

export function buildMeetingMarkdown(summary: string, needs: NeedItem[]): string {
  const lines = ["## 요약", "", summary, "", "## 니즈"];
  if (needs.length === 0) {
    lines.push("", "추출된 니즈가 없습니다.");
  } else {
    lines.push("");
    for (const n of needs) {
      lines.push(`- **[${n.priority}]** ${n.need}${n.context ? ` — ${n.context}` : ""}`);
    }
  }
  return lines.join("\n") + "\n";
}
