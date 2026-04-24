import { AbsoluteFill, Img, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadJua } from "@remotion/google-fonts/Jua";
import { loadFont as loadGaegu } from "@remotion/google-fonts/Gaegu";

loadJua();
loadGaegu();

const PAPER_BG = "#F5EDE0";
const INK = "#1a1a1a";
const ORANGE = "#EA2E00";
const PINK = "#FFB8E7";

export const Slide1Cover: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const topPill = spring({ frame: frame - 0, fps, config: { damping: 20, stiffness: 130, mass: 0.8 } });
  const headWord = spring({ frame: frame - 5, fps, config: { damping: 20, stiffness: 130, mass: 0.8 } });
  const bigPill = spring({ frame: frame - 12, fps, config: { damping: 16, stiffness: 140, mass: 0.8 } });
  const tail = spring({ frame: frame - 20, fps, config: { damping: 20, stiffness: 130, mass: 0.8 } });

  const mascotSpring = spring({ frame: frame - 28, fps, config: { damping: 16, stiffness: 110, mass: 0.9 } });
  const mascotFloat = Math.sin((frame - 28) / 16) * 6;

  const bubble = spring({ frame: frame - 38, fps, config: { damping: 22, stiffness: 140, mass: 0.8 } });
  const whisper = spring({ frame: frame - 48, fps, config: { damping: 22, stiffness: 140, mass: 0.8 } });

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER_BG }}>
      {/* Top dark pill */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 0,
          right: 0,
          textAlign: "center",
          transform: `translateY(${(1 - topPill) * -40}px)`,
          opacity: topPill,
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "16px 36px",
            background: INK,
            color: "#fff",
            borderRadius: 50,
            fontFamily: "'Jua', sans-serif",
            fontSize: 52,
            letterSpacing: "-1px",
            transform: "rotate(-0.5deg)",
          }}
        >
          📍 강서구 가양동
        </span>
      </div>

      {/* Headline stack */}
      <div style={{ position: "absolute", top: 310, left: 0, right: 0, textAlign: "center" }}>
        <div
          style={{
            fontFamily: "'Jua', sans-serif",
            fontSize: 180,
            color: INK,
            lineHeight: 1,
            letterSpacing: "-4px",
            opacity: headWord,
            transform: `translateY(${(1 - headWord) * 40}px)`,
          }}
        >
          가양동
        </div>

        <div style={{ marginTop: 30 }}>
          <span
            style={{
              display: "inline-block",
              padding: "18px 56px",
              background: ORANGE,
              color: "#fff",
              borderRadius: 100,
              fontFamily: "'Jua', sans-serif",
              fontSize: 170,
              letterSpacing: "-3px",
              transform: `rotate(-1deg) scale(${0.6 + bigPill * 0.4})`,
              opacity: bigPill,
              boxShadow: "0 10px 24px rgba(234,46,0,0.25)",
            }}
          >
            9억대
          </span>
        </div>

        <div
          style={{
            marginTop: 30,
            fontFamily: "'Jua', sans-serif",
            fontSize: 110,
            color: INK,
            letterSpacing: "-3px",
            opacity: tail,
            transform: `translateY(${(1 - tail) * 28}px)`,
          }}
        >
          아파트{" "}
          <span
            style={{
              position: "relative",
              display: "inline-block",
              padding: "0 24px",
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: "16px -10px",
                background: PINK,
                borderRadius: 6,
                transform: "rotate(-0.6deg)",
                zIndex: 0,
                width: `${Math.min(tail * 100, 100)}%`,
                transition: "none",
              }}
            />
            <span style={{ position: "relative", zIndex: 1 }}>찾아봤다구</span>
          </span>
        </div>
      </div>

      {/* Mascot + bubbles */}
      <div
        style={{
          position: "absolute",
          bottom: 240,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "relative" }}>
          <Img
            src={staticFile("mascot-hero.png")}
            style={{
              width: 460,
              height: "auto",
              opacity: mascotSpring,
              transform: `translateY(${(1 - mascotSpring) * 200 + mascotFloat}px) scale(${0.85 + mascotSpring * 0.15})`,
            }}
          />

          {/* Speech bubble */}
          <div
            style={{
              position: "absolute",
              left: -260,
              top: 40,
              background: "#fff",
              border: `3px solid ${INK}`,
              borderRadius: 24,
              padding: "18px 26px",
              fontFamily: "'Gaegu', 'Jua', sans-serif",
              fontSize: 36,
              lineHeight: 1.25,
              color: INK,
              opacity: bubble,
              transform: `translate(${(1 - bubble) * -30}px, ${(1 - bubble) * -10}px) scale(${0.8 + bubble * 0.2})`,
              transformOrigin: "bottom right",
            }}
          >
            9호선 급행 + 마곡!
            <br />
            가양동 지금 어때?
          </div>

          {/* Orange whisper */}
          <div
            style={{
              position: "absolute",
              right: -200,
              top: 120,
              background: ORANGE,
              color: "#fff",
              borderRadius: 20,
              padding: "14px 22px",
              fontFamily: "'Gaegu', 'Jua', sans-serif",
              fontSize: 32,
              lineHeight: 1.25,
              transform: `rotate(3deg) translateY(${(1 - whisper) * 20}px)`,
              opacity: whisper,
              boxShadow: "0 6px 14px rgba(234,46,0,0.3)",
            }}
          >
            26년 4월 기준
            <br />
            찾아봤어~
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 60,
          right: 60,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "'Jua', sans-serif",
          fontSize: 32,
          color: INK,
          opacity: interpolate(frame, [58, 72], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        <span>@zipsaja</span>
        <span>01</span>
        <span style={{ color: ORANGE }}>다음 →</span>
      </div>
    </AbsoluteFill>
  );
};
