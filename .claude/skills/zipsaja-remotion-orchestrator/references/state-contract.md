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
├── attachments/
└── captions/
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
    "carousel": "pending",
    "remotion": "pending",
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
4. `carousel`
5. `remotion`
6. `attachments`
7. `captions`
8. `package-qa`

## Parallel Windows

After `brief` exists, `data` and asset checks may run in parallel.
After `storyboard` exists, `carousel`, `attachments`, and `captions` may run in parallel.
`remotion` requires `carousel` and `data`.
`package-qa` runs last.

## Hard Rule

New zipsaja reels are Remotion-only.
Never use HyperFrames for new zipsaja reels.
Existing folders containing `hyperframes_reel` are historical artifacts only.
