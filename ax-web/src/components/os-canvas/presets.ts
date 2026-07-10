// 스펙 §4 확정 파이프라인. 수치(before/after) 창작 금지 — 04-persona 원칙.
export type OsNodeKind = "trigger" | "ai" | "gate" | "running";
export type PresetKey = "cs" | "settle" | "content" | "order";

export interface OsNodeData {
  label: string;
  sub: string;      // 노드 카드 안 한 줄 보조 텍스트
  detail: string;   // 클릭 시 상세 카드 본문
  kind: OsNodeKind;
  [key: string]: unknown; // @xyflow/react Node.data 제약 충족
}

export interface OsPresetNode {
  id: string;
  position: { x: number; y: number };
  data: OsNodeData;
  type: "os";
}

export interface OsPresetEdge {
  id: string;
  source: string;
  target: string;
}

export interface OsPreset {
  label: string;
  nodes: OsPresetNode[];
  edges: OsPresetEdge[];
}

export const PRESET_ORDER: PresetKey[] = ["cs", "settle", "content", "order"];

// 가로 배치: x 간격 230, y는 살짝 지그재그 (레퍼런스 flow-*.jpg 느낌)
function n(
  id: string,
  i: number,
  kind: OsNodeKind,
  label: string,
  sub: string,
  detail: string,
): OsPresetNode {
  return {
    id,
    type: "os",
    position: { x: i * 230, y: i % 2 === 0 ? 0 : 48 },
    data: { label, sub, detail, kind },
  };
}

function chain(ids: string[]): OsPresetEdge[] {
  return ids.slice(0, -1).map((s, i) => ({ id: `${s}-${ids[i + 1]}`, source: s, target: ids[i + 1] }));
}

export const PRESETS: Record<PresetKey, OsPreset> = {
  cs: {
    label: "CS 응대",
    nodes: [
      n("cs-1", 0, "trigger", "문의 수신", "채널 통합 인입", "카카오채널, 이메일, 게시판에 흩어진 문의부터 한 곳에 모읍니다. 프로세스 정립은 여기서 시작해요."),
      n("cs-2", 1, "ai", "AI 분류", "유형·긴급도 판정", "반품·배송·상품 문의를 유형별로 나누고, 급한 건은 앞으로 뺍니다. 분류 기준은 대표님 회사 운영 규칙으로 잡아요."),
      n("cs-3", 2, "ai", "답변 생성", "우리 회사 말투로", "과거 응대 기록과 상품 데이터를 근거로 답변 초안을 만듭니다. 근거 없는 답은 만들지 않고 사람에게 넘깁니다."),
      n("cs-4", 3, "gate", "휴먼 검수", "사람이 지키는 게이트", "환불·클레임 등 민감 건은 반드시 사람이 확인하고 보냅니다. 어디까지 자동으로 보낼지는 함께 정합니다."),
      n("cs-5", 4, "ai", "발송", "채널별 자동 회신", "승인된 답변을 각 채널 형식에 맞춰 보냅니다."),
      n("cs-6", 5, "running", "로그·학습", "운영 중", "응대는 전부 기록으로 남습니다. 반복되는 유형은 다음 분류·답변 규칙에 다시 들어가고요 — 이게 쌓이면 회사의 OS가 됩니다."),
    ],
    edges: chain(["cs-1", "cs-2", "cs-3", "cs-4", "cs-5", "cs-6"]),
  },
  settle: {
    label: "정산·리포트",
    nodes: [
      n("st-1", 0, "trigger", "판매 데이터 수집", "채널별 자동 취합", "마켓별 정산 내역·매출 데이터를 사람이 내려받지 않고 자동으로 모읍니다."),
      n("st-2", 1, "ai", "정산 대사", "장부 대조", "채널 정산금과 내부 장부를 대조해 차이 나는 줄을 찾아냅니다."),
      n("st-3", 2, "ai", "이상치 감지", "새는 돈 탐지", "수수료 오적용·누락 건처럼 평소 패턴과 다른 항목을 표시합니다."),
      n("st-4", 3, "gate", "휴먼 확인", "사람이 지키는 게이트", "이상치로 표시된 건은 사람이 판단합니다. 돈이 걸린 결정은 자동으로 처리하지 않습니다."),
      n("st-5", 4, "running", "리포트 생성·발송", "운영 중", "주간·월간 리포트가 정해진 형식으로 만들어져 대표님 메일함에 도착합니다."),
    ],
    edges: chain(["st-1", "st-2", "st-3", "st-4", "st-5"]),
  },
  content: {
    label: "콘텐츠 제작",
    nodes: [
      n("ct-1", 0, "trigger", "소재 수집", "반응 데이터 기반", "잘 터진 콘텐츠·후기·질문을 자동으로 모아 소재 후보로 쌓습니다."),
      n("ct-2", 1, "ai", "초안 생성", "형식별 변환", "SNS·블로그·뉴스레터 등 채널별 형식에 맞는 초안을 만듭니다."),
      n("ct-3", 2, "ai", "브랜드 톤 변환", "우리 말투 적용", "회사가 정한 톤 가이드에 맞춰 문장을 다듬습니다. 톤 가이드 정립부터 함께 합니다."),
      n("ct-4", 3, "gate", "휴먼 승인", "사람이 지키는 게이트", "발행 전 최종 확인은 사람이 합니다. 브랜드를 지키는 건 사람의 일입니다."),
      n("ct-5", 4, "running", "발행 예약", "운영 중", "승인된 콘텐츠는 채널별로 예약 발행합니다. 결과도 남아요."),
    ],
    edges: chain(["ct-1", "ct-2", "ct-3", "ct-4", "ct-5"]),
  },
  order: {
    label: "주문·재고",
    nodes: [
      n("od-1", 0, "trigger", "주문 수신", "채널 통합", "여러 판매 채널의 주문을 한 흐름으로 모읍니다."),
      n("od-2", 1, "ai", "재고 확인", "실시간 대조", "주문과 현재고를 대조해 품절 위험·과재고 신호를 만듭니다."),
      n("od-3", 2, "ai", "발주 제안", "근거 있는 제안", "판매 속도와 리드타임을 근거로 발주 수량을 제안합니다. 결정이 아니라 제안입니다."),
      n("od-4", 3, "gate", "휴먼 승인", "사람이 지키는 게이트", "발주 확정은 사람이 합니다. 현금이 나가는 결정은 자동화하지 않습니다."),
      n("od-5", 4, "running", "발주·입고 추적", "운영 중", "승인된 발주는 바로 실행하고, 입고까지 상태를 자동으로 따라갑니다."),
    ],
    edges: chain(["od-1", "od-2", "od-3", "od-4", "od-5"]),
  },
};
