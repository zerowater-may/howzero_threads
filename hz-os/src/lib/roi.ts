// 온톨로지 병목의 자동화 ROI 우선순위 순수 함수 (A2Z Step4).
// 저장 컬럼이 아니라 props 값에서 파생 계산한다. 서버컴포넌트/클라이언트 양쪽에서 쓴다.

export interface RoiInput {
  timeSavedMinPerRun: number; // 1회 실행당 절감 분
  runsPerWeek: number; // 주간 실행 횟수
  buildCostManDays: number; // 구축 공수(맨데이)
}

// 연간 절감 시간(시간) = 회당 절감분 × 주간횟수 × 52주 / 60분.
export function annualHoursSaved(timeSavedMinPerRun: number, runsPerWeek: number): number {
  return (timeSavedMinPerRun * runsPerWeek * 52) / 60;
}

// ROI 점수 = 연간 절감시간 / max(구축공수, 0.5). 높을수록 먼저 자동화.
export function roiScore({ timeSavedMinPerRun, runsPerWeek, buildCostManDays }: RoiInput): number {
  return annualHoursSaved(timeSavedMinPerRun, runsPerWeek) / Math.max(buildCostManDays, 0.5);
}

export interface OntObject {
  id: number;
  company_id?: number;
  type: string;
  label: string;
  state?: string | null;
  props?: Record<string, unknown> | null;
}

const PRIORITY_WEIGHT: Record<string, number> = { 높음: 3, 중간: 2, 낮음: 1 };

function toNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  return null;
}

// 병목 엔티티 props에 절감 추정치가 다 있으면 ROI 점수를, 없으면 null을 돌려준다.
export function objectRoiScore(o: OntObject): number | null {
  const p = o.props;
  if (!p) return null;
  const t = toNum(p.timeSavedMinPerRun);
  const r = toNum(p.runsPerWeek);
  const b = toNum(p.buildCostManDays);
  if (t == null || r == null || b == null) return null;
  return roiScore({ timeSavedMinPerRun: t, runsPerWeek: r, buildCostManDays: b });
}

// 병목 엔티티를 자동화 우선순위로 정렬한다.
// 추정치가 있는 병목은 ROI 점수 내림차순으로 위에 오고,
// 추정치가 없는 병목은 그 아래에서 priority(높음=3/중간=2/낮음=1) 내림차순으로 정렬한다.
export function priorityRank(objects: OntObject[]): OntObject[] {
  return objects
    .filter((o) => o.type === "bottleneck")
    .map((o) => {
      const roi = objectRoiScore(o);
      const weight = PRIORITY_WEIGHT[String(o.props?.priority ?? "")] ?? 0;
      return { o, hasRoi: roi != null, key: roi != null ? roi : weight };
    })
    .sort((a, b) => (a.hasRoi !== b.hasRoi ? (a.hasRoi ? -1 : 1) : b.key - a.key))
    .map((x) => x.o);
}
