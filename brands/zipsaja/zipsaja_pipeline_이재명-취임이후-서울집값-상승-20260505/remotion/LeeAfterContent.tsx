import React from "react";
import {
  AbsoluteFill,
  Composition,
  Img,
  Easing,
  interpolate,
  registerRoot,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { loadFont as loadJua } from "@remotion/google-fonts/Jua";
import { loadFont as loadGaegu } from "@remotion/google-fonts/Gaegu";
import { loadFont as loadNoto } from "@remotion/google-fonts/NotoSansKR";

loadJua();
loadGaegu();
loadNoto();

const FPS = 30;
const SLIDE_COUNT = 10;
const CAROUSEL_SLIDE_FRAMES = 30;
const REEL_SLIDE_FRAMES = 90;
const REEL_FRAMES = FPS * 30;

const INK = "#1A1A1A";
const ORANGE = "#EA2E00";
const CREAM = "#F0E7D6";
const WHITE = "#FFFFFF";

type SlideKind = "cover" | "method" | "summary" | "rank" | "two" | "contrast" | "message" | "cta";

type Slide = {
  kicker: string;
  title: string;
  accent: string;
  body: string;
  big: string;
  small?: string;
  mascot: string;
  bubble: string;
  kind: SlideKind;
};

const source = "출처: 국토부 실거래가 · 서울 아파트 매매 A1 · 300세대 이상 · 동일 단지/평형 매칭";

const slides: Slide[] = [
  {
    kicker: "서울 집값 상승 보드",
    title: "이재명 취임 이후\n서울 집값 어디가 뛰었나",
    accent: "숫자로만 봤어",
    body: "서울 전체 같은 단지·평형 기준\n12.28억에서 13.84억으로",
    big: "+12.7%",
    mascot: "mascot-hero.png",
    bubble: "정치 말고\n실거래만 보자",
    kind: "cover",
  },
  {
    kicker: "비교 기준",
    title: "취임 초기 90일과\n최근 90일을 붙였어",
    accent: "같은 단지·평형 매칭",
    body: "거래 구성이 바뀌어서 오른 것처럼 보이는 착시를 줄이려고\n양쪽 기간에 모두 거래된 단지와 평형만 봤어",
    big: "2,979개",
    small: "매칭 표본",
    mascot: "mascot-default.png",
    bubble: "원인 단정은\n아니야",
    kind: "method",
  },
  {
    kicker: "서울 전체",
    title: "서울 평균도\n이미 한 칸 올라갔어",
    accent: "평균 +1.56억",
    body: "취임 초기 12.28억\n최근 90일 13.84억",
    big: "+1.56억",
    small: "상승률 +12.7%",
    mascot: "mascot-surprise.png",
    bubble: "평균만 봐도\n꽤 움직였어",
    kind: "summary",
  },
  {
    kicker: "상승률 TOP 1",
    title: "성동구가\n제일 크게 튀었어",
    accent: "+23.3%",
    body: "15억에서 18.49억\n같은 단지·평형 평균 +3.49억",
    big: "+23.3%",
    small: "+3.49억",
    mascot: "mascot-angry.png",
    bubble: "여긴 진짜\n확 튀었어",
    kind: "rank",
  },
  {
    kicker: "상승률 TOP 2",
    title: "동작구도\n20% 넘게 뛰었어",
    accent: "+20.5%",
    body: "13.18억에서 15.88억\n같은 단지·평형 평균 +2.7억",
    big: "+20.5%",
    small: "+2.7억",
    mascot: "mascot-worried.png",
    bubble: "체감으론\n몇 년치 저축이야",
    kind: "rank",
  },
  {
    kicker: "상승률 TOP 3",
    title: "광진구도\n강하게 밀렸어",
    accent: "+20.3%",
    body: "15.09억에서 18.16억\n같은 단지·평형 평균 +3.07억",
    big: "+20.3%",
    small: "+3.07억",
    mascot: "mascot-surprise.png",
    bubble: "강남 얘기만\n할 일이 아냐",
    kind: "rank",
  },
  {
    kicker: "상승권 묶음",
    title: "강동·동대문도\n조용히 많이 올랐어",
    accent: "TOP5 마감",
    body: "4위 강동구 +19.2% · +2.54억\n5위 동대문구 +17.4% · +1.8억",
    big: "TOP5",
    small: "서울 안에서도 상승 속도 갈림",
    mascot: "mascot-shining.png",
    bubble: "강남만 보는 순간\n놓치는 구가 생겨",
    kind: "two",
  },
  {
    kicker: "반전",
    title: "강남보다\n더 오른 구가 많았어",
    accent: "강남 +5.2%",
    body: "강남구는 +5.2%였고\n성동·동작·광진·강동·동대문은 17~23%대였어",
    big: "속도 차이",
    small: "비싼 곳보다 빠른 곳이 문제",
    mascot: "mascot-side.png",
    bubble: "비싼 구랑\n빠른 구는 달라",
    kind: "contrast",
  },
  {
    kicker: "첫집러 관점",
    title: "문제는 정치가 아니라\n내 후보지 속도야",
    accent: "후보지 재계산",
    body: "하위권인 도봉도 +2.3%, 금천도 +3.5%\n덜 오른 거지 내린 건 아니었어",
    big: "25개 구\n전부 상승",
    small: "평균 말고 내 지역을 봐야 해",
    mascot: "mascot-worried.png",
    bubble: "내 예산표가\n다시 그려져",
    kind: "message",
  },
  {
    kicker: "자료",
    title: "댓글에\n엑셀/PDF",
    accent: "데이터 보내줄게",
    body: "25개 구 전체 상승률이랑\n평균 가격표 정리해뒀어",
    big: "저장",
    small: "나중에 다시 계산해봐",
    mascot: "mascot-happy.png",
    bubble: "댓글 남기면\n보내줄게",
    kind: "cta",
  },
];

const pickSlide = (frame: number, framesPerSlide: number) => {
  return Math.min(Math.floor(frame / framesPerSlide), SLIDE_COUNT - 1);
};

const lineBreaks = (value: string) => value.split("\n").map((line, index) => (
  <React.Fragment key={`${line}-${index}`}>
    {index > 0 ? <br /> : null}
    {line}
  </React.Fragment>
));

const fit = (value: string, base: number) => {
  const length = value.replace(/\s|\n/g, "").length;
  if (length > 20) return base * 0.76;
  if (length > 15) return base * 0.86;
  if (length > 11) return base * 0.94;
  return base;
};

const Card: React.FC<{ slide: Slide; page: number; animated?: boolean; localFrame?: number }> = ({
  slide,
  page,
  animated = false,
  localFrame = 20,
}) => {
  const dark = slide.kind === "cta";
  const contentY = animated
    ? interpolate(localFrame, [0, 12], [26, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    : 0;
  const opacity = animated
    ? interpolate(localFrame, [0, 10, REEL_SLIDE_FRAMES - 12, REEL_SLIDE_FRAMES], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  const mascotClass =
    slide.kind === "cover" || slide.kind === "cta" ? "hero" : slide.kind === "rank" || slide.kind === "summary" ? "top" : "corner";

  return (
    <div
      style={{
        width: 1080,
        height: 1350,
        background: dark ? INK : CREAM,
        color: dark ? WHITE : INK,
        position: "relative",
        overflow: "hidden",
        padding: "70px 66px 120px",
        fontFamily: "Noto Sans KR",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 44,
          right: 64,
          background: ORANGE,
          color: WHITE,
          border: `4px solid ${dark ? WHITE : INK}`,
          borderRadius: 999,
          padding: "5px 18px",
          fontFamily: "Jua",
          fontSize: 30,
          lineHeight: 1,
        }}
      >
        {String(page).padStart(2, "0")}
      </div>

      <div style={{ opacity, transform: `translateY(${contentY}px)`, position: "relative", zIndex: 2 }}>
        <div
          style={{
            display: "inline-block",
            background: dark ? ORANGE : INK,
            color: WHITE,
            border: `4px solid ${dark ? WHITE : INK}`,
            borderRadius: 999,
            padding: "12px 24px",
            fontFamily: "Jua",
            fontSize: 34,
            lineHeight: 1,
            marginBottom: 34,
          }}
        >
          {slide.kicker}
        </div>
        <div
          style={{
            fontFamily: "Jua",
            fontSize: fit(slide.title, 82),
            lineHeight: 1.08,
            letterSpacing: 0,
            marginBottom: 28,
          }}
        >
          {lineBreaks(slide.title)}
        </div>
        <div
          style={{
            display: "inline-block",
            background: ORANGE,
            color: WHITE,
            border: `4px solid ${dark ? WHITE : INK}`,
            borderRadius: 999,
            padding: "8px 30px 14px",
            fontFamily: "Jua",
            fontSize: fit(slide.accent, 54),
            lineHeight: 1,
            boxShadow: dark ? "6px 6px 0 rgba(255,255,255,.35)" : `6px 6px 0 ${INK}`,
            marginBottom: 30,
          }}
        >
          {slide.accent}
        </div>

        {slide.kind === "two" ? <TopFiveBoard /> : <DefaultBody slide={slide} />}
      </div>

      <Bubble slide={slide} />
      <Img
        src={staticFile(slide.mascot)}
        style={{
          position: "absolute",
          right: mascotClass === "hero" ? 34 : mascotClass === "top" ? 54 : 46,
          bottom: mascotClass === "hero" ? 110 : mascotClass === "top" ? undefined : 112,
          top: mascotClass === "top" ? 236 : undefined,
          width: mascotClass === "hero" ? 300 : mascotClass === "top" ? 176 : 188,
          height: mascotClass === "hero" ? 300 : mascotClass === "top" ? 176 : 188,
          objectFit: "contain",
          zIndex: 3,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          bottom: 56,
          textAlign: "center",
          color: dark ? "rgba(255,255,255,.68)" : "#555",
          fontFamily: "Noto Sans KR",
          fontWeight: 900,
          fontSize: 22,
          lineHeight: 1.25,
        }}
      >
        {source}
      </div>
      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          bottom: 24,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "Jua",
          fontSize: 25,
          color: dark ? WHITE : INK,
        }}
      >
        <span>@zipsaja</span>
        <span>{page} / 10</span>
      </div>
    </div>
  );
};

const DefaultBody: React.FC<{ slide: Slide }> = ({ slide }) => (
  <>
    <div
      style={{
        width: 720,
        background: slide.kind === "cta" ? CREAM : WHITE,
        color: INK,
        border: `4px solid ${INK}`,
        borderRadius: 18,
        boxShadow: `7px 7px 0 ${slide.kind === "cta" ? "rgba(255,255,255,.35)" : INK}`,
        padding: "34px 38px",
        fontSize: 34,
        fontWeight: 900,
        lineHeight: 1.38,
        whiteSpace: "pre-line",
        marginBottom: 24,
      }}
    >
      {slide.body}
    </div>
    <div
      style={{
        fontFamily: "Jua",
        fontSize: slide.kind === "message" ? 86 : slide.kind === "cta" ? 154 : slide.kind === "cover" ? 150 : 126,
        lineHeight: slide.kind === "message" ? 1.08 : 0.95,
        color: ORANGE,
        textShadow: slide.kind === "cta" ? "7px 7px 0 rgba(255,255,255,.32)" : `7px 7px 0 ${INK}`,
        whiteSpace: "pre-line",
        margin: "10px 0 18px",
      }}
    >
      {slide.big}
    </div>
    {slide.small ? (
      <div
        style={{
          fontFamily: "Jua",
          fontSize: 44,
          lineHeight: 1.15,
          color: slide.kind === "cta" ? WHITE : INK,
          whiteSpace: "pre-line",
        }}
      >
        {slide.small}
      </div>
    ) : null}
  </>
);

const TopFiveBoard: React.FC = () => {
  const rows = [
    ["4위", "강동구 +2.54억", "+19.2%"],
    ["5위", "동대문구 +1.8억", "+17.4%"],
  ];
  return (
    <>
      <div style={{ width: 760, display: "grid", gap: 16 }}>
        {rows.map(([rank, gu, pct]) => (
          <div
            key={rank}
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr 190px",
              alignItems: "center",
              background: WHITE,
              border: `4px solid ${INK}`,
              borderRadius: 16,
              minHeight: 108,
              boxShadow: `6px 6px 0 ${INK}`,
              overflow: "hidden",
              fontFamily: "Jua",
            }}
          >
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: INK,
                color: WHITE,
                fontSize: 42,
              }}
            >
              {rank}
            </div>
            <div style={{ fontSize: 48, textAlign: "center" }}>{gu}</div>
            <div style={{ fontSize: 42, color: ORANGE, textAlign: "center" }}>{pct}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 34, fontFamily: "Jua", fontSize: 44, lineHeight: 1.15 }}>
        서울 안에서도 상승 속도 갈림
      </div>
    </>
  );
};

