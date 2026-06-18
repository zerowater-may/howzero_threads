import React from "react";
import {
  AbsoluteFill, Sequence, Easing, interpolate, spring, staticFile,
  delayRender, continueRender, useCurrentFrame, useVideoConfig,
} from "remotion";
import { loadFont as loadGaegu } from "@remotion/google-fonts/Gaegu";

loadGaegu();
const fh = delayRender("gmarket3");
const gB = new FontFace("Gmarket Sans", `url(${staticFile("fonts/GmarketSansTTFBold.ttf")}) format("truetype")`, { weight: "700" });
const gM = new FontFace("Gmarket Sans", `url(${staticFile("fonts/GmarketSansTTFMedium.ttf")}) format("truetype")`, { weight: "500" });
Promise.all([gB.load(), gM.load()]).then(fs => { fs.forEach(f => (document as unknown as { fonts: FontFaceSet }).fonts.add(f)); continueRender(fh); }).catch(() => continueRender(fh));

export const FPS = 30;
export const PRES_TOTAL_FRAMES = FPS * 30;

const BG = "#F0E7D6", ACCENT = "#EA2E00", DEEP = "#C42600", INK = "#1a1a1a", NAVY = "#1A4FA0";
const HEAD = "'Gmarket Sans','Noto Sans KR',sans-serif", HAND = "'Gaegu',sans-serif";

const fade = (f: number, d: number, i = 8, o = 10) => interpolate(f, [0, i, d - o, d], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// 순위순 (위→아래)
const ROWS = [
  { name: "문재인", pct: 16.9 },
  { name: "이재명", pct: 14.8 },
  { name: "박근혜", pct: 4.4 },
  { name: "이명박", pct: -4.0 },
  { name: "윤석열", pct: -17.1 },
];
const MAX = 17.1;

const Mark: React.FC<{dark?:boolean}> = ({dark}) => (
  <div style={{ position:"absolute", bottom:56, width:1080, textAlign:"center", fontFamily:HEAD, fontWeight:700, fontSize:30, color: dark?"rgba(255,255,255,0.5)":"rgba(26,26,26,0.45)" }}>@zipsaja</div>
);

const Hook: React.FC<{dur:number}> = ({dur}) => {
  const f = useCurrentFrame(); const op = fade(f, dur);
  const ty = interpolate(f, [0,14], [40,0], { extrapolateRight:"clamp", easing:Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ opacity:op, padding:"300px 80px 0" }}>
      <div style={{ fontFamily:HAND, fontWeight:700, fontSize:46, color:"#6B6B6B" }}>집사자가 실거래로 직접 계산</div>
      <div style={{ fontFamily:HEAD, fontWeight:700, fontSize:86, color:INK, lineHeight:1.12, marginTop:20, transform:`translateY(${ty}px)`, letterSpacing:-2 }}>
        역대 대통령<br />취임 1년<br />서울 집값은?
      </div>
      <div style={{ fontFamily:HEAD, fontWeight:700, fontSize:46, color:DEEP, marginTop:30 }}>누가 제일 올렸나 ▼</div>
      <Mark />
    </AbsoluteFill>
  );
};

const Chart: React.FC<{dur:number}> = ({dur}) => {
  const f = useCurrentFrame(); const op = fade(f, dur);
  const cx = 560; // 0-line x within 1000 width area (left 40)
  const half = 300;
  return (
    <AbsoluteFill style={{ opacity:op, padding:"150px 40px 0" }}>
      <div style={{ textAlign:"center", fontFamily:HEAD, fontWeight:700, fontSize:54, color:INK, marginBottom:8 }}>취임 1년 서울 집값 변동률</div>
      <div style={{ textAlign:"center", fontFamily:HEAD, fontWeight:700, fontSize:28, color:"#6B6B6B", marginBottom:40 }}>동일 단지·평형 매칭 실거래</div>
      <div style={{ position:"relative", height:760 }}>
        {/* 0-line */}
        <div style={{ position:"absolute", left:cx, top:0, width:3, height:730, background:"#999" }} />
        {ROWS.map((r, i) => {
          const lf = f - (24 + i * 14);
          const o = interpolate(lf, [0, 10], [0, 1], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
          const prog = interpolate(lf, [4, 30], [0, 1], { extrapolateLeft:"clamp", extrapolateRight:"clamp", easing:Easing.out(Easing.cubic) });
          const up = r.pct >= 0;
          const w = (Math.abs(r.pct) / MAX) * half * prog;
          const col = up ? ACCENT : NAVY;
          const y = i * 148;
          return (
            <div key={r.name} style={{ position:"absolute", top:y, left:0, right:0, height:120, opacity:o }}>
              <div style={{ position:"absolute", left:cx - (up?170:0) - (up?0:0), top:0 }} />
              {/* 정부명: 막대 반대편 */}
              <div style={{ position:"absolute", top:30, left: up ? cx - 200 : cx + 24, width:180, textAlign: up ? "right" : "left", paddingRight: up?16:0, fontFamily:HEAD, fontWeight:700, fontSize:46, color:INK }}>{r.name}</div>
              {/* bar */}
              <div style={{ position:"absolute", top:24, left: up ? cx : cx - w, width:w, height:72, background:col, border:`3px solid ${INK}`, borderRadius:8 }} />
              {/* % label */}
              <div style={{ position:"absolute", top:34, left: up ? cx + w + 16 : cx - w - 16, transform: up ? "none" : "translateX(-100%)", fontFamily:HEAD, fontWeight:700, fontSize:52, color:col, whiteSpace:"nowrap" }}>{up?"+":""}{r.pct}%</div>
            </div>
          );
        })}
      </div>
      <Mark />
    </AbsoluteFill>
  );
};

const Cta: React.FC<{dur:number}> = ({dur}) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0,10], [0,1], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
  const ln = (i:number) => interpolate(f - (12 + i*8), [0,10], [0,1], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
  return (
    <AbsoluteFill style={{ background:INK, opacity:op, padding:"240px 80px 0" }}>
      <div style={{ opacity:ln(0), fontFamily:HEAD, fontWeight:700, fontSize:58, color:"#fff" }}><span style={{ color:ACCENT }}>1위</span> 문재인 +16.9%</div>
      <div style={{ opacity:ln(1), fontFamily:HEAD, fontWeight:700, fontSize:58, color:"#fff", marginTop:14 }}><span style={{ color:"#5b8def" }}>꼴찌</span> 윤석열 -17.1%</div>
      <div style={{ opacity:ln(2), fontFamily:HEAD, fontWeight:700, fontSize:74, color:"#fff", lineHeight:1.2, marginTop:46 }}>너네 정권 때가<br />제일 심했다?</div>
      <div style={{ opacity:ln(3), fontFamily:HEAD, fontWeight:700, fontSize:48, color:"#fff", marginTop:34 }}>댓글로 숫자 보고 싸워봐 🔥</div>
      <div style={{ position:"absolute", bottom:70, width:1080, left:0, textAlign:"center", fontFamily:HEAD, fontWeight:700, fontSize:34, color:"rgba(255,255,255,0.5)" }}>@zipsaja</div>
    </AbsoluteFill>
  );
};

export const PresReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <Sequence from={0} durationInFrames={150}><Hook dur={150} /></Sequence>
    <Sequence from={150} durationInFrames={520}><Chart dur={520} /></Sequence>
    <Sequence from={670} durationInFrames={230}><Cta dur={230} /></Sequence>
  </AbsoluteFill>
);
