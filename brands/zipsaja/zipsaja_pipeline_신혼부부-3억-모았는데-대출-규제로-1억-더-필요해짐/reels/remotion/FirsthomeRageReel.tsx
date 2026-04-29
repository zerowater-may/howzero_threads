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
    kicker: "집사자 첫집 분노 리서치",
    headline: ["3억 모았는데", "1억 더 필요?"],
    accent: "신혼 현금부터\n1억 더 필요해짐",
    body: ["서울 평균가 12.3억", "신혼 평균 자산 3.3억"],
    mascot: "shining",
  },
  {
    start: 4,
    duration: 5,
    kicker: "먼저 숫자부터",
    headline: ["3억은", "적게 모은 게 아니야"],
    accent: "평균 자산 3.3억",
    body: ["준비 부족 프레임으로 때릴 문제가 아니야.", "서울 시작선이 너무 멀어졌다는 얘기야."],
    mascot: "hero",
  },
  {
    start: 9,
    duration: 5,
    kicker: "계산은 잔인해",
    headline: ["12.3억 - 3.3억", "= 9억"],
    accent: "단순 격차 9억",
    body: ["평균값끼리만 붙여도 이렇게 비어.", "이 숫자를 보고도 눈만 낮추래?"],
    mascot: "shining",
  },
  {
    start: 14,
    duration: 6,
    kicker: "여기서 한 번 더 때림",
    headline: ["대출한도", "약 1억 감소"],
    accent: "현금 부담이 더 커짐",
    body: ["투기 잡는 효과는 있을 수 있어.", "근데 실수요자 현금 부담도 같이 커져."],
    mascot: "hero",
  },
  {
    start: 20,
    duration: 5,
    kicker: "결국 선택지는",
    headline: ["더 작게", "더 멀리", "더 오래 전세"],
    accent: "이게 첫집 현실 선택지",
    body: ["안정적 실거주 목적 86.6% 보도 기준.", "투기꾼 프레임은 빼고 보자."],
    mascot: "smile",
  },
  {
    start: 25,
    duration: 5,
    kicker: "댓글로 말해봐",
    headline: ["집값 잡기냐", "신혼 잡기냐"],
    accent: "3억 모았는데\n눈 낮추면 끝?",
    body: ["보도 기준 평균값 비교.", "개별 한도는 DSR, LTV, 금리, 부채에 따라 달라."],
    mascot: "shining",
    mode: "dark",
  },
];

const mascotFile = (mascot: SceneConfig["mascot"]) => {
  if (mascot === "shining") return "mascot-shining.png";
  if (mascot === "smile") return "mascot-smile.png";
  return "mascot-hero.png";
};

export const FirsthomeRageReel: React.FC = () => {
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
  const dark = scene.mode === "dark";
  const localFrame = frame;
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
  const titleY = interpolate(enter, [0, 1], [46, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const numberPulse = 1 + Math.sin(localFrame / 9) * 0.018;
  const ink = dark ? WHITE : INK;
  const pageBg = dark ? INK : BG;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: pageBg,
        color: ink,
        fontFamily: "Noto Sans KR",
        opacity: fadeOut,
        padding: "145px 78px 170px",
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
          marginTop: 86,
          transform: `translateY(${titleY}px)`,
        }}
      >
        {scene.headline.map((line, idx) => (
          <div
            key={line}
            style={{
              fontFamily: "Jua",
              fontSize: idx === scene.headline.length - 1 && line.length <= 8 ? 126 : 96,
              lineHeight: 1.05,
              letterSpacing: 0,
              color: idx === scene.headline.length - 1 ? ORANGE : ink,
              transform: idx === scene.headline.length - 1 ? `scale(${numberPulse})` : undefined,
              transformOrigin: "left center",
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
              fontSize: line.length > 26 ? 34 : 39,
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
          fontSize: 28,
          lineHeight: 1.22,
          textAlign: "center",
        }}
      >
        서울시 주거실태조사 보도 + 금융위원회 대출규제 자료 기준
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
        fontSize: text.length > 24 ? 45 : 58,
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
      id="FirsthomeRageReel"
      component={FirsthomeRageReel}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};

registerRoot(Root);
