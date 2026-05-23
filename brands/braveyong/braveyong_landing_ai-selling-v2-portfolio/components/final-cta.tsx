import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Signature } from "./handwriting"
import { config } from "@/lib/config"

/** 18 최종 CTA (다크) — 큰 CTA + 흰 펜글씨 서명 */
export function FinalCTA() {
  return (
    <section className="bg-foreground px-4 py-24 text-background sm:px-6 sm:py-28">
      <div className="mx-auto max-w-3xl text-center">
        {/* 인터뷰 기반 한국인 정서 카피 — 자산형 vs 현금흐름형 */}
        <p className="font-memo mb-4 text-sm leading-relaxed text-background/65 sm:text-base">
          자산은 있어도 매월 들어오는 돈은 별도입니다.<br />
          현금흐름은 따로 만들어야 합니다.
        </p>

        <h2 className="text-3xl font-bold uppercase leading-tight tracking-tight sm:text-4xl md:text-5xl">
          1기 실행자로<br className="sm:hidden" /> 지원하기
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-background/70 sm:text-lg">
          상품만 계속 올리던 방식을 정말 바꾸고 싶다면,<br className="hidden sm:block" />
          지금 신청서를 작성하세요.
        </p>

        <div className="mt-8">
          <Link
            href={config.googleFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-background bg-background px-8 py-4 text-base font-bold uppercase tracking-[0.1em] text-foreground transition-all hover:bg-foreground hover:text-background sm:text-lg"
          >
            1기 실행자 특별가로 지원하기
            <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-background/55 sm:text-sm">
          신청서 검토 후 참여 안내와 결제 안내를 드립니다.<br />
          6월 10일 유튜브 무료강의 안내도 함께 보내드립니다.
        </p>

        <div className="mt-10 text-background">
          <Signature small={<span className="text-background/55">현업 셀러 · 직장인 · 육아 아빠</span>}>
            — 용감한 용팀장 드림
          </Signature>
        </div>
      </div>
    </section>
  )
}
