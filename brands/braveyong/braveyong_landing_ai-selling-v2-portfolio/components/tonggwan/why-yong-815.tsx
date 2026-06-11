import { Section } from "@/components/section"
import { Signature } from "@/components/handwriting"

export function WhyYong815() {
  return (
    <Section id="why-yong" label="WHO" title={<>왜 용팀장인가</>}>
      <div className="mx-auto max-w-2xl space-y-4 text-base leading-relaxed text-foreground/80 sm:text-lg">
        <p>
          구매대행·글로벌 위탁판매 현직 셀러이자, 수많은 셀러의 실전 세팅을 직접 잡아온 사람.
          제도 바뀔 때마다 "그래서 오늘 뭘 하면 되는지"를 단계로 정리해 왔습니다.
        </p>
        <p>
          이번 통관 변화도 똑같습니다. 막연한 공지 말고, <span className="font-bold text-foreground">은행 문의 멘트부터 우회로까지</span>
          실행 단위로 떠먹여 드립니다.
        </p>
        <Signature className="pt-2">용감한 용팀장</Signature>
      </div>
    </Section>
  )
}
