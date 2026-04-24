---
name: content-carousel
description: zipsaja 데이터셋 → Jinja2 템플릿 → 1080×1440 캐러셀 PNG. /pipeline의 zipsaja 분기에서 자동 호출되며 단독 실행도 가능.
---

# content-carousel 스킬

Pipeline data.json 을 입력받아 zipsaja 브랜드 스타일 캐러셀 HTML 을 Jinja2 템플릿으로 렌더링하고 Puppeteer 로 각 슬라이드를 PNG로 캡처.

## 사용

```bash
python3 -m scripts.content_carousel \
  --data brands/zipsaja/zipsaja_pipeline_<slug>/data.json \
  --out brands/zipsaja/zipsaja_pipeline_<slug>/carousel/
```

옵션:
- `--per-slide N` — 슬라이드당 행 개수 (default 8). 25개 구 / 8 → 4 데이터 슬라이드 + 커버 + CTA.
- `--no-capture` — HTML만 생성, PNG 캡처 스킵.

## 산출물

```
{out}/
├── slides.html
├── slide-01.png   # 커버
├── slide-02.png   # 데이터 1
├── ...
└── slide-06.png   # 다크 CTA (댓글 리드매그넷)
```

- 1080×1440 @2x (2160×2880 픽셀).
- zipsaja 브랜드 디자인: `#F0E7D6` 베이지 배경, `#EA2E00` 오렌지 pill, Jua 폰트.

## 요구사항

- Node.js (puppeteer 자동 설치). 초회 실행 시 Chromium 다운로드 약 200MB.
- Python: jinja2.
