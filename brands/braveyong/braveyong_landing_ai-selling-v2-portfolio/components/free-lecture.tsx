import Link from "next/link"
import { Section } from "./section"
import { config, course } from "@/lib/config"

/**
 * 20-B 무료강의 — 바로 결제가 부담되는 방문자용 저관여 진입점.
 * 얼리버드(7/10 조기신청가)와 별개. 카카오 단톡방으로 신청 → 참여 방법 안내.
 * 일시는 course.freeLectureDate 단일 출처.
 */
const previews = [
  "1만 개 올리는 방식과 효자상품 10개가 왜 다른지",
  "AI 셀링이 실제로 뭘 대신해 주는지 (대신 벌어주는 게 아니라)",
  "지금 내 스토어에서 뭐부터 손대야 하는지",
]

export function FreeLecture() {
  return (
    <Section
      id="free-lecture"
      label="무료강의"
      title={<>바로 결제가 망설여지면, 무료강의부터.</>}
      lead="온라인 무료강의를 먼저 엽니다. 강의가 어떤 식으로 진행되는지 보고 결정하셔도 돼요. 부담 없이 오세요."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        {/* 무료강의 미리보기 */}
        <div className="border-2 border-foreground bg-background p-6">
          <div className="font-mono mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/55">
            무료강의에서 다루는 것
          </div>
          <ul className="space-y-2.5">
            {previews.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm leading-relaxed sm:text-base">
                <span className="mt-0.5 font-bold text-brand">▸</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <p className="font-memo mt-4 text-sm leading-relaxed text-foreground/70">
            ※ 본강의를 억지로 권하는 자리가 아니라, 나한테 방향이 맞는지 먼저 보시는 자리예요.
          </p>
        </div>

        {/* 일시 + 신청 CTA */}
        <div className="flex flex-col justify-between border-2 border-brand bg-brand/[0.06] p-6">
          <div className="space-y-2.5 text-sm sm:text-base">
            <div className="flex items-baseline justify-between gap-2 border-b border-foreground/10 pb-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-foreground/55">일시</span>
              <span className="font-bold tabular-nums">{course.freeLectureDate}</span>
            </div>
            <div className="flex items-baseline justify-between gap-2 border-b border-foreground/10 pb-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-foreground/55">참여</span>
              <span className="font-bold">온라인 · 신청자에게 안내</span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-foreground/55">비용</span>
              <span className="font-bold text-brand">무료</span>
            </div>
          </div>
          <Link
            href={config.kakaoOpenChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-track="free_lecture_apply"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand bg-brand px-6 py-4 text-base font-bold tracking-tight text-brand-foreground transition-all hover:opacity-90"
          >
            카카오 단톡방에서 무료강의 신청
          </Link>
          <p className="mt-2 text-center text-xs leading-relaxed text-foreground/55">
            단톡방에 들어오시면 무료강의 참여 방법을 안내드려요.
          </p>
        </div>
      </div>
    </Section>
  )
}
