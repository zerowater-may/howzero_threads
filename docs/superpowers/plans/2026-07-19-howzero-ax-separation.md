# howzero AX 분리 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** howzero AX 자산(전략·페르소나·ax-web·hz-os)을 새 레포 `/Users/howzero/howzero-ax`로 스냅샷 분리하고, 원문→채널별 콘텐츠 변환 스킬(howzero-voice)을 갖춘다.

**Architecture:** 스냅샷 복사(이력 미보존) → 새 레포에서 빌드 검증 → GitHub private push → 원 레포 정리 커밋. 콘텐츠 변환은 `.claude/skills/howzero-voice/`가 `persona/`를 로드해 수행.

**Tech Stack:** git, gh CLI(hedgehogcandy 활성 확인됨), rsync, Next.js(ax-web port 3300 / hz-os port 3400), Claude Code 스킬.

**Spec:** `docs/superpowers/specs/2026-07-19-howzero-ax-separation-design.md`

주의사항 (전 태스크 공통):
- 커밋 메시지는 한글, 끝에 `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` 트레일러.
- 원 레포(`/Users/howzero/howzero`)의 파일 삭제는 Task 8 전까지 금지 — 그 전까지는 복사만.
- `.env.local`·`.pglite`는 gitignore 대상이므로 git 밖에서 cp로만 이동.

---

### Task 1: 새 레포 스캐폴드

**Files:**
- Create: `/Users/howzero/howzero-ax/.gitignore`
- Create: `/Users/howzero/howzero-ax/AGENTS.md`
- Create: `/Users/howzero/howzero-ax/CLAUDE.md`
- Create: `content/{_raw,threads,instagram,youtube}/.gitkeep`

- [ ] **Step 1: 디렉토리 + git init**

```bash
mkdir -p /Users/howzero/howzero-ax
cd /Users/howzero/howzero-ax
git init -b main
mkdir -p persona strategy reference content/_raw content/threads content/instagram content/youtube docs/superpowers/specs docs/superpowers/plans .claude/skills/howzero-voice
touch content/_raw/.gitkeep content/threads/.gitkeep content/instagram/.gitkeep content/youtube/.gitkeep
```

Expected: `Initialized empty Git repository ... (main)`

- [ ] **Step 2: .gitignore 작성**

`/Users/howzero/howzero-ax/.gitignore`:

```gitignore
node_modules/
.next/
*.tsbuildinfo
.env*
!.env.example
.pglite/
.DS_Store
```

- [ ] **Step 3: AGENTS.md 작성**

`/Users/howzero/howzero-ax/AGENTS.md`:

```markdown
# howzero-ax — AGENTS.md

> howzero AX(AI Transformation) 사업 전용 레포. 전략·페르소나·콘텐츠·랜딩(ax-web)·운영 포털(hz-os)을 담는다.
> 표기는 영문 소문자 `howzero` — '하우제로' 리터럴 금지.

## 1. 페르소나 (모든 작업의 전제)

**콘텐츠·카피·랜딩 문구 작업 전에 `persona/`를 반드시 먼저 읽는다.** 우선순위:

1. `persona/HowZero AX Persona.md` — AX 말투·권위·금지 표현
2. `persona/persona-howzero.md`, `persona/persona-howzero-identity.md` — 페르소나 원본
3. `persona/HowZero Brand Messaging.md`, `persona/HowZero Audience.md`

톤 공통 원칙: 직설, 데이터 기반, 과장 배제, **존댓말**(반말 단정·도발조 금지), 느낌표 금지, 불안팔이 금지.

수치 가드:
- `strategy/` 문서에서 refuted 표기된 수치('94% 단축' 등) 사용 금지. 벤더 수치는 전제 조건 병기.
- 카피 반복 예산: '연매출 10억'·'검증한 것만 팝니다'는 콘텐츠 1건당 1회 이하.
- 0원/0시간 직접 약속 금지 (네이밍 스토리는 "어떻게(how) 0으로(zero)"라는 지향).

## 2. 구조

- `persona/` — 말투의 단일 원천
- `strategy/` — AX 사업 전략 12종 + `_research/`
- `reference/` — 콘텐츠 제작 재료 (유튜브 벤치마크, CTA 템플릿, 포지셔닝)
- `content/_raw/` — 원문 인박스 (`YYYY-MM-DD-slug.md`, 형식 자유)
- `content/{threads,instagram,youtube}/` — 채널별 산출물
- `ax-web/` — 랜딩 (port 3300). 개발 규칙은 `ax-web/README.md`
- `hz-os/` — 운영 포털 (port 3400). 개발 규칙은 `hz-os/AGENTS.md`, `hz-os/HANDOFF.md`

## 3. 콘텐츠 워크플로우

1. 원문을 `content/_raw/YYYY-MM-DD-slug.md`에 쓴다 (메모·불릿·초안 무엇이든).
2. `/howzero-voice` 실행 (채널 지정: `/howzero-voice threads` 등).
3. 산출물 확인 후 수동 발행. 발행 자동화는 아직 범위 외.

## 4. 개발·운영 노트

- PGlite: SIGTERM kill 시 직전 쓰기 유실. 종료는 Ctrl+C(SIGINT)로.
- 배포: 별도 레포 `hedgehogcandy/howzero-deploy`(Coolify, batch_server)가 담당. 이 레포는 소스 정본이며, 배포 시 deploy 레포의 deploy.sh가 여기서 소스를 복사한다.
- 비밀값(.env.local, API 키)은 git에 넣지 않는다. 문서에도 쓰지 않는다.
- 커밋 메시지·주석·문서는 한글 (코드 식별자는 영문).

## 5. 출처

2026-07-19 멀티브랜드 레포(howzero)에서 스냅샷 분리. 설계: `docs/superpowers/specs/2026-07-19-howzero-ax-separation-design.md`. 구 콘텐츠(A~E raw 8,630개, 커머스 자료)는 원 레포 `brands/howzero/`에 레거시로 잔류.
```

