# HowZero — AGENTS.md

> AI 에이전트 (Claude Code, Cursor, Codex 등) 작업 가이드. 모든 자동화 도구가 이 파일을 자동 로드합니다.

---

## 1. 페르소나 & 톤

- **하우제로(HowZero) 페르소나**: [docs/persona-howzero.md](docs/persona-howzero.md)
- **타겟**: 얼리 머조리티 기업가 + 효율화 원하는 1인 기업/창업가
- **콘텐츠 톤**: 직설적 · 데이터 기반 · 과장 배제 · 경험 기반 자신감
- 콘텐츠 작성 시 반드시 페르소나 톤 따를 것

브랜드별 톤은 각 브랜드의 INDEX.md 참조:
- [brands/zipsaja/INDEX.md](brands/zipsaja/INDEX.md) — 반말 친구 톤, 20-30대 첫집 구매자
- [brands/howzero/INDEX.md](brands/howzero/INDEX.md) — 직설/데이터 기반
- [brands/braveyong/INDEX.md](brands/braveyong/INDEX.md)
- [brands/mkt/INDEX.md](brands/mkt/INDEX.md) — 한국어 마케팅/세무/이커머스

---

## 2. 프로젝트 구조

```
howzero/
├── AGENTS.md                       ← 이 파일
├── CLAUDE.md                       ← @AGENTS.md 포인터
├── brands/                         ← 모든 콘텐츠 자료 (브랜드 × 분류)
│   ├── INDEX.md                    ← 전체 지도
│   ├── zipsaja/                    ← {brand}_{type}_{name} 컨벤션
│   ├── howzero/
│   ├── braveyong/
│   ├── mkt/
│   └── etc/                        ← 실험/테스트
├── docs/                           ← 페르소나, 기획, 마스터 전략
│   ├── persona-howzero.md
│   ├── CHANGELOG.md
│   ├── MARKETING-MASTER-STRATEGY.md
│   ├── ai/                         ← AI 메타 중립 미러 (Codex/Cursor용)
│   ├── superpowers/plans/          ← 구현 plan
│   ├── content/                    ← 비어있음 (모두 brands/로 이동됨)
│   └── marketing/
├── .claude/                        ← Claude Code 설정
│   ├── skills/
│   │   ├── carousel/               ← 카러셀 생성 (브랜드 프리셋)
│   │   ├── reels/                  ← legacy 카러셀 → Remotion 9:16 릴스
│   │   ├── brands-organize/        ← 새 콘텐츠 → brands/ 자동 정리
│   │   ├── zipsaja-design/         ← zipsaja 브랜드 디자인 시스템
│   │   └── excalidraw-diagram/
│   ├── settings.json               ← 글로벌 Plugin 설정
│   └── settings.local.json         ← Permissions + Hooks
├── howzero-web/                    ← 웹 프론트엔드
├── scripts/                        ← 유틸리티 스크립트
│   ├── yt_highlights/              ← YouTube → highlights.json + 프레임
│   ├── nano_carousel/              ← Carousel 자동화
│   ├── zipsaja_reel/
│   ├── apps_script/
│   ├── fetch_comments.py
│   └── post.py
├── src/                            ← Python 소스 (howzero_threads 등)
├── tests/                          ← pytest
└── howzero-reels/                  ← 별도 Remotion 프로젝트 (실험용)
```

---

## 3. brands/ 컨벤션 (중요)

모든 콘텐츠 자료는 `brands/<brand>/<brand>_<type>_<name>/` 형식.

