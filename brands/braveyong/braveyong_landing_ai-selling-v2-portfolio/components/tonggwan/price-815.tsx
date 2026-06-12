import Image from "next/image"
import { Section } from "@/components/section"
import { PaymentDialog } from "@/components/payment-dialog"
import { CountdownTimer } from "@/components/countdown-timer"
import { tonggwan815 } from "@/lib/products"

/**
 * 가격 섹션 — '20만 원 비싸다' 반박: 안 들었을 때 치르는 값을 나열해 비교.
 * 정직 가드: 손해 항목은 전부 페이지가 이미 주장한 사실만 재사용 (새 수치 지어내기 금지).
 * 결제→입장 4스텝(구 flow-815 흡수) + 마이크로 신뢰 1줄 포함.
 */
const LOSSES: { main: string; sub: string }[] = [
  {
    main: "유료 인증서로 매년 — 사업자 20개면 연 400,000원",
    sub: "한 번이 아니라 매년 반복됩니다 ↻",
  },
  {
    main: "혼자 헤매는 한 달",
    sub: "은행 왔다갔다, 급하면 창구에서 “20영업일 뒤에 오세요”",
  },
  {
    main: "8월, 통관 정지 = 매출 정지",
    sub: "등록 없이는 수입신고 자체가 안 됩니다",
  },
  {
    main: "환불은 곧 내 돈",
    sub: "구매대행은 현지 결제가 이미 끝난 구조입니다",
  },
  {
    main: "배송지연 누적 → 판매자 점수 하락",
    sub: "노출이 줄고, 최악은 판매 제한입니다",
  },
]

const GAINS: string[] = [
  "통장 추가 없이 인증서까지 끝내는 경로",
  "막히면 그 자리에서 바로 Q&A",
  "발급 후 매년 갱신 루틴까지 — 한 번 배우면 계속 당신 것",
]

const STEPS: string[] = [
  "결제선생으로 결제",
  "결제 확인",
  "카톡 오픈채팅 입장 (결제자 전용)",
  "6/21(일) 밤 8시 라이브",
]

/** 815 표준 결제 안내 문구 (PaymentDialog noticeCopy) */
const NOTICE_COPY = (
  <>
    이름과 휴대폰 번호를 입력하면 <span className="font-bold text-foreground">결제 페이지가 바로 열립니다.</span>{" "}
    결제 후 화면의 <span className="font-bold text-brand">‘입장 링크 받기’</span>로 카톡 오픈채팅방에 입장하세요. 6/21까지 방에서 챙겨드립니다.
  </>
)

export function Price815() {
  return (
    <Section
      id="price"
      tone="light"
      label="PRICE"
      title={<>‘20만 원, 비싸다’ — 좋습니다. 안 들었을 때 값과 비교해 보죠.</>}
    >
      {/* 손해 원장 — 안 듣고 혼자 하면 치르는 값 vs 특강 1회 */}
      <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
        {/* 좌 — 안 듣고 혼자 하면 (회색/취소 톤) */}
        <div className="border-2 border-foreground/25 bg-foreground/[0.03] p-6 text-foreground/70">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/50">
            안 듣고 혼자 하면
          </p>
          <ul className="mt-4 space-y-3.5">
            {LOSSES.map((l) => (
              <li key={l.main} className="flex items-start gap-2.5">
                <span aria-hidden className="mt-0.5 shrink-0 text-base font-bold leading-none text-foreground/40">
                  ✕
                </span>
                <div>
                  <p className="text-sm font-bold leading-snug text-foreground/80">{l.main}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-foreground/50">{l.sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 우 — 이 특강 1회 (버건디) */}
        <div className="border-2 border-brand bg-brand p-6 text-brand-foreground">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] opacity-80">이 특강 1회</p>
          <p className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            {/* 손글씨 밑줄 강조 */}
            <span className="relative inline-block">
              {tonggwan815.price.toLocaleString()}원
              <svg
                aria-hidden
                className="pointer-events-none absolute -bottom-2 left-0 h-3 w-full"
                viewBox="0 0 200 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                preserveAspectRatio="none"
              >
                <path d="M4 8 C 44 4, 96 3, 196 6" />
                <path d="M12 10 C 64 7, 132 6, 188 9" />
              </svg>
            </span>
            <span className="ml-2 text-sm font-normal opacity-80">(부가세 포함)</span>
          </p>
          <ul className="mt-5 space-y-3">
            {GAINS.map((g) => (
              <li key={g} className="flex items-start gap-2.5">
                <span aria-hidden className="mt-0.5 shrink-0 text-base font-bold leading-none">
                  ✓
                </span>
                <p className="text-sm font-bold leading-snug">{g}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-3xl text-center text-sm font-bold text-foreground/70 sm:text-base">
        왼쪽 다섯 줄 중 <span className="text-brand">하나만 겪어도</span> {tonggwan815.price.toLocaleString()}원보다
        비쌉니다. 특강이 비싼 게 아니라, 안 듣고 치르는 값이 비쌉니다.
      </p>

      {/* 대형 CTA + 마이크로 신뢰 + 카운트다운 */}
      <div className="mt-10 flex flex-col items-center gap-4">
        <PaymentDialog
          label="6/21 라이브 자리 잡기"
          amount={tonggwan815.price}
          productKey={tonggwan815.productKey}
          deadline={tonggwan815.payDeadlineISO}
          deadlineLabel={tonggwan815.deadlineLabel}
          completePathPrefix="/815/complete"
          hidePromoBadges
          noticeCopy={NOTICE_COPY}
          className="inline-flex w-full max-w-md items-center justify-center gap-2 rounded-full border-2 border-brand bg-brand px-8 py-4 text-lg font-extrabold tracking-tight text-brand-foreground transition-all hover:opacity-90"
        />
        <p className="flex items-center gap-2 text-xs text-foreground/65">
          <Image
            src="/profile.jpg"
            alt="용감한 용팀장 프로필"
            width={24}
            height={24}
            className="h-6 w-6 rounded-full border border-foreground/20 object-cover"
          />
          전직 공인인증서 담당 · 현직 셀러가 직접 진행
        </p>
        <CountdownTimer className="text-brand" deadline={tonggwan815.payDeadlineISO} label={tonggwan815.deadlineLabel} />
        <p className="text-xs text-foreground/50">환불 정책은 결제 전 카톡으로 안내드립니다.</p>
      </div>

      {/* 결제→입장 4스텝 스트립 (구 flow-815 흡수) */}
      <div className="mx-auto mt-14 max-w-3xl">
        <div className="grid gap-3 sm:grid-cols-4">
          {STEPS.map((t, i) => (
            <div key={t} className="border-2 border-foreground p-4">
              <span className="font-mono text-2xl font-bold text-brand">{i + 1}</span>
              <p className="mt-1 text-sm font-bold leading-snug">{t}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-foreground/60">
          방에서는 6/21까지 제가 직접 챙깁니다 — 실전반 1기 때도 그렇게 했습니다.
        </p>
      </div>
    </Section>
  )
}
