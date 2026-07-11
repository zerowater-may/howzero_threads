import { z } from "zod";
import { getDb } from "@/lib/db";
import { streamChat, complete, hasKey, type ChatMessage } from "@/lib/openrouter";
import { SYSTEM_PROMPT, LEAD_EXTRACT_PROMPT, parseLeadJson, looksLikeContact } from "@/lib/prompt";
import { rateLimit, clientIp } from "@/lib/ratelimit";

const BodySchema = z.object({
  sessionId: z.uuid().nullish(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(4000),
      })
    )
    .min(1)
    .max(40)
    .refine((m) => m[m.length - 1].role === "user", "last message must be user"),
});

/** LLM 추출 리드 검증 — 폼 경로(zod)와 동급 제약 + 연락처가 실제 '고객 발화'에 존재하는지 확인 (프롬프트 인젝션/환각 방어) */
function validExtractedLead(
  lead: { contact: string | null; name: string | null; company: string | null; pain_summary: string | null },
  userText: string
): lead is { contact: string; name: string | null; company: string | null; pain_summary: string | null } {
  if (!lead.contact || lead.contact.length < 5 || lead.contact.length > 200) return false;
  if ((lead.name?.length ?? 0) > 100 || (lead.company?.length ?? 0) > 200) return false;
  if ((lead.pain_summary?.length ?? 0) > 2000) return false;
  // 숫자/영문만 남겨 비교 — LLM이 010-5555-1234 ↔ 01055551234 식으로 재포맷해도 매칭
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9@.가-힣]/g, "");
  return norm(userText).includes(norm(lead.contact));
}

async function maybeExtractLead(sessionId: string, userText: string, transcript: string) {
  if (!looksLikeContact(userText)) return;
  const db = await getDb();
  // 세션당 리드 1건 (중복 추출 방지)
  const existing = await db.query(`SELECT 1 FROM leads WHERE session_id = $1 LIMIT 1`, [sessionId]);
  if (existing.rows.length > 0) return;
  const raw = await complete([
    { role: "system", content: LEAD_EXTRACT_PROMPT },
    { role: "user", content: transcript },
  ]);
  const lead = parseLeadJson(raw);
  if (!lead || !validExtractedLead(lead, userText)) return;
  await db.query(
    `INSERT INTO leads (session_id, name, contact, company, pain_summary, source) VALUES ($1, $2, $3, $4, $5, 'chat')`,
    [sessionId, lead.name, lead.contact, lead.company, lead.pain_summary]
  );
}

export async function POST(req: Request) {
  if (!rateLimit(`chat:${clientIp(req)}`, 10)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }
  if (!hasKey()) {
    return Response.json({ error: "chat_unavailable" }, { status: 503 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_body", issues: parsed.error.issues }, { status: 400 });
  }
  const { messages } = parsed.data;

  // DB는 best-effort — 죽어도 대화는 계속 (스펙 §4)
  let sessionId: string | null = null;
  let db: Awaited<ReturnType<typeof getDb>> | null = null;
  try {
    db = await getDb();
    // 클라이언트가 준 sessionId는 존재 확인 후에만 신뢰 — 없는 UUID면 새 세션 발급 (FK 위반 방지)
    if (parsed.data.sessionId) {
      const found = await db.query(`SELECT 1 FROM chat_sessions WHERE id = $1`, [parsed.data.sessionId]);
      if (found.rows.length > 0) sessionId = parsed.data.sessionId;
    }
    if (!sessionId) {
      const r = await db.query(`INSERT INTO chat_sessions DEFAULT VALUES RETURNING id`);
      sessionId = String(r.rows[0].id);
    }
    await db.query(`INSERT INTO chat_messages (session_id, role, content) VALUES ($1, 'user', $2)`, [
      sessionId,
      messages[messages.length - 1].content,
    ]);
  } catch (e) {
    console.error("[chat] db unavailable, continuing without persistence:", e);
    db = null;
    sessionId = null;
  }

  const orMessages: ChatMessage[] = [{ role: "system", content: SYSTEM_PROMPT }, ...messages.slice(-20)];
  const orRes = await streamChat(orMessages);
  if (!orRes.ok || !orRes.body) {
    console.error("[chat] openrouter error:", orRes.status, await orRes.text().catch(() => ""));
    return Response.json({ error: "chat_unavailable" }, { status: 503 });
  }

  const reader = orRes.body.getReader();
  const sid = sessionId;
  const savedDb = db;
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";
      let full = "";
      let upstreamError = false;
      // 클라이언트 disconnect 시 enqueue가 throw — 흡수하고 저장 블록은 반드시 실행
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop()!;
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const event = JSON.parse(data);
              if (event?.error) {
                // 200 이후 스트림 내부 에러 이벤트 — 사용자에게 폴백 안내
                console.error("[chat] mid-stream error event:", event.error);
                upstreamError = true;
                break;
              }
              const delta: unknown = event?.choices?.[0]?.delta?.content;
              if (typeof delta === "string" && delta) {
                full += delta;
                controller.enqueue(encoder.encode(delta));
              }
            } catch {
              // partial JSON chunk — skip
            }
          }
          if (upstreamError) break;
        }
        if (upstreamError && full === "") {
          controller.enqueue(
            encoder.encode("지금은 상담 연결이 잠시 불안정합니다. 아래 무료 진단 폼으로 남겨주시면 1영업일 내 연락드리겠습니다.")
          );
        }
      } catch (e) {
        // 클라이언트가 끊음 — upstream도 중단해 토큰 낭비 방지
        reader.cancel().catch(() => {});
        console.error("[chat] client disconnected mid-stream:", e);
      } finally {
        try {
          controller.close();
        } catch {
          // 이미 취소된 스트림 — 무시
        }
      }
      // 스트림 종료/중단 여부와 무관하게: 받은 만큼 저장 + 리드 추출 (둘 다 best-effort)
      if (savedDb && sid && full) {
        try {
          await savedDb.query(`INSERT INTO chat_messages (session_id, role, content) VALUES ($1, 'assistant', $2)`, [sid, full]);
        } catch (e) {
          console.error("[chat] assistant save failed:", e);
        }
        try {
          const userText = messages
            .filter((m) => m.role === "user")
            .map((m) => m.content)
            .join("\n");
          const transcript = [...messages, { role: "assistant", content: full }]
            .map((m) => `${m.role === "user" ? "고객" : "상담사"}: ${m.content}`)
            .join("\n");
          await maybeExtractLead(sid, userText, transcript);
        } catch (e) {
          console.error("[chat] lead extract failed:", e);
        }
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      ...(sessionId ? { "x-session-id": sessionId } : {}),
    },
  });
}