| Type | 의미 | 예시 |
|---|---|---|
| `carousel` | 인스타 캐러셀 (slides.html + slide-XX.png) | `zipsaja_carousel_seoul-10y` |
| `reels` | Remotion 릴스 mp4 모음 (full.mp4, 30s.mp4, raw.mp4) | `zipsaja_reels_husband-wife` |
| `captions` | 자막/캡션 txt | `braveyong_captions_AbFSATnz2_c.txt` |
| `comments` | 댓글/이메일 자료 (xlsx, csv) | `zipsaja_comments_general.xlsx` |
| `script` | 긴 영상 대본 (.md) | `howzero_script/A-001-*.md` |
| `shorts` | 쇼츠 스크립트 | `howzero_shorts/B-***.md` |
| `carousel_raw` | 카러셀 raw 텍스트 | `howzero_carousel_raw/C-***.md` |
| `newsletter` | 뉴스레터 | `howzero_newsletter/D-***.md` |
| `linkedin` | 링크드인 포스트 | `howzero_linkedin/E-***.md` |
| `misc` | 1회성 자료 | `howzero_misc_cta-templates.md` |
| `pipeline` | 통합 산출물 bundle (data.json + carousel + reels + attachments + captions) | `zipsaja_pipeline_leejaemyung-seoul` |

**파일 작업 시:**
1. ls 정렬 시 같은 type끼리 묶이도록 prefix 일관 유지
2. 각 브랜드 폴더에 `INDEX.md` 유지 (변경 시 업데이트)

---

## 4. 워크플로우

### 4.1 새 카러셀 만들기

```
1. /carousel 스킬 실행 → docs/content/carousel-{brand}-{topic}-{date}/ 생성
2. 결과 확인
3. /brands-organize 또는 수동으로:
   mv docs/content/carousel-{brand}-{topic}-{date} \
      brands/{brand}/{brand}_carousel_{topic}/
4. brands/{brand}/INDEX.md 업데이트
```

### 4.2 카러셀 → 릴스 변환

```
1. /reels 스킬 실행 (입력: brands/{brand}/{brand}_carousel_{topic}/ 또는 docs/content/...)
2. 출력: .claude/skills/carousel/brands/{brand}/reels/out/{file}.mp4
3. /brands-organize 또는 수동으로:
   mkdir -p brands/{brand}/{brand}_reels_{topic}/
   mv .claude/skills/carousel/brands/{brand}/reels/out/{file}.mp4 \
      brands/{brand}/{brand}_reels_{topic}/
```

### 4.3 YouTube 하이라이트 추출

```bash
python3 -m scripts.yt_highlights <YouTube URL> --out <dir>
```
→ `highlights.json` + `frames/*.jpg` 생성

### 4.4 NotebookLM 쿼리

`/Users/zerowater/.local/bin/notebooklm` CLI 사용 (chrome-mcp 사용 금지).
계정별 storage_state: `--storage ~/.notebooklm/storage_state_<account>.json`

---

## 5. 일반 지침

- **언어**: 커밋 메시지·주석·문서 모두 한글 (코드 식별자는 영문)
- **README.md**: 파일명은 대문자
- **환경별 설정 파일**: `.env.development`, `.env.production`
- **Git push 전**: 글로벌 ~/AGENTS.md의 GitHub 계정 스위치 절차 따를 것
- **AI 메타 원본**: Claude 전용 원본은 `.claude/skills/**/SKILL.md`, `.claude/agents/**/*.md`
- **AI 메타 미러**: Codex/Cursor 등 비-Claude 도구는 `docs/ai/**` 우선 참조
- **동기화 명령**: Claude 메타 수정 후 `python3 scripts/sync_ai_meta.py` 실행
- **수정 금지**: `docs/ai/**`는 생성 산출물이다. 직접 수정하지 말 것

---

## 6. 자동화 / Hooks

`.claude/settings.local.json`의 `hooks` 항목 참조.

**활성 Hook:**
- `Stop` — 세션 종료 시 `docs/content/carousel-*` 또는 `.claude/skills/.../reels/out/*.mp4` 잔여 확인 → 알림 (이동 권장)

**비활성 (참고용)**:
- PostToolUse 자동 mv는 의도치 않은 이동 위험으로 비활성. 필요 시 `/brands-organize` 명시 호출.

---

## 7. 참고 문서

