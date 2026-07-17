import type { ReactNode } from "react";

// 카피 원천: docs/ax-business/06-value-prop-소구점.md §4 반박 처리 R1~R6 (반말 스크립트 → 존댓말 재작성)
// 아코디언 금지 — 전 문항 펼침. 숨기지 않고 다 보여주는 게 브랜드 톤과 일치
const FAQ_ITEMS: { num: string; q: string; a: ReactNode }[] = [
  {
    num: "01",
    q: "비용이 얼마나 드나요?",
    a: (
      <>
        비교 대상은 신입 1명의 연봉입니다. 착수와 리테이너를 분리한 구조라,{" "}
        <span className="text-[var(--ink)]">효과가 숫자로 안 나오면 리테이너로 전환하지 않으시면 됩니다</span>.
        그래서 진단에서 절감 시간 × 시급으로 ROI부터 계산해 드립니다.
      </>
    ),
  },
  {
    num: "02",
    q: "GPT는 이미 쓰고 있는데요",
    a: (
      <>
        잘하고 계신 겁니다. 다만 GPT 구독은 사람이 물어봐야 돌아갑니다. 저희가 만드는 건{" "}
        <span className="text-[var(--ink)]">사람이 안 물어봐도 돌아가는 쪽</span>입니다. 채팅창에 복붙하는
        시간도 결국 대표님 시간입니다.
      </>
    ),
  },
  {
    num: "03",
    q: "전에 자동화 해봤는데 실패했습니다",
    a: (
      <>
        대부분은 자동화가 아니라 <span className="text-[var(--ink)]">업무 선정이 실패한 경우</span>입니다.
        그래서 진단에서 ROI 순서로 업무를 자르고, 구축 후 운영까지 책임집니다. 같은 솔루션도 회사 조건에 따라
        결과가 크게 갈리기 때문에, 조건부터 봅니다.
      </>
    ),
  },
  {
    num: "04",
    q: "고객 데이터가 외부로 나가지 않나요?",
    a: (
      <>
        맞는 걱정이고, 설계 단계에서 답할 문제입니다.{" "}
        <span className="text-[var(--ink)]">데이터가 어디로 가는지부터 그림으로 보여드립니다</span>. 셀프호스팅
        옵션, 민감 필드는 LLM에 보내지 않는 설계, 학습에 쓰지 않는 API 계약까지 가능합니다. 저희 회사 데이터도
        같은 규칙으로 돌립니다.
      </>
    ),
  },
  {
    num: "05",
    q: "우리 업무는 특수해서 안 될 것 같은데요",
    a: (
      <>
        맞을 수도 있습니다. 그래서 전체가 아니라 반복 구간만 자릅니다. 특수한 판단은 사람에게 남기고, 그 앞뒤의
        복사, 전달, 입력만 지웁니다. 진단해 보고{" "}
        <span className="text-[var(--ink)]">자동화할 게 없으면 없다고 말씀드립니다</span>.
      </>
    ),
  },
  {
    num: "06",
    q: "직원들이 반발하지 않을까요?",
    a: (
      <>
        <span className="text-[var(--ink)]">대체가 아니라 잡무 제거로 설계합니다</span>. 없어지는 건 사람이
        아니라 복붙과 엑셀 취합, 같은 질문에 같은 답하기입니다. 저희 회사에서 먼저 해봤고, 반발이 아니라
        &lsquo;이거 왜 이제 했냐&rsquo;는 반응이 나왔습니다. 도입 시 직원 인터뷰부터 시작하는 이유입니다.
      </>
    ),
  },
];

export default function Faq() {
  return (
    <div className="grid gap-x-14 gap-y-12 md:grid-cols-2">
      {FAQ_ITEMS.map(({ num, q, a }) => (
        // 넘버를 고정폭 컬럼으로 — 질문과 답변의 좌측 엣지를 픽셀 단위로 정렬
        <div key={num} className="grid grid-cols-[2.25rem_1fr] items-baseline">
          <span className="font-[family-name:var(--font-mono)] text-sm font-semibold text-[var(--cobalt)]">
            {num}
          </span>
          <h3 className="display text-lg sm:text-xl">{q}</h3>
          <p className="col-start-2 mt-3 leading-relaxed text-[var(--dim)]">{a}</p>
        </div>
      ))}
    </div>
  );
}
