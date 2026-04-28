---
name: zipsaja-remotion-render
description: "zipsaja 신규 릴스 mp4를 만들 때 반드시 사용. Remotion만 사용하며 scripts.content_reels와 .claude/skills/carousel/brands/zipsaja/reels 프로젝트를 호출한다. Never use HyperFrames for new zipsaja reels."
---

# zipsaja Remotion Render

Render zipsaja reels with Remotion only.

## Hard Rule

Never use HyperFrames for new zipsaja reels.
Do not run `npx hyperframes`, do not create `hyperframes_reel`, and do not add HyperFrames files to a new bundle.

## Inputs

- `brands/zipsaja/zipsaja_pipeline_<slug>/pipeline-state.json`
- `brands/zipsaja/zipsaja_pipeline_<slug>/data.json`
- `brands/zipsaja/zipsaja_pipeline_<slug>/carousel/` if the selected Remotion composition uses captured slides
- optional `brands/zipsaja/zipsaja_pipeline_<slug>/storyboard.json`

## Command

```bash
python3 -m scripts.content_reels \
  --data brands/zipsaja/zipsaja_pipeline_<slug>/data.json \
  --out brands/zipsaja/zipsaja_pipeline_<slug>/reels/
```

This wrapper uses Remotion only through `scripts.content_reels` and the existing project at:

```text
.claude/skills/carousel/brands/zipsaja/reels
```

## Validate

```bash
test -f brands/zipsaja/zipsaja_pipeline_<slug>/reels/full.mp4
test -f brands/zipsaja/zipsaja_pipeline_<slug>/reels/zipsaja-reel-22s.mp4
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate \
  -of default=nokey=1:noprint_wrappers=1 \
  brands/zipsaja/zipsaja_pipeline_<slug>/reels/zipsaja-reel-22s.mp4
```

Expected video stream values:

- width: `1080`
- height: `1920`
- frame rate: `30/1`

## State Update

Set:

- `steps.remotion = "done"`
- `artifacts.reels.path = "brands/zipsaja/zipsaja_pipeline_<slug>/reels"`

If any command or validation references a forbidden tool from `pipeline-state.json`, stop and mark `steps.remotion = "failed"`.
