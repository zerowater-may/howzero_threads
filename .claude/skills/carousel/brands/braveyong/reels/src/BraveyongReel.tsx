import { AbsoluteFill, Img, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { Slide1Cover } from "./slides/Slide1Cover";
import { COLORS } from "./brand-tokens";

export const FPS = 30;

const SLIDE_DURATION = 75; // 2.5s @ 30fps
const TRANSITION_DURATION = 18;

// 실제 슬라이드 개수는 public/slides/ 안의 PNG 개수와 일치해야 함.
// /reels 커맨드가 자동 업데이트함.
const SLIDE_COUNT = 12;

export const TOTAL_FRAMES =
  SLIDE_DURATION * SLIDE_COUNT +
  TRANSITION_DURATION * (SLIDE_COUNT - 1);

const BG_COLOR = COLORS.darkRedBlack;

const PngSlide: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const kenBurns = interpolate(frame, [0, SLIDE_DURATION], [1.0, 1.035], {
    easing: Easing.inOut(Easing.ease),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG_COLOR,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          transform: `scale(${kenBurns})`,
          width: 1080,
          height: 1920,
          filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.12))",
        }}
      >
        <Img
          src={staticFile(`slides/slide-${index}.png`)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const BraveyongReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG_COLOR }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SLIDE_DURATION}>
          <Slide1Cover durationInFrames={SLIDE_DURATION} />
        </TransitionSeries.Sequence>

        {Array.from({ length: SLIDE_COUNT - 1 }, (_, i) => i + 2).map((idx) => (
          <>
            <TransitionSeries.Transition
              key={`t-${idx}`}
              presentation={slide({ direction: "from-right" })}
              timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
            />
            <TransitionSeries.Sequence
              key={`s-${idx}`}
              durationInFrames={SLIDE_DURATION}
            >
              <PngSlide index={idx} />
            </TransitionSeries.Sequence>
          </>
        ))}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
