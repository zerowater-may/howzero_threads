# HowZero 프로젝트 CLAUDE.md

## 페르소나

- 하우제로(HowZero) 페르소나 가이드: [docs/persona-howzero.md](docs/persona-howzero.md)
- 콘텐츠 작성 시 반드시 페르소나의 톤앤매너(직설적, 데이터 기반, 과장 배제, 경험 기반 자신감)를 따를 것
- 타겟 오디언스: 얼리 머조리티 기업가 + 효율화를 원하는 1인 기업/창업가

## 프로젝트 구조

- `src/` — 소스 코드
- `docs/` — 문서 (페르소나, 기획서 등)
  - `docs/CHANGELOG.md` — 프로젝트 변경 이력
  - `docs/superpowers/plans/` — 구현 plan 문서
  - `docs/content/carousel-*/` — 생성된 카드뉴스 캐러셀 PNG
- `howzero-web/` — 웹 프론트엔드
- `scripts/` — 유틸리티 스크립트
  - `scripts/yt_highlights/` — YouTube URL → `highlights.json` + 프레임 파이프라인 (사용법: `python3 -m scripts.yt_highlights <URL> --out <dir>`)
- `tests/yt_highlights/` — yt_highlights 단위 테스트 (pytest)
- `.claude/skills/carousel/` — 카드뉴스 캐러셀 생성 스킬 (브랜드 프리셋: `howzero`, `braveyong`)

## 주요 워크플로우

- **카드뉴스 캐러셀**: `/carousel` 스킬. 입력 소스 3가지 모드(Text / NotebookLM / YouTube) 지원.
- **YouTube 하이라이트 추출**: `python3 -m scripts.yt_highlights <URL> --out <dir>` → `highlights.json` + `frames/*.jpg`
- **NotebookLM 쿼리**: `/Users/zerowater/.local/bin/notebooklm` CLI 사용 (chrome-mcp 금지). 계정별 `--storage ~/.notebooklm/storage_state_<account>.json`으로 전환.
