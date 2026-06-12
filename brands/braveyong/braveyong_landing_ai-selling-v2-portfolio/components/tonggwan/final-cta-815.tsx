import Image from "next/image"
import { Section } from "@/components/section"
import { PaymentDialog } from "@/components/payment-dialog"
import { CountdownTimer } from "@/components/countdown-timer"
import { Signature } from "@/components/handwriting"
import { tonggwan815 } from "@/lib/products"

export function FinalCta815() {
  return (
    <Section
      id="final"
      tone="dark"
      title={
        <>
          8월 16일 아침 알림이 ‘통관 보류’일지{" "}
          {/* 버건디 손글씨 톤 — bg-foreground 위에선 기본 --brand가 너무 어두워 밝은 버건디로 보정 */}
          <span className="font-hand text-[oklch(0.62_0.16_18)]">‘발송 완료’</span>일지는, 6월의 당신이 정합니다.
        </>
      }
    >
      <div className="mx-auto max-w-xl text-center">
        <div className="space-y-4 text-base leading-relaxed text-background/80 sm:text-lg">
          <p>성과를 보장한다는 말은 안 합니다. 은행별로 다른 부분은 다르다고 그대로 말씀드립니다.</p>
          <p>
            겁만 주고 사라지지도 않습니다. 오늘 무료로 할 일(통관고유부호 조회)은 이미 드렸습니다. 그 다음 단계를 6월 21일
            밤에 끝내고 싶으면, 지금 자리를 잡으세요.
          </p>
          <p>약속은 하나 — 6/21 밤, ‘내일 뭘 해야 하는지’ 모르는 채로 끝나는 일은 없습니다.</p>
        </div>

        {/* 얼굴 + 서명 — 누가 약속하는지 */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <Image
            src="/assets/face.jpg"
            alt="용감한 용팀장"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full border border-background/30 object-cover grayscale"
          />
          <Signature className="text-background">용감한 용팀장</Signature>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4">
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
          <CountdownTimer
            className="text-background"
            deadline={tonggwan815.payDeadlineISO}
            label={tonggwan815.deadlineLabel}
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
