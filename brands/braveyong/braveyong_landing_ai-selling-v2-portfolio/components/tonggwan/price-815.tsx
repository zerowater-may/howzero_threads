import { Section } from "@/components/section"
import { PaymentDialog } from "@/components/payment-dialog"
import { tonggwan815 } from "@/lib/products"

export function Price815() {
  return (
    <Section id="price" tone="warm" label="PRICE" title={<>특강 한 번이, 인증서 비용보다 쌉니다</>}>
      <div className="mx-auto max-w-md border-2 border-foreground bg-background p-6 text-center">
        <p className="text-sm text-foreground/60">8.15 통관대응 라이브 특강 · 6/21(일)</p>
        <div className="mt-3 flex items-end justify-center gap-1">
          <span className="text-4xl font-bold tracking-tight">{tonggwan815.price.toLocaleString()}</span>
          <span className="mb-1 text-lg font-bold">원</span>
        </div>
        <p className="mt-1 font-mono text-xs text-foreground/50">
          공급가 {tonggwan815.supplyPrice.toLocaleString()}원 + 부가세 {tonggwan815.vat.toLocaleString()}원
        </p>
        <p className="mt-4 border-y border-foreground/10 py-3 text-sm leading-relaxed text-foreground/75">
          사업자 20개면 유료 인증서만 <span className="font-bold text-foreground">매년 40만원</span>.
          이 특강 한 번이 그보다 쌉니다.
        </p>
        <div className="mt-5">
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
        </div>
        <p className="mt-3 text-xs text-foreground/50">환불 정책은 결제 전 카톡으로 안내드립니다.</p>
      </div>
    </Section>
  )
}
