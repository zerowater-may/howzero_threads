"use client"

import Image from "next/image"
import { useState } from "react"
import { ChevronDown, X } from "lucide-react"
import { Section } from "./section"
import { highlights, captures } from "@/lib/testimonials"

/**
 * 04 후기 벽 — 하이브리드 (시안 A).
 * 하이라이트 8장 텍스트 카드 → ▼ 더 보기 → 캡처 46장 그리드 + Dialog lightbox.
 *
 * 하이라이트 슬롯은 운영 입력 — body 비면 "1기 모집 중" placeholder가 표시된다.
 */
export function TestimonialWall() {
  const [expanded, setExpanded] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  return (
    <Section
      id="testimonials"
      label="early voices"
      title={<>실제 카페에 남은 후기들.</>}
      lead="이 8장은 그동안 진행한 스터디·라이브 클래스 카페에 실제로 달린 후기에서 따왔어요. 원본 캡처는 아래 ▼ 더 보기로 50장 전부 보실 수 있습니다."
    >
      {/* 하이라이트 8장 카드 그리드 — 실제 후기 텍스트 (펼치기 전에도 노출) */}
      <div className="grid gap-3 md:grid-cols-2">
        {highlights.map((h, i) => {
          const placeholder = !h.body
          return (
            <article
              key={i}
              className={`border-2 p-5 transition-colors ${
                placeholder
                  ? "border-dashed border-foreground/30 text-foreground/55"
                  : "border-foreground bg-background"
              }`}
              aria-label={placeholder ? `후기 슬롯 ${i + 1}` : `${h.initial} 후기`}
            >
              <header className="font-mono mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.08em]">
                <span>{placeholder ? `슬롯 ${i + 1}` : h.initial}</span>
                <span className="opacity-55">{placeholder ? "운영 입력" : `${h.source}${h.date ? ` · ${h.date}` : ""}`}</span>
              </header>
              <p className="text-sm leading-relaxed">
                {placeholder
                  ? "1기 모집 중 — 첫 후기를 함께 만들 분의 자리입니다."
                  : `“${h.body}”`}
              </p>
            </article>
          )
        })}
      </div>

      {/* ▼ 더 보기 버튼 */}
      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="group inline-flex items-center gap-2 rounded-full border-2 border-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] transition-all hover:bg-foreground hover:text-background"
        >
          {expanded ? "캡처 접기" : `▼ 더 많은 후기 ${captures.length}장 보기`}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* 캡처 54장 그리드 — 접기/펼치기 */}
      {expanded && (
        <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {captures.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setLightboxIdx(i)}
              aria-label={`후기 캡처 ${i + 1} 확대보기`}
              className="group relative aspect-[3/4] overflow-hidden border border-foreground/15 bg-background transition-transform hover:-translate-y-0.5 hover:border-foreground"
            >
              <Image
                src={src}
                alt={`후기 캡처 ${i + 1}`}
                fill
                sizes="(min-width:1024px) 200px, (min-width:768px) 25vw, 50vw"
                className="object-cover object-top"
                loading="lazy"
              />
              <span className="font-mono pointer-events-none absolute bottom-1 right-1 rounded bg-background/85 px-1.5 py-0.5 text-[9px] font-bold text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                #{String(i + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`후기 캡처 ${lightboxIdx + 1} 원본`}
          onClick={() => setLightboxIdx(null)}
          onKeyDown={(e) => e.key === "Escape" && setLightboxIdx(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/90 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIdx(null)
            }}
            aria-label="닫기"
            className="absolute right-4 top-4 rounded-full border-2 border-background p-2 text-background transition-colors hover:bg-background hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
          <Image
            src={captures[lightboxIdx]}
            alt={`후기 캡처 ${lightboxIdx + 1} 원본`}
            width={800}
            height={1066}
            className="max-h-[90vh] w-auto object-contain"
          />
        </div>
      )}
    </Section>
  )
}
