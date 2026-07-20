import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "결제 확인 — 8월 통관대응 라이브 특강",
  robots: { index: false, follow: false },
  // 루트의 canonical("/")을 상속하면 이 페이지가 홈페이지를 자처하게 된다
  alternates: { canonical: null },
}

export default function CompleteLayout({ children }: { children: ReactNode }) {
  return children
}
