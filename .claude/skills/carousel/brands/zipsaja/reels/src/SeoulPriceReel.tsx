import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadJua } from "@remotion/google-fonts/Jua";
import { loadFont as loadNoto } from "@remotion/google-fonts/NotoSansKR";
import { loadFont as loadGaegu } from "@remotion/google-fonts/Gaegu";
import { formatWon, type SeoulPriceDataset } from "./data/seoulPriceTypes";

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

  const maxAbsChange = Math.max(
    ...data.districts.map((d) => Math.abs(d.changePct)),
    10,
  );

  const ROWS_START_FRAME = 30;
  const ROW_STAGGER = 6;
  const TABLE_TOP = 620;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: "Noto Sans KR" }}>
      <Header frame={frame} fps={fps} data={data} />
      <div
        style={{
          position: "absolute",
          top: TABLE_TOP,
          left: 40,
          width: 1000,
          background: CREAM_BOX,
          border: `3px solid ${INK}`,
          borderRadius: 20,
          padding: "16px 8px",
        }}
      >
        <ColumnHeader frame={frame} />
        {data.districts.map((d, i) => (
          <Row
            key={d.district}
            district={d.district}
            priceLastYear={d.priceLastYear}
            priceThisYear={d.priceThisYear}
            changePct={d.changePct}
            appearFrame={ROWS_START_FRAME + i * ROW_STAGGER}
            frame={frame}
            maxAbsChange={maxAbsChange}
          />
        ))}
      </div>
      <Footer frame={frame} />
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

interface RowProps {
  district: string;
  priceLastYear: number;
  priceThisYear: number;
  changePct: number;
  appearFrame: number;
  frame: number;
  maxAbsChange: number;
}

const Row: React.FC<RowProps> = ({
  district,
  priceLastYear,
  priceThisYear,
  changePct,
  appearFrame,
  frame,
  maxAbsChange,
}) => {
  const local = frame - appearFrame;
  const rowOpacity = interpolate(local, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rowY = interpolate(local, [0, 8], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const barProgress = interpolate(local, [6, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const isPositive = changePct >= 0;
  const barColor = isPositive ? BAR_POS : BAR_NEG;
  const barWidth = (Math.abs(changePct) / maxAbsChange) * 260 * barProgress;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        opacity: rowOpacity,
        transform: `translateY(${rowY}px)`,
        height: 48,
        padding: "0 14px",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          width: 140,
          fontFamily: "Jua",
          fontSize: 30,
          color: ACCENT,
          letterSpacing: -1,
        }}
      >
        {district}
      </div>
      <div
        style={{
          width: 220,
          fontFamily: "Noto Sans KR",
          fontWeight: 700,
          fontSize: 24,
          color: INK,
          textAlign: "right",
          paddingRight: 16,
        }}
      >
        {formatWon(priceLastYear).display}
      </div>
      <div
        style={{
          width: 220,
          fontFamily: "Noto Sans KR",
          fontWeight: 700,
          fontSize: 24,
          color: INK,
          textAlign: "right",
          paddingRight: 16,
        }}
      >
        {formatWon(priceThisYear).display}
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          position: "relative",
          height: 28,
          marginLeft: 10,
        }}
      >
        <div style={{ width: 4, background: "#888", height: "100%" }} />
        <div
          style={{
            width: barWidth,
            height: 20,
            background: barColor,
            marginLeft: isPositive ? 0 : -barWidth,
            transform: isPositive ? "none" : "translateX(-100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: isPositive ? barWidth + 14 : -barWidth - 70,
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: "Noto Sans KR",
            fontWeight: 700,
            fontSize: 22,
            color: barColor,
          }}
        >
          {isPositive ? "+" : ""}
          {changePct.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

const ColumnHeader: React.FC<{ frame: number }> = ({ frame }) => {
  const op = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        display: "flex",
        opacity: op,
        padding: "8px 14px 14px",
        borderBottom: `2px solid ${INK}`,
        marginBottom: 6,
        fontFamily: "Jua",
        fontSize: 24,
        color: INK,
      }}
    >
      <div style={{ width: 140 }}>지역</div>
      <div style={{ width: 220, textAlign: "right", paddingRight: 16 }}>
        25.1.1~4.18
      </div>
      <div style={{ width: 220, textAlign: "right", paddingRight: 16 }}>
        26.1.1~4.18
      </div>
      <div style={{ flex: 1, marginLeft: 10 }}>동일기간 변동률</div>
    </div>
  );
};

const Footer: React.FC<{ frame: number }> = ({ frame }) => {
  const op = interpolate(frame, [600, 630], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        width: 1080,
        textAlign: "center",
        opacity: op,
        fontFamily: "Gaegu",
        fontWeight: 700,
        fontSize: 32,
        color: INK,
      }}
    >
      *자세한 설명은 아래 캡션을 참고해주세요!*
    </div>
  );
};
