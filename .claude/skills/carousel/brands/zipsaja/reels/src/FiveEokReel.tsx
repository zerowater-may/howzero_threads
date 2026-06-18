import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Img,
  Easing,
  interpolate,
  spring,
  staticFile,
  delayRender,
  continueRender,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadGaegu } from "@remotion/google-fonts/Gaegu";

loadGaegu();

// ---- Gmarket Sans 로컬 로드 (canonical) ----
const fontHandle = delayRender("gmarket");
const gmarketBold = new FontFace(
  "Gmarket Sans",
  `url(${staticFile("fonts/GmarketSansTTFBold.ttf")}) format("truetype")`,
  { weight: "700" },
);
const gmarketMed = new FontFace(
  "Gmarket Sans",
  `url(${staticFile("fonts/GmarketSansTTFMedium.ttf")}) format("truetype")`,
  { weight: "500" },
);
Promise.all([gmarketBold.load(), gmarketMed.load()])
  .then((fonts) => {
    fonts.forEach((f) => (document as unknown as { fonts: FontFaceSet }).fonts.add(f));
    continueRender(fontHandle);
  })
  .catch(() => continueRender(fontHandle));

export const FPS = 30;
export const FIVE_EOK_TOTAL_FRAMES = FPS * 30; // 900

const BG = "#F0E7D6";
const ACCENT = "#EA2E00";
const ACCENT_DEEP = "#C42600";
const INK = "#1a1a1a";
const CREAM = "#F5EDE0";
const HEAD = "'Gmarket Sans', 'Noto Sans KR', sans-serif";
const HAND = "'Gaegu', sans-serif";

// ---------- helpers ----------
const fadeEdges = (frame: number, dur: number, inF = 8, outF = 10) =>
  interpolate(
    frame,
    [0, inF, dur - outF, dur],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

const CountUp: React.FC<{
  to: number;
  from?: number;
  start: number;
  dur: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  style?: React.CSSProperties;
}> = ({ to, from = 0, start, dur, decimals = 0, prefix = "", suffix = "", style }) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [start, start + dur], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <span style={style}>
      {prefix}
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
};

const Pill: React.FC<{ children: React.ReactNode; size: number; deep?: boolean; style?: React.CSSProperties }> = ({
  children,
  size,
  deep,
  style,
}) => (
  <span
    style={{
      display: "inline-block",
      background: deep ? ACCENT_DEEP : ACCENT,
      color: deep ? "#fff" : INK,
      fontFamily: HEAD,
      fontWeight: 700,
      fontSize: size,
      lineHeight: 1.1,
      padding: "4px 26px 12px",
      borderRadius: 999,
      ...style,
    }}
  >
    {children}
  </span>
);

const Watermark: React.FC = () => (
  <div
    style={{
      position: "absolute",
      bottom: 56,
      left: 0,
      width: 1080,
      textAlign: "center",
      fontFamily: HEAD,
      fontWeight: 700,
      fontSize: 30,
      color: "rgba(26,26,26,0.45)",
    }}
  >
    @zipsaja
  </div>
);

const Mascot: React.FC<{ name: string; frame: number; fps: number; at: number; size: number; right: number; bottom: number }> = ({
  name,
  frame,
  fps,
  at,
  size,
  right,
  bottom,
}) => {
  const s = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 180 } });
  return (
    <Img
      src={staticFile(`mascots/${name}.png`)}
      style={{
        position: "absolute",
        right,
        bottom,
        width: size,
        height: size,
        transform: `scale(${s})`,
      }}
    />
  );
};

// ---------- Beats ----------
const Hook: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const op = fadeEdges(frame, dur);
  const titleY = interpolate(frame, [0, 14], [40, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const pillS = spring({ frame: frame - 24, fps, config: { damping: 12, stiffness: 200 } });
  return (
    <AbsoluteFill style={{ opacity: op, padding: "200px 80px 0" }}>
      <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 46, color: "#6B6B6B" }}>첫집 예산 5억</div>
      <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 96, color: INK, lineHeight: 1.1, marginTop: 24, transform: `translateY(${titleY}px)`, letterSpacing: -2 }}>
        5억으로<br />서울 신축?
      </div>
      <div style={{ marginTop: 40, transform: `scale(${pillS})`, transformOrigin: "left center" }}>
        <Pill size={104}>딱 4곳</Pill>
      </div>
      <div style={{ fontFamily: HEAD, fontWeight: 500, fontSize: 44, color: "#444", marginTop: 36 }}>나머지 99%는 전부 구축 →</div>
      <Mascot name="mascot-surprise" frame={frame} fps={fps} at={40} size={300} right={60} bottom={230} />
      <Watermark />
    </AbsoluteFill>
  );
};

