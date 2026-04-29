import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  Img,
  Sequence,
  interpolate,
  registerRoot,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadGaegu } from "@remotion/google-fonts/Gaegu";
import { loadFont as loadJua } from "@remotion/google-fonts/Jua";
import { loadFont as loadNoto } from "@remotion/google-fonts/NotoSansKR";

loadJua();
loadNoto();
loadGaegu();

const FPS = 30;
const TOTAL_FRAMES = FPS * 30;
const BG = "#F0E7D6";
const INK = "#1a1a1a";
const ORANGE = "#EA2E00";
const WHITE = "#fff";

type SceneConfig = {
  start: number;
  duration: number;
  kicker: string;
  headline: string[];
  accent: string;
  body: string[];
  mascot: "hero" | "shining" | "smile";
  mode?: "dark";
};

const scenes: SceneConfig[] = [
  {
    start: 0,
    duration: 4,
    kicker: "집사자 실거래 분노 리서치",
    headline: ["같은 월급인데", "집 보는 동네가", "갈렸다"],
    accent: "부모 2억 붙는 순간",
    body: ["15억 이하 최대 6억 대출 기준", "예산 9억과 11억은 다른 지도야"],
    mascot: "shining",
  },
  {
    start: 4,
    duration: 5,
    kicker: "주말 부동산 투어",
    headline: ["둘 다 서울에서", "첫집을", "보러 다닌다"],
    accent: "월급은 비슷한데",
    body: ["혼자 모은 돈 3억", "부모 도움 후 5억"],
    mascot: "hero",
  },
  {
    start: 9,
    duration: 5,
    kicker: "2025년 10월 정책 기준",
    headline: ["15억 이하는", "대출 최대 6억"],
    accent: "주택구입목적 주담대",
    body: ["혼자 모은 3억이면 예산 9억", "부모 도움 후 5억이면 예산 11억"],
    mascot: "shining",
  },
  {
    start: 14,
    duration: 5,
    kicker: "혼자 모은 3억",
    headline: ["예산 9억", "7개 구"],
    accent: "중랑·도봉·금천·노원·강북·구로·관악",
    body: ["2026년 서울 24평급 평균 기준", "지도에 남는 구는 7개"],
    mascot: "hero",
  },
  {
    start: 19,
    duration: 6,
    kicker: "부모가 2억 보태면",
    headline: ["예산 11억", "12개 구"],
    accent: "성북·양천·은평·강서·동대문 추가",
    body: ["같은 서울 첫집 검색인데", "보이는 동네가 5개 더 늘어난다"],
    mascot: "smile",
  },
  {
    start: 25,
    duration: 5,
    kicker: "댓글로 말해봐",
    headline: ["노력 차이야", "시작선 차이야"],
    accent: "부모찬스 없는 첫집\n노력으로 커버 가능?",
    body: ["누가 잘못했다는 얘기가 아님", "처음 들고 가는 돈이 먼저 필터링해"],
    mascot: "shining",
    mode: "dark",
  },
];

const mascotFile = (mascot: SceneConfig["mascot"]) => {
  if (mascot === "shining") return "mascot-shining.png";
  if (mascot === "smile") return "mascot-smile.png";
  return "mascot-hero.png";
};

