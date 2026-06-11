import { PaymentDialog } from "@/components/payment-dialog"
import { CountdownTimer } from "@/components/countdown-timer"
import { Marker } from "@/components/handwriting"
import { tonggwan815 } from "@/lib/products"

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
          8월 15일, 부호 없으면<br />
          당신 구매대행은 <Marker>통관에서 멈춥니다.</Marker>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-foreground/75 sm:text-lg">
          통장 한 개도 더 안 만들고, 인증서 비용 <span className="font-bold text-foreground">0원</span>으로
          전자상거래업자 부호를 끝내는 법. <br className="hidden sm:block" />
          6월 21일(일) 단 한 번의 라이브 특강.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <PaymentDialog
            label="6/21 라이브 자리 잡기"
            amount={tonggwan815.price}
            productKey={tonggwan815.productKey}
            deadline={tonggwan815.payDeadlineISO}
            deadlineLabel={tonggwan815.deadlineLabel}
            completePathPrefix="/815/complete"
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
      </div>
    </header>
  )
}
