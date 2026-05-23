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

## 페이지 구조 (18블록 + Hero/Footer/Sticky CTA)

```
01 Hero ─────────── 포트폴리오 1컬럼: ○ 얼굴 → UPPERCASE 이름 → 카피 → pill CTA × 2 + 손글씨 한 줄
02 STRIP ──────── ⬛ 가격·일정·인원·장소 한 줄 띠
03 신뢰 증거 ───── 현업 사실 지표 4카드 + 1기 후기 자리
04 후기 벽 ─────── 하이라이트 8 + ▼ 펼치면 캡처 54장 그리드 + lightbox
05 문제 ────────── ⬛ 대량등록 한계 4 + “팔리는 구조” 형광펜
06 AI 정의 ─────── “빠르게 반복하는 구조” 형광펜 + 반복 루프 5단계
07 효자상품 ────── “10” 손그림 동그라미 + 7요소 + 매출보장 아님 가드
08 커리큘럼 ────── Accordion 1~6주 (다룰 것/산출물)
09 운영 ────────── ⬛ 5 stat + 일정/장소
10 왜 용팀장 ───── 인용 + “— 용감한 용팀장 드림” 펜글씨 서명
11 졸업 스터디 ─── 운영방식 4 + 비용 + 1기 혜택
12 반론 차단 ───── 4 카드
13 비교표 ──────── ⬛ 일반 강의 vs 실전반 6항목
14 가격 ────────── 1기 180 / 정가 250 + “1기에만 적용” 손글씨 화살표
15 소수정예 ────── 🟧 워밍 (유일) — 10~15명·특별가·선별
16 신청 ────────── 같은 페이지 안 구글폼 iframe + 11문항 미리보기 + 강한 문구
17 FAQ ──────────  Accordion 12문항
18 최종 CTA ────── ⬛ 큰 CTA + 흰 펜글씨 서명
19 Footer ───────  디스클레이머 + ©
sticky-cta ─────  모바일 02 STRIP 지나면 등장, 데스크톱 hidden
```

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
