# 용감한 용팀장 — 6주 오프라인 AI 셀링 실전반 (1기) 랜딩 v2

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

## 페이지 구조 (Hero + 19블록 + GlassNav/StickyCTA/Footer)

```
00 GlassNav ────── iOS 26 글래스 (좌: 브랜드, 가운데: 후기·커리큘럼·1기 지원 CTA·FAQ, 우: 다크 토글 + 지원하기)
01 Hero ─────────── 포트폴리오 1컬럼: ○ 얼굴 → "용감한 용팀장" → "1만 개 → 효자상품 10개" 임팩트 + pill CTA × 2 + 손글씨
02 STRIP ──────── ⬛ 일정·인원·장소 한 줄 띠 (가격 항목 X)
02-B Origin Story  스토리텔링 5단계 타임라인 — 대기업 → 새벽 부업 → 타오바오 모니터 받침 → SEO·시스템화 → 6주 강의
03 신뢰 증거 ───── 현업 사실 지표 4카드 + 강의실/단체/손모음 3장 갤러리 + 1기 모집 안내
04 후기 벽 ─────── 하이라이트 8 텍스트 카드(실제 발췌) + ▼ 펼치면 캡처 50장 그리드 + lightbox
05 문제 ────────── ⬛ 대량등록 한계 4 + “팔리는 구조” 형광펜 + trade-off("1만 개 시간 누가 돌려주나요?"/"잘 만든 10개")
06 AI 정의 ─────── "빠르게 반복하는 구조" 형광펜 + "받는 셀러 → 잡는 셀러" 라임 + 반복 루프 5단계
07 효자상품 ────── "10" 손그림 동그라미 + 7요소 + 매출보장 아님 가드 + 타오바오 모니터 받침 스토리
08 커리큘럼 ────── Accordion 1~6주 + 주차별 "현장 장면" 워밍 박스 (인터뷰 scene)
09 운영 ────────── ⬛ 5 stat + 일정/장소
10 왜 용팀장 ───── 6 신뢰 방향 + "쉽게 돈 버는 건 아닙니다, 그런데 되는 방향은 맞습니다" 인터뷰 인용 + 펜글씨 서명
11 졸업 스터디 ─── "강의 진짜 가치는 졸업 후" 형광펜 + 스터디 사진 1장 + 참여 안내(가격 X)
12 반론 차단 ───── 6 카드 (SEO 한 줄 공식 / 하루 1시간 누구나 회의 포함)
13 비교표 ──────── ⬛ 일반 강의 vs 실전반 7항목 (SEO 검증 포함)
14 가격 ────────── "신청서 검토 후 개별 안내" + "받는 건 6주가 아니라 효자상품 10개와 사람들" 정당화
15 소수정예 ────── 🟧 워밍 (유일) — 10~15명·1기 한정·선별 (가격 숫자 X)
16 신청 ────────── 같은 페이지 안 구글폼 iframe + 11문항 미리보기 + 받습니다/정중히 사양 매트릭스
17 FAQ ──────────  Accordion 12문항 (인터뷰 톤)
18 최종 CTA ────── ⬛ "자산은 있어도 매월 들어오는 돈은 별도 / 현금흐름은 따로" + 큰 CTA + 흰 펜글씨 서명
19 Footer ───────  "강의 한 번 듣고 끝나는 시장이 아닙니다" 클로징 + 디스클레이머 + ©
sticky-cta ─────  모바일 Hero 끝나면 등장 → "1기 실행자로 지원하기"
```

## 가격 노출 정책

페이지에 가격 숫자를 절대 노출하지 않는다 (본강의·졸업 스터디 모두). 결제 정보는 신청서 검토 후 개별 안내.
이유 — "아무나 받지 않는다" 원칙을 페이지 디자인 자체로 지키기 위해.

grep 가드: `180만|250만|15만|5만원|1,800,000|2,500,000|priceFirst|priceRegular` 페이지 0건 유지.

⬛ = 다크 톤 · 🟧 = 워밍 톤 (유일) · 나머지 라이트.

## 자료 매핑

| 자료 | 위치 | 출처 |
|---|---|---|
| 얼굴 사진 | `public/assets/face.jpg` | `용감한용팀장/용감한용팀장.jpg` |
| og:image | `public/assets/og-banner.png` | (운영자 입력 필요 — 채널 배너 1200×630 리사이즈) |
| 후기 캡처 54장 | `public/assets/testimonials/t-01.png ~ t-54.png` | `용감한용팀장/20260523*.png` 시간순 |
| 하이라이트 후기 8장 텍스트 | `lib/testimonials.ts` 의 `highlights` | 운영 입력 — 1기 모집 단계에선 placeholder 자동 노출 |

## 운영 입력 필요 (배포 전)

| 항목 | 위치 | 비면 어떻게 |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_FORM_URL` | env | 신청 섹션 안내문 + CTA `#` 폴백 |
| `NEXT_PUBLIC_YOUTUBE_FREE_URL` | env | Hero·최종 CTA의 무료강의 버튼 `#` 폴백 |
| `NEXT_PUBLIC_CONTACT_EMAIL` | env | footer mailto |
| `NEXT_PUBLIC_SITE_URL` | env | og·sitemap·robots 절대 URL |
| `NEXT_PUBLIC_GA4_ID` | env | 선택 |
| 오프라인 수업 시간 | `lib/config.ts` `course.scheduleTime` | `추후 안내`로 표시 |
| 상세 주소 | `lib/config.ts` `course.detailAddress` | `참여 확정자에게 안내` |
| 현업 사실 지표 4종 | `components/trust-evidence.tsx` `facts` | 운영 입력 표시 |
| 1기 종료 후 후기 8장 | `lib/testimonials.ts` `highlights` | `1기 모집 중` placeholder |
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
- 실시간 카운트다운 / 거짓 잔여석 / “오늘 마감” ✕
- 가짜 셀러 조롱 ✕

희소성은 `15 소수정예` 한 곳에 **사실 기반**으로만 (10~15명·1기 특별가·선별).
