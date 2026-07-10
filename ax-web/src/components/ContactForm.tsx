"use client";

import { useEffect, useRef, useState } from "react";

// 토스식 스텝 폼 (2026-07-10) — 한 화면에 질문 하나, 선택지는 탭하면 자동 진행.
// 수집 항목은 상세 폼과 동일(윤자동 벤치마킹), API/DB 무변경.
const ROLES = ["대표/임원", "팀장·매니저", "실무 담당자", "기타"];
const REFERRALS = ["인스타그램/쓰레드", "유튜브", "검색", "지인 소개", "기타"];
const INDUSTRIES = ["이커머스/셀러", "세무·회계", "교육/컨설팅", "제조/유통", "서비스업", "기타"];
const AREAS = [
  "CS/고객응대",
  "정산/회계",
  "데이터 수집/정리",
  "보고서 자동 생성",
  "콘텐츠 제작",
  "메시지 발송 (카카오톡·이메일)",
  "주문/재고",
  "ERP/CRM 연동",
  "기타",
];
const BUDGETS = ["300만원 미만", "300~700만원", "700~2,000만원", "2,000만원 이상", "미정"];
const TIMINGS = ["최대한 빨리", "1개월 내", "3개월 내", "시기 미정"];

type Step =
  | { kind: "choice"; key: string; q: string; options: string[] }
  | { kind: "multi"; key: "areas"; q: string; options: string[] }
  | { kind: "text"; key: string; q: string; placeholder: string; type?: string; autoComplete?: string; minLength?: number }
  | { kind: "textarea"; key: string; q: string; placeholder: string }
  | { kind: "consent"; q: string };

// 몰입 순서: 부담 없는 선택부터 → 연락처는 마지막 (완주율)
const STEPS: Step[] = [
  { kind: "choice", key: "industry", q: "어떤 업종이세요?", options: INDUSTRIES },
  { kind: "multi", key: "areas", q: "어떤 업무를 자동화하고 싶으세요?", options: AREAS },
  { kind: "choice", key: "budget", q: "예상하시는 예산 구간이 있나요?", options: BUDGETS },
  { kind: "choice", key: "startTiming", q: "언제쯤 시작하고 싶으세요?", options: TIMINGS },
  { kind: "text", key: "company", q: "회사나 스토어 이름을 알려주세요", placeholder: "회사명 또는 스토어명", autoComplete: "organization" },
  { kind: "text", key: "name", q: "어떻게 불러드리면 될까요?", placeholder: "이름 또는 직함", autoComplete: "name" },
  { kind: "choice", key: "role", q: "회사에서 어떤 역할이세요?", options: ROLES },
  { kind: "text", key: "contact", q: "연락받으실 번호를 알려주세요", placeholder: "010-1234-5678", type: "tel", autoComplete: "tel", minLength: 5 },
  { kind: "text", key: "email", q: "이메일도 하나 남겨주세요", placeholder: "contact@company.com", type: "email", autoComplete: "email" },
  { kind: "choice", key: "referral", q: "howzero는 어떻게 알게 되셨어요?", options: REFERRALS },
  { kind: "textarea", key: "painSummary", q: "더 알려주실 게 있다면요? (선택)", placeholder: "예: CS 응대에 하루 4시간, 주문 정산에 매주 반나절씩 씁니다" },
  { kind: "consent", q: "마지막이에요. 확인 부탁드립니다" },
];

