---
name: reels
description: legacy 카드뉴스 캐러셀(docs/content/carousel-*/)을 Remotion 9:16 릴스 영상(1080x1920 MP4)으로 변환합니다. 신규 zipsaja 제작에는 사용하지 않습니다.
---

# 캐러셀 → Remotion 릴스 변환 스킬

기존 카러셀(`docs/content/carousel-*/slides.html`)을 9:16 릴스 MP4로 변환합니다.

## zipsaja 신규 제작 예외

이 스킬은 일반/legacy 캐러셀 → Remotion 변환 경로다.
신규 zipsaja 콘텐츠 제작은 `zipsaja-remotion-render` 또는 `zipsaja-remotion-orchestrator`를 우선 사용한다.
신규 zipsaja 릴스에는 HyperFrames를 사용하지 않고, 캐러셀 PNG를 이어붙이지도 않는다.

---

## 워크플로우

### Step 0: 입력 수집

사용자에게 확인할 것:

1. **카러셀 디렉토리** — 어떤 카러셀을 영상화할지
   - 예: `docs/content/carousel-zipsaja-gayang-20260420/`
2. **브랜드** — 디렉토리 이름에서 자동 감지 가능
   - `carousel-zipsaja-*` → `zipsaja`
   - `carousel-howzero-*` → `howzero`
   - `carousel-braveyong-*` → `braveyong`
   - 감지 실패 시 사용자에게 물어봄
3. **길이** (기본 22초)
4. **전환 효과** (기본: slide from-right, 0.6초)
5. **캡션 오버레이 여부** (기본: off — PoC에서는 복잡도 증가)

### Step 1: 사전 검증

```bash
# 카러셀 디렉토리 필수 파일 확인
test -f <carousel-dir>/slides.html          # HTML 소스
test -f <carousel-dir>/capture.mjs          # Puppeteer 캡처 스크립트
ls <carousel-dir>/assets/ 2>/dev/null       # (옵션) 마스코트 등 자산
```

없으면 "이 디렉토리는 캐러셀 표준 구조가 아닙니다"로 중단.

### Step 2: 브랜드 reels 프로젝트 확인

경로: `.claude/skills/carousel/brands/<brand>/reels/`

- **존재**: node_modules 확인만 하고 다음 단계
- **없음**: 자동으로 다음 스크립트 실행:
  ```bash
  ./.claude/skills/reels/scripts/scaffold-reels.sh <brand>
  ```
  zipsaja/reels를 템플릿 삼아 복사 → 클래스/파일명 치환 → npm install까지 자동화.

### Step 3: 9:16 슬라이드 재캡처

카러셀의 기본 슬라이드는 1080x1440 (3:4)이라 릴스에서 letterbox가 생김. 9:16으로 다시 캡처:

```bash
# 1. 임시 디렉토리에 slides.html 복제 + height 변경
TMP=/tmp/reels-capture-<brand>-<timestamp>
mkdir -p $TMP
cp <carousel-dir>/slides.html $TMP/
cp -r <carousel-dir>/assets $TMP/ 2>/dev/null || true
sed -i '' 's/width: 1080px; height: 1440px/width: 1080px; height: 1920px/' $TMP/slides.html

# 2. capture.mjs도 viewport height 1920으로 변경
cp <carousel-dir>/capture.mjs $TMP/
sed -i '' 's/height: 1440/height: 1920/' $TMP/capture.mjs

# 3. 원본 node_modules 심볼릭 링크
ln -sf <carousel-dir>/node_modules $TMP/node_modules
cp <carousel-dir>/package.json $TMP/

# 4. 캡처 실행 → $TMP/html/slide-*.png 생성 (2160x3840, 2x 레티나)
cd $TMP && node capture.mjs
```

### Step 4: 슬라이드를 Remotion public으로 복사

```bash
REELS=.claude/skills/carousel/brands/<brand>/reels
rm -f $REELS/public/slides/*.png
cp $TMP/html/*.png $REELS/public/slides/
```

### Step 5: Remotion 컴포지션 업데이트

`src/ZipsajaReel.tsx` 또는 브랜드별 `*Reel.tsx`의 `PNG_SLIDE_COUNT`를 실제 슬라이드 개수(-1, 커버 제외)로 업데이트:

```ts
const PNG_SLIDE_COUNT = <실제 개수 - 1>; // 커버 제외
```

