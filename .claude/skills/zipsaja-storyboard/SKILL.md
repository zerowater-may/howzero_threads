---
name: zipsaja-storyboard
description: "Combines brief.md and data.json into storyboard.json for carousel/Remotion reel common design. Fixes slide order, reel beats, CTA, and shared messaging."
---

# zipsaja Storyboard

Create `brands/zipsaja/zipsaja_pipeline_<slug>/storyboard.json`.

This skill turns the approved brief and fetched data into one shared source for the carousel and the 22s Remotion reel.

## Required Inputs

- `brands/zipsaja/zipsaja_pipeline_<slug>/pipeline-state.json`
- `brands/zipsaja/zipsaja_pipeline_<slug>/brief.md`
- `brands/zipsaja/zipsaja_pipeline_<slug>/data.json`

If `pipeline-state.json`, `brief.md`, or `data.json` is missing, stop and report the missing file.

## Output Schema

Write `storyboard.json` with this schema:

```json
{
  "topic": "주제",
  "hook": "첫 장 훅",
  "carousel": [
    {
      "slide": 1,
      "role": "cover",
      "headline": "짧은 제목",
      "body": ["핵심 문장"],
      "visual": "zipsaja beige/orange card"
    }
  ],
  "reel": {
    "durationSec": 22,
    "composition": "Remotion",
    "beats": [
      {"start": 0, "end": 3, "message": "첫 훅"},
      {"start": 3, "end": 18, "message": "데이터 전개"},
      {"start": 18, "end": 22, "message": "CTA"}
    ]
  },
  "cta": "댓글/저장/DM CTA"
}
```

## Rules

- Keep carousel and reel messaging consistent.
- Use zipsaja 반말 tone.
- Do not add 투자 권유.
- Do not mention HyperFrames.
- The Remotion composition field must be `Remotion`.
- Use `data.json` for proof points and comparisons; do not invent numbers.

## State Update

After writing `storyboard.json`, update `pipeline-state.json`:

- `steps.storyboard = "done"`
- `artifacts.storyboard.path = "brands/zipsaja/zipsaja_pipeline_<slug>/storyboard.json"`
