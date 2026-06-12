import type { Metadata } from "next"
import { RevealObserver } from "@/components/reveal-observer"
import { GlassNav815 } from "@/components/tonggwan/glass-nav-815"
import { Hero815 } from "@/components/tonggwan/hero-815"
import { DdayScene815 } from "@/components/tonggwan/dday-scene-815"
import { SelfCheck815 } from "@/components/tonggwan/self-check-815"
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

/**
 * 용감한 용팀장 — 8월 통관대응 라이브 특강 랜딩 (재설계 v2)
 * spec: docs/superpowers/specs/2026-06-11-braveyong-tonggwan-815-special-lecture-landing-design.md
 * 재설계: 20% 이탈 방어 — 섹션 3까지 (화자 신원 + 8월 아침 장면 + 자기판별) 전부 노출.
 */
export default function Page() {
  return (
    <>
      <GlassNav815 />
      <main className="min-h-screen bg-background text-foreground">
        <Hero815 />          {/* 01 인증서 통증 + 후킹 + 신뢰 스트립 */}
        <DdayScene815 />     {/* 02 8월 아침 시뮬레이션 + 무료 오늘 할 일 */}
        <SelfCheck815 />     {/* 03 자기판별 — 하나라도 해당하면 대상 */}
        <MythBuster815 />    {/* 04 통장 공포 3대 오해 해소 */}
        <Principle815 />     {/* 05 4칸 원리 다이어그램 + 비용 0원 */}
        <WhyYong815 />       {/* 06 용팀장 신뢰 본진 — 얼굴+팩트+현장사진 */}
        <Curriculum815 />    {/* 07 6/21 밤 손에 남는 9가지 */}
        <Scarcity815 />      {/* 08 데드라인 — 결제 마감 + 미룰수록 손해 게이지 */}
        <PolicyWindow815 />  {/* 09 정책 윈도우 — 되는 지금 끝내라 (단정 금지) */}
        <Price815 />         {/* 10 가격 재프레임 + 결제→입장 4스텝 */}
        <Faq815 />           {/* 11 결제 전 질문 7 */}
        <FinalCta815 />      {/* 12 수미상관 + 서명 + 면책 */}
        <Footer />
      </main>
      <StickyCta815 />
      <RevealObserver />
    </>
  )
}
