---
name: brands-organize
description: 새로 만든 카러셀(docs/content/carousel-*) 또는 릴스 mp4(.claude/skills/.../reels/out/*.mp4)를 brands/ 컨벤션에 맞춰 자동 이동 + INDEX.md 업데이트. 트리거 키워드 — "brands 정리", "brands로 옮겨", "/brands-organize", "정리해줘"
---

# brands-organize 스킬

## 목적

`brands/{brand}/{brand}_{type}_{name}/` 컨벤션 자동 적용. 새 카러셀 / 릴스를 만든 후 정리되지 않고 흩어진 자료를 한 번에 정돈.

## 사용 시점

- `/carousel` 또는 `/reels` 스킬로 새 콘텐츠를 만든 직후
- 세션 종료 전 `docs/content/carousel-*` 또는 `.claude/skills/.../reels/out/*.mp4` 가 잔여 시
- "정리해줘" / "brands에 넣어줘" 류 요청

## Step 0: 입력 수집

기본은 자동 감지 — 잔여 자료를 모두 스캔.

확인 필요한 것:
1. 어떤 자료를 옮길지 (전체 / 특정 디렉토리)
2. 자동 추론 모호 시: brand / topic 사용자에게 확인
3. 충돌 시 (이미 같은 이름 폴더 있음): 덮어쓰기 / 병합 / suffix 추가 중 선택

## Step 1: 잔여 콘텐츠 스캔

```bash
# 캐러셀 잔여
find docs/content -maxdepth 1 -type d -name "carousel-*" 2>/dev/null

# 릴스 mp4 잔여
find .claude/skills/carousel/brands/*/reels/out -maxdepth 1 -type f -name "*.mp4" 2>/dev/null
```

## Step 2: brand / type / name 추론

**카러셀 디렉토리 이름 파싱:**
- `carousel-zipsaja-seoul-10y-20260423` → brand=`zipsaja`, type=`carousel`, name=`seoul-10y`, date=`20260423`
- `carousel-howzero-pmqTgyPZdto` → brand=`howzero`, type=`carousel`, name=`pmqTgyPZdto`
- `carousel-<한국어>-mkt` → brand=`mkt`, name=`<한국어>`
- `carousel-nanob-*` → brand=`etc`, name=`nanob_*`
- `carousel-test`, `carousel-claude-design` → brand=`etc`, name=`test_*`

브랜드 후보: `zipsaja`, `howzero`, `braveyong`, `mkt`, `etc`

**릴스 mp4 파싱:**
- 경로: `.claude/skills/carousel/brands/<brand>/reels/out/<file>.mp4`
- brand는 경로에서 자동
- topic은 파일명에서 추출 (예: `zipsaja-husband-wife-20260423-full.mp4` → topic=`husband-wife`, variant=`full`)

추론 모호 시 사용자에게 확인.

## Step 3: 이동 실행

**카러셀:**
```bash
mv docs/content/carousel-{brand}-{topic}-{date} \
   brands/{brand}/{brand}_carousel_{topic}/
```

**릴스 mp4 (같은 topic 묶음):**
```bash
mkdir -p brands/{brand}/{brand}_reels_{topic}/
mv .claude/skills/carousel/brands/{brand}/reels/out/{brand}-{topic}-{date}-{variant}.mp4 \
   brands/{brand}/{brand}_reels_{topic}/{variant}.mp4
```

variant 매핑: `full.mp4`, `22s.mp4`, `30s.mp4`, `raw.mp4`, `main.mp4` 등

## Step 4: INDEX.md 업데이트

각 brand 의 `INDEX.md` 끝부분에 새 항목 수동 추가. 템플릿은 기존 `brands/{brand}/INDEX.md` 참조.

(자동 생성 스크립트는 향후 추가 예정)

## Step 5: 검증

```bash
# 잔여 확인
find docs/content -maxdepth 1 -type d -name "carousel-*" | wc -l   # 0이어야 함
find .claude/skills/carousel/brands/*/reels/out -maxdepth 1 -type f -name "*.mp4" | wc -l  # 0이어야 함

# 새 위치 확인
ls brands/{brand}/{brand}_{type}_{name}/
```

## 자동 호출 예시

사용자가 "정리해줘" 하면:

```bash
./.claude/skills/brands-organize/scripts/organize.sh
```

## 주의사항

- **mv는 복구 어려움** — 대상 디렉토리에 같은 이름 존재 시 덮어쓰기 위험. 충돌 시 반드시 사용자 확인.
- **`.claude/skills/.../reels/`는 코드 디렉토리**. mp4 같이 산출물만 이동, 코드/스크립트는 절대 이동 X.
- **카러셀 디렉토리 안 capture.mjs/slides.html**은 상대경로/절대경로 둘 다 사용 → 이동해도 동작. 단, `node_modules` symlink는 이동 후에도 원래 위치 가리키므로 동작 OK.
- **8천 .md (A/B/C/D/E prefix)** 류 raw 콘텐츠는 prefix별 폴더에 모음:
  - A → `howzero/howzero_script/`
  - B → `howzero/howzero_shorts/`
  - C → `howzero/howzero_carousel_raw/`
  - D → `howzero/howzero_newsletter/`
  - E → `howzero/howzero_linkedin/`

## 트러블슈팅

| 증상 | 원인 | 대처 |
|---|---|---|
| brand 추론 실패 | 디렉토리 이름이 표준에서 벗어남 | 사용자에게 brand 직접 입력 받음 |
| 같은 이름 폴더 충돌 | 이미 정리한 적 있음 | suffix 추가 (-v2, -20260424) 또는 병합 결정 사용자 확인 |
| INDEX.md 자동 생성 실패 | 권한/파일 형식 문제 | 수동으로 brands/<brand>/INDEX.md 편집 |
