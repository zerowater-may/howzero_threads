import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "유지보수 리테이너 프로 — 하우제로(HowZero)",
  description:
    "월 ₩60만으로 AI 자동화 시스템을 안정적으로 운영합니다. 일간 모니터링, 월 5회 수정, 월 1회 화상 리뷰.",
};

const tiers = [
  {
    name: "베이직",
    price: "₩30만/월",
    features: [
      "주간 모니터링",
      "월 2회 수정",
      "이메일 지원",
      "월간 상태 리포트",
    ],
  },
  {
    name: "프로",
    price: "₩60만/월",
    highlight: true,
    features: [
      "일간 모니터링",
      "월 5회 수정/개선",
      "월 1회 화상 리뷰 미팅",
      "장애 24시간 내 대응",
      "월간 성과 리포트",
      "우선 기술 지원",
    ],
  },
  {
    name: "프리미엄",
    price: "₩120만/월",
    features: [
      "실시간 모니터링",
      "무제한 수정",
      "전담 Slack 채널",
      "장애 4시간 내 대응",
      "주간 리포트",
      "신규 자동화 제안",
    ],
  },
];

const included = [
  { title: "시스템 모니터링", desc: "워크플로우 실행 상태, 에러율, 처리량을 매일 확인합니다." },
  { title: "정기 수정/개선", desc: "비즈니스 변화에 맞춰 워크플로우를 지속적으로 최적화합니다." },
  { title: "화상 리뷰 미팅", desc: "월 1회, 지난 달 성과와 다음 달 개선 방향을 함께 논의합니다." },
  { title: "장애 대응", desc: "시스템 이상 시 24시간 내 원인 분석 + 복구. 슬랙/이메일 즉시 알림." },
  { title: "성과 리포트", desc: "자동화 절감 시간, 처리 건수, 에러율 등 핵심 지표를 월간 정리합니다." },
  { title: "기술 지원", desc: "워크플로우 관련 질문에 이메일/슬랙으로 우선 답변합니다." },
];

export default function RetainerProPage() {
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
          <span className="rounded-full bg-foreground px-3 py-0.5 text-xs font-semibold text-background">
            S8 · MRR
          </span>
          <span className="rounded-full border border-border/60 px-3 py-0.5 text-xs text-muted-foreground">
            월 구독 서비스
          </span>
        </div>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
          유지보수 리테이너 프로
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          자동화 시스템은 구축이 끝이 아닙니다.
          <br />
          안정적인 운영이 진짜 가치를 만듭니다.
        </p>
        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-4xl font-extrabold">₩60만</span>
          <span className="text-sm text-muted-foreground">/ 월</span>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/audit"
            className="rounded-lg bg-foreground px-8 py-3.5 text-base font-semibold text-background transition-opacity hover:opacity-90"
          >
            리테이너 문의 →
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-border/60 px-8 py-3.5 text-base font-semibold transition-colors hover:bg-muted"
          >
            전체 가격표 보기
          </Link>
        </div>
      </section>

      {/* Tier Comparison */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="mb-10 text-2xl font-bold">리테이너 플랜 비교</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col rounded-2xl border p-6 ${
                  tier.highlight
                    ? "border-foreground/30 bg-foreground/[0.02] ring-1 ring-foreground/10"
                    : "border-border/60 bg-card"
                }`}
              >
                {tier.highlight && (
                  <span className="mb-3 inline-block rounded-full bg-foreground px-3 py-0.5 text-xs font-semibold text-background">
                    추천
                  </span>
                )}
                <h3 className="text-lg font-bold">{tier.name}</h3>
                <p className="mt-2 text-2xl font-extrabold">{tier.price}</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 text-foreground/60">&#10003;</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="mb-10 text-2xl font-bold">프로 플랜 상세</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {included.map(({ title, desc }) => (
              <div key={title} className="rounded-xl border border-border/60 bg-card p-6">
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Retainer */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-bold">왜 리테이너가 필요한가</h2>
          <div className="mt-6 space-y-4 text-sm text-muted-foreground">
            <p>
              자동화 시스템은 비즈니스 환경 변화에 따라 지속적으로 업데이트가
              필요합니다. 외부 API 변경, 내부 프로세스 변화, 신규 도구 도입 등
              매달 수정 사항이 발생합니다.
            </p>
            <p>
              리테이너 없이 운영하면 작은 장애가 쌓여 결국 시스템을 사용하지
              않게 됩니다. 월 ₩60만 투자로 ₩200만 이상의 자동화 가치를
              지속적으로 유지합니다.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            구축 프로젝트와 함께 시작하면 10% 할인
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-background/70">
            자동화 구축 스탠다드 + 리테이너 프로 동시 계약 시 첫 3개월 10%
            할인을 적용합니다.
          </p>
          <Link
            href="/audit"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-background px-8 py-3.5 text-base font-semibold text-foreground transition-opacity hover:opacity-90"
          >
            리테이너 문의 →
          </Link>
        </div>
      </section>
    </>
  );
}
