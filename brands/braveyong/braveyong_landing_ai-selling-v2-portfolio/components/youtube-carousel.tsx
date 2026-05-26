import Image from "next/image"
import Link from "next/link"
import { ExternalLink, Play } from "lucide-react"
import { Section } from "./section"

/**
 * 09-C 용팀장 노하우 (유튜브) — Calendar 다음, WhyYong 직전.
 * 가로 스크롤 (snap-x) 3 영상. 외부 라이브러리 없이 native scroll.
 * 클릭 시 새 창 youtube로 이동 (in-page embed는 LCP 무거움 — link 방식).
 */
const videos: { id: string; url: string; title: string }[] = [
  {
    id: "lkpxv0H3TG0",
    url: "https://youtu.be/lkpxv0H3TG0?si=LZyRxOqffwsM97AP",
    title: "용팀장의 작업 노하우 #1",
  },
  {
    id: "AdYg6Gv-gpo",
    url: "https://youtu.be/AdYg6Gv-gpo?si=XsSQBxQ4HXS2ZXD9",
    title: "용팀장의 작업 노하우 #2",
  },
  {
    id: "_dXN6UhhdEc",
    url: "https://youtu.be/_dXN6UhhdEc?si=kvEXbMjhWZynSsOC",
    title: "용팀장의 작업 노하우 #3",
  },
]

const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`

export function YouTubeCarousel() {
  return (
    <Section
      id="youtube"
      label="용팀장 노하우"
      title={<>현장에서 직접 풀어본 작업법, 영상으로도 보세요.</>}
      lead="강의 결제 전에, 평소 어떤 방식으로 작업하는지 짧게 먼저 확인해보세요."
    >
      <div className="relative -mx-4 sm:-mx-6">
        <div
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4 sm:scroll-px-6 sm:px-6 [scrollbar-width:thin]"
          aria-label="용팀장 유튜브 영상 가로 스크롤"
        >
          {videos.map((v, i) => (
            <Link
              key={v.id}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${v.title} — 유튜브에서 열기`}
              className="group relative flex-none snap-start w-[85%] max-w-[420px] border-2 border-foreground bg-background transition-transform hover:-translate-y-0.5 sm:w-[60%] md:w-[42%] lg:w-[32%]"
            >
              <div className="relative aspect-video overflow-hidden bg-foreground/5">
                <Image
                  src={thumb(v.id)}
                  alt={`${v.title} 썸네일`}
                  fill
                  sizes="(min-width:1024px) 32vw, (min-width:768px) 42vw, 85vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
                {/* play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/15">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-background bg-foreground text-background shadow-[0_4px_0_rgba(0,0,0,0.25)] transition-transform group-hover:scale-110">
                    <Play className="h-6 w-6 fill-background" aria-hidden />
                  </span>
                </div>
                {/* index pill */}
                <span className="font-mono absolute left-3 top-3 rounded-full border-2 border-background bg-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-background">
                  #{String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center justify-between p-4">
                <span className="text-sm font-bold leading-snug tracking-tight sm:text-base">
                  {v.title}
                </span>
                <ExternalLink className="h-4 w-4 flex-none text-foreground/60 transition-colors group-hover:text-foreground" aria-hidden />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <p className="font-memo mt-4 text-sm leading-relaxed text-foreground/65 sm:text-base">
        ※ 영상 클릭 시 유튜브 새 창으로 열립니다.
      </p>
    </Section>
  )
}
