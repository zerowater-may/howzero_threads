import { cn } from "@/lib/utils";

// 바이오마커 카드 스타일 지표 카드 — 딥블랙 유리 + 대형 tabular 숫자 + 색 액센트 틱
// + 점 산포 트렌드(baseline + 링 강조점) + 앰비언트 글로우. (레퍼런스: 헬스 대시보드 컨셉)

type Tone = "ok" | "warn" | "crit" | "neutral";

const TONE: Record<Tone, { accent: string; glow: string; dot: string; ring: string; delta: string }> = {
  ok: { accent: "#a3e635", glow: "rgba(163,230,53,0.10)", dot: "#a3e635", ring: "#a3e635", delta: "text-lime-300" },
  warn: { accent: "#fbbf24", glow: "rgba(251,191,36,0.10)", dot: "#fbbf24", ring: "#fbbf24", delta: "text-amber-300" },
  crit: { accent: "#f87171", glow: "rgba(248,113,113,0.12)", dot: "#f87171", ring: "#f87171", delta: "text-red-300" },
  neutral: { accent: "#7dd3fc", glow: "rgba(125,211,252,0.08)", dot: "#e5e7eb", ring: "#7dd3fc", delta: "text-sky-300" },
};

export interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  tone?: Tone;
  direction?: "up" | "down";
  delta?: string;
  note?: string;
  /** 트렌드 점들 (y: 0~1, 위가 1). 마지막 점이 현재값(링 강조). */
  points: number[];
}

export function MetricCard({ label, value, unit, tone = "neutral", direction, delta, note, points }: MetricCardProps) {
  const t = TONE[tone];
  const W = 220;
  const H = 64;
  const padX = 10;
  const baseY = H * 0.62;
  const step = points.length > 1 ? (W - padX * 2) / (points.length - 1) : 0;
  const coords = points.map((p, i) => ({ x: padX + i * step, y: H - padX - p * (H - padX * 2) }));
  const last = coords[coords.length - 1];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 backdrop-blur-md">
      {/* 앰비언트 글로우 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 opacity-70 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
        style={{ background: `radial-gradient(60% 60% at 30% 120%, ${t.glow}, transparent 70%)` }}
      />
      {/* 상단 하이라이트 */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative flex flex-col gap-4">
        {/* 라벨 + 액센트 틱 */}
        <div className="flex items-center gap-2">
          <span aria-hidden className="h-3.5 w-[3px] rounded-full" style={{ background: t.accent }} />
          <span className="text-[13px] font-medium tracking-tight text-white/55">{label}</span>
        </div>

        {/* 대형 값 + 단위 + 방향 */}
        <div className="flex items-end gap-2">
          <span className="text-[2.75rem] font-light leading-none tabular-nums tracking-tight text-white/95">{value}</span>
          {unit && <span className="mb-1 text-sm text-white/40">{unit}</span>}
          {direction && (
            <span className="mb-1.5 ml-auto text-white/35" aria-hidden>
              {direction === "up" ? "↗" : "↘"}
            </span>
          )}
        </div>

        {delta && <span className={cn("-mt-2 text-xs tabular-nums", t.delta)}>{delta}</span>}

        {/* 점 산포 트렌드 */}
        <svg viewBox={`0 0 ${W} ${H}`} className="h-14 w-full" preserveAspectRatio="none">
          <line x1={padX} y1={baseY} x2={W - padX} y2={baseY} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          {coords.slice(0, -1).map((c, i) => (
            <circle key={i} cx={c.x} cy={c.y} r="2.5" fill="rgba(255,255,255,0.55)" />
          ))}
          {/* 현재값: 링 강조 */}
          <circle cx={last.x} cy={last.y} r="3" fill={t.dot} />
          <circle cx={last.x} cy={last.y} r="6.5" fill="none" stroke={t.ring} strokeWidth="1.25" opacity="0.85" />
        </svg>

        {note && <span className="text-xs leading-snug text-white/40">{note}</span>}
      </div>
    </div>
  );
}
