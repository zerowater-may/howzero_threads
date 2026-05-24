import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Section } from "./section"

/** 17 FAQ — 12문항 */
const faqs = [
  {
    q: "초보도 가능한가요?",
    a: "네. 오히려 초보일수록 잘못된 습관이 안 굳어 있어서 처음부터 효자상품 기준으로 시작하기 좋아요. 1주차에 현재 방식·시간·마진·노출 상태부터 같이 보고, 살릴 상품과 버릴 상품을 함께 골라드립니다.",
  },
  {
    q: "아직 상품을 많이 안 올려봤어도 가능한가요?",
    a: "가능합니다. 등록 수가 적어도 6주 동안 효자상품 10개를 함께 만들어 갑니다. 새 상품 소싱부터 시작해도 됩니다.",
  },
  {
    q: "이미 대량등록으로 올린 상품이 있어도 괜찮나요?",
    a: "괜찮습니다. 오히려 좋아요. 그동안 올린 1만 개 중에 검색에 잡힌 게 분명 있을 거고, 거기서 살릴 상품을 골라 키워드·상품명부터 다시 가공해 효자상품으로 키웁니다. 처음부터 새 상품을 소싱하셔도 됩니다.",
  },
  {
    q: "새 상품 소싱부터 해도 되나요?",
    a: "됩니다. 신청서에서 ‘기존 상품 개선’과 ‘새 상품 제작’ 중 무엇이 필요한지 받고, 그에 맞춰 진행합니다.",
  },
  {
    q: "AI를 잘 몰라도 따라갈 수 있나요?",
    a: "네. AI는 대신 벌어주는 도구가 아니라, 내가 하던 판단을 더 빠르게 반복하게 만드는 시스템입니다. 그래서 툴 사용법이 아니라 ‘쓰는 구조’를 같이 만들고, 현장에서 따라 칩니다.",
  },
  {
    q: "6주 동안 실제로 무엇을 완성하나요?",
    a: "효자상품 10개(직접), 내 스토어 진단표, 개인 AI 셀링 템플릿, 등록 전 체크리스트, 졸업 후 30일 실행 계획. 지식 노트가 아니라 손에 남는 결과물입니다.",
  },
  {
    q: "효자상품 10개는 매출을 보장한다는 뜻인가요?",
    a: "효자상품 10개는 매출 보장 표현이 아닙니다. 용팀장 기준으로 키워드, 카테고리, 상품명, 대표이미지, 상세페이지, 가격, 등록 전 체크가 갖춰진 상품 10개를 6주 동안 직접 완성한다는 의미입니다.",
  },
  {
    q: "오프라인 참석을 못 하는 주가 있으면 어떻게 되나요?",
    a: "줌 보강 5회와 매주 과제로 보완합니다. 다만 오프라인 실전반 특성상, 6주 중 대부분 참석이 가능한 분을 신청서에서 확인합니다.",
  },
  {
    q: "줌 보강은 어떤 방식으로 진행되나요?",
    a: "오프라인 사이 중간 과제를 점검하고 막힌 부분을 보강하는 온라인 세션입니다. 6주 동안 총 5회 진행합니다.",
  },
  {
    q: "졸업 후 스터디는 필수인가요?",
    a: "아닙니다. 강제 참여가 아니라 의지 있는 분만 참여하는 선택 과정입니다. 1기 수강생은 우선 참여권을 드리고, 비용·일정은 졸업 시점에 개별 안내드립니다.",
  },
  {
    q: "결제는 어떻게 하나요?",
    a: "신청서를 검토한 뒤, 참여 확정자에게만 결제 링크와 입금 정보를 개별 안내드립니다. 카드 결제·계좌이체 모두 가능하고, 분할 여부도 그때 함께 안내드립니다. 페이지에 금액을 노출하지 않는 이유는 ‘아무나 받지 않는다’는 원칙을 지키기 위해서입니다.",
  },
  {
    q: "환불 기준은 어떻게 되나요?",
    a: "환불 기준은 확정 후 안내드립니다. (운영 입력 필요 — 확정 전까지 표기)",
  },
]

export function FAQ() {
  return (
    <Section id="faq" label="자주 묻는 질문" title="FAQ">
      <Accordion type="single" collapsible className="space-y-2">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`q${i}`} className="border-2 border-foreground bg-background">
            <AccordionTrigger className="px-5 py-4 text-left hover:no-underline">
              <span className="flex items-start gap-3 text-sm font-bold sm:text-base">
                <span className="font-mono mt-0.5 text-xs font-bold text-foreground/55">
                  Q{String(i + 1).padStart(2, "0")}.
                </span>
                <span className="flex-1">{f.q}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5 text-sm leading-relaxed text-foreground/75">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  )
}
