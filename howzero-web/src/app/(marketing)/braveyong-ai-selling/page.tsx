import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  MapPin,
  PackageCheck,
  Search,
  ShieldCheck,
  Store,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "용팀장 AI 셀링 오프라인 실전반 — 효자상품 10개 만들기",
  description:
    "상품만 계속 올리던 초보 셀러를 위한 6주 오프라인 AI 셀링 실전반. 1기 실행자 특별가 180만원, 서울 강남, 오프라인 6회와 줌 보강 5회.",
};

const applicationUrl =
  process.env.NEXT_PUBLIC_BRAVEYONG_AI_SELLING_FORM_URL || "#apply";
const isExternalApplicationUrl = applicationUrl.startsWith("http");

const heroStats = [
  { value: "6주", label: "오프라인 실전반" },
  { value: "10개", label: "효자상품 완성" },
  { value: "10~15명", label: "소수정예" },
  { value: "180만원", label: "1기 실행자 특별가" },
];

const problems: Array<{
  title: string;
  description: string;
  Icon: LucideIcon;
}> = [
  {
    title: "상품은 많은데 노출이 없다",
    description:
      "100개, 300개, 1000개를 올려도 검색 의도와 카테고리가 틀리면 고객은 상품을 보지 못합니다.",
    Icon: Search,
  },
  {
    title: "매출은 있는데 남는 게 없다",
    description:
      "대량등록으로 주문은 생겨도 마진, CS, 반품, 시간 비용을 빼면 현금흐름이 약해집니다.",
    Icon: Store,
  },
  {
    title: "등록 한도와 정책 변화가 불안하다",
    description:
      "프로그램 의존과 무검수 등록은 정책이 바뀌는 순간 흔들립니다. 이제 기준이 필요합니다.",
    Icon: ShieldCheck,
  },
];

const productStandards = [
  {
    title: "노출 구조",
    description: "검색 의도, 키워드, 카테고리, 상품명 기준을 맞춥니다.",
  },
  {
    title: "전환 구조",
    description:
      "대표이미지, 상세페이지 흐름, 구매 이유, 불안 제거 문구를 잡습니다.",
  },
  {
    title: "운영 구조",
    description: "가격, 마진, 배송/CS, 등록 전 체크리스트까지 확인합니다.",
  },
  {
    title: "AI 반복 구조",
    description:
      "다음 상품도 같은 기준으로 만들 수 있도록 개인 AI 템플릿을 남깁니다.",
  },
];

const curriculum = [
  {
    week: "1주차",
    title: "대량등록 탈출 진단",
    description:
      "현재 방식, 시간, 마진, 노출 상태를 뜯어보고 6주 실행 목표를 세웁니다.",
    output: "내 스토어 진단표, 효자상품 기준표 초안, 6주 개인 실행 목표",
    count: "기준 세팅",
  },
  {
    week: "2주차",
    title: "상품 선정, 키워드, 카테고리",
    description:
      "감 소싱을 줄이고 검색 의도, 경쟁 구조, 카테고리, 상품명 기준을 잡습니다.",
    output: "후보 상품 리스트, 키워드 맵, 상품명 초안",
    count: "효자상품 2개 설계",
  },
  {
    week: "3주차",
    title: "AI 상세페이지 설계",
    description:
      "예쁜 페이지가 아니라 고객 고통, 구매 이유, 불안 제거 순서로 상세페이지를 기획합니다.",
    output: "상세페이지 스토리보드, 이미지/카피 프롬프트",
    count: "효자상품 추가 제작",
  },
  {
    week: "4주차",
    title: "등록, 대표이미지, 전환 체크",
    description:
      "상품명, 대표이미지, 상세페이지, 가격, 배송/CS 문구를 구매 전환 기준으로 점검합니다.",
    output: "등록 가능한 상품 세트, 등록 전 체크리스트",
    count: "효자상품 추가 제작",
  },
  {
    week: "5주차",
    title: "AI 반복 작업 루틴",
    description:
      "상품 분석, 상품명 개선, 상세페이지 초안, CS 답변, 개선 체크를 템플릿화합니다.",
    output: "개인 AI 셀링 템플릿, 주간 작업 루틴표",
    count: "효자상품 추가 제작",
  },
  {
    week: "6주차",
    title: "효자상품 10개 점검과 30일 계획",
    description:
      "효자상품 10개를 최종 점검하고 노출, 클릭, 문의, 주문, 순수익 관점의 다음 계획을 세웁니다.",
    output: "효자상품 10개, 30일 실행 계획, 개선 우선순위, 개인별 피드백",
    count: "총 10개 완성",
  },
];

