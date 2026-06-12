import { Section } from "@/components/section"

/** 9가지 산출물 — 발급 전·중·후 전 과정 커버 (방법은 비공개, 범위만 노출). gloss는 회색 용어풀이. */
const OUTCOMES: { title: string; gloss?: string }[] = [
  { title: "내 사업자가 8월 등록 대상인지 1분 판별 기준" },
  {
    title: "발급 전 준비서류, 사업자별로 빠짐없이 체크",
    gloss: "신청 전에 갖춰야 할 것부터",
  },
  {
    title: "사업자 10개도 통장 추가 없이 인증서까지 끝내는 ‘경로’",
    gloss: "은행 문의 멘트 포함",
  },
  {
    title: "은행에서 막혀도 빠져나가는 우회로 3종",
    gloss: "정체는 라이브에서",
  },
  {
    title: "신청부터 발급까지 업무 순서 그대로",
    gloss: "전직 공인인증서 담당이 일하던 순서",
  },
  {
    title: "UNI-PASS 통관고유부호 발급 5단계",
    gloss: "관세청 사이트 화면 그대로 따라하기",
  },
  {
    title: "사업자 여러 개 대량 처리 순서",
    gloss: "수십 개도 하루에 끝내는 동선",
  },
  {
    title: "발급 후 매년 갱신·사후관리 루틴까지",
    gloss: "한 번 배우면 매년 당신 것",
  },
  { title: "8월 전 최종 점검 체크리스트" },
]

export function Curriculum815() {
  return (
    <Section
      id="curriculum"
      label="WHAT YOU GET"
      title={<>6월 21일 밤 10시, 당신 손에 남는 9가지.</>}
      lead="발급 전 서류 준비부터 발급 후 매년 갱신까지 — 강의 ‘시청’이 아니라, 8월 전에 끝내는 ‘준비 상태’를 가져가는 자리입니다."
    >
      <div className="grid gap-px overflow-hidden border-2 border-foreground sm:grid-cols-2">
        {OUTCOMES.map((o, i) => (
          <div key={i} className="flex items-start gap-3 bg-background p-5">
            <span aria-hidden className="mt-0.5 shrink-0 text-lg font-bold leading-none text-brand">
              ☑
            </span>
            <div>
              <h3 className="text-base font-bold leading-snug">{o.title}</h3>
              {o.gloss && (
                <p className="mt-1.5 text-xs leading-relaxed text-foreground/55">{o.gloss}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 max-w-2xl text-sm leading-relaxed text-foreground/75 sm:text-base">
        용어 몰라도 됩니다. 통관고유부호·UNI-PASS·공동인증서, 나올 때마다 한 줄씩 풀고 갑니다. 막히면 그
        자리에서 질문하세요 — 그게 라이브로 하는 이유입니다.
      </p>
    </Section>
  )
}
