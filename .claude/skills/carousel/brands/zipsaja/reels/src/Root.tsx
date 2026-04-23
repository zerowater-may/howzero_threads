import { Composition } from "remotion";
import { ZipsajaReel, FPS, TOTAL_FRAMES } from "./ZipsajaReel";
import { Slide1Cover } from "./slides/Slide1Cover";
import { NowonSanggyeReel, NOWON_SANGGYE_TOTAL_FRAMES } from "./NowonSanggyeReel";
import { NowonSanggyeCarousel, NOWON_SANGGYE_CAROUSEL_TOTAL_FRAMES } from "./NowonSanggyeCarousel";
import { SeoulPriceReel, SEOUL_PRICE_TOTAL_FRAMES } from "./SeoulPriceReel";
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
