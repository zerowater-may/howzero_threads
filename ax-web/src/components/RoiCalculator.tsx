"use client";

import { useState } from "react";

// 만원 단위 숫자 → "1,234만원" / 1억 이상 "1억 2,340만원"
// locale 고정: SSR(서버 locale)과 클라이언트 locale이 다르면 hydration mismatch가 나므로 ko-KR 명시
function fmtManwon(n: number): string {
  if (n < 10000) return `${n.toLocaleString("ko-KR")}만원`;
  const eok = Math.floor(n / 10000);
  const rest = n % 10000;
  return rest === 0 ? `${eok}억원` : `${eok}억 ${rest.toLocaleString("ko-KR")}만원`;
}

export default function RoiCalculator() {
  const [headcount, setHeadcount] = useState(8);
  const [hours, setHours] = useState(1.5);
  const [wage, setWage] = useState(350);

  // 월 소정근로 209시간 · 근무일 21.7일 기준 산수 — 과장 없이 입력값 그대로
  const raw = headcount * hours * 21.7 * (wage / 209);
  const monthly = Math.round(raw);
  const bandLow = Math.round(raw * 0.4);
  const bandHigh = Math.round(raw * 0.7);
  const yearly = monthly * 12;

  const sliders = [
    {
      id: "roi-headcount",
      label: "직원 수",
      min: 1,
      max: 50,
      step: 1,
      value: headcount,
      set: setHeadcount,
      display: `${headcount}명`,
    },
    {
      id: "roi-hours",
      label: "1인당 하루 반복업무",
      min: 0.5,
      max: 4,
      step: 0.5,
      value: hours,
      set: setHours,
      display: `${hours}시간`,
    },
    {
      id: "roi-wage",
      label: "평균 월급",
      min: 250,
      max: 700,
      step: 50,
      value: wage,
      set: setWage,
      display: `${wage}만원`,
    },
  ];

  return (
    <div className="grid gap-12 md:grid-cols-12 md:gap-14">
      {/* 입력 — 슬라이더 3개 */}
      <div className="md:col-span-5">
        <p className="text-sm text-[var(--dim)]">슬라이더를 움직여 우리 회사 기준으로 맞춰보세요.</p>
        <div className="mt-8 space-y-9">
          {sliders.map((s) => (
            <div key={s.id}>
              <div className="flex items-baseline justify-between">
                <label htmlFor={s.id} className="text-sm font-medium">
                  {s.label}
                </label>
                <span className="num text-lg">{s.display}</span>
              </div>
              <input
                id={s.id}
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={s.value}
                onChange={(e) => s.set(Number(e.target.value))}
                className="slider mt-3 w-full cursor-pointer"
                style={{ "--fill": `${((s.value - s.min) / (s.max - s.min)) * 100}%` } as React.CSSProperties}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 결과 — 산수는 정직하게, 회수액은 밴드로 */}
      <div className="md:col-span-7">
        <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.12em] text-[var(--dim)]">
          월 반복업무 인건비
        </p>
        <p className="display mt-3 text-2xl leading-snug sm:text-3xl">
          월 <span className="num">{fmtManwon(monthly)}</span>이 반복업무 인건비로 나가고 있습니다
        </p>
        <div className="mt-8 grid gap-7 border-y border-[var(--line)] py-7 sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-[var(--line)]">
          <div className="sm:pr-8">
            <p className="text-sm text-[var(--dim)]">구조를 바꾸면 · 월 회수 밴드</p>
            <p className="num mt-2 text-2xl sm:text-3xl">
              {fmtManwon(bandLow)}~{fmtManwon(bandHigh)}
            </p>
          </div>
          <div className="sm:pl-8">
            <p className="text-sm text-[var(--dim)]">연으로 환산하면</p>
            <p className="num mt-2 text-2xl sm:text-3xl">{fmtManwon(yearly)}</p>
          </div>
        </div>
        <p className="mt-6 max-w-xl font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--dim)]">
          월 209시간·근무일 21.7일 기준 산수입니다. 자동화율은 회사 데이터·연동 상태에 따라 40%p 이상
          갈립니다. 그래서 범위로 보여드리고, 정확한 숫자는 진단에서 뽑습니다.
        </p>
      </div>
    </div>
  );
}
