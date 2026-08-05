# 용감한 용팀장 — 오프라인 AI 셀링 실전반 랜딩 v2 (gigclass.kr)

> 기수·일정·가격·정원은 전부 [`lib/config.ts`](lib/config.ts) 단일 출처다. 이 문서에 숫자를 적지 않는다 — 기수마다 낡는다.

포트폴리오 스타일 + Next.js 15 + Vercel 배포 준비.
**spec**: [`docs/superpowers/specs/2026-05-23-braveyong-ai-selling-landing-v2-portfolio-style-design.md`](../../../docs/superpowers/specs/2026-05-23-braveyong-ai-selling-landing-v2-portfolio-style-design.md)
**v1 (워밍 페이퍼 톤)**: [`../braveyong_landing_ai-selling/`](../braveyong_landing_ai-selling/) — 보존, 같이 운영 가능.

## 스택

| 영역 | 도구 |
|---|---|
| 프레임워크 | Next.js 15.5 (App Router) |
| UI | shadcn/ui + Radix + Tailwind v4 (oklch) |
| 폰트 | Geist (영문), Pretendard Variable (한글 본문), Nanum Pen Script + Gowun Dodum (손글씨) |
| 아이콘 | lucide-react |
| 테마 | next-themes (system 기본 + 라이트·다크 토글) |
| 분석 | @vercel/analytics |

## 로컬 실행

```bash
cd brands/braveyong/braveyong_landing_ai-selling-v2-portfolio
npm install --legacy-peer-deps
cp .env.example .env.local   # 값 채우기
npm run dev                  # http://localhost:3200
```

## Vercel 배포

1. Vercel에 이 폴더를 root로 import (`Root Directory` 설정).
2. **Build Command**: `npm install --legacy-peer-deps && npm run build`
3. **Install Command**: `npm install --legacy-peer-deps`
4. Environment Variables에 `.env.example` 키 동일하게 등록.
5. 배포 후 `og-banner.png`(1200×630)와 `face.jpg`(권장 600×600+) 가 `public/assets/`에 있는지 확인.

> 참고: 현재 Next.js 15.5.4에 CVE 경고가 있다. 운영 배포 전 최신 패치 버전으로 업그레이드 권장 (`npm i next@latest`).

## 페이지 구조

실제 순서는 [`app/page.tsx`](app/page.tsx)가 원본이다. 아래는 요약이며, 블록을 추가·삭제하면
`scripts/check-landing-structure.mjs`의 `orderedComponents`도 같이 고쳐야 한다.

```
GlassNav ──────── 글래스 내비 (후기·커리큘럼·가격 보기·FAQ + 다크 토글 + 결제)
01 Hero ───────── ○ 얼굴 → 이름 → "AI 직원한테 시키는 셀러로" → 커리큘럼 앵커 CTA
                  (가격·결제는 히어로에 두지 않는다 — 첫 화면부터 금액이 꽂히면 거부감이 먼저 생긴다)
02 Strip ──────── 일정·인원·장소 한 줄 띠
03 Problem ────── 대량등록 한계
04 AIDefinition ─ "빠르게 반복하는 구조"
04-B OneYearGap ─ 1년 뒤 두 사람 (무료특강 덱 P1 이식)
05 Outcome ────── 효자상품 10개
06 SituationChoice 내 상황 고르기
07 TrustEvidence  현업 사실 지표 + 갤러리
08 TestimonialWall 1기 수강 후기 + 1주차 후기 + 하이라이트 8장 + 캡처 그리드/lightbox
09 OriginStory ── 스토리텔링 타임라인
10 Curriculum ─── Accordion 주차별 + 잠금 카드(세팅값·지침 원문은 수강생 전용)
11 Operation ──── stat + 일정/장소
12 Calendar ───── 월간 grid 2개 + 일정 요약 (요약은 grid에서 파생 — 사본 두지 말 것)
13 YouTubeCarousel 용팀장 노하우
14 WhyYong ────── 신뢰 방향 + 서명
15 Study ──────── 졸업 스터디
16 Objections ─── 반론 차단
17 Comparison ─── 일반 강의 vs 실전반
18 Price ──────── 가격 공개 + 가격 사다리(기수별 실제 이력) + 결제 버튼
19 Scarcity ───── 개강 전 마감 카운트다운 + 타임라인
20 Apply ──────── 결제 단일 경로
21 FAQ ────────── Accordion
22 FinalCTA ───── 마지막 결제 + 서명
23 Footer ─────── 클로징 + 디스클레이머
StickyCTA ─────── 모바일/데스크톱 하단 고정 결제 바
```

