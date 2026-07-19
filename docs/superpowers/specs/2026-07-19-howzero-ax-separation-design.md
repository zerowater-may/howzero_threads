# howzero AX 분리 — 콘텐츠 워크스페이스 + 코드 새 레포 이전 설계

- 날짜: 2026-07-19
- 상태: 사용자 승인 (브레인스토밍 완료)
- 결정: A안 — 스냅샷 새 레포, 코드 포함 풀 분리

## 1. 목적

howzero AX 사업 관련 자산(전략·페르소나·콘텐츠·랜딩·포털 코드)을 멀티브랜드 모노레포(`/Users/howzero/howzero`)에서 전용 레포로 분리한다. 분리 후 새 레포에서 쓰레드·인스타·유튜브 콘텐츠 운영을 시작한다.

핵심 사용자 요구: **"원문을 내가 쓰면 howzero 페르소나 말투로 채널별 콘텐츠가 나오면 된다."** 발행 자동화는 이번 범위가 아니다(수동 발행). 콘텐츠 제작·정리 구조가 먼저다.

## 2. 새 레포

- 이름/계정: `hedgehogcandy/howzero-ax` (private)
- 방식: **스냅샷 복사, git 이력 미보존.** 근거: 현 레포 이력에 타 브랜드(zipsaja 등)가 얽혀 있고 로컬 main이 origin 대비 120+커밋 앞이라 filter-repo 수술은 위험 대비 이득이 없다.
- 로컬 위치: `/Users/howzero/howzero-ax`

### 디렉토리 구조

```
howzero-ax/
├── AGENTS.md                  # 페르소나 강제 + 컨벤션 (원본 지침)
├── CLAUDE.md                  # @AGENTS.md 포인터
├── persona/                   # 말투의 단일 원천
├── strategy/                  # AX 사업 전략 문서
├── reference/                 # 콘텐츠 제작 재료 (선별 이전분)
├── content/
│   ├── _raw/                  # 원문 인박스 (YYYY-MM-DD-slug.md, 형식 자유)
│   ├── threads/               # YYYY-MM-DD-slug.md — 훅 2~3줄 + 본문
│   ├── instagram/             # YYYY-MM-DD-slug/ — carousel.md(장별) + caption.txt
│   └── youtube/               # YYYY-MM-DD-slug/ — longform.md + shorts.md
├── docs/superpowers/{specs,plans}/  # 관례 유지
├── .claude/skills/howzero-voice/    # 원문→채널 변환 스킬
├── ax-web/                    # 랜딩 (Next.js, port 3300)
└── hz-os/                     # 운영 포털 (Next.js, port 3400, mcp/ 포함)
```

## 3. 이전 매핑

| 현 레포 | 새 레포 | 방식 |
|---|---|---|
| `docs/ax-business/**` (12종 + `_research/`) | `strategy/` | 이동 |
| specs 8개: `2026-07-08-ax-business-phase1`, `2026-07-09-ax-business-phase2-landing`, `2026-07-09-ax-web-landing-v2`, `2026-07-15-howzero-ax-engagement-os`, `2026-07-16-hz-os-{a2z,portal}`, `2026-07-17-hz-os-{project-timeline,workspace}` + 본 문서 | `docs/superpowers/specs/` | 이동 |
| plans 4개: `2026-07-08-ax-business-phase1`, `2026-07-09-ax-business-phase2-landing`, `2026-07-09-ax-web-landing-v2`, `2026-07-15-howzero-ax-engagement-contract` | `docs/superpowers/plans/` | 이동 |
| `wiki/HowZero AX Index·Brain·Content Strategy·Persona.md` + `HowZero Brand Messaging.md` + `HowZero Audience.md` | `persona/` | 이동 (wikilink는 상대 참조로 정리) |
| `brands/howzero/howzero_misc_youtube-reference-research/` | `reference/youtube-benchmark/` | 이동 |
| `brands/howzero/howzero_misc_cta-templates.md` | `reference/cta-templates.md` | 이동 |
| `brands/howzero/howzero_misc_positioning-{system,change-prompt}.md` + `positioning-playground/` | `reference/positioning/` | 이동 |
| `ax-web/` | `ax-web/` | 이동 (node_modules 제외) |
| `hz-os/` | `hz-os/` | 이동 (node_modules 제외, `mcp/` 포함) |
| `ax-web/.env.local`, `hz-os/.env.local`, `hz-os/.pglite/` | 동일 경로 | **수동 복사** (gitignore 대상 — git 밖에서 cp) |

