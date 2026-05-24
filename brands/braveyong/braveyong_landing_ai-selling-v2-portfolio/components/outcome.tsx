import { Section } from "./section"
import { ScribbleCircle } from "./handwriting"
import { Check } from "lucide-react"

/** 07 핵심 결과물 — 효자상품 10개 + 손그림 동그라미 + 7요소 + 가드 */
const elements = ["키워드 · 카테고리", "상품명 · 대표이미지", "상세페이지 · 가격", "등록 전 체크까지 맞춰진 상품"]
const howto = [
  ["용팀장이 상품 선정 프레임", "을 제공합니다."],
  ["매주 과제로 1~2개씩", " 만듭니다."],
  ["기존 상품 개선과 새 상품 소싱", "을 모두 허용합니다."],
  ["6주 동안 총 10개", "를 완성합니다."],
]

export function Outcome() {
  return (
    <Section
      label="핵심 결과물"
      title={
        <>
          6주 동안 효자상품 <ScribbleCircle><span className="text-foreground">10개</span></ScribbleCircle>를 함께 만듭니다.
        </>
      }
    >
      <div className="mb-6 border-l-4 border-foreground bg-background p-6">
        <p className="text-lg font-bold leading-snug sm:text-xl">
          처음부터 1000개 효자상품을 만드는 건 불가능합니다.<br />
          그래서 6주 동안 먼저 효자상품 10개를 함께 만듭니다.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="border-2 border-foreground bg-background p-6">
          <h3 className="mb-3 text-lg font-bold tracking-tight">효자상품의 정의</h3>
          <p className="mb-4 text-sm leading-relaxed text-foreground/70">
            여기서 말하는 효자상품은 무작정 올린 상품이 아닙니다. 아래 7가지가 맞춰진 상품입니다.
          </p>
          <ul className="space-y-2.5">
            {elements.map((e) => (
              <li key={e} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 h-4 w-4 flex-none" />
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-2 border-foreground bg-background p-6">
          <h3 className="mb-3 text-lg font-bold tracking-tight">어떻게 만드나요</h3>
          <ul className="space-y-2.5">
            {howto.map(([strong, rest], i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 h-4 w-4 flex-none" />
                <span>
                  <span className="font-bold">{strong}</span>
                  {rest}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 border border-[var(--warm-border)] bg-[var(--warm)] p-5 text-sm leading-relaxed">
        <span className="font-bold">참고하세요.</span> ‘효자상품 10개’는 매출을 보장하는 표현이 아닙니다.
        이 페이지에서 효자상품 10개는{" "}
        <span className="font-bold">용팀장 기준으로 팔릴 구조를 갖춘 상품 10개를 6주 동안 직접 완성한다</span>는 의미입니다.
      </div>

      {/* 인터뷰 scene: 효자상품은 발견이 아니라 가공 — Origin Story 03과 톤 통일 */}
      <div className="mt-8 border-l-4 border-foreground bg-background p-6 sm:p-8">
        <div className="font-mono mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/55">
          제가 효자상품을 만드는 방식
        </div>
        <p className="text-base leading-relaxed text-foreground/85 sm:text-lg">
          저도 처음엔 1만 개를 따라 올렸습니다. 그게 다 효자상품이 되진 않았습니다.<br />
          다만 그중 <span className="font-bold text-foreground">검색에 잡히기 시작한 몇 개</span>가 데이터로 보이기 시작했어요.
        </p>
        <p className="mt-4 text-base leading-relaxed text-foreground/85 sm:text-lg">
          감이나 우연으로 '필요한 상품을 찾아서'가 아니에요.{" "}
          <span className="font-bold text-foreground">이미 올린 데이터 중에서 검색에 잡힌 상품</span>을 골라,
          키워드 의도·경쟁·카테고리를 다시 보고, 상품명·대표이미지·상세페이지·등록 전 체크를 처음부터 다시 가공해서{" "}
          <span className="marker">키워드별 1페이지</span>까지 올렸습니다.
        </p>
        <p className="font-memo mt-5 text-sm leading-relaxed text-foreground/70 sm:text-base">
          한 상품을 효자상품으로 키우는 패턴이 손에 잡히니,<br />
          <span className="font-bold text-foreground">같은 방식으로 다음 후보를 계속 늘려가는 중</span>입니다.<br />
          이걸 6주 동안 같이 합니다.
        </p>
      </div>
    </Section>
  )
}
