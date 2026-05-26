import Link from "next/link"
import { ArrowUpRight, ExternalLink } from "lucide-react"
import { Section } from "./section"
import { Check } from "lucide-react"
import { config } from "@/lib/config"
import { CopyFormUrlButton } from "./copy-form-url-button"

/**
 * 16 신청 — 같은 페이지 안 구글폼 iframe 임베드 (별도 라우트 없음)
 * 폼 URL이 없으면 placeholder 메시지 + CTA만 노출.
 * 진짜 폼(10문항)과 일치시킴. 신청서 = 결제의 유일한 시작점.
 */
const role = [
  "셀러 경험·매출 상황을 짧게 파악",
  "5주 일정 시간 확보 가능성 확인",
  "용팀장 1:1 카톡 매칭",
  "결제 안내 카톡 동의 (결제의 유일한 시작점)",
]
const questions = [
  "이름", "휴대폰 번호", "카톡 ID",
  "셀러 경험", "월 매출 구간",
  "가장 답답한 점", "5주 일정 가능 여부",
  "결제 의향", "묻고 싶은 점 (선택)",
  "결제 안내 카톡 동의",
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
오프라인 실전반이라, 5주 동안 직접 오셔서 상품을 같이 고치고
과제를 매주 해주실 분들과 가고 싶거든요.`}
        </p>
      </div>

      {/* 결제까지 4단계 — 신청 후 흐름을 사람말투로 보여줘 결제 불안 차단 */}
      <div className="mb-6 border-2 border-foreground bg-background p-5 sm:p-6">
        <div className="font-mono mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/55">
          신청부터 결제까지, 이렇게 진행돼요
        </div>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { n: "01", h: "신청서 작성", b: "10문항 약 1분. 이름·연락처·상황을 솔직히 적어주세요." },
            { n: "02", h: "용팀장이 직접 읽어요", b: "한 분씩 따로 읽어보고, 카톡으로 먼저 인사드릴게요." },
            { n: "03", h: "결제 안내 카톡", b: "같이 가도 될 것 같다 싶으면 결제 링크·할부 옵션을 카톡으로 따로 보내드려요." },
            { n: "04", h: "5주 시작", b: "오프라인 1주차 일정·장소까지 챙겨서 보내드립니다." },
          ].map((s) => (
            <li key={s.n} className="relative border-l-2 border-foreground/15 pl-4">
              <div className="font-mono mb-1 text-[10px] font-bold text-foreground/55">STEP {s.n}</div>
              <div className="text-sm font-bold tracking-tight sm:text-base">{s.h}</div>
              <p className="mt-1 text-xs leading-relaxed text-foreground/65 sm:text-sm">{s.b}</p>
            </li>
          ))}
        </ol>
        <p className="font-memo mt-4 border-t border-foreground/10 pt-3 text-xs leading-relaxed text-foreground/60 sm:text-sm">
          ※ <span className="font-bold text-foreground">결제는 신청서를 보낸 분들에게만 카톡으로 안내드립니다.</span>{" "}
          결제만 따로 받지 않아요. 신청서 = 결제의 유일한 시작점이에요.
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
          <h3 className="mb-3 text-lg font-bold tracking-tight">신청서 질문 (10문항)</h3>
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

      {/* 결제 전 부담 없이 물어보는 두 통로 — 단톡방 / 1:1 (시인성·터치 영역 키움: 40~50대 타겟) */}
      <div className="mb-5 border-2 border-foreground/15 bg-background p-5 sm:p-6">
        <p className="text-base leading-relaxed text-foreground/80 sm:text-lg">
          결제 전에 궁금한 점이 있으면, 먼저 물어보셔도 됩니다.<br />
          단톡방에서 분위기를 보고, 1:1로 지금 상황을 남겨주셔도 좋습니다.
        </p>
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          <Link
            href={config.kakaoOpenChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="용팀장 단톡방 입장 — 카카오톡 오픈채팅 새 창"
            className="group inline-flex items-center justify-center gap-2 rounded-full border-2 border-foreground/40 px-6 py-4 text-base font-bold text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background sm:text-base"
          >
            💬 단톡방 들어가서 분위기 보기
            <ExternalLink className="h-4 w-4" />
          </Link>
          <Link
            href={config.kakao1to1Url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="용팀장 1:1 카카오톡 — 새 창"
            className="group inline-flex items-center justify-center gap-2 rounded-full border-2 border-foreground/40 px-6 py-4 text-base font-bold text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background sm:text-base"
          >
            🙋 용팀장한테 1:1로 물어보기
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* CTA — 40~50대 시인성: 큼지막한 버튼 + 신청서 링크 복사 옵션 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          href={config.googleFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="5주 오프라인 실전반 신청서 작성 — 새 창에서 열림"
          className="group inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-foreground bg-foreground px-8 py-5 text-lg font-bold tracking-tight text-background transition-all hover:bg-background hover:text-foreground sm:px-10 sm:py-5 sm:text-xl"
        >
          신청서 작성하기 (약 1분)
          <ArrowUpRight className="h-6 w-6 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:h-7 sm:w-7" />
        </Link>
        <CopyFormUrlButton />
        <Link
          href={config.kakao1to1Url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="용팀장 1:1 카카오톡 — 새 창에서 열림"
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-foreground/40 px-6 py-4 text-base font-bold tracking-tight text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background sm:px-6 sm:py-3.5"
        >
          🙋 먼저 1:1로 물어볼게요
          <ExternalLink className="h-4 w-4" />
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
            직장·육아 병행하면서도 5주 동안 직접 상품을 같이 고쳐 가실 분
          </p>
          <p>
            <span className="font-mono mr-2 text-[10px] uppercase tracking-[0.15em] text-background/55">정중히 사양</span>
            카운트다운으로 압박하거나 ‘딸깍 자동화·하루 1시간이면 누구나’ 같은 강의를 찾으시는 분
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
            준비되는 대로 여기서 바로 작성하실 수 있게 올려드릴게요.<br />
            그 전에 궁금한 점 있으시면 위 <span className="font-bold text-foreground">단톡방</span> 또는{" "}
            <span className="font-bold text-foreground">1:1 카톡</span>으로 먼저 편하게 물어봐 주세요.
          </p>
        </div>
      )}
    </Section>
  )
}