### 잔류 (안 가져감)

- `brands/howzero/` A~E raw 텍스트 8,630개 — 구세대 유튜브 포지셔닝 시절 대본 뱅크. 옛 말투라 새 워크스페이스에 섞지 않는다. 필요 시 개별 발췌. INDEX.md에 "레거시 아카이브" 표기.
- 커머스 misc(불사자 네이버카페 3종, 쿠팡 손실구멍, email-minicourse, story-carousel, gayang 캐러셀, pmqTgyPZdto 캐러셀, reels_cover-demo)
- `wiki/HowZero Commerce *` — 커머스 축은 현 레포 소관
- zipsaja 파이프라인·발행 인프라 전부 (`scripts/`, `.claude/skills/content-*` 등)

## 4. howzero-voice 스킬 (신규 핵심 산출물)

- 트리거: `/howzero-voice` (전 채널) 또는 `/howzero-voice threads|instagram|youtube`
- 입력: `content/_raw/YYYY-MM-DD-slug.md` (최신 파일 자동 선택 또는 인자로 지정). 형식 자유 — 메모·불릿·초안.
- 동작: `persona/` 문서 로드 → 원문의 주장·수치를 보존하며 howzero 톤으로 채널별 재작성.
- 출력(§2 구조의 content/ 하위): threads 1파일 / instagram 1폴더(carousel.md 장별 텍스트 + caption.txt) / youtube 1폴더(longform.md + shorts.md). 각 파일 상단에 원문 경로 frontmatter.
- 가드(스킬에 명문화):
  - 검증된 수치만 — strategy/ 문서에서 refuted로 표기된 수치(예: '94% 단축') 사용 금지, 벤더 수치는 전제 조건 병기
  - 카피 반복 예산 — '연매출 10억'·'검증한 것만 팝니다' 남발 금지
  - 과장 배제·불안팔이 금지 (A5 축은 보조로만)
  - 톤 상세(존댓말 여부, 채널별 길이·훅 규칙)는 persona/ 문서가 정의하고 스킬은 그걸 따른다 — 스킬에 하드코딩하지 않음
- 이미지 렌더링(캐러셀 PNG 등)은 범위 외 — 텍스트 산출까지만.

## 5. AGENTS.md (새 레포)

- 콘텐츠·카피 작업 전 `persona/` 필독 강제
- 폴더 컨벤션(§2)과 파일명 규칙
- ax-web/hz-os 개발 규칙은 각 폴더 README/HANDOFF 포인터로
- 비밀값은 `.env.local`만, 문서에 미기재
- PGlite SIGTERM 주의 등 기존 운영 노트 승계

## 6. 현 레포 정리 (검증 후)

새 레포 검증(§7) 통과 후 현 레포에서 커밋 1개로:

- 이전된 항목 삭제: `docs/ax-business/`, 해당 specs/plans, wiki AX·Brand Messaging·Audience, 선별 misc, `ax-web/`, `hz-os/`
- `brands/howzero/INDEX.md`에 레거시 아카이브 표기 + AX는 새 레포로 이동했다는 포인터
- 루트 `AGENTS.md`·`wiki/index.md`에서 ax-web/hz-os 참조 제거 및 새 레포 포인터 추가

## 7. 검증

1. 새 레포 `ax-web`: `npx tsc --noEmit` + `npm run build` 통과
2. 새 레포 `hz-os`: 동일 + Playwright 스모크(로그인·홈 렌더)
3. `howzero-voice` 실전 시연: 샘플 원문 1개 → threads·instagram·youtube 3종 산출, 사용자 말투 확인
4. 배포 연속성: `howzero-deploy`는 무변경. 다음 배포 시 소스 복사 원천만 새 레포 경로로 변경 (이번 범위 외, AGENTS.md에 기록만)

## 8. 범위 외 (명시)

- Threads/IG/유튜브 발행 자동화 (Zernio 이식 포함) — 콘텐츠 리듬이 잡힌 뒤 별도 사이클
- 캐러셀 이미지 렌더링 파이프라인
- howzero-deploy 레포 개편·재배포
- 현 레포의 push (GitHub 계정 스위치 절차는 기존 보류 상태 유지)
