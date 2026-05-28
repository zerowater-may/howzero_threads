import Link from "next/link"
import { ArrowUpRight, CheckCircle2 } from "lucide-react"
import { Section } from "./section"
import { config } from "@/lib/config"

const paths = [
  {
    tag: "아직 초보",
    title: "상품을 거의 안 올려봤다면",
    body: "먼저 팔릴 후보 2개를 고르고, 카테고리·상품명·대표이미지 기준부터 잡습니다.",
    output: "첫 등록 전 체크리스트",
  },
  {
    tag: "대량등록 경험",
    title: "이미 많이 올렸는데 안 팔린다면",
    body: "무작정 새로 올리지 말고, 검색에 잡힌 상품부터 골라 키워드와 상품 구조를 다시 가공합니다.",
    output: "살릴 상품 선별표",
  },
  {
    tag: "구매대행·위탁",
    title: "구매대행/위탁판매를 하고 있다면",
    body: "배송·가격·상세페이지 리스크를 빼고, 고객이 실제로 검색하는 말로 다시 정리합니다.",
    output: "등록 전 리스크 점검",
  },
  {
    tag: "직장·육아 병행",
    title: "시간이 가장 부족하다면",
    body: "매주 2개만 끝내는 루틴으로 쪼갭니다. 오프라인 사이에는 줌 보강으로 막힌 부분만 풉니다.",
    output: "주 2개 실행 루틴",
  },
]

export function SituationChoice() {
  return (
    <Section
      id="choice"
      tone="warm"
      label="내 상황별 시작점"
      title={
        <>
          같은 강의를 들어도,
          <span className="block sm:inline"> 시작점은 달라야 합니다.</span>
        </>
      }
      lead="결제 전에 먼저 봐야 하는 건 커리큘럼이 아니라, 지금 내 스토어가 어디에서 막혔는지입니다."
    >
      <div className="grid gap-3 md:grid-cols-2">
        {paths.map((path) => (
          <article
            key={path.tag}
            className="border-2 border-foreground bg-background p-5 transition-transform hover:-translate-y-1 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/55">
                {path.tag}
              </span>
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-lg font-bold leading-snug tracking-tight sm:text-xl">
              {path.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground/70 sm:text-base">
              {path.body}
            </p>
            <div className="mt-5 border-t border-foreground/15 pt-4 text-sm font-bold text-foreground">
              5주 안에 남길 것: {path.output}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 border-2 border-foreground bg-foreground p-6 text-background sm:p-8">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
              내 상황에 맞는 시작점은 신청서에서 먼저 봅니다.
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-background/75 sm:text-base">
              그래서 바로 결제 페이지로 밀지 않습니다. 지금 상품 수, 판매 경험, 막힌 지점을 먼저 보고
              5주 안에 같이 만들 수 있는지 확인합니다.
            </p>
          </div>
          <Link
            href={config.googleFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="내 상황 적고 1기 안내받기 — 새 창에서 열림"
            data-track="choice_apply"
            className="group inline-flex items-center justify-center gap-2 rounded-full border-2 border-background bg-background px-6 py-3 text-sm font-bold text-foreground transition-all hover:bg-foreground hover:text-background sm:text-base"
          >
            내 상황 적고 안내받기
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </Section>
  )
}
