import Link from "next/link";

const stats = [
  { value: "10억+", label: "연매출 달성" },
  { value: "1년", label: "SaaS 런칭 → 성과" },
  { value: "80%", label: "비효율은 기본 시스템에" },
  { value: "30분", label: "무료 AI 오딧" },
];

const problems = [
  {
    title: "반복 업무에 시간을 쏟고 있다",
    description:
      "CS 응대, 데이터 입력, 보고서 작성 — 매일 같은 일을 반복하며 정작 중요한 의사결정에 집중하지 못합니다.",
  },
  {
    title: "AI 도입, 어디서 시작할지 모르겠다",
    description:
      "ChatGPT는 써봤지만 비즈니스에 실질적으로 적용하는 방법은 다릅니다. 기술과 비즈니스 사이의 격차가 문제입니다.",
  },
  {
    title: "비용은 늘고, 효율은 그대로다",
    description:
      "인건비와 운영비는 계속 오르는데, 프로세스는 5년 전 그대로. AI 없이는 경쟁에서 뒤처집니다.",
  },
];

const process = [
  {
    step: "01",
    title: "무료 AI 오딧 신청",
    description: "30분 화상 미팅으로 비즈니스 프로세스를 진단합니다.",
  },
  {
    step: "02",
    title: "비효율 지점 발견",
    description:
      "낭비되는 시간과 비용을 데이터로 보여주고, 자동화 우선순위를 제안합니다.",
  },
  {
    step: "03",
    title: "맞춤 로드맵 제공",
    description:
      "당장 실행 가능한 Quick Win부터, 장기 전환 계획까지 구체적인 로드맵을 그려드립니다.",
  },
  {
    step: "04",
    title: "구축 & 성장",
    description:
      "자동화 시스템을 구축하고, 지속적으로 최적화하며 비즈니스 성장을 함께합니다.",
  },
];

const testimonials = [
  {
    quote:
      "CS 인건비만 월 300만 원 절감했습니다. 오딧 받길 정말 잘했어요.",
    name: "이커머스 대표",
    role: "패션 브랜드 운영",
  },
  {
    quote:
      "AI가 뭔지도 몰랐는데, 하우제로 덕분에 반복 업무의 70%를 자동화했습니다.",
    name: "법률사무소 대표",
    role: "1인 법률사무소",
  },
  {
    quote:
      "기술을 모르는 저도 이해할 수 있게 설명해줬고, 실질적인 결과를 보여줬습니다.",
    name: "마케팅 에이전시 대표",
    role: "직원 12명 규모",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent via-background to-background" />
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-24 md:pb-32 md:pt-36">
          <p className="mb-4 text-sm font-medium tracking-wider text-muted-foreground uppercase">
            AI Transformation Partner
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.15] tracking-tight md:text-6xl">
            AI가 일하고,
            <br />
            <span className="text-muted-foreground">당신은 성장한다.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
            2024년 GPT-3로 SaaS를 만들어 1년 만에 연매출 10억.
            <br />
            그 노하우로 당신의 비즈니스 비효율을 AI로 해결합니다.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/audit"
              className="inline-flex items-center justify-center rounded-lg bg-foreground px-8 py-3.5 text-base font-semibold text-background transition-opacity hover:opacity-90"
            >
              무료 AI 오딧 신청 →
            </Link>
            <Link
              href="/ai-score"
              className="inline-flex items-center justify-center rounded-lg border border-border px-8 py-3.5 text-base font-semibold transition-colors hover:bg-accent"
            >
              AI 준비도 자가진단
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/40 bg-muted/30">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <p className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
          이런 고민이 있다면
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          비즈니스의 80%는 AI가 아니라
          <br />
          기본 프로세스에 문제가 있습니다.
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {problems.map((problem) => (
            <div
              key={problem.title}
              className="rounded-xl border border-border/60 bg-card p-8"
            >
              <h3 className="text-lg font-semibold">{problem.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="border-y border-border/40 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
            하우제로 프로세스
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            4단계로 비즈니스를 전환합니다
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {process.map((item) => (
              <div key={item.step}>
                <p className="text-4xl font-extrabold text-border">
                  {item.step}
                </p>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <p className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
          고객 후기
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          실제 고객들의 이야기
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-xl border border-border/60 bg-card p-8"
            >
              <p className="text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            지금 무료 AI 오딧을 신청하세요
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-background/70">
            30분 화상 미팅으로 비즈니스의 숨은 비효율을 찾아드립니다.
            <br />
            코딩 지식 없이도, 비용 없이도 시작할 수 있습니다.
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
