"use client";

import { useState } from "react";

// 상세 상담 폼 (2026-07-10, 윤자동 벤치마킹 — 전 항목 수집)
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

const inputCls =
  "rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--dim)]/60";
const selectCls = inputCls + " appearance-none";

function Req() {
  return <span className="text-[var(--signal)]">*</span>;
}

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [areas, setAreas] = useState<string[]>([]);
  const [areasError, setAreasError] = useState(false);

  function toggleArea(a: string) {
    setAreasError(false);
    setAreas((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (areas.length === 0) {
      setAreasError(true);
      return;
    }
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      company: String(data.get("company") || "").trim(),
      name: String(data.get("name") || "").trim(),
      contact: String(data.get("contact") || "").trim(),
      email: String(data.get("email") || "").trim(),
      role: String(data.get("role") || "").trim(),
      referral: String(data.get("referral") || "").trim(),
      industry: String(data.get("industry") || "").trim(),
      areas,
      budget: String(data.get("budget") || "").trim(),
      startTiming: String(data.get("startTiming") || "").trim(),
      painSummary: String(data.get("painSummary") || "").trim() || undefined,
      privacyAgreed: data.get("privacy") === "on",
    };
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("done");
      form.reset();
      setAreas([]);
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
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <label className="grid gap-1.5 text-sm font-medium">
        <span>
          회사/스토어명 <Req />
        </span>
        <input name="company" required autoComplete="organization" className={inputCls} placeholder="회사명 또는 스토어명" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        <span>
          담당자명 <Req />
        </span>
        <input name="name" required autoComplete="name" className={inputCls} placeholder="김대표" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        <span>
          연락처 <Req />
        </span>
        <input name="contact" required minLength={5} autoComplete="tel" className={inputCls} placeholder="010-1234-5678" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        <span>
          이메일 <Req />
        </span>
        <input name="email" type="email" required autoComplete="email" className={inputCls} placeholder="contact@company.com" />
      </label>

      <label className="grid gap-1.5 text-sm font-medium">
        <span>
          직책/역할 <Req />
        </span>
        <select name="role" required defaultValue="" className={selectCls}>
          <option value="" disabled>선택</option>
          {ROLES.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        <span>
          어떻게 알게 되셨나요? <Req />
        </span>
        <select name="referral" required defaultValue="" className={selectCls}>
          <option value="" disabled>선택</option>
          {REFERRALS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
        <span>
          업종 <Req />
        </span>
        <select name="industry" required defaultValue="" className={selectCls}>
          <option value="" disabled>업종을 선택해주세요</option>
          {INDUSTRIES.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </label>

      <fieldset className="grid gap-2 text-sm font-medium sm:col-span-2">
        <legend className="mb-1.5">
          자동화 희망 영역 <Req /> <span className="font-normal text-[var(--dim)]">(복수 선택 가능)</span>
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AREAS.map((a) => (
            <label
              key={a}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-normal transition-colors ${
                areas.includes(a)
                  ? "border-[var(--cobalt)] bg-[var(--cobalt)]/10 text-[var(--ink)]"
                  : "border-[var(--line)] bg-[var(--panel)] text-[var(--dim)] hover:text-[var(--ink)]"
              }`}
            >
              <input
                type="checkbox"
                checked={areas.includes(a)}
                onChange={() => toggleArea(a)}
                className="accent-[var(--cobalt)]"
              />
              {a}
            </label>
          ))}
        </div>
        {areasError && <p className="text-xs text-[var(--signal)]">자동화 희망 영역을 1개 이상 선택해주세요.</p>}
      </fieldset>

      <label className="grid gap-1.5 text-sm font-medium">
        <span>
          예상 예산 <Req />
        </span>
        <select name="budget" required defaultValue="" className={selectCls}>
          <option value="" disabled>선택</option>
          {BUDGETS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        <span>
          희망 시작 시기 <Req />
        </span>
        <select name="startTiming" required defaultValue="" className={selectCls}>
          <option value="" disabled>선택</option>
          {TIMINGS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
        <span>
          추가 문의사항 <span className="font-normal text-[var(--dim)]">(선택)</span>
        </span>
        <textarea
          name="painSummary"
          rows={3}
          className={`resize-none ${inputCls}`}
          placeholder="예: CS 응대에 하루 4시간, 주문 정산에 매주 반나절씩 씁니다"
        />
      </label>

      <label className="flex items-start gap-2 text-xs leading-relaxed text-[var(--dim)] sm:col-span-2">
        <input type="checkbox" name="privacy" required className="mt-0.5 accent-[var(--cobalt)]" />
        <span>
          개인정보 수집·이용에 동의합니다. <Req />
          <br />
          수집 항목: 위 기재 정보 · 목적: 상담 및 진단 연락 · 보유 기간: 목적 달성 후 파기
        </span>
      </label>

      <div className="sm:col-span-2">
        <button type="submit" disabled={status === "sending"} className="btn-primary w-full justify-center disabled:opacity-60">
          {status === "sending" ? "접수 중…" : "무료 진단 신청"}
        </button>
        {status === "error" && (
          <p className="mt-2 text-sm text-[var(--signal)]">접수에 실패했습니다. 다시 시도해주세요.</p>
        )}
      </div>
    </form>
  );
}
