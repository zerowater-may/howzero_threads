import Image from "next/image"
import { PaymentDialog } from "@/components/payment-dialog"
import { CountdownTimer } from "@/components/countdown-timer"
import { Marker } from "@/components/handwriting"
import { tonggwan815 } from "@/lib/products"

/** 히어로 신뢰 스트립 팩트칩 — 검증된 사실만 (성과 보장 문구 금지) */
const TRUST_CHIPS = ["지금도 직접 올리는 현직 셀러", "혼자 1만 개 등록", "AI셀링 실전반 1기 운영"]

export function Hero815() {
  return (
    <header className="relative overflow-hidden bg-background px-4 pt-20 pb-16 text-foreground sm:px-6 sm:pt-28 sm:pb-20">
      <div className="mx-auto max-w-3xl text-center" data-reveal>
        <div className="font-mono mb-5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]">
          <span className="rounded-full border border-foreground/20 px-3 py-1">6/21(일) 온라인 라이브</span>
          <span className="rounded-full border border-foreground/20 px-3 py-1">선착순 {tonggwan815.capacity}명</span>
          <span className="rounded-full bg-brand px-3 py-1 text-brand-foreground">8.15 데드라인</span>
        </div>

        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
          부호 받으려면 ‘사업자 인증서’.<br />
          그거, 지금 <Marker>못 만드시잖아요.</Marker>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-foreground/55">
          부호(통관고유부호) = 세관이 ‘이 물건 주인이 누구인지’ 확인하는 등록번호입니다.{" "}
          8월 15일부터 이게 없으면 수입신고 자체가 안 됩니다.
        </p>

        <p className="mx-auto mt-4 max-w-xl text-base font-bold leading-relaxed text-foreground sm:text-lg">
          사업자 인증서는 통장이 있어야 나옵니다. 그런데 통장은 한 달에 하나, 사업자는 여러 개죠.{" "}
          사업자 10개, 어떻게 만드시겠어요?
        </p>

        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-foreground/75 sm:text-lg">
          통장 한 개도 더 안 만들고 인증서까지 만드는 법 —{" "}
          <span className="font-bold text-foreground">6/21 라이브 단 1회</span>로 끝냅니다.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <PaymentDialog
            label="6/21 라이브 자리 잡기"
            amount={tonggwan815.price}
            productKey={tonggwan815.productKey}
            deadline={tonggwan815.payDeadlineISO}
            deadlineLabel={tonggwan815.deadlineLabel}
            completePathPrefix="/815/complete"
            hidePromoBadges
            noticeCopy={
              <>
                이름과 휴대폰 번호를 입력하면 <span className="font-bold text-foreground">결제 페이지가 바로 열립니다.</span>{" "}
                결제 후 화면의 <span className="font-bold text-brand">‘입장 링크 받기’</span>로 카톡 오픈채팅방에 입장하세요. 6/21까지 방에서 챙겨드립니다.
              </>
            }
          />
          <CountdownTimer deadline={tonggwan815.payDeadlineISO} label={tonggwan815.deadlineLabel} />
          <p className="font-mono text-[11px] text-foreground/45">
            {tonggwan815.price.toLocaleString()}원 (부가세 포함) · 결제선생 안전결제
          </p>
        </div>

        {/* 신뢰 스트립 — 당사자성 팩트칩 */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Image
              src="/assets/face.jpg"
              alt="용감한 용팀장 — 현직 구매대행 셀러"
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-full object-cover grayscale"
            />
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {TRUST_CHIPS.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-foreground/20 px-3 py-1 text-[11px] font-bold"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm text-foreground/70">
            겁주려고 만든 페이지가 아닙니다.{" "}
            <span className="font-bold text-foreground">저도 막히는 당사자</span>라서 만들었습니다.
          </p>
        </div>

        {/* 스크롤 갈고리 → D+1 시뮬레이션 */}
        <p className="font-hand mt-8 -rotate-1 text-lg text-foreground/60">
          준비 안 하면 8월 16일 아침이 어떻게 시작되는지, 30초만 보세요 ↓
        </p>
      </div>
    </header>
  )
}
