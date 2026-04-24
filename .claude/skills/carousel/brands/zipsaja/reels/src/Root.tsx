import { Composition } from "remotion";
import { ZipsajaReel, FPS, TOTAL_FRAMES } from "./ZipsajaReel";
import { Slide1Cover } from "./slides/Slide1Cover";
import { NowonSanggyeReel, NOWON_SANGGYE_TOTAL_FRAMES } from "./NowonSanggyeReel";
import { NowonSanggyeCarousel, NOWON_SANGGYE_CAROUSEL_TOTAL_FRAMES } from "./NowonSanggyeCarousel";
import { SeoulPriceReel, SEOUL_PRICE_TOTAL_FRAMES } from "./SeoulPriceReel";
import {
  SeoulWeeklyRateReel,
  SEOUL_WEEKLY_RATE_TOTAL_FRAMES,
  type SeoulWeeklyRateDataset,
} from "./SeoulWeeklyRateReel";
import seoulWeeklyData from "../public/data/seoul-weekly-rate.json";
// Data source: proptech_db on hh-worker-2 (real_prices JOIN complexes).
// Period split at 2025-06-04 (이재명 대통령 취임일). 300세대 이상 아파트 매매 A1.
// Query: scripts/zipsaja_seoul_prices/__main__.py (updated for hh-worker-2 connection).
import seoulPricesData from "../public/data/seoul-prices.json";
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
        defaultProps={{ data: seoulPricesData as SeoulPriceDataset }}
      />
      <Composition
        id="SeoulWeeklyRateReel"
        component={SeoulWeeklyRateReel}
        durationInFrames={SEOUL_WEEKLY_RATE_TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ data: seoulWeeklyData as SeoulWeeklyRateDataset }}
      />
    </>
  );
};
