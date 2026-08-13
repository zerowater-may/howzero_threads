import { course } from "@/lib/config"

/**
 * 결제 전 신청서 문항 — 단일 출처.
 *
 * 2026-08-13 사장님 지시로 부활. 1기 때는 구글폼(APPLY_FORM.md)이었는데 외부 폼은
 * 제출 여부를 서버가 알 수 없어서 "결제 전 필수"를 강제할 방법이 없다. 그래서 문항을
 * 결제 모달 안으로 가져왔다. 이제 신청서를 통과하지 않으면 청구서 자체가 발행되지 않는다.
 *
 * 이 배열이 클라이언트 렌더링과 서버 검증 양쪽의 기준이다. 문항을 고치면 둘 다 따라온다.
 * 이름·휴대폰은 결제 단계에서 이미 받으므로 여기 넣지 않는다(구글폼 Q1·Q2 중복 제거).
 * 구글폼 Q8(카톡 수신 동의)도 뺐다 — 결제 행위 자체가 청구서 카톡 수신을 전제한다.
 */
export type ApplicationField = {
  key: string
  label: string
  type: "radio" | "checkbox" | "text"
  required: boolean
  help?: string
  options?: readonly string[]
}

export const applicationFields: readonly ApplicationField[] = [
  {
    key: "sellerExperience",
    label: "셀러 경험은 어느 정도세요?",
    type: "radio",
    required: true,
    options: ["아직 시작 전", "1년 미만", "1~3년", "3년 이상"],
  },
  {
    key: "monthlyRevenue",
    label: "현재 월 매출 구간은요?",
    type: "radio",
    required: true,
    help: "정확하지 않아도 됩니다. 강의 진행 방향 잡는 데에만 씁니다.",
    options: [
      "아직 매출 없음",
      "월 100만원 이하",
      "월 100~500만원",
      "월 500~1,000만원",
      "월 1,000~3,000만원",
      "월 3,000만원 이상",
      "비공개",
    ],
  },
  {
    key: "painPoints",
    label: "지금 셀링하면서 가장 답답한 점이 뭐예요?",
    type: "checkbox",
    required: true,
    help: "여러 개 고르셔도 됩니다.",
    options: [
      "많이 올렸는데 노출이 안 됨",
      "매출은 있는데 남는 게 없음",
      "시간이 부족함 (직장·육아 병행)",
      "AI를 어떻게 써야 할지 모르겠음",
      "상품 선정·소싱 자체가 어려움",
      "광고 운영을 못 함",
      "기타",
    ],
  },
  {
    key: "scheduleCommit",
    label: `${course.weeks}주 일정, 시간 확보 가능하세요?`,
    type: "radio",
    required: true,
    // 날짜·횟수는 course 단일 출처에서 파생 — 기수 전환 때 문항만 옛 일정으로 남는 걸 막는다
    help: `${course.startDate} 시작 · ${course.location} 오프라인 ${course.offlineCount}회 + 줌 보강 ${course.zoomCount}회`,
    options: ["매주 시간 만들 자신 있어요", "대부분 가능, 1~2번 결석 정도", "솔직히 어려울 것 같아요"],
  },
  {
    key: "question",
    label: "용팀장한테 직접 묻고 싶은 점 있으면 적어주세요.",
    type: "text",
    required: false,
    help: "선택 사항이에요.",
  },
] as const

export type ApplicationAnswers = Record<string, string | string[]>

/**
 * 서버측 신청서 검증 — 클라이언트 폼은 우회할 수 있으므로 여기가 진짜 관문이다.
 * 옵션 목록에 없는 값은 거부한다(쓰레기 데이터·주입 방지).
 * 통과하면 null, 실패하면 사용자에게 보여줄 메시지를 반환한다.
 */
export function validateApplication(answers: unknown): string | null {
  if (typeof answers !== "object" || answers === null || Array.isArray(answers)) {
    return "신청서를 먼저 작성해주세요."
  }
  const record = answers as Record<string, unknown>

  for (const field of applicationFields) {
    const value = record[field.key]

    if (field.type === "checkbox") {
      const picked = Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []
      if (field.required && picked.length === 0) {
        return `"${field.label}" 항목을 선택해주세요.`
      }
      if (picked.some((v) => !field.options?.includes(v))) {
        return `"${field.label}" 항목의 값이 올바르지 않습니다.`
      }
      continue
    }

    const text = typeof value === "string" ? value.trim() : ""
    if (field.required && !text) {
      return `"${field.label}" 항목을 선택해주세요.`
    }
    // 자유 입력(text)은 옵션 검사 대상이 아니다 — 길이만 제한한다
    if (field.type === "text") {
      if (text.length > 1000) return "질문은 1000자 이하로 입력해주세요."
      continue
    }
    if (text && !field.options?.includes(text)) {
      return `"${field.label}" 항목의 값이 올바르지 않습니다.`
    }
  }

  return null
}