const ShockPct: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const op = fadeEdges(frame, dur);
  return (
    <AbsoluteFill style={{ opacity: op, padding: "300px 80px 0" }}>
      <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 46, color: "#6B6B6B" }}>5억대 매매 2,115건 중</div>
      <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 320, color: ACCENT_DEEP, lineHeight: 0.95, marginTop: 10, letterSpacing: -6 }}>
        <CountUp to={0.8} start={8} dur={46} decimals={1} suffix="%" />
      </div>
      <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 72, color: INK, marginTop: 20 }}>
        신축은 단 <span style={{ background: "linear-gradient(to top, #EA2E00 0, #EA2E00 45%, transparent 45%, transparent 100%)", padding: "0 8px" }}>17건</span>
      </div>
      <div style={{ fontFamily: HEAD, fontWeight: 500, fontSize: 44, color: "#444", marginTop: 30 }}>2018년 이후 신축은 딱 4단지뿐</div>
      <Watermark />
    </AbsoluteFill>
  );
};

const NEW_ITEMS = [
  { name: "현대6차", sub: "노원구 · 2018년", eok: "5.1억" },
  { name: "백련산해모로", sub: "은평구 · 2020년", eok: "5.3억" },
  { name: "영등포중흥S클래스", sub: "영등포구 · 2021년", eok: "4.9억" },
  { name: "e편한세상서대문", sub: "서대문구 · 2023년", eok: "5.2억" },
];

const NewFour: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const op = fadeEdges(frame, dur);
  return (
    <AbsoluteFill style={{ opacity: op, padding: "210px 80px 0" }}>
      <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 46, color: "#6B6B6B" }}>5억으로 가능한 서울 신축 전부</div>
      <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 76, color: INK, margin: "12px 0 40px" }}>이 4곳이 전부야</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {NEW_ITEMS.map((it, i) => {
          const local = frame - (20 + i * 14);
          const o = interpolate(local, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const x = interpolate(local, [0, 10], [80, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
          return (
            <div key={it.name} style={{ opacity: o, transform: `translateX(${x}px)`, background: "#fff", border: `3px solid ${INK}`, borderRadius: 18, boxShadow: `4px 4px 0 0 ${INK}`, padding: "24px 34px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 50 }}>{it.name}</div>
                <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 30, color: "#6B6B6B", marginTop: 2 }}>{it.sub}</div>
              </div>
              <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 58, color: ACCENT_DEEP }}>{it.eok}</div>
            </div>
          );
        })}
      </div>
      <Watermark />
    </AbsoluteFill>
  );
};

const OLD_BARS = [
  { gu: "노원구", n: 740 },
  { gu: "도봉구", n: 289 },
  { gu: "구로구", n: 185 },
  { gu: "중랑구", n: 177 },
];

const OldGu: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const op = fadeEdges(frame, dur);
  const maxN = 740;
  return (
    <AbsoluteFill style={{ opacity: op, padding: "190px 80px 0" }}>
      <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 46, color: "#6B6B6B" }}>그럼 나머지 99%는?</div>
      <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 80, color: INK, lineHeight: 1.12, margin: "12px 0 40px" }}>
        결국 구축<br />그리고 거의 <span style={{ background: "linear-gradient(to top, #EA2E00 0, #EA2E00 45%, transparent 45%, transparent 100%)", padding: "0 8px" }}>노·도·강</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        {OLD_BARS.map((b, i) => {
          const local = frame - (22 + i * 12);
          const o = interpolate(local, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const w = interpolate(local, [4, 30], [0, (b.n / maxN) * 820], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
          return (
            <div key={b.gu} style={{ opacity: o, display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 44, width: 200 }}>{b.gu}</div>
              <div style={{ height: 56, width: w, background: i === 0 ? ACCENT : ACCENT_DEEP, borderRadius: 10, border: `3px solid ${INK}` }} />
              <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 40, color: INK }}>{b.n}건</div>
            </div>
          );
        })}
      </div>
      <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 40, color: "#444", marginTop: 40 }}>구축 1,929건 · 204단지</div>
      <Watermark />
    </AbsoluteFill>
  );
};

