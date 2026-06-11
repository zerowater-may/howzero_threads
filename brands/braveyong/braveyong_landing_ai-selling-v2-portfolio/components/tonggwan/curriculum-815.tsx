import { Section } from "@/components/section"

const OUTCOMES: [string, string][] = [
  ["내가 등록 대상인지 3초 판별", "구매대행·배대지·판매중개·재등록 — 어디에 걸리는지 바로 확인"],
  ["통장 0개로 기업뱅킹 가입 → 무료 인증서 발급", "은행 고객센터·지점에 그대로 읽는 문의 멘트까지"],
  ["막혔을 때 빠지는 3가지 우회로", "금융인증서 / 세관 직접 제출 / 유료 최후수단 — 어떤 은행에서 막혀도 등록 완료"],
  ["UNI-PASS 부호 등록 5단계", "회원가입 → 신청서 작성 → 서류 첨부 → 처리현황 확인 → 부호 발급"],
  ["사업자 수십 개, 하루에 끝내는 대량 처리", "한 은행 통일 · 서류 일괄 세팅 · 비대면 우선 처리 전략"],
  ["사업자별 처리현황 체크리스트", "누락 0으로 8.15 전 전 사업자 부호 발급 확인"],
]

export function Curriculum815() {
  return (
    <Section
      id="curriculum"
      label="WHAT YOU GET"
      title={<>6/21 이후, 당신이 할 수 있게 되는 것</>}
      lead="원본 스텝바이스텝을 라이브로, 막히는 지점마다 바로 풀면서 진행합니다."
    >
      <div className="grid gap-px overflow-hidden border-2 border-foreground sm:grid-cols-2">
        {OUTCOMES.map(([t, d], i) => (
          <div key={i} className="bg-background p-5">
            <div className="font-mono text-sm font-bold text-brand">{String(i + 1).padStart(2, "0")}</div>
            <h3 className="mt-2 text-base font-bold leading-snug">{t}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">{d}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
