import { Section } from "@/components/section"

const STEPS: [string, string][] = [
  ["신청폼 작성", "이름·휴대폰 번호 입력"],
  ["결제선생으로 결제", "카톡/카드로 안전결제"],
  ["오픈채팅방 입장", "결제 후 화면의 '입장 링크 받기'로 카톡방 입장"],
  ["6/21 라이브", "방에서 일정 안내 → 당일 라이브 참여"],
]

export function Flow815() {
  return (
    <Section
      id="flow"
      label="HOW IT WORKS"
      title={<>결제하면 끝이 아닙니다</>}
      lead="결제 후 바로 카톡 오픈채팅방으로 들어와, 6/21까지 방에서 챙겨드립니다."
    >
      <div className="grid gap-4 sm:grid-cols-4">
        {STEPS.map(([t, d], i) => (
          <div key={i} className="relative border-2 border-foreground p-4">
            <span className="font-mono text-2xl font-bold text-brand">{i + 1}</span>
            <h3 className="mt-1 text-sm font-bold">{t}</h3>
            <p className="mt-1 text-xs leading-relaxed text-foreground/70">{d}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
