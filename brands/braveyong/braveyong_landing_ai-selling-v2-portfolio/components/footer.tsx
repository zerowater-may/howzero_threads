import { config } from "@/lib/config"

/** 19 Footer — 디스클레이머 + © */
export function Footer() {
  return (
    <footer className="border-t border-foreground/10 bg-background px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-xs leading-relaxed text-foreground/55">
          본 페이지는 매출이나 수익을 보장하지 않습니다. ‘효자상품 10개’는 용팀장 기준으로 팔릴 구조를 갖춘 상품 10개를
          6주 동안 직접 완성한다는 의미이며, 성과를 단정하지 않습니다.
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/45">
          © 2026 용감한 용팀장 · 6주 오프라인 AI 셀링 실전반 · 서울 강남
          {config.contactEmail && (
            <>
              <span className="mx-2">·</span>
              <a className="underline-offset-4 hover:underline" href={`mailto:${config.contactEmail}`}>
                {config.contactEmail}
              </a>
            </>
          )}
        </p>
      </div>
    </footer>
  )
}
