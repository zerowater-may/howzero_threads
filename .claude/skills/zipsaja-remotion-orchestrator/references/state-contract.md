# zipsaja Remotion State Contract

All zipsaja Remotion workflow skills use one bundle:

```text
brands/zipsaja/zipsaja_pipeline_<slug>/
├── pipeline-state.json
├── brief.md
├── data.json
├── storyboard.json
├── carousel/
├── reels/
├── publish-ready/
├── attachments/
├── captions/
└── publish-state.json
```

## Required State Fields

```json
{
  "workflow_version": "zipsaja-remotion-v1",
  "brand": "zipsaja",
  "topic": "주제",
  "slug": "slug",
  "forbidden_tools": ["hyperframes"],
  "steps": {
    "brief": "pending",
    "data": "pending",
    "storyboard": "pending",
    "remotion": "pending",
    "carousel": "pending",
    "attachments": "pending",
    "captions": "pending",
    "package-qa": "pending"
  },
  "artifacts": {}
}
```

Valid step statuses: `pending`, `running`, `done`, `skipped`, `failed`.

## Ordered Steps

1. `brief`
2. `data`
3. `storyboard`
4. `remotion`
5. `carousel`
6. `attachments`
7. `captions`
8. `package-qa`

## Parallel Windows

After `brief` exists, `data` and asset checks may run in parallel.
After `storyboard` exists, `remotion`, `carousel`, `attachments`, and `captions` may run in parallel.
`remotion` requires `data` and should follow `storyboard` when storyboard exists. It must not require `carousel`.
`carousel` is a separate 4:5 feed distribution artifact, not the source of the Reel.
`package-qa` runs last.

Publishing through Zernio is a post-completion action. It requires `status="completed"` and writes `publish-state.json`, but it is not part of the automatic generation DAG.

## Publish-Ready Contract

```text
publish-ready/
├── instagram-carousel/slide-01.png ...  # 1080x1350, 4:5
├── instagram-reel-cover.png             # 1080x1920, 9:16
└── threads-carousel/slide-01.png ...    # 1080x1350, 4:5
```

Reels API publishing prefers `reels/zipsaja-reel-30s-audio-mapped-ig-safe.mp4`, then `reels/zipsaja-reel-30s-audio-mapped.mp4`, then `reels/zipsaja-reel-30s.mp4`. Legacy `22s` files are fallback only when no 30s reel exists.

## Hard Rule

New zipsaja reels are Remotion-only.
Never use HyperFrames for new zipsaja reels.
Existing folders containing `hyperframes_reel` are historical artifacts only.
