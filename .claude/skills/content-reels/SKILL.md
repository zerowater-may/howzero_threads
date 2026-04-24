---
name: content-reels
description: pipeline data.json → 기존 Remotion zipsaja/reels 프로젝트로 9:16 22초 mp4 렌더. 필드 매핑(priceBefore/After → priceLastYear/ThisYear) 자동 처리.
---

# content-reels 스킬

Pipeline 의 data.json 을 기존 `.claude/skills/carousel/brands/zipsaja/reels/` Remotion 프로젝트가 읽을 수 있는 `seoul-prices.json` 포맷으로 매핑한 후 `npm run build:seoul` 을 호출. 완료 후 ffmpeg 으로 22초 트림 + H.264 CRF 18 재인코딩.

## 사용

```bash
python3 -m scripts.content_reels \
  --data brands/zipsaja/zipsaja_pipeline_<slug>/data.json \
  --out brands/zipsaja/zipsaja_pipeline_<slug>/reels/
```

## 산출물

```
{out}/
├── full.mp4                  # Remotion 원본
└── zipsaja-reel-22s.mp4      # 22초 트림 재인코딩 (게시용)
```

1080×1920 (9:16), 30fps, H.264.

## 내부 동작

1. `data.json` 읽기
2. `priceBefore` → `priceLastYear`, `priceAfter` → `priceThisYear` 필드 매핑
3. `.claude/skills/carousel/brands/zipsaja/reels/public/data/seoul-prices.json` 에 저장
4. `cd .claude/skills/.../reels && npm run build:seoul`
5. 산출물 복사 + ffmpeg 트림

## 요구사항

- Node.js + Remotion (기존 프로젝트에 이미 설치됨)
- ffmpeg (brew install ffmpeg)
