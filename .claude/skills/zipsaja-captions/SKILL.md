---
name: zipsaja-captions
description: "zipsaja Remotion workflow wrapper that generates Instagram, Threads, and LinkedIn caption text files through scripts.content_captions."
---

# zipsaja Captions

Generate platform captions for a zipsaja pipeline bundle.

## Inputs

- `brands/zipsaja/zipsaja_pipeline_<slug>/pipeline-state.json`
- `brands/zipsaja/zipsaja_pipeline_<slug>/data.json`
- optional `brands/zipsaja/zipsaja_pipeline_<slug>/brief.md`
- optional `brands/zipsaja/zipsaja_pipeline_<slug>/storyboard.json`

## Requirements

- `ANTHROPIC_API_KEY`

## Command

```bash
python3 -m scripts.content_captions \
  --data brands/zipsaja/zipsaja_pipeline_<slug>/data.json \
  --out brands/zipsaja/zipsaja_pipeline_<slug>/captions/
```

## Validate

```bash
test -f brands/zipsaja/zipsaja_pipeline_<slug>/captions/instagram.txt
test -f brands/zipsaja/zipsaja_pipeline_<slug>/captions/threads.txt
test -f brands/zipsaja/zipsaja_pipeline_<slug>/captions/linkedin.txt
```

Threads must be a hook, not a mini caption:

```bash
awk 'NF {count++} END {exit !(count >= 2 && count <= 3)}' \
  brands/zipsaja/zipsaja_pipeline_<slug>/captions/threads.txt
rg -n '^#' brands/zipsaja/zipsaja_pipeline_<slug>/captions/threads.txt && exit 1 || true
```

Expected: 2-3 non-empty lines, no hashtags, no long explanation.

## State Update

Set:

- `steps.captions = "done"`
- `artifacts.captions.path = "brands/zipsaja/zipsaja_pipeline_<slug>/captions"`

If generation fails, set `steps.captions = "failed"` and record the failing command output.
