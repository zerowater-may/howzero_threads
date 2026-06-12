import { Section } from "@/components/section"
import { ArrowNote } from "@/components/handwriting"

/**
 * 단톡방 실황 — 셀러 커뮤니티에 돌고 있는 공포·혼란을 대표 질문으로 재구성한 익명 말풍선.
 * 정직 가드: 실제 대화의 인용이 아니라 '요즘 도는 질문들'의 재구성임을 lead에 명시.
 * 특정 발언·닉네임·수치를 그대로 옮기지 않는다 (발화자 특정 방지).
 * 전환 설계: 공포 나열 → '기다려보자'가 제일 위험한 답 → 6/21에 전부 답이 나온다.
 */
type Bubble = {
  who: string
  text: string
  /** 제일 위험한 답 — 손글씨 화살표로 강조 */
  dangerous?: boolean
}

const BUBBLES: Bubble[] = [
  { who: "셀러 A", text: "등록 안 하면 8월부터 스토어 판매가 막힌다던데, 진짜인가요?" },
  { who: "셀러 B", text: "사업자가 5개면 인증서도 5개 전부 따로 만들어야 한다는 게 맞나요…?" },
  { who: "셀러 C", text: "은행 갔더니 사업자마다 통장이 따로 있어야 한다는데, 신규 개설은 또 안 해준다네요" },
  { who: "셀러 D", text: "통장 만든 지 한 달 안 지나면 새 통장이 안 나오잖아요. 이러다 8월 전에 못 끝낼 것 같은데" },
  { who: "셀러 E", text: "유료 인증서 알아보니 사업자당 몇만 원씩, 그것도 매년이래요. 사업자 많으면 이게 다 돈인데…" },
  { who: "셀러 F", text: "발급 대행 견적도 받아봤는데 생각보다 세네요. 다들 그냥 돈 내고 하시는 건가요?" },
  { who: "셀러 G", text: "일단 다른 방법 나올 때까지 기다려보는 게 낫지 않을까요?", dangerous: true },
]

export function ChatFear815() {
  return (
    <Section
      id="chat-fear"
      tone="light"
      label="단톡방 실황"
      title={<>지금 구매대행 단톡방, 이렇게 돌아갑니다.</>}
      lead="요즘 구매대행 단톡방마다 도는 질문들을 재구성했습니다. 어딘가 익숙하다면 — 당신 방도 지금 이럴 겁니다."
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
          6/21 밤, 위 질문 전부에 답을 드립니다. 유료 인증서에 매년 돈을 써야 하나 고민할 필요도
          없게요 — <span className="text-brand">대기업에서 공인인증서를 만들던 사람</span>이 순서대로 보여드립니다.
        </p>
      </div>
    </Section>
  )
}
