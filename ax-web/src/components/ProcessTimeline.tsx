// 서버 컴포넌트 — 인터랙션 없음 (스펙 §2 #4)
const STEPS = [
  ["01", "진단", "업무 인벤토리 → 시간/빈도 → 오류 비용. 새는 곳을 숫자로 특정", "TRIGGER"],
  ["02", "설계", "자동화 적합성 판정과 우선순위. 효과 큰 것부터, 안 되는 건 안 된다고", "AI"],
  ["03", "구축", "직접 만듭니다. 기존 툴 연동부터 커스텀 개발까지 — 외주 하청 없음", "AI"],
  ["04", "운영", "굴러가는지까지 책임. 팀이 직접 쓰도록 정착시키고 유지보수", "RUNNING"],
] as const;

export default function ProcessTimeline() {
  return (
    <ol className="canvas-dots mt-10 grid gap-6 rounded-xl border border-[var(--line)] p-6 md:grid-cols-[1.35fr_1fr_1fr_1fr] md:gap-0">
      {STEPS.map(([num, title, desc, badge], i) => (
        <li key={num} className="relative h-full md:px-3">
          {i < 3 && (
            <span
              aria-hidden
              className="absolute right-[-12px] top-8 hidden h-px w-6 border-t border-dashed border-[var(--dim)]/40 md:block"
            />
          )}
          <div
            className={`card-lift h-full rounded-2xl border bg-[var(--card)] p-5 ${
              badge === "AI" ? "border-[var(--cobalt)]/40" : "border-[var(--line)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-mono)] text-sm font-semibold text-[var(--cobalt)]">{num}</span>
              <span
                className={`rounded px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[9px] font-semibold ${
                  badge === "RUNNING" ? "bg-[var(--ok)] text-black pulse-dot" : badge === "AI" ? "bg-[var(--cobalt)] text-white" : "bg-zinc-600 text-white"
                }`}
              >
                {badge}
              </span>
            </div>
            <h3 className="display mt-2 text-xl">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--dim)]">{desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
