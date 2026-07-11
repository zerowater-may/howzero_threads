"use client";

import { useRef, useState } from "react";
import { Orb, FocusBorder } from "@/components/hero/ShaderFx";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "무엇을 자동화하고 싶으세요? CS 응대, 정산, 보고서, 콘텐츠. 요즘 대표님 시간을 제일 많이 잡아먹는 반복업무를 편하게 말씀해주세요.",
};

export default function HeroChat() {
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [failed, setFailed] = useState(false);
  const [focused, setFocused] = useState(false);
  const sessionRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    });
  }

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    setFailed(false);
    const history = [...messages, { role: "user" as const, content: text }];
    setMessages(history);
    setStreaming(true);
    scrollToBottom();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionRef.current, messages: history.slice(-20) }),
      });
      if (!res.ok || !res.body) throw new Error(`chat ${res.status}`);
      const sid = res.headers.get("x-session-id");
      if (sid) sessionRef.current = sid;

      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = {
            role: "assistant",
            content: next[next.length - 1].content + chunk,
          };
          return next;
        });
        scrollToBottom();
      }
      // 스트림이 빈 채로 끝났으면(중간 에러 등) 빈 말풍선 제거 + 폴백 안내
      setMessages((m) => {
        const last = m[m.length - 1];
        if (last?.role === "assistant" && last.content === "") {
          setFailed(true);
          return m.slice(0, -1);
        }
        return m;
      });
    } catch {
      setFailed(true);
      // 실패한 요청의 user 메시지를 히스토리에 남기지 않는다 — 이후 요청까지 연쇄 실패 방지. 입력은 복원.
      setMessages(messages);
      setInput(text);
    } finally {
      setStreaming(false);
      scrollToBottom();
    }
  }

  return (
    <div className="relative">
      {/* 오브 + 안내 라인 — 포커스 시 페이드아웃 */}
      <div
        className="flex items-center gap-2 transition-all duration-500"
        style={{ opacity: focused ? 0 : 1, transform: focused ? "translateY(8px)" : "none" }}
      >
        <Orb />
        <p className="text-sm font-light text-white/40">궁금한 업무부터 그대로 물어보세요</p>
      </div>

      <div className="relative">
        <FocusBorder active={focused} />
        <div
          id="hero-chat"
          className="relative z-10 flex h-[380px] flex-col overflow-hidden rounded-2xl border bg-[var(--chat)] transition-colors duration-500 sm:h-[480px]"
          style={{ borderColor: focused ? "var(--warm)" : "#3d3d3d" }}
        >
          {/* 진단 콘솔 헤더 — mono+자간은 라틴에만, 한글 라벨은 본문체 */}
          <div className="flex items-center justify-between border-b border-[#242424] px-4 py-3">
            <span className="text-xs text-[var(--dim)]">
              <span className="font-[family-name:var(--font-mono)] tracking-widest">howzero</span>
              <span className="ml-2">무료 진단 대화</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[var(--dim)]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              상담 가능
            </span>
          </div>

          {/* 메시지 */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-lg rounded-br-sm bg-[var(--cobalt)] px-3.5 py-2.5 text-sm leading-relaxed text-white"
                      : "max-w-[85%] rounded-lg rounded-bl-sm bg-[#1a1a1c] px-3.5 py-2.5 text-sm leading-relaxed text-[var(--ink)]"
                  }
                >
                  {m.content}
                  {streaming && i === messages.length - 1 && m.role === "assistant" && m.content === "" && (
                    <span className="flex gap-1 py-1" aria-label="답변 작성 중">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </span>
                  )}
                </div>
              </div>
            ))}
            {failed && (
              <p className="rounded-lg border border-[#242424] bg-[#1a1a1c] px-3.5 py-2.5 text-sm text-[var(--dim)]">
                지금은 상담 연결이 어렵습니다.{" "}
                <a href="#contact" className="font-semibold text-[var(--cobalt)] underline">
                  아래 폼으로 남겨주시면
                </a>{" "}
                1영업일 내 연락드립니다.
              </p>
            )}
          </div>

          {/* 추천 질문 칩 — 첫 화면 빈 공간을 기능으로 채움. 대화 시작하면 사라짐 */}
          {messages.length === 1 && !streaming && !failed && (
            <div className="flex flex-wrap gap-2 px-4 pb-3">
              {[
                "CS 응대가 너무 오래 걸려요",
                "정산 정리에 매주 반나절 써요",
                "보고서 만드는 데 하루 3시간 씁니다",
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setInput(q)}
                  className="rounded-full border border-[#3d3d3d] px-3 py-1.5 text-xs text-[var(--dim)] transition-colors hover:border-[var(--warm)] hover:text-[var(--ink)]"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* 입력 */}
          <form
            className="flex gap-2 border-t border-[#242424] p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={2000}
              placeholder="예: 보고서 만드는 데 하루 3시간 씁니다"
              aria-label="자동화 고민 입력"
              className="min-w-0 flex-1 rounded-lg border border-[#3d3d3d] bg-transparent px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--dim)]/60"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="shrink-0 rounded-lg bg-[var(--cobalt)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            >
              보내기
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