const operations: Array<{
  title: string;
  value: string;
  description: string;
  Icon: LucideIcon;
}> = [
  {
    title: "무료 전환강의",
    value: "2026년 6월 10일 수요일",
    description: "유튜브에서 대량등록식 셀링의 한계와 AI 셀링 전환을 먼저 설명합니다.",
    Icon: Video,
  },
  {
    title: "본강의 시작",
    value: "2026년 6월 13일 토요일",
    description: "첫 오프라인 수업에서 내 스토어 진단과 6주 실행 목표를 시작합니다.",
    Icon: CalendarDays,
  },
  {
    title: "장소",
    value: "서울 강남",
    description: "정확한 시간과 상세 주소는 참여 확정자에게 안내드립니다.",
    Icon: MapPin,
  },
  {
    title: "구성",
    value: "오프라인 6회 + 줌 5회",
    description: "현장 실습과 중간 과제 보강을 분리해서 실제 실행을 끝까지 봅니다.",
    Icon: Users,
  },
];

const studyItems = [
  "매월 1회 오프라인 정기 모임",
  "매 모임마다 용팀장 특강 1타임",
  "남는 시간은 실습 + Q&A",
  "정책 변화와 시장 변화에 맞춘 신규 내용 업데이트",
  "3개월 15만원, 월 5만원 꼴",
  "1기 수강생은 졸업 후 스터디 우선 참여권 제공",
];

const screeningItems = [
  "현재 판매 플랫폼과 상품 등록 수",
  "월매출/순수익 구간",
  "가장 막히는 지점",
  "기존 상품 개선 또는 새 상품 제작 필요 여부",
  "오프라인 6회 참석 가능 여부",
  "줌 보강 5회 참여 가능 여부",
  "6주 동안 매주 과제 실행 가능 여부",
  "본강의 참여 의향",
];

const faqs = [
  {
    question: "초보도 가능한가요?",
    answer:
      "가능합니다. 다만 듣기만 할 분보다 6주 동안 과제를 직접 실행할 분에게 맞는 과정입니다.",
  },
  {
    question: "아직 상품을 많이 안 올려봤어도 가능한가요?",
    answer:
      "가능합니다. 넓은 대상은 직장인 부업, 육아아빠, 초보 셀러입니다. 수업에서는 무작정 많이 올리기 전에 필요한 기준부터 잡습니다.",
  },
  {
    question: "이미 대량등록으로 올린 상품이 있어도 괜찮나요?",
    answer:
      "괜찮습니다. 기존 상품 중 살릴 상품과 버릴 상품을 나누고, 살릴 상품은 상품명, 카테고리, 상세페이지, 가격, 대표이미지를 다시 봅니다.",
  },
  {
    question: "새 상품 소싱부터 해도 되나요?",
    answer:
      "가능합니다. 새 상품은 처음부터 키워드, SEO, 상세페이지, AI 작업 흐름에 맞춰 만듭니다.",
  },
  {
    question: "AI를 잘 몰라도 따라갈 수 있나요?",
    answer:
      "AI 툴 자랑을 하는 과정이 아닙니다. 상품 분석, 상품명 개선, 상세페이지 기획, 등록 전 체크를 반복할 수 있는 작업 구조를 만듭니다.",
  },
  {
    question: "6주 동안 실제로 무엇을 완성하나요?",
    answer:
      "내 스토어 진단표, 효자상품 기준표, 키워드 맵, 상세페이지 스토리보드, 개인 AI 셀링 템플릿, 효자상품 10개, 30일 실행 계획을 완성합니다.",
  },
  {
    question: "효자상품 10개는 매출을 보장한다는 뜻인가요?",
    answer:
      "아닙니다. 효자상품 10개는 매출 보장 표현이 아니라, 용팀장 기준으로 키워드, 카테고리, 상품명, 대표이미지, 상세페이지, 가격, 등록 전 체크가 갖춰진 상품 10개를 직접 완성한다는 의미입니다.",
  },
  {
    question: "오프라인 참석을 못 하는 주가 있으면 어떻게 되나요?",
    answer:
      "오프라인 실전반 특성상 참석 가능 여부를 신청서에서 먼저 확인합니다. 부득이한 상황은 참여 안내 시 개별 기준을 안내드립니다.",
  },
  {
    question: "줌 보강은 어떤 방식으로 진행되나요?",
    answer:
      "오프라인 수업 사이에 과제에서 막힌 부분을 점검합니다. 상품명, 상세페이지, 등록 전 체크, AI 템플릿 적용을 보강합니다.",
  },
  {
    question: "졸업 후 스터디는 필수인가요?",
    answer:
      "필수가 아닙니다. 의지 있는 분만 3개월 15만원으로 참여합니다. 매월 1회 오프라인으로 만나 특강, 실습, Q&A를 진행합니다.",
  },
  {
    question: "결제는 어떻게 하나요?",
    answer:
      "가격은 공개하지만 바로 결제하는 구조가 아닙니다. 신청서 검토 후 과정에 맞는 분께 카드 결제 또는 계좌이체 안내를 드립니다.",
  },
  {
    question: "환불 기준은 어떻게 되나요?",
    answer:
      "환불 기준은 결제 안내 시 함께 고지합니다. 페이지에서는 참여 전 가격, 구성, 일정, 장소를 먼저 판단할 수 있도록 공개합니다.",
  },
];

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase text-[#b51f1f]">
      {children}
    </p>
  );
}

