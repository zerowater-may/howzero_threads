# HowZero Content Pipeline

## 역할

하우제로 저장소의 `brands/`는 브랜드별 콘텐츠 원문과 산출물을 담는 중심 레이어다. 신규 콘텐츠는 브랜드, 타입, 주제에 맞춰 정리하고 각 브랜드 `INDEX.md`를 갱신한다.

## 브랜드 구조

| 브랜드 | 역할 |
|---|---|
| zipsaja | 부동산/실거래 기반 카러셀, 릴스, pipeline |
| howzero | AI 자동화 콘텐츠 본체 |
| braveyong | 용감한 용팀장, 글로벌 위탁판매/구매대행/스마트스토어 셀러 교육 브랜드 |
| mkt | 한국어 마케팅/세무/이커머스 |
| etc | 실험/테스트 |

## howzero 콘텐츠 자산

`brands/howzero/`에는 대량 raw 텍스트와 실제 카러셀/릴스 산출물이 있다.

| 폴더 | 의미 |
|---|---|
| `howzero_script/` | 긴 영상 대본 |
| `howzero_shorts/` | 쇼츠 스크립트 |
| `howzero_carousel_raw/` | 카러셀 raw 텍스트 |
| `howzero_newsletter/` | 뉴스레터 |
| `howzero_linkedin/` | 링크드인 포스트 |
| `howzero_carousel_*` | 실제 PNG/HTML 카러셀 |
| `howzero_reels_*` | 릴스 mp4 |

## braveyong 콘텐츠 자산

`brands/braveyong/`에는 용감한 용팀장 페르소나, 강의 노하우 원문, 기존 카러셀/릴스 산출물, 향후 raw 텍스트 폴더가 있다.

| 폴더/파일 | 의미 |
|---|---|
| `braveyong_persona.md` | 용팀장 페르소나 원본 |
| `braveyong_misc_lecture-content-knowhow.md` | 강의/콘텐츠 노하우 원문 |
| `braveyong_script/` | 롱폼 강의/유튜브 대본 |
| `braveyong_shorts/` | 쇼츠/릴스 대본 |
| `braveyong_carousel_raw/` | 카러셀 raw 텍스트 |
| `braveyong_newsletter/` | 뉴스레터/장문 교육 글 |
| `braveyong_linkedin/` | 링크드인/스레드형 글 |
| `braveyong_carousel_*` | 실제 PNG/HTML 카러셀 |
| `braveyong_reels_*` | 릴스 mp4 |

## zipsaja pipeline

> zipsaja 브랜드 브레인(정체성·톤·콘텐츠 공식·데이터)은 [[Zipsaja Index]] · [[Zipsaja Persona]] · [[Zipsaja Content Playbook]] · [[Zipsaja Data Findings]] 참조. 이 섹션은 파이프라인 구조만 다룬다.

zipsaja는 데이터 기반 통합 파이프라인이 완성되어 있다.

```txt
주제/스카우팅
→ 실거래 데이터 수집
→ Remotion 릴스
→ 캐러셀 PNG
→ Excel/PDF 첨부자료
→ IG/Threads/LinkedIn 캡션
→ Zernio 예약/게시
```

## 표준 bundle 구조

```txt
brands/{brand}/{brand}_pipeline_{slug}/
├── pipeline-state.json
├── data.json
├── carousel/
├── reels/
├── publish-ready/
├── attachments/
├── captions/
└── publish-state.json
```

## 게시 원칙

- Instagram Reel, Instagram Carousel, Threads Carousel은 개별 명령으로 제출한다.
- Reels는 1080x1920, 9:16, H.264, 30fps, 30초 기준이다.
- `zipsaja-reel-30s-audio-mapped-ig-safe.mp4`가 있으면 우선 사용한다.
- 게시 결과는 `publish-state.json`에 누적한다.
- Zernio 409는 중복 실패만이 아니라 기존 post 상태 확인 신호일 수 있다.

## 관련 페이지

- [[HowZero Overview]]
- [[HowZero Technical System]]
- [[HowZero Content Strategy]]
- [[HowZero Source Map]]
- [[BraveYong Content Pipeline]]
- [[Zipsaja Index]]

## Sources

- `AGENTS.md`
- `brands/INDEX.md`
- `brands/howzero/INDEX.md`
- `brands/braveyong/INDEX.md`
- `docs/superpowers/specs/2026-04-24-brand-content-pipeline-design.md`
- `docs/superpowers/plans/2026-04-24-pipeline-mvp.md`
