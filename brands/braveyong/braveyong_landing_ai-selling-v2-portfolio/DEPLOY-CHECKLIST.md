# Vercel 배포 체크리스트 — braveyong-landing-v2

bulsaja Vercel 팀(`team_TJbZrrxEedAkxKUVSniHrdlr`)에 신규 프로젝트로 배포.

> **2026-06 현행화**: 커스텀 도메인 **`gigclass.kr`** 연결 완료 — 공개 접근은 이 도메인 기준.
> `*.vercel.app` 배포 URL의 HTTP 401은 팀 Deployment Protection이 의도적으로 켜진 것(프리뷰 보호)이며,
> 프로덕션 공개 경로(gigclass.kr)와 무관하다. 아래 최초 배포 체크리스트의 7·9·10번은 해소됨 — "배포 기록" 참조.

## 배포 기록

### 2026-08-13 (16차) — 수강료를 부가세 포함 230만원으로 변경 (commit `c44a1dd0`)
- `vercel deploy --prod --yes --archive=tgz` → deployment `...jol4xrvon` **READY (production)**
- 사장님 지시: 화면 가격을 **부가세 포함 230만원**으로 통일.
  결제선생 청구액도 253만 → **230만**으로 같이 내려감 (`products.ts` 는 config 파생이라 자동 반영)
- `priceFirst` 2,530,000 → 2,300,000 / `priceMonthly6` 422,000 → 383,000
- `priceFirstSupply` 삭제, `priceText` 에서 `headline`·`supply`·`vat` 삭제 —
  공급가를 따로 보여줄 이유가 사라졌다 (230만 ÷ 1.1 = 209만 909원이라 화면에 쓸 숫자도 아니다)
- **가격 사다리 기준 전환**: 공급가 → 부가세 포함 결제액 (180/200/230 → **198/220/230**).
  3기를 공급가로 두면 사다리 현재 행이 209만이 되어 같은 페이지 헤드라인 230만과 정면충돌한다.
  과거 숫자는 실제 결제액이고 코드 이력으로 검증됨 (1기 옛 `priceCohort1`, 2기 옛 `products.ts` 금액)
- "부가세 별도" 표기 9곳 제거: price · apply · faq · final-cta · sticky-cta · scarcity ·
  one-year-gap · testimonial-wall · complete
- **가드 추가** (`check-landing-structure.mjs`): 컴포넌트에 "부가세 별도"가 다시 나타나면 실패.
  이 문구가 살아 있으면 페이지가 실제보다 10% 싸게 읽히고 결제창에서 금액이 달라 보인다
- 검증: tsc --noEmit / test:landing / build 통과
- 라이브 검증: `https://www.gigclass.kr/`·`/complete` HTTP 200 —
  `230만원` 28 + `부가세 포함` 29 + `월 383,000원` 노출, **`부가세 별도`·`253만원`·`422,000` 0건**.
  사다리 `198만원`·`220만원` 취소선 정상
- 결제 API 실검증: `/api/paymint/send-bill` 응답 `amount: 2300000` 확인
  (더미 번호로 호출해 청구서는 생성되지 않음)
- ⚠️ **기존 3기 결제자 차액**: 253만원으로 이미 결제한 건이 있으면 23만원 차액 처리는 운영 판단 필요

### 2026-08-12 (15차) — 가격 헤드라인을 카드 6개월 무이자 월 납입액 기준으로 전환 (commit `589c561f`)
- `vercel deploy --prod --yes --archive=tgz` → deployment `...l2mn75kn3` **READY (production)**
- 큰 숫자를 253만원 총액 → **"월 422,000원"** (카드 6개월 무이자)으로 교체 — 2026-08-11 사장님 지시.
  총액을 크게 걸면 253만원 하나로 판단이 끝나 실제 대부분이 쓰는 할부가 안 보인다
