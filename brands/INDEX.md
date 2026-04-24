# brands/ — 브랜드별 콘텐츠 자료

> 들어오면 바로 보이게. 컨벤션: `{brand}_{type}_{name}`

## 📦 브랜드 한 눈에

| 브랜드 | 카러셀 | 릴스 | 댓글 | 기타 |
|---|---|---|---|---|
| [zipsaja](./zipsaja/) | 6개 시리즈 | 7개 시리즈 (mp4 모음) | comments xlsx | — |
| [howzero](./howzero/) | 2개 시리즈 + raw 1,721개 | cover-demo | — | script 1,729 / shorts 1,731 / newsletter 1,729 / linkedin 1,720 / misc 3 |
| [braveyong](./braveyong/) | 1개 시리즈 | cover-demo | captions txt | — |
| [mkt](./mkt/) | 5개 시리즈 (한글 콘텐츠) | — | — | — |
| [etc](./etc/) | nanob 5 + test 6 | — | — | 실험/잡종 |

## 🗂 컨벤션

- `{brand}_carousel_{topic}/` — 카러셀 디렉토리 (slides.html, slide-XX.png)
- `{brand}_reels_{topic}/` — 릴스 mp4 모음 폴더 (full.mp4, raw.mp4 등)
- `{brand}_captions_{topic}.txt` — 자막/캡션
- `{brand}_comments_{scope}.xlsx` — 댓글 자료
- `{brand}_script/`, `{brand}_shorts/`, `{brand}_newsletter/`, `{brand}_linkedin/` — raw 텍스트 콘텐츠 (대량)
- `{brand}_misc_*` — 그 외 1회성 자료

## 🔗 원본 위치 (변경됨)

- 이전: `docs/content/carousel-*` (8,632 .md + 24 carousel dir)
- 이전: `data/comments_emails.xlsx`
- 이전: `.claude/skills/carousel/brands/{brand}/reels/out/*.mp4`

→ 모두 `brands/` 안으로 **물리 이동**됨. 향후 새 mp4 렌더링은 여전히 `.claude/.../out/` 에 생성되므로 정기적으로 `brands/{brand}/{brand}_reels_*/` 로 옮겨주세요.

## 🛠 향후 워크플로우

새 카러셀:
1. `/carousel` 스킬로 `docs/content/carousel-{brand}-{topic}-{date}/` 에 생성
2. 완료 후 `mv docs/content/carousel-{brand}-{topic}-{date} brands/{brand}/{brand}_carousel_{topic}/`

새 릴스:
1. `/reels` 스킬로 `.claude/skills/carousel/brands/{brand}/reels/out/` 에 mp4 생성
2. `mkdir brands/{brand}/{brand}_reels_{topic}/ && mv .claude/.../out/{file}.mp4 brands/{brand}/{brand}_reels_{topic}/`
