# gigclass.kr 랜딩 2기 → 3기 전환 설계

- 작성일: 2026-08-05
- 대상: `brands/braveyong/braveyong_landing_ai-selling-v2-portfolio/` (gigclass.kr, Next.js 15 / React 19 / Vercel)
- 배경: 2기(7/25~8/15) 종료 후 3기 모집으로 랜딩 전환. 상품 구조는 유지, 일정·가격만 변경.

---

## 1. 확정 사실

### 1.1 일정 (요일 전부 검증 완료)

| 항목 | 값 |
|---|---|
| 무료특강 | 2026-08-13 (목) 19:00 |
| 개강 (오프라인 1주차) | 2026-08-22 (토) |
| 오프라인 4회 | 8/22 · 8/29 · 9/5 · 9/12 (전부 토) |
| 줌 보강 4회 | 8/26 · 9/2 · 9/9 · 9/16 (전부 수) |
| 종강 | 2026-09-12 (토) |
| 결제 마감 | 2026-08-21T23:59:59+09:00 (개강 전날 자정) |

줌은 2기와 동일하게 "각 오프라인 회차 다음 수요일" 패턴을 따른다.

### 1.2 가격

| 기수 | 공급가 | 결제액 (VAT 포함) | 상태 |
|---|---|---|---|
| 1기 | 1,800,000 | 1,980,000 | 마감 |
| 2기 | 2,000,000 | 2,200,000 | 마감 |
| **3기** | **2,300,000** | **2,530,000** | **모집 중** |

1기 공급가 180만은 두 출처로 교차 확인했다 — 기존 `priceCohort1: 1_980_000` ÷ 1.1, 그리고 `검수용_수정안_템플릿.md`의 "1기 가격 180만원".

6개월 무이자 할부 시 월 납입액: 2,530,000 ÷ 6 = 421,667 → `422_000` (기존 관례대로 천원 단위 반올림, 화면 표기 "42만원").

### 1.3 변경 없음

정원 20명 · 4주 · 오프라인 4회 + 줌 4회 · 서울 강남(선릉 or 강남역 주변) · 커리큘럼 주차 구성 · 강의 시각(토요일, 시각 미정).

---

## 2. 설계

### 2.1 `lib/config.ts` — 값 교체

```ts
// config
payDeadline: process.env.NEXT_PUBLIC_COHORT1_DEADLINE || "2026-08-21T23:59:59+09:00"

// course
cohort: "3기"
freeLectureDate: "2026-08-13 (목) 19:00"
startDate: "8월 22일 토요일"
endDate: "9월 12일 토요일"
priceFirst: 2_530_000
priceFirstSupply: 2_300_000
priceMonthly6: 422_000
```

`capacityMax: 20` · `weeks: 4` · `offlineCount: 4` · `zoomCount: 4` · `location` · `detailAddress` · `scheduleTime` 은 그대로 둔다.

**상수명 정리**: `cohort1Deadline` → `payDeadline`. 3기 마감을 담는 값의 이름이 `cohort1`이면 4기 때 잘못 건드린다. 실제 참조는 `countdown-timer.tsx:38` 한 곳뿐이라 안전하다.

**env 키는 `NEXT_PUBLIC_COHORT1_DEADLINE` 그대로 둔다.** Vercel Environment Variables에 이 키로 등록돼 있을 수 있고, 코드에서 키 이름을 바꾸면 env가 조용히 안 읽혀 마감 시각이 기본값으로 폴백된다. TS 상수명만 바꾸고 env 키는 유지한다.

### 2.2 `lib/config.ts` — 가격 이력 구조 신설

흩어진 `priceCohort1` · `priceText.cohort1` 을 이력 배열 하나로 교체한다. 4기 전환 때는 배열에 한 줄 추가하면 사다리가 자동으로 늘어난다.

```ts
/** 기수별 공급가 이력 — 가격 사다리 단일 출처. 새 기수는 맨 뒤에 추가한다. */
export const priceHistory = [
  { cohort: "1기", supply: 1_800_000, closed: true  },
  { cohort: "2기", supply: 2_000_000, closed: true  },
  { cohort: "3기", supply: 2_300_000, closed: false },
] as const
```

`course.cohort1Count: 25` 는 가격이 아니라 정원 이력이므로 남긴다.

### 2.3 가격 사다리 컴포넌트 — `price.tsx:74~87` 교체

현재 이 자리에는 "1기는 198만원이었고, 2기는 220만원입니다"가 **글로만** 있다. 이걸 지나간 기수를 취소선 + 회색으로 긁고 현재 기수만 살리는 시각 사다리로 바꾼다.

