"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Section } from "./section"
import { course } from "@/lib/config"

/** 08 5주 커리큘럼 — Accordion */
const weeks = [
  {
    n: 1,
    title: "대량등록 탈출 진단",
    sub: "지금 상태를 숫자로 본다",
    topics: [
      "현재 방식, 시간, 마진, 노출 상태 진단",
      "살릴 상품과 버릴 상품 기준 정리",
      "5주 실행 목표 설정",
    ],
    outputs: ["내 스토어 진단표", "효자상품 기준표 초안", "5주 개인 실행 목표"],
    scene:
      "강의실 모니터에 각자 스토어를 띄워 놓고, 1만 개 중 살릴 상품과 버릴 상품을 같이 골라냅니다.",
  },
  {
    n: 2,
    title: "상품 선정 · 키워드 · 카테고리",
    sub: "감 소싱을 줄인다",
    topics: [
      "감 소싱을 줄이고 검색 의도와 경쟁 구조 확인",
      "카테고리와 상품명 기준 정리",
      "효자상품 2개 설계",
    ],
    outputs: ["후보 상품 리스트", "키워드 맵", "상품명 초안"],
    scene:
      "용팀장 사례: 그동안 따라 올린 상품 중에서 검색에 잡힌 몇 개를 어떻게 가공해 효자상품으로 키웠는지, 그 과정을 같이 풀어 봅니다.",
  },
  {
    n: 3,
    title: "AI 상세페이지 설계",
    sub: "예쁜 게 아니라 팔리는 순서",
    topics: [
      "예쁜 상세페이지가 아니라 구매 이유와 불안 제거 순서로 기획",
      "고객 고통, 대표 이미지, 상세페이지 스토리보드 작성",
    ],
    outputs: ["상세페이지 스토리보드", "이미지/카피 프롬프트", "효자상품 추가 제작"],
    scene:
      "디자인 잘 만든 페이지가 아니라, 고객 고통 → 해결 → 불안 제거 순서로 짠 페이지가 왜 더 팔리는지 시연합니다.",
  },
  {
    n: 4,
    title: "등록 · 대표이미지 · 전환 체크",
    sub: "등록 가능한 세트 완성",
    topics: ["상품명, 대표이미지, 상세페이지, 가격, 배송/CS 문구 점검", "등록 가능한 상품 세트 완성"],
    outputs: ["등록 가능한 상품 세트", "등록 전 체크리스트", "효자상품 추가 제작"],
    scene:
      "순위 모니터링 화면을 띄워 놓고, 각자의 상품명을 한 줄씩 고쳐 가면서 키워드별 노출이 어떻게 바뀌는지 확인합니다.",
  },
  {
    n: 5,
    title: "AI 반복 루틴 + 효자상품 10개 점검 · 다음 30일",
    sub: "마무리 + 졸업 후 계획 (5+6주차 통합)",
    topics: [
      "상품 분석·상품명 개선·상세페이지 초안·CS 답변·체크리스트 템플릿화",
      "다음 상품도 같은 기준으로 만들 수 있는 작업 루틴 정리",
      "효자상품 10개 최종 점검",
      "노출·클릭·문의·주문·순수익 관점의 개선 기준 정리",
      "졸업 후 30일 실행 계획 수립",
    ],
    outputs: ["개인 AI 셀링 템플릿", "효자상품 10개", "30일 실행 계획", "개선 우선순위"],
    scene:
      "오후 4시 이후 CS 알림을 끄는 시스템처럼 루틴을 같이 짜고, 마지막으로 효자상품 10개를 한 줄씩 같이 점검합니다. 졸업이 끝이 아니에요. 매월 오프라인 스터디로 정책·시장 변화에 맞춰 같이 업데이트합니다.",
  },
]

export function Curriculum() {
  return (
    <Section
      id="curriculum"
      label="5주 커리큘럼"
      title={<>오프라인 {course.offlineCount}회 + 줌 보강 {course.zoomCount}회</>}
      lead="오프라인에서는 현장에서 같이 작업하고 피드백 드리고요. 줌 보강에선 중간 과제를 점검합니다. 매주 손에 작업물이 쌓이는 식이에요."
    >
      <Accordion type="single" defaultValue="w1" collapsible className="border-2 border-foreground bg-background">
        {weeks.map((w) => (
          <AccordionItem key={w.n} value={`w${w.n}`} className="border-b-2 border-foreground last:border-b-0">
            <AccordionTrigger className="px-5 py-5 text-left hover:no-underline">
              <div className="flex w-full items-center gap-4">
                <div className="font-mono flex h-10 w-10 flex-none flex-col items-center justify-center bg-foreground text-background">
                  <span className="text-base font-bold leading-none">{w.n}</span>
                  <span className="text-[8px] opacity-70">WEEK</span>
                </div>
                <div className="flex-1">
                  <div className="text-base font-bold tracking-tight sm:text-lg">{w.title}</div>
                  <div className="text-xs text-foreground/55">{w.sub}</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <div className="grid gap-5 border-t border-foreground/15 pt-4 sm:grid-cols-2">
                <div>
                  <div className="font-mono mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/55">
                    다룹니다
                  </div>
                  <ul className="space-y-1.5">
                    {w.topics.map((t, i) => (
                      <li key={i} className="relative pl-4 text-sm text-foreground/75 before:absolute before:left-0 before:top-2.5 before:h-px before:w-2 before:bg-foreground/55">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-mono mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/55">
                    산출물
                  </div>
                  <ul className="space-y-1.5">
                    {w.outputs.map((o, i) => (
                      <li key={i} className="relative pl-4 text-sm text-foreground before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-foreground">
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* 인터뷰 scene — 그 주차에 실제로 무엇을 같이 하는지 한 줄 */}
              <div className="mt-5 border-l-4 border-foreground bg-[var(--warm)] p-4 text-sm leading-relaxed text-foreground">
                <span className="font-mono mr-2 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/55">
                  현장 장면
                </span>
                {w.scene}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  )
}
