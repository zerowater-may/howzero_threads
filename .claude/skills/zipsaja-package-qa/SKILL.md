---
name: zipsaja-package-qa
description: "zipsaja Remotion 워크플로우 최종 검수에 사용. bundle 산출물, Remotion mp4, ffprobe, slide PNG, captions/attachments, brands/zipsaja/INDEX.md, HyperFrames 신규 생성 금지를 확인한다."
---

# zipsaja Package QA

Run this after zipsaja carousel, Remotion reel, attachments, and captions are generated.

## Required Checks

Replace `<slug>` with the bundle slug.

```bash
BUNDLE=brands/zipsaja/zipsaja_pipeline_<slug>
test -f "$BUNDLE/pipeline-state.json"
test -f "$BUNDLE/data.json"
test -f "$BUNDLE/carousel/slides.html"
test -f "$BUNDLE/reels/full.mp4"
test -f "$BUNDLE/reels/zipsaja-reel-30s.mp4"
```

Check carousel metadata:

```bash
sips -g pixelWidth -g pixelHeight "$BUNDLE/carousel/slide-01.png"
```

Expected: `1080` x `1350`.

Check video metadata:

```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,sample_aspect_ratio,display_aspect_ratio,r_frame_rate:format=duration \
  -of default=nokey=1:noprint_wrappers=1 \
  "$BUNDLE/reels/zipsaja-reel-30s.mp4"
```

Expected stream values:

```text
1080
1920
1:1
9:16
30/1
30.000000
```

If the bundle will be published through Zernio, also check:

```bash
test -f "$BUNDLE/reels/zipsaja-reel-30s-audio-mapped-ig-safe.mp4"
test -f "$BUNDLE/publish-ready/instagram-reel-cover.png"
sips -g pixelWidth -g pixelHeight "$BUNDLE/publish-ready/instagram-reel-cover.png"
find "$BUNDLE/publish-ready/instagram-carousel" -name 'slide-*.png' | sort | head -1 | xargs sips -g pixelWidth -g pixelHeight
```

Expected:

- Reels safe video: `1080x1920`, `SAR 1:1`, `DAR 9:16`
- Reel cover: `1080x1920`
- Instagram carousel: `1080x1350`

Check slides:

```bash
find "$BUNDLE/carousel" -name 'slide-*.png' | sort | wc -l
```

Expected: at least `1`.

Check no new HyperFrames output exists:

```bash
find "$BUNDLE" -iname '*hyperframes*' -print
```

Expected: no output for new Remotion workflow bundles.

Check captions and attachments:

```bash
test -f "$BUNDLE/captions/instagram.txt"
test -f "$BUNDLE/captions/threads.txt"
test -f "$BUNDLE/captions/linkedin.txt"
test -f "$BUNDLE/attachments/seoul-price-data.xlsx"
test -f "$BUNDLE/attachments/seoul-price-insights.pdf"
```

Threads caption strategy:

```bash
awk 'NF {count++} END {exit !(count >= 2 && count <= 3)}' "$BUNDLE/captions/threads.txt"
rg -n '^#' "$BUNDLE/captions/threads.txt" && exit 1 || true
```

Expected: 2-3 non-empty lines, no hashtags. It should read like a sharp hook, not a summary caption.

Check brand index:

```bash
rg -n "<slug>|zipsaja_pipeline_<slug>" brands/zipsaja/INDEX.md
```

If the index is missing the new content, add one row under the zipsaja series table.

Dry-run Zernio payload without changing publish state:

```bash
python3 -m scripts.zernio_publish "$BUNDLE" \
  --platform instagram \
  --instagram-media both \
  --dry-run
```

Expected payload includes `contentType: "reels"` and `instagramThumbnail` when `publish-ready/instagram-reel-cover.png` exists.

## State Update

Set:

- `steps.package-qa = "done"`
- `status = "completed"`

If any check fails, set:

- `steps.package-qa = "failed"`
- `status = "failed"`
- `failed_at = "package-qa"`
- `failed_reason` to the exact failed command or missing file.
