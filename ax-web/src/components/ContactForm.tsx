"use client";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim() || undefined,
      contact: String(data.get("contact") || "").trim(),
      company: String(data.get("company") || "").trim() || undefined,
      painSummary: String(data.get("painSummary") || "").trim() || undefined,
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
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1.5 text-sm font-medium">
        이름
        <input
          name="name"
          autoComplete="name"
          className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3.5 py-2.5 text-sm text-[var(--ink)]"
          placeholder="김대표"
        />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        <span>
          연락처 <span className="text-[var(--signal)]">*</span>
        </span>
        <input
          name="contact"
          required
          minLength={5}
          autoComplete="email"
          className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3.5 py-2.5 text-sm text-[var(--ink)]"
          placeholder="이메일 또는 전화번호"
        />
      </label>
      <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
        회사/스토어
        <input
          name="company"
          autoComplete="organization"
          className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3.5 py-2.5 text-sm text-[var(--ink)]"
          placeholder="회사명 또는 스토어명"
        />
      </label>
      <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
        자동화하고 싶은 업무
        <textarea
          name="painSummary"
          rows={3}
          className="resize-none rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3.5 py-2.5 text-sm text-[var(--ink)]"
          placeholder="예: CS 응대에 하루 4시간, 주문 정산에 매주 반나절씩 씁니다"
        />
      </label>
      <div className="sm:col-span-2">
        <button type="submit" disabled={status === "sending"} className="btn-primary w-full justify-center disabled:opacity-50">
          {status === "sending" ? "접수 중…" : "무료 진단 신청"}
        </button>
        {status === "error" && (
          <p className="mt-2 text-sm text-[var(--signal)]">접수에 실패했습니다. 다시 시도해주세요.</p>
        )}
      </div>
    </form>
  );
}
