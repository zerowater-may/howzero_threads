import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadJua } from "@remotion/google-fonts/Jua";
import { loadFont as loadGaegu } from "@remotion/google-fonts/Gaegu";

loadJua();
loadGaegu();

const PAPER_BG = "#F5EDE0";
const INK = "#1a1a1a";
const ORANGE = "#EA2E00";
const PINK = "#FFB8E7";

// 1080x1440 carousel version of SanggyeCover
export const SanggyeCoverC: React.FC<{
  gu: string;
  dong: string;
  priceTag: string;
  totalListings: number;
  uniqueComplexes: number;
}> = ({ gu, dong, priceTag, totalListings, uniqueComplexes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const topPill = spring({ frame: frame - 0, fps, config: { damping: 20, stiffness: 130, mass: 0.8 } });
  const headWord = spring({ frame: frame - 5, fps, config: { damping: 20, stiffness: 130, mass: 0.8 } });
  const bigPill = spring({ frame: frame - 12, fps, config: { damping: 16, stiffness: 140, mass: 0.8 } });
  const tail = spring({ frame: frame - 20, fps, config: { damping: 20, stiffness: 130, mass: 0.8 } });
  const mascotSpring = spring({ frame: frame - 24, fps, config: { damping: 16, stiffness: 110, mass: 0.9 } });
  const mascotFloat = Math.sin((frame - 24) / 16) * 4;
  const bubble = spring({ frame: frame - 32, fps, config: { damping: 22, stiffness: 140, mass: 0.8 } });
  const whisper = spring({ frame: frame - 38, fps, config: { damping: 22, stiffness: 140, mass: 0.8 } });

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER_BG }}>
      {/* 상단 위치 pill */}
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: topPill,
          transform: `translateY(${(1 - topPill) * -30}px)`,
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "14px 32px",
            background: INK,
            color: "#fff",
            borderRadius: 50,
            fontFamily: "'Jua', sans-serif",
            fontSize: 44,
            letterSpacing: "-1px",
            transform: "rotate(-0.5deg)",
          }}
        >
          📍 {gu} {dong}
        </span>
      </div>

      {/* 헤드라인 */}
      <div style={{ position: "absolute", top: 190, left: 0, right: 0, textAlign: "center" }}>
        <div
          style={{
            fontFamily: "'Jua', sans-serif",
            fontSize: 150,
            color: INK,
            lineHeight: 1,
            letterSpacing: "-4px",
            opacity: headWord,
            transform: `translateY(${(1 - headWord) * 30}px)`,
          }}
        >
          {dong}
        </div>

        <div style={{ marginTop: 22 }}>
          <span
            style={{
              display: "inline-block",
              padding: "16px 52px",
              background: ORANGE,
              color: "#fff",
              borderRadius: 100,
              fontFamily: "'Jua', sans-serif",
              fontSize: 128,
              letterSpacing: "-3px",
              transform: `rotate(-1deg) scale(${0.6 + bigPill * 0.4})`,
              opacity: bigPill,
              boxShadow: "0 10px 24px rgba(234,46,0,0.25)",
            }}
          >
            {priceTag}
          </span>
        </div>

        <div
          style={{
            marginTop: 26,
            fontFamily: "'Jua', sans-serif",
            fontSize: 76,
            color: INK,
            letterSpacing: "-2.5px",
            opacity: tail,
            transform: `translateY(${(1 - tail) * 20}px)`,
            whiteSpace: "nowrap",
          }}
        >
          20평대{" "}
          <span style={{ position: "relative", display: "inline-block", padding: "0 18px" }}>
            <span
              style={{
                position: "absolute",
                inset: "12px -6px",
                background: PINK,
                borderRadius: 6,
                transform: "rotate(-0.6deg)",
                zIndex: 0,
                width: `${Math.min(tail * 100, 100)}%`,
              }}
            />
            <span style={{ position: "relative", zIndex: 1 }}>찾아봤다구</span>
          </span>
        </div>
      </div>

      {/* 좌측 말풍선 */}
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 820,
          background: "#fff",
          border: `3px solid ${INK}`,
          borderRadius: 20,
          padding: "14px 22px",
          fontFamily: "'Gaegu', 'Jua', sans-serif",
          fontSize: 28,
          lineHeight: 1.25,
          color: INK,
          opacity: bubble,
          transform: `translate(${(1 - bubble) * -20}px, 0) scale(${0.8 + bubble * 0.2}) rotate(-2deg)`,
          transformOrigin: "bottom right",
          whiteSpace: "nowrap",
          boxShadow: "0 6px 12px rgba(0,0,0,0.08)",
        }}
      >
        주공 재건축부터
        <br />
        신축까지!
      </div>

      {/* 우측 위스퍼 */}
      <div
        style={{
          position: "absolute",
          right: 70,
          top: 820,
          background: ORANGE,
          color: "#fff",
          borderRadius: 18,
          padding: "13px 22px",
          fontFamily: "'Gaegu', 'Jua', sans-serif",
          fontSize: 28,
          lineHeight: 1.25,
          transform: `rotate(3deg) translateY(${(1 - whisper) * 20}px) scale(${0.85 + whisper * 0.15})`,
          opacity: whisper,
          boxShadow: "0 6px 12px rgba(234,46,0,0.3)",
          whiteSpace: "nowrap",
        }}
      >
        총 {totalListings}건
        <br />
        {uniqueComplexes}개 단지
      </div>

      {/* 마스코트 */}
      <div
        style={{
          position: "absolute",
          bottom: 140,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Img
          src={staticFile("mascot-hero.png")}
          style={{
            width: 320,
            height: "auto",
            opacity: mascotSpring,
            transform: `translateY(${(1 - mascotSpring) * 150 + mascotFloat}px) scale(${0.85 + mascotSpring * 0.15})`,
          }}
        />
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
          opacity: interpolate(frame, [50, 64], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        <span>@zipsaja</span>
        <span>01</span>
        <span style={{ color: ORANGE }}>다음 →</span>
      </div>
    </AbsoluteFill>
  );
};
