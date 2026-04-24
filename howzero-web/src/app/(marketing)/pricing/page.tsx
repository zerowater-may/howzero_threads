import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "가격표 — 하우제로(HowZero)",
  description:
    "하우제로 AI 자동화 서비스 가격표. 무료 AI 오딧부터 자동화 구축, 유지보수, 셀프페이스 코스까지.",
};

interface PricingPlan {
  id: string;
  badge?: string;
  name: string;
  tagline: string;
  price: string;
  priceNote?: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlight?: boolean;
}

const plans: PricingPlan[] = [
  {
    id: "s1",
    badge: "리드마그넷",
    name: "무료 AI 오딧",
    tagline: "30분 화상, 비즈니스 비효율을 진단합니다",
    price: "₩0",
    priceNote: "무료",
    features: [
      "30분 1:1 화상 미팅",
      "현재 프로세스 비효율 진단",
      "자동화 가능 포인트 3개 이상 도출",
      "예상 ROI 간이 계산",
      "세일즈 없이 순수 가치만 제공",
    ],
    cta: "무료 오딧 신청",
    ctaHref: "/audit",
  },
  {
    id: "e2",
    name: "셀프페이스 코스",
    tagline: "'AI 자동화 첫걸음' — 비개발자 입문",
    price: "₩99,000",
    priceNote: "평생 소장",
    features: [
      "6모듈 4~5시간 분량",
      "비개발자 눈높이 100%",
      "실전 자동화 템플릿 3개 포함",
      "수강 기간 무제한",
      "수료 후 커뮤니티 1개월 무료",
    ],
    cta: "코스 살펴보기",
    ctaHref: "/services/course",
  },
  {
    id: "s4",
    badge: "가장 인기",
    name: "자동화 구축 스탠다드",
    tagline: "워크플로우 3개 + 교육 + 1개월 지원",
    price: "₩200만",
    priceNote: "프로젝트 1회",
    features: [
      "업무 프로세스 분석 (2시간)",
      "맞춤 워크플로우 3개 구축",
      "담당자 교육 1회 (2시간)",
      "구축 후 1개월 무상 지원",
      "운영 매뉴얼 제공",
      "Slack/이메일 지원",
    ],
    cta: "상담 신청",
    ctaHref: "/audit",
    highlight: true,
  },
  {
    id: "s8",
    badge: "MRR",
    name: "유지보수 리테이너 프로",
    tagline: "자동화 시스템을 안정적으로 운영합니다",
    price: "₩60만",
    priceNote: "월 구독",
    features: [
      "일간 시스템 모니터링",
      "월 5회 수정/개선 작업",
      "월 1회 화상 리뷰 미팅",
      "장애 발생 시 24시간 내 대응",
      "월간 성과 리포트",
      "우선 기술 지원",
    ],
    cta: "리테이너 문의",
    ctaHref: "/audit",
  },
];

const faq = [
  {
    q: "무료 오딧에서 정말 세일즈가 없나요?",
    a: "네. 30분 동안 비즈니스를 진단하고, 자동화 가능 포인트만 알려드립니다. 세일즈 제안은 고객이 먼저 요청할 때만 합니다.",
  },
  {
    q: "구축 스탠다드와 프리미엄의 차이는?",
    a: "스탠다드는 워크플로우 3개 + 1개월 지원. 프리미엄(₩500만)은 5개 이상 + 외부 시스템 연동 + 3개월 지원입니다. 대부분의 중소기업은 스탠다드로 충분합니다.",
  },
  {
    q: "리테이너는 최소 계약 기간이 있나요?",
    a: "3개월 최소 권장이지만 강제는 아닙니다. 다만 자동화 시스템이 안정화되려면 최소 3개월은 필요합니다.",
  },
  {
    q: "코딩을 전혀 못해도 되나요?",
    a: "네. 모든 서비스와 코스는 비개발자를 위해 설계되었습니다. 코딩 지식이 전혀 필요 없습니다.",
  },
  {
    q: "환불 정책은?",
    a: "셀프페이스 코스는 구매 후 7일 이내 무조건 환불. 구축/리테이너 서비스는 착수 전 100% 환불, 착수 후에는 잔여분 비례 환불합니다.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 text-center md:pt-28">
        <p className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
          가격표
        </p>
        <h1 className="mt-2 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
          투명한 가격,
          <br />
          명확한 가치
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          숨겨진 비용 없습니다. 비즈니스 단계에 맞는 플랜을 선택하세요.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`flex flex-col rounded-2xl border p-6 ${
                plan.highlight
                  ? "border-foreground/30 bg-foreground/[0.02] ring-1 ring-foreground/10"
                  : "border-border/60 bg-card"
              }`}
            >
              <div>
                {plan.badge && (
                  <span
                    className={`mb-3 inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${
                      plan.highlight
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {plan.badge}
                  </span>
                )}
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.tagline}
                </p>
                <div className="mt-4">
                  <span className="text-3xl font-extrabold">{plan.price}</span>
                  {plan.priceNote && (
                    <span className="ml-1 text-sm text-muted-foreground">
                      / {plan.priceNote}
                    </span>
                  )}
                </div>
              </div>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 text-foreground/60">&#10003;</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`mt-6 block rounded-lg py-3 text-center text-sm font-semibold transition-opacity hover:opacity-90 ${
                  plan.highlight
                    ? "bg-foreground text-background"
                    : "bg-muted text-foreground"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="mb-8 text-center text-2xl font-bold">상세 비교</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">
                    항목
                  </th>
                  {plans.map((p) => (
                    <th
                      key={p.id}
                      className={`pb-3 px-3 text-center font-semibold ${
                        p.highlight ? "text-foreground" : ""
                      }`}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {[
                  ["가격", "무료", "₩99,000", "₩200만", "₩60만/월"],
                  ["소요 시간", "30분", "4~5시간 (자율)", "2~4주", "월간 지속"],
                  ["1:1 미팅", "1회", "-", "교육 1회", "월 1회"],
                  ["워크플로우 구축", "-", "-", "3개", "월 5회 수정"],
                  ["매뉴얼/자료", "간이 리포트", "강의 자료", "운영 매뉴얼", "월간 리포트"],
                  ["지원 기간", "-", "커뮤니티 1개월", "1개월", "구독 중 계속"],
                  ["적합 대상", "모든 기업", "셀프 학습자", "자동화 도입기", "운영 안정기"],
                ].map(([label, ...values]) => (
                  <tr key={label}>
                    <td className="py-3 pr-4 font-medium">{label}</td>
                    {values.map((v, i) => (
                      <td
                        key={i}
                        className={`px-3 py-3 text-center text-muted-foreground ${
                          i === 2 ? "font-medium text-foreground" : ""
                        }`}
                      >
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="mb-8 text-center text-2xl font-bold">
            자주 묻는 질문
          </h2>
          <div className="space-y-6">
            {faq.map(({ q, a }) => (
              <div key={q}>
                <h3 className="text-base font-semibold">{q}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            어디서 시작해야 할지 모르겠다면?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-background/70">
            30분 무료 AI 오딧으로 시작하세요. 세일즈 없이 순수 가치만
            제공합니다.
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
