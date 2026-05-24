import Link from "next/link"

/**
 * 404 페이지 — Next 자동 _document 생성 버그 회피 + 단순한 한국어 안내.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-20 text-foreground">
      <div className="max-w-md text-center">
        <p className="font-mono mb-3 text-xs font-bold uppercase tracking-[0.18em] text-foreground/55">
          404
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          페이지를 찾지 못했습니다.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground/65 sm:text-base">
          주소가 바뀌었거나, 잘못된 링크일 수 있습니다.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-foreground px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-background transition-all hover:bg-background hover:text-foreground"
        >
          홈으로
        </Link>
      </div>
    </main>
  )
}
