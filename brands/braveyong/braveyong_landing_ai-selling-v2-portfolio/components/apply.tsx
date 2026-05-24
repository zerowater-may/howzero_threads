import Link from "next/link"
import { ArrowUpRight, ExternalLink } from "lucide-react"
import { Section } from "./section"
import { Check } from "lucide-react"
import { config } from "@/lib/config"

/**
 * 16 신청 — 같은 페이지 안 구글폼 iframe 임베드 (별도 라우트 없음)
 * 폼 URL이 없으면 placeholder 메시지 + CTA만 노출.
 */
const role = [
  "6월 10일 유튜브 무료강의 신청",
  "현재 셀러 상태 진단",
  "실행 의지 확인",
  "본강의 결제 후보 분리",
]
const questions = [
  "이름", "연락처", "현재 판매 플랫폼", "현재 상품 등록 수",
  "월매출 / 순수익 구간", "가장 막히는 지점",
  "기존 상품 개선 / 새 상품 제작", "오프라인 6회 참석 가능 여부",
  "줌 보강 5회 참여 가능 여부", "매주 과제 실행 가능 여부",
  "2026-06-13 시작 본강의 참여 의향",
]

export function Apply() {
  return (
    <Section
      id="apply"
      label="신청 & 선별"
      title={<>신청서 보고, 한 분씩 따로 보고 안내드려요.</>}
    >
      <div className="mb-6 border-l-4 border-foreground bg-background p-6 text-sm leading-relaxed text-foreground/75">
        <p className="whitespace-pre-line">
          {`신청서를 한 분 한 분 직접 읽고 참여 안내를 따로 보내드립니다.
오프라인 실전반이라, 6주 동안 직접 오셔서 상품을 같이 고치고
과제를 매주 해주실 분들과 가고 싶거든요.`}
        </p>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-2">
        <div className="border-2 border-foreground bg-background p-6">
          <h3 className="mb-3 text-lg font-bold tracking-tight">신청서가 하는 일</h3>
          <ul className="space-y-2.5">
            {role.map((r) => (
              <li key={r} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 h-4 w-4 flex-none" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-2 border-foreground bg-background p-6">
          <h3 className="mb-3 text-lg font-bold tracking-tight">신청서 질문 (11문항)</h3>
          <ol className="grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-2">
            {questions.map((q, i) => (
              <li key={q} className="flex items-center gap-2 border border-foreground/10 px-3 py-2">
                <span className="font-mono text-[10px] font-bold tabular-nums text-foreground/55">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{q}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* 결제 전 부담 없이 물어보는 두 통로 — 단톡방 / 1:1 (검수 필수) */}
      <div className="mb-5 border-2 border-foreground/15 bg-background p-5 sm:p-6">
        <p className="text-sm leading-relaxed text-foreground/80 sm:text-base">
          결제 전에 궁금한 점이 있으면, 먼저 물어보셔도 됩니다.<br />
          단톡방에서 분위기를 보고, 1:1로 지금 상황을 남겨주셔도 좋습니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link
            href={config.kakaoOpenChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="용팀장 단톡방 입장 — 카카오톡 오픈채팅 새 창"
            className="group inline-flex items-center gap-1.5 rounded-full border border-foreground/30 px-4 py-2 text-xs font-bold text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background sm:text-sm"
          >
            💬 단톡방 들어가서 분위기 보기
            <ExternalLink className="h-3 w-3" />
          </Link>
          <Link
            href={config.kakao1to1Url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="용팀장 1:1 카카오톡 — 새 창"
            className="group inline-flex items-center gap-1.5 rounded-full border border-foreground/30 px-4 py-2 text-xs font-bold text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background sm:text-sm"
          >
            🙋 용팀장한테 1:1로 물어보기
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* CTA + 구글폼 iframe */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={config.googleFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-foreground px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-background transition-all hover:bg-background hover:text-foreground"
        >
          6주 오프라인 실전반 지원하기
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
        <Link
          href={config.googleFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border-2 border-foreground px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] transition-all hover:bg-foreground hover:text-background"
        >
          신청서 작성하고 참여 안내 받기
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 강한 문구 — 인터뷰 언어 패턴 */}
      <div className="mt-6 bg-foreground p-6 text-background sm:p-8">
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
            직장·육아 병행해도 6주 동안 실제로 상품을 같이 고치고 싶은 분
          </p>
          <p>
            <span className="font-mono mr-2 text-[10px] uppercase tracking-[0.15em] text-background/55">정중히 사양</span>
            카운트다운·딸깍 자동화·하루 1시간이면 누구나 류의 강의를 찾는 분
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
        <div className="mt-6 border-2 border-dashed border-foreground/30 bg-background p-8 text-center text-sm text-foreground/55">
          <span className="font-bold text-foreground/75">신청서 임베드 자리</span> — 운영자가{" "}
          <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs">
            NEXT_PUBLIC_GOOGLE_FORM_URL
          </code>{" "}
          환경변수를 채우면 자동으로 구글폼이 여기에 임베드됩니다.
        </div>
      )}
    </Section>
  )
}
