# braveyong — 용감한 용팀장

> 글로벌 위탁판매, 구매대행, 스마트스토어/쿠팡 셀러 대상. 직설적, 초보 친화적, SEO/데이터/상세페이지/AI 시스템 중심.

## 브랜드 원본

- [용감한 용팀장 브랜드 에셋](./braveyong_persona.md) — **단일 원본**. 페르소나, 말투, 콘텐츠 전략, 카톡방 운영, 랜딩/신청/결제 흐름 통합
- [강의/콘텐츠 노하우 총정리](./braveyong_misc_lecture-content-knowhow.md) — legacy pointer. 실제 원본은 `braveyong_persona.md`
- [페르소나 인터뷰 asset — 직장인 육아아빠 SEO 셀러](./braveyong_misc_persona-interview-family-seo-seller.md)

## raw 텍스트 폴더

| 폴더 | 의미 | 현재 상태 |
|---|---|---|
| [braveyong_script/](./braveyong_script/) | `Y-***`: 롱폼 강의/유튜브 대본 | README 세팅 |
| [braveyong_shorts/](./braveyong_shorts/) | `YS-***`: 쇼츠/릴스 대본 | README 세팅 |
| [braveyong_carousel_raw/](./braveyong_carousel_raw/) | `YC-***`: 카러셀 raw 텍스트. 전략/말투는 `braveyong_persona.md` 기준 | README 세팅 |
| [braveyong_newsletter/](./braveyong_newsletter/) | `YN-***`: 뉴스레터/장문 교육 글 | README 세팅 |
| [braveyong_linkedin/](./braveyong_linkedin/) | `YL-***`: 링크드인/스레드형 글 | README 세팅 |

## 이미지 카러셀/릴스

| 주제 | 카러셀 | 릴스 | 캡션 |
|---|---|---|---|
| AbFSATnz2_c | [carousel](./braveyong_carousel_AbFSATnz2_c/) | [cover-demo](./braveyong_reels_cover-demo/) | [captions](./braveyong_captions_AbFSATnz2_c.txt) |
| oTxHFTjY_fY — 직장인 부동산 투자자가 온라인 셀링을 시작한 이유 | [carousel](./braveyong_carousel_oTxHFTjY_fY/) | — | — |

## 랜딩 / 세일즈 페이지

| 페이지 | 설명 | 산출물 |
|---|---|---|
| [braveyong_landing_ai-selling/](./braveyong_landing_ai-selling/) | **v1** — 워밍 페이퍼 톤. 단독 반응형 HTML. 기획서 [spec v1](../../docs/superpowers/specs/2026-05-22-braveyong-ai-selling-offline-landing-design.md) | `index.html` + README + CHECKLIST |
| [braveyong_landing_ai-selling-v2-portfolio/](./braveyong_landing_ai-selling-v2-portfolio/) | **v2** — 포트폴리오 스타일 (순흑백 + 손글씨 액센트). Next.js 15 + shadcn/ui + Tailwind v4. Vercel 배포 준비. 후기 캡처 54장 토글 + lightbox. 기획서 [spec v2](../../docs/superpowers/specs/2026-05-23-braveyong-ai-selling-landing-v2-portfolio-style-design.md) | `app/`, `components/`, `lib/`, `public/assets/` |
| `/815` (in v2 앱) | **8.15 통관대응 라이브 특강** — 6/21(일), 209,000원, 결제선생 청구서 → 결제 완료 시 오픈채팅 노출. 기획서 [spec](../../docs/superpowers/specs/2026-06-11-braveyong-tonggwan-815-special-lecture-landing-design.md) | `app/815/`, `components/tonggwan/`, `lib/products.ts` |

## 1회성 자료

| 파일 | 의미 |
|---|---|
| `braveyong_misc_free-webinar-2026-06-08-funnel-draft.md` | 6/8 무료강의 → 200만원 전환 퍼널 초안 (120분 큐시트 + 4단 후크 + 유료 오퍼). wiki 합성: `wiki/BraveYong Free Webinar Funnel.md` |
| [`braveyong_misc_ref-billiebro-free-webinar/`](./braveyong_misc_ref-billiebro-free-webinar/) | 무료강의 벤치마크 레퍼런스 — 빌리브로 임찬 세일즈 웨비나(영상 `aXuFaCEkQ58`). `SCRIPT.md`(정제 대본) + `STRUCTURE.md`(구조 분석). wiki: `wiki/BraveYong Webinar Benchmark.md` |
| `braveyong_misc_naver-cafe-banner.png` | 불사자 네이버 카페 대문용 용팀장 배너 (960×360, 2026-05-27). spec: `docs/superpowers/specs/2026-05-27-bulsaja-naver-cafe-renewal-design.md` |
| [`braveyong_misc_bulsaja-lecture-banner/`](./braveyong_misc_bulsaja-lecture-banner/) | 불사자 대시보드 상단 대문 배너 (2000×400, 2026-05-28). A 시네마틱 백드롭 + 무재고 AI 셀링 marker 강조. `banner.html` + `capture.mjs` + 1×/2×/3×/4× PNG. CSS mock 베이스 — 실제 AI 백드롭 교체 시 PLAN.md 참조 |
| [`braveyong_misc_dy1-mag-carousel-format/`](./braveyong_misc_dy1-mag-carousel-format/) | dy1.mag 레퍼런스 캐러셀 해체 분석 포맷 (1080×1350, 2026-05-29). `CAROUSEL_FORMAT.md` + `design-dna.json` + reference JPG |
| [`braveyong_misc_용팀장-강의-정산-2026-0514-0610.md`](./braveyong_misc_용팀장-강의-정산-2026-0514-0610.md) | 용팀장 AI셀링 강의 정산 (2026.05.14~06.10). 강의 매출 확정 4,326만(25건) + 보정내역 + 용팀장 4:하우제로 6 정산표(비용 700만, 반띵/하우제로 전액 시나리오). 출처: 결제선생 발송수납내역 xlsx |
| `braveyong_misc_815-chat-blast-10cases.xlsx` | 8월 통관특강 단톡방·카카오채널 홍보 멘트 10종 (2026-06-12). 공포 앵글 × 전문가 해결(대기업 공인인증서 담당 출신 + 원스탑) 4~5줄 복붙용 + 사용 가이드 시트. 카피 룰: 8월 표기·선착순 금지·단정 금지 |

## 브랜드 톤

- 타깃: 구매대행, 스마트스토어, 쿠팡, 글로벌 위탁판매 초보/현직 셀러.
- 핵심: 감으로 상품을 올리는 상태를 SEO, 데이터, 상세페이지, AI 시스템으로 바꾼다.
- 말투: 직설적, 도발적, 실전적. 하지만 팩폭 뒤에는 반드시 근거와 오늘 할 일을 붙인다.
- 금지: 성과 보장, 검증 안 된 수익 단정, AI 딸깍 자동화 과장, 불안 조장만 하고 CTA로 도망가는 구성.

## wiki

- `wiki/BraveYong Index.md`
- `wiki/BraveYong Brain.md`
- `wiki/BraveYong Persona.md`
- `wiki/BraveYong Persona Asset Interview.md`
- `wiki/BraveYong Lecture Playbook.md`
- `wiki/BraveYong Content Pipeline.md`
- `wiki/BraveYong Source Map.md`