- 총액(부가세 포함 253만)은 취소선 없이 병기 — 실제 청구액이라 긁으면 없는 할인을 만든다
- 적용 6곳 동일 숫자·동일 단위: apply · price · final-cta · sticky-cta · faq · 결제 모달
  (모달만 "월 42만원대"로 뭉개져 결제 직전에 숫자가 달라 보이던 것 제거)
- price 헤드라인 폰트 clamp — "230"(3글자) 자리에 "422,000원"(8글자)이 들어오며
  아이폰 폭에서 카드 밖으로 88px 삐져나오던 문제
- `config.priceText`에 `monthly6Exact`·`totalExact` 단일 출처 추가, 사용처 없는 `freeLectureDate` 제거
- 검증: tsc --noEmit / test:landing / build 통과
- 라이브 검증: `https://www.gigclass.kr/`·`/complete` HTTP 200 —
  `월 422,000원` 1 + `422,000원` 9 + `카드 6개월 무이자` 12 노출, 총액 253만원 병기 유지

### 2026-08-05 (14차) — 3기 전환 후속: 캘린더 2기 일정 잔재 수리 + 가드 강화 (commits `e1aa8071`·`현재`)
- `vercel deploy --prod --yes --archive=tgz` → 배포 후 라이브 재검증
- **사고**: 13차 배포에 캘린더 '일정 요약' 줄이 2기 날짜(`7.25 · 8.1 · 8.8 · 8.15` / `7.29 · 8.5 · 8.12 · 8.19`)
  그대로 살아 있었다. 바로 위 월간 grid 는 3기(8.22~9.16)를 정확히 렌더하고 있어서 **한 섹션 안에서 자기모순**.
  마지막 오프라인 날짜 8.15 가 개강일 8/22 보다 앞서는 상태로 노출됐다.
  - 원인 ①: 같은 날짜가 `months` 배열과 요약 줄 두 곳에 있었고 전환 때 `months` 만 고쳤다.
  - 원인 ②: 검증 grep 이 `7월 25일` 형태만 봤다. 페이지는 `tabular-nums` 점 표기를 쓴다.
  - 발견: 배포 후 라이브 전면 감사(서브에이전트 5차원 × 적대적 검증). 사람 눈에는 안 띄었다.
- **수리**: 요약 줄을 `months` 에서 파생시키는 `summaryDates()` 로 교체 — 사본이 사라져 구조적으로 어긋날 수 없다
- **가드 강화** (`scripts/check-landing-structure.mjs`):
  - 이 스크립트는 7/20 히어로 개편 이후 계속 실패 중이었다(사라진 카피 3개를 요구). 항상 빨간불이라 아무것도 못 잡았다
  - 카피 문자열 요구를 버리고, `lib/config.ts` 현재 값(기수·개강일·종강일·가격)이 컴포넌트에 하드코딩되면 실패시킨다
  - 캘린더 점 표기 날짜 나열(`8.22 · 8.29`)이 다시 나타나면 실패시킨다
  - `build-og-banner.mjs` 의 BANNER 가 config 기수·개강일과 어긋나면 실패시킨다
  - 새 가드가 즉시 2건 검출 (`price.tsx` "3기까지는", `layout.tsx` JSON-LD "(3기)") → `course.cohort` 파생으로 수정
- `config.nextCohort` 추가 — "N기까지 대기"·"N기부터 10만원씩" 같은 다음 기수 자리도 파생
- 낡은 주석 정리: `products.ts` 금액 주석 2,200,000 / `price.tsx` "200만원·220만원" / `config.ts` env 등록 여부 (셋 다 사실과 반대였다)
- `kakao_notice_messages.txt` 공지·입장 템플릿이 "1기 · 2026.06.13 시작 · 신청서 작성 후" 였다 → 3기 · 8/22 · 직접 결제로 갱신
- `README.md` — "6주 (1기)", "가격 숫자를 절대 노출하지 않는다 + grep 가드", 구글폼 신청 흐름이 남아 있었다.
  현재 구현과 정반대라 그대로 따르면 가격을 걷어내게 된다. 정책·구조 섹션 재작성
- 검증: test:landing(부활) / test:paymint / test:815 / tsc --noEmit / build 전부 통과

