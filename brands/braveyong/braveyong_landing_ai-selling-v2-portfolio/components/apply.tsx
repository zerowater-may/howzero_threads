import Link from "next/link"
import { ArrowUpRight, ExternalLink } from "lucide-react"
import { Section } from "./section"
import { config } from "@/lib/config"
import { CopyFormUrlButton } from "./copy-form-url-button"

/**
 * 16 신청 — 결제까지 4단계 + 메인 CTA (중앙정렬, 버건디).
 * 신청서가 하는 일 / 신청서 질문 list / 단톡방 박스 모두 제거 (사용자 요청).
 * 이미 단톡에서 넘어온 사람들 대상이므로 단톡방 안내 불필요.
 */
export function Apply() {
  return (
    <Section
      id="apply"
      label="신청 & 선별"
      title={<>신청서 보고, 한 분씩 따로 보고 안내드려요.</>}
    >
      {/* 핵심 안내 — 신청서 작성 → 결제 link 즉시 발송 */}
      <div className="mb-6 border-2 border-brand bg-brand/5 p-6 sm:p-7">
        <div className="font-mono mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
          결제 흐름
        </div>
        <p className="text-lg font-bold leading-snug tracking-tight text-foreground sm:text-xl">
          신청서를 먼저 작성하셔야 <span className="text-brand">결제 링크</span>가 발송됩니다.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/75 sm:text-base">
          신청서 제출 직후 <span className="font-bold text-foreground">결제 페이지 안내</span>가 자동으로 노출되고,{" "}
          용팀장이 한 번 더 카톡으로 확인 메시지 보내드려요. 결제만 따로 받는 페이지는 없습니다.
        </p>
      </div>

      {/* 결제까지 4단계 — 신청 후 흐름을 사람말투로 보여줘 결제 불안 차단 */}
      <div className="mb-8 border-2 border-foreground bg-background p-5 sm:p-6">
        <div className="font-mono mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/55">
          신청부터 결제까지, 이렇게 진행돼요
        </div>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { n: "01", h: "신청서 작성", b: "8문항 약 1분. 이름·연락처·상황을 솔직히 적어주세요." },
            { n: "02", h: "결제 링크 즉시 발송", b: "제출 직후 응답 페이지에 결제 링크가 자동으로 뜹니다. 카드·이체·무이자 할부 가능." },
            { n: "03", h: "용팀장 확인 카톡", b: "신청서 보고 한 분씩 따로 읽고, 카톡으로 한 번 더 확인 메시지 드려요." },
            { n: "04", h: "5주 시작", b: "결제 확정되면 오프라인 1주차 일정·장소까지 챙겨서 보내드립니다." },
          ].map((s) => (
            <li key={s.n} className="relative border-l-2 border-brand/40 pl-4">
              <div className="font-mono mb-1 text-[10px] font-bold text-brand">STEP {s.n}</div>
              <div className="text-sm font-bold tracking-tight sm:text-base">{s.h}</div>
              <p className="mt-1 text-xs leading-relaxed text-foreground/65 sm:text-sm">{s.b}</p>
            </li>
          ))}
        </ol>
        <p className="font-memo mt-4 border-t border-foreground/10 pt-3 text-sm leading-relaxed text-foreground/70 sm:text-base">
          ※ <span className="font-bold text-foreground">신청서 = 결제의 유일한 시작점</span>입니다. 결제만 따로 받지 않아요. 신청서 작성하시면 곧바로 결제 링크가 안내됩니다.
        </p>
      </div>

      {/* CTA — 중앙정렬 + 버건디 메인 + 링크 복사 + 1:1 카톡 */}
      <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href={config.googleFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="5주 오프라인 실전반 신청서 작성 — 새 창에서 열림"
          className="group inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-brand bg-brand px-9 py-5 text-lg font-bold tracking-tight text-brand-foreground shadow-[0_6px_0_oklch(0.22_0.1_18)] transition-all hover:translate-y-0.5 hover:shadow-[0_3px_0_oklch(0.22_0.1_18)] sm:px-12 sm:py-6 sm:text-xl"
        >
          신청서 작성하기 (약 1분)
          <ArrowUpRight className="h-6 w-6 transition-transform group-hover:translate-x-0.5 sm:h-7 sm:w-7" />
        </Link>
        <CopyFormUrlButton />
        <Link
          href={config.kakao1to1Url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="용팀장 1:1 카카오톡 — 새 창"
          className="group inline-flex items-center justify-center gap-2 rounded-full border-2 border-foreground/40 px-6 py-4 text-base font-bold tracking-tight text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background sm:text-base"
        >
          🙋 용팀장님께 1:1 물어보기
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      {/* 강한 문구 — 인터뷰 언어 패턴 */}
      <div className="bg-foreground p-6 text-background sm:p-8">
        <div className="text-lg font-bold tracking-tight sm:text-2xl">
          실행할 분만 받습니다.
        </div>
        <div className="mt-2 text-sm leading-relaxed text-background/75 sm:text-base">
          상품만 계속 올리던 방식을 정말 바꾸고 싶은 분만 신청해주세요.<br />
          쉽게 돈 버는 강의 찾으시는 분은 다른 곳이 더 맞습니다.
        </div>
        <div className="mt-5 grid gap-3 border-t border-background/15 pt-5 text-sm text-background/85 sm:grid-cols-2">
          <p>
            <span className="font-mono mr-2 text-[10px] uppercase tracking-[0.15em] text-background/55">받습니다</span>
            직장·육아 병행하면서도 5주 동안 직접 상품을 같이 고쳐 가실 분
          </p>
          <p>
            <span className="font-mono mr-2 text-[10px] uppercase tracking-[0.15em] text-background/55">정중히 사양</span>
            ‘딸깍 자동화·하루 1시간이면 누구나’ 같은 강의를 찾으시는 분
          </p>
        </div>
        <p className="font-memo mt-5 border-t border-background/15 pt-4 text-sm leading-relaxed text-background/85 sm:text-base">
          💳 한 번에 부담되시면, <span className="font-bold text-background">카드 무이자 할부</span>로 시작하셔도 됩니다. 월 30만원대부터.
        </p>
      </div>

      {/* 구글폼 iframe — URL 있으면 임베드, 없으면 안내 */}
      {!config.isFormUrlMissing ? (
        <div className="mt-6 overflow-hidden border-2 border-foreground bg-background">
          <iframe
            src={config.googleFormUrl}
            title="신청서"
            className="block h-[820px] w-full"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="mt-6 border-2 border-foreground/20 bg-background p-8 text-center text-sm leading-relaxed text-foreground/70">
          <p className="text-base font-bold text-foreground sm:text-lg">
            신청서 준비 중입니다.
          </p>
          <p className="mt-2">
            준비되는 대로 여기서 바로 작성하실 수 있게 올려드릴게요.
          </p>
        </div>
      )}
    </Section>
  )
}
