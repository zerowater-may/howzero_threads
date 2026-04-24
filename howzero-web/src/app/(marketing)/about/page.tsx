import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "하우제로 스토리 — HowZero",
  description:
    "2024년 GPT-3로 SaaS를 런칭해 1년 만에 연매출 10억. 하우제로의 여정과 철학을 소개합니다.",
};

const timeline = [
  {
    year: "2024",
    title: "GPT-3 SaaS 런칭",
    description:
      "대중이 AI에 호기심을 가질 때, 직접 GPT-3를 활용해 SaaS를 개발하고 시장에 뛰어들었습니다.",
  },
  {
    year: "2024",
    title: "시행착오와 검증",
    description:
      "화려한 기술이 아닌 비즈니스 문제 해결에 집중. 고객의 반복 업무를 자동화하며 제품-시장 적합성을 찾았습니다.",
  },
  {
    year: "2025",
    title: "연매출 10억 달성",
    description:
      "코딩보다 비즈니스 원리에 집중한 결과, 1년 만에 연매출 10억 원이라는 실질적인 성과를 증명했습니다.",
  },
  {
    year: "2025~",
    title: "AI 전환 파트너로 확장",
    description:
      "자신의 성공 공식을 다른 기업에도 적용. 오딧, 컨설팅, 교육으로 AI 전환을 돕는 파트너가 되었습니다.",
  },
];

const philosophies = [
  {
    title: "지식 격차의 수익화",
    description:
      "기술을 모르는 기업(0점)과 최신 AI 기술(100점) 사이의 격차를 해소하는 데서 가치가 창출됩니다.",
  },
  {
    title: "비즈니스 문제 해결이 우선",
    description:
      "AI는 목적이 아니라 도구입니다. 최신 트렌드를 쫓기보다 고객의 프로세스를 진단하고 실용적 해결책을 제시합니다.",
  },
  {
    title: "Low-Hanging Fruit 집중",
    description:
      "복잡한 커스텀 개발에 매몰되기보다, 높은 가치를 주면서도 실행하기 쉬운 솔루션을 먼저 찾습니다.",
  },
  {
    title: "기술적 환상 부수기",
    description:
      "기업 문제의 80%는 AI 부재가 아니라 기본 프로세스에 있습니다. AI는 그 위에 얹는 화룡점정입니다.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 md:pt-28">
        <p className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
          하우제로 스토리
        </p>
        <h1 className="mt-2 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
          남들이 챗GPT로 장난칠 때,
          <br />
          저는 SaaS를 만들어 10억을 냈습니다.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          하우제로는 단순히 이론만 떠드는 전문가가 아닙니다.
          <br />
          직접 뛰어들어 증명하고, 그 노하우를 투명하게 공유합니다.
        </p>
      </section>

      {/* Quote */}
      <section className="border-y border-border/40 bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <blockquote className="text-2xl font-bold leading-relaxed tracking-tight md:text-3xl">
            &ldquo;코딩 몰라도 됩니다.
            <br />
            비즈니스 원리만 알면
            <br />
            AI가 10억을 벌어다 줍니다.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-muted-foreground">— 하우제로</p>
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-4xl px-6 py-20 md:py-28">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          여정
        </h2>
        <div className="mt-12 space-y-0">
          {timeline.map((item, idx) => (
            <div key={idx} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
                  {item.year}
                </div>
                {idx < timeline.length - 1 && (
                  <div className="w-px flex-1 bg-border" />
                )}
              </div>
              <div className="pb-12">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Philosophy */}
      <section className="border-y border-border/40 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            핵심 철학
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {philosophies.map((p) => (
              <div
                key={p.title}
                className="rounded-xl border border-border/60 bg-card p-8"
              >
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          이런 분들을 돕습니다
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-card p-8">
            <h3 className="text-lg font-semibold">
              얼리 머조리티 기업가
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              AI가 중요하다는 것은 알지만, 구체적인 증명과 실용적인 ROI가
              확인되어야만 움직이는 중소/중견기업의 대표들. 하우제로는
              '연매출 10억'이라는 확실한 증거를 바탕으로 신뢰를 줍니다.
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-8">
            <h3 className="text-lg font-semibold">
              효율화를 원하는 1인 기업/창업가
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              반복되는 업무에 지쳐 자동화 시스템 도입을 원하지만, 코딩이나
              기술적 장벽 때문에 망설이는 사람들. 하우제로가 그 장벽을
              허물어 드립니다.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            하우제로와 함께 시작하세요
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-background/70">
            기업의 비효율은 곧 낭비되는 돈입니다.
            <br />
            하우제로와 함께 AI로 프로세스를 깎고 이윤을 극대화하세요.
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
