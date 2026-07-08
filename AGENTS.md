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
├── wiki/                           ← Obsidian/Codex 영속 위키
│   ├── AGENTS.md                   ← wiki 전용 작업 지침 원본
│   ├── CLAUDE.md                   ← @AGENTS.md 포인터
│   └── index.md                    ← wiki 진입점
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
├── ax-web/                         ← 하우제로 AX 랜딩 (히어로 AI 상담 챗봇 + 리드 DB, port 3300)
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

- **지침 원본은 AGENTS.md**: 새 AI 작업 규칙을 추가할 때는 각 폴더의 `AGENTS.md`에 작성한다. `CLAUDE.md`는 반드시 같은 폴더의 `AGENTS.md`를 읽으라는 포인터로만 둔다.
- **하위 폴더 지침**: 작업 대상 폴더나 그 상위 경로에 추가 `AGENTS.md`가 있으면 루트 `AGENTS.md` 다음에 가장 가까운 `AGENTS.md`를 읽고 함께 따른다.
- **wiki 작업**: `wiki/` 안의 지식 정리, 대본, Excalidraw, 인제스트 작업을 시작할 때는 반드시 `wiki/AGENTS.md`와 `wiki/index.md`를 먼저 읽는다.
- **자료 인제스트 기본값**: 사용자가 "이 자료 인제스트해줘", "이 레퍼런스로 대본 써줘", "하우제로 커머스로 바꿔줘"라고 하면 단순 요약으로 끝내지 않는다. 먼저 AX 전환/Commerce 축을 판별하고, Commerce면 `wiki/HowZero Commerce Index.md`와 `wiki/HowZero Commerce Persona.md`를 읽은 뒤 하우제로 커머스 페르소나, 말투, 구조, CTA에 맞게 재구성한다.
- **언어**: 커밋 메시지·주석·문서 모두 한글 (코드 식별자는 영문)
- **README.md**: 파일명은 대문자
- **환경별 설정 파일**: `.env.development`, `.env.production`
- **로컬 비밀값**: 실제 SSH 비밀번호, 웹 로그인 비밀번호, API key는 `.env.local` 또는 서버 env에만 둔다. `AGENTS.md`, `CLAUDE.md`, spec/plan 문서에는 비밀값을 직접 적지 않는다.
- **Git push 전**: 글로벌 ~/AGENTS.md의 GitHub 계정 스위치 절차 따를 것
- **AI 메타 원본**: Claude 전용 원본은 `.claude/skills/**/SKILL.md`, `.claude/agents/**/*.md`
- **AI 메타 미러**: Codex/Cursor 등 비-Claude 도구는 `docs/ai/**` 우선 참조
- **동기화 명령**: Claude 메타 수정 후 `python3 scripts/sync_ai_meta.py` 실행
- **수정 금지**: `docs/ai/**`는 생성 산출물이다. 직접 수정하지 말 것

### 5.1 로컬 env 로딩 규칙

작업 시작 시 서버/대시보드 접속 정보가 필요하면 repo root의 `.env.local`을 먼저 확인한다. 이 파일은 gitignore 대상이다.

```bash
set -a
source .env.local
set +a
```

필수 키:

- `HOWZERO_SSH_ALIAS`, `HOWZERO_SSH_HOST`, `HOWZERO_SSH_USER`, `HOWZERO_SSH_PASSWORD`, `HOWZERO_SSH_COMMAND`
- `HOWZERO_SERVER_REPO_DIR`, `HOWZERO_SERVER_ENV_FILE`, `HOWZERO_WEB_SERVICE`, `HOWZERO_WORKER_SERVICE`
- `HOWAAA_DASHBOARD_REPO_DIR`, `HOWAAA_DASHBOARD_SERVICE`, `HOWAAA_DASHBOARD_PORT`
- `HOWZERO_WEB_REMOTE_URL`, `HOWAAA_DASHBOARD_REMOTE_URL`, `HOWAAA_TRENDS_LOCAL_DEV_URL`, `HOWAAA_TRENDS_TUNNEL_URL`
- `HOWZERO_TEMP_PUBLIC_LOGIN_ID`, `HOWZERO_TEMP_PUBLIC_LOGIN_PASSWORD`

