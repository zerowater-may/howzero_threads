import React from "react";
import {
  AbsoluteFill, Sequence, Img, Easing, interpolate, spring, staticFile,
  delayRender, continueRender, useCurrentFrame, useVideoConfig,
} from "remotion";
import { loadFont as loadGaegu } from "@remotion/google-fonts/Gaegu";

loadGaegu();
const fh = delayRender("gmarket2");
const gB = new FontFace("Gmarket Sans", `url(${staticFile("fonts/GmarketSansTTFBold.ttf")}) format("truetype")`, { weight: "700" });
const gM = new FontFace("Gmarket Sans", `url(${staticFile("fonts/GmarketSansTTFMedium.ttf")}) format("truetype")`, { weight: "500" });
Promise.all([gB.load(), gM.load()]).then(fs => { fs.forEach(f => (document as unknown as { fonts: FontFaceSet }).fonts.add(f)); continueRender(fh); }).catch(() => continueRender(fh));

export const FPS = 30;
export const SHUTTLE_TOTAL_FRAMES = FPS * 30;

const BG = "#F0E7D6", ACCENT = "#EA2E00", DEEP = "#C42600", INK = "#1a1a1a", CREAM = "#F5EDE0";
const HEAD = "'Gmarket Sans','Noto Sans KR',sans-serif", HAND = "'Gaegu',sans-serif";
const RED = "#C62828";

