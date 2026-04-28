---
name: zipsaja-content
description: Generate 1080×1350 zipsaja brand instagram carousel slides from proptech_db data. Auto-injects footer with live counts, validates samples, runs tone/contrast guards, exports PNG. Use when the user asks for "카드뉴스", "캐러셀", "데이터 시각화" with zipsaja brand. Sister skill of zipsaja-design.
user-invocable: true
---

# zipsaja-content

데이터 → 캐러셀 파이프라인. **반-자동**: SQL/SVG/footer는 자동, hook 카피·narrative는 사람.

## 시작 전 필독

1. `CHECKLIST.md` — 13개 자동 가드 (외부 이미지 금지, stale 카운트 금지, 톤 검사 등)
2. `zipsaja-design/colors_and_type.css` — 비주얼 토큰 (이 스킬이 import)
3. `proptech_db` 접근 가능 여부 — `ssh root@151.245.106.86`

## 7단계 워크플로

1. **TOPIC** — 사람: 토픽 한 줄. SQL preset 어떤 거 쓸지 결정.
2. **DATA** — 자동: `python -m lib.cli fetch <slug>` → `data.json`
3. **HOOK** — 자동→사람: `lib/hook_draft.py`로 5개 후보 생성, 사람이 고르거나 새로 씀.
4. **OUTLINE** — 사람: `spec.yaml`에 8~10장 slide outline 작성.
5. **VALIDATE** — 자동→사람: outlier ★, median/mean 비교 → 사람 확인.
6. **RENDER** — 자동: `python -m lib.cli render <slug>` → `slides/*.html`
7. **EXPORT** — 자동: `python -m lib.cli export <slug>` → `exports/*.png`

또는 한 번에: `python -m lib.cli build <slug>`.

## 사용 예 — 자연어 호출

> "10년 전 vs 지금 비교 카드뉴스 만들어줘"

스킬은 다음을 한다:
1. `python -m lib.cli init seoul-10y` 실행
2. spec.yaml에 data_queries로 SQL preset 채움
3. `fetch` 실행 → `data.json` 확인
4. `hook_draft` 출력 → 5개 후보 사용자에게 보여줌
5. 사용자가 hook 고르면 spec.yaml 채우기 도움 (slides outline 제안)
6. `render` → 사용자가 HTML 미리보기 (브라우저 open)
7. OK 받으면 `export` → PNG

## 컴포넌트 카탈로그 (9종)

`cover` / `quote-big` / `rank-bar` / `map-seoul` / `map-gyeonggi` / `compare-2col` / `deep-detail` / `distribution` / `cta`

## SQL preset (5종)

`live-counts` / `price-by-gu` / `price-history-Ny` / `auction-recent` / `distressed`

## 출력 위치

`output/YYYY-MM-DD-<slug>/`
├── `spec.yaml` (입력)
├── `data.json` (라이브 쿼리 결과)
├── `slides/*.html` (렌더 결과)
├── `exports/*.png` (1080×1350 for new Instagram carousel posts)
└── `meta.json` (빌드 메타)

Legacy outputs or templates that still render 1080×1440 must be migrated to 1080×1350 before publishing.
