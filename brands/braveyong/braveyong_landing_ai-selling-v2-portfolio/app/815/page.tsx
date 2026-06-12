import { redirect } from "next/navigation"

/**
 * 8월 통관대응 라이브 특강 — 일시 중단 (2026-06-12).
 * /815 접근 시 메인 강의 랜딩(/)으로 리다이렉트한다.
 * 결제 완료자 입장 페이지(/815/complete)와 결제·문자 API는 그대로 유지 —
 * 이미 결제한 분들의 입장 링크·자동 문자가 끊기지 않도록 한다.
 *
 * 강의 재개 시: 아래 주석 처리된 원본 페이지를 복구하고 이 redirect를 제거한다.
 */
export default function Page() {
  redirect("/")
}

/* ───────────────────────── 원본 (강의 재개 시 복구) ─────────────────────────
import type { Metadata } from "next"
import { RevealObserver } from "@/components/reveal-observer"
import { GlassNav815 } from "@/components/tonggwan/glass-nav-815"
import { Hero815 } from "@/components/tonggwan/hero-815"
import { DdayScene815 } from "@/components/tonggwan/dday-scene-815"
import { SelfCheck815 } from "@/components/tonggwan/self-check-815"
import { ChatFear815 } from "@/components/tonggwan/chat-fear-815"
import { MythBuster815 } from "@/components/tonggwan/myth-buster-815"
import { Principle815 } from "@/components/tonggwan/principle-815"
import { WhyYong815 } from "@/components/tonggwan/why-yong-815"
import { Curriculum815 } from "@/components/tonggwan/curriculum-815"
import { Scarcity815 } from "@/components/tonggwan/scarcity-815"
import { PolicyWindow815 } from "@/components/tonggwan/policy-window-815"
import { Price815 } from "@/components/tonggwan/price-815"
import { Faq815 } from "@/components/tonggwan/faq-815"
import { FinalCta815 } from "@/components/tonggwan/final-cta-815"
import { StickyCta815 } from "@/components/tonggwan/sticky-cta-815"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "8월 통관대응 라이브 특강 — 용감한 용팀장",
  description:
    "구매대행 셀러 계속 하려면 ‘사업자 인증서’가 필요합니다 — 그게 지금 안 만들어집니다. 대기업 공인인증서 담당 출신이 통장 한 개도 더 안 만들고 인증서까지 만드는 법을 알려드립니다. 6/21(일) 라이브 단 1회.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    title: "8월 통관대응 라이브 특강 — 용감한 용팀장",
    description: "대기업 공인인증서 담당 출신이 알려드립니다 — 사업자 인증서, 통장 추가 없이 만드는 법. 6/21(일) 단 한 번의 라이브.",
    siteName: "용감한 용팀장",
  },
  robots: { index: true, follow: true },
}

export default function Page() {
  return (
    <>
      <GlassNav815 />
      <main className="min-h-screen bg-background text-foreground">
        <Hero815 />
        <ChatFear815 />
        <SelfCheck815 />
        <DdayScene815 />
        <MythBuster815 />
        <Principle815 />
        <WhyYong815 />
        <Curriculum815 />
        <Scarcity815 />
        <PolicyWindow815 />
        <Price815 />
        <Faq815 />
        <FinalCta815 />
        <Footer />
      </main>
      <StickyCta815 />
      <RevealObserver />
    </>
  )
}
───────────────────────────────────────────────────────────────────────────── */
