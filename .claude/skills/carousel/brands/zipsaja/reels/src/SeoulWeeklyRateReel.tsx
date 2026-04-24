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

loadJua();
loadNoto();
loadGaegu();

export const FPS = 30;
export const SEOUL_WEEKLY_RATE_TOTAL_FRAMES = 660;

const BG = "#F0E7D6";
const ACCENT = "#EA2E00";
const INK = "#1a1a1a";
const CREAM_BOX = "#F5EDE0";
const BAR_POS = "#EA2E00";
const BAR_NEG = "#1A4FA0";

interface DistrictRate {
  district: string;
  changePct: number;
}

export interface SeoulWeeklyRateDataset {
  generatedAt: string;
  title1: string;
  title2: string;
  subtitle: string;
  seoulAvg: number;
  nationwide: number;
  source: string;
  districts: DistrictRate[];
}

export const SeoulWeeklyRateReel: React.FC<{ data: SeoulWeeklyRateDataset }> = ({
  data,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const maxAbsChange = Math.max(
    ...data.districts.map((d) => Math.abs(d.changePct)),
    0.1,
  );

  const ROWS_START_FRAME = 36;
  const ROW_STAGGER = 5;
  const TABLE_TOP = 680;

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
            changePct={d.changePct}
            appearFrame={ROWS_START_FRAME + i * ROW_STAGGER}
            frame={frame}
            maxAbsChange={maxAbsChange}
          />
        ))}
      </div>
      <SummaryBadge frame={frame} seoulAvg={data.seoulAvg} nationwide={data.nationwide} />
      <Footer frame={frame} source={data.source} />
    </AbsoluteFill>
  );
};

const Header: React.FC<{
  frame: number;
  fps: number;
  data: SeoulWeeklyRateDataset;
}> = ({ frame, fps, data }) => {
  const flagY = interpolate(frame, [0, 10], [-80, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const title1Scale = spring({
    frame: frame - 5,
    fps,
    config: { damping: 12, stiffness: 200 },
  });
  const title2Scale = spring({
    frame: frame - 15,
    fps,
    config: { damping: 12, stiffness: 200 },
  });
  const subOpacity = interpolate(frame, [22, 38], [0, 1], {
    extrapolateRight: "clamp",
  });
  const subY = interpolate(frame, [22, 38], [24, 0], {
    extrapolateRight: "clamp",
  });
  const flagOpacity = interpolate(frame, [60, 90], [1, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 100,
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
          marginBottom: 14,
        }}
      >
        <svg width="48" height="70" viewBox="0 0 48 70">
          <path d="M4 0 H44 V60 L24 48 L4 60 Z" fill={ACCENT} />
        </svg>
      </div>

      {/* 제목 1 (pill) */}
      <div
        style={{
          transform: `scale(${title1Scale})`,
          marginBottom: 18,
        }}
      >
        <span
          style={{
            display: "inline-block",
            background: ACCENT,
            color: "#fff",
            padding: "14px 36px",
            borderRadius: 999,
            fontFamily: "Jua",
            fontSize: 68,
            letterSpacing: -2,
            lineHeight: 1.05,
          }}
        >
          {data.title1}
        </span>
      </div>

      {/* 제목 2 (검정 텍스트) */}
      <div
        style={{
          transform: `scale(${title2Scale})`,
          fontFamily: "Jua",
          fontSize: 74,
          lineHeight: 1.05,
          color: INK,
          letterSpacing: -2,
        }}
      >
        {data.title2}
      </div>

      {/* 부제 */}
      <div
        style={{
          marginTop: 28,
          fontFamily: "Noto Sans KR",
          fontWeight: 500,
          fontSize: 28,
          color: "#444",
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
        }}
      >
        {data.subtitle}
      </div>
    </div>
  );
};

interface RowProps {
  district: string;
  changePct: number;
  appearFrame: number;
  frame: number;
  maxAbsChange: number;
}

const Row: React.FC<RowProps> = ({
  district,
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
  const barWidth = (Math.abs(changePct) / maxAbsChange) * 180 * barProgress;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        opacity: rowOpacity,
        transform: `translateY(${rowY}px)`,
        height: 40,
        padding: "0 20px",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      {/* 지역명 */}
      <div
        style={{
          width: 180,
          fontFamily: "Jua",
          fontSize: 28,
          color: ACCENT,
          letterSpacing: -1,
        }}
      >
        {district}
      </div>

      {/* 바 영역 (0선 중앙) */}
      <div
        style={{
          position: "relative",
          width: 420,
          height: 26,
          marginRight: 16,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            width: 2,
            height: "100%",
            background: "#888",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: isPositive ? "50%" : `calc(50% - ${barWidth}px)`,
            top: 3,
            width: barWidth,
            height: 20,
            background: barColor,
          }}
        />
      </div>

      {/* 변동률 % */}
      <div
        style={{
          flex: 1,
          textAlign: "right",
          fontFamily: "Noto Sans KR",
          fontWeight: 700,
          fontSize: 26,
          color: barColor,
        }}
      >
        {isPositive ? "+" : ""}
        {changePct.toFixed(2)}%
      </div>
    </div>
  );
};

const ColumnHeader: React.FC<{ frame: number }> = ({ frame }) => {
  const op = interpolate(frame, [26, 42], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        display: "flex",
        opacity: op,
        padding: "8px 20px 14px",
        borderBottom: `2px solid ${INK}`,
        marginBottom: 6,
        fontFamily: "Jua",
        fontSize: 24,
        color: INK,
      }}
    >
      <div style={{ width: 180 }}>지역</div>
      <div style={{ width: 420, textAlign: "center" }}>전주 대비 (0선 중앙)</div>
      <div style={{ flex: 1, textAlign: "right" }}>변동률 (%)</div>
    </div>
  );
};

const SummaryBadge: React.FC<{
  frame: number;
  seoulAvg: number;
  nationwide: number;
}> = ({ frame, seoulAvg, nationwide }) => {
  const op = interpolate(frame, [520, 560], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(frame, [520, 560], [20, 0], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        bottom: 140,
        left: 60,
        right: 60,
        opacity: op,
        transform: `translateY(${y}px)`,
        display: "flex",
        gap: 24,
        justifyContent: "center",
      }}
    >
      <SummaryPill label="서울 평균" value={seoulAvg} color={ACCENT} />
      <SummaryPill label="전국 평균" value={nationwide} color="#555" />
    </div>
  );
};

const SummaryPill: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div
    style={{
      background: "#fff",
      border: `3px solid ${INK}`,
      borderRadius: 20,
      padding: "14px 28px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      boxShadow: "3px 4px 0 rgba(0,0,0,0.08)",
    }}
  >
    <span
      style={{
        fontFamily: "Jua",
        fontSize: 30,
        color: INK,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontFamily: "Noto Sans KR",
        fontWeight: 900,
        fontSize: 38,
        color,
      }}
    >
      +{value.toFixed(2)}%
    </span>
  </div>
);

const Footer: React.FC<{ frame: number; source: string }> = ({ frame, source }) => {
  const op = interpolate(frame, [600, 630], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        bottom: 60,
        width: 1080,
        textAlign: "center",
        opacity: op,
        fontFamily: "Gaegu",
        fontWeight: 700,
        fontSize: 30,
        color: INK,
      }}
    >
      *출처: {source} · 자세한 설명은 캡션에서!*
    </div>
  );
};
