import { Hero } from "@/components/hero"
import { Strip } from "@/components/strip"
import { TrustEvidence } from "@/components/trust-evidence"
import { TestimonialWall } from "@/components/testimonial-wall"
import { Problem } from "@/components/problem"
import { AIDefinition } from "@/components/ai-definition"
import { Outcome } from "@/components/outcome"
import { Curriculum } from "@/components/curriculum"
import { Operation } from "@/components/operation"
import { Calendar } from "@/components/calendar"
import { YouTubeCarousel } from "@/components/youtube-carousel"
import { WhyYong } from "@/components/why-yong"
import { Study } from "@/components/study"
import { Objections } from "@/components/objections"
import { Comparison } from "@/components/comparison"
import { Price } from "@/components/price"
import { Scarcity } from "@/components/scarcity"
import { Apply } from "@/components/apply"
import { FAQ } from "@/components/faq"
import { FinalCTA } from "@/components/final-cta"
import { Footer } from "@/components/footer"
import { GlassNav } from "@/components/glass-nav"
import { StickyCTA } from "@/components/sticky-cta"
import { RevealObserver } from "@/components/reveal-observer"
import { OriginStory } from "@/components/origin-story"

/**
 * 용감한 용팀장 — 5주 오프라인 AI 셀링 실전반 (1기) 랜딩 v2
 *
 * spec: docs/superpowers/specs/2026-05-23-braveyong-ai-selling-landing-v2-portfolio-style-design.md
 * 18블록 wireframe + Hero/Footer/Sticky CTA.
 */
export default function Page() {
  return (
    <>
      <GlassNav />
      <main className="min-h-screen bg-background text-foreground">
        <Hero />              {/* 01 */}
        <Strip />             {/* 02 */}
        <OriginStory />       {/* 02-B Origin Story — 감정 진입 */}
        <TrustEvidence />     {/* 03 */}
        <TestimonialWall />   {/* 04 */}
        <Problem />           {/* 05 */}
        <AIDefinition />      {/* 06 */}
        <Outcome />           {/* 07 */}
        <Curriculum />        {/* 08 */}
        <Operation />         {/* 09 */}
        <Calendar />          {/* 09-B 1기 강의일정 캘린더 */}
        <YouTubeCarousel />   {/* 09-C 용팀장 노하우 (유튜브) */}
        <WhyYong />           {/* 10 */}
        <Study />             {/* 11 */}
        <Objections />        {/* 12 */}
        <Comparison />        {/* 13 */}
        <Price />             {/* 14 */}
        <Scarcity />          {/* 15 */}
        <Apply />             {/* 16 */}
        <FAQ />               {/* 17 */}
        <FinalCTA />          {/* 18 */}
        <Footer />            {/* 19 */}
      </main>
      <StickyCTA />
      <RevealObserver />
    </>
  )
}
