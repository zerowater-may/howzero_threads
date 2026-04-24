import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "하우제로 위클리 — 비개발자 AI 자동화 뉴스레터",
  description:
    "매주 화요일, 비개발자가 AI로 돈 버는 실전 노하우 1가지. 구독자 전용 자동화 템플릿 무료 제공.",
};

const benefits = [
  {
    title: "주간 인사이트",
    desc: "비개발자가 바로 적용할 수 있는 AI 자동화 팁. 실제 사례와 Before/After 포함.",
  },
  {
    title: "AI 도구 추천",
    desc: "매주 1개, 비개발자 친화 도구를 소개합니다. 이런 문제 있으면 → 이 도구 쓰세요.",
  },
  {
    title: "전용 템플릿",
    desc: "구독자에게만 제공하는 n8n/Make 자동화 템플릿. 복사해서 바로 사용 가능.",
  },
  {
    title: "주간 액션 아이템",
    desc: "이번 주에 딱 1가지 실행할 것. 읽고 끝이 아니라, 직접 해보는 뉴스레터.",
  },
];

const sampleTopics = [
  "CS 자동화로 인건비 0원 만든 실제 과정",
  "개발자 없이 고객 문의 자동 분류하는 법",
  "Make.com vs Zapier vs n8n: 비개발자 기준 비교",
  "실제 클라이언트 사례: 월 200시간 절감",
  "AI 도입 실패하는 회사의 공통점 5가지",
  "비개발자 AI 자동화 로드맵 (초급→중급→고급)",
];

export default function NewsletterPage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-20 text-center md:pt-28">
        <p className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
          하우제로 위클리
        </p>
        <h1 className="mt-2 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
          비개발자가 AI로 돈 버는
          <br />
          실전 노하우, 매주 1개씩
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          매주 화요일 오전 8시, 5분 읽기.
          <br />
          구독자 전용 자동화 템플릿 무료 제공.
        </p>

        {/* Subscribe Form */}
        <div className="mx-auto mt-10 max-w-md">
          <form
            action="#"
            method="POST"
            className="flex gap-3"
          >
            <input
              type="email"
              name="email"
              placeholder="이메일 주소"
              required
              className="flex-1 rounded-lg border border-border/60 bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              무료 구독
            </button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            스팸 없습니다. 언제든 구독 해지 가능. 현재 구독자: 성장 중
          </p>
        </div>
      </section>

      {/* What You Get */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="mb-10 text-center text-2xl font-bold">
            매주 이메일에 담기는 것
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {benefits.map(({ title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-border/60 bg-card p-6"
              >
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Topics */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="mb-8 text-center text-2xl font-bold">
            이런 주제를 다룹니다
          </h2>
          <div className="space-y-3">
            {sampleTopics.map((topic, i) => (
              <div
                key={topic}
                className="flex items-center gap-4 rounded-lg border border-border/60 bg-card px-5 py-3.5"
              >
                <span className="shrink-0 text-sm font-bold text-muted-foreground/50">
                  #{String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium">{topic}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Sender */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold">보내는 사람</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground">
            2024년 GPT-3로 SaaS를 만들어 1년 만에 연매출 10억을 달성한
            하우제로(HowZero). 비개발자 관점에서, 직접 해본 것만 이야기합니다.
            과장 없이, 데이터와 사례로.
          </p>
        </div>
      </section>

      {/* Bonus: Mini Course */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold">구독하면 즉시 시작</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            구독 즉시 3일 무료 미니코스 &ldquo;비개발자의 AI 자동화
            첫걸음&rdquo;이 발송됩니다. 3일 만에 첫 자동화를 직접
            만들어봅니다.
          </p>
          <div className="mx-auto mt-8 grid max-w-lg gap-3 text-left">
            {[
              { day: "Day 1", title: "AI 자동화, 코딩 없이 가능한 이유" },
              { day: "Day 2", title: "자동화 우선순위 정하는 법 (FIT 프레임워크)" },
              { day: "Day 3", title: "30분 만에 첫 자동화 만드는 법 (실습)" },
            ].map(({ day, title }) => (
              <div
                key={day}
                className="flex items-center gap-4 rounded-lg border border-border/60 bg-card px-5 py-3"
              >
                <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs font-bold">
                  {day}
                </span>
                <span className="text-sm">{title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/40 bg-foreground text-background">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            매주 화요일, 5분이면 됩니다
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-background/70">
            AI 자동화 실전 노하우를 이메일로 받아보세요.
          </p>
          <form
            action="#"
            method="POST"
            className="mx-auto mt-8 flex max-w-md gap-3"
          >
            <input
              type="email"
              name="email"
              placeholder="이메일 주소"
              required
              className="flex-1 rounded-lg border border-background/20 bg-background/10 px-4 py-3 text-sm text-background placeholder:text-background/50 focus:border-background/40 focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-background px-6 py-3 text-sm font-semibold text-foreground transition-opacity hover:opacity-90"
            >
              무료 구독
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