### 2026-08-05 (13차) — 2기 → 3기 전환 (commits `148f26a1`·`d20122f4`)
- `vercel deploy --prod --yes --archive=tgz` → deployment `...1x8v01pa4` **READY (production)**
- 일정: 무료특강 8/13(목) 19:00 · 개강 8/22(토) · 종강 9/12(토) · 결제마감 8/21 23:59 KST
  - 오프라인 8/22·29 · 9/5·12 (토), 줌 8/26 · 9/2·9·16 (수) — 요일 전부 검증
- 가격: 공급가 230만 / 부가세 포함 253만 / 6개월 무이자 월 42만
- 가격 사다리 신설: 1기 ~~180~~ → 2기 ~~200~~ → 3기 **230**(취소선+회색 / 브랜드 강조).
  과거 숫자는 실제 결제 이력 그대로. 예고는 "3기까지는 이렇게 올렸고, 4기부터는 기수마다 10만원씩"으로
  시제를 끊어 과거 인상폭(+20/+30)과 미래 약속(+10)이 한 문장에서 충돌하지 않게 함
- `config.cohort1Deadline` → `payDeadline` 리네임 (env 키 `NEXT_PUBLIC_COHORT1_DEADLINE`은 유지)
- **env 확인 결과: `NEXT_PUBLIC_COHORT1_DEADLINE`이 production에 등록돼 있지 않음** → 코드 기본값 사용.
  기수 전환 시 이 키가 나중에 등록되면 코드 기본값을 덮어쓰므로 반드시 같이 갱신할 것
- og-banner.png 재생성 ("2기 · 7월 25일" → "3기 · 8월 22일"). 이번엔 `scripts/build-og-banner.mjs`로
  소스를 남김 — 2기 배너는 손으로 만들어져 소스가 없었고 그래서 3기 전환 때 뒤늦게 발견됨
- 후기 섹션 시제 수정: "지금 1기가 겪고 있는 일입니다"(현재진행) → "1기가 4주 동안 겪은 일입니다"
- 라이브 검증: `https://gigclass.kr/`·`www`·`/complete` HTTP 200 —
  "3기" 57건 · "8월 22일" 20건 · JSON-LD `(3기)`,
  결제 버튼 "지금 3기 결제하기 — 253만원 (부가세 포함)",
  og-banner 1200x630 HTTP 200, 1280px·320px 가로 오버플로 **0px**
- ⚠️ **이 검증은 불충분했다** — 아래 14차 참조. 월·일 표기(`7월 25일`)만 grep 했고 페이지가
  실제로 쓰는 점 표기(`7.25`)를 안 봐서, 캘린더 요약 줄의 2기 일정이 그대로 배포됐다.
  다음 기수 전환 시 **두 표기를 모두** grep 할 것

### 2026-06-12 (12차) — `/815` 중복발송 차단을 전화번호 단위로 (commit `현재`)
- **사고**: 실결제자(010-6356-6838)가 청구서 2건을 각각 결제(C, 17:20·17:51) → billId 단위 락이라 문자 2통 발송(1차 수동, 2차 크론). 같은 사람에게 중복
- **수리**: `sendEntrySmsOnce` 락 키를 billId → **전화번호**로 (`bills/done/<phone>.json`). 통관 특강은 1인 1회면 충분하므로 같은 번호는 몇 건을 결제하든 입장문자 1통
- 마이그레이션: 이미 발송된 번호에 phone 락 생성, 기존 billId 락 정리
- **중복 차단 결정 검증**: 같은 번호 3회 연속 호출 → `sent` 1 + `already-sent` 2 (실 문자 1통). 리컨사일 2·3차 재실행 `sent:0`
- **크론 가동 확인**: howzero 서버 crontab `*/15분` 실행 로그 `/var/log/gigclass-reconcile.log`에 `sent:1` 기록. 401 인증·waiting 분기 정상
- **Clarity**: 815 라이브 로드 확인(`window.clarity` 함수, `clarity.js`) — 루트 layout `ClarityProvider` 상속. 히트맵·세션 + 결제 퍼널 추적(`payment_dialog_open`/`payment_submit`/`payment_complete_link`) 작동 중