const Twist: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const op = fadeEdges(frame, dur);
  const boxS = spring({ frame: frame - 18, fps, config: { damping: 13, stiffness: 180 } });
  return (
    <AbsoluteFill style={{ opacity: op, padding: "240px 80px 0" }}>
      <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 48, color: "#6B6B6B" }}>같은 5억, 같은 16평인데</div>
      <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 84, color: INK, lineHeight: 1.14, margin: "16px 0 44px" }}>차이는 집의 나이</div>
      <div style={{ transform: `scale(${boxS})`, transformOrigin: "left top", background: ACCENT_DEEP, border: `3px solid ${INK}`, borderRadius: 18, boxShadow: `4px 4px 0 0 ${INK}`, padding: "44px 48px", color: "#fff" }}>
        <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 50, lineHeight: 1.45 }}>
          신축은 2019년생 · 4곳<br />구축은 1993년생 · 204곳
        </div>
        <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 86, marginTop: 14 }}>
          연식 차이 <CountUp to={26} start={20} dur={30} suffix="년" />
        </div>
      </div>
      <Mascot name="mascot-shining" frame={frame} fps={fps} at={26} size={230} right={70} bottom={210} />
      <Watermark />
    </AbsoluteFill>
  );
};

const RealPrice: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const op = fadeEdges(frame, dur);
  return (
    <AbsoluteFill style={{ opacity: op, padding: "260px 80px 0" }}>
      <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 48, color: "#6B6B6B" }}>그래서 신축 원하면 얼마?</div>
      <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 60, color: INK, marginTop: 14 }}>서울 신축 중위가</div>
      <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 230, color: ACCENT_DEEP, lineHeight: 1, letterSpacing: -4, marginTop: 6 }}>
        <CountUp to={13.5} start={8} dur={44} decimals={1} suffix="억" />
      </div>
      <div style={{ background: CREAM, border: `3px solid ${INK}`, borderRadius: 18, boxShadow: `4px 4px 0 0 ${INK}`, padding: "26px 36px", marginTop: 28, display: "inline-block" }}>
        <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 56 }}>
          5억에서 <span style={{ background: "linear-gradient(to top, #EA2E00 0, #EA2E00 45%, transparent 45%, transparent 100%)", padding: "0 8px" }}>+8.5억</span> 더
        </div>
      </div>
      <Mascot name="mascot-worried" frame={frame} fps={fps} at={20} size={240} right={70} bottom={250} />
      <Watermark />
    </AbsoluteFill>
  );
};

const CTA: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line = (i: number) => interpolate(frame - (14 + i * 8), [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: INK, opacity: op, padding: "300px 80px 0" }}>
      <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 92, color: "#fff", lineHeight: 1.16 }}>너라면?</div>
      <div style={{ opacity: line(0), fontFamily: HEAD, fontWeight: 700, fontSize: 60, color: "#fff", marginTop: 34 }}>
        <span style={{ color: ACCENT }}>①</span> 영끌 신축 13.5억
      </div>
      <div style={{ opacity: line(1), fontFamily: HEAD, fontWeight: 700, fontSize: 60, color: "#fff", marginTop: 18 }}>
        <span style={{ color: ACCENT }}>②</span> 5억 구축 입성
      </div>
      <div style={{ opacity: line(2), fontFamily: HEAD, fontWeight: 700, fontSize: 50, color: "#fff", marginTop: 50 }}>댓글로 숫자 남기고 싸워보자 🔥</div>
      <div style={{ position: "absolute", bottom: 70, left: 0, width: 1080, textAlign: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 34, color: "rgba(255,255,255,0.55)" }}>@zipsaja</div>
    </AbsoluteFill>
  );
};

export const FiveEokReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Sequence from={0} durationInFrames={130}><Hook dur={130} /></Sequence>
      <Sequence from={130} durationInFrames={140}><ShockPct dur={140} /></Sequence>
      <Sequence from={270} durationInFrames={140}><NewFour dur={140} /></Sequence>
      <Sequence from={410} durationInFrames={150}><OldGu dur={150} /></Sequence>
      <Sequence from={560} durationInFrames={130}><Twist dur={130} /></Sequence>
      <Sequence from={690} durationInFrames={120}><RealPrice dur={120} /></Sequence>
      <Sequence from={810} durationInFrames={90}><CTA dur={90} /></Sequence>
    </AbsoluteFill>
  );
};
