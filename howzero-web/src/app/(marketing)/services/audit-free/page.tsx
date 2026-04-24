import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "무료 AI 오딧 (30분) — 하우제로(HowZero)",
  description:
    "비즈니스 비효율을 30분 만에 진단합니다. 세일즈 없이, 자동화 가능 포인트와 예상 ROI만 알려드립니다.",
};

const process = [
  {
    step: "01",
    title: "사전 질문지 작성",
    desc: "5분 분량. 현재 팀 규모, 주요 반복 업무, 사용 중인 도구를 파악합니다.",
    time: "신청 직후",
  },
  {
    step: "02",
    title: "30분 화상 미팅",
    desc: "Google Meet 또는 Zoom. 대표님의 실제 업무 프로세스를 함께 살펴봅니다.",
    time: "예약일",
  },
  {
    step: "03",
    title: "진단 리포트 전달",
    desc: "자동화 가능 포인트 3개 이상, 예상 절감 시간/비용, 추천 우선순위를 정리한 1장 리포트.",
    time: "미팅 후 24시간",
  },
];

const results = [
  { metric: "평균 진단 포인트", value: "5.2개", sub: "기업당 발견된 자동화 기회" },
  { metric: "예상 월 절감", value: "₩380만", sub: "인건비 + 시간 기준 평균" },
  { metric: "전환율", value: "34%", sub: "무료 오딧 → 유료 프로젝트" },
];

export default function AuditFreePage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 md:pt-28">
        <Link
          href="/services"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← 서비스 목록
        </Link>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-muted px-3 py-0.5 text-xs font-semibold">
            S1 · 리드마그넷
          </span>
          <span className="rounded-full border border-border/60 px-3 py-0.5 text-xs text-muted-foreground">
            1:1 서비스
          </span>
        </div>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
          무료 AI 오딧 (30분)
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          비즈니스 비효율을 30분 만에 진단합니다.
          <br />
          세일즈 없이, 순수한 가치만 제공합니다.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/audit"
            className="rounded-lg bg-foreground px-8 py-3.5 text-base font-semibold text-background transition-opacity hover:opacity-90"
          >
            무료 오딧 신청 →
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-border/60 px-8 py-3.5 text-base font-semibold transition-colors hover:bg-muted"
          >
            전체 가격표 보기
          </Link>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold">왜 무료인가?</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            &ldquo;가치를 먼저 보여주면 신뢰가 따라온다&rdquo;가 하우제로의
            원칙입니다. 30분 안에 충분한 인사이트를 드려서, 나머지를 직접
            실행하셔도 됩니다. 그래도 도움이 필요하시면, 그때 이야기하시면
            됩니다.
          </p>
        </div>
      </section>

      {/* Process */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="mb-10 text-2xl font-bold">진행 프로세스</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {process.map(({ step, title, desc, time }) => (
              <div key={step} className="rounded-xl border border-border/60 bg-card p-6">
                <p className="text-3xl font-extrabold text-muted-foreground/40">
                  {step}
                </p>
                <h3 className="mt-3 text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
                <p className="mt-3 text-xs font-medium text-muted-foreground">
                  {time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="mb-10 text-center text-2xl font-bold">
            지금까지의 결과
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {results.map(({ metric, value, sub }) => (
              <div key={metric} className="text-center">
                <p className="text-4xl font-extrabold">{value}</p>
                <p className="mt-1 text-sm font-semibold">{metric}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            30분이면 충분합니다
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-background/70">
            지금 신청하시면 48시간 이내에 미팅 일정을 잡아드립니다.
          </p>
          <Link
            href="/audit"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-background px-8 py-3.5 text-base font-semibold text-foreground transition-opacity hover:opacity-90"
          >
            무료 AI 오딧 신청 →
          </Link>
        </div>
      </section>
    </>
  );
}