### 2026-06-12 (11차) — `/815` 입장문자 누락 근본수리: 리컨사일 크론 + 중복차단 락
- **사고**: 실결제(17:19, 신한 209,000원) 문자 누락. 원인 — 결제선생 콜백이 승인 전 `F` 상태로만 오고 최종 승인(C) 콜백 미수신 → 'C' 가정 코드 스킵. 결제자(010-6356-6838)에게 수동 발송 완료(202)
- **수리 구조** (commit `a3596b95` + 후속):
  - 콜백: state 글자 불신 → readBill로 현재 수납 상태 직접 조회, C일 때만 발송
  - 안전망: 통관 청구서(T 마커)만 Vercel Blob `gigclass-bills`(private) pending 등록 → `/api/paymint/reconcile`(RECONCILE_SECRET)이 미발송 수납건 발송. **howzero 서버 crontab `*/15분` 호출** (`/etc/howzero/gigclass-reconcile.env`, 로그 `/var/log/gigclass-reconcile.log`)
  - 중복·오발송 차단: 통관 전용 = billId T 마커만(course 절대 발송 안 함), 1회 보장 = Blob `allowOverwrite:false` 원자 락 (콜백·크론 동시 도착에도 1건)
- **E2E 검증**: 발송→pending 등록→미수납 콜백 스킵(waiting)→course 콜백 비발송→리컨사일 응답 정상→테스트 청구서 파기·pending 정리. 401 인증도 확인
- 함정 기록: private 스토어에 `access:"public"` put 거부 / 서버리스 fire-and-forget Promise 유실 → await 필수 / `vercel env pull`이 `.env.local` 덮어씀(복구 완료)
- 단톡방 섹션 v3: "가상 시나리오" 라벨 + 가상 재구성 명시 + 문구 전면 재작성

### 2026-06-12 (10차) — `/815` 결제→문자 플로우 수리 + 대기업 강조 + 단톡방 섹션 (commits `6a12b0f0`~`현재`)
- **플로우 단절 3건 수리 후 E2E 검증 완료**: ① `PAYMINT_CALLBACK_URL` env 부재로 청구서에 localhost 콜백이 박히던 문제 → env 등록 ② V1 read-bill에 전화번호가 없어 자동문자 불가 → billId에 번호+상품마커 base36 인코딩(20자 제한 준수) ③ V1 read 응답 code 부재로 결제완료자가 완료 페이지에서 에러를 보던 버그 + 응답에 echo되던 apikey 유출 차단
- E2E 증거: 실청구서 발송(`BT1AG016C4MQAMELWDC2`) → read-bill success:true → 콜백 시뮬레이션 → 함수 로그 `[paymint.callback.sms] 발송 완료` + 010-9950-1140 수신. 테스트 청구서 2건 파기 완료
- ⚠️ 주의: 이 수리 이전(6/12 저녁 전)에 발송된 미결제 청구서는 콜백 URL이 localhost라 결제해도 자동문자가 안 감 — 해당 결제는 결제선생 대시보드 보고 수동 발송
- 카피: '대기업 공인인증서 담당 출신' 강조(히어로 상단 확대), ChatFear815 단톡방 섹션(익명 재구성 — 실대화 모사 1차본을 재작성), 히어로·최종CTA '지금 되는 방법, 언제 막힐지 모릅니다' 긴급성, FAQ '은행 거절' 항목 제거

### 2026-06-12 (9차) — `/815` 특강 명칭 '8.15'→'8월' 전면 전환 (commit `4282e5a3`)
- `vercel deploy --prod --yes` → deployment `...j37xtn0bu` **READY (production)**
- 메타 title·og·상단 탭·결제확인 페이지·결제선생 상품명·자동 입장문자·카톡 템플릿까지 전부 "8월 통관(대응) 특강"으로 통일
- 라이브 검증: `<title>8월 통관대응 라이브 특강</title>`, 페이지 전체 `8.15` **0건** (식별자 productKey `tonggwan-815`·경로 `/815`는 유지)
- 운영 메모: 카톡 오픈채팅방 이름 "[8.15 통관특강] 용감한용팀장"은 방장이 카톡 앱에서 직접 변경 필요