const Bubble: React.FC<{ slide: Slide }> = ({ slide }) => {
  const cover = slide.kind === "cover";
  const cta = slide.kind === "cta";
  return (
    <div
      style={{
        position: "absolute",
        right: cover ? 336 : 236,
        bottom: cover ? 348 : 274,
        background: WHITE,
        border: `4px solid ${INK}`,
        borderRadius: 24,
        boxShadow: `5px 5px 0 ${cta ? "rgba(255,255,255,.35)" : INK}`,
        padding: "17px 26px",
        fontFamily: "Gaegu",
        fontWeight: 700,
        fontSize: 34,
        lineHeight: 1.16,
        whiteSpace: "pre-line",
        color: INK,
        zIndex: 4,
      }}
    >
      {slide.bubble}
    </div>
  );
};

const LeeAfterCarousel: React.FC = () => {
  const frame = useCurrentFrame();
  const index = pickSlide(frame, CAROUSEL_SLIDE_FRAMES);
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <Card slide={slides[index]} page={index + 1} />
    </AbsoluteFill>
  );
};

const LeeAfterReel: React.FC = () => {
  const frame = useCurrentFrame();
  const index = pickSlide(frame, REEL_SLIDE_FRAMES);
  const localFrame = frame - index * REEL_SLIDE_FRAMES;
  const scale = interpolate(localFrame, [0, REEL_SLIDE_FRAMES], [1, 1.018], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });
  return (
    <AbsoluteFill style={{ background: CREAM, justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: 1080, height: 1350, transform: `scale(${scale})` }}>
        <Card slide={slides[index]} page={index + 1} animated localFrame={localFrame} />
      </div>
    </AbsoluteFill>
  );
};

const Root: React.FC = () => (
  <>
    <Composition
      id="LeeAfterCarousel"
      component={LeeAfterCarousel}
      durationInFrames={SLIDE_COUNT * CAROUSEL_SLIDE_FRAMES}
      fps={FPS}
      width={1080}
      height={1350}
    />
    <Composition
      id="LeeAfterReel"
      component={LeeAfterReel}
      durationInFrames={REEL_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
  </>
);

registerRoot(Root);
