import { Section } from "@/components/section"
import { ArrowNote } from "@/components/handwriting"

/**
 * 단톡방 실황 — 실제 구매대행 단톡방에서 오간 공포·혼란을 익명 말풍선으로 재구성.
 * 정직 가드: 캡처 이미지·닉네임·신원 미노출, "익명으로 옮겼다" 명시. 내용은 실대화 기반.
 * 전환 설계: 공포 나열 → '기다려보자'가 제일 위험한 답 → 6/21에 전부 답이 나온다.
 */
type Bubble = {
  who: string
  text: string
  /** 제일 위험한 답 — 손글씨 화살표로 강조 */
  dangerous?: boolean
}

const BUBBLES: Bubble[] = [
  { who: "셀러 A", text: "안 하면 8월부터 네이버 짤린대요…" },
  { who: "셀러 B", text: "사업자별로 다 만들어야 하나요? 공지가 어디 있나요 ㅠㅠ" },
  { who: "셀러 C", text: "은행에 물어보니 통장은 사업자별로 하나씩 연결해야 한대요. 개설이 안 돼서 민원 넣는 중 ㅠ" },
  { who: "셀러 D", text: "계좌는 20영업일에 하나밖에 못 만들잖아요. 민원 넣어도 소용없을걸요 ㅠㅠ" },
  { who: "셀러 E", text: "사업자 공인인증서, 88,000원밖에 답이 없을까요?" },
  { who: "셀러 F", text: "비대면 발급은 1년 4만 원, 3년 18만 원이래요. 단체 할인 딜이라도 해야 하나 ㅋㅋ" },
  { who: "셀러 G", text: "일단 좀 기다려보는 게 좋을 것 같아요", dangerous: true },
]

export function ChatFear815() {
  return (
    <Section
      id="chat-fear"
      tone="light"
      label="단톡방 실황"
      title={<>지금 구매대행 단톡방, 이렇게 돌아갑니다.</>}
      lead="실제 단톡방에서 오간 이야기들을 익명으로 옮겼습니다. 어딘가 익숙하다면 — 당신 방도 지금 이럴 겁니다."
    >
      {/* 익명 말풍선 — 메신저 톤 */}
      <div className="mx-auto flex max-w-xl flex-col gap-3">
        {BUBBLES.map((b) => (
          <div key={b.text} className="flex flex-col items-start">
            <span className="font-mono mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/40">
              {b.who}
            </span>
            <div className="relative max-w-[88%]">
              <p
                className={`rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed sm:text-base ${
                  b.dangerous
                    ? "border-2 border-brand bg-brand/[0.07] font-bold text-foreground"
                    : "bg-foreground/[0.06] text-foreground/85"
                }`}
              >
                {b.text}
              </p>
              {b.dangerous && (
                <div className="absolute -right-2 -top-7 sm:-right-28 sm:top-1">
                  <ArrowNote>제일 위험한 답</ArrowNote>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 전환 — 이 방엔 답이 없다, 답은 6/21에 */}
      <div className="mx-auto mt-10 max-w-xl border-l-2 border-brand bg-brand/[0.05] px-5 py-4">
        <p className="text-base leading-relaxed text-foreground/85 sm:text-lg">
          이 방에 <span className="font-bold text-foreground">답을 아는 사람이 없습니다.</span> 그래서
          ‘기다려보자’는 말만 돕니다 — 기다리는 동안 마감은 옵니다.
        </p>
        <p className="mt-3 text-base font-bold leading-relaxed text-foreground sm:text-lg">
          6/21 밤, 위 질문 전부에 답을 드립니다. 인증서에 4만~18만 원을 써야 하나 고민할 필요도
          없게요 — <span className="text-brand">대기업에서 공인인증서를 만들던 사람</span>이 순서대로 보여드립니다.
        </p>
      </div>
    </Section>
  )
}
