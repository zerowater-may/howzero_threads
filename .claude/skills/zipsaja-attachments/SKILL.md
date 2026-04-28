---
name: zipsaja-attachments
description: "zipsaja Remotion workflow wrapper that generates Excel and PDF lead magnet attachments through scripts.content_attachments."
---

# zipsaja Attachments

Generate lead magnet attachments for a zipsaja pipeline bundle.

## Inputs

- `brands/zipsaja/zipsaja_pipeline_<slug>/pipeline-state.json`
- `brands/zipsaja/zipsaja_pipeline_<slug>/data.json`

## Command

```bash
python3 -m scripts.content_attachments \
  --data brands/zipsaja/zipsaja_pipeline_<slug>/data.json \
  --out brands/zipsaja/zipsaja_pipeline_<slug>/attachments/
```

## Validate

```bash
test -f brands/zipsaja/zipsaja_pipeline_<slug>/attachments/seoul-price-data.xlsx
test -f brands/zipsaja/zipsaja_pipeline_<slug>/attachments/seoul-price-insights.pdf
```

## State Update

Set:

- `steps.attachments = "done"`
- `artifacts.attachments.path = "brands/zipsaja/zipsaja_pipeline_<slug>/attachments"`

If generation fails, set `steps.attachments = "failed"` and record the failing command output.
