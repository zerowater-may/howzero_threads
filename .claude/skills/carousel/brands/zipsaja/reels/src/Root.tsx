import { Composition } from "remotion";
import { ZipsajaReel, FPS, TOTAL_FRAMES } from "./ZipsajaReel";
import { Slide1Cover } from "./slides/Slide1Cover";
import { NowonSanggyeReel, NOWON_SANGGYE_TOTAL_FRAMES } from "./NowonSanggyeReel";
import { NowonSanggyeCarousel, NOWON_SANGGYE_CAROUSEL_TOTAL_FRAMES } from "./NowonSanggyeCarousel";
import { SeoulPriceReel, SEOUL_PRICE_TOTAL_FRAMES } from "./SeoulPriceReel";
// Data source: hand-transcribed screenshot fixture (Task 1). batch_server PG has no
// Seoul real-estate tables (verified 2026-04-24), so the sample JSON is the
// authoritative input. The scripts/zipsaja_seoul_prices fetcher infrastructure is
// in place for a future dataset but is not wired to a live table yet.
import seoulPricesSample from "../public/data/seoul-prices.sample.json";
import type { SeoulPriceDataset } from "./data/seoulPriceTypes";

const COVER_DURATION = 210;

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="ZipsajaReel"
        component={ZipsajaReel}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="NowonSanggyeReel"
        component={NowonSanggyeReel}
        durationInFrames={NOWON_SANGGYE_TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="NowonSanggyeCarousel"
        component={NowonSanggyeCarousel}
        durationInFrames={NOWON_SANGGYE_CAROUSEL_TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1440}
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
      <Composition
        id="SeoulPriceReel"
        component={SeoulPriceReel}
        durationInFrames={SEOUL_PRICE_TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ data: seoulPricesSample as SeoulPriceDataset }}
      />
    </>
  );
};
