import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { SanggyeCover } from "./slides/SanggyeCover";
import { ComplexCard, type Complex } from "./slides/ComplexCard";
import { OutroCTA } from "./slides/OutroCTA";
import data from "./data/nowon-sanggye.json";

export const FPS = 30;

const SLIDE_DURATION = 75;
const TRANSITION_DURATION = 18;

const complexes = data.complexes as Complex[];
const TOTAL_SLIDES = 1 + complexes.length + 1;

// @remotion/transitions uses overlap — next sequence starts during previous
export const NOWON_SANGGYE_TOTAL_FRAMES =
  SLIDE_DURATION * TOTAL_SLIDES - TRANSITION_DURATION * (TOTAL_SLIDES - 1);

export const NowonSanggyeReel: React.FC = () => {
  const { meta } = data;

  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SLIDE_DURATION}>
          <SanggyeCover
            durationInFrames={SLIDE_DURATION}
            gu={meta.gu}
            dong={meta.dong}
            priceTag={meta.priceTag}
            totalListings={meta.totalListings}
            uniqueComplexes={meta.uniqueComplexes}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {complexes.map((c, i) => (
          <>
            <TransitionSeries.Sequence key={`s-${i}`} durationInFrames={SLIDE_DURATION}>
              <ComplexCard complex={c} index={i + 1} total={complexes.length} />
            </TransitionSeries.Sequence>
            <TransitionSeries.Transition
              key={`t-${i}`}
              presentation={slide({ direction: "from-right" })}
              timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
            />
          </>
        ))}

        <TransitionSeries.Sequence durationInFrames={SLIDE_DURATION}>
          <OutroCTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