Tracked 예시는 `.env.example`에만 둔다. 실제 값이 필요하면 `.env.local` 또는 서버의 `/etc/howzero/howzero.env`에서 읽는다.

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

### howzero 콘텐츠 서버 SSH

- SSH alias: `.env.local`의 `HOWZERO_SSH_ALIAS` (현재 표준 alias: `howzero`)
- HostName: `.env.local`의 `HOWZERO_SSH_HOST`
- User: `.env.local`의 `HOWZERO_SSH_USER`
- Provider hostname: `howzero`
- Region/Image: Seoul, Ubuntu 24.04
- Root password/API keys are not stored in tracked docs. 로컬에서는 `.env.local`의 `HOWZERO_SSH_PASSWORD`를 참고하고, 가능하면 SSH key 또는 OS keychain으로 승격한다.
- 기본 접속 명령: `ssh "$HOWZERO_SSH_ALIAS"` 또는 `ssh "$HOWZERO_SSH_USER@$HOWZERO_SSH_HOST"`.
- 서버 내부 repo 표준 위치: `$HOWZERO_SERVER_REPO_DIR` (현재 `/opt/howzero`).
- 서버 env 표준 위치: `$HOWZERO_SERVER_ENV_FILE` (현재 `/etc/howzero/howzero.env`). 이 파일 내용은 추적 문서에 복사하지 않는다.
- HOWAAA dashboard 배포 위치: `$HOWAAA_DASHBOARD_REPO_DIR` (현재 `/opt/howzero-dashboard`).
- HOWAAA dashboard service: `$HOWAAA_DASHBOARD_SERVICE` (현재 `howzero-dashboard.service`).
- howzero content/web service: `$HOWZERO_WEB_SERVICE`, worker service: `$HOWZERO_WORKER_SERVICE`.
- repo 위치가 달라졌으면 접속 후 `find /root /opt /srv -maxdepth 3 -type d \( -name howzero -o -name howzero-dashboard \) 2>/dev/null`로 확인한다.

로컬에서 접속 정보 확인:

```bash
set -a && source .env.local && set +a
printf 'ssh=%s host=%s user=%s\n' "$HOWZERO_SSH_ALIAS" "$HOWZERO_SSH_HOST" "$HOWZERO_SSH_USER"
```

서버 접속 후 상태 확인:

```bash
cd "$HOWZERO_SERVER_REPO_DIR"
systemctl status "$HOWZERO_WEB_SERVICE" --no-pager
systemctl status "$HOWZERO_WORKER_SERVICE" --no-pager
systemctl status "$HOWAAA_DASHBOARD_SERVICE" --no-pager
```

HOWAAA 브라우저 URL:

- 원격 dashboard base: `$HOWAAA_DASHBOARD_REMOTE_URL`
- 로컬 dev trends: `$HOWAAA_TRENDS_LOCAL_DEV_URL`
- SSH tunnel trends: `$HOWAAA_TRENDS_TUNNEL_URL`
- 랜딩: `$HOWAAA_LANDING_LOCAL_DEV_URL`

임시 공개 로그인 gate가 켜져 있으면 ID/PW는 `.env.local`의 `HOWZERO_TEMP_PUBLIC_LOGIN_ID`, `HOWZERO_TEMP_PUBLIC_LOGIN_PASSWORD`를 사용한다. 비밀번호를 `AGENTS.md`나 `CLAUDE.md`에 직접 적지 않는다.

#### 서버 워크플로우 점검 기록 (2026-04-29)

