import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Section } from "./section"
import { config, course, priceText } from "@/lib/config"
import { PaymentDialog } from "@/components/payment-dialog"
import { CountdownTimer } from "@/components/countdown-timer"

/**
 * 16 결제 — 결제 단일 경로 섹션 (2026-07-20 개편).
 *
 * 이전 구조는 결제 버튼 아래 "신청서부터 작성하기" outline 버튼 + 하단 구글폼 820px iframe이
 * 자동 mount되어, 결제 섹션에서 가장 큰 인터랙션 표면이 폼이었다.
 * 결제를 결심한 사람에게 무료 대안을 나란히 주면 결제가 폼으로 흡수된다 — 둘 다 제거.
 * 남긴 보조 경로는 "결제 전 질문"용 카톡 링크 2개뿐.
 */
export function Apply() {
  return (
    <Section
      id="apply"
      label={`${course.cohort} 결제`}
      title={<>지금 {course.cohort}, 여기서 바로 시작합니다.</>}
    >
      <div className="mb-6 border-l-4 border-brand bg-brand/[0.06] p-6 sm:p-7">
        <div className="font-mono mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
          {course.cohort} 모집 중 · 정원 {course.capacityMax}명
        </div>
        <p className="text-lg font-bold leading-snug tracking-tight text-foreground sm:text-xl">
          수강료는 카드 6개월 무이자로{" "}
          <span className="underline decoration-brand/40 decoration-2 underline-offset-4">
            월 {priceText.monthly6Exact}
          </span>
          , 한 번에 결제하면 {priceText.total}입니다. 부가세까지 포함한 금액이에요.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/75 sm:text-base">
          신청서 쓰고 기다리는 절차 없습니다. 이름과 연락처만 넣으면{" "}
          <span className="font-bold text-foreground">결제창이 바로 열리고</span>, 그걸로 자리가 확정돼요.
        </p>
      </div>

      {/* 가격 + 카운트다운 + 큰 결제 버튼 — 저스크롤 사용자 대응으로 위에 몰아넣음 */}
      <div className="mb-8 border-2 border-brand bg-background p-6 sm:p-8">
        <div className="flex flex-col items-center gap-1 text-center">
          {/* 큰 숫자는 월 납입액(카드 6개월 무이자), 총액은 그 위·아래에서 숨기지 않고 밝힌다.
              총액에 취소선은 긋지 않는다 — 실제 청구액이라 긁으면 없는 할인을 만든다. */}
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/55">
            {course.cohort} 수강료 · 카드 6개월 무이자 기준
          </div>
          <div className="mt-1 text-base font-bold tabular-nums text-foreground/45">
            {priceText.totalExact}
            <span className="ml-1 text-sm font-normal">부가세 포함</span>
          </div>
          <div className="mt-0.5 flex items-baseline justify-center gap-1.5">
            <span className="text-xl font-bold text-foreground/60 sm:text-2xl">월</span>
            <span className="text-4xl font-extrabold tracking-tight text-brand sm:text-5xl">
              {priceText.monthly6Exact}
            </span>
          </div>
          <div className="mt-1 text-xs text-foreground/60 sm:text-sm">
            한 번에 결제하면 {priceText.total} · 결제창에 찍히는 금액입니다
          </div>
          <CountdownTimer className="mt-3 text-foreground" label="개강 전 결제 마감까지" />
        </div>

        <div className="mt-6 flex justify-center">
          <PaymentDialog
            amount={course.priceFirst}
            label={priceText.payLabel}
            className="group inline-flex w-full max-w-md items-center justify-center gap-2.5 rounded-full border-2 border-brand bg-brand px-9 py-5 text-lg font-bold tracking-tight text-brand-foreground shadow-[0_6px_0_oklch(0.22_0.1_18)] transition-all hover:translate-y-0.5 hover:shadow-[0_3px_0_oklch(0.22_0.1_18)] sm:px-12 sm:py-6 sm:text-xl"
          />
        </div>

        <p className="font-memo mt-4 text-center text-sm leading-relaxed text-foreground/70 sm:text-base">
          <span className="font-bold text-foreground">카드 3·6개월 무이자</span> 다 됩니다.
          할부 개월 수는 결제창에서 카드 고르신 뒤 선택하시면 돼요.
        </p>

        {/* 결제 전 질문용 보조 링크 — 신청 경로가 아니라 문의 경로 */}
        <div className="mt-5 flex flex-col items-center justify-center gap-2 border-t border-foreground/10 pt-4 text-sm sm:flex-row sm:gap-4">
          <span className="text-foreground/55">결제 전 궁금하면</span>
          <Link
            href={config.kakaoOpenChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="결제 전 단톡방 — 새 창"
            data-track="apply_openchat"
            className="inline-flex items-center gap-1 font-bold text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:text-brand"
          >
            단톡방 들어가 보기
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={config.kakao1to1Url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="용팀장 1:1 카카오톡 — 새 창"
            data-track="apply_kakao"
            className="inline-flex items-center gap-1 font-bold text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:text-brand"
          >
            용팀장님께 1:1 물어보기
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 결제 후 흐름 — 결제가 유일한 시작점, 그 뒤는 용팀장이 챙김 */}
      <div className="mb-8 border-2 border-foreground bg-background p-5 sm:p-6">
        <div className="font-mono mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/55">
          결제하면 이렇게 시작돼요
        </div>
        <ol className="grid gap-3 sm:grid-cols-3">
          {[
            { n: "01", h: "지금 결제", b: "이름·휴대폰만 입력하면 결제창이 바로 열립니다. 카드·이체·무이자 할부 가능." },
            { n: "02", h: "용팀장 카톡 안내", b: "결제 확정되면 용팀장이 카톡으로 1주차 일정·장소를 직접 챙겨 보내드려요." },
            { n: "03", h: `${course.startDate} 개강`, b: `${course.weeks}주 오프라인 실전반 시작. 노트북 들고 오시면 그 자리에서 같이 돌립니다.` },
          ].map((s) => (
            <li key={s.n} className="relative border-l-2 border-foreground/30 pl-4">
              <div className="font-mono mb-1 text-[10px] font-bold text-foreground/55">STEP {s.n}</div>
              <div className="text-sm font-bold tracking-tight sm:text-base">{s.h}</div>
              <p className="mt-1 text-xs leading-relaxed text-foreground/65 sm:text-sm">{s.b}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* 강한 문구 — 인터뷰 언어 패턴 */}
      <div className="bg-foreground p-6 text-background sm:p-8">
        <div className="text-lg font-bold tracking-tight sm:text-2xl">
          실행할 분만 받습니다.
        </div>
        <div className="mt-2 text-sm leading-relaxed text-background/75 sm:text-base">
          상품만 계속 올리던 방식을 정말 바꾸고 싶은 분만 결제해주세요.<br />
          쉽게 돈 버는 강의 찾으시는 분은 다른 곳이 더 맞습니다.
        </div>
        <div className="mt-5 grid gap-3 border-t border-background/15 pt-5 text-sm text-background/85 sm:grid-cols-2">
          <p>
            <span className="font-mono mr-2 text-[10px] uppercase tracking-[0.15em] text-background/55">받습니다</span>
            직장·육아 병행하면서도 {course.weeks}주 동안 직접 상품을 같이 고쳐 가실 분
          </p>
          <p>
            <span className="font-mono mr-2 text-[10px] uppercase tracking-[0.15em] text-background/55">정중히 사양</span>
            ‘딸깍 자동화·하루 1시간이면 누구나’ 같은 강의를 찾으시는 분
          </p>
        </div>
        <p className="font-memo mt-5 border-t border-background/15 pt-4 text-sm leading-relaxed text-background/85 sm:text-base">
          정원 {course.capacityMax}명이고, {course.startDate} 개강하면 {course.cohort}는 닫힙니다. 결제는 위에서 바로 하시면 돼요.
        </p>
      </div>
    </Section>
  )
}