### 2026-06-12 (8차) — `/815` 가격 반박 원장 + 본문 '8.15' 제거 (commits `72582c5b`·`eafecaee`)
- `vercel deploy --prod --yes` → deployment `...5x047f60b` **READY (production)**
- 가격 섹션: '20만 원 비싸다' 반박 — "안 듣고 혼자 하면" 손해 5줄(✕) vs 특강 1회 209,000원(✓) 원장 비교. 손해 항목은 페이지 기존 주장 사실만 재사용
- 본문 '8.15' 표기 제거 → '8월' (오해·원리·커리큘럼·why-yong·히어로 배지). 라이브 잔여 '8.15'는 상품명 표면(메타 title·og:title·상단 탭) 5건뿐
- 라이브 검증: "안 들었을 때 값과 비교해 보죠"·"안 듣고 치르는 값이 비쌉니다"·"8월 데드라인" 노출 확인

### 2026-06-12 (7차) — `/815` 용팀장 피드백 3건 (commit `994c2922`)
- `vercel deploy --prod --yes` → deployment `...dzel2qw9k` **READY (production)**
- ① 8월 구체 일자 → "8월" 통일 (라이브 grep: `8월 15일`·`8월 16일`·`8/15`·`8/16` **0건**, 6/21·6/20·D-카운트·'8.15' 명칭 유지)
- ② 커리큘럼 6→9가지 (발급 전 서류 / 신청~발급 순서 / 발급 후 갱신·사후관리) — "남는 9가지" 노출 확인
- ③ PolicyWindow815 신설 (마감↔가격 사이) — "지금은 됩니다. 언제까지 될지 아무도 모른다는 겁니다" 단정 금지 톤
- 6차 보강: NCP SENS 실발송 테스트 성공 (010-9950-1140 수신 확인, requestId RSLA-1781247247067)

### 2026-06-12 (6차) — `/815` 결제완료 자동 입장문자 (commit `784acebc`)
- NCP SENS 연동(bulsa_server 모듈 이식) — 결제완료 콜백 → 815 결제 건 판별 → 결제자 번호로 오픈채팅 입장 LMS 자동 발송
- Vercel production env `NCP_SENS_ACCESS/SECRET/ID/NUMBER` 등록 (발신번호 070-8064-1808, bulsaja 계정 공유)
- `vercel deploy --prod --yes` → deployment `...69jrgkbn3` **READY (production)**
- 운영 메모: 첫 실결제 시 Vercel Functions 로그 `[paymint.callback.sms]`로 발송 성공 확인 권장. 전화번호 추출 실패 시 로그에 readBill 키 목록이 남으니 그걸로 필드명 보정
- 수동 점검: `node --env-file=.env.local scripts/test-sms.mjs 010XXXXXXXX`

### 2026-06-12 (5차) — `/815` 오픈채팅 입장 링크 자동 전달 활성화
- Vercel production env `NEXT_PUBLIC_TONGGWAN_OPENCHAT_URL=https://open.kakao.com/o/gxFiuezi` 등록 (링크 유효성 확인: "[8.15 통관특강] 용감한용팀장" 방)
- `vercel deploy --prod --yes` → deployment `...oeqvd3sq1` **READY (production)** — NEXT_PUBLIC은 빌드 타임 주입이라 재배포 필수
- 검증: 라이브 `/815/complete` 청크(`page-5bb3488f....js`)에 링크 포함 확인 → 결제 확인자(apprState C)에게 '카톡 오픈채팅방 입장하기' 버튼 자동 노출
- 보완 운영: 완료 화면을 안 거친 수납자는 결제선생 대시보드 명단 확인 후 수동 발송 — 템플릿 `kakao_notice_messages.txt` '결제 확인자 수동 안내용' 추가
- 잔여 운영입력 해소: 2026-06-12 1차 기록의 `NEXT_PUBLIC_TONGGWAN_OPENCHAT_URL` 대기 항목 완료