- [ ] **Step 4: CLAUDE.md 작성**

`/Users/howzero/howzero-ax/CLAUDE.md`:

```markdown
# CLAUDE.md

본 레포의 AI 에이전트 지침 원본은 [AGENTS.md](./AGENTS.md)입니다. 작업 시작 전 반드시 `AGENTS.md`를 먼저 읽고 최우선으로 따르세요. 특히 콘텐츠·카피 작업은 `persona/` 필독이 전제입니다.

@AGENTS.md
```

- [ ] **Step 5: 커밋**

```bash
cd /Users/howzero/howzero-ax && git add -A && git commit -m "chore: howzero-ax 레포 스캐폴드 — 구조·지침·gitignore

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: 전략·페르소나·레퍼런스·스펙 복사

**Files:**
- Create: `strategy/**`, `persona/**`, `reference/**`, `docs/superpowers/{specs,plans}/**` (원 레포에서 복사)

- [ ] **Step 1: strategy 복사**

```bash
SRC=/Users/howzero/howzero; DST=/Users/howzero/howzero-ax
cp -R "$SRC/docs/ax-business/." "$DST/strategy/"
ls "$DST/strategy" | wc -l   # 기대: 13 (12문서 + _research)
```

- [ ] **Step 2: persona 복사 (wiki 8종 이동분 + docs 원본 2종 사본)**

```bash
SRC=/Users/howzero/howzero; DST=/Users/howzero/howzero-ax
cp "$SRC/wiki/HowZero AX Index.md" "$SRC/wiki/HowZero AX Brain.md" "$SRC/wiki/HowZero AX Content Strategy.md" "$SRC/wiki/HowZero AX Persona.md" "$SRC/wiki/HowZero Brand Messaging.md" "$SRC/wiki/HowZero Audience.md" "$SRC/wiki/AX Offer Map.md" "$SRC/wiki/HOWAAA Marketing AX Playbook.md" "$DST/persona/"
cp "$SRC/docs/persona-howzero.md" "$SRC/docs/persona-howzero-identity.md" "$DST/persona/"
ls "$DST/persona" | wc -l   # 기대: 10
```

주: `docs/persona-howzero*.md` 2종은 원 레포의 타 브랜드 콘텐츠도 참조하므로 **사본**(원 레포 원본 유지). 나머지 8종은 Task 8에서 원 레포에서 삭제.

- [ ] **Step 3: persona/README.md 작성 (깨진 wikilink 안내)**

`/Users/howzero/howzero-ax/persona/README.md`:

```markdown
# persona/

howzero AX 말투·페르소나의 단일 원천. 2026-07-19 원 레포 wiki에서 이전.

- `[[...]]` wikilink 중 이 폴더 안에 없는 대상(예: [[HowZero Commerce Index]])은 원 레포(howzero) wiki를 가리키는 역사적 참조다. 새 콘텐츠 작업에는 이 폴더 안의 문서만 사용한다.
- `persona-howzero.md`·`persona-howzero-identity.md`는 원 레포 `docs/`와 공유되는 사본이다 (원본은 원 레포에 잔류).
```

- [ ] **Step 4: reference 복사**

```bash
SRC=/Users/howzero/howzero; DST=/Users/howzero/howzero-ax
mkdir -p "$DST/reference/positioning"
cp -R "$SRC/brands/howzero/howzero_misc_youtube-reference-research" "$DST/reference/youtube-benchmark"
cp "$SRC/brands/howzero/howzero_misc_cta-templates.md" "$DST/reference/cta-templates.md"
cp "$SRC/brands/howzero/howzero_misc_positioning-system.md" "$SRC/brands/howzero/howzero_misc_positioning-change-prompt.md" "$DST/reference/positioning/"
cp -R "$SRC/brands/howzero/howzero_misc_positioning-playground" "$DST/reference/positioning/playground"
```

- [ ] **Step 5: 스펙·플랜 복사**

```bash
SRC=/Users/howzero/howzero/docs/superpowers; DST=/Users/howzero/howzero-ax/docs/superpowers
cp "$SRC/specs/2026-07-08-ax-business-phase1-design.md" "$SRC/specs/2026-07-09-ax-business-phase2-landing-design.md" "$SRC/specs/2026-07-09-ax-web-landing-v2-design.md" "$SRC/specs/2026-07-15-howzero-ax-engagement-os-design.md" "$SRC/specs/2026-07-16-hz-os-a2z-design.md" "$SRC/specs/2026-07-16-hz-os-portal-design.md" "$SRC/specs/2026-07-17-hz-os-project-timeline-design.md" "$SRC/specs/2026-07-17-hz-os-workspace-design.md" "$SRC/specs/2026-07-19-howzero-ax-separation-design.md" "$DST/specs/"
cp "$SRC/plans/2026-07-08-ax-business-phase1.md" "$SRC/plans/2026-07-09-ax-business-phase2-landing.md" "$SRC/plans/2026-07-09-ax-web-landing-v2.md" "$SRC/plans/2026-07-15-howzero-ax-engagement-contract.md" "$SRC/plans/2026-07-19-howzero-ax-separation.md" "$DST/plans/"
ls "$DST/specs" | wc -l; ls "$DST/plans" | wc -l   # 기대: 9 / 5
```

- [ ] **Step 6: 커밋**

```bash
cd /Users/howzero/howzero-ax && git add -A && git commit -m "docs: 전략·페르소나·레퍼런스·스펙 이전 — 원 레포 스냅샷

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: ax-web 복사 + 빌드 검증

**Files:**
- Create: `ax-web/**` (rsync 복사)

- [ ] **Step 1: rsync 복사 (node_modules·빌드 산출물 제외)**

```bash
rsync -a --exclude node_modules --exclude .next --exclude '*.tsbuildinfo' /Users/howzero/howzero/ax-web/ /Users/howzero/howzero-ax/ax-web/
```

- [ ] **Step 2: .env.local 수동 복사 (git 밖)**

```bash
cp /Users/howzero/howzero/ax-web/.env.local /Users/howzero/howzero-ax/ax-web/.env.local
```

- [ ] **Step 3: 의존성 설치 + 검증**

```bash
cd /Users/howzero/howzero-ax/ax-web && npm install && npx tsc --noEmit && npm run build
```

Expected: 빌드 성공, Route `/`·`/api/chat`·`/api/leads` 출력.

- [ ] **Step 4: 커밋**

```bash
cd /Users/howzero/howzero-ax && git add -A && git commit -m "feat: ax-web 랜딩 이전 — tsc·build 검증 통과

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: hz-os 복사 + 빌드 검증

**Files:**
- Create: `hz-os/**` (rsync 복사, `mcp/` 포함)

- [ ] **Step 1: rsync 복사**

```bash
rsync -a --exclude node_modules --exclude .next --exclude '*.tsbuildinfo' --exclude .pglite /Users/howzero/howzero/hz-os/ /Users/howzero/howzero-ax/hz-os/
```

주: `hz-os/mcp/`는 자동 포함되나 `mcp/node_modules`도 위 exclude로 걸러짐 — 확인: `ls /Users/howzero/howzero-ax/hz-os/mcp`.

- [ ] **Step 2: .env.local + .pglite(실데이터) 수동 복사**

```bash
cp /Users/howzero/howzero/hz-os/.env.local /Users/howzero/howzero-ax/hz-os/.env.local
cp -R /Users/howzero/howzero/hz-os/.pglite /Users/howzero/howzero-ax/hz-os/.pglite
```

- [ ] **Step 3: 의존성 설치 + 검증 (build·tsc·vitest)**

```bash
cd /Users/howzero/howzero-ax/hz-os && npm install && npx tsc --noEmit && npm run build && npm test
```

Expected: 빌드 성공 + vitest 통과. (Playwright 설정 파일은 없음 — E2E는 과거 ad-hoc이므로 이번 검증은 build+vitest까지.)

- [ ] **Step 4: dev 스모크 (홈 200)**

```bash
cd /Users/howzero/howzero-ax/hz-os && (npm run dev >/tmp/hzos-dev.log 2>&1 &) && sleep 8 && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3400 && kill -INT %1 2>/dev/null || pkill -INT -f "next dev --port 3400"
```

Expected: `200`. (PGlite라 SIGINT로 종료.)

- [ ] **Step 5: 커밋**

```bash
cd /Users/howzero/howzero-ax && git add -A && git commit -m "feat: hz-os 포털 이전 — build·vitest·dev 스모크 통과

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: howzero-voice 스킬 작성

**Files:**
- Create: `/Users/howzero/howzero-ax/.claude/skills/howzero-voice/SKILL.md`

- [ ] **Step 1: SKILL.md 작성**

```markdown
---
name: howzero-voice
description: content/_raw/의 원문을 howzero AX 페르소나 말투로 채널별(threads/instagram/youtube) 콘텐츠로 변환. 트리거 — "/howzero-voice", "원문 변환해줘", "쓰레드로 만들어줘", "이거 howzero 톤으로". 인자 없으면 _raw 최신 파일 + 전 채널, 인자로 채널명(threads|instagram|youtube)이나 파일 경로 지정 가능.
---

# howzero-voice — 원문 → 채널별 howzero 콘텐츠

## 절차

1. **페르소나 로드 (생략 금지):** `persona/HowZero AX Persona.md` → `persona/persona-howzero.md` → `persona/HowZero Brand Messaging.md` 순서로 읽는다. 톤 규칙이 충돌하면 AX Persona가 우선.
2. **원문 선택:** 인자에 파일 경로가 있으면 그 파일, 없으면 `content/_raw/`에서 파일명 날짜 기준 최신 `.md`. 원문이 없으면 사용자에게 요청하고 중단.
3. **원문 분석:** 핵심 주장 1개, 근거·수치, 타겟 반응(저장/공유/문의) 파악. **원문에 없는 주장·수치를 만들지 않는다.**
4. **채널 산출** (지정 채널만, 무지정 시 3종 전부):

### threads → `content/threads/YYYY-MM-DD-slug.md`

- 훅 2~3줄 (첫 줄에서 스크롤 멈추게 — 숫자나 반전 우선) + 본문.
- 500자 초과 시 연속 트윗 구조(`---`로 분리), 3개 이하.
- 해시태그 금지. 링크는 마지막 1개만 (있을 때만).

### instagram → `content/instagram/YYYY-MM-DD-slug/carousel.md` + `caption.txt`

- carousel.md: 장별 텍스트. 1장 = 훅(15자 내 헤드라인 + 서브 1줄), 2~N-1장 = 장당 주장 1개 + 근거 1개, 마지막 장 = CTA (`reference/cta-templates.md` 참고).
- 6~8장 기준. caption.txt: 본문 요약 3~5줄 + CTA 1줄.

### youtube → `content/youtube/YYYY-MM-DD-slug/longform.md` + `shorts.md`

- longform.md: 훅(30초, 결론 선공개) → 본론 3파트 → CTA. 말하는 대본체(존댓말 구어).
- shorts.md: 45~60초 분량 1개. 첫 문장 = 훅, 마지막 = 팔로우 CTA.

5. **공통 frontmatter:** 각 산출 파일 상단에
   `---\nsource: content/_raw/<원문파일>\ndate: YYYY-MM-DD\nstatus: draft\n---`
6. **셀프 체크 후 저장:** 아래 가드 위반이 없는지 산출물 전체를 재검토하고, 위반 시 수정 후 저장한다.

## 가드 (위반 = 재작성)

- persona 문서의 금지 표현 목록 준수. 존댓말 여부 등 톤 상세는 persona가 정의한다 — 이 스킬은 구조만 정의.
- `strategy/`에서 refuted 표기된 수치 사용 금지. 벤더 수치는 "최대 X% (전제)" 형태로만.
- '연매출 10억'·'검증한 것만 팝니다' 콘텐츠 1건당 1회 이하.
- 과장·불안팔이·느낌표·AI 클리셰(혁신적/여정/게임체인저) 금지.
- 0원/0시간 직접 약속 금지.

## 산출 후

생성 파일 목록과 각 채널 훅 첫 줄을 사용자에게 보여주고, 말투 피드백을 받는다. 피드백은 persona 문서에 반영을 제안한다 (스킬에 하드코딩하지 않음).
```

- [ ] **Step 2: 커밋**

```bash
cd /Users/howzero/howzero-ax && git add -A && git commit -m "feat: howzero-voice 스킬 — 원문→채널별 페르소나 변환

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: 샘플 원문 → 3채널 변환 시연

**Files:**
- Create: `content/_raw/2026-07-19-roi-calculator.md`
- Create: `content/threads/2026-07-19-roi-calculator.md`, `content/instagram/2026-07-19-roi-calculator/{carousel.md,caption.txt}`, `content/youtube/2026-07-19-roi-calculator/{longform.md,shorts.md}`

- [ ] **Step 1: 샘플 원문 작성**

`content/_raw/2026-07-19-roi-calculator.md`:

```markdown
랜딩에 ROI 계산기를 넣었다.
경쟁사들은 "자동화율 65%" 같은 숫자를 단정해서 절감액을 보여준다.
우리는 그렇게 못 하겠더라. 같은 솔루션도 회사 조건에 따라 자동화율이 40%p 이상 갈리는 걸 아니까.
그래서 우리 계산기는 직원 수, 하루 반복업무 시간, 평균 월급만 받아서 "월 반복업무 인건비"를 산수로 보여주고, 회수 가능액은 40~70% 범위로만 보여준다.
정확한 숫자는 진단에서 뽑는다. 그게 정직한 방식이라고 생각한다.
기본값(8명, 하루 1.5시간, 월급 350만)이면 월 436만원이 반복업무 인건비로 나간다.
```

- [ ] **Step 2: howzero-voice 스킬 실행 (전 채널)**

howzero-voice SKILL.md의 절차를 그대로 수행한다: persona 3종 로드 → 위 원문 분석 → threads·instagram·youtube 5개 파일 생성. 원문에 없는 수치를 추가하지 않는다.

- [ ] **Step 3: 산출 확인**

```bash
find /Users/howzero/howzero-ax/content -name "*2026-07-19-roi-calculator*" -o -path "*2026-07-19-roi-calculator*" | sort
```

Expected: threads 1파일 + instagram 2파일 + youtube 2파일 = 5개.

- [ ] **Step 4: 커밋 + 사용자 말투 확인 게이트**

```bash
cd /Users/howzero/howzero-ax && git add -A && git commit -m "content: 샘플 원문 3채널 변환 시연 — howzero-voice 첫 실행

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

**게이트: 사용자에게 threads 산출물 전문 + 각 채널 훅을 보여주고 말투 승인을 받는다. 불만족 시 persona 문서를 수정하고 재변환.**

---

### Task 7: GitHub private 레포 생성 + push

- [ ] **Step 1: gh 활성 계정 확인**

```bash
gh auth status 2>&1 | grep -A1 hedgehogcandy | head -2
```

Expected: `hedgehogcandy ... Active account: true`. 아니면 `gh auth switch -u hedgehogcandy`.

- [ ] **Step 2: 레포 생성 + push**

```bash
cd /Users/howzero/howzero-ax && gh repo create hedgehogcandy/howzero-ax --private --source . --push
```

Expected: `Created repository hedgehogcandy/howzero-ax` + push 성공.

- [ ] **Step 3: 원격 확인**

```bash
gh repo view hedgehogcandy/howzero-ax --json visibility,defaultBranchRef -q '.visibility + " " + .defaultBranchRef.name'
```

Expected: `PRIVATE main`.

---

### Task 8: 원 레포 정리

**Files:**
- Delete: 이전 완료된 항목들 (아래 목록)
- Modify: `/Users/howzero/howzero/AGENTS.md:57` (ax-web 항목), `/Users/howzero/howzero/wiki/index.md` (AX 브레인 섹션), `/Users/howzero/howzero/brands/howzero/INDEX.md` (헤더)

- [ ] **Step 1: 사전 확인 — 새 레포 검증 완료 상태인지**

Task 3·4의 빌드 통과와 Task 7의 push 성공이 전제. 미완이면 이 태스크를 시작하지 않는다.

- [ ] **Step 2: 이전분 삭제**

```bash
cd /Users/howzero/howzero
git rm -r docs/ax-business ax-web hz-os
git rm "wiki/HowZero AX Index.md" "wiki/HowZero AX Brain.md" "wiki/HowZero AX Content Strategy.md" "wiki/HowZero AX Persona.md" "wiki/HowZero Brand Messaging.md" "wiki/HowZero Audience.md" "wiki/AX Offer Map.md" "wiki/HOWAAA Marketing AX Playbook.md"
git rm -r brands/howzero/howzero_misc_youtube-reference-research brands/howzero/howzero_misc_positioning-playground
git rm brands/howzero/howzero_misc_cta-templates.md brands/howzero/howzero_misc_positioning-system.md brands/howzero/howzero_misc_positioning-change-prompt.md
git rm docs/superpowers/specs/2026-07-08-ax-business-phase1-design.md docs/superpowers/specs/2026-07-09-ax-business-phase2-landing-design.md docs/superpowers/specs/2026-07-09-ax-web-landing-v2-design.md docs/superpowers/specs/2026-07-15-howzero-ax-engagement-os-design.md docs/superpowers/specs/2026-07-16-hz-os-a2z-design.md docs/superpowers/specs/2026-07-16-hz-os-portal-design.md docs/superpowers/specs/2026-07-17-hz-os-project-timeline-design.md docs/superpowers/specs/2026-07-17-hz-os-workspace-design.md docs/superpowers/specs/2026-07-19-howzero-ax-separation-design.md
git rm docs/superpowers/plans/2026-07-08-ax-business-phase1.md docs/superpowers/plans/2026-07-09-ax-business-phase2-landing.md docs/superpowers/plans/2026-07-09-ax-web-landing-v2.md docs/superpowers/plans/2026-07-15-howzero-ax-engagement-contract.md docs/superpowers/plans/2026-07-19-howzero-ax-separation.md
```

주: `git rm -r ax-web hz-os`는 gitignore 밖 파일만 지운다. 남는 untracked(node_modules, .env.local, .pglite)는 `rm -rf ax-web hz-os`로 마저 정리.

- [ ] **Step 3: AGENTS.md 수정**

`/Users/howzero/howzero/AGENTS.md`의 프로젝트 구조에서 다음 줄을:

```
├── ax-web/                         ← 하우제로 AX 랜딩 (히어로 AI 상담 챗봇 + 리드 DB, port 3300)
```

다음으로 교체:

```
│   (howzero AX 사업은 2026-07-19 별도 레포 hedgehogcandy/howzero-ax로 분리 — ax-web·hz-os·전략·페르소나 포함)
```

- [ ] **Step 4: wiki/index.md 수정**

"AX 전환 브레인" 섹션(21행 부근)의 표를 삭제하고 다음 한 줄로 교체:

```markdown
## AX 전환 브레인

2026-07-19 별도 레포 `hedgehogcandy/howzero-ax`의 `persona/`·`strategy/`로 이전했다. 이 vault에는 Commerce 축만 남는다.
```

11행 브랜드 표의 "AX 전환 HowZero" 행도 같은 취지로 비고에 "(별도 레포로 이전)" 추가.

- [ ] **Step 5: brands/howzero/INDEX.md 헤더에 레거시 표기**

INDEX.md 최상단 제목 아래에 추가:

```markdown
> ⚠️ 레거시 아카이브 (2026-07-19): howzero AX 사업은 별도 레포 `hedgehogcandy/howzero-ax`로 분리됐다. 이 폴더의 A~E raw 8,630개와 커머스 자료는 구세대 콘텐츠로, 필요 시 개별 발췌만 한다. AX 관련 misc(유튜브 벤치마크·CTA 템플릿·포지셔닝)는 새 레포 `reference/`로 이동됨.
```

- [ ] **Step 6: 커밋**

```bash
cd /Users/howzero/howzero && git add -A && git commit -m "chore: howzero AX 자산 분리 — hedgehogcandy/howzero-ax 레포로 이전 완료, 잔여 레거시 표기

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

- [ ] **Step 7: 원 레포 빌드 무결성 확인 (ax-web 삭제 영향)**

```bash
cd /Users/howzero/howzero && grep -rn "ax-web\|hz-os" .claude/settings.local.json scripts/sync_ai_meta.py 2>/dev/null | head
```

Expected: 출력 없음(참조 없음). 출력이 있으면 해당 참조를 제거하고 커밋에 포함.
