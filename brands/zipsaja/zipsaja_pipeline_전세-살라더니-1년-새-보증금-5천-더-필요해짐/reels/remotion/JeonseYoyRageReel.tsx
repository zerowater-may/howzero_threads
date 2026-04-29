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
const CREAM = "#F5EDE0";
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
    headline: ["전세 살라더니", "5천 더 필요"],
    accent: "중위값 5.0억 → 5.5억",
    body: ["서울 24평급 전세 실거래", "전년 동기 대비로 다시 계산함"],
    mascot: "shining",
  },
  {
    start: 4,
    duration: 5,
    kicker: "연율 환산 아님",
    headline: ["전년 동기", "+10.0%"],
    accent: "2025.01~04 vs 2026.01~04",
    body: ["작년 같은 기간엔 중위 5.0억", "올해 같은 기간엔 중위 5.5억"],
    mascot: "hero",
  },
  {
    start: 9,
    duration: 5,
    kicker: "평균으로 봐도",
    headline: ["평균도", "+3,800만"],
    accent: "5.37억 → 5.75억",
    body: ["평균 기준 상승률 +7.1%", "보증금 부담이 그냥 올라간 거야"],
    mascot: "shining",
  },
  {
    start: 14,
    duration: 5,
    kicker: "한두 동네 얘기 아님",
    headline: ["24개 구", "전부 상승"],
    accent: "19개 구는 +5% 이상",
    body: ["표본 10건 이상 조건 충족 구 기준", "8개 구는 +10% 이상 뛰었어"],
    mascot: "hero",
  },
  {
    start: 19,
    duration: 6,
    kicker: "상승률 상위",
    headline: ["금천 +19.9%", "서초 +17.8%"],
    accent: "동대문도 +16.8%",
    body: ["강남만의 문제가 아니야", "상대적으로 싼 구도 같이 오르는 중"],
    mascot: "smile",
  },
  {
    start: 25,
    duration: 5,
    kicker: "댓글로 말해봐",
    headline: ["첫집러는", "어디로 가냐"],
    accent: "매수는 대출\n전세는 보증금",
    body: ["내부 DB 실거래 기준", "서울 300세대 이상, 공급 76~85㎡"],
    mascot: "shining",
    mode: "dark",
  },
];

const mascotFile = (mascot: SceneConfig["mascot"]) => {
  if (mascot === "shining") return "mascot-shining.png";
  if (mascot === "smile") return "mascot-smile.png";
  return "mascot-hero.png";
};

export const JeonseYoyRageReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {scenes.map((scene, index) => (
        <Sequence
          key={scene.start}
          from={scene.start * FPS}
          durationInFrames={scene.duration * FPS}
        >
          <Scene scene={scene} number={index + 1} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const Scene: React.FC<{ scene: SceneConfig; number: number }> = ({ scene, number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame;
  const dark = scene.mode === "dark";
  const ink = dark ? WHITE : INK;
  const pageBg = dark ? INK : BG;
  const enter = spring({
    frame: localFrame,
    fps,
    config: { damping: 15, stiffness: 170, mass: 0.7 },
  });
  const fadeOut = interpolate(
    localFrame,
    [scene.duration * FPS - 18, scene.duration * FPS],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.ease) },
  );
  const titleY = interpolate(enter, [0, 1], [48, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse = 1 + Math.sin(localFrame / 8) * 0.018;

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "Gaegu",
          fontWeight: 700,
          fontSize: 38,
          color: ORANGE,
        }}
      >
        <span>{scene.kicker}</span>
        <span
          style={{
            width: 76,
            height: 76,
            borderRadius: 999,
            border: `4px solid ${dark ? WHITE : INK}`,
            background: dark ? ORANGE : WHITE,
            color: dark ? WHITE : INK,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Jua",
            fontSize: 34,
          }}
        >
          {number}
        </span>
      </div>

      <div
        style={{
          marginTop: 84,
          transform: `translateY(${titleY}px)`,
        }}
      >
        {scene.headline.map((line, idx) => (
          <div
            key={line}
            style={{
              fontFamily: "Jua",
              fontSize: line.length >= 10 ? 86 : idx === scene.headline.length - 1 ? 124 : 96,
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

      <AccentCard dark={dark} text={scene.accent} localFrame={localFrame} />

      <div
        style={{
          marginTop: 42,
          display: "grid",
          gap: 18,
          maxWidth: 840,
        }}
      >
        {scene.body.map((line, idx) => (
          <div
            key={line}
            style={{
              opacity: interpolate(localFrame, [18 + idx * 7, 34 + idx * 7], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              transform: `translateX(${interpolate(
                localFrame,
                [18 + idx * 7, 34 + idx * 7],
                [30, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              )}px)`,
              border: `4px solid ${dark ? WHITE : INK}`,
              borderRadius: 24,
              background: dark ? "rgba(255,255,255,0.1)" : WHITE,
              padding: "24px 30px",
              fontSize: line.length > 24 ? 34 : 39,
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
          transform: `translateY(${interpolate(enter, [0, 1], [60, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px) rotate(${dark ? -4 : 3}deg)`,
          opacity: interpolate(enter, [0, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          filter: dark ? "invert(1)" : undefined,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 78,
          right: 78,
          bottom: 54,
          color: dark ? "#cfcfcf" : "#555",
          fontFamily: "Gaegu",
          fontSize: 27,
          lineHeight: 1.22,
          textAlign: "center",
        }}
      >
        내부 proptech_db 실거래 기준 · 전세 B1 · 취소거래 제외
      </div>
    </AbsoluteFill>
  );
};

const AccentCard: React.FC<{ dark: boolean; text: string; localFrame: number }> = ({
  dark,
  text,
  localFrame,
}) => {
  const opacity = interpolate(localFrame, [10, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(localFrame, [10, 24], [26, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
  return (
    <Composition
      id="JeonseYoyRageReel"
      component={JeonseYoyRageReel}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};

registerRoot(Root);