### 2026-06-12 (4차) — `/815` 선착순 제거, 무제한 접수 (commit `81e1fbb7`)
- `vercel deploy --prod --yes` → deployment `...qhna3b8vo` **READY (production)**
- 라이브 검증: `https://www.gigclass.kr/815` HTTP 200 — `선착순`·`정원` **0건**, "단 1회 진행" 배지 + "6/20(토) 결제 마감 — 단 1회 라이브, 지나면 신청이 닫힙니다" 스트립 노출
- `NEXT_PUBLIC_TONGGWAN_CAPACITY`·`NEXT_PUBLIC_TONGGWAN_SEATS_LEFT` env 불용 처리 (Vercel dashboard에 남아 있어도 무해)

### 2026-06-12 (3차) — `/815` 후기 섹션 제거 + 잔여석 긴박감 스트립 (commit `4018266f`)
- `vercel deploy --prod --yes` → deployment `...jtn9lzsah` **READY (production)**
- 라이브 검증: `https://www.gigclass.kr/815` HTTP 200 — 잔여석 스트립("선착순 50명 — 정원 차면 예고 없이 마감됩니다") 노출, 후기 섹션 카피("이 특강 후기는 아직 없습니다"/"실전반 1기 후기") **0건**
- course(/) 회귀: HTTP 200, 메인 랜딩 후기 섹션 무손상
- 운영 입력: 결제가 차기 시작하면 Vercel env `NEXT_PUBLIC_TONGGWAN_SEATS_LEFT`에 실제 잔여석 입력 → 히어로가 "정원 50석 중 남은 자리 N석" + 게이지로 자동 전환 (재배포 필요)
- Playwright 캡처: [`screenshots/2026-06-12-815-seats-strip-live.jpeg`](screenshots/2026-06-12-815-seats-strip-live.jpeg) (히어로)

### 2026-06-12 (2차) — `/815` 용팀장 통화 피드백 + 크레덴셜 어필 (commits `b18481d7`·`5b2b5d42`·`f37ac77a`)
- `vercel deploy --prod --yes` → deployment `...a3myy9qeo` **READY (production)**
- 라이브 검증: `https://gigclass.kr/815` → 308 → `https://www.gigclass.kr/815` HTTP 200 (apex→www 정상 리다이렉트)
- 새 카피 노출: "구매대행 셀러 계속 하려면" ×4 · "전직 공인인증서 담당" ×14 · 히어로 상단 "전직 공인인증서 담당자가 알려드립니다"
- 금지 표현 grep (라이브 HTML): `부호 받으려면`·`걸려봤습니다`·`전직 은행원` 전부 **0건**
- How 유출 grep: `기업뱅킹`·`금융인증서`·`세관 직접`·`개인계좌 연결`·`open.kakao.com` 전부 **0건**
- course(/) 회귀: HTTP 200 정상
- build 스크립트 `NODE_ENV=production` 고정 적용 — Vercel 빌드 로그에서 `NODE_ENV=production next build` 실행 확인
- Playwright 캡처: [`screenshots/2026-06-12-815-credential-live.jpeg`](screenshots/2026-06-12-815-credential-live.jpeg) (풀페이지, 12섹션 reveal 강제 후)