⬛ = 다크 톤 · 🟧 = 워밍 톤 (유일) · 나머지 라이트.

## 자료 매핑

| 자료 | 위치 | 출처 |
|---|---|---|
| 얼굴 사진 | `public/assets/face.jpg` | `용감한용팀장/용감한용팀장.jpg` |
| og:image | `public/assets/og-banner.png` | `node scripts/build-og-banner.mjs` 로 생성 (BANNER 상수를 config와 맞출 것) |
| 후기 캡처 54장 | `public/assets/testimonials/t-01.png ~ t-54.png` | `용감한용팀장/20260523*.png` 시간순 |
| 하이라이트 후기 8장 텍스트 | `lib/testimonials.ts` 의 `highlights` | 운영 입력 — 비면 placeholder 자동 노출 |

## 운영 입력 필요 (배포 전)

| 항목 | 위치 | 비면 어떻게 |
|---|---|---|
| `NEXT_PUBLIC_YOUTUBE_FREE_URL` | env | Hero·최종 CTA의 무료강의 버튼 `#` 폴백 |
| `NEXT_PUBLIC_CONTACT_EMAIL` | env | footer mailto |
| `NEXT_PUBLIC_SITE_URL` | env | og·sitemap·robots 절대 URL |
| `NEXT_PUBLIC_GA4_ID` | env | 선택 |
| 오프라인 수업 시간 | `lib/config.ts` `course.scheduleTime` | `추후 안내`로 표시 |
| 상세 주소 | `lib/config.ts` `course.detailAddress` | `참여 확정자에게 안내` |
| 현업 사실 지표 4종 | `components/trust-evidence.tsx` `facts` | 운영 입력 표시 |
| 후기 8장 교체 | `lib/testimonials.ts` `highlights` | 비면 `N기 모집 중` placeholder (기수는 `course.cohort` 파생) |
| og:image | `public/assets/og-banner.png` | placeholder 보임 |

## 검증

- Playwright 데스크톱(1280) 풀페이지 캡처 ✓ (`assets/v2-fullpage-desktop.png`)
- 라이트/다크 hero 캡처 ✓ (`assets/v2-hero-light.png`, `v2-hero-dark.png`)
- 후기 그리드 펼침·lightbox 동작 확인 ✓ (`assets/v2-testimonials.png`)
- 콘솔 에러 0
- 모든 외부 link `target=_blank rel=noopener noreferrer`
- semantic HTML, alt, ARIA, 키보드 포커스, `word-break:keep-all` 적용

## 톤 가드 (절대 위반 금지)

- 매출·수익 단정 ✕
- “리스크 제로 / 돈 잃을 수 없다” ✕
- “AI가 알아서 / 평생 자동” ✕
- 거짓 잔여석 / “오늘 마감” 같은 가짜 압박 ✕
  (카운트다운 자체는 씀 — 개강 전날이라는 **실제** 마감 기준. `config.payDeadline`, 지나면 자동 숨김)
- 가짜 셀러 조롱 ✕

희소성은 **사실 기반**으로만 — 정원(`course.capacityMax`)과 개강일이라는 실제 제약. 가짜 잔여석 카운터를 두지 않는다.
