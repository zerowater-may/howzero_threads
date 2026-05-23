import { Section } from "./section"

/**
 * 03 신뢰 증거 — 현업 사실 지표 4카드 + "1기 모집 중" 후기 자리.
 * 운영 입력 placeholder: 4카드의 b 값을 운영자가 실제 값으로 교체.
 */
const facts = [
  { b: "운영 중", k: "직접 운영 스토어", note: "운영 입력" },
  { b: "직접 등록", k: "직접 올린 상품 수", note: "운영 입력" },
  { b: "현업 + 강의", k: "현업 셀러 + 강의·상담", note: "운영 입력" },
  { b: "육아 병행", k: "직장인·육아아빠 셀러", note: "사실" },
]

export function TrustEvidence() {
  return (
    <Section
      label="왜 믿어도 되나"
      title={<>강사이기 전에, 지금도 직접 올리는 셀러입니다.</>}
      lead="화려한 수익 자랑 대신, 확인 가능한 사실만 둡니다. 아래 값은 운영자가 실제 숫자로 채웁니다."
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {facts.map((f) => (
          <div
            key={f.k}
            className="border-2 border-foreground bg-background p-5 transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="text-xl font-bold tracking-tight">{f.b}</div>
            <div className="mt-2 text-sm text-foreground/65">{f.k}</div>
            <div className="font-mono mt-3 text-[10px] uppercase tracking-[0.1em] text-foreground/40">
              {f.note}
            </div>
          </div>
        ))}
      </div>

      {/* 1기 후기 자리 — 정직 placeholder */}
      <div className="mt-6 border-l-4 border-foreground bg-background p-6">
        <p className="text-sm leading-relaxed text-foreground/75">
          <span className="font-bold text-foreground">후기 자리 — 1기 모집 중.</span>{" "}
          이 자리에는 1기 수강생의 실제 후기가 들어갑니다. 첫 후기를 함께 만들 분을 찾습니다.
          가짜 후기나 부풀린 숫자는 넣지 않습니다.{" "}
          <span className="text-foreground/45">(운영 입력 — 1기 종료 후 교체)</span>
        </p>
      </div>
    </Section>
  )
}
