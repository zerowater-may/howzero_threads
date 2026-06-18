---
name: content-reels
description: pipeline data.json → 기존 Remotion zipsaja/reels 프로젝트로 9:16 30초 mp4 렌더. 필드 매핑(priceBefore/After → priceLastYear/ThisYear) 자동 처리.
---

# content-reels 스킬

Pipeline 의 data.json 을 기존 `.claude/skills/carousel/brands/zipsaja/reels/` Remotion 프로젝트가 읽을 수 있는 `seoul-prices.json` 포맷으로 매핑한 후 `npm run build:seoul` 을 호출한다. 완료 후 ffmpeg 으로 30초 표준 릴스 파일을 H.264 CRF 18로 재인코딩하고, 배경음악을 박은 audio-mapped MP4와 Instagram-safe MP4까지 만든다.

중요: 신규 zipsaja 릴스는 캐러셀 PNG를 이어붙이는 방식이 아니다. `data.json`과 storyboard를 기준으로 30초 전체를 Remotion 컴포지션에서 만든다. 캐러셀은 별도 배포용 산출물이다.

## zipsaja wrapper 우선

이 스킬은 내부 CLI 설명이다.
신규 zipsaja 콘텐츠 제작에서는 `zipsaja-remotion-render`가 이 CLI를 호출하고 `pipeline-state.json`을 갱신한다.
사용자가 zipsaja 워크플로우를 요청하면 직접 이 스킬로 시작하지 말고 `zipsaja-remotion-orchestrator`를 사용한다.

## 사용

```bash
python3 -m scripts.content_reels \
  --data brands/zipsaja/zipsaja_pipeline_<slug>/data.json \
  --out brands/zipsaja/zipsaja_pipeline_<slug>/reels/
```

배경음악 파일을 직접 지정하려면:

```bash
python3 -m scripts.content_reels \
  --data brands/zipsaja/zipsaja_pipeline_<slug>/data.json \
  --out brands/zipsaja/zipsaja_pipeline_<slug>/reels/ \
  --bgm /path/to/bgm.mp3
```

`--bgm`이 없으면 `HOWZERO_REELS_BGM_PATH`를 확인하고, 그것도 없으면 ffmpeg synthetic BGM을 생성해 영상에 박는다. 표준 워크플로우는 배경음악 없는 게시용 릴스를 만들지 않는다.

## 산출물

```
{out}/
├── full.mp4                                      # Remotion 원본
├── zipsaja-reel-30s.mp4                          # 30초 표준 원본
├── zipsaja-reel-30s-audio-mapped.mp4             # 배경음악 baked
└── zipsaja-reel-30s-audio-mapped-ig-safe.mp4     # Zernio/Instagram 우선 파일
```

1080×1920 (9:16), 30fps, H.264.

## 내부 동작

1. `data.json` 읽기
2. `priceBefore` → `priceLastYear`, `priceAfter` → `priceThisYear` 필드 매핑
3. `.claude/skills/carousel/brands/zipsaja/reels/public/data/seoul-prices.json` 에 저장
4. `cd .claude/skills/.../reels && npm run build:seoul`
5. 산출물 복사 + ffmpeg 30초 표준 파일 생성
6. BGM을 영상에 박아 `zipsaja-reel-30s-audio-mapped.mp4` 생성
7. `zipsaja-reel-30s-audio-mapped-ig-safe.mp4` 생성

## 요구사항

- Node.js + Remotion (기존 프로젝트에 이미 설치됨)
- ffmpeg (brew install ffmpeg)
