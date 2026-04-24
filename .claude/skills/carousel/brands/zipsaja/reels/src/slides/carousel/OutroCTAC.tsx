import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadJua } from "@remotion/google-fonts/Jua";
import { loadFont as loadGaegu } from "@remotion/google-fonts/Gaegu";

loadJua();
loadGaegu();

const PAPER_BG = "#F5EDE0";
const INK = "#1a1a1a";
const ORANGE = "#EA2E00";
const PINK = "#FFB8E7";

// 1080x1440 carousel version
export const OutroCTAC: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const topPill = spring({ frame: frame - 0, fps, config: { damping: 20, stiffness: 140, mass: 0.8 } });
  const bigSave = spring({ frame: frame - 8, fps, config: { damping: 16, stiffness: 150, mass: 0.8 } });
  const handle = spring({ frame: frame - 20, fps, config: { damping: 20, stiffness: 130, mass: 0.8 } });
  const mascotIn = spring({ frame: frame - 28, fps, config: { damping: 16, stiffness: 110, mass: 0.9 } });
  const bubble = spring({ frame: frame - 38, fps, config: { damping: 22, stiffness: 140, mass: 0.8 } });
  const mascotFloat = Math.sin((frame - 28) / 15) * 6;

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER_BG }}>
      {/* 상단 pill */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: topPill,
          transform: `translateY(${(1 - topPill) * -20}px)`,
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "16px 34px",
            background: INK,
            color: "#fff",
            borderRadius: 50,
            fontFamily: "'Jua', sans-serif",
            fontSize: 44,
            letterSpacing: "-1px",
            transform: "rotate(-0.5deg)",
          }}
        >
          📌 저장해두고 다시 봐
        </span>
      </div>

      {/* 대형 CTA */}
      <div style={{ position: "absolute", top: 260, left: 0, right: 0, textAlign: "center" }}>
        <span
          style={{
            display: "inline-block",
            padding: "22px 56px",
            background: ORANGE,
            color: "#fff",
            borderRadius: 100,
            fontFamily: "'Jua', sans-serif",
            fontSize: 150,
            letterSpacing: "-5px",
            transform: `rotate(-1deg) scale(${0.5 + bigSave * 0.5})`,
            opacity: bigSave,
            boxShadow: "0 18px 36px rgba(234,46,0,0.35)",
          }}
        >
          내집마련
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          top: 470,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "'Jua', sans-serif",
          fontSize: 100,
          color: INK,
          letterSpacing: "-3px",
          opacity: bigSave,
          transform: `translateY(${(1 - bigSave) * 20}px)`,
        }}
      >
        <span style={{ position: "relative", display: "inline-block", padding: "0 20px" }}>
          <span
            style={{
              position: "absolute",
              inset: "14px -8px",
              background: PINK,
              borderRadius: 6,
              transform: "rotate(-0.6deg)",
              zIndex: 0,
            }}
          />
          <span style={{ position: "relative", zIndex: 1 }}>큐레이션</span>
        </span>
      </div>

      {/* 핸들 */}
      <div
        style={{
          position: "absolute",
          top: 640,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "'Jua', sans-serif",
          fontSize: 66,
          color: INK,
          letterSpacing: "-2px",
          opacity: handle,
          transform: `translateY(${(1 - handle) * 20}px)`,
        }}
      >
        @zipsaja
      </div>

      {/* 마스코트 + 말풍선 */}
      <div
        style={{
          position: "absolute",
          bottom: 180,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "relative" }}>
          <Img
            src={staticFile("mascot-smile.png")}
            style={{
              width: 320,
              height: "auto",
              opacity: mascotIn,
              transform: `translateY(${(1 - mascotIn) * 150 + mascotFloat}px) scale(${0.85 + mascotIn * 0.15})`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -220,
              top: 10,
              background: "#fff",
              border: `3px solid ${INK}`,
              borderRadius: 20,
              padding: "14px 22px",
              fontFamily: "'Gaegu', 'Jua', sans-serif",
              fontSize: 30,
              lineHeight: 1.25,
              color: INK,
              opacity: bubble,
              transform: `translate(${(1 - bubble) * -20}px, 0) scale(${0.8 + bubble * 0.2})`,
              transformOrigin: "bottom right",
              whiteSpace: "nowrap",
              boxShadow: "0 6px 12px rgba(0,0,0,0.08)",
            }}
          >
            팔로우하면 다른 동도
            <br />
            바로 알려줄게!
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          left: 50,
          right: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "'Jua', sans-serif",
          fontSize: 28,
          color: INK,
          opacity: interpolate(frame, [48, 62], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        <span>@zipsaja</span>
        <span style={{ color: ORANGE }}>END</span>
        <span>내집마련 큐레이션</span>
      </div>
    </AbsoluteFill>
  );
};