- [docs/CHANGELOG.md](docs/CHANGELOG.md) — 변경 이력
- [docs/MARKETING-MASTER-STRATEGY.md](docs/MARKETING-MASTER-STRATEGY.md) — 마스터 전략
- [docs/superpowers/plans/](docs/superpowers/plans/) — 구현 plan
- [docs/persona-howzero-identity.md](docs/persona-howzero-identity.md) — 페르소나 상세

---

## 8. 콘텐츠 파이프라인 (`/pipeline`)

주제 입력 → 브랜드별 데이터 수집 → 통합 번들 생성.

### 브랜드 × 데이터 소스 매핑

| 브랜드 | 데이터 소스 | 상태 |
|---|---|---|
| **zipsaja** | SSH `hh-worker-2` → `proptech_db` (real_prices × complexes) | **필수** (Plan 2-5 완료) |
| **howzero** | 없음 (주제 텍스트만) | TBD — Plan 2+에서 데이터 소스 확정 시 매핑 추가 |
| **braveyong** | 없음 (주제 텍스트만) | TBD — 동일 |

### zipsaja SSH 접속 (고정)

- SSH alias: `hh-worker-2` (151.245.106.86, root) — **batch_server 아님**
- DB: `postgresql://proptech@localhost:5432/proptech_db`
- Password: `/opt/proptech/.env` 의 DATABASE_URL 참조
- 주요 테이블: `real_prices` (2.4M rows, trade_type A1 = 매매) × `complexes` (1377 rows, total_units + gu)
- 비밀번호 획득: `ssh hh-worker-2 'grep DATABASE_URL /opt/proptech/.env'`

### 사용

```bash
# zipsaja — 데이터 자동 페치
python3 -m scripts.pipeline zipsaja 이재명 당선후 서울 실거래 변화

# howzero/braveyong — 데이터 없이 state만
python3 -m scripts.pipeline howzero 1인 기업가 시간관리
```

### zipsaja Remotion 단일 워크플로우

신규 zipsaja 콘텐츠는 `zipsaja-remotion-v1`을 표준으로 사용한다.

1. `zipsaja-remotion-orchestrator`가 `pipeline-state.json`을 기준으로 다음 단계를 결정한다.
2. 단계 스킬은 `zipsaja-brief`, `zipsaja-data-fetch`, `zipsaja-storyboard`, `zipsaja-remotion-render`, `zipsaja-carousel-render`, `zipsaja-attachments`, `zipsaja-captions`, `zipsaja-package-qa`로 나눈다.
3. 신규 zipsaja 릴스는 Remotion만 사용하며, 30초 전체를 Remotion 컴포지션으로 만든다.
4. HyperFrames는 기존 산출물 보관용으로만 취급하고, 신규 zipsaja 릴스 제작에는 사용하지 않는다.
5. 모든 단계는 `pipeline-state.json`을 읽고 자기 단계 상태와 artifact path를 갱신한다.

### 산출물 위치

`brands/{brand}/{brand}_pipeline_{slug}/` — Plan 1 MVP는 `pipeline-state.json` + `data.json`까지. Plan 2+는 같은 번들에 carousel·reels·attachments·captions 추가.

### 관련 스킬

- `/pipeline` — 마스터 스킬 (`.claude/skills/pipeline/`)
- `/zipsaja-data-fetch` — zipsaja 데이터 페처 (`.claude/skills/zipsaja-data-fetch/`)
- `/zipsaja-publish` — Zernio Instagram/Threads 게시 (`.claude/skills/zipsaja-publish/`)

### 구현 상태 (Plan 1 + Plan 2-5 완료)

| 단계 | 상태 | 스킬 |
|---|---|---|
| 데이터 수집 (zipsaja) | ✅ | `/zipsaja-data-fetch` |
| 릴스 (Remotion + ffmpeg) | ✅ | `/content-reels` |
| 캐러셀 (Jinja2 + Puppeteer) | ✅ | `/content-carousel` |
| 첨부자료 (Excel + PDF) | ✅ | `/content-attachments` |
| 캡션 (IG/Threads/LinkedIn) | ✅ | `/content-captions` |

