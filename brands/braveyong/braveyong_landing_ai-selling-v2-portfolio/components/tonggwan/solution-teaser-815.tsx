import { Section } from "@/components/section"
import { Marker } from "@/components/handwriting"

export function SolutionTeaser815() {
  return (
    <Section id="solution" tone="warm" label="THE KEY" title={<>그런데, 통장 0개로 끝낼 수 있습니다</>}>
      <div className="mx-auto max-w-2xl space-y-5 text-base leading-relaxed sm:text-lg">
        <p>
          기업뱅킹이 요구하는 건 '새로 만든 사업자 통장'이 아니라 <Marker>'연결할 계좌'</Marker>입니다.
          개인사업자는 대표 개인과 사업체가 같은 인격이라, <span className="font-bold">이미 쓰는 개인계좌를 연결</span>해
          기업인터넷뱅킹에 신규 가입하고 무료 인증서를 받을 수 있어요.
        </p>
        <p>
          사업자가 수십 개여도 전부 <span className="font-bold">내 기존 개인계좌 하나에 연결</span> → 추가 통장 0개 →
          20영업일 룰에 애초에 안 걸립니다.
        </p>
        <p className="border-l-2 border-[var(--warm-border)] pl-4 text-base text-foreground/80">
          단, <span className="font-bold">은행·지점·비대면 정책마다 되고 안 되고가 갈립니다.</span>
          되는 경로와, 막혔을 때 빠지는 길까지 정확히 알아야 끝나요. 그 실행 디테일을 6/21에 같이 합니다.
        </p>
        <p className="font-mono text-xs text-foreground/55">
          정확성 3원칙: ① "무조건 된다"는 없다 ② 막혀도 빠질 길이 있다 ③ 지금은 공동·금융인증서(공인인증서는 폐지)
        </p>
      </div>
    </Section>
  )
}
