import type { Metadata } from "next"
import type { ReactNode } from "react"

/**
 * 결제 확인 페이지는 색인 대상이 아니다.
 * bill_id가 붙은 개인 결제 상태 화면이고, 루트 레이아웃의 canonical("/")을
 * 그대로 상속하면 이 페이지가 스스로를 홈페이지라고 선언하게 된다.
 * 815 완료 페이지와 같은 처리를 실전반 쪽에도 맞춘다.
 */
export const metadata: Metadata = {
  title: "결제 확인 — 4주 오프라인 AI 셀링 실전반",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
}

export default function CompleteLayout({ children }: { children: ReactNode }) {
  return children
}
