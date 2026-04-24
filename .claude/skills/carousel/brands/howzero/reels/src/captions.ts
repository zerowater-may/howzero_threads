export type Caption = {
  line1: string;
  line2?: string;
  accent?: string; // 강조할 단어 (line1 또는 line2 내부 substring)
};

// 슬라이드 1~12 캡션. 22초 컷에서는 1~8번이 노출됨.
export const CAPTIONS: Caption[] = [
  { line1: "강서구 가양동", line2: "9억대 아파트 찾아봤다구", accent: "9억대" },
  { line1: "9호선 급행 + 마곡 옆집", line2: "가양동, 지금 어때?", accent: "급행" },
  { line1: "가양동 대단지", line2: "한눈에 보기", accent: "한눈에" },
  { line1: "가양2단지성지", line2: "5년 +136% 🔥", accent: "+136%" },
  { line1: "강변3단지", line2: "호가 7.4~11.1억", accent: "7.4~11.1억" },
  { line1: "가양9단지", line2: "호가 6.6억대", accent: "6.6억대" },
  { line1: "가양6단지 58C", line2: "방3화2 호가 12억", accent: "방3화2" },
  { line1: "강서한강자이", line2: "2013년 신축 14억↑", accent: "신축" },
  { line1: "대출 체크리스트", line2: "생애최초 꼭 확인", accent: "생애최초" },
  { line1: "학군·상권 체크", line2: "9호선 + 마곡 생활권", accent: "마곡" },
  { line1: "저장해두고 다시 봐봐", line2: "가양동 잘 봤지?", accent: "저장" },
  { line1: "@howzero", line2: "내집마련 큐레이션", accent: "큐레이션" },
];
