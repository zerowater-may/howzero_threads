import { Section } from "@/components/section"

/**
 * 정책 윈도우 — "지금은 되지만 언제까지 될지 모른다"는 긴급성.
 * 정직 가드: '곧 막힌다'로 단정하지 않는다 — 정책은 바뀔 수 있다/되는 지금이 확실, 까지만.
 * (단정했다가 안 막히면 페이지 전체의 '성과 보장 안 함' 신뢰가 깨진다)
 */
export function PolicyWindow815() {
  return (
    <Section
      id="policy-window"
      tone="warm"
      label="WHY NOW"
      title={<>지금은 됩니다. 문제는, 언제까지 될지 아무도 모른다는 겁니다.</>}
    >
      <div className="mx-auto max-w-2xl space-y-4 text-base leading-relaxed text-foreground/80 sm:text-lg">
        <p>
          이 방법은 <span className="font-bold text-foreground">은행 정책에 기대는 길</span>입니다. 은행 정책은
          예고 없이 바뀔 수 있고, 사람이 몰리면 조여지기도 합니다.
        </p>
        <p>
          ‘곧 막힌다’고 단정하지는 않겠습니다 — 그건 아무도 모릅니다. 다만 확실한 건 하나,{" "}
          <span className="font-bold text-foreground">지금은 된다는 것</span>뿐입니다.
        </p>
        <p className="font-bold text-foreground">
          되는 지금이 가장 확실합니다. 오늘 배우고, 내일 바로 발급받으세요.
        </p>
      </div>
    </Section>
  )
}
