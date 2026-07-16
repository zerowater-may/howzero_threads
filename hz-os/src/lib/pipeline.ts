// 딜 파이프라인 6단계 (A2Z §2). 값 테이블 대신 상수로 고정 — 커스터마이즈는 later.
export const PIPELINE_STAGES = ["상담신청", "진단", "제안", "계약", "구축", "운영"] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export function isPipelineStage(v: string): v is PipelineStage {
  return (PIPELINE_STAGES as readonly string[]).includes(v);
}
