import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "셀프페이스 코스 'AI 자동화 첫걸음' — 하우제로(HowZero)",
  description:
    "₩99,000, 비개발자를 위한 AI 자동화 입문 코스. 6모듈 4~5시간, 실전 템플릿 3개 포함. 수강 기간 무제한.",
};

const modules = [
  {
    num: 1,
    title: "AI 자동화, 왜 지금인가",
    desc: "AI 자동화의 비즈니스 가치, 해외 사례, 하우제로가 10억을 만든 구조.",
    duration: "30분",
  },
  {
    num: 2,
    title: "내 업무에서 자동화 포인트 찾기",
    desc: "프로세스 맵핑 실습. 반복, 수동, 판단 업무를 분리하는 프레임워크.",
    duration: "45분",
  },
  {
    num: 3,
    title: "노코드 자동화 도구 마스터",
    desc: "n8n/Make/Zapier 핵심 기능. 트리거, 액션, 필터를 직접 만들어봅니다.",
    duration: "60분",
  },
  {
    num: 4,
    title: "AI를 워크플로우에 연결하기",
    desc: "ChatGPT/Claude API를 노코드로 연결. 텍스트 분석, 분류, 요약 자동화.",
    duration: "60분",
  },
  {
    num: 5,
    title: "실전 프로젝트 3개 구축",
    desc: "CS 자동 분류, 이메일 자동 응답, 리포트 자동 생성. 템플릿 제공.",
    duration: "90분",
  },
  {
    num: 6,
    title: "운영 & 확장",
    desc: "모니터링, 에러 처리, ROI 측정. 다음 단계 자동화 로드맵 설계.",
    duration: "30분",
  },
];

const forWho = [
  "코딩 경험 없는 창업가/사업주",
  "반복 업무에 시간을 빼앗기는 팀 리더",
  "AI 자동화를 시작하고 싶지만 어디서부터 할지 모르는 분",
  "프리랜서/1인 기업으로 생산성을 극대화하고 싶은 분",
];

const notForWho = [
  "이미 n8n/Make를 능숙하게 다루는 분 → 구축 서비스를 추천합니다",
  "엔터프라이즈급 복잡한 시스템이 필요한 분 → 컨설팅을 추천합니다",
];

export default function CoursePage() {
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
            E2 · 셀프페이스
          </span>
          <span className="rounded-full border border-border/60 px-3 py-0.5 text-xs text-muted-foreground">
            교육 · 에버그린
          </span>
        </div>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
          AI 자동화 첫걸음
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          코딩 없이, 4~5시간 만에 AI 자동화의 기본기를 익히세요.
          <br />
          실전 프로젝트 3개를 직접 만들어봅니다.
        </p>
        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-4xl font-extrabold">₩99,000</span>
          <span className="text-sm text-muted-foreground">/ 평생 소장</span>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/audit"
            className="rounded-lg bg-foreground px-8 py-3.5 text-base font-semibold text-background transition-opacity hover:opacity-90"
          >
            코스 구매 →
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-border/60 px-8 py-3.5 text-base font-semibold transition-colors hover:bg-muted"
          >
            전체 가격표 보기
          </Link>
        </div>
      </section>

      {/* Curriculum */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="mb-10 text-2xl font-bold">커리큘럼</h2>
          <div className="space-y-4">
            {modules.map(({ num, title, desc, duration }) => (
              <div
                key={num}
                className="flex items-start gap-5 rounded-xl border border-border/60 bg-card p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold">
                  {num}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {duration}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            총 6모듈, 약 4시간 15분. 각 모듈은 독립적이라 순서대로 안 봐도
            됩니다.
          </p>
        </div>
      </section>

      {/* For Who */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold">이런 분에게 추천</h2>
              <ul className="mt-5 space-y-3">
                {forWho.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="mt-0.5 text-foreground/60">&#10003;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold">이런 분은 비추</h2>
              <ul className="mt-5 space-y-3">
                {notForWho.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-0.5">&#10007;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Included */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="mb-10 text-2xl font-bold">구매 시 포함</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "6모듈 강의 영상", desc: "수강 기간 무제한. 언제든 복습 가능." },
              { title: "실전 템플릿 3개", desc: "n8n/Make 즉시 적용 가능. 소스 공개." },
              { title: "프로세스 맵핑 워크시트", desc: "내 업무에 바로 적용하는 실습 자료." },
              { title: "커뮤니티 1개월 무료", desc: "수료 후 Q&A 커뮤니티 1개월 무료 이용." },
              { title: "업데이트 평생 무료", desc: "콘텐츠 업데이트 시 추가 비용 없이 시청." },
              { title: "7일 무조건 환불", desc: "구매 후 7일 이내 100% 환불 보장." },
            ].map(({ title, desc }) => (
              <div key={title} className="rounded-xl border border-border/60 bg-card p-5">
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            ₩99,000으로 AI 자동화를 시작하세요
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-background/70">
            7일 무조건 환불 보장. 마음에 안 들면 이유 없이 환불됩니다.
          </p>
          <Link
            href="/audit"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-background px-8 py-3.5 text-base font-semibold text-foreground transition-opacity hover:opacity-90"
          >
            코스 구매 →
          </Link>
        </div>
      </section>
    </>
  );
}
