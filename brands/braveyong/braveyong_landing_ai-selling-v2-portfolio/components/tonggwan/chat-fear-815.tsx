import { Section } from "@/components/section"
import { ArrowNote } from "@/components/handwriting"

/**
 * 가상 시나리오 — 8월 등록 앞둔 셀러들의 막막함을 가상의 대화 장면으로 표현.
 * 정직 가드: 특정 단톡방·실대화의 인용이 아님을 lead와 주석에 명시 (가상 재구성).
 * 실제 커뮤니티에서 오간 문장·수치·말투를 그대로 쓰지 않는다.
 * 전환 설계: 막막함 나열 → '상황 보고 움직이자'가 제일 위험한 답 → 6/21에 전부 답이 나온다.
 */
type Bubble = {
  who: string
  text: string
  /** 제일 위험한 답 — 손글씨 화살표로 강조 */
  dangerous?: boolean
}

const BUBBLES: Bubble[] = [
  { who: "사장님 1", text: "8월 전에 등록 못 끝내면 수입이 멈춘다는데, 어디서부터 손대야 할지 모르겠네요" },
  { who: "사장님 2", text: "사업자 수만큼 인증서가 필요하다는 얘길 오늘 처음 들었어요. 저 사업자 여러 개인데…" },
  { who: "사장님 3", text: "주거래 은행 다녀왔는데 요즘은 신규 계좌 자체를 잘 안 내준다고 하더라고요" },
  { who: "사장님 4", text: "어떤 분은 된다고 하고 어떤 분은 안 된다고 하고… 정확히 아는 사람이 없어요" },
  { who: "사장님 5", text: "인증서 비용 알아봤더니 사업자 수만큼 곱해지고, 내년에 또 내야 한다네요" },
  { who: "사장님 6", text: "다음 달에 물량 들어올 게 있어서 더 불안합니다. 시간이 부족해요" },
  { who: "사장님 7", text: "좀 더 상황 보고 움직여도 되지 않을까요?", dangerous: true },
]

export function ChatFear815() {
  return (
    <Section
      id="chat-fear"
      tone="light"
      label="가상 시나리오"
      title={<>지금 셀러들 사이 공기, 대충 이렇습니다.</>}
      lead="특정 대화를 옮긴 게 아니라, 8월 등록을 앞둔 셀러들이 겪는 상황을 가상의 대화로 재구성한 장면입니다. 그런데 어딘가 익숙할 겁니다."
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
          공통점이 하나 있죠 — <span className="font-bold text-foreground">정확히 아는 사람이 없다</span>는 것.
          그래서 다들 멈춰 있습니다. 멈춰 있는 동안 8월은 옵니다.
        </p>
        <p className="mt-3 text-base font-bold leading-relaxed text-foreground sm:text-lg">
          6/21 밤, 이 막막함 전부에 답을 드립니다. 인증서에 매년 돈 쓸 필요가 없는 경로까지 —{" "}
          <span className="text-brand">대기업에서 공인인증서를 만들던 사람</span>이 순서대로 보여드립니다.
        </p>
      </div>
    </Section>
  )
}