- 접속: `ssh howzero` 정상. 원격 작업 디렉토리: `/opt/howzero`.
- `/opt/howzero`는 git checkout이 아니라 배포/복사된 작업 디렉토리일 수 있다. 변경 전 `git status`가 가능한지 먼저 확인한다.
- 런타임: Python 3.12, Node 22, npm, ffmpeg, Redis 설치/구동 확인.
- Python content 의존성: `jinja2`, `openpyxl`, `anthropic`, `apscheduler`, `requests`, `pydantic_settings`, `psycopg2`, `paramiko`, `sshtunnel` import 확인.
- 서버 venv에 `pytest` 설치 완료. SSH-only 검증 시 `tests/content_captions/test_prompts.py`, `tests/zipsaja_data_fetch/test_fetch_transforms.py`, `tests/content_carousel/test_render.py`, `tests/content_reels/test_field_mapping.py`를 직접 실행한다.
- 캐러셀 생성: `scripts.content_carousel`은 `districts[].priceBefore/priceAfter/changePct` schema용 표준 렌더러다. 기본 산출물은 커버 1장 + 데이터 8장 + CTA 1장 = 총 10장이다. 호환 dataset으로 `/tmp/howzero-carousel-check` 렌더 성공. 부모찬스처럼 custom schema(`avgEok`, `access`)인 번들은 커스텀 템플릿/렌더러가 필요하다.
- 릴스 생성: `scripts.content_reels`는 같은 `priceBefore/priceAfter/changePct` schema용 Remotion 렌더러다. 표준 산출물은 `zipsaja-reel-30s.mp4`에서 끝내지 않고 `zipsaja-reel-30s-audio-mapped.mp4`와 `zipsaja-reel-30s-audio-mapped-ig-safe.mp4`까지 반드시 만든다. `--bgm` 또는 `HOWZERO_REELS_BGM_PATH`가 있으면 해당 음원을 loop해서 박고, 없으면 ffmpeg synthetic BGM을 생성한다. `/tmp/howzero-reels-check`에서 1080x1920, H.264, 30fps, 30초 mp4 렌더 성공.
- Zernio 게시: `scripts.zernio_publish --dry-run` 기준 Instagram Reel, Instagram Carousel, Threads Carousel payload 생성 성공. 실제 게시에는 `ZERNIO_API_KEY` 필요.
- 서버 env는 `/etc/howzero/howzero.env`에 둔다. 이 파일은 추적 문서에 내용을 복사하지 않는다.
- 기존 스케줄링: `scripts/run_scheduler.py --dry-run`은 토큰 갱신 job 등록까지 정상. `howzero-web`에는 `scheduled_posts` + BullMQ `scheduled-posts` worker 구조가 있으며 Threads 텍스트/단일 이미지 예약 게시가 가능하다.
- 통합 예약 발행: `content_publish_jobs` 테이블, `/api/schedule/content-publish`, BullMQ `content-publish` worker가 추가됐다. 대상은 `instagram_reel`, `instagram_carousel`, `threads_carousel`이며 내부적으로 `python3 -m scripts.zernio_publish`를 호출한다.
- 서버 서비스: `howzero-web.service`는 port `3101`, `howzero-worker.service`는 content/scheduled/comment worker를 실행한다. 별도 `/opt/howzero-dashboard`는 port `3100`을 사용 중이므로 충돌시키지 않는다.
- 검증: `npx vitest run src/worker/processors/content-publish.test.ts`, `npx tsc --noEmit`, `npm run build` 통과. 인증 쿠키 기반 `/api/schedule/content-publish` 호출로 DB `PENDING` row + BullMQ delayed job 적재 확인.
- SSH-only 콘텐츠 생성 검증: `scripts/run_server_pipeline.sh zipsaja ...` 단일 명령으로 data, Remotion reels, carousel PNG, attachments, Kimi Code captions 생성 완료. 테스트 번들: `/opt/howzero/brands/zipsaja/zipsaja_pipeline_ssh-only-대출규제-현금격차-검증`. 게시/Zernio 업로드는 실행하지 않는다.
- 서버 자동 기획+생성 검증: `scripts/run_server_auto_pipeline.sh zipsaja` 단일 명령으로 서버가 스카우팅 데이터 fetch → Kimi Code 주제 선정 → pipeline 생성까지 완료. 테스트 번들: `/opt/howzero/brands/zipsaja/zipsaja_pipeline_강남빼고다오른서울집값`. 게시/Zernio 업로드는 실행하지 않는다.

