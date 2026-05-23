import { Section } from "./section"
import { Users, Coins, Check } from "lucide-react"
import { course } from "@/lib/config"

/** 15 소수정예 한정 — 워밍 톤(유일). 카운트다운/거짓 잔여석 금지. */
const items = [
  {
    Icon: Users,
    title: `${course.capacityMin}~${course.capacityMax}명 소수정예`,
    body: "현장에서 직접 봐주려면 인원이 물리적으로 한정됩니다.",
  },
  {
    Icon: Coins,
    title: "1기 실행자 특별가",
    body: "1기에만 적용되는 가격이 있습니다. 2기 이후는 상향됩니다. 정확한 금액은 신청서 검토 후 개별 안내드립니다.",
  },
  {
    Icon: Check,
    title: "선착순 아닌 선별",
    body: "신청서 검토 후, 맞는 분에게만 참여·결제 안내를 드립니다.",
  },
]

export function Scarcity() {
  return (
    <Section tone="warm" label="1기 한정" title={<>왜 아무나 못 받는지.</>} lead="압박을 위한 가짜 마감이 아니라, 오프라인 실전반이라서 생기는 진짜 제약입니다.">
      <div className="grid gap-3 md:grid-cols-3">
        {items.map(({ Icon, title, body }) => (
          <div key={title} className="border-2 border-[var(--warm-border)] bg-background p-5">
            <Icon className="h-5 w-5 text-[var(--warm-border)]" />
            <h3 className="mt-3 text-base font-bold tracking-tight">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">{body}</p>
          </div>
        ))}
      </div>

      {/* 인터뷰 톤 — 강의 쇼핑 굴레에서 빠져나오자는 정직한 한 줄 */}
      <p className="font-memo mt-6 text-base leading-relaxed text-foreground/80 sm:text-lg">
        매번 다른 강의를 또 결제하고, 또 혼자 막히는 자리에 돌아오지 마세요.<br />
        한 번 제대로, 같이 끝까지 갑니다.
      </p>
    </Section>
  )
}
