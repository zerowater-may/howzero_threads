import { Composition } from "remotion";
import { BraveyongReel, FPS, TOTAL_FRAMES } from "./BraveyongReel";
import { Slide1Cover } from "./slides/Slide1Cover";

const COVER_DURATION = 120;

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="BraveyongReel"
        component={BraveyongReel}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="Slide1CoverDemo"
        component={Slide1Cover as React.FC<Record<string, unknown>>}
        durationInFrames={COVER_DURATION}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ durationInFrames: COVER_DURATION }}
      />
    </>
  );
};