### 산출물 bundle 구조

```
brands/{brand}/{brand}_pipeline_{slug}/
├── pipeline-state.json
├── data.json                     # zipsaja: 25개 구 dataset
├── carousel/
│   ├── slides.html
│   └── slide-01.png ~ slide-NN.png
├── reels/
│   ├── full.mp4
│   ├── zipsaja-reel-30s.mp4
│   ├── zipsaja-reel-30s-audio-mapped.mp4
│   └── zipsaja-reel-30s-audio-mapped-ig-safe.mp4
├── publish-ready/
│   ├── instagram-carousel/slide-01.png ~ slide-NN.png
│   ├── instagram-reel-cover.png
│   └── threads-carousel/slide-01.png ~ slide-NN.png
├── attachments/
│   ├── seoul-price-data.xlsx
│   └── seoul-price-insights.pdf
├── captions/
    ├── instagram.txt
    ├── threads.txt
    └── linkedin.txt
└── publish-state.json
```

### 게시 워크플로우 (Zernio)

Instagram 플랫폼 음악을 앱에서 직접 고를 수 있는 API는 없다. 신규 zipsaja 게시 자동화는 다음 기준을 따른다.

1. Instagram Reels — 외부 음원을 쓸 경우 `reels/zipsaja-reel-30s-audio-mapped.mp4`처럼 오디오를 영상에 먼저 박고 Zernio API로 게시한다.
2. Reels 업로드 파일은 1080x1920, 9:16, H.264, 30fps, 30초를 기준으로 하며, `reels/zipsaja-reel-30s-audio-mapped-ig-safe.mp4`가 있으면 이를 우선 사용한다. 핵심 텍스트는 릴스 UI/그리드 crop을 피해 중앙 4:5 안쪽에 둔다. 기존 `22s` 파일은 30초 파일이 없을 때만 legacy fallback이다.
3. Reels 커버는 `publish-ready/instagram-reel-cover.png` 1080x1920 파일을 Zernio `instagramThumbnail`로 업로드한다. 커버가 없으면 `--instagram-thumb-offset-ms` 프레임을 썸네일로 쓴다.
4. Instagram Carousel — 이미지 캐러셀은 1080x1350, 4:5 기준이다. 오디오를 담을 수 없으므로 `publish-ready/instagram-carousel/slide-*.png`를 음악 없이 Feed carousel로 게시한다.
5. Threads — 기본은 `publish-ready/threads-carousel/slide-*.png` 이미지 캐러셀 게시다. 본문은 `captions/threads.txt`의 2~3줄 훅만 사용한다. 해시태그/긴 설명 금지, topic tag는 Zernio `--topic-tag`로 처리한다.
6. 모든 게시 결과는 번들 루트의 `publish-state.json`에 누적 기록한다.
7. 명령은 `python3 -m scripts.zernio_publish <bundle> --platform instagram --instagram-media both --now` 또는 `--platform threads --threads-media carousel --now`를 사용한다.

도식화: [docs/superpowers/plans/2026-04-28-zipsaja-remotion-zernio-workflow.excalidraw.md](docs/superpowers/plans/2026-04-28-zipsaja-remotion-zernio-workflow.excalidraw.md)

### 환경 변수 (zipsaja 기준)

- `PG_PASSWORD` — proptech_db (데이터 수집)
- `ANTHROPIC_API_KEY` — Claude API (캡션 생성)

### 참고 문서

- 설계: [docs/superpowers/specs/2026-04-24-brand-content-pipeline-design.md](docs/superpowers/specs/2026-04-24-brand-content-pipeline-design.md)
- Plan 1 MVP: [docs/superpowers/plans/2026-04-24-pipeline-mvp.md](docs/superpowers/plans/2026-04-24-pipeline-mvp.md)
