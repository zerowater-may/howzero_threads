import { Section } from "@/components/section"
import { CountdownTimer } from "@/components/countdown-timer"
import { tonggwan815 } from "@/lib/products"

const TIMELINE: [string, string][] = [
  ["오늘", "서류 폴더 세팅 + 거래은행 '개인계좌 연결' 가능 여부 확인"],
  ["1~3일", "기업뱅킹 가입 → 무료 사업자 인증서 발급 (사업자 단위 반복)"],
  ["3~5일", "UNI-PASS 사업자 회원가입 + 부호 등록 신청"],
  ["8.15 전", "전 사업자 부호 발급 확인 → 통관플랫폼 대비 완료"],
]

export function Scarcity815() {
  return (
    <Section
      id="scarcity"
      tone="dark"
      label="DEADLINE"
      title={<>자리도, 시간도 정해져 있습니다</>}
      lead={`라이브 Q&A 품질을 위해 선착순 ${tonggwan815.capacity}명으로 닫습니다. 그리고 8.15는 협상이 안 됩니다.`}
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex flex-col items-center gap-2 border border-background/15 bg-background/[0.05] p-5 text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/55">결제 마감</span>
          <CountdownTimer className="text-background" deadline={tonggwan815.payDeadlineISO} label="결제 마감까지" />
        </div>
        <ol className="space-y-2">
          {TIMELINE.map(([when, what]) => (
            <li key={when} className="flex flex-col gap-1 border-l-2 border-brand pl-4 sm:flex-row sm:gap-4">
              <span className="font-mono w-20 shrink-0 text-sm font-bold text-brand">{when}</span>
              <span className="text-sm leading-relaxed text-background/85">{what}</span>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}