```
가격은 매 기수 올랐습니다
──────────────────────────────────
  1기    1̶8̶0̶만̶원̶                마감      ← 회색(foreground/40) + line-through
  2기    2̶0̶0̶만̶원̶                마감      ← 회색(foreground/40) + line-through
  3기    230만원    지금 여기     모집 중   ← brand 오렌지 + 굵게 + 좌측 2px 바
──────────────────────────────────
미리 말씀드리면, 4기부터는 기수마다 10만원씩 오릅니다.
```

- `priceHistory` 를 map 해서 렌더. `closed: true` → 취소선 + 회색, `false` → 브랜드 강조.
- 금액은 공급가 기준(부가세 별도)으로 통일한다. 섹션 헤드라인 숫자도 공급가(230만)라 같은 기준으로 맞춰야 사다리와 헤드라인이 따로 놀지 않는다.
- 숫자는 `tabular-nums` 로 자릿수를 맞춘다.
- 기존 섹션의 시각 언어(2px 보더, mono uppercase 라벨, warm 배경, brand 오렌지)를 그대로 따른다. 이 페이지에는 차트가 한 개도 없으므로 막대그래프 형태는 쓰지 않는다.
- 모바일 좁은 폭(320px)에서 가로 스크롤이 생기지 않아야 한다 — 최근 커밋 `ea6f7827`이 같은 문제를 고친 이력이 있다.

**예고 문구**: "미리 말씀드리면, 4기부터는 기수마다 10만원씩 오릅니다."

실제 인상 폭은 +20만(1→2기) → +30만(2→3기)이라 과거 이력과 예고가 일치하지 않는다. 사장님 결정(2026-08-05)에 따라 **과거 숫자는 실제값 그대로 두고, 예고만 10만원으로** 적는다. 1·2기 수강생이 봐도 결제 이력과 어긋나지 않게 하는 것이 우선이다.

**바로 아래 정원 문구도 함께 수정**: 현재 "대신 정원을 25명에서 20명으로 줄였어요"는 2기 시점 기준이다. 3기에서는 "1기 25명 → 2기부터 20명"으로 사실 관계를 맞춘다.

**우측 카드(`price.tsx:111`)**: "1기를 마친 후기가 쌓였고, 그걸 보고 2기를 다시 짰습니다" → 2기 기준으로 갱신.

### 2.4 `components/calendar.tsx` — 월간 grid 재작성

`months` 배열을 7·8월에서 **8·9월**로 교체한다.

```ts
{ label: "2026.08", daysInMonth: 31, startWeekday: 5,  // 2026-08-01 = Sat
  events: {
    22: { type: "off",  n: 1, title: "AI 직원 세팅" },
    26: { type: "zoom", week: 1 },
    29: { type: "off",  n: 2, title: "소싱" },
  } },
{ label: "2026.09", daysInMonth: 30, startWeekday: 1,  // 2026-09-01 = Tue
  events: {
    2:  { type: "zoom", week: 2 },
    5:  { type: "off",  n: 3, title: "노출" },
    9:  { type: "zoom", week: 3 },
    12: { type: "off",  n: 4, title: "전환 · 시스템화" },
    16: { type: "zoom", week: 4 },
  } },
```

`startWeekday` 는 0=월 ~ 6=일 인덱스다. 주차 타이틀은 커리큘럼이 그대로이므로 2기와 동일하다.

`calendar.tsx:188` 제목("2기, 같이 가는 4주 일정.")과 `:235` 안내문("2기 확정 후", "2기 신청 후")은 리터럴 대신 `course.cohort` 를 쓰도록 바꾼다.

### 2.5 기계적 문자열 교체

| 파일 | 위치 | 내용 |
|---|---|---|
| `lib/products.ts` | 15 | 결제 상품명 "…오프라인 2기" → "3기". **결제선생 청구서에 찍히는 이름** |
| `app/layout.tsx` | 83 | meta description "2기 모집 중" → "3기 모집 중" |
| `app/layout.tsx` | 167 | JSON-LD `Course.name` "(2기)" → "(3기)" |
| `components/scarcity.tsx` | 27, 28 | "3기까지 대기" → "4기까지 대기", "2기 끝나고" → `course.cohort` |
| `components/study.tsx` | 61, 79 | "2기" → `course.cohort` |
| `components/faq.tsx` | 49, 57 | "2기" → `course.cohort` |
| `components/testimonial-wall.tsx` | 188 | 후기 placeholder "2기 모집 중 —" → `course.cohort`. 현재 `highlights` 8장이 채워져 있어 화면에는 안 뜨지만 리터럴은 제거한다 |
| 주석 | `app/page.tsx:30,52` · `app/complete/page.tsx:10` · `calendar.tsx:5,7` · `price.tsx:8~11` · `config.ts:13,42,45,51` · `testimonial-wall.tsx:15` · `testimonials.ts:77` | 기수·날짜 표기 갱신 |

