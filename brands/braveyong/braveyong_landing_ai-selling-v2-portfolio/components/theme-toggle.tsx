"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

/**
 * 우상단 고정 다크/라이트 토글.
 * next-themes로 system → 사용자 선택 저장(localStorage).
 * SSR 깜빡임 방지를 위해 mount 후에만 아이콘 표시.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="fixed right-4 top-4 z-50 rounded-full border-2 border-foreground bg-background p-2.5 text-foreground transition-all duration-300 hover:scale-110 hover:bg-foreground hover:text-background sm:right-6 sm:top-6 sm:p-3"
    >
      {/* mount 전엔 빈 자리만 두어 깜빡임 방지 */}
      {mounted ? (
        isDark ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
      ) : (
        <span className="block h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
      )}
    </button>
  )
}
