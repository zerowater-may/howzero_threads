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
test -f "$BUNDLE/reels/zipsaja-reel-22s.mp4"
```

Check video metadata:

```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate \
  -of default=nokey=1:noprint_wrappers=1 \
  "$BUNDLE/reels/zipsaja-reel-22s.mp4"
```

Expected stream values:

```text
1080
1920
30/1
```

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

Check brand index:

```bash
rg -n "<slug>|zipsaja_pipeline_<slug>" brands/zipsaja/INDEX.md
```

If the index is missing the new content, add one row under the zipsaja series table.

## State Update

Set:

- `steps.package-qa = "done"`
- `status = "completed"`

If any check fails, set:

- `steps.package-qa = "failed"`
- `status = "failed"`
- `failed_at = "package-qa"`
- `failed_reason` to the exact failed command or missing file.
