// OpenRouter 비스트리밍 chat completion — 미팅 분석(요약+니즈 추출) 전용 단일 함수.
const OR_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function complete(system: string, user: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY env가 설정되어 있지 않습니다");
  const model = process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4.5";

  const res = await fetch(OR_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3400",
      "X-Title": "hz-os",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenRouter 요청 실패 (${res.status}): ${body.slice(0, 500)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("OpenRouter 응답에 content가 없습니다");
  }
  return content;
}
