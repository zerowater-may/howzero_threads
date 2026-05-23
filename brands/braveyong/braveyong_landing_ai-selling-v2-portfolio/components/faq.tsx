import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Section } from "./section"

/** 17 FAQ — 12문항 */
const faqs = [
  {
    q: "초보도 가능한가요?",
    a: "네. 1주차에 현재 방식·시간·마진·노출 상태를 먼저 진단하고, 살릴 상품과 버릴 상품 기준을 잡습니다. 초보일수록 잘못된 습관 없이 처음부터 효자상품 기준으로 시작할 수 있습니다.",
  },
  {
    q: "아직 상품을 많이 안 올려봤어도 가능한가요?",
    a: "가능합니다. 등록 수가 적어도 6주 동안 효자상품 10개를 함께 만들어 갑니다. 새 상품 소싱부터 시작해도 됩니다.",
  },
  {
    q: "이미 대량등록으로 올린 상품이 있어도 괜찮나요?",
    a: "괜찮습니다. 기존 상품 개선과 새 상품 제작을 모두 허용합니다. 1주차 진단에서 살릴 상품을 골라 효자상품으로 다시 만듭니다.",
  },
  {
    q: "새 상품 소싱부터 해도 되나요?",
    a: "됩니다. 신청서에서 ‘기존 상품 개선’과 ‘새 상품 제작’ 중 무엇이 필요한지 받고, 그에 맞춰 진행합니다.",
  },
  {
    q: "AI를 잘 몰라도 따라갈 수 있나요?",
    a: "네. 툴 사용법 자체가 목적이 아닙니다. 상품 선정·SEO·상품명·상세페이지·등록 전 체크를 AI로 빠르게 반복하는 구조를 현장에서 함께 따라 만듭니다.",
  },
  {
    q: "6주 동안 실제로 무엇을 완성하나요?",
    a: "효자상품 10개, 개인 AI 셀링 템플릿, 등록 전 체크리스트, 졸업 후 30일 실행 계획을 완성합니다.",
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
    a: "아닙니다. 강제 참여가 아니라 의지 있는 분만 참여하는 선택 과정입니다(3개월 15만원). 1기 수강생은 졸업 후 스터디 우선 참여권을 드립니다.",
  },
  {
    q: "결제는 어떻게 하나요?",
    a: "카드 결제와 계좌이체가 가능합니다. 분할 가능 여부는 결제 안내 시 별도로 안내드립니다. 실제 결제 링크 또는 입금 안내는 신청서 검토 후 참여 확정자에게만 발송합니다.",
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
