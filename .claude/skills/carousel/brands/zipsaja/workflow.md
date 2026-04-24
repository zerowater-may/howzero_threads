# 집사자 Nano Banana V2 워크플로우 (정식 프로덕션 경로)

zipsaja 브랜드 캐러셀의 손그림 질감은 HTML/CSS만으로는 재현되지 않는다. AI가 마스코트·리본·박스·말풍선을 **장면의 일부로 그리고**, 그 위에 텍스트만 오버레이하는 하이브리드 파이프라인이 표준이다.

## 원리

```
[마스코트 reference image (mascot-hero.png)]
              +
[간결한 프롬프트 (스타일 + 레이아웃 + negatives)]
              ↓
  Nano Banana 2 (gemini-3.1-flash-image-preview, aspectRatio 3:4)
              ↓
[손그림 템플릿 PNG — 마스코트 포함, 텍스트 빈칸]
              ↓  PIL resize → 1080x1440
              ↓  cv2 marker_detector → 실제 박스 좌표 검출
              ↓  HTML 텍스트 오버레이 (동적 좌표)
              ↓  Puppeteer capture @2x
[최종 슬라이드 PNG]
```

## 핵심 원칙

1. **마스코트는 AI가 그린다.** HTML `<img>` 오버레이 금지 (복붙 티 남).
2. **캐릭터 일관성은 `mascot-hero.png` reference image로 확보.** Nano Banana 2가 reference를 따라 같은 집사자를 매번 자연스럽게 그림.
3. **프롬프트 한글 절대 금지.** 이미지에 한글이 새어 들어감. 텍스트는 HTML 오버레이로만.
4. **프롬프트 ≤1800자.** 3000자 넘으면 `IMAGE_RECITATION` 에러로 거부됨.
5. **좌표는 marker_detector가 동적으로 검출.** `layout_presets.py`의 좌표는 fallback일 뿐.
6. **Nano Banana는 비결정적.** 같은 프롬프트라도 매번 다른 레이아웃이 나올 수 있음 → 실패 시 재생성 (`rm template_NN.png` 후 재실행).

## 지원 레이아웃 (MVP)

| layout | 용도 | 역할(roles) |
|--------|------|-----|
| `cover` | 커버 슬라이드 | hl-1, hl-2, hl-3, whisper |
| `apartment-card` | 매물/정보 카드 | headline, body, checkpoint, whisper |
| `cta-dark` | 다크 CTA 마지막 | headline, body, button, whisper |

각 role은 텍스트 블록 역할. `SlideSpec`의 `headline/body_lines/checkpoint_lines/whisper` 필드가 role별로 매핑됨.

## 파일 구조

```
scripts/nano_carousel/
├── __main__.py        # 단일 slide CLI
├── batch.py           # 다중 slide 배치 + 통합 nano_slides.html
├── types.py           # SlideSpec, MarkerBBox, TextBlock dataclass
├── prompt_builder.py  # ≤1800자 concise 프롬프트 조립
├── gemini_client.py   # REST 호출 (reference + aspectRatio 3:4)
├── marker_detector.py # OpenCV로 yellow/outlined/mascot/bubble 영역 검출
├── layout_presets.py  # role별 fallback 좌표
└── html_renderer.py   # 검출된 좌표 overlay → 통합 HTML
```

## CLI 사용

### 단일 슬라이드
```bash
set -a && source .env.gemini && set +a
python3 -m scripts.nano_carousel \
  --spec docs/content/carousel-X/spec.json \
  --out docs/content/carousel-X
```

### 배치 (권장)
```bash
set -a && source .env.gemini && set +a
python3 -m scripts.nano_carousel.batch \
  --specs docs/content/carousel-X/specs.json \
  --out docs/content/carousel-X
# 일부만: --only 1 4 11
# 기존 재사용: --skip-existing
```

생성 후:
```bash
cd docs/content/carousel-X
node capture_nano.mjs  # nano-slide-N.png 생성
```

## specs.json 포맷

