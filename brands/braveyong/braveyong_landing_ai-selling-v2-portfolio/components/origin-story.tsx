import { Section } from "./section"
import { Marker } from "./handwriting"

/**
 * Origin Story — "왜 이 강의를 만들었나"
 * 인터뷰 자료 기반 타임라인. 매출/부동산 수치는 검증 전이라 노출 금지.
 * 사실: 회사 다니던 직장인 → 육아아빠 부업 → 효자상품 → 시스템·스터디.
 */
const timeline = [
  {
    year: "직장인 시절",
    head: "부동산도, 월급도 있었는데 — 매월 흐르는 돈은 따로였습니다.",
    body:
      "부동산 자산을 모으면 노후가 끝나는 줄 알았어요. 그런데 막상 살아보니, 매월 들어오는 돈은 또 다른 얘기더라고요. 자산은 묶여 있고, 아이는 크고, 학원비는 늘고. ‘자산이 있어도 매월 흐르는 돈은 따로 만들어야 한다’는 걸 그때 처음 알았습니다.",
  },
  {
    year: "부업 시작",
    head: "애 재우고, 새벽에 상품 올렸습니다.",
    body:
      "퇴근하고 아이 재우고 나서야 사이드 모니터 앞에 앉았습니다. 처음엔 1만 개씩 올리는 셀러들이 부러웠습니다. 따라했고, 시간만 빠져나갔습니다.",
  },
  {
    year: "효자상품 가공",
    head: "이미 올린 1만 개에서, 효자상품을 뽑아 가공해 왔습니다.",
    body:
      "처음엔 그저 1만 개를 따라 올렸습니다. 그중 몇 개가 검색에 잡히기 시작했고, 그 상품들을 키워드·상품명·이미지·등록 전 체크부터 다시 가공했습니다. 한 상품을 효자상품으로 키우는 패턴을 익히고, 같은 방식으로 다음 후보를 계속 늘려가는 중입니다.",
  },
  {
    year: "SEO·시스템화",
    head: "상품명 하루씩 만들고, 순위로 검증했습니다.",
    body:
      "느낌이 아니라 순위 모니터링으로 확인했습니다. CS는 일부러 오후 4시 이후엔 보지 않았습니다. 가족 시간을 지키려면 시스템부터 만들어야 부업이 부업으로 남는다는 걸 배웠습니다.",
  },
  {
    year: "오프라인 실전반",
    head: "혼자 막혔던 4주를, 같이 풀어드리려고 만들었습니다.",
    body:
      "강의 한 번 듣고 끝나는 시장이 아닙니다. 그래서 4주 동안 효자상품 10개를 같이 만들고, 졸업 후에도 매월 같이 업데이트합니다.",
  },
]

export function OriginStory() {
  return (
    <Section
      label="왜 이 강의를 만들었나"
      title={
        <>
          저도 처음엔 <Marker>1만 개를 올리는 셀러</Marker>였습니다.
        </>
      }
      lead="용팀장이 직접 걸어온 길. 매출 자랑이 아니라, 같은 길을 4주로 줄여드리려고 만든 강의입니다."
    >
      <ol className="relative space-y-6 border-l-2 border-foreground/15 pl-6 sm:pl-8">
        {timeline.map((t, i) => (
          <li key={t.year} className="relative">
            {/* 타임라인 도트 */}
            <span
              className="absolute -left-[34px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-foreground bg-background text-[10px] font-bold sm:-left-[42px]"
              aria-hidden
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="border-l-4 border-foreground bg-background p-5 sm:p-6">
              <div className="font-mono mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/55">
                {t.year}
              </div>
              <h3 className="mb-2 text-base font-bold tracking-tight sm:text-lg">{t.head}</h3>
              <p className="text-sm leading-relaxed text-foreground/70 sm:text-base">{t.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-6 text-xs text-foreground/55 sm:text-sm">
        ※ 본 페이지는 수익을 단정하거나 매출을 보장하지 않습니다. 위 내용은 강사가 직접 걸어온 과정의 사실 기반 요약이며, 결과는 사람마다 다릅니다.
      </p>
    </Section>
  )
}
