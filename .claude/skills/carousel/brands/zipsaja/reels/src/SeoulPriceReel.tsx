import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadJua } from "@remotion/google-fonts/Jua";
import { loadFont as loadNoto } from "@remotion/google-fonts/NotoSansKR";
import { loadFont as loadGaegu } from "@remotion/google-fonts/Gaegu";
import type { SeoulPriceDataset } from "./data/seoulPriceTypes";

loadJua();
loadNoto();
loadGaegu();

export const FPS = 30;
export const SEOUL_PRICE_TOTAL_FRAMES = 660; // 22s

const BG = "#F0E7D6";
const ACCENT = "#EA2E00";
const INK = "#1a1a1a";
const CREAM_BOX = "#F5EDE0";
const BAR_POS = "#EA2E00";
const BAR_NEG = "#1A4FA0";

export const SeoulPriceReel: React.FC<{ data: SeoulPriceDataset }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: "Noto Sans KR" }}>
      <Header frame={frame} fps={fps} data={data} />
    </AbsoluteFill>
  );
};

const Header: React.FC<{ frame: number; fps: number; data: SeoulPriceDataset }> = ({
  frame,
  fps,
  data,
}) => {
  // 0~15f: bookmark flag slide-down + title pill scale-in
  const flagY = interpolate(frame, [0, 10], [-80, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const pillScale = spring({
    frame: frame - 5,
    fps,
    config: { damping: 12, stiffness: 200 },
  });
  // 15~30f: 부제 fade + slide-up
  const subOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateRight: "clamp" });
  const subY = interpolate(frame, [15, 30], [24, 0], { extrapolateRight: "clamp" });
  // 60~90f: flag fade-out
  const flagOpacity = interpolate(frame, [60, 90], [1, 0], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: 0,
        width: 1080,
        textAlign: "center",
      }}
    >
      {/* bookmark flag */}
      <div
        style={{
          transform: `translateY(${flagY}px)`,
          opacity: flagOpacity,
          marginBottom: 18,
        }}
      >
        <svg width="48" height="70" viewBox="0 0 48 70">
          <path d="M4 0 H44 V60 L24 48 L4 60 Z" fill={ACCENT} />
        </svg>
      </div>

      {/* 메타 pill */}
      <div
        style={{
          fontFamily: "Noto Sans KR",
          fontWeight: 700,
          fontSize: 26,
          color: INK,
          opacity: subOpacity,
          marginBottom: 14,
        }}
      >
        <MetaPill label={data.sizeLabel} />
      </div>

      {/* 제목 (Jua 굵게) */}
      <div
        style={{
          fontFamily: "Jua",
          fontSize: 110,
          lineHeight: 1.05,
          color: INK,
          transform: `scale(${pillScale})`,
          letterSpacing: -2,
        }}
      >
        서울 실거래 1년간 변화
      </div>

      {/* 기간 안내 */}
      <div
        style={{
          marginTop: 22,
          fontFamily: "Noto Sans KR",
          fontWeight: 500,
          fontSize: 28,
          color: "#444",
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
        }}
      >
        {data.periodLabel} · 출처 {data.source}
      </div>
    </div>
  );
};

const MetaPill: React.FC<{ label: string }> = ({ label }) => (
  <span
    style={{
      display: "inline-block",
      background: ACCENT,
      color: "#fff",
      padding: "10px 24px",
      borderRadius: 999,
      fontFamily: "Jua",
      fontSize: 30,
      letterSpacing: -1,
    }}
  >
    {label}
  </span>
);
