# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/).

---

## [2026-04-20] — YouTube → Carousel 파이프라인 및 캐러셀 스킬 고도화

브랜치: `yt-highlights` (17 commits)

### Added

- `scripts/yt_highlights/` — YouTube URL → `highlights.json` + 프레임 JPG 추출 파이프라인
  - `__main__.py` — CLI 엔트리 (`python3 -m scripts.yt_highlights <URL> --out <dir>`)
  - `models.py` — `HighlightSpan`, `TranscriptSegment`, `Scene` dataclasses
  - `download.py` — yt-dlp 래퍼 (720p, idempotent)
  - `transcript.py` — youtube-transcript-api 래퍼 (한국어 우선)
  - `scenes.py` — PySceneDetect `ContentDetector` 래퍼
  - `heatmap.py` — YouTube Most Replayed heatmap + chapters 파서
  - `fallback.py` — heatmap/chapters 없을 때 자막 휴리스틱 스코어러
  - `frames.py` — ffmpeg 프레임 추출 (lanczos scale + unsharp, 16:9 유지)
  - `merge.py` — 모든 조각을 `highlights.json`으로 병합
  - `README.md` — 사용법 문서
- `tests/yt_highlights/` — 42개 단위 테스트 (fixtures 4종 포함), 전부 통과
- `docs/superpowers/plans/2026-04-20-yt-highlight-extraction.md` — 파이프라인 구현 plan (완료)
- `docs/superpowers/plans/2026-04-20-yt-whisper-fallback.md` — Whisper 전사 대안 plan
- `docs/superpowers/plans/2026-04-20-yt-face-aware-crop.md` — 얼굴 중심 크롭 plan
- `.claude/skills/carousel/brands/braveyong.md` — 용감한용팀장 브랜드 프리셋 (붉은/골드, Black Han Sans)
- `docs/content/carousel-용팀장-스토리/` — 용팀장 스토리 캐러셀 10장 PNG
- `docs/content/carousel-스마트스토어-1000개-정책/` — 스마트스토어 정책 캐러셀 10장 PNG
- `docs/content/carousel-공간임대강의-사기폭로/` — KBS 추적60분 기반 캐러셀 10장 PNG
- `docs/content/carousel-네이버1000개-용팀장해설/` — 용팀장 해설 캐러셀 10장 PNG

### Changed

- `.claude/skills/carousel/SKILL.md` — 대규모 업데이트
  - **입력 소스 3가지 모드** 추가: A(Text, 기본) / B(NotebookLM) / C(YouTube, `highlights.json` + frames)
  - **5가지 레이아웃 풀** 정의: L1 TOP / L2 HERO / L4 BOTTOM / L5 SANDWICH / L6 OVERLAY
  - **L3 SIDE(좌우 분할) 레이아웃 금지** — 16:9 가로 영상의 세로 강제 크롭 문제
  - **슬라이드 1 훅 전용 규칙** 5가지 공식 + 금지 훅 목록
  - 연속 중복 금지, L1 과사용(40% 상한) 규칙
- `pyproject.toml` — `[project.optional-dependencies].yt` 추가 (`youtube-transcript-api>=1.2.4`, `scenedetect[opencv]>=0.6.4`)
- 자동 메모리: NotebookLM은 `/Users/zerowater/.local/bin/notebooklm` CLI 사용 (chrome-mcp 금지), 계정별 `--storage` 전환

### Fixed

- **프레임 화질** — 480p + 단순 확대 → 720p + Lanczos + Unsharp + 장면 중반 타임스탬프
- **프레임 비율** — 3:4 중앙 크롭 강제(좌우 75% 손실) → 원본 16:9 비율 유지
- **download.py regex** — `[A-Za-z0-9_-]+` (느슨) → `[A-Za-z0-9_-]{11}` (YouTube ID 표준)

### Docs

- `docs/superpowers/plans/` 아래 3개 plan 문서 추가
- `scripts/yt_highlights/README.md` — CLI 사용법 + 스모크 테스트 절차

### Verified

- 3개 실 영상에서 end-to-end 검증:
  1. `H-IdU1jTr6M` (KBS 추적60분, 583s) — transcript_fallback 경로, 14 highlights
  2. `AbFSATnz2_c` (용팀장 네이버1000개 해설, 547s) — chapters 경로, 13 highlights
- 단위 테스트 42개 전부 통과

---