### 사용

```bash
# howzero 서버(/opt/howzero) — 표준. Kimi가 주제까지 고른다.
scripts/run_server_auto_pipeline.sh zipsaja

# howzero 서버(/opt/howzero) — 수동 주제를 줄 때만 사용
scripts/run_server_pipeline.sh zipsaja 이재명 당선후 서울 실거래 변화

# 로컬/시스템 python 직접 실행은 디버그용. 운영 콘텐츠 생성 표준이 아니다.
python3 -m scripts.pipeline zipsaja 이재명 당선후 서울 실거래 변화

# howzero/braveyong — 데이터 없이 state만
python3 -m scripts.pipeline howzero 1인 기업가 시간관리
```

서버에서 콘텐츠를 생성할 때는 로컬 파일, 로컬 Python, 로컬 Node, 로컬 렌더를 사용하지 않는다. 표준은 `ssh howzero` 접속 후 `/opt/howzero`에서 `scripts/run_server_auto_pipeline.sh zipsaja`를 실행하는 것이다. 이 스크립트는 `/etc/howzero/howzero.env`와 `/opt/howzero/.venv/bin/python`을 고정으로 사용하고, Kimi Code가 스카우팅 데이터 기반으로 주제를 고른 뒤 생성 파이프라인을 이어서 실행한다. 게시는 포함하지 않는다.

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
| 예약 발행 (Zernio + BullMQ) | ✅ | `/zipsaja-publish` + `howzero-web` |

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

1. Instagram Reels — `scripts.content_reels` 단계에서 `reels/zipsaja-reel-30s-audio-mapped.mp4`와 `reels/zipsaja-reel-30s-audio-mapped-ig-safe.mp4`를 반드시 생성한다. 외부 음원이 있으면 `--bgm` 또는 `HOWZERO_REELS_BGM_PATH`로 지정하고, 없으면 ffmpeg synthetic BGM을 생성해 영상에 박는다.
2. Reels 업로드 파일은 1080x1920, 9:16, H.264, 30fps, 30초를 기준으로 하며, `reels/zipsaja-reel-30s-audio-mapped-ig-safe.mp4`가 있으면 이를 우선 사용한다. 핵심 텍스트는 릴스 UI/그리드 crop을 피해 중앙 4:5 안쪽에 둔다. 기존 `22s` 파일은 30초 파일이 없을 때만 legacy fallback이다.
3. Reels 커버는 `publish-ready/instagram-reel-cover.png` 1080x1920 파일을 Zernio `instagramThumbnail`로 업로드한다. 커버가 없으면 `--instagram-thumb-offset-ms` 프레임을 썸네일로 쓴다.
4. Instagram Carousel — 이미지 캐러셀은 1080x1350, 4:5 기준이다. 오디오를 담을 수 없으므로 `publish-ready/instagram-carousel/slide-*.png`를 음악 없이 Feed carousel로 게시한다.
5. Threads — 기본은 `publish-ready/threads-carousel/slide-*.png` 이미지 캐러셀 게시다. 본문은 `captions/threads.txt`의 2~3줄 훅만 사용한다. 해시태그/긴 설명 금지, topic tag는 Zernio `--topic-tag`로 처리한다.
6. 운영 업로드는 Instagram Reel, Instagram Carousel, Threads Carousel을 개별 명령으로 제출한다. `--instagram-media both`는 dry-run 또는 저위험 1차 시도에만 사용한다. 한 payload에서 409가 나면 combined command가 멈춰 뒤 payload가 실행되지 않는다.
7. Zernio가 `409 This exact content is already scheduled, publishing, or was posted...`를 반환하면 실패로만 보지 말고 `details.existingPostId`를 조회한다. 상태가 `publishing/processing`이면 이미 생성되어 플랫폼 처리 중인 것이다.
8. 사용자가 같은 콘텐츠를 다시 올리라고 하면 `captions/instagram.txt`, `captions/threads.txt`의 첫 훅·문장 순서·CTA를 구조적으로 바꾼 뒤 재제출한다. 공백/문장부호만 바꾸는 것은 중복보호 회피로 보지 않는다.
9. 모든 게시 결과는 번들 루트의 `publish-state.json`에 platform별 postId, status, platformStatus, mediaCount, timestamp로 누적 기록한다. 공개 URL은 Zernio 응답에서 null일 수 있으므로 postId와 상태를 우선 기록한다.
10. 명령은 `python3 -m scripts.zernio_publish <bundle> --platform instagram --instagram-media reel --now`, `--instagram-media carousel --now`, `--platform threads --threads-media carousel --now` 순서로 실행한다.

