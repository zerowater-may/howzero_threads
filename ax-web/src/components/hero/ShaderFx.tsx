"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// WebGL 실패 시(로드 에러 포함) 정적 오렌지 원으로 폴백 — 스펙 §6
const LiquidMetal = dynamic(
  () => import("@paper-design/shaders-react").then((m) => m.LiquidMetal),
  { ssr: false, loading: () => <OrbFallback /> },
);
const PulsingBorder = dynamic(
  () => import("@paper-design/shaders-react").then((m) => m.PulsingBorder),
  { ssr: false, loading: () => null },
);

function OrbFallback() {
  return <div className="h-[56px] w-[56px] rounded-full bg-[var(--cobalt)]/40 blur-sm" />;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

// shaders-chat-app 레퍼런스 파라미터 이식 (오렌지 팔레트)
export function Orb() {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <div className="relative flex h-[80px] w-[80px] items-center justify-center">
        <OrbFallback />
      </div>
    );
  }
  return (
    <div className="relative flex h-[80px] w-[80px] items-center justify-center">
      <LiquidMetal
        style={{ height: 80, width: 80, filter: "blur(14px)", position: "absolute" }}
        colorBack="hsl(0, 0%, 0%, 0)"
        colorTint="hsl(29, 77%, 49%)"
        repetition={4}
        softness={0.5}
        shiftRed={0.3}
        shiftBlue={0.3}
        distortion={0.1}
        contour={1}
        shape="circle"
        scale={0.58}
        rotation={50}
        speed={5}
      />
      <LiquidMetal
        style={{ height: 80, width: 80 }}
        colorBack="hsl(0, 0%, 0%, 0)"
        colorTint="hsl(29, 77%, 49%)"
        repetition={4}
        softness={0.5}
        shiftRed={0.3}
        shiftBlue={0.3}
        distortion={0.1}
        contour={1}
        shape="circle"
        scale={0.58}
        rotation={50}
        speed={5}
      />
    </div>
  );
}

export function FocusBorder({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  if (reduced || !active) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center transition-opacity duration-700"
      style={{ opacity: 1 }}
    >
      <PulsingBorder
        style={{ height: "146.5%", minWidth: "143%" }}
        colorBack="hsl(0, 0%, 0%)"
        roundness={0.18}
        thickness={0}
        softness={0}
        intensity={0.3}
        bloom={2}
        spots={2}
        spotSize={0.25}
        pulse={0}
        smoke={0.35}
        smokeSize={0.4}
        scale={0.7}
        speed={1}
        colors={[
          "hsl(29, 70%, 37%)",
          "hsl(32, 100%, 83%)",
          "hsl(4, 32%, 30%)",
          "hsl(25, 60%, 50%)",
          "hsl(0, 100%, 10%)",
        ]}
      />
    </div>
  );
}
