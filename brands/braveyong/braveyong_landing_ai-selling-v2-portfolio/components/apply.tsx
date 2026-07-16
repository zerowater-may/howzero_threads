import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Section } from "./section"
import { config, course } from "@/lib/config"
import { PaymentDialog } from "@/components/payment-dialog"
import { CountdownTimer } from "@/components/countdown-timer"
import { ApplyFormFrame } from "./apply-form-frame"

/**
 * 16 결제 — 신청서 흐름 폐기, '얼리버드(7/10) 마감 전 바로 결제' 단일 CTA 섹션.
 * 7/10까지 얼리버드가. 지나면 정가.
 * 가격 앵커: 250만원(취소선) → 얼리버드가 230만원. 결제 = 유일한 시작점.
 */
export function Apply() {
  return (
    <Section
      id="apply"
      label="얼리버드 마감 임박"
      title={<>지금, 2기 얼리버드가로 시작하세요.</>}
    >
      {/* 타임어택 — 7/10까지만 230만원, 지나면 250만원 */}
      <div className="mb-6 border-l-4 border-brand bg-brand/[0.06] p-6 sm:p-7">
        <div className="font-mono mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
          지금 2기 모집 중 — 정원 차면 얼리버드 마감
        </div>
        <p className="text-lg font-bold leading-snug tracking-tight text-foreground sm:text-xl">
          마감 전까지만 얼리버드가{" "}
          <span className="underline decoration-brand/40 decoration-2 underline-offset-4">230만원</span>입니다.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/75 sm:text-base">
          마감 후에는 정가 <span className="font-bold text-foreground">250만원</span>으로 올라갑니다.{" "}
          신청서 따로 없습니다. <span className="font-bold text-foreground">지금 바로 결제</span>하면 끝나요.
        </p>
      </div>

      {/* 가격 앵커 + 카운트다운 + 큰 결제 버튼 — Clarity 28% 스크롤 대응, 위에 몰아넣음 */}
      <div className="mb-8 border-2 border-brand bg-background p-6 sm:p-8">
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/55">
            {course.cohort} 얼리버드가 (부가세 별도)
          </div>
          <div className="mt-1 flex items-end justify-center gap-3">
            <span className="text-lg font-bold text-foreground/40 line-through sm:text-2xl">
              {(course.priceRegularSupply / 10000).toLocaleString()}만원
            </span>
            <span className="text-4xl font-extrabold tracking-tight text-brand sm:text-5xl">
              {(course.priceFirstSupply / 10000).toLocaleString()}만원
            </span>
          </div>
          <CountdownTimer className="mt-3 text-foreground" />
        </div>

        <div className="mt-6 flex justify-center">
          <PaymentDialog
            amount={course.priceFirst}
            label="지금 2기 얼리버드가 230만원 결제"
            className="group inline-flex w-full max-w-md items-center justify-center gap-2.5 rounded-full border-2 border-brand bg-brand px-9 py-5 text-lg font-bold tracking-tight text-brand-foreground shadow-[0_6px_0_oklch(0.22_0.1_18)] transition-all hover:translate-y-0.5 hover:shadow-[0_3px_0_oklch(0.22_0.1_18)] sm:px-12 sm:py-6 sm:text-xl"
          />
        </div>

        <p className="font-memo mt-4 text-center text-sm leading-relaxed text-foreground/70 sm:text-base">
          💳 한 번에 부담되시면 <span className="font-bold text-foreground">카드 무이자 할부</span>로 시작하셔도 됩니다. 6개월 기준 <span className="font-bold text-foreground">월 42만원</span>대부터.
        </p>

        {/* 보조 경로 — 바로 결제가 부담되면 신청서부터 (outline, 결제 버튼이 주 CTA) */}
        <div className="mt-6 flex flex-col items-center gap-3 border-t border-foreground/10 pt-5 text-center">
          <p className="text-sm leading-relaxed text-foreground/70 sm:text-base">
            바로 결제가 부담되면, <span className="font-bold text-foreground">신청서부터 적어주셔도</span> 돼요. 보고 한 분씩 따로 안내드립니다.
          </p>
          <a
            href={config.googleFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="신청서 작성하기 — 약 1분, 새 창에서 열림"
            data-track="apply_apply_form"
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-foreground bg-transparent px-6 py-3.5 text-sm font-bold text-foreground transition-all hover:bg-foreground hover:text-background"
          >
            신청서부터 작성하기 (약 1분)
          </a>
        </div>

        {/* 결제 전 궁금하면 — 보조 링크 (신청서 아님) */}
        <div className="mt-5 flex flex-col items-center justify-center gap-2 border-t border-foreground/10 pt-4 text-sm sm:flex-row sm:gap-4">
          <span className="text-foreground/55">결제 전 궁금하면</span>
          <Link
            href={config.kakaoOpenChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="결제 전 단톡방 — 새 창"
            data-track="apply_openchat"
            className="inline-flex items-center gap-1 font-bold text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:text-brand"
          >
            단톡방 들어가 보기
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={config.kakao1to1Url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="용팀장 1:1 카카오톡 — 새 창"
            data-track="apply_kakao"
            className="inline-flex items-center gap-1 font-bold text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:text-brand"
          >
            용팀장님께 1:1 물어보기
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 결제 후 흐름 새 3단계 — 결제가 유일한 시작점, 그 뒤는 용팀장이 챙김 */}
      <div className="mb-8 border-2 border-foreground bg-background p-5 sm:p-6">
        <div className="font-mono mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/55">
          결제하면 이렇게 시작돼요
        </div>
        <ol className="grid gap-3 sm:grid-cols-3">
          {[
            { n: "01", h: "지금 결제", b: "이름·휴대폰만 입력하면 결제창이 바로 열립니다. 카드·이체·무이자 할부 가능." },
            { n: "02", h: "용팀장 카톡 안내", b: "결제 확정되면 용팀장이 카톡으로 1주차 일정·장소를 직접 챙겨 보내드려요." },
            { n: "03", h: "7/25 토 5주 시작", b: "5주 오프라인 실전반 시작. 상품 직접 같이 고쳐 갑니다." },
          ].map((s) => (
            <li key={s.n} className="relative border-l-2 border-foreground/30 pl-4">
              <div className="font-mono mb-1 text-[10px] font-bold text-foreground/55">STEP {s.n}</div>
              <div className="text-sm font-bold tracking-tight sm:text-base">{s.h}</div>
              <p className="mt-1 text-xs leading-relaxed text-foreground/65 sm:text-sm">{s.b}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* 강한 문구 — 인터뷰 언어 패턴 */}
      <div className="bg-foreground p-6 text-background sm:p-8">
        <div className="text-lg font-bold tracking-tight sm:text-2xl">
          실행할 분만 받습니다.
        </div>
        <div className="mt-2 text-sm leading-relaxed text-background/75 sm:text-base">
          상품만 계속 올리던 방식을 정말 바꾸고 싶은 분만 결제해주세요.<br />
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
          ⏰ 마감 후에는 <span className="font-bold text-background">230만원 → 250만원</span>으로 올라갑니다. 결제는 지금 위에서 바로.
        </p>
      </div>

      {/* 신청서 임베드 — 바로 결제가 부담되는 분용 보조 경로. 스크롤하면 바로 열림 */}
      <div className="mt-8">
        <div className="font-mono mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/55">
          신청서부터 적고 싶다면 (선택)
        </div>
        <ApplyFormFrame src={config.googleFormUrl} />
      </div>
    </Section>
  )
}
