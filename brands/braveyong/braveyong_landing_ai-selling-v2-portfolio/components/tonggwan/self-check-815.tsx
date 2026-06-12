import { Section } from "@/components/section"

/**
 * 셀프 체크 — "나는 대상인가?"를 2×2 체크카드로 즉답.
 * 핵심: '예전에 등록했다'도 재등록 대상임을 못 박고, 통장 공포 해소 섹션으로 갈고리 연결.
 */
type CheckItem = {
  text: string
  stamp: string
  sub?: string
}

const ITEMS: CheckItem[] = [
  { text: "구매대행 사업자가 1개라도 있다", stamp: "대상" },
  { text: "사업자가 5개, 10개, 30개다", stamp: "전부 각각 대상" },
  { text: "배대지·위탁·중개로 해외 물건을 들여온다", stamp: "대상" },
  {
    text: "예전에 구매대행 등록 다 해놨다",
    stamp: "재등록 대상",
    sub: "‘예전에 했으니 괜찮다’가 제일 위험합니다.",
  },
]

export function SelfCheck815() {
  return (
    <Section
      id="self-check"
      tone="light"
      label="SELF CHECK"
      title={<>하나라도 해당되면, 8월, 당신 차례입니다.</>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {ITEMS.map((item) => (
          <div key={item.text} className="flex items-start gap-4 border-2 border-foreground p-5">
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-foreground text-lg font-bold"
            >
              ✓
            </span>
            <div className="flex-1">
              <p className="text-base font-bold leading-snug">{item.text}</p>
              {item.sub && <p className="mt-1.5 text-xs text-foreground/55">{item.sub}</p>}
            </div>
            <span className="shrink-0 whitespace-nowrap rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-brand-foreground">
              {item.stamp}
            </span>
          </div>
        ))}
      </div>

      {/* 갈고리 → 다음 섹션 (답은 흘리지 않는다) */}
      <p className="mt-8 max-w-2xl text-base leading-relaxed text-foreground/75 sm:text-lg">
        체크했다면 다음 질문은 하나죠 — ‘그럼 통장 또 만들어야 하나?’{" "}
        <span className="font-bold text-foreground">그 질문의 답이 오늘 페이지의 전부입니다. 계속 내려보세요.</span>
      </p>
    </Section>
  )
}
