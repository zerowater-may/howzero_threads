"use client";

import { Component, type ReactNode, useEffect, useState } from "react";
import dynamic from "next/dynamic";

const LanyardScene = dynamic(() => import("./LanyardScene"), { ssr: false, loading: () => null });

// WebGL 실패 시 미표시 — 스펙 §3·§6 (이미지 폴백 없음)
class SilentBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function LanyardBadge() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1360px)");
    const update = () =>
      setEnabled(mq.matches && hasWebGL() && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    update();
    mq.addEventListener("change", update);

    const onScroll = () => setVisible(window.scrollY < window.innerHeight * 0.7);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className="fixed right-4 top-14 z-40 h-[60vh] w-[280px] transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
    >
      <SilentBoundary>
        <LanyardScene
          onCardClick={() => document.getElementById("founder")?.scrollIntoView({ behavior: "smooth" })}
        />
      </SilentBoundary>
    </div>
  );
}
