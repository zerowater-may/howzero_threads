import { Section } from "./section"
import { ScribbleCircle } from "./handwriting"
import { Check } from "lucide-react"

/**
 * 07 핵심 결과물 — 효자상품 10개 + 손그림 동그라미 + 7요소 + 가드
 *
 * 7요소는 하나씩 나열한다. 전에는 "키워드 · 카테고리"처럼 둘씩 묶어 4줄로 뒀는데,
 * 본문은 "아래 7가지"라고 하고 화면엔 4줄만 보여서 세어보면 어긋났다.
 * FAQ의 효자상품 정의(7가지 열거)와도 이제 같은 항목·같은 순서다.
 */
const elements = [
  "키워드",
  "카테고리",
  "상품명",
  "대표이미지",
  "상세페이지",
  "가격",
  "등록 전 체크",
]
const howto = [
  ["상품 선정 프레임은 제가 직접", " 드려요."],
  ["매주 과제로 1~2개씩", " 같이 만들어요."],
  ["기존 상품 개선·새 상품 소싱", " 어디부터 시작하셔도 됩니다."],
  ["4주 동안 총 10개", " 본인 손으로 완성해요."],
]

export function Outcome() {
  return (
    <Section
      label="핵심 결과물"
      title={
        <>
          4주 동안 효자상품 <ScribbleCircle><span className="text-foreground">10개</span></ScribbleCircle>를 함께 만듭니다.
        </>
      }
    >
      <div className="mb-6 border-l-4 border-foreground bg-background p-6">
        <p className="text-lg font-bold leading-snug sm:text-xl">
          처음부터 100개, 1000개를 효자상품으로 만드는 건 사실상 불가능해요.<br />
          그래서 4주 동안 먼저 10개부터 같이 만들어 갑니다.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="border-2 border-foreground bg-background p-6">
          <h3 className="mb-3 text-lg font-bold tracking-tight">효자상품의 정의</h3>
          <p className="mb-4 text-sm leading-relaxed text-foreground/70">
            여기서 말하는 효자상품은 무작정 올린 상품이 아니에요. 아래 7가지가 다 맞춰진 상품을 말합니다.
          </p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {elements.map((e, i) => (
              <li
                key={e}
                className={`flex items-start gap-2.5 text-sm ${i === elements.length - 1 ? "col-span-2" : ""}`}
              >
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
        <span className="font-bold">용팀장 기준으로 팔릴 구조를 갖춘 상품 10개를 4주 동안 직접 완성한다</span>는 의미입니다.
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
          한 상품을 효자상품으로 키우는 패턴이 손에 잡히니까,<br />
          <span className="font-bold text-foreground">같은 방식으로 다음 후보를 계속 늘려가는 중</span>이에요.<br />
          이걸 4주 동안 같이 해보는 게 이번 강의입니다.
        </p>
      </div>
    </Section>
  )
}
