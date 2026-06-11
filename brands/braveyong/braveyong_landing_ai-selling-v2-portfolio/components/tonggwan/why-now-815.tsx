import { Section } from "@/components/section"

const CHAIN = [
  "8.15 전자상거래 전용 통관플랫폼 개통",
  "전자상거래업자 '부호'가 수입신고서·통관목록 필수기재 — 없으면 통관 불가",
  "부호 발급 = UNI-PASS 사업자 회원가입 (사업자용 인증서 필요)",
  "무료 인증서 = 기업인터넷뱅킹 가입이 전제",
  "기업뱅킹 가입 = 출금(연결)계좌 필요 → 새 사업자통장은 20영업일 룰에 막힘",
]

export function WhyNow815() {
  return (
    <Section
      id="why-now"
      tone="dark"
      label="WHY NOW"
      title={<>왜 지금 이게 문제냐면</>}
      lead="하나가 막히면 그 아래가 전부 막히는 구조입니다. 병목은 '인증서'예요."
    >
      <ol className="mx-auto max-w-2xl space-y-3">
        {CHAIN.map((step, i) => (
          <li key={i} className="flex gap-4 border border-background/15 bg-background/[0.04] p-4">
            <span className="font-mono shrink-0 text-sm font-bold text-background/50">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-sm leading-relaxed sm:text-base">{step}</span>
          </li>
        ))}
      </ol>
      <p className="mx-auto mt-6 max-w-2xl border-l-2 border-brand bg-background/[0.06] px-4 py-3 text-sm leading-relaxed">
        "예전에 등록했으니 괜찮다" ❌ — 기존 구매대행업자도 <span className="font-bold">신규 시스템에서 재등록 대상</span>입니다.
      </p>
    </Section>
  )
}