function CtaButton({
  children,
  variant = "primary",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "hero";
}) {
  return (
    <a
      href={applicationUrl}
      target={isExternalApplicationUrl ? "_blank" : undefined}
      rel={isExternalApplicationUrl ? "noreferrer" : undefined}
      className={
        variant === "hero"
          ? "inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#f7f2e9] px-5 py-3 text-center text-sm font-bold leading-tight text-[#15120f] transition hover:bg-white md:px-6"
          : variant === "primary"
            ? "inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#15120f] px-5 py-3 text-center text-sm font-bold leading-tight text-white transition hover:bg-[#2a2119] md:px-6"
            : "inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#15120f]/20 bg-white px-5 py-3 text-center text-sm font-bold leading-tight text-[#15120f] transition hover:border-[#15120f] md:px-6"
      }
    >
      <span>{children}</span>
      <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
    </a>
  );
}

function WorkbenchScene() {
  const panels = [
    { title: "상품명 / SEO 점검", value: "무타공 욕실 선반", meta: "검색 의도 확인" },
    { title: "AI 상품 분석", value: "고객 불안 7개", meta: "구매 이유 추출" },
    { title: "상세페이지 기획", value: "8섹션 설계", meta: "후킹 → 증거 → FAQ" },
    { title: "등록 개선 체크", value: "10개 기준표", meta: "가격·CS·대표이미지" },
  ];

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#15120f] text-white"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(21,18,15,0.94)_0%,rgba(21,18,15,0.82)_38%,rgba(21,18,15,0.45)_62%,rgba(21,18,15,0.82)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(224,43,43,0.34),transparent_28%),radial-gradient(circle_at_88%_82%,rgba(242,184,91,0.22),transparent_26%)]" />
      <div className="absolute right-0 top-0 h-full w-[54vw] min-w-[640px] bg-[linear-gradient(135deg,transparent_0,rgba(255,255,255,0.08)_45%,transparent_46%,transparent_100%)] opacity-60" />
      <div className="absolute right-5 top-10 flex items-center gap-2 text-[11px] font-bold uppercase text-white/55 md:right-10 md:top-16">
        <span className="size-2 bg-[#e02b2b]" />
        Live selling workbench
      </div>
      <div className="absolute right-5 top-28 grid w-[min(52rem,58vw)] gap-3 sm:grid-cols-2 md:right-10 md:top-32">
        {panels.map((panel, index) => (
          <div
            key={panel.title}
            className={`border border-white/12 bg-white/[0.08] p-4 shadow-2xl backdrop-blur-md ${
              index === 0 ? "sm:col-span-2" : ""
            }`}
          >
            <p className="text-xs font-bold text-[#f2b85b]">{panel.title}</p>
            <p className="mt-3 text-2xl font-black">
              {panel.value}
            </p>
            <p className="mt-2 text-sm text-white/58">{panel.meta}</p>
            <div className="mt-4 h-2 bg-white/10">
              <div
                className="h-full bg-[#e02b2b]"
                style={{ width: `${72 + index * 6}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-8 right-5 w-[min(34rem,46vw)] border border-white/12 bg-[#f7f2e9] p-4 text-[#15120f] shadow-2xl md:bottom-12 md:right-10">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center border border-[#15120f]/20 bg-white text-xs font-black">
            용
          </div>
          <div>
            <p className="text-sm font-black">현업셀러 용팀장이 직접 정리</p>
            <p className="text-xs text-[#5f564b]">
              얼굴보다 작업 흐름을 먼저 보여주는 오프라인 실전반
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  Icon,
  title,
  children,
}: {
  Icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border border-[#15120f]/12 bg-white p-6 shadow-sm">
      <Icon className="size-6 text-[#b51f1f]" aria-hidden="true" />
      <h3 className="mt-5 text-xl font-black text-[#15120f]">
        {title}
      </h3>
      <div className="mt-3 text-sm leading-7 text-[#5f564b]">{children}</div>
    </div>
  );
}

export default function BraveYongAiSellingPage() {
  return (
    <div className="bg-[#f6f1e8] text-[#15120f]">
      <section className="relative min-h-[calc(92svh-4rem)] overflow-hidden border-b border-[#15120f]/10 bg-[#15120f] text-white">
        <WorkbenchScene />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(21,18,15,0.95)_0%,rgba(21,18,15,0.9)_44%,rgba(21,18,15,0.45)_76%,rgba(21,18,15,0.78)_100%)]" />
        <div className="relative mx-auto flex min-h-[calc(92svh-4rem)] max-w-7xl flex-col justify-center px-5 py-16 md:px-8 md:py-24">
          <div className="max-w-4xl">
            <p className="text-xs font-bold uppercase text-[#ff5a4f]">
              BraveYong Offline Cohort 01
            </p>
            <h1 className="mt-5 text-[clamp(3rem,7vw,6.1rem)] font-black leading-[1.02] text-white">
              <span className="block">6주 오프라인</span>
              <span className="block">AI 셀링 실전반</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg font-semibold leading-8 text-white/82 md:text-xl md:leading-9">
              저도 직장 다니고, 애 재우고 나서 상품 올렸습니다. 그래서
              압니다. 초보 셀러에게 필요한 건 더 많은 상품이 아니라, 적은
              시간 안에 팔릴 가능성을 높이는{" "}
              <span className="text-[#f2b85b]">AI 셀링 구조</span>입니다.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaButton variant="hero">6주 오프라인 실전반 지원하기</CtaButton>
              <a
                href="#curriculum"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/24 bg-white/8 px-5 py-3 text-center text-sm font-bold leading-tight text-white transition hover:border-white/60 md:px-6"
              >
                커리큘럼 먼저 보기
              </a>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62">
              신청서 검토 후 참여 안내와 결제 안내를 드립니다. 2026년 6월
              10일 유튜브 무료강의 안내도 함께 보내드립니다.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#15120f]/10 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-[#15120f]/10 md:grid-cols-4">
          {heroStats.map((stat) => (
            <div key={stat.label} className="bg-white px-5 py-8 text-center">
              <p className="text-3xl font-black text-[#15120f] md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-bold text-[#6f655b]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-3xl">
          <SectionLabel>대량등록 탈출</SectionLabel>
          <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
            대량등록으로 버티던 셀러에게 필요한 건 더 많은 상품이 아니라,
            팔리는 구조입니다.
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {problems.map((problem) => (
            <InfoCard key={problem.title} Icon={problem.Icon} title={problem.title}>
              {problem.description}
            </InfoCard>
          ))}
        </div>
      </section>

      <section className="border-y border-[#15120f]/10 bg-[#15120f] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-[0.9fr_1.1fr] md:px-8 md:py-28">
          <div>
            <SectionLabel>AI Selling Definition</SectionLabel>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              AI가 대신 팔아주는 게 아닙니다.
            </h2>
          </div>
          <div className="grid gap-4">
            <div className="border border-white/12 bg-white/[0.06] p-6">
              <p className="text-xl font-bold leading-9 text-white/86">
                AI로 상품 선정, SEO, 상품명, 상세페이지, 등록 전 체크를
                빠르게 반복하는 구조를 만드는 겁니다.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-white/12 p-5">
                <p className="text-sm font-black text-[#f2b85b]">Before</p>
                <p className="mt-2 text-lg font-bold">많이 올리면 하나 걸리겠지</p>
              </div>
              <div className="border border-white/12 p-5">
                <p className="text-sm font-black text-[#f2b85b]">After</p>
                <p className="mt-2 text-lg font-bold">
                  기준대로 만들고, 데이터로 고친다
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-10 md:grid-cols-[0.95fr_1.05fr]">
          <div>
            <SectionLabel>Outcome</SectionLabel>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              1000개를 무작정 올리는 셀러에서 효자상품 10개를 만드는
              셀러로.
            </h2>
            <p className="mt-6 text-lg font-semibold leading-8 text-[#3a332d]">
              처음부터 1000개 효자상품을 만드는 건 불가능합니다. 그래서
              6주 동안 먼저 효자상품 10개를 함께 만듭니다.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaButton variant="secondary">효자상품 10개 만들기 지원하기</CtaButton>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="border border-[#15120f]/12 bg-white p-6">
              <p className="text-sm font-black text-[#b51f1f]">
                효자상품의 정의
              </p>
              <p className="mt-3 text-xl font-black leading-8">
                키워드, 카테고리, 상품명, 대표이미지, 상세페이지, 가격,
                등록 전 체크가 맞춰진 상품입니다.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {productStandards.map((standard) => (
                <div
                  key={standard.title}
                  className="border border-[#15120f]/12 bg-white p-5"
                >
                  <CheckCircle2
                    className="size-5 text-[#1f6f50]"
                    aria-hidden="true"
                  />
                  <h3 className="mt-4 text-lg font-black">{standard.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5f564b]">
                    {standard.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="border border-[#15120f]/12 bg-[#ead9b7] p-6">
              <p className="font-black">기존 상품도, 새 상품도 괜찮습니다.</p>
              <p className="mt-2 text-sm leading-7 text-[#3a332d]">
                기존 상품은 살릴지 버릴지 판단하고, 새 상품은 처음부터
                용팀장 기준으로 만듭니다. 중요한 건 어떤 상품을 살리고
                어떤 상품을 새로 만들지 판단하는 기준입니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="curriculum"
        className="border-y border-[#15120f]/10 bg-white"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="max-w-3xl">
            <SectionLabel>Curriculum</SectionLabel>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              오프라인 6회, 줌 보강 5회. 수업에서는 기준을 배우고 과제로
              효자상품을 만듭니다.
            </h2>
          </div>
          <div className="mt-12 grid gap-4">
            {curriculum.map((item) => (
              <article
                key={item.week}
                className="grid gap-5 border border-[#15120f]/12 bg-[#f6f1e8] p-5 md:grid-cols-[0.32fr_1fr_0.38fr] md:p-6"
              >
                <div>
                  <p className="text-sm font-black text-[#b51f1f]">
                    {item.week}
                  </p>
                  <p className="mt-2 text-lg font-black">{item.count}</p>
                </div>
                <div>
                  <h3 className="text-2xl font-black">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#5f564b]">
                    {item.description}
                  </p>
                </div>
                <div className="border-l-0 border-[#15120f]/12 md:border-l md:pl-5">
                  <p className="text-xs font-black uppercase text-[#6f655b]">
                    산출물
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-7">
                    {item.output}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-10 md:grid-cols-[0.82fr_1.18fr]">
          <div>
            <SectionLabel>Schedule</SectionLabel>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              6월 10일에 방향을 바꾸고, 6월 13일부터 현장에서 실행합니다.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {operations.map((item) => (
              <InfoCard key={item.title} Icon={item.Icon} title={item.title}>
                <p className="text-lg font-black text-[#15120f]">{item.value}</p>
                <p className="mt-2">{item.description}</p>
              </InfoCard>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#15120f]/10 bg-[#e7ece5]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-[0.95fr_1.05fr] md:px-8 md:py-28">
          <div>
            <SectionLabel>Why Yong Teamjang</SectionLabel>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              강의만 파는 사람이 아니라, 상품을 직접 올려본 셀러가
              알려드립니다.
            </h2>
          </div>
          <div className="grid gap-4">
            <div className="border border-[#15120f]/12 bg-white p-6">
              <p className="text-2xl font-black leading-9">
                저도 직장 다니고, 애 재우고 나서 상품 올렸습니다.
              </p>
              <p className="mt-4 text-sm leading-7 text-[#5f564b]">
                그래서 시간이 부족한 셀러가 왜 무작정 많이 올리면 안
                되는지 압니다. 이 과정은 성과를 과장하는 강의가 아니라,
                혼자 막히던 셀러가 기준을 세우고 직접 실행하는
                오프라인 실전반입니다.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "직장인 부업 현실을 아는 사람",
                "육아아빠의 시간 부족을 아는 사람",
                "대량등록의 한계를 겪어본 사람",
                "강의 쇼핑보다 실행 구조를 보는 사람",
              ].map((item) => (
                <div key={item} className="border border-[#15120f]/12 bg-white p-5">
                  <CheckCircle2
                    className="size-5 text-[#1f6f50]"
                    aria-hidden="true"
                  />
                  <p className="mt-3 text-sm font-black">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionLabel>After Graduation</SectionLabel>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              졸업 후에도 매월 1회, 오프라인 스터디로 계속 만납니다.
            </h2>
            <p className="mt-6 text-lg font-semibold leading-8 text-[#3a332d]">
              6주 강의는 시작일 뿐입니다. 정책이 바뀌고, 네이버 로직이
              바뀌고, 시장이 바뀌어도 혼자 다시 막히지 않도록 계속
              업데이트합니다.
            </p>
          </div>
          <div className="border border-[#15120f]/12 bg-white p-6">
            <div className="grid gap-3">
              {studyItems.map((item) => (
                <div key={item} className="flex gap-3 border-b border-[#15120f]/10 pb-3 last:border-b-0 last:pb-0">
                  <CheckCircle2
                    className="mt-0.5 size-5 shrink-0 text-[#1f6f50]"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-semibold leading-6 text-[#3a332d]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#15120f]/10 bg-[#15120f] text-white">
        <div className="mx-auto grid max-w-7xl gap-px bg-white/12 md:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-[#15120f] px-5 py-20 md:px-8 md:py-28">
            <SectionLabel>Price</SectionLabel>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              1기 실행자 특별가 180만원
            </h2>
            <p className="mt-5 text-xl font-bold text-white/72">
              2기 이후 정가 250만원
            </p>
            <p className="mt-6 max-w-xl text-sm leading-7 text-white/68">
              첫 기수는 실행 사례와 후기를 함께 만들 분들을 위해 가격
              장벽을 낮췄습니다. 대신 아무나 받지 않습니다.
            </p>
          </div>
          <div className="bg-[#1d1814] px-5 py-20 md:px-8 md:py-28">
            <div className="grid gap-4">
              <InfoCard Icon={PackageCheck} title="포함 내역">
                오프라인 실전 수업 6회, 줌 보강 5회, 내 상품/스토어
                진단, 상품명·SEO·상세페이지 피드백, AI 셀링 템플릿,
                과제 점검이 포함됩니다.
              </InfoCard>
              <InfoCard Icon={CreditCard} title="결제 방식">
                카드 결제와 계좌이체가 가능합니다. 분할 가능 여부는 결제
                안내 시 별도 안내드립니다.
              </InfoCard>
              <InfoCard Icon={ClipboardCheck} title="선별 안내">
                신청서 검토 후 과정에 맞는 분께만 참여 안내와 결제 링크
                또는 입금 안내를 보내드립니다.
              </InfoCard>
            </div>
          </div>
        </div>
      </section>

      <section id="apply" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionLabel>Application</SectionLabel>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              실행할 분만 받습니다.
            </h2>
            <p className="mt-6 text-lg font-semibold leading-8 text-[#3a332d]">
              상품만 계속 올리던 방식을 정말 바꾸고 싶은 분만 신청해주세요.
              신청서에는 현재 판매 상태와 실행 가능 시간을 함께 받습니다.
            </p>
            <div className="mt-8">
              <CtaButton>신청서 작성하고 참여 안내 받기</CtaButton>
            </div>
          </div>
          <div className="grid gap-3">
            {screeningItems.map((item) => (
              <div key={item} className="flex gap-3 border border-[#15120f]/12 bg-white p-4">
                <ClipboardCheck
                  className="mt-0.5 size-5 shrink-0 text-[#b51f1f]"
                  aria-hidden="true"
                />
                <p className="text-sm font-bold leading-6">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#15120f]/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="max-w-3xl">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              결제 전에 판단해야 할 것들
            </h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group border border-[#15120f]/12 bg-[#f6f1e8] p-5"
              >
                <summary className="cursor-pointer list-none text-lg font-black leading-7">
                  <span className="inline-flex w-full items-start justify-between gap-4">
                    {faq.question}
                    <span className="text-[#b51f1f] transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-7 text-[#5f564b]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#b51f1f] px-5 py-16 text-white md:px-8 md:py-24">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-black uppercase text-white/68">
              Cohort 01
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
              1기 실행자 특별가로 지원하기
            </h2>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-white/78">
              신청서 검토 후 참여 안내와 결제 안내를 드립니다. 6월 10일
              유튜브 무료강의 안내도 함께 보내드립니다.
            </p>
          </div>
          <CtaButton>6주 오프라인 실전반 지원하기</CtaButton>
        </div>
      </section>
    </div>
  );
}
