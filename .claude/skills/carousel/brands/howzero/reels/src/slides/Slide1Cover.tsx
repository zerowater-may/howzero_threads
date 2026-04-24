import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadNanumPen } from "@remotion/google-fonts/NanumPenScript";
import { loadFont as loadNoto } from "@remotion/google-fonts/NotoSansKR";
import { loadFont as loadGaegu } from "@remotion/google-fonts/Gaegu";
import { COLORS, FONTS, COPY } from "../brand-tokens";

loadNanumPen();
loadNoto();
loadGaegu();

type Props = { durationInFrames: number };

export const Slide1Cover: React.FC<Props> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const eyebrow = spring({ frame: frame - 0, fps, config: { damping: 22, stiffness: 120, mass: 0.8 } });
  const hook = spring({ frame: frame - 10, fps, config: { damping: 20, stiffness: 110, mass: 0.8 } });
  const highlight = interpolate(frame, [24, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });
  const emphasis = spring({ frame: frame - 36, fps, config: { damping: 18, stiffness: 110, mass: 0.8 } });
  const footerIn = interpolate(frame, [56, 74], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Eyebrow tag */}
      <div
        style={{
          position: "absolute",
          top: 220,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: eyebrow,
          transform: `translateY(${(1 - eyebrow) * -24}px)`,
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "14px 32px",
            background: COLORS.text,
            color: COLORS.bg,
            borderRadius: 40,
            fontFamily: FONTS.body,
            fontWeight: 700,
            fontSize: 40,
            letterSpacing: "-0.5px",
          }}
        >
          AI 자동화 실전
        </span>
      </div>

      {/* Hook 1 */}
      <div
        style={{
          position: "absolute",
          top: 360,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: hook,
          transform: `translateY(${(1 - hook) * 28}px)`,
          fontFamily: FONTS.headline,
          fontSize: 180,
          color: COLORS.text,
          lineHeight: 1.0,
          letterSpacing: "-2px",
        }}
      >
        {COPY.hook}
      </div>

      {/* Highlight sweep bar for hookEmphasis */}
      <div
        style={{
          position: "absolute",
          top: 560,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONTS.headline,
          fontSize: 200,
          color: COLORS.text,
          lineHeight: 1.0,
          letterSpacing: "-2px",
          opacity: emphasis,
          transform: `translateY(${(1 - emphasis) * 24}px)`,
        }}
      >
        <span
          style={{
            position: "relative",
            display: "inline-block",
            padding: "0 32px",
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: "14px -12px",
              background: COLORS.highlight.lemon,
              transformOrigin: "left center",
              transform: `scaleX(${highlight}) rotate(-0.8deg)`,
              borderRadius: 4,
              zIndex: 0,
            }}
          />
          <span style={{ position: "relative", zIndex: 1 }}>{COPY.hookEmphasis}</span>
        </span>
      </div>

      {/* Tagline */}
      <div
        style={{
          position: "absolute",
          top: 830,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: emphasis,
          fontFamily: FONTS.whisper,
          fontSize: 54,
          color: COLORS.text,
          letterSpacing: "-0.5px",
        }}
      >
        {COPY.tagline}
      </div>

      {/* Big CTA tile */}
      <div
        style={{
          position: "absolute",
          top: 1060,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: footerIn,
          transform: `translateY(${(1 - footerIn) * 40}px)`,
        }}
      >
        <div
          style={{
            background: COLORS.cta,
            border: `4px solid ${COLORS.text}`,
            borderRadius: 32,
            padding: "40px 64px",
            boxShadow: "0 14px 28px rgba(0,0,0,0.12)",
            textAlign: "center",
            transform: "rotate(-1deg)",
          }}
        >
          <div style={{ fontFamily: FONTS.whisper, fontSize: 42, color: COLORS.text }}>
            30분 무료
          </div>
          <div style={{ fontFamily: FONTS.headline, fontSize: 120, color: COLORS.text, lineHeight: 1, letterSpacing: "-2px", marginTop: 6 }}>
            HOWAAA 오딧
          </div>
        </div>
      </div>

      {/* Footer handle */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: footerIn,
          fontFamily: FONTS.headline,
          fontSize: 64,
          color: COLORS.text,
          letterSpacing: "-1px",
        }}
      >
        {COPY.handle}
      </div>
    </AbsoluteFill>
  );
};
