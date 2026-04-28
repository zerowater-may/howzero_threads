---
name: zipsaja-carousel-render
description: "zipsaja Remotion workflow wrapper that renders carousel/slides.html and slide PNG files from data.json or storyboard.json. Stateful wrapper around scripts.content_carousel."
---

# zipsaja Carousel Render

Render the carousel artifact for a zipsaja pipeline bundle.

## Inputs

- `brands/zipsaja/zipsaja_pipeline_<slug>/pipeline-state.json`
- `brands/zipsaja/zipsaja_pipeline_<slug>/data.json`
- optional `brands/zipsaja/zipsaja_pipeline_<slug>/storyboard.json`

## Command

```bash
python3 -m scripts.content_carousel \
  --data brands/zipsaja/zipsaja_pipeline_<slug>/data.json \
  --out brands/zipsaja/zipsaja_pipeline_<slug>/carousel/
```

## Validate

```bash
test -f brands/zipsaja/zipsaja_pipeline_<slug>/carousel/slides.html
find brands/zipsaja/zipsaja_pipeline_<slug>/carousel -name 'slide-*.png' | sort
```

The slide PNG validation must return at least one `slide-*.png` file.

Check the first slide size:

```bash
sips -g pixelWidth -g pixelHeight \
  brands/zipsaja/zipsaja_pipeline_<slug>/carousel/slide-01.png
```

Expected: `1080` x `1350`.

## State Update

Set:

- `steps.carousel = "done"`
- `artifacts.carousel.path = "brands/zipsaja/zipsaja_pipeline_<slug>/carousel"`

If rendering fails, set `steps.carousel = "failed"` and record the failing command output.