export default function ContactForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [areas, setAreas] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [agreed, setAgreed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const cur = STEPS[step];
  const total = STEPS.length;

  // 텍스트 스텝 진입 시 자동 포커스 + 이전 값 복원
  useEffect(() => {
    if (cur.kind === "text" && inputRef.current) {
      inputRef.current.value = answers[cur.key] ?? "";
      inputRef.current.focus();
    }
    if (cur.kind === "textarea" && taRef.current) {
      taRef.current.value = answers[cur.key] ?? "";
      taRef.current.focus();
    }
    // step 전환 시에만 실행 — answers 복원은 진입 시점 값이면 충분
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function next() {
    setStep((s) => Math.min(s + 1, total - 1));
  }

  function pick(key: string, value: string) {
    setAnswers((a) => ({ ...a, [key]: value }));
    // 탭 피드백이 보이고 나서 넘어가는 토스식 템포
    setTimeout(next, 160);
  }

  function toggleArea(a: string) {
    setAreas((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  async function submit() {
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: answers.company,
          name: answers.name,
          contact: answers.contact,
          email: answers.email,
          role: answers.role,
          referral: answers.referral,
          industry: answers.industry,
          areas,
          budget: answers.budget,
          startTiming: answers.startTiming,
          painSummary: answers.painSummary || undefined,
          privacyAgreed: true,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-6 text-center text-base font-medium">
        접수됐습니다. <span className="num">1영업일</span> 내에 연락드리겠습니다.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 sm:p-8">
      {/* 진행 바 */}
      <div className="flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--line)]">
          <div
            className="h-full rounded-full bg-[var(--cobalt)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
        <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--dim)]">
          {step + 1}/{total}
        </span>
      </div>

      {/* 스텝 컨텐츠 — key 리마운트로 등장 모션 */}
      <div key={step} className="rise mt-8 min-h-[300px]">
        <h3 className="display text-xl sm:text-2xl">{cur.q}</h3>

        {cur.kind === "choice" && (
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {cur.options.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => pick(cur.key, o)}
                className={`rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-colors ${
                  answers[cur.key] === o
                    ? "border-[var(--cobalt)] bg-[var(--cobalt)]/10 text-[var(--ink)]"
                    : "border-[var(--line)] bg-[var(--panel)] text-[var(--dim)] hover:border-[var(--cobalt)]/40 hover:text-[var(--ink)]"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        )}

        {cur.kind === "multi" && (
          <>
            <p className="mt-1 text-sm text-[var(--dim)]">복수 선택 가능</p>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {cur.options.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => toggleArea(o)}
                  className={`rounded-xl border px-3 py-3 text-left text-sm font-medium transition-colors ${
                    areas.includes(o)
                      ? "border-[var(--cobalt)] bg-[var(--cobalt)]/10 text-[var(--ink)]"
                      : "border-[var(--line)] bg-[var(--panel)] text-[var(--dim)] hover:border-[var(--cobalt)]/40 hover:text-[var(--ink)]"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              disabled={areas.length === 0}
              className="btn-primary mt-6 w-full justify-center disabled:opacity-40"
            >
              {areas.length ? `${areas.length}개 선택 — 다음` : "1개 이상 선택해주세요"}
            </button>
          </>
        )}

        {cur.kind === "text" && (
          <form
            className="mt-6"
            onSubmit={(e) => {
              e.preventDefault();
              const v = inputRef.current?.value.trim() ?? "";
              if (!inputRef.current?.checkValidity() || !v) {
                inputRef.current?.reportValidity();
                return;
              }
              setAnswers((a) => ({ ...a, [cur.key]: v }));
              next();
            }}
          >
            <input
              ref={inputRef}
              type={cur.type ?? "text"}
              required
              minLength={cur.minLength}
              autoComplete={cur.autoComplete}
              placeholder={cur.placeholder}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3.5 text-base text-[var(--ink)] placeholder:text-[var(--dim)]/50"
            />
            <button type="submit" className="btn-primary mt-6 w-full justify-center">
              다음
            </button>
          </form>
        )}

        {cur.kind === "textarea" && (
          <form
            className="mt-6"
            onSubmit={(e) => {
              e.preventDefault();
              setAnswers((a) => ({ ...a, [cur.key]: taRef.current?.value.trim() ?? "" }));
              next();
            }}
          >
            <textarea
              ref={taRef}
              rows={4}
              placeholder={cur.placeholder}
              className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3.5 text-base text-[var(--ink)] placeholder:text-[var(--dim)]/50"
            />
            <button type="submit" className="btn-primary mt-6 w-full justify-center">
              다음
            </button>
          </form>
        )}

        {cur.kind === "consent" && (
          <div className="mt-6">
            {/* 답변 요약 — 제출 전 확인 */}
            <dl className="grid gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm sm:grid-cols-2">
              {[
                ["회사", answers.company],
                ["담당자", `${answers.name ?? ""} · ${answers.role ?? ""}`],
                ["연락처", answers.contact],
                ["이메일", answers.email],
                ["업종", answers.industry],
                ["희망 영역", areas.join(", ")],
                ["예산", answers.budget],
                ["시작 시기", answers.startTiming],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="shrink-0 text-[var(--dim)]">{k}</dt>
                  <dd className="truncate">{v}</dd>
                </div>
              ))}
            </dl>
            <label className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-[var(--dim)]">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-[var(--cobalt)]"
              />
              <span>
                개인정보 수집·이용에 동의합니다.
                <br />
                수집 항목: 위 기재 정보 · 목적: 상담 및 진단 연락 · 보유 기간: 목적 달성 후 파기
              </span>
            </label>
            <button
              type="button"
              onClick={submit}
              disabled={!agreed || status === "sending"}
              className="btn-primary mt-6 w-full justify-center disabled:opacity-40"
            >
              {status === "sending" ? "접수 중…" : "무료 진단 신청하기"}
            </button>
            {status === "error" && (
              <p className="mt-2 text-sm text-[var(--signal)]">접수에 실패했습니다. 다시 시도해주세요.</p>
            )}
          </div>
        )}
      </div>

      {/* 이전 버튼 */}
      {step > 0 && (
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          className="mt-4 text-sm text-[var(--dim)] transition-colors hover:text-[var(--ink)]"
        >
          ← 이전으로
        </button>
      )}
    </div>
  );
}
