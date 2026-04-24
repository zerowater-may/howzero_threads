import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "자동화 구축 스탠다드 — 하우제로(HowZero)",
  description:
    "워크플로우 3개 구축 + 담당자 교육 + 1개월 무상 지원. 비개발자도 직접 운영 가능한 자동화 시스템을 만들어드립니다.",
};

const deliverables = [
  {
    title: "업무 프로세스 분석",
    desc: "2시간 심층 미팅으로 현재 업무 흐름을 파악하고, 자동화 우선순위를 도출합니다.",
  },
  {
    title: "맞춤 워크플로우 3개 구축",
    desc: "n8n/Make/Zapier 기반, 가장 ROI가 높은 3개 업무를 자동화합니다.",
  },
  {
    title: "담당자 교육 (2시간)",
    desc: "실전 조작법, 트러블슈팅, 수정 방법까지. 교육 후 직접 운영 가능하도록.",
  },
  {
    title: "운영 매뉴얼",
    desc: "화면 캡처 포함 스텝바이스텝 가이드. 담당자 변경 시에도 인수인계 가능.",
  },
  {
    title: "1개월 무상 지원",
    desc: "구축 후 안정화 기간. Slack/이메일로 질문하시면 24시간 내 답변.",
  },
];

const useCases = [
  {
    industry: "이커머스",
    examples: [
      "주문 → 발주 → 송장 자동 처리",
      "CS 인입 → 자동 분류 → 답변 초안",
      "재고 임계치 알림 자동화",
    ],
  },
  {
    industry: "에이전시/컨설팅",
    examples: [
      "리드 수집 → CRM 자동 등록 → 너처링 이메일",
      "프로젝트 일정 → Slack/노션 자동 알림",
      "인보이스 → 입금 확인 → 자동 발송",
    ],
  },
  {
    industry: "법률/회계",
    examples: [
      "문서 수신 → OCR → 데이터 추출 → 자동 분류",
      "기한 관리 자동 알림 시스템",
      "고객 상담 예약 → 사전 질문지 자동 발송",
    ],
  },
];

export default function AutomationStandardPage() {
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
            S4 · 가장 인기
          </span>
          <span className="rounded-full border border-border/60 px-3 py-0.5 text-xs text-muted-foreground">
            1:1 서비스 · 프로젝트
          </span>
        </div>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
          자동화 구축 스탠다드
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          워크플로우 3개를 직접 구축하고, 교육하고, 1개월 지원합니다.
          <br />
          비개발자도 직접 운영할 수 있는 시스템을 만듭니다.
        </p>
        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-4xl font-extrabold">₩200만</span>
          <span className="text-sm text-muted-foreground">/ 프로젝트 1회</span>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/audit"
            className="rounded-lg bg-foreground px-8 py-3.5 text-base font-semibold text-background transition-opacity hover:opacity-90"
          >
            상담 신청 →
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-border/60 px-8 py-3.5 text-base font-semibold transition-colors hover:bg-muted"
          >
            전체 가격표 보기
          </Link>
        </div>
      </section>

      {/* Deliverables */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="mb-10 text-2xl font-bold">포함 사항</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {deliverables.map(({ title, desc }) => (
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

      {/* Timeline */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="mb-10 text-2xl font-bold">프로젝트 타임라인</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { week: "Week 1", title: "분석 & 설계", desc: "프로세스 분석 미팅 → 자동화 설계서 작성" },
              { week: "Week 2", title: "워크플로우 구축", desc: "3개 워크플로우 개발 + 테스트" },
              { week: "Week 3", title: "교육 & 배포", desc: "담당자 교육 + 운영 환경 배포" },
              { week: "Week 4~8", title: "안정화 지원", desc: "1개월 무상 지원 + 모니터링" },
            ].map(({ week, title, desc }) => (
              <div key={week} className="rounded-xl border border-border/60 bg-card p-5">
                <p className="text-xs font-semibold text-muted-foreground">{week}</p>
                <h3 className="mt-2 text-sm font-semibold">{title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="mb-10 text-2xl font-bold">업종별 활용 사례</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {useCases.map(({ industry, examples }) => (
              <div key={industry} className="rounded-xl border border-border/60 bg-card p-6">
                <h3 className="text-base font-semibold">{industry}</h3>
                <ul className="mt-3 space-y-2">
                  {examples.map((ex) => (
                    <li key={ex} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-0.5 text-foreground/60">&#10003;</span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold">투자 대비 수익</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            워크플로우 3개 자동화 시, 평균 주 15시간 절감.
            인건비 기준 월 ₩200만 이상 절감 효과.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-3xl font-extrabold">₩200만</p>
              <p className="text-sm text-muted-foreground">1회 투자</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold">₩200만+</p>
              <p className="text-sm text-muted-foreground">월 절감 효과</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold">1개월</p>
              <p className="text-sm text-muted-foreground">투자 회수 기간</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            먼저 무료 오딧부터 시작하세요
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-background/70">
            30분 무료 진단 후, 구축이 필요한 워크플로우를 함께 결정합니다.
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
