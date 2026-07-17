import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

// 카피 원천: docs/ax-business/07-differentiation.md — 2-1(자기 사업 운영자)·2-3(풀스택)·2-4(정량 사례집)
// 2-5(투명 가격)는 가격 섹션 비공개 상태(page.tsx SHOW_PRICING=false)와 모순되어 제외
// 모노 넘버는 넣지 않는다 — 바로 위 자가진단 섹션이 같은 넘버 리스트라 인접 반복이 됨
// '연매출 10억' 크리덴셜은 히어로·파운더 2곳에만 — 여기서 또 쓰면 광고 카피로 읽힘
const ROWS: {
  usual: string;
  claim: ReactNode;
  detail: ReactNode;
}[] = [
  {
    usual:
      "컨설팅 조직이 진단하고 제안합니다. 자동화로 돌아가는 자기 사업이 없는 경우가 대부분입니다.",
    claim: <>남의 회사를 실험대로 쓰지 않습니다</>,
    detail: (
      <>
        우리 SaaS를 직접 운영하며 우리 직원들의 반복업무부터 자동화했습니다. 실제로 돌아가는
        것만 남의 회사에 적용합니다.
      </>
    ),
  },
  {
    usual:
      "보고서를 전달하고 퇴장하거나, 구축은 외주로 넘깁니다. 전략을 세운 사람과 만드는 사람이 다릅니다.",
    claim: <>전략부터 코드까지, 같은 사람이 끝까지 갑니다</>,
    detail: (
      <>
        진단, 설계, 구축, 운영을 한 사람이 책임집니다. 풀스택 개발자라서 가능한 구조입니다.
      </>
    ),
  },
  {
    usual:
      "사례집 수치가 얇거나, 전제 없는 자기보고 수치가 대부분입니다. 출처를 따라가면 확인되지 않는 ‘94% 단축’ 같은 숫자도 돌아다닙니다.",
    claim: <>전제 조건을 붙인 실측 수치만 보여드립니다</>,
    detail: (
      <>
        같은 솔루션도 회사 조건에 따라 자동화율이 <span className="num">40%p</span> 이상
        벌어집니다. 그래서 어떤 조건에서 나온 숫자인지부터 밝히고, before/after 실측으로만
        말합니다.
      </>
    ),
  },
];

export default function Differentiators() {
  return (
    <div className="mt-14">
      {ROWS.map(({ usual, claim, detail }, i) => (
        <Reveal key={i} delay={i * 100}>
          <div className="grid gap-6 border-t border-[var(--line)] py-10 md:grid-cols-12 md:gap-10 md:py-14">
            {/* 좌: 시장의 일반적 접근 — 시각적으로 가라앉힘 */}
            <div className="md:col-span-5">
              <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--dim)]">
                보통은
              </span>
              <p className="mt-4 max-w-[38ch] text-sm leading-relaxed text-[var(--dim)]">{usual}</p>
            </div>
            {/* 우: howzero의 접근 — 무게 */}
            <div className="md:col-span-7">
              <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--cobalt)]">
                howzero는
              </span>
              <h3 className="display mt-3 max-w-[24ch] text-xl leading-snug sm:text-2xl lg:text-[1.75rem]">
                {claim}
              </h3>
              <p className="mt-4 max-w-[46ch] leading-relaxed text-[var(--dim)]">{detail}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
