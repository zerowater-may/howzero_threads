import Link from "next/link";
import type { Metadata } from "next";
import { RoiCalculator } from "./roi-calculator";

export const metadata: Metadata = {
  title: "AI 직원 서비스 — 하우제로(HowZero)",
  description:
    "AI 직원 2명을 월 59만원에 고용하세요. CS 응대, 데이터 처리, 반복 업무를 24시간 자동화. ROI 계산기로 절감 효과를 바로 확인하세요.",
};

const packages = [
  {
    name: "라이트",
    price: "200",
    monthly: "29",
    description: "소규모 비즈니스를 위한 AI 직원 입문",
    features: [
      "AI 직원 1명 배치",
      "CS 자동 응대 (FAQ 기반)",
      "워크플로우 2개 구축",
      "월 1회 성과 리포트",
      "이메일 지원",
    ],
  },
  {
    name: "스탠다드",
    price: "350",
    monthly: "59",
    highlight: true,
    description: "성장하는 기업의 핵심 업무 자동화",
    features: [
      "AI 직원 2명 배치",
      "CS + 데이터 처리 자동화",
      "워크플로우 5개 구축",
      "실시간 대시보드",
      "주 1회 성과 리포트",
      "전담 매니저 배정",
      "촬영 동의 시 50% 할인",
    ],
  },
  {
    name: "프리미엄",
    price: "500",
    monthly: "99",
    description: "대규모 운영을 위한 풀 자동화",
    features: [
      "AI 직원 5명+ 배치",
      "전 부서 업무 자동화",
      "워크플로우 무제한",
      "커스텀 AI 모델 튜닝",
      "일간 성과 리포트",
      "전담 팀 배정 (PM + 엔지니어)",
      "SLA 보장 (응답 4시간 이내)",
    ],
  },
];

const beforeAfter = {
  company: "이커머스 패션 브랜드 A사",
  before: [
    { label: "CS 직원", value: "4명" },
    { label: "월 인건비", value: "₩1,200만" },
    { label: "평균 응답 시간", value: "4시간" },
    { label: "야간/주말 대응", value: "불가" },
    { label: "월 처리 건수", value: "2,000건" },
  ],
  after: [
    { label: "CS 직원", value: "1명 + AI 2명" },
    { label: "월 비용", value: "₩359만" },
    { label: "평균 응답 시간", value: "30초" },
    { label: "야간/주말 대응", value: "24/7 자동" },
    { label: "월 처리 건수", value: "5,000건+" },
  ],
  savings: "월 ₩841만 절감, 처리량 2.5배 증가",
};

const faqs = [
  {
    q: "AI 직원이 정확히 뭔가요?",
    a: "AI 직원은 CS 응대, 데이터 입력, 반복 보고서 작성 등 정해진 업무를 24시간 자동으로 처리하는 AI 자동화 시스템입니다. 사람처럼 실수하거나 퇴근하지 않습니다.",
  },
  {
    q: "도입까지 얼마나 걸리나요?",
    a: "라이트 패키지 기준 2주, 스탠다드 4주, 프리미엄 6~8주입니다. 무료 AI 오딧 후 정확한 일정을 안내드립니다.",
  },
  {
    q: "기존 시스템과 연동되나요?",
    a: "슬랙, 카카오톡, 이메일, CRM, ERP 등 대부분의 업무 툴과 연동됩니다. 스탠다드 이상 패키지에서 커스텀 연동을 지원합니다.",
  },
  {
    q: "촬영 동의 할인이 뭔가요?",
    a: "도입 과정을 유튜브 콘텐츠로 촬영하는 데 동의하시면, 도입비에서 50%를 할인해드립니다. 기업명은 익명 처리 가능합니다.",
  },
  {
    q: "효과가 없으면 어떻게 되나요?",
    a: "무료 AI 오딧에서 ROI를 사전 검증합니다. 예상 절감액이 도입비를 회수하지 못할 것으로 판단되면, 솔직하게 도입을 권하지 않습니다.",
  },
];

