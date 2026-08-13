"use client"

import Image from "next/image"
import { useState, type ReactNode } from "react"
import { ChevronDown, X } from "lucide-react"
import { Section } from "./section"
import { highlights, captures, week1Reviews, cohort1Reviews } from "@/lib/testimonials"
import { PaymentDialog } from "./payment-dialog"
import { course, priceText } from "@/lib/config"

/**
 * 04 후기 벽 — 하이브리드 (시안 A).
 * 하이라이트 8장 텍스트 카드 → ▼ 더 보기 → 캡처 46장 그리드 + Dialog lightbox.
 *
 * 하이라이트 슬롯은 운영 입력 — body 비면 "N기 모집 중"(course.cohort) placeholder가 표시된다.
 * label/title/lead는 optional — 미지정 시 기존 강의 랜딩(/) 카피 그대로 (course 무손상).
 */
export function TestimonialWall({
  label = "early voices",
  title,
  lead,
}: {
  label?: string
  title?: ReactNode
  lead?: ReactNode
}) {
  const [expanded, setExpanded] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  return (
    <Section
      id="testimonials"
      label={label}
      title={title ?? <>실제 카페에 남은 후기들.</>}
      lead={
        lead ??
        "이 8장은 그동안 진행한 스터디·라이브 클래스 카페에 실제로 달린 후기에서 따왔어요. 원본 캡처는 아래 ▼ 더 보기로 50장 전부 보실 수 있습니다."
      }
    >
      {/* ── 1기 수강 후기 (featured) — 진행 중 2주차까지 실제로 온 카톡 원문.
          1·2기가 모두 끝난 뒤로는 현재진행형("지금 1기가 겪고 있는")이 사실이 아니라
          과거형으로 바꿨다. 아래 마무리 문단도 이미 과거형이라 시제가 맞는다. ── */}
      <div className="mb-10">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="font-mono inline-flex items-center rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-foreground">
            1기 수강 후기
          </span>
          <span className="text-sm font-bold tracking-tight text-foreground sm:text-base">
            1기가 4주 동안 겪은 일입니다.
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {cohort1Reviews.map((r, i) => (
            <article
              key={i}
              className={`flex flex-col border-2 bg-background p-5 ${
                r.proof ? "border-brand shadow-[0_6px_0_var(--foreground)]" : "border-foreground"
              }`}
            >
              <header className="font-mono mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.08em]">
                <span>{r.name}</span>
                <span className="opacity-55">{r.source}</span>
              </header>
              <p className="text-sm leading-relaxed text-foreground/85">
                “
                {r.parts.map((p, j) =>
                  "u" in p ? (
                    <u
                      key={j}
                      className="font-bold text-foreground decoration-brand decoration-2 underline-offset-[3px]"
                    >
                      {p.u}
                    </u>
                  ) : (
                    <span key={j}>{p.t}</span>
                  ),
                )}
                ”
              </p>
              {r.proof && (
                <div className="mt-4 flex items-center gap-3 border-2 border-brand bg-brand/[0.06] px-3 py-2.5">
                  <span className="text-lg font-extrabold leading-none tracking-tight text-brand sm:text-xl">
                    {r.proof.rank}
                  </span>
                  <span className="text-[11px] leading-tight text-foreground/70">
                    {r.proof.sub}
                    <br />
                    {r.proof.note}
                  </span>
                </div>
              )}
              <a
                href={r.capture}
                target="_blank"
                rel="noopener noreferrer"
                data-track={`cohort1_capture_${i + 1}`}
                className="font-mono mt-auto pt-4 inline-flex items-center gap-1 self-start text-[10px] font-bold uppercase tracking-[0.1em] text-foreground/45 underline underline-offset-2 transition-colors hover:text-foreground"
              >
                카톡 원본 보기
              </a>
            </article>
          ))}
        </div>
      </div>

      {/* ── 1주차 후기 — 결제 직후 첫 주 반응 ── */}
      <div className="mb-10">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="font-mono inline-flex items-center rounded-full border-2 border-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground">
            1주차 후기
          </span>
          <span className="text-sm font-bold tracking-tight text-foreground sm:text-base">
            결제하고 첫 주, 벌써 결과가 나왔습니다.
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {week1Reviews.map((r, i) => (
            <article
              key={i}
              className={`flex flex-col border-2 bg-background p-5 ${
                r.proof ? "border-brand shadow-[0_6px_0_var(--foreground)]" : "border-foreground"
              }`}
            >
              <header className="font-mono mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.08em]">
                <span>{r.name}</span>
                <span className="opacity-55">{r.source}</span>
              </header>
              <p className="text-sm leading-relaxed text-foreground/85">
                “
                {r.parts.map((p, j) =>
                  "u" in p ? (
                    <u
                      key={j}
                      className="font-bold text-foreground decoration-brand decoration-2 underline-offset-[3px]"
                    >
                      {p.u}
                    </u>
                  ) : (
                    <span key={j}>{p.t}</span>
                  ),
                )}
                ”
              </p>
              {r.proof && (
                <div className="mt-4 flex items-center gap-3 border-2 border-brand bg-brand/[0.06] px-3 py-2.5">
                  <span className="text-xl font-extrabold leading-none tracking-tight text-brand sm:text-2xl">
                    {r.proof.rank}
                  </span>
                  <span className="text-[11px] leading-tight text-foreground/70">
                    {r.proof.sub}
                    <br />
                    {r.proof.note}
                  </span>
                </div>
              )}
              <a
                href={r.capture}
                target="_blank"
                rel="noopener noreferrer"
                data-track={`week1_capture_${i + 1}`}
                className="font-mono mt-auto pt-4 inline-flex items-center gap-1 self-start text-[10px] font-bold uppercase tracking-[0.1em] text-foreground/45 underline underline-offset-2 transition-colors hover:text-foreground"
              >
                📷 카톡 원본 보기
              </a>
            </article>
          ))}
        </div>
      </div>

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
                  ? `${course.cohort} 모집 중 — 첫 후기를 함께 만들 분의 자리입니다.`
                  : `“${h.body}”`}
              </p>
            </article>
          )
        })}
      </div>

      {/* 후기 직후 결제 경로 — 여기가 페이지에서 결제 의향이 가장 높은 지점인데
          다음 결제 버튼이 가격 섹션(문서 78% 지점)까지 없어서, 마음이 움직인 사람이
          하단 스티키 바를 찾아 누르거나 한참 스크롤해야 했다. 후기 바로 밑에 길을 하나 낸다. */}
      <div className="mt-10 flex flex-col items-center gap-3 border-2 border-foreground bg-background p-6 text-center sm:p-7">
        <p className="text-base font-bold leading-snug tracking-tight sm:text-lg">
          여기 있는 후기는 전부 1기가 지난 4주 동안 겪은 일입니다.
        </p>
        <p className="text-sm leading-relaxed text-foreground/70">
          {course.cohort}는 {course.startDate} 시작하고, 정원은 {course.capacityMax}명이에요.
        </p>
        <PaymentDialog
          amount={course.priceFirst}
          label={priceText.payLabel}
          className="mt-1 inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-full border-2 border-brand bg-brand px-7 py-4 text-base font-bold tracking-tight text-brand-foreground transition-all hover:opacity-90"
        />
        <span className="text-xs text-foreground/55">
          수강료 {priceText.total}(부가세 포함) · 이름·연락처만 넣으면 결제창이 바로 열려요
        </span>
      </div>

      {/* ▼ 더 보기 버튼 */}
      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          data-track={expanded ? "testimonials_collapse" : "testimonials_expand"}
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
              data-track={`testimonials_capture_${String(i + 1).padStart(2, "0")}`}
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
            data-track="testimonials_lightbox_close"
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
