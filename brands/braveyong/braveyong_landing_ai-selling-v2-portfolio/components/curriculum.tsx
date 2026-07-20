import { Lock } from "lucide-react"
import { Section } from "./section"
import { course } from "@/lib/config"

/**
 * 08 커리큘럼 — 무료특강 덱(P1~P12) 근거로 전면 재구성 (2026-07-20).
 *
 * 이전 버전은 "소싱→가공→판매→광고→시스템화" 5블럭이었는데,
 * 덱 전체에 광고 커리큘럼 근거가 없었다(광고 언급은 강사 근황 한 문장뿐).
 * 덱이 실제로 가르치는 뼈대는 다섯 칸(소싱·등록·노출·전환·CS)이고,
 * 실전반은 그 앞에 "AI 직원 설치·세팅"이 붙는 구조다 (덱 p10-05~08 '설치의 벽').
 *
 * 공개 범위: 무엇을 하는지(WHAT)는 무료특강에서 이미 다 공개하므로 열어두고,
 * 구체적 세팅값·지침 원문(HOW)만 잠근다. 통째로 블러 처리하면
 * 220만원 결제 판단에 필요한 정보까지 가려진다.
 */
const weeks: {
  n: number
  label: string
  sub: string
  does: string[]
  output: string
}[] = [
  {
    n: 1,
    label: "AI 직원 세팅",
    sub: "설치의 벽을 같이 넘습니다",
    does: [
      "디스코드 + 코덱스 연결 — 내 컴퓨터에 직접",
      "내 스토어에 맞춘 업무별 지침 세팅",
      "채팅으로 일 시켜보고 결과물 받아보기",
    ],
    output: "내 이름으로 돌아가는 AI 직원 1명",
  },
  {
    n: 2,
    label: "소싱",
    sub: "감이 아니라 데이터로 고릅니다",
    does: [
      "셀러라이프 키워드 데이터 내려받기",
      "상품 수 1만 개 이하 · 해외배송 비율 10~50% 필터",
      "데이터가 거른 뒤 사람이 마지막에 결정하는 순서",
    ],
    output: "수만 행에서 걸러낸 소싱 후보 목록",
  },
  {
    n: 3,
    label: "노출",
    sub: "안 보이는 상품은 없는 상품입니다",
    does: [
      "적합도 7칸 — 상품명·카테고리·브랜드·제조사·마켓명·속성·태그",
      "텀 카운트 기준으로 상품명 짓기",
      "남들이 귀찮아서 안 채우는 속성 체크박스 채우기",
    ],
    output: "SEO 검증 끝낸 상품명 + 속성 다 채운 등록",
  },
  {
    n: 4,
    label: "전환 · 시스템화",
    sub: "지침으로 넘기고, 검수만 남깁니다",
    does: [
      "4칸 지침 — 역할·기준·금지·출력 직접 작성",
      "상세페이지·썸네일·CS 답변까지 위임",
      "아침 지시 → 낮 진행 → 저녁 검수 30분 루틴",
    ],
    output: "다섯 칸이 돌아가는 내 시스템",
  },
]

/** 잠긴 부분 — 구체적 세팅값·원문. 무료특강에서도 공개하지 않는 것만. */
const locked = [
  "상위 노출되는 세팅값 기준 — 남들이 모르는 부분",
  "업무별 지침 풀세트 원문 (계속 업데이트되는 버전)",
  "내 상품명 검토 피드백 · 테스트 기록 시트 코멘트",
]

export function Curriculum() {
  return (
    <Section
      id="curriculum"
      label={`${course.weeks}주 커리큘럼`}
      title={<>토요일 오프라인 {course.offlineCount}회 + 수요일 줌 보강</>}
      lead="오프라인에서 배우고, 그 주 평일 저녁에 막힌 걸 줌으로 풉니다. 노트북 들고 오시면 그 자리에서 직접 돌려보는 방식이에요."
    >
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        {weeks.map((w) => (
          <div
            key={w.n}
            className="group relative flex flex-col border-2 border-foreground bg-background p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_0_var(--foreground)]"
          >
            <div className="font-mono mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/55">
              WEEK {String(w.n).padStart(2, "0")}
            </div>
            <h3 className="text-lg font-bold tracking-tight sm:text-xl">{w.label}</h3>
            <p className="mt-1 text-xs leading-relaxed text-foreground/65">{w.sub}</p>

            <ul className="mt-3 space-y-1.5 border-t border-foreground/10 pt-3">
              {w.does.map((d) => (
                <li key={d} className="flex gap-1.5 text-[11px] leading-relaxed text-foreground/75">
                  <span className="mt-[7px] h-1 w-1 flex-none rounded-full bg-brand" aria-hidden />
                  {d}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-3">
              <div className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-foreground/45">
                손에 남는 것
              </div>
              <div className="mt-0.5 text-[11px] font-bold leading-snug text-foreground">{w.output}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 잠긴 부분 — 결제자에게만 가는 것 */}
      <div className="mt-8 border-2 border-foreground bg-background p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full border-2 border-foreground bg-foreground text-background">
            <Lock className="h-5 w-5" aria-hidden />
          </div>
          <div className="flex-1">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/55">
              여기까지만 공개합니다
            </div>
            <div className="mt-1 text-lg font-bold tracking-tight">
              세팅값과 지침 원문은 {course.cohort} 수강생에게만 갑니다.
            </div>
            <ul className="mt-3 space-y-1.5">
              {locked.map((l) => (
                <li key={l} className="flex gap-2 text-sm leading-relaxed text-foreground/70">
                  <span className="mt-[9px] h-1 w-1 flex-none rounded-full bg-foreground/40" aria-hidden />
                  {l}
                </li>
              ))}
            </ul>
            <p className="font-memo mt-4 text-sm leading-relaxed text-foreground/70 sm:text-base">
              무료특강에서 드리는 자료는 그날 날짜 버전이에요. 실전반은 지침이 업데이트될 때마다 계속 받으시고,
              무엇보다 <span className="font-bold text-foreground">그 지침을 사장님 스토어에 맞춰 제가 직접 세팅해 드립니다.</span>
            </p>
          </div>
        </div>
      </div>

      <p className="font-memo mt-6 text-sm leading-relaxed text-foreground/70 sm:text-base">
        ※ 온라인 수강은 이번에도 받지 않습니다. 상품명 하나하나 봐드리고 테스트 기록에 코멘트를 다는 방식이라,
        오프라인 {course.capacityMax}명이 제가 감당할 수 있는 최대예요.
      </p>
    </Section>
  )
}
