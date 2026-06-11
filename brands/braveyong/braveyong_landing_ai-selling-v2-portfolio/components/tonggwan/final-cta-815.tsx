import { Section } from "@/components/section"
import { PaymentDialog } from "@/components/payment-dialog"
import { tonggwan815 } from "@/lib/products"

export function FinalCta815() {
  return (
    <Section id="final" tone="dark" title={<>8.15는 기다려주지 않습니다</>}>
      <div className="mx-auto max-w-xl text-center">
        <p className="text-base leading-relaxed text-background/80 sm:text-lg">
          통장 0개, 인증서 0원. 단 한 번의 라이브로 끝내세요.
        </p>
        <div className="mt-7 flex justify-center">
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
            dark
          />
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-left text-[11px] leading-relaxed text-background/45">
          ⚠️ 본 특강은 일반 정보 제공용이며 개별 사안에 대한 법률·세무·관세 자문이 아닙니다.
          제도·은행 정책·세관 절차는 변경될 수 있으므로 실행 직전 관세청·관세사·세무사·해당 은행에 최신 내용을 확인하세요.
          특정 결과나 성과를 보장하지 않습니다.
        </p>
      </div>
    </Section>
  )
}
