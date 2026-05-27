"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

/**
 * Google Form iframe lazy-mount.
 *
 * 모바일 성능 보호:
 * - 기본 placeholder만 렌더 → iframe 미로드 (네트워크 0, main thread 0)
 * - IntersectionObserver로 viewport 600px 전에 진입하면 iframe mount
 * - mount 후 iframe 자체의 콘텐츠 로드는 브라우저 처리
 *
 * placeholder는 동일 820px 높이를 유지해서 CLS 0.
 */
export function ApplyFormFrame({ src }: { src: string }) {
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (mounted) return
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === "undefined") {
      // 폴백: IO 미지원 환경은 즉시 mount
      setMounted(true)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true)
          io.disconnect()
        }
      },
      { rootMargin: "600px 0px" }, // 뷰포트 위로 600px 들어오면 prefetch
    )
    io.observe(el)
    return () => io.disconnect()
  }, [mounted])

  return (
    <div
      ref={ref}
      className="mt-6 overflow-hidden border-2 border-foreground bg-background"
      style={{ minHeight: 820 }}
    >
      {mounted ? (
        <iframe
          src={src}
          title="신청서"
          className="block h-[820px] w-full"
          loading="lazy"
        />
      ) : (
        <div className="flex h-[820px] w-full flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-sm uppercase tracking-[0.18em] text-foreground/55">
            신청서 폼 준비 중
          </p>
          <p className="text-base leading-relaxed text-foreground/70 sm:text-lg">
            스크롤하시면 신청서가 바로 열립니다.
          </p>
          <Link
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            data-track="apply_form_open_external"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-foreground px-6 py-3 text-sm font-bold tracking-tight text-background transition-all hover:bg-background hover:text-foreground"
          >
            새 창에서 신청서 열기
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      )}
    </div>
  )
}
