import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "결제 확인 — 8.15 통관대응 라이브 특강",
  robots: { index: false, follow: false },
}

export default function CompleteLayout({ children }: { children: ReactNode }) {
  return children
}
