import { MetricCard } from "@/components/metrics/MetricCard";

// 데모 — 헬스 대시보드 바이오마커 카드 느낌을 hz-os 지표로. (인증 없음, 스타일 판단용)
export default function MetricsDemo() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] px-6 py-16">
      {/* 앰비언트 글로우 (레퍼런스의 컬러 번짐) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 40% at 80% 110%, rgba(248,113,113,0.10), transparent 60%), radial-gradient(45% 35% at 15% 90%, rgba(163,230,53,0.06), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">Live metrics</p>
        <h1 className="mb-10 text-2xl font-light tracking-tight text-white/90">운영 지표</h1>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MetricCard
            label="마진율"
            value="68.4"
            unit="%"
            tone="ok"
            direction="up"
            delta="+4.2%p"
            note="전 분기 대비 상승 · 임계 30% 여유"
            points={[0.35, 0.42, 0.3, 0.55, 0.48, 0.62, 0.7]}
          />
          <MetricCard
            label="상담 → 계약 전환율"
            value="12.3"
            unit="%"
            tone="warn"
            direction="up"
            delta="목표 15% 근접"
            note="상위 참조 범위 근접"
            points={[0.5, 0.4, 0.55, 0.45, 0.5, 0.58, 0.6]}
          />
          <MetricCard
            label="진행 프로젝트 진척"
            value="43"
            unit="%"
            tone="neutral"
            direction="up"
            note="SHCO 코스 플랫폼 · 8단계 중 4단계 진행"
            points={[0.2, 0.28, 0.35, 0.3, 0.4, 0.45, 0.5]}
          />
          <MetricCard
            label="저마진 경고"
            value="2"
            unit="건"
            tone="crit"
            direction="up"
            delta="+1건"
            note="이전 기준선보다 높음 · 즉시 확인 필요"
            points={[0.4, 0.35, 0.5, 0.45, 0.55, 0.6, 0.72]}
          />
        </div>
      </div>
    </div>
  );
}
