import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "서비스 — 하우제로(HowZero)",
  description:
    "1:1 서비스부터 SaaS 플랫폼까지, 하우제로의 4층 상품 라인업. AI 오딧, 자동화 구축, 교육, 디지털 프로덕트.",
};

interface ServiceItem {
  name: string;
  price: string;
  description: string;
  highlight?: boolean;
  href?: string;
}

interface Tier {
  floor: string;
  title: string;
  subtitle: string;
  description: string;
  items: ServiceItem[];
}

const tiers: Tier[] = [
  {
    floor: "1층",
    title: "서비스 (1:1)",
    subtitle: "고가치, 맞춤 솔루션",
    description:
      "비즈니스 프로세스를 직접 진단하고, 맞춤형 자동화 시스템을 구축합니다. 가장 높은 ROI를 보장하는 프리미엄 서비스.",
    items: [
      {
        name: "무료 AI 오딧 (30분)",
        price: "무료",
        description: "비즈니스 비효율 진단. 세일즈 없이 가치만 제공합니다.",
        href: "/services/audit-free",
      },
      {
        name: "유료 심화 오딧 (2시간)",
        price: "₩100~300만",
        description: "전체 프로세스 맵핑 + 자동화 로드맵 + 상세 리포트",
      },
      {
        name: "자동화 구축 스탠다드",
        price: "₩200만",
        description: "워크플로우 3개 + 교육 1회 + 1개월 지원",
        highlight: true,
        href: "/services/automation-standard",
      },
      {
        name: "자동화 구축 프리미엄",
        price: "₩500만",
        description: "워크플로우 5개+ + 시스템 연동 + 3개월 지원",
      },
      {
        name: "AI 전환 패키지 (올인원)",
        price: "₩1,000~3,000만",
        description: "진단+구축+교육+운영 6개월 풀패키지",
      },
      {
        name: "유지보수 리테이너 프로",
        price: "₩60만/월",
        description: "일간 모니터링 + 월 5회 수정 + 월 1회 화상",
        highlight: true,
        href: "/services/retainer-pro",
      },
    ],
  },
  {
    floor: "2층",
    title: "교육/커뮤니티 (1:N)",
    subtitle: "시간 레버리지",
    description:
      "하우제로의 실전 노하우를 체계적으로 배울 수 있는 코스와 커뮤니티. 코딩 없이 AI 자동화를 직접 구축하는 역량을 갖추세요.",
    items: [
      {
        name: "셀프페이스 코스 'AI 자동화 첫걸음'",
        price: "₩99,000",
        description: "6모듈 4~5시간, 비개발자 입문 코스",
        href: "/services/course",
      },
      {
        name: "코호트 부트캠프 (4주 라이브)",
        price: "₩490,000",
        description: "주 1회 90분 라이브 + 과제 + 1:1 + 커뮤니티",
        highlight: true,
      },
      {
        name: "5일 유료 챌린지",
        price: "₩39,000",
        description: "매일 미션 1개 → 5일 후 자동화 1개 완성",
      },
      {
        name: "기업 AI 리터러시 워크샵",
        price: "₩300만",
        description: "전 직원 대상 AI 이해+실습 (4시간)",
      },
      {
        name: "프리미엄 커뮤니티",
        price: "₩49,000/월",
        description: "월간 라이브 + 전용 템플릿 + Q&A",
      },
    ],
  },
  {
    floor: "3층",
    title: "디지털 프로덕트 (1:∞)",
    subtitle: "패시브 인컴",
    description:
      "한 번 만들면 무한 판매. 템플릿, 가이드, 전자책으로 AI 자동화 노하우를 즉시 활용하세요.",
    items: [
      {
        name: "자동화 워크플로우 템플릿 팩",
        price: "₩29,000~99,000",
        description: "Make/Zapier/n8n 즉시 적용 가능 템플릿",
        highlight: true,
      },
      {
        name: "프롬프트 엔지니어링 가이드북",
        price: "₩19,000",
        description: "업종별 최적화된 프롬프트 모음",
      },
      {
        name: "'10억 SaaS 구축기' 전자책",
        price: "₩29,000",
        description: "GPT-3 SaaS 구축 전 과정 공개",
      },
      {
        name: "AI 오딧 셀프 키트",
        price: "₩49,000",
        description: "자가 진단 체크리스트 + 로드맵 템플릿",
      },
    ],
  },
  {
    floor: "4층",
    title: "SaaS/플랫폼 (1:∞)",
    subtitle: "수면 중 수익 — 준비 중",
    description:
      "가장 큰 스케일. AI 자동화를 SaaS로 제품화하여 글로벌 시장에 제공합니다.",
    items: [
      {
        name: "AI 오딧 자동화 플랫폼",
        price: "Coming Soon",
        description: "프로세스 입력 → AI 자동 진단 → 로드맵 생성",
      },
      {
        name: "업종별 자동화 마켓플레이스",
        price: "Coming Soon",
        description: "검증된 자동화 워크플로우를 구독형으로 제공",
      },
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 md:pt-28">
        <p className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
          상품 라인업
        </p>
        <h1 className="mt-2 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
          AI 자동화의 모든 것,
          <br />
          4층 구조로 설계했습니다
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          1:1 맞춤 서비스부터 스케일 가능한 SaaS까지.
          <br />
          비즈니스 단계에 맞는 솔루션을 선택하세요.
        </p>
      </section>

      {/* Tier Map */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid grid-cols-4 gap-2 rounded-xl border border-border/60 bg-card p-4">
          {[...tiers].reverse().map((tier) => (
            <div
              key={tier.floor}
              className="rounded-lg bg-muted/50 p-4 text-center"
            >
              <p className="text-xs font-medium text-muted-foreground">
                {tier.floor}
              </p>
              <p className="mt-1 text-sm font-semibold">{tier.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {tier.subtitle}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tiers Detail */}
      {tiers.map((tier) => (
        <section
          key={tier.floor}
          className="border-t border-border/40"
        >
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
            <div className="mb-10">
              <p className="text-sm font-semibold text-muted-foreground">
                {tier.floor}
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
                {tier.title}
              </h2>
              <p className="mt-2 max-w-2xl text-base text-muted-foreground">
                {tier.description}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tier.items.map((item) => {
                const card = (
                  <div
                    className={`rounded-xl border p-6 ${
                      item.highlight
                        ? "border-foreground/30 bg-foreground/[0.02]"
                        : "border-border/60 bg-card"
                    } ${item.href ? "transition-shadow hover:shadow-md" : ""}`}
                  >
                    {item.highlight && (
                      <span className="mb-3 inline-block rounded-full bg-foreground px-3 py-0.5 text-xs font-semibold text-background">
                        추천
                      </span>
                    )}
                    <h3 className="text-base font-semibold">{item.name}</h3>
                    <p className="mt-1 text-lg font-bold">{item.price}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    {item.href && (
                      <p className="mt-3 text-xs font-medium text-muted-foreground">
                        자세히 보기 →
                      </p>
                    )}
                  </div>
                );
                return item.href ? (
                  <Link key={item.name} href={item.href}>
                    {card}
                  </Link>
                ) : (
                  <div key={item.name}>{card}</div>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="border-t border-border/40 bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            어디서 시작해야 할지 모르겠다면?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-background/70">
            무료 AI 오딧으로 비즈니스를 진단하고, 가장 적합한 상품을
            추천받으세요.
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
