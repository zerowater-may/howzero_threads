import Image from "next/image"
import Link from "next/link"
import { Play } from "lucide-react"
import { Section } from "./section"

/**
 * 09-C 유튜브 — Calendar 다음, WhyYong 직전.
 * 왼쪽→오른쪽 자동 marquee 스크롤. hover 시 정지.
 * 카드 하단 텍스트 제거 — 썸네일과 play 오버레이만.
 */
const videos: { id: string; url: string; title: string }[] = [
  { id: "lkpxv0H3TG0", url: "https://youtu.be/lkpxv0H3TG0?si=LZyRxOqffwsM97AP", title: "용팀장 영상 1" },
  { id: "AdYg6Gv-gpo", url: "https://youtu.be/AdYg6Gv-gpo?si=XsSQBxQ4HXS2ZXD9", title: "용팀장 영상 2" },
  { id: "_dXN6UhhdEc", url: "https://youtu.be/_dXN6UhhdEc?si=kvEXbMjhWZynSsOC", title: "용팀장 영상 3" },
]

const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`

export function YouTubeCarousel() {
  // seamless 무한 루프를 위해 두 세트 복제. translateX(-50%)면 정확히 한 세트 길이 이동.
  const looped = [...videos, ...videos]

  return (
    <Section id="youtube" label="유튜브" title={<>유튜브</>}>
      {/* fade-mask 양쪽 가장자리로 카드 끊김 자연스럽게 */}
      <div
        className="relative -mx-4 overflow-hidden sm:-mx-6"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0, #000 5%, #000 95%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0, #000 5%, #000 95%, transparent 100%)",
        }}
      >
        <div className="yt-marquee-track flex w-max gap-4 py-2" aria-label="용팀장 유튜브 영상 자동 스크롤">
          {looped.map((v, i) => (
            <Link
              key={`${v.id}-${i}`}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={v.title}
              className="group relative flex-none w-[280px] overflow-hidden border-2 border-foreground bg-background transition-transform hover:-translate-y-0.5 sm:w-[360px] md:w-[420px]"
            >
              <div className="relative aspect-video overflow-hidden bg-foreground/5">
                <Image
                  src={thumb(v.id)}
                  alt={v.title}
                  fill
                  sizes="(min-width:768px) 420px, (min-width:640px) 360px, 280px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
                {/* play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/15">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-background bg-foreground text-background shadow-[0_4px_0_rgba(0,0,0,0.25)] transition-transform group-hover:scale-110">
                    <Play className="h-6 w-6 fill-background" aria-hidden />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  )
}
