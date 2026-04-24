import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadJua } from "@remotion/google-fonts/Jua";
import { loadFont as loadGaegu } from "@remotion/google-fonts/Gaegu";
import type { Complex } from "../ComplexCard";

loadJua();
loadGaegu();

const PAPER_BG = "#F5EDE0";
const INK = "#1a1a1a";
const ORANGE = "#EA2E00";
const PINK = "#FFB8E7";
const MINT = "#B8E7D4";

const extractTags = (desc: string): string[] => {
  const keywords = [
    "급매", "재건축", "역세권", "신축", "올수리", "수리", "대단지",
    "투자추천", "추천매물", "리모델링", "학군", "전자계약",
    "조망", "뷰", "공원", "초역세권", "더블역세권",
    "깨끗", "남향", "확장", "정상입주", "리버뷰",
  ];
  const hits: string[] = [];
  for (const kw of keywords) {
    if (desc.includes(kw) && hits.length < 4) hits.push(kw);
  }
  return hits;
};

const priceRange = (min: number, max: number): string => {
  if (Math.abs(min - max) < 0.05) return `${min}억`;
  return `${min}~${max}억`;
};

// 1080x1440 carousel version
export const ComplexCardC: React.FC<{
  complex: Complex;
  index: number;
  total: number;
}> = ({ complex, index, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tags = extractTags(complex.desc);
  const priceStr = priceRange(complex.priceMin, complex.priceMax);

  const header = spring({ frame: frame - 0, fps, config: { damping: 20, stiffness: 150, mass: 0.7 } });
  const name = spring({ frame: frame - 6, fps, config: { damping: 18, stiffness: 140, mass: 0.7 } });
  const price = spring({ frame: frame - 14, fps, config: { damping: 14, stiffness: 160, mass: 0.7 } });
  const stats = spring({ frame: frame - 22, fps, config: { damping: 20, stiffness: 140, mass: 0.7 } });
  const tagsIn = spring({ frame: frame - 30, fps, config: { damping: 22, stiffness: 140, mass: 0.7 } });
  const mascotIn = spring({ frame: frame - 36, fps, config: { damping: 18, stiffness: 120, mass: 0.9 } });
  const mascotFloat = Math.sin((frame - 36) / 18) * 4;

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER_BG }}>
      {/* 인덱스 pill */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: header,
          transform: `translateY(${(1 - header) * -20}px)`,
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "10px 28px",
            background: INK,
            color: "#fff",
            borderRadius: 50,
            fontFamily: "'Jua', sans-serif",
            fontSize: 34,
            letterSpacing: "-1px",
          }}
        >
          {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* 단지명 */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "'Jua', sans-serif",
          fontSize: complex.name.length > 8 ? 76 : 98,
          color: INK,
          letterSpacing: "-3px",
          lineHeight: 1.05,
          padding: "0 70px",
          opacity: name,
          transform: `translateY(${(1 - name) * 30}px)`,
        }}
      >
        {complex.name}
      </div>

      {/* 평형 배지 */}
      <div
        style={{
          position: "absolute",
          top: 150,
          right: 40,
          background: "#fff",
          border: `3px solid ${INK}`,
          borderRadius: 14,
          padding: "8px 14px",
          fontFamily: "'Jua', sans-serif",
          fontSize: 28,
          color: INK,
          transform: `rotate(4deg) scale(${name})`,
          opacity: name,
        }}
      >
        {complex.pyeong}㎡
      </div>

      {/* 가격 */}
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center" }}>
        <span
          style={{
            display: "inline-block",
            padding: "18px 52px",
            background: ORANGE,
            color: "#fff",
            borderRadius: 100,
            fontFamily: "'Jua', sans-serif",
            fontSize: 130,
            letterSpacing: "-4px",
            transform: `rotate(-1deg) scale(${0.5 + price * 0.5})`,
            opacity: price,
            boxShadow: "0 14px 30px rgba(234,46,0,0.3)",
          }}
        >
          {priceStr}
        </span>
      </div>

      {/* 스탯 3블록 */}
      <div
        style={{
          position: "absolute",
          top: 510,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 18,
          opacity: stats,
          transform: `translateY(${(1 - stats) * 20}px)`,
        }}
      >
        <StatBlock label="세대수" value={`${complex.households.toLocaleString()}세대`} bg="#fff" />
        <StatBlock label="준공" value={`${complex.year}년`} bg={MINT} />
        <StatBlock label="매물" value={`${complex.count}건`} bg={PINK} />
      </div>

      {/* 설명 말풍선 */}
      <div
        style={{
          position: "absolute",
          top: 680,
          left: 70,
          right: 70,
          background: "#fff",
          border: `4px solid ${INK}`,
          borderRadius: 22,
          padding: "22px 30px",
          fontFamily: "'Gaegu', 'Jua', sans-serif",
          fontSize: 38,
          lineHeight: 1.3,
          color: INK,
          textAlign: "center",
          opacity: interpolate(frame, [16, 28], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [16, 28], [20, 0], { extrapolateRight: "clamp" })}px)`,
          boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
        }}
      >
        "{complex.desc.length > 38 ? complex.desc.slice(0, 38) + "…" : complex.desc}"
      </div>

      {/* 태그 */}
      <div
        style={{
          position: "absolute",
          top: 870,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 10,
          padding: "0 70px",
          opacity: tagsIn,
          transform: `translateY(${(1 - tagsIn) * 15}px)`,
        }}
      >
        {tags.map((t, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              padding: "10px 20px",
              background: i % 2 === 0 ? INK : ORANGE,
              color: "#fff",
              borderRadius: 40,
              fontFamily: "'Jua', sans-serif",
              fontSize: 32,
              letterSpacing: "-1px",
              transform: `rotate(${(i - 1.5) * 1.2}deg)`,
            }}
          >
            #{t}
          </span>
        ))}
      </div>

      {/* 마스코트 */}
      <Img
        src={staticFile("mascot-shining.png")}
        style={{
          position: "absolute",
          bottom: 150,
          right: 30,
          width: 150,
          height: "auto",
          opacity: mascotIn,
          transform: `translateY(${(1 - mascotIn) * 30 + mascotFloat}px) scale(${0.85 + mascotIn * 0.15})`,
        }}
      />

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
          opacity: interpolate(frame, [40, 54], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        <span>@zipsaja</span>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span style={{ color: ORANGE }}>다음 →</span>
      </div>
    </AbsoluteFill>
  );
};

const StatBlock: React.FC<{ label: string; value: string; bg: string }> = ({ label, value, bg }) => (
  <div
    style={{
      background: bg,
      border: `3px solid ${INK}`,
      borderRadius: 20,
      padding: "14px 22px",
      minWidth: 220,
      textAlign: "center",
      fontFamily: "'Jua', sans-serif",
      color: INK,
    }}
  >
    <div style={{ fontSize: 22, opacity: 0.65, letterSpacing: "-0.5px" }}>{label}</div>
    <div style={{ fontSize: 44, letterSpacing: "-2px", lineHeight: 1.05, marginTop: 2 }}>{value}</div>
  </div>
);
