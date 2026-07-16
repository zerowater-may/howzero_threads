import { Section } from "./section"
import { Marker } from "./handwriting"

/** 06 AI 직원 정의 — 묻는 AI vs 시키는 AI + 업무 범위 6 + 검수는 사람 */
const duties = [
  { k: "① 물건 찾기 (소싱 리서치)", v: "기준대로 추림" },
  { k: "② 상품명 · SEO 세팅안", v: "초안 생성" },
  { k: "③ 상세페이지 문구", v: "초안 생성" },
  { k: "④ 썸네일 시안", v: "시안 제작" },
  { k: "⑤ 고객 문의 답변 (CS)", v: "초안 준비" },
  { k: "⑥ 주문 · 정산 정리", v: "데이터 요약" },
]

export function AIDefinition() {
  return (
    <Section
      label="AI 직원이란"
      title={
        <>
          AI한테 묻지 말고, 시키세요.<br />
          채팅 <span className="whitespace-nowrap">한 줄에</span> 결과물이 오는 게 직원입니다.
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="border-l-4 border-foreground bg-background p-6">
          <p className="text-lg font-bold leading-snug sm:text-xl">
            챗GPT에 &lsquo;뭐 팔까요?&rsquo; 물어보면 뻔한 답이 나옵니다.<br />
            &lsquo;이 기준대로 소싱해서 등록 준비해 줘&rsquo; 하고 시키면<br />
            <Marker>결과물이</Marker> 옵니다. 이게 AI 직원이에요.
          </p>
          <p className="mt-4 font-memo text-base leading-relaxed text-foreground/70 sm:text-lg">
            단, 이 직원은 <Marker>가르친 만큼만</Marker> 일합니다.<br />
            소싱·SEO 기준이 곧 월급이에요.<br />
            그 기준 만드는 법을 5주 동안 같이 익혀 갑니다.
          </p>
        </div>

        <div className="border-2 border-foreground bg-background">
          <div className="font-mono border-b-2 border-foreground px-4 py-2 text-[10px] uppercase tracking-[0.15em]">
            AI 직원의 업무 범위
          </div>
          <ul className="divide-y divide-foreground/10">
            {duties.map((it) => (
              <li key={it.k} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="text-sm font-medium">{it.k}</span>
                <span className="font-mono flex-none rounded-full border border-foreground/30 px-2.5 py-1 text-[10px] uppercase tracking-wider">
                  {it.v}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t-2 border-foreground bg-foreground px-4 py-2.5 text-xs font-bold text-background sm:text-sm">
            단, 마지막 검수는 반드시 사람이 — 사장인 내가 합니다.
          </div>
        </div>
      </div>
    </Section>
  )
}
