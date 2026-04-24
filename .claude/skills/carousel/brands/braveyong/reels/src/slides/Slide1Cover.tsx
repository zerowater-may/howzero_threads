import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadBlackHan } from "@remotion/google-fonts/BlackHanSans";
import { loadFont as loadNoto } from "@remotion/google-fonts/NotoSansKR";
import { loadFont as loadGaegu } from "@remotion/google-fonts/Gaegu";
import { COLORS, FONTS, COPY } from "../brand-tokens";

loadBlackHan();
loadNoto();
loadGaegu();

type Props = { durationInFrames: number };

export const Slide1Cover: React.FC<Props> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stamp = spring({ frame, fps, config: { damping: 10, stiffness: 220, mass: 0.7 } });
  const hook1 = spring({ frame: frame - 12, fps, config: { damping: 14, stiffness: 170, mass: 0.8 } });
  const slash = interpolate(frame, [22, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });
  const hook2 = spring({ frame: frame - 32, fps, config: { damping: 14, stiffness: 170, mass: 0.8 } });

  // Shake for impact when stamp lands
  const shake = frame >= 0 && frame < 10 ? Math.sin(frame * 3) * (10 - frame) * 0.8 : 0;

  const statCard = spring({ frame: frame - 50, fps, config: { damping: 18, stiffness: 130, mass: 0.8 } });
  const handle = interpolate(frame, [74, 92], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 40%, ${COLORS.darkCrimson} 0%, ${COLORS.darkRedBlack} 70%)`,
      }}
    >
      {/* Gold eyebrow stamp */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: stamp,
          transform: `scale(${0.6 + stamp * 0.4}) translateX(${shake}px) rotate(-3deg)`,
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "14px 38px",
            background: COLORS.gold,
            color: COLORS.darkRedBlack,
            fontFamily: FONTS.headline,
            fontSize: 56,
            letterSpacing: "-1px",
            border: `4px solid ${COLORS.darkRedBlack}`,
            boxShadow: "0 6px 0 rgba(0,0,0,0.5)",
          }}
        >
          {COPY.eyebrow}
        </span>
      </div>

      {/* Hook 1 (white) */}
      <div
        style={{
          position: "absolute",
          top: 340,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: hook1,
          transform: `translate(${shake}px, ${(1 - hook1) * 20}px)`,
          fontFamily: FONTS.headline,
          fontSize: 180,
          color: COLORS.warmCream,
          lineHeight: 1.0,
          letterSpacing: "-2px",
          textShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        {COPY.hook1}
      </div>

      {/* Red slash divider */}
      <div
        style={{
          position: "absolute",
          top: 550,
          left: "50%",
          width: 640 * slash,
          height: 18,
          background: COLORS.warmRose,
          transform: `translateX(-50%) rotate(-1deg)`,
          transformOrigin: "center",
          boxShadow: `0 0 32px ${COLORS.warmRose}`,
        }}
      />

      {/* Hook 2 (gold highlight) */}
      <div
        style={{
          position: "absolute",
          top: 600,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: hook2,
          transform: `translateY(${(1 - hook2) * 20}px)`,
          fontFamily: FONTS.headline,
          fontSize: 200,
          color: COLORS.gold,
          lineHeight: 1.0,
          letterSpacing: "-2px",
          textShadow: `0 0 40px ${COLORS.gold}60`,
        }}
      >
        {COPY.hook2}
      </div>

      {/* Stat card */}
      <div
        style={{
          position: "absolute",
          top: 900,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: statCard,
          transform: `translateY(${(1 - statCard) * 40}px)`,
        }}
      >
        <div
          style={{
            background: COLORS.warmCream,
            border: `5px solid ${COLORS.deepMaroon}`,
            borderRadius: 20,
            padding: "28px 56px",
            textAlign: "center",
            boxShadow: "0 12px 0 rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              fontFamily: FONTS.body,
              fontWeight: 700,
              fontSize: 36,
              color: COLORS.textSecondary,
              letterSpacing: "-0.5px",
            }}
          >
            {COPY.stat}
          </div>
          <div
            style={{
              fontFamily: FONTS.headline,
              fontSize: 120,
              color: COLORS.deepMaroon,
              lineHeight: 1,
              letterSpacing: "-2px",
              marginTop: 4,
            }}
          >
            {COPY.statValue}
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div
        style={{
          position: "absolute",
          bottom: 220,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: handle,
          fontFamily: FONTS.whisper,
          fontSize: 40,
          color: COLORS.warmRose,
          letterSpacing: "-0.5px",
          padding: "0 80px",
          lineHeight: 1.3,
        }}
      >
        {COPY.tagline}
      </div>

      {/* Handle */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: handle,
          fontFamily: FONTS.headline,
          fontSize: 58,
          color: COLORS.warmCream,
          letterSpacing: "-1px",
        }}
      >
        {COPY.handle}
      </div>
    </AbsoluteFill>
  );
};
