export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const OR_URL = "https://openrouter.ai/api/v1/chat/completions";

function headers() {
  return {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost:3300",
    "X-Title": "howzero-ax",
  };
}

export function model() {
  return process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4.5";
}

export function hasKey() {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

/** SSE 스트리밍 응답 (raw fetch Response) */
export async function streamChat(messages: ChatMessage[]): Promise<Response> {
  return fetch(OR_URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ model: model(), messages, stream: true, max_tokens: 1024 }),
  });
}

/** 논스트리밍 완성 — 리드 추출용 */
export async function complete(messages: ChatMessage[]): Promise<string> {
  const res = await fetch(OR_URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ model: model(), messages, max_tokens: 512 }),
  });
  if (!res.ok) throw new Error(`openrouter ${res.status}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "";
}