리터럴을 `course.cohort` 로 바꿀 수 있는 곳은 바꾼다. 다음 기수 전환 때 손댈 파일 수가 줄어든다.

### 2.6 `public/assets/og-banner.png` 재생성

현재 배너(1200×630)에 **"4주 오프라인 AI 셀링 실전반 · 2기" / "7월 25일 개강" / "정원 20명"** 이 이미지로 박혀 있다. 카톡 공유 미리보기라 안 바꾸면 링크 보낼 때마다 2기가 노출된다.

- 변경: "· 3기" / "8월 22일 개강" / 정원 20명(유지)
- 기존 디자인(다크 배경, 오렌지 액센트, 우상단 로고, 하단 pill 3개) 유지. 텍스트만 교체.
- 생성 스크립트가 없다 — 이번에 만들면서 재생성 가능한 형태로 남긴다.
- 프로젝트 자체 디자인 시스템(brand 오렌지 + warm/다크)이 우선이고, taste 스킬은 그 제약 안에서 타이포·여백에만 적용한다.

### 2.7 `.env.example` 정리

현재 파일이 낡았다 — 헤더가 "6주 … (1기)", 폐기된 `NEXT_PUBLIC_GOOGLE_FORM_URL` 이 남아 있고, 실제 쓰는 `NEXT_PUBLIC_COHORT1_DEADLINE` · `NEXT_PUBLIC_KAKAO_OPENCHAT_URL` · `NEXT_PUBLIC_KAKAO_1TO1_URL` 이 빠져 있다. config를 손대는 김에 맞춘다.

---

## 3. 범위 밖

- `/815` 통관대응 특강 — 별도 상품·별도 컴포넌트(`components/tonggwan/`). 손대지 않는다.
- 커리큘럼 구성 — 2기와 동일.
- 후기 **내용** — 현재 1기 후기 기준(`testimonial-wall.tsx:40~47,201`, `lib/testimonials.ts` `cohort1Reviews`). 2기 후기가 확보되면 별건으로 교체한다. 이번 전환에서 "1기 후기"라는 표기는 사실이므로 그대로 둔다. 단 같은 파일의 **"2기" 리터럴**(§2.5)은 이번에 제거한다.
- `README.md` — 아직 "6주 … (1기)" 로 낡았으나 랜딩 노출과 무관하다. 여력 되면 정리.

---

## 4. 검증

기존 검증 스크립트 3개는 기수 문자열을 검사하지 않으므로 이번 변경으로 깨지지 않는다. 그래도 전부 통과 확인한다.

```bash
npm run test:landing     # check-landing-structure.mjs
npm run test:paymint     # check-paymint-url-flow.mjs
npm run test:815         # 815 구조 + 결제 (범위 밖이지만 회귀 확인)
npm run build            # 타입 에러 — priceCohort1 제거에 따른 참조 누락 검출
```

추가 수동 확인:

1. `grep -rn "2기" --include="*.tsx" --include="*.ts"` 결과가 0건인지 (주석 포함)
2. 카운트다운이 8/21 자정 기준으로 뜨는지, 마감 후 자동 숨김되는지
3. 결제 모달 금액이 **2,530,000원** 으로 찍히는지 — 버튼 라벨(253만)과 어긋나면 안 된다
4. 320px 폭에서 가격 사다리 가로 스크롤 없는지
5. og-banner 교체 후 카톡 공유 미리보기 실제 확인

---

## 5. 다음 기수(4기) 전환 비용

이번 작업 후 4기 전환은 다음으로 줄어든다.

1. `config.ts` 값 교체 (`cohort`, 날짜 4개, `payDeadline`, 가격 3개)
2. `priceHistory` 배열에 한 줄 추가
3. `calendar.tsx` `months` 배열 교체
4. `products.ts` 상품명
5. `scarcity.tsx` "4기까지 대기" → "5기까지"
6. og-banner 재생성

`course.cohort` 로 치환해 둔 곳은 자동으로 따라온다.