export default function AiEmployeesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent via-background to-background" />
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-24 md:pb-32 md:pt-36">
          <p className="mb-4 text-sm font-medium tracking-wider text-muted-foreground uppercase">
            AI Employee Service
          </p>
          <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.15] tracking-tight md:text-6xl">
            AI 직원 2명을
            <br />
            <span className="text-muted-foreground">
              월 59만원에 고용하세요.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
            CS 응대, 데이터 처리, 반복 업무를 24시간 쉬지 않는
            <br />
            AI 직원이 대신합니다. 인건비는 줄이고, 품질은 올리세요.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/audit"
              className="inline-flex items-center justify-center rounded-lg bg-foreground px-8 py-3.5 text-base font-semibold text-background transition-opacity hover:opacity-90"
            >
              무료 AI 오딧 30분 신청 →
            </Link>
            <a
              href="#roi-calculator"
              className="inline-flex items-center justify-center rounded-lg border border-border px-8 py-3.5 text-base font-semibold transition-colors hover:bg-accent"
            >
              ROI 계산해보기
            </a>
          </div>
        </div>
      </section>

      {/* Key Numbers */}
      <section className="border-y border-border/40 bg-muted/30">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
          {[
            { value: "월 59만", label: "AI 직원 2명 비용" },
            { value: "24/7", label: "무중단 업무 처리" },
            { value: "30초", label: "평균 응답 시간" },
            { value: "70~85%", label: "업무 자동화율" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Before / After Case Study */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <p className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
          실제 도입 사례
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
          비포 / 애프터 — {beforeAfter.company}
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          * 유튜브 시즌1 &lsquo;이커머스 셀러 자동화&rsquo; 시리즈 연동 사례
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Before */}
          <div className="rounded-xl border border-border/60 bg-card p-8">
            <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
              BEFORE
            </span>
            <div className="mt-6 space-y-4">
              {beforeAfter.before.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between border-b border-border/40 pb-3"
                >
                  <span className="text-sm text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* After */}
          <div className="rounded-xl border border-foreground/20 bg-foreground/[0.02] p-8">
            <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              AFTER
            </span>
            <div className="mt-6 space-y-4">
              {beforeAfter.after.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between border-b border-border/40 pb-3"
                >
                  <span className="text-sm text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-emerald-50 p-4 text-center">
          <p className="text-base font-semibold text-emerald-800">
            {beforeAfter.savings}
          </p>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="border-y border-border/40 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
            패키지 가격
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            비즈니스 규모에 맞는 AI 직원 패키지
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            도입비는 1회성, 월 운영비만 지속됩니다. 촬영 동의 시 도입비
            50% 할인.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`relative flex flex-col rounded-2xl border p-8 ${
                  pkg.highlight
                    ? "border-foreground/30 bg-foreground/[0.02]"
                    : "border-border/60 bg-card"
                }`}
              >
                {pkg.highlight && (
                  <span className="absolute -top-3 left-6 rounded-full bg-foreground px-4 py-1 text-xs font-semibold text-background">
                    가장 인기
                  </span>
                )}
                <h3 className="text-xl font-bold">{pkg.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {pkg.description}
                </p>

                <div className="mt-6">
                  <p className="text-sm text-muted-foreground">도입비 (1회)</p>
                  <p className="text-2xl font-extrabold">
                    ₩{pkg.price}만
                  </p>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground">월 운영비</p>
                  <p className="text-2xl font-extrabold">
                    ₩{pkg.monthly}만
                    <span className="text-base font-normal text-muted-foreground">
                      /월
                    </span>
                  </p>
                </div>

                <ul className="mt-8 flex-1 space-y-3">
                  {pkg.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="mt-0.5 text-emerald-600">&#10003;</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/audit"
                  className={`mt-8 inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 ${
                    pkg.highlight
                      ? "bg-foreground text-background"
                      : "border border-border bg-background text-foreground hover:bg-accent"
                  }`}
                >
                  무료 상담 신청 →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section
        id="roi-calculator"
        className="mx-auto max-w-6xl px-6 py-20 md:py-28"
      >
        <p className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
          ROI 계산기
        </p>
        <h2 className="mt-2 mb-10 text-3xl font-bold tracking-tight md:text-4xl">
          우리 회사에 AI 직원을 도입하면?
        </h2>
        <RoiCalculator />
      </section>

      {/* FAQ */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
            자주 묻는 질문
          </h2>
          <div className="mt-12 space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl border border-border/60 bg-card p-6"
              >
                <h3 className="text-base font-semibold">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/40 bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            AI 직원, 지금 무료로 체험하세요
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-background/70">
            30분 무료 AI 오딧으로 정확한 절감 효과를 확인하세요.
            <br />
            세일즈 없이, 가치만 제공합니다.
          </p>
          <Link
            href="/audit"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-background px-8 py-3.5 text-base font-semibold text-foreground transition-opacity hover:opacity-90"
          >
            무료 AI 오딧 30분 신청 →
          </Link>
        </div>
      </section>
    </>
  );
}