export const ParentChanceReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {scenes.map((scene, index) => (
        <Sequence key={scene.start} from={scene.start * FPS} durationInFrames={scene.duration * FPS}>
          <Scene scene={scene} number={index + 1} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const Scene: React.FC<{ scene: SceneConfig; number: number }> = ({ scene, number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dark = scene.mode === "dark";
  const ink = dark ? WHITE : INK;
  const pageBg = dark ? INK : BG;
  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 170, mass: 0.7 } });
  const fadeOut = interpolate(frame, [scene.duration * FPS - 18, scene.duration * FPS], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });
  const titleY = interpolate(enter, [0, 1], [48, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = 1 + Math.sin(frame / 8) * 0.018;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: pageBg,
        color: ink,
        fontFamily: "Noto Sans KR",
        opacity: fadeOut,
        padding: "142px 78px 168px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "Gaegu", fontWeight: 700, fontSize: 38, color: ORANGE }}>
        <span>{scene.kicker}</span>
        <span style={{ width: 76, height: 76, borderRadius: 999, border: `4px solid ${dark ? WHITE : INK}`, background: dark ? ORANGE : WHITE, color: dark ? WHITE : INK, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "Jua", fontSize: 34 }}>{number}</span>
      </div>

      <div style={{ marginTop: 84, transform: `translateY(${titleY}px)` }}>
        {scene.headline.map((line, idx) => (
          <div
            key={line}
            style={{
              fontFamily: "Jua",
              fontSize: line.length >= 12 ? 72 : line.length >= 9 ? 86 : idx === scene.headline.length - 1 ? 124 : 98,
              lineHeight: 1.05,
              letterSpacing: 0,
              color: idx === scene.headline.length - 1 ? ORANGE : ink,
              transform: idx === scene.headline.length - 1 ? `scale(${pulse})` : undefined,
              transformOrigin: "left center",
              whiteSpace: "pre-line",
            }}
          >
            {line}
          </div>
        ))}
      </div>

      <AccentCard dark={dark} text={scene.accent} frame={frame} />

      <div style={{ marginTop: 42, display: "grid", gap: 18, maxWidth: 840 }}>
        {scene.body.map((line, idx) => (
          <div
            key={line}
            style={{
              opacity: interpolate(frame, [18 + idx * 7, 34 + idx * 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              transform: `translateX(${interpolate(frame, [18 + idx * 7, 34 + idx * 7], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
              border: `4px solid ${dark ? WHITE : INK}`,
              borderRadius: 24,
              background: dark ? "rgba(255,255,255,0.1)" : WHITE,
              padding: "24px 30px",
              fontSize: line.length > 22 ? 34 : 39,
              lineHeight: 1.28,
              fontWeight: 900,
            }}
          >
            {line}
          </div>
        ))}
      </div>

      <Img
        src={staticFile(mascotFile(scene.mascot))}
        style={{
          position: "absolute",
          right: 74,
          bottom: 112,
          width: 250,
          height: "auto",
          transform: `translateY(${interpolate(enter, [0, 1], [60, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px) rotate(${dark ? -4 : 3}deg)`,
          opacity: interpolate(enter, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          filter: dark ? "invert(1)" : undefined,
        }}
      />

      <div style={{ position: "absolute", left: 78, right: 78, bottom: 54, color: dark ? "#cfcfcf" : "#555", fontFamily: "Gaegu", fontSize: 27, lineHeight: 1.22, textAlign: "center" }}>
        내부 proptech_db 실거래 기준 · 매매 A1 · 취소거래 제외
      </div>
    </AbsoluteFill>
  );
};

const AccentCard: React.FC<{ dark: boolean; text: string; frame: number }> = ({ dark, text, frame }) => {
  const opacity = interpolate(frame, [10, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(frame, [10, 24], [26, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        marginTop: 52,
        display: "inline-block",
        alignSelf: "flex-start",
        maxWidth: 900,
        border: `4px solid ${dark ? WHITE : INK}`,
        borderRadius: 28,
        background: ORANGE,
        color: WHITE,
        padding: "24px 34px 28px",
        fontFamily: "Jua",
        fontSize: text.length > 24 ? 43 : 56,
        lineHeight: 1.12,
        letterSpacing: 0,
        whiteSpace: "pre-line",
        opacity,
        transform: `translateY(${y}px) rotate(-1.2deg)`,
        boxShadow: dark ? `8px 8px 0 ${WHITE}` : `8px 8px 0 ${INK}`,
      }}
    >
      {text}
    </div>
  );
};

const Root: React.FC = () => {
  return <Composition id="ParentChanceReel" component={ParentChanceReel} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />;
};

registerRoot(Root);
