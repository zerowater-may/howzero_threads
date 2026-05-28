import { Hero } from "@/components/hero"
import { Strip } from "@/components/strip"
import { TrustEvidence } from "@/components/trust-evidence"
import { TestimonialWall } from "@/components/testimonial-wall"
import { Problem } from "@/components/problem"
import { AIDefinition } from "@/components/ai-definition"
import { Outcome } from "@/components/outcome"
import { SituationChoice } from "@/components/situation-choice"
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
        <Problem />           {/* 03 */}
        <AIDefinition />      {/* 04 */}
        <Outcome />           {/* 05 */}
        <SituationChoice />   {/* 06 */}
        <TrustEvidence />     {/* 07 */}
        <TestimonialWall />   {/* 08 */}
        <OriginStory />       {/* 09 Origin Story — 증거 이후 감정 보강 */}
        <Curriculum />        {/* 10 */}
        <Operation />         {/* 11 */}
        <Calendar />          {/* 12 1기 강의일정 캘린더 */}
        <YouTubeCarousel />   {/* 13 용팀장 노하우 (유튜브) */}
        <WhyYong />           {/* 14 */}
        <Study />             {/* 15 */}
        <Objections />        {/* 16 */}
        <Comparison />        {/* 17 */}
        <Price />             {/* 18 */}
        <Scarcity />          {/* 19 */}
        <Apply />             {/* 20 */}
        <FAQ />               {/* 21 */}
        <FinalCTA />          {/* 22 */}
        <Footer />            {/* 23 */}
      </main>
      <StickyCTA />
      <RevealObserver />
    </>
  )
}
