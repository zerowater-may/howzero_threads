import { AbsoluteFill, Img, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";

export const FPS = 30;

const SLIDE_DURATION = 75; // 2.5s @ 30fps
const TRANSITION_DURATION = 18;
const PNG_SLIDE_COUNT = 10; // slides 1..10 (seoul-10y: 10장 전부 PNG)

export const TOTAL_FRAMES =
  SLIDE_DURATION * PNG_SLIDE_COUNT +
  TRANSITION_DURATION * (PNG_SLIDE_COUNT - 1);

const BG_COLOR = "#d4c9b0";

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
          src={staticFile(`slides/slide-${String(index).padStart(2, "0")}.png`)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const ZipsajaReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG_COLOR }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SLIDE_DURATION}>
          <PngSlide index={1} />
        </TransitionSeries.Sequence>

        {Array.from({ length: PNG_SLIDE_COUNT - 1 }, (_, i) => i + 2).map((idx) => (
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
