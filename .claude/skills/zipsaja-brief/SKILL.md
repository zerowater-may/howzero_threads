---
name: zipsaja-brief
description: "Creates or fixes brief.md from a zipsaja topic: hook, audience, core claim, CTA, and risk notes. Remotion workflow brief step."
---

# zipsaja Brief

Create or update `brands/zipsaja/zipsaja_pipeline_<slug>/brief.md`.

This skill fixes the content direction before data, carousel, or Remotion work starts.
It must not create video output.

## Inputs

- `brands/zipsaja/zipsaja_pipeline_<slug>/pipeline-state.json`
- user topic
- `brands/zipsaja/INDEX.md`
- `AGENTS.md`

## Output

Write `brief.md` with this structure:

```markdown
# <topic>

## Hook
<one short opening claim in zipsaja casual Korean tone>

## Audience
20-30대 첫집 구매자, 신혼부부, 생애최초 구매 예정자

## Core Claim
<data-backed claim without 투자 권유>

## Proof Needed
- <dataset or source needed>
- <comparison needed>

## Carousel Promise
<what the carousel will teach>

## Reel Promise
<what the 30s Remotion reel will show first>

## CTA
<save/comment/DM CTA>

## Risk Notes
- 과장 금지
- 투자 권유 금지
- 미혼 무주택 비하 금지
```

## Rules

- Use zipsaja 반말 tone from `brands/zipsaja/INDEX.md`.
- Keep claims concrete enough to verify with `data.json` later.
- Flag uncertain or sensitive claims under `Risk Notes` instead of presenting them as facts.
- Never create video output in this skill.

## State Update

After writing `brief.md`, update `pipeline-state.json`:

- `steps.brief = "done"`
- `artifacts.brief.path = "brands/zipsaja/zipsaja_pipeline_<slug>/brief.md"`