도식화: [docs/superpowers/plans/2026-04-28-zipsaja-remotion-zernio-workflow.excalidraw.md](docs/superpowers/plans/2026-04-28-zipsaja-remotion-zernio-workflow.excalidraw.md)

### 환경 변수 (zipsaja 기준)

- `PG_PASSWORD` — proptech_db (데이터 수집)
- `ZERNIO_API_KEY` — Zernio Instagram/Threads 게시
- `CONTENT_CAPTIONS_PROVIDER` — `anthropic`, `kimi`, `kimi_code`, `deepseek` 중 하나
- `ANTHROPIC_API_KEY` — Anthropic 캡션 생성 시
- `MOONSHOT_API_KEY` 또는 `KIMI_API_KEY` — Kimi Open Platform 캡션 생성 시 (`KIMI_MODEL` optional)
- `KIMI_API_KEY` 또는 `KIMI_CODE_API_KEY` — Kimi Code 멤버십 키로 캡션 생성 시. 이 경우 `CONTENT_CAPTIONS_PROVIDER=kimi_code`, `CONTENT_CAPTIONS_BASE_URL=https://api.kimi.com/coding/`, `KIMI_CODE_MODEL=kimi-for-coding`을 쓴다. `https://api.moonshot.ai/v1`와 섞으면 401이 난다.
- `DEEPSEEK_API_KEY` — DeepSeek 캡션 생성 시 (`DEEPSEEK_MODEL` optional)
- `DATABASE_URL`, `WORKER_DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `ENCRYPTION_KEY_V1` — `howzero-web`/worker 운영

### 참고 문서

- 설계: [docs/superpowers/specs/2026-04-24-brand-content-pipeline-design.md](docs/superpowers/specs/2026-04-24-brand-content-pipeline-design.md)
- Plan 1 MVP: [docs/superpowers/plans/2026-04-24-pipeline-mvp.md](docs/superpowers/plans/2026-04-24-pipeline-mvp.md)

---

## 9. Obsidian LLM Wiki

이 저장소는 Obsidian vault로도 사용한다. `wiki/`는 Codex/Claude가 하우제로 지식을 합성해 관리하는 영속 위키 레이어다.

### 구조

- `wiki/index.md` — 위키 진입점. 질문/인제스트/린트 시 먼저 읽는다.
- `wiki/log.md` — ingest, query, lint 작업 기록.
- `wiki/*.md` — 브랜드, 상품, 콘텐츠, 기술 시스템별 합성 페이지.

### 운영 규칙

1. `docs/`, `brands/`, `scripts/`, `src/`, `howzero-web/`는 원문 소스다. 원문을 `wiki/`로 이동하지 않는다.
2. `wiki/`는 원문 대체물이 아니라 질문·기획·실행을 빠르게 하기 위한 합성 레이어다.
3. 새 자료를 인제스트하면 관련 `wiki/*.md`, `wiki/index.md`, `wiki/log.md`를 함께 업데이트한다.
4. Obsidian 링크는 `[[HowZero Overview]]` 같은 wikilink를 사용한다.
5. 불확실하거나 결정되지 않은 내용은 확정처럼 쓰지 말고 `wiki/HowZero Open Questions.md`에 남긴다.
6. `docs/ai/**`는 생성 산출물이므로 wiki 업데이트를 위해 직접 수정하지 않는다.
