---
name: zipsaja-remotion-orchestrator
description: "zipsaja 콘텐츠 제작, zipsaja 파이프라인, 집사자 캐러셀+릴스, Remotion 단일 워크플로우, HyperFrames 제거/금지, 단계별 스킬 병렬화 요청 시 반드시 사용. 신규 zipsaja 릴스는 항상 Remotion으로만 만든다."
---

# zipsaja Remotion Orchestrator

This is the master skill for zipsaja content production. It coordinates small skills through `pipeline-state.json` instead of relying on memory.

## First Read

Read `references/state-contract.md` when you need exact step order, artifact paths, or recovery rules.

## Core Rule

New zipsaja reels are Remotion-only.
Never use HyperFrames for new zipsaja reels.
Historical `hyperframes_reel` folders may stay in old bundles, but do not create or extend them.

## Workflow

1. Locate or create `brands/zipsaja/zipsaja_pipeline_<slug>/pipeline-state.json`.
2. Confirm `workflow_version` is `zipsaja-remotion-v1`.
3. Inspect `steps` and choose the next actionable step.
4. Use the matching sub-skill:
   - `brief` → `zipsaja-brief`
   - `data` → `zipsaja-data-fetch`
   - `storyboard` → `zipsaja-storyboard`
   - `carousel` → `zipsaja-carousel-render`
   - `remotion` → `zipsaja-remotion-render`
   - `attachments` → `zipsaja-attachments`
   - `captions` → `zipsaja-captions`
   - `package-qa` → `zipsaja-package-qa`
5. Each sub-skill must update its own step status and artifact path.
6. When the user explicitly asks for parallel work, split only independent steps:
   - after `brief`: `data` and asset checks
   - after `storyboard`: `carousel`, `attachments`, `captions`
7. Report the current state path and next step after each run.

## Recovery

If context is lost, reload `pipeline-state.json` and continue from `next_pending_step`.
If the state mentions HyperFrames for a new reel, stop and ask to migrate that step to Remotion.

## Completion

The workflow is complete only when:

- `reels/full.mp4` exists
- a 22s mp4 exists under `reels/`
- `carousel/slides.html` exists
- `captions/` exists when captions were requested
- `attachments/` exists when lead magnet files were requested
- `zipsaja-package-qa` has verified no new HyperFrames output was created