```json
[
  {
    "idx": 1,
    "layout": "cover",
    "mascot_pose": "hero",
    "headline": "강서구 가양동",
    "body_lines": ["가양동", "9억대", "찾아봤다구"],
    "checkpoint_lines": [],
    "whisper": "9호선 급행 + 마곡!"
  },
  {
    "idx": 4,
    "layout": "apartment-card",
    "mascot_pose": "happy",
    "headline": "가양2단지성지 34A",
    "body_lines": [
      "17년 2.67억 → 22년 6.3억",
      "5년 +136%",
      "26년 호가 7.16억"
    ],
    "checkpoint_lines": [
      "1,624세대 / 1992년",
      "전용 34㎡ / 방2화1",
      "갭률 67%"
    ],
    "whisper": "가양동 대장이라구~"
  }
]
```

## marker_detector V2 동작

`detect_regions(image_path, layout)` → `dict[role → MarkerBBox]`

**detection 단계**:
1. **Yellow regions** (HSV 18-42°, S≥80, V≥140): 리본/하이라이트/노란 버튼
2. **Outlined boxes** (검은 선 contour): 빈 정보 박스
3. **Mascot** (bottom ½ + 노란+검정 군집): 사자 몸체
4. **Bubble** (마스코트 옆/아래 넓은 흰 박스): 말풍선

**핵심 룰**:
- 마스코트 bbox와 겹치는 모든 후보는 제외 (사자의 갈기 원이 박스로 오감지되는 문제 해결)
- layout별 role 매핑은 y좌표 · 크기 · 위치로 결정 (apartment-card는 headline top / body middle / checkpoint right-yellow / whisper bubble)

## 비용

| 항목 | 값 |
|------|------|
| Nano Banana 2 호출당 | $0.039 (≈50원) |
| 평균 성공률 | ~70% (비결정적, 일부 재생성 필요) |
| 실제 장당 비용 | $0.04–0.06 (재시도 포함) |
| 10장 캐러셀 1개 | 500~700원 |
| 소요 시간 | 10~20분 (API 응답 + 재생성) |

## 품질 판정 기준

성공한 슬라이드의 조건:
- ✅ 사자 마스코트가 하단 코너에 단독으로 그려짐 (원형 갈기가 빈 박스로 오감지되지 않음)
- ✅ 프롬프트 요청 레이아웃과 실제 출력이 일치 (apartment-card = 상단 리본 + 큰 박스 + 2 side-by-side + 말풍선)
- ✅ 말풍선이 명확히 꼬리 달린 모양 (둥근 직사각형 + triangle tail)

실패 패턴:
- ❌ 사자가 중앙에 크게 → headline/body가 사자 위로 올라감 (cta-dark 자주)
- ❌ 2 side-by-side 박스가 2x2 grid로 drift → checkpoint 좌표 꼬임
- ❌ 말풍선이 비어 있고 꼬리만 있음 → whisper 영역 검출 실패

**실패 시 대응**: 해당 template_NN.png 삭제 후 재실행.

## 하이브리드 배포

정보 밀도가 높은 슬라이드(TOP5 랭킹, 체크리스트, stat 카드 3개)는 Nano Banana 지원 레이아웃 3개에 매핑되지 않는다. 이런 슬라이드는 기존 HTML-only 방식을 유지하고, 최종 `slides.html`에서 Nano 생성물과 섞어 배치한다.

권장 분할:
| 유형 | 접근 |
|------|------|
| 커버 (slide-1) | Nano (cover) |
| 인트로 (slide-2) | HTML-only (stat-grid) |
| 랭킹 TOP5 (slide-3, 9) | HTML-only (ranking list) |
| 단지 카드 5장 (slide-4~8) | Nano (apartment-card) |
| 체크리스트 (slide-10) | HTML-only |
| CTA (slide-11) | Nano (cta-dark) 또는 HTML-only |

## 안티패턴

- ❌ 마스코트를 HTML `<img>` 오버레이 — 복붙 느낌
- ❌ 녹색 원 마커 요청 — Nano Banana가 도면처럼 그림
- ❌ 프롬프트에 한글 — 이미지에 새어 들어감
- ❌ transparent PNG 요청 — 체크무늬 패턴을 픽셀로 그림
- ❌ 좌표 매번 수동 튜닝 — `detect_regions` 신뢰하고 실패 시 재생성

## 레퍼런스 사례

- `docs/content/carousel-zipsaja-gayang-20260420/` — 강서구 가양동 11장 (Nano 6장 + HTML 5장 하이브리드)
  - specs.json 포함
  - 성공 Nano: slide-1, 4, 5, 6, 7, 8
  - HTML-only: slide-2, 3, 9, 10, 11
