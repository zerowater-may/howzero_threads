import type { Metadata } from "next"
import { RevealObserver } from "@/components/reveal-observer"
import { GlassNav815 } from "@/components/tonggwan/glass-nav-815"
import { Hero815 } from "@/components/tonggwan/hero-815"
import { WhyNow815 } from "@/components/tonggwan/why-now-815"
import { Cost815 } from "@/components/tonggwan/cost-815"
import { SolutionTeaser815 } from "@/components/tonggwan/solution-teaser-815"
import { Curriculum815 } from "@/components/tonggwan/curriculum-815"
import { WhyYong815 } from "@/components/tonggwan/why-yong-815"
import { Scarcity815 } from "@/components/tonggwan/scarcity-815"
import { DelayCost815 } from "@/components/tonggwan/delay-cost-815"
import { Price815 } from "@/components/tonggwan/price-815"
import { Flow815 } from "@/components/tonggwan/flow-815"
import { Faq815 } from "@/components/tonggwan/faq-815"
import { FinalCta815 } from "@/components/tonggwan/final-cta-815"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "8.15 통관대응 라이브 특강 — 용감한 용팀장",
  description:
    "8월 15일부터 부호 없으면 구매대행 통관이 막힙니다. 통장 0개·인증서 0원으로 전자상거래업자 부호를 끝내는 6/21(일) 라이브 특강.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    title: "8.15 통관대응 라이브 특강 — 용감한 용팀장",
    description: "통장 0개·인증서 0원으로 전자상거래업자 부호 끝내기. 6/21(일) 단 한 번의 라이브.",
    siteName: "용감한 용팀장",
  },
  robots: { index: true, follow: true },
}

/**
 * 용감한 용팀장 — 8.15 통관대응 라이브 특강 랜딩
 * spec: docs/superpowers/specs/2026-06-11-braveyong-tonggwan-815-special-lecture-landing-design.md
 */
export default function Page() {
  return (
    <>
      <GlassNav815 />
      <main className="min-h-screen bg-background text-foreground">
        <Hero815 />          {/* 01 */}
        <WhyNow815 />        {/* 02 병목 체인 */}
        <Cost815 />          {/* 03 손실 */}
        <SolutionTeaser815 />{/* 04 반전 티저 */}
        <Curriculum815 />    {/* 05 얻는 것 */}
        <WhyYong815 />       {/* 06 권위 */}
        <Scarcity815 />      {/* 07 희소성 */}
        <DelayCost815 />     {/* 07b 미룰수록 손해 타임라인 */}
        <Price815 />         {/* 08 가격 */}
        <Flow815 />          {/* 09 결제→입장 흐름 */}
        <Faq815 />           {/* 10 FAQ */}
        <FinalCta815 />      {/* 11 최종 CTA + 면책 */}
        <Footer />
      </main>
      <RevealObserver />
    </>
  )
}
