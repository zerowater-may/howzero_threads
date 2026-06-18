import { describe, expect, it } from "vitest";
import {
  buildZernioArgs,
  parseZernioPostId,
  type ContentPublishTarget,
} from "./content-publish";

describe("buildZernioArgs", () => {
  it.each([
    [
      "instagram_reel",
      ["-m", "scripts.zernio_publish", "bundle", "--platform", "instagram", "--instagram-media", "reel", "--now"],
    ],
    [
      "instagram_carousel",
      ["-m", "scripts.zernio_publish", "bundle", "--platform", "instagram", "--instagram-media", "carousel", "--now"],
    ],
    [
      "threads_carousel",
      ["-m", "scripts.zernio_publish", "bundle", "--platform", "threads", "--threads-media", "carousel", "--now"],
    ],
  ])("maps %s to the correct zernio_publish command", (target, expected) => {
    expect(buildZernioArgs("bundle", target as ContentPublishTarget)).toEqual(expected);
  });
});

describe("parseZernioPostId", () => {
  it("reads a submitted post id from zernio output", () => {
    expect(
      parseZernioPostId("[zernio-publish] instagram_reel submitted postId=69abc")
    ).toEqual({ postId: "69abc", duplicate: false });
  });

  it("reads the existing post id from duplicate-protection JSON", () => {
    const output =
      'Zernio POST /posts failed: 409 {"error":"This exact content is already scheduled","details":{"existingPostId":"69dup"}}';

    expect(parseZernioPostId(output)).toEqual({ postId: "69dup", duplicate: true });
  });
});
