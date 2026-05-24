import { Section } from "./section"
import { course } from "@/lib/config"

/** 09 운영 방식 (다크) — 5 stat + 일정/장소 */
const stats = [
  { b: `${course.offlineCount}회`, k: "오프라인" },
  { b: `${course.zoomCount}회`, k: "줌 보강" },
  { b: "매주", k: "과제" },
  { b: "1:1", k: "상품·스토어 피드백" },
  { b: `${course.capacityMin}~${course.capacityMax}명`, k: "소수정예" },
]

const info = [
  { lbl: "무료 전환강의", val: course.freeLectureDate, sub: "유튜브 진행" },
  { lbl: "본강의 시작", val: course.startDate, sub: `오프라인 ${course.offlineCount} + 줌 ${course.zoomCount}` },
  { lbl: "장소", val: course.location, sub: course.detailAddress },
  { lbl: "시간", val: course.scheduleTime, sub: "확정 후 참여자에게 안내" },
]

export function Operation() {
  return (
    <Section
      tone="dark"
      label="운영 방식"
      title={<>현장에서 직접 고치는 오프라인 실전반</>}
      lead="매주 오프라인에서 직접 만나서 상품·스토어를 같이 고치고, 중간엔 줌으로 보강합니다."
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {stats.map((s) => (
          <div key={s.k} className="border-2 border-background/30 p-5 text-center transition-colors hover:border-background">
            <div className="text-2xl font-bold tracking-tight">{s.b}</div>
            <div className="font-mono mt-1 text-[10px] uppercase tracking-[0.1em] text-background/65">{s.k}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {info.map((i) => (
          <div key={i.lbl} className="border-l-2 border-background/40 pl-4">
            <div className="font-mono mb-2 text-[10px] uppercase tracking-[0.15em] text-background/55">
              {i.lbl}
            </div>
            <div className="text-base font-bold tracking-tight">{i.val}</div>
            <div className="mt-1 text-xs text-background/60">{i.sub}</div>
          </div>
        ))}
      </div>
    </Section>
  )
}