1번 슬라이드(커버)는 네이티브 `Slide1Cover.tsx`로, 나머지는 PNG.

### Step 6: 렌더

```bash
cd $REELS
npx remotion render <브랜드>Reel out/<brand>-<content-id>.mp4 --log=error
```

### Step 7: ffmpeg으로 길이 트림 + 인코딩 최적화

```bash
ffmpeg -y -i out/<brand>-<content-id>.mp4 \
  -t <duration> \
  -c:v libx264 -preset medium -crf 18 \
  -pix_fmt yuv420p -movflags +faststart \
  out/<brand>-<content-id>-<duration>s.mp4
```

### Step 8: 결과 출력

- 경로: `<REELS>/out/<brand>-<content-id>-<duration>s.mp4`
- 스펙: 1080x1920, 30fps, H.264, CRF 18
- Finder 자동 오픈: `open -R <path>`

---

## 브랜드별 프리셋

| 브랜드 | 전환 | 커버 네이티브 | 토큰 파일 | 기본 BGM |
|---|---|---|---|---|
| zipsaja | slide-from-right 0.6s | ✅ 마스코트 바운스 + 오렌지 pill + 분홍 형광펜 | — (인라인) | (없음, 무음) |
| howzero | slide-from-right 0.6s | ✅ 레몬 형광펜 스윕 + HOWAAA CTA 타일 | `src/brand-tokens.ts` | (없음) |
| braveyong | slide-from-right 0.6s | ✅ 골드 스탬프 shake + 빨간 슬래시 + 다크 그라디언트 | `src/brand-tokens.ts` | (없음) |

각 브랜드의 `src/slides/Slide1Cover.tsx`가 독립 컴포넌트. `Root.tsx`에 `Slide1CoverDemo` 컴포지션이 있어 커버만 별도 렌더 가능:
```bash
npx remotion render Slide1CoverDemo out/cover-demo.mp4
```

---

## 스캐폴딩 (신규 브랜드)

`.claude/skills/carousel/brands/<brand>/reels/`가 없을 때만 실행.

생성할 파일:
```
reels/
├── package.json          # remotion ^4, @remotion/transitions, google-fonts
├── tsconfig.json
├── remotion.config.ts
├── src/
│   ├── index.ts          # registerRoot
│   ├── Root.tsx
│   ├── <Brand>Reel.tsx   # 메인 컴포지션
│   └── slides/           # 네이티브 슬라이드 (커버부터)
└── public/
    ├── slides/           # PNG 슬라이드 (자동 채워짐)
    └── audio/            # BGM 자리
```

Node 20+, npm 10+ 필요. `npm install`은 약 30초~1분 소요.

참고 템플릿: 기존 `.claude/skills/carousel/brands/zipsaja/reels/` 구조 그대로 복사 후 브랜드 토큰만 교체.

---

## 주의사항

- **가로 크롭 없음**: 슬라이드 CSS는 원래 1080 width라 그대로 유지. height만 1920으로 확장.
- **content 재배치 주의**: 원본 1440 기준으로 padding/margin 계산된 레이아웃이 1920으로 늘어나면 하단이 비어 보일 수 있음. 필요 시 카러셀 skills의 CSS도 `height: 1920`에 맞춰 조정.
- **polyfill 불필요**: Remotion 4 + React 18 조합, deviceScaleFactor 2로 캡처한 2160x3840 PNG를 그대로 사용.
- **ffmpeg 필수**: Homebrew `brew install ffmpeg`.

---

## 트러블슈팅

| 증상 | 원인 | 대처 |
|---|---|---|
| 영상이 letterbox됨 | 슬라이드가 1440 height 그대로 | Step 3 재캡처 재실행 |
| 마지막 프레임 검은색 | `AbsoluteFill`에 fadeOut 전체 적용됨 | 콘텐츠 레이어에만 opacity 적용 |
| 렌더 중 font 깨짐 | `loadFont()` 누락 | 슬라이드 컴포넌트 상단에 `loadFont()` 호출 |
| 용량 과다 (20MB+) | ffmpeg 재인코딩 누락 | Step 7 `-crf 18` 확인 |

---

## 호출 예시

```
/reels docs/content/carousel-zipsaja-gayang-20260420/
```

또는

```
/reels docs/content/carousel-zipsaja-seoul-avg-24py-20260422/ --duration 30
```

브랜드는 디렉토리 이름에서 자동 감지.