const fade = (f: number, d: number, i = 8, o = 10) => interpolate(f, [0, i, d - o, d], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Count: React.FC<{to:number;start:number;dur:number;dec?:number;suf?:string;style?:React.CSSProperties}> = ({to,start,dur,dec=0,suf="",style}) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [start, start + dur], [0, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return <span style={style}>{v.toFixed(dec)}{suf}</span>;
};
const Hl: React.FC<{children:React.ReactNode;size:number}> = ({children,size}) => (
  <span style={{ background:"linear-gradient(to top,#EA2E00 0,#EA2E00 45%,transparent 45%,transparent 100%)", padding:"0 8px", fontFamily:HEAD, fontWeight:700, fontSize:size }}>{children}</span>
);
const Mark: React.FC<{dark?:boolean}> = ({dark}) => (
  <div style={{ position:"absolute", bottom:56, width:1080, textAlign:"center", fontFamily:HEAD, fontWeight:700, fontSize:30, color: dark?"rgba(255,255,255,0.5)":"rgba(26,26,26,0.45)" }}>@zipsaja</div>
);
const Masc: React.FC<{name:string;f:number;fps:number;at:number;sz:number;r:number;b:number}> = ({name,f,fps,at,sz,r,b}) => {
  const s = spring({ frame: f - at, fps, config:{ damping:11, stiffness:180 } });
  return <Img src={staticFile(`mascots/${name}.png`)} style={{ position:"absolute", right:r, bottom:b, width:sz, height:sz, transform:`scale(${s})` }} />;
};
const Card: React.FC<{n:string;sub:string;eok:string;i:number;f:number;bad?:boolean}> = ({n,sub,eok,i,f,bad}) => {
  const lf = f - (18 + i * 13);
  const o = interpolate(lf, [0, 10], [0, 1], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
  const x = interpolate(lf, [0, 10], [70, 0], { extrapolateLeft:"clamp", extrapolateRight:"clamp", easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ opacity:o, transform:`translateX(${x}px)`, background:"#fff", border:`3px solid ${INK}`, borderRadius:18, boxShadow:`4px 4px 0 0 ${INK}`, padding:"22px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
      <div><div style={{ fontFamily:HEAD, fontWeight:700, fontSize:46 }}>{n}</div><div style={{ fontFamily:HEAD, fontWeight:700, fontSize:28, color:"#6B6B6B", marginTop:2 }}>{sub}</div></div>
      <div style={{ fontFamily:HEAD, fontWeight:700, fontSize:54, color: bad?RED:DEEP, whiteSpace:"nowrap" }}>{eok}</div>
    </div>
  );
};

const Hook: React.FC<{dur:number}> = ({dur}) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const op = fade(f, dur);
  const ty = interpolate(f, [0,14], [40,0], { extrapolateRight:"clamp", easing:Easing.out(Easing.cubic) });
  const ps = spring({ frame:f-22, fps, config:{ damping:12, stiffness:200 } });
  return (
    <AbsoluteFill style={{ opacity:op, padding:"180px 80px 0" }}>
      <div style={{ fontFamily:HAND, fontWeight:700, fontSize:44, color:"#6B6B6B" }}>"반도체 다니면 집 걱정 없지~"</div>
      <div style={{ fontFamily:HEAD, fontWeight:700, fontSize:88, color:INK, lineHeight:1.1, marginTop:22, transform:`translateY(${ty}px)`, letterSpacing:-2 }}>
        성과급 <span style={{ display:"inline-block", transform:`scale(${ps})`, transformOrigin:"center" }}><span style={{ background:ACCENT, color:INK, borderRadius:999, padding:"2px 22px 8px", fontSize:88 }}>11억</span></span>으로<br />동탄역 국평도<br />못 산다
      </div>
      <Masc name="mascot-surprise" f={f} fps={fps} at={40} sz={280} r={56} b={210} /><Mark />
    </AbsoluteFill>
  );
};
const Setup: React.FC<{dur:number}> = ({dur}) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const op = fade(f, dur);
  return (
    <AbsoluteFill style={{ opacity:op, padding:"230px 80px 0" }}>
      <div style={{ fontFamily:HAND, fontWeight:700, fontSize:44, color:"#6B6B6B" }}>성과급 6억 + 대출 6억</div>
      <div style={{ fontFamily:HEAD, fontWeight:700, fontSize:84, color:INK, margin:"16px 0 36px" }}>예산 <Hl size={84}>11억</Hl></div>
      <div style={{ background:CREAM, border:`3px solid ${INK}`, borderRadius:18, boxShadow:`4px 4px 0 0 ${INK}`, padding:"34px 40px", fontFamily:HEAD, fontWeight:700, fontSize:46, lineHeight:1.45 }}>
        하이닉스 본진은 이천.<br />직원들은 셔틀 닿는 '셔세권'으로 간다.<br />11억으로 거기 살 수 있을까?
      </div>
      <Masc name="mascot-default" f={f} fps={fps} at={20} sz={240} r={60} b={210} /><Mark />
    </AbsoluteFill>
  );
};
const NoList: React.FC<{dur:number}> = ({dur}) => {
  const f = useCurrentFrame(); const op = fade(f, dur);
  return (
    <AbsoluteFill style={{ opacity:op, padding:"200px 80px 0" }}>
      <div style={{ fontFamily:HAND, fontWeight:700, fontSize:42, color:"#6B6B6B" }}>11억 영끌해도 ❌</div>
      <div style={{ fontFamily:HEAD, fontWeight:700, fontSize:72, color:INK, margin:"12px 0 36px" }}>여긴 못 가</div>
      <Card n="판교 푸르지오그랑블" sub="성남 분당·판교 · 37평" eok="35.7억" i={0} f={f} bad />
      <Card n="성복역 롯데캐슬" sub="용인 수지 역세권 · 35평" eok="16.3억" i={1} f={f} bad />
      <Card n="동탄역 국평" sub="화성 동탄2 역세권 · 34평" eok="14.7억" i={2} f={f} bad />
      <Mark />
    </AbsoluteFill>
  );
};
const YesList: React.FC<{dur:number}> = ({dur}) => {
  const f = useCurrentFrame(); const op = fade(f, dur);
  return (
    <AbsoluteFill style={{ opacity:op, padding:"200px 80px 0" }}>
      <div style={{ fontFamily:HAND, fontWeight:700, fontSize:42, color:"#6B6B6B" }}>11억으로 되는 곳 ⭕</div>
      <div style={{ fontFamily:HEAD, fontWeight:700, fontSize:72, color:INK, margin:"12px 0 36px" }}>셔세권 신축</div>
      <Card n="동탄역 헤리엇" sub="화성 동탄2 · 2023 신축" eok="10.4억" i={0} f={f} />
      <Card n="힐스테이트 기흥" sub="용인 기흥역 · 2018 신축" eok="11.0억" i={1} f={f} />
      <Card n="광교 호반베르디움" sub="수원 광교 · 24평" eok="10.6억" i={2} f={f} />
      <Mark />
    </AbsoluteFill>
  );
};
const Twist: React.FC<{dur:number}> = ({dur}) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const op = fade(f, dur);
  return (
    <AbsoluteFill style={{ opacity:op, padding:"250px 80px 0" }}>
      <div style={{ fontFamily:HAND, fontWeight:700, fontSize:46, color:"#6B6B6B" }}>근데 반도체 본진 이천은?</div>
      <div style={{ fontFamily:HEAD, fontWeight:700, fontSize:62, color:INK, marginTop:14 }}>국평이</div>
      <div style={{ fontFamily:HEAD, fontWeight:700, fontSize:240, color:DEEP, lineHeight:1, letterSpacing:-4 }}>
        <Count to={4.1} start={8} dur={40} dec={1} suf="억" />
      </div>
      <div style={{ fontFamily:HEAD, fontWeight:700, fontSize:48, color:"#444", marginTop:10 }}>하이닉스 캠퍼스 옆 · 이천 설봉푸르지오</div>
      <Masc name="mascot-shining" f={f} fps={fps} at={18} sz={230} r={64} b={210} /><Mark />
    </AbsoluteFill>
  );
};
const Punch: React.FC<{dur:number}> = ({dur}) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const op = fade(f, dur);
  const bs = spring({ frame:f-16, fps, config:{ damping:13, stiffness:180 } });
  return (
    <AbsoluteFill style={{ opacity:op, padding:"210px 80px 0" }}>
      <div style={{ fontFamily:HAND, fontWeight:700, fontSize:48, color:"#6B6B6B" }}>같은 국평인데</div>
      <div style={{ fontFamily:HEAD, fontWeight:700, fontSize:76, color:INK, margin:"14px 0 38px" }}>통근 거리에 <Hl size={76}>8배</Hl></div>
      <div style={{ transform:`scale(${bs})`, transformOrigin:"left top", background:DEEP, border:`3px solid ${INK}`, borderRadius:18, boxShadow:`4px 4px 0 0 ${INK}`, padding:"40px 46px", color:"#fff", fontFamily:HEAD, fontWeight:700, fontSize:52, lineHeight:1.55 }}>
        이천 본진 · 4.1억<br />동탄 셔세권 · 14.7억<br />판교 · 35.7억
      </div>
      <Mark />
    </AbsoluteFill>
  );
};
const Cta: React.FC<{dur:number}> = ({dur}) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0,10], [0,1], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
  const ln = (i:number) => interpolate(f - (14 + i*8), [0,10], [0,1], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
  return (
    <AbsoluteFill style={{ background:INK, opacity:op, padding:"280px 80px 0" }}>
      <div style={{ fontFamily:HEAD, fontWeight:700, fontSize:90, color:"#fff" }}>너라면?</div>
      <div style={{ opacity:ln(0), fontFamily:HEAD, fontWeight:700, fontSize:58, color:"#fff", marginTop:34 }}><span style={{ color:ACCENT }}>①</span> 동탄 셔세권 14억</div>
      <div style={{ opacity:ln(1), fontFamily:HEAD, fontWeight:700, fontSize:58, color:"#fff", marginTop:16 }}><span style={{ color:ACCENT }}>②</span> 이천 본진 4억</div>
      <div style={{ opacity:ln(2), fontFamily:HEAD, fontWeight:700, fontSize:46, color:"#fff", marginTop:48 }}>반도체 다니는 친구 태그 ㄱㄱ 🔥</div>
      <Mark dark />
    </AbsoluteFill>
  );
};

export const ShuttleReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <Sequence from={0} durationInFrames={135}><Hook dur={135} /></Sequence>
    <Sequence from={135} durationInFrames={130}><Setup dur={130} /></Sequence>
    <Sequence from={265} durationInFrames={145}><NoList dur={145} /></Sequence>
    <Sequence from={410} durationInFrames={135}><YesList dur={135} /></Sequence>
    <Sequence from={545} durationInFrames={135}><Twist dur={135} /></Sequence>
    <Sequence from={680} durationInFrames={120}><Punch dur={120} /></Sequence>
    <Sequence from={800} durationInFrames={100}><Cta dur={100} /></Sequence>
  </AbsoluteFill>
);
