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
│   ├── superpowers/plans/          ← 구현 plan
│   ├── content/                    ← 비어있음 (모두 brands/로 이동됨)
│   └── marketing/
├── .claude/                        ← Claude Code 설정
│   ├── skills/
│   │   ├── carousel/               ← 카러셀 생성 (브랜드 프리셋)
│   │   ├── reels/                  ← 카러셀 → Remotion 9:16 릴스
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
│   ├── zipsaja_seoul_prices/       ← 서울 부동산 데이터
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
| `reels` | Remotion 릴스 mp4 모음 (full.mp4, 22s.mp4, raw.mp4) | `zipsaja_reels_husband-wife` |
| `captions` | 자막/캡션 txt | `braveyong_captions_AbFSATnz2_c.txt` |
| `comments` | 댓글/이메일 자료 (xlsx, csv) | `zipsaja_comments_general.xlsx` |
| `script` | 긴 영상 대본 (.md) | `howzero_script/A-001-*.md` |
| `shorts` | 쇼츠 스크립트 | `howzero_shorts/B-***.md` |
| `carousel_raw` | 카러셀 raw 텍스트 | `howzero_carousel_raw/C-***.md` |
| `newsletter` | 뉴스레터 | `howzero_newsletter/D-***.md` |
| `linkedin` | 링크드인 포스트 | `howzero_linkedin/E-***.md` |
| `misc` | 1회성 자료 | `howzero_misc_cta-templates.md` |

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
