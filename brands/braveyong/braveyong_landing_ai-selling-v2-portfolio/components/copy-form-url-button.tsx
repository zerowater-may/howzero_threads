"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { config } from "@/lib/config"

/**
 * 신청서 URL 클립보드 복사 버튼.
 * 클릭 시 navigator.clipboard.writeText + 2초간 "복사됨" 토스트 인라인.
 */
export function CopyFormUrlButton({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(config.googleFormUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard 권한 거부 시 fallback — textarea 만들어서 execCommand
      const ta = document.createElement("textarea")
      ta.value = config.googleFormUrl
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      ta.remove()
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="신청서 링크 클립보드에 복사"
      className={`inline-flex items-center gap-2 rounded-full border-2 border-foreground/40 px-5 py-3 text-sm font-bold tracking-tight text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background sm:px-6 sm:py-3.5 sm:text-base ${className}`}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
          링크 복사됨!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
          신청서 링크 복사
        </>
      )}
    </button>
  )
}
