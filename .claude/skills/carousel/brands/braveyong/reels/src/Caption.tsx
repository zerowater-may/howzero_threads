import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadBlackHanSans } from "@remotion/google-fonts/BlackHanSans";
import type { Caption as CaptionData } from "./captions";

loadBlackHanSans();

const ORANGE = "#EA2E00";
const INK = "#0a0a0a";

type Props = {
  caption: CaptionData;
  slideDuration: number;
};

const renderWithAccent = (text: string, accent?: string) => {
  if (!accent || !text.includes(accent)) return text;
  const [before, after] = text.split(accent);
  return (
    <>
      {before}
      <span style={{ color: ORANGE, display: "inline-block" }}>{accent}</span>
      {after}
    </>
  );
};

export const Caption: React.FC<Props> = ({ caption, slideDuration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pop in at frame 4, hold, fade-out in last 8 frames
  const enter = spring({
    frame: frame - 4,
    fps,
    config: { damping: 14, stiffness: 180, mass: 0.7 },
  });

  const exit = interpolate(
    frame,
    [slideDuration - 10, slideDuration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.ease) }
  );

  const opacity = Math.min(enter, exit);
  const translateY = (1 - enter) * 40;
  const scale = 0.92 + enter * 0.08;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 220,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px) scale(${scale})`,
          background: "rgba(255, 255, 255, 0.96)",
          border: `4px solid ${INK}`,
          borderRadius: 28,
          padding: "26px 44px",
          maxWidth: 940,
          textAlign: "center",
          fontFamily: "'Black Han Sans', 'Jua', sans-serif",
          color: INK,
          letterSpacing: "-1.5px",
          boxShadow: "0 14px 28px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ fontSize: 56, lineHeight: 1.1 }}>
          {renderWithAccent(caption.line1, caption.accent)}
        </div>
        {caption.line2 ? (
          <div style={{ fontSize: 68, lineHeight: 1.1, marginTop: 10 }}>
            {renderWithAccent(caption.line2, caption.accent)}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
