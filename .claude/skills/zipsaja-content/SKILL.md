---
name: zipsaja-content
description: Generate 1080×1440 zipsaja brand instagram carousel slides from proptech_db data. Auto-injects footer with live counts, validates samples, runs tone/contrast guards, exports PNG. Use when the user asks for "카드뉴스", "캐러셀", "데이터 시각화" with zipsaja brand. Sister skill of zipsaja-design.
user-invocable: true
---

# zipsaja-content

This skill is the data → carousel pipeline for the zipsaja brand.

> ⚠️ Read `CHECKLIST.md` BEFORE every build. 13 mistakes from past sessions are codified there.
> ⚠️ Use `zipsaja-design` for visual tokens. This skill imports `colors_and_type.css` from there.

## When to use
- User asks for instagram 카드뉴스 with proptech data
- User wants a 데이터 비교/순위/지도 slide
- User wants a 경매/매물 변동 카드뉴스

## How to use
Run `python -m lib.cli init <slug>` from the skill folder to scaffold a new carousel,
then edit `output/<slug>/spec.yaml` and run `python -m lib.cli build <slug>`.

(Detailed workflow filled in Task 18.)