### 2026-06-12 — `/815` How 잠금판 (commit `ece2ed20`)
- `vercel deploy --prod --yes` → deployment `...jq5dkiv7b` **READY (production)**
- 라이브 검증: `https://gigclass.kr/815` HTTP 200 — 새 카피("못 만드시잖아요"/"풀리지 않는 이 세 가지"/"여기서 전부 막힘"/"정체는 라이브에서") 노출 확인
- How 유출 grep (라이브 HTML): `기업뱅킹`·`금융인증서`·`세관 직접`·`개인계좌 연결`·`open.kakao.com` 전부 **0건**
- course(/) 회귀: HTTP 200 정상
- Playwright 캡처: [`screenshots/2026-06-12-815-how-lock-live.jpeg`](screenshots/2026-06-12-815-how-lock-live.jpeg) (풀페이지), [`screenshots/2026-06-12-815-principle-locked.jpeg`](screenshots/2026-06-12-815-principle-locked.jpeg) (자물쇠 4칸)
- 환경변수: Vercel Dashboard production env 등록 운영 중 (`PAYMINT_*` 포함). 잔여 운영입력: `NEXT_PUBLIC_TONGGWAN_OPENCHAT_URL`(카톡 오픈채팅방 개설 대기)

## 사전 확인
- [x] `~/Library/Application Support/com.vercel.cli/auth.json`에 토큰 발견 (`vca_47jo3D...`)
- [x] bulsaja orgId = `team_TJbZrrxEedAkxKUVSniHrdlr` (`bulsaja-wep-app/.vercel/project.json` 참조)
- [x] 로컬 빌드 성공 (`npm run build` — 별도 검증 단계)
- [x] dev 서버 실제 동작 확인 (`http://localhost:3200` HTTP 200)

## 실행 체크리스트

- [x] 1. Vercel CLI 설치 (`vercel 54.4.1`)
- [x] 2. `vercel whoami` = `bulsaja` (캐시 토큰 자동 인식)
- [x] 3. v2 폴더에서 `vercel deploy --prod --yes --archive=tgz` — bulsajas-projects 팀에 신규 프로젝트 자동 생성·연결
- [x] 4. `.vercel/project.json` 생성됨 (gitignore됨)
- [x] 5. Production 배포 완료 — readyState READY
- [x] 6. URL 받음: `https://braveyonglandingai-selling-v2-portfolio-4a3c6x0vo.vercel.app`
- [ ] 7. ⚠️ **HTTP 401** — Deployment Protection 활성. 사용자가 Dashboard에서 해제 필요
- [ ] 8. (선택) 프로젝트 이름 `braveyong-landing` 등 짧게 rename
- [ ] 9. Playwright로 production URL 화면 캡처 검증 (보호 해제 후)
- [ ] 10. 환경변수 등록 (구글폼 URL 등) — 운영 시작 시

## 알려진 위험·완화

| 위험 | 완화 |
|---|---|
| `--legacy-peer-deps` 필요 (React 19 vs vaul peer 충돌) | `vercel.json`에 `installCommand` 명시 |
| 환경변수 비어있어도 페이지는 깨지지 않음(`lib/config.ts` placeholder fallback) | 초기 배포는 env 없이 진행, 추후 운영자가 dashboard에서 추가 |
| Next 15.5.4 CVE 경고 | 운영 트래픽 시작 전 `npm i next@latest` 권장 — 1차 배포는 그대로 |
| 빌드 메모리/시간 | Hobby tier 한도 충분 |
| `outputFileTracingRoot` warning (workspace root inference) | `next.config.mjs`에 `outputFileTracingRoot` 추가로 silence |

## URL 예상

배포 후 자동 생성될 URL (셋 중 하나):

1. `braveyong-landing.vercel.app` (이름 unique 시)
2. `braveyong-landing-bulsaja.vercel.app` (scope 포함)
3. `braveyong-landing-<random>.vercel.app` (충돌 회피)

## 운영 입력 (1차 배포 후)

Vercel Dashboard → Settings → Environment Variables 에 추가:

```bash
NEXT_PUBLIC_GOOGLE_FORM_URL=https://forms.gle/XXXX     # 필수
NEXT_PUBLIC_YOUTUBE_FREE_URL=https://youtube.com/XXXX
NEXT_PUBLIC_CONTACT_EMAIL=braveyong@...
NEXT_PUBLIC_SITE_URL=https://braveyong-landing.vercel.app  # 받은 URL
NEXT_PUBLIC_GA4_ID=                                     # 선택
```
