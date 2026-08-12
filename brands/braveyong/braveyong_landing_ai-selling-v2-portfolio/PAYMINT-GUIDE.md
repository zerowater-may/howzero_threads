# 결제선생(Paymint/페이썸) 연동 가이드 — 다른 프로젝트 이식용

> gigclass.kr 랜딩(`braveyong_landing_ai-selling-v2-portfolio`)에서 실전 운영 중인
> 결제선생 카카오톡/URL 청구서 결제 모듈을 다른 프로젝트에 그대로 옮겨 쓰기 위한 문서.
> 코드 원본: 이 폴더의 `lib/paymint/` + `app/api/paymint/`

---

## 1. 뭘 하는 모듈인가

결제선생(https://payssam.kr, ERP API `erp-api.payssam.kr`)으로:

- **청구서 발송** — 고객 이름+전화번호+금액 → 카톡 청구서(TALK) 또는 결제 URL(URL) 생성
- **재발송 / 조회 / 파기 / 결제취소**
- **결제완료 콜백 수신** — 결제선생이 우리 서버로 POST
- (부가) 결제완료 시 자동 입장문자(NCP SENS) + 콜백 유실 대비 15분 크론 리컨사일

PG창 없이 "청구서 링크 보내면 고객이 카드로 결제"하는 구조라 랜딩/폼 기반 판매에 맞다.

---

## 2. API 자격증명 (apikey)

필요한 값 3개 — **결제선생 ERP 관리자(제휴/API 발급)에서 받은 값**:

| 키 | 의미 |
|---|---|
| `PAYMINT_API_KEY` | API 키 |
| `PAYMINT_MEMBER_ID` | 회원(계정) ID |
| `PAYMINT_MERCHANT_ID` | 가맹점 ID |

실값은 레포에 안 적는다(레포 규칙). **현재 운영값 꺼내는 법** — 이 폴더에서:

```bash
cd brands/braveyong/braveyong_landing_ai-selling-v2-portfolio
npx vercel env pull .env.paymint --environment=production
grep PAYMINT .env.paymint
# 확인 후 새 프로젝트의 .env.local / Vercel env로 옮기고 .env.paymint 삭제
rm .env.paymint
```

주의: 같은 API 키를 여러 서비스가 공유하면 콜백 인증도 같은 키로 검증된다.
새 사업자/가맹점이면 결제선생에서 **별도 발급**받는 게 맞다.

---

## 3. 모듈 구성 — 복사할 파일

핵심 모듈은 **의존성 제로**(Node 표준 `crypto` + `fetch`만 사용). 그대로 복사하면 된다.

```
lib/paymint/
├── config.ts    # env 로딩 + 엔드포인트 상수 (V1/V2)
├── hash.ts      # SHA-256 해시, billId 생성/디코딩, 만료일, 전화번호 정리
├── types.ts     # 요청/응답/콜백 타입
└── client.ts    # sendBill / resendBill / readBill / destroyBill / cancelBill

app/api/paymint/            # Next.js App Router 라우트 (프레임워크 종속, 선택 복사)
├── send-bill/route.ts      # POST {memberName, phoneNumber, productKey} → 청구서 발송
├── resend-bill/route.ts    # POST {billId} → 카톡 재발송
├── read-bill/route.ts      # POST {billId} → 상태 조회
├── destroy-bill/route.ts   # POST {billId, amount} → 미결제 청구서 파기
├── callback/route.ts       # 결제선생 → 우리 서버 결제 콜백
└── reconcile/route.ts      # 크론 안전망 (선택 — §8)
```

라우트는 `zod`만 추가로 쓴다. Next가 아니면 `lib/paymint/`만 복사하고 라우트는 프레임워크에 맞게 5~20줄로 다시 쓰면 된다.

---

## 4. 모듈 다는 방법 (새 프로젝트, step by step)

1. **파일 복사**
   ```bash
   SRC=~/howzero/brands/braveyong/braveyong_landing_ai-selling-v2-portfolio
   cp -r $SRC/lib/paymint        <새프로젝트>/lib/paymint
   cp -r $SRC/app/api/paymint    <새프로젝트>/app/api/paymint   # Next.js일 때
   ```
2. **의존성** — 라우트를 쓰면 `npm i zod` (이미 있으면 끝. lib은 의존성 없음)
3. **상품 정의** — 원본 라우트는 `@/lib/products`의 `resolveProduct()`를 import한다.
   새 프로젝트 상품에 맞게 `lib/products.ts`를 새로 만들거나, send-bill 라우트에서
   `amount`/`productName`을 직접 하드코딩으로 치환.
4. **콜백 부가기능 제거** — `callback/route.ts`의 `sendTonggwanEntrySms`(입장문자),
   `bill-registry`(Blob 레지스트리) import는 gigclass 전용. 필요 없으면 지우고
   "인증 검증 + 로그 + `{code:"0000"}` 반환"만 남긴다. §7 최소 콜백 참고.
5. **env 설정** (`.env.local` + Vercel Environment Variables):
   ```bash
   PAYMINT_API_URL=https://erp-api.payssam.kr/
   PAYMINT_API_KEY=<발급값>
   PAYMINT_MEMBER_ID=<발급값>
   PAYMINT_MERCHANT_ID=<발급값>
   PAYMINT_DRY_RUN=true                # 개발 기본. 운영 배포 시에만 false
   PAYMINT_BILL_EXPIRE_DAYS=3
   NEXT_PUBLIC_BASE_URL=https://<새도메인>   # 콜백 URL 자동 생성에 사용
   # 선택 — 명시하고 싶으면:
   PAYMINT_CALLBACK_URL=https://<새도메인>/api/paymint/callback
   PAYMINT_PAYMENT_REDIRECT_URL=https://<새도메인>/complete
   ```
6. **dry-run으로 흐름 확인** → **DRY_RUN=false + 소액 실결제 1건** → 운영.

### 서버측 사용 예

```ts
import { sendBill, readBill, cancelBill } from "@/lib/paymint/client"

// 청구서 발송 (URL 방식 — 응답의 shortUrl을 고객에게 노출)
const r = await sendBill({
  memberName: "홍길동",
  phoneNumber: "010-1234-5678",   // 하이픈 있어도 됨, 내부에서 정리
  amount: 209000,
  productName: "OO 강의",
  message: "OO 강의 결제 청구서입니다.",
  sendType: "URL",                 // "TALK"이면 카톡 청구서 직발송
})
// r.data.billId, r.data.shortUrl

// 상태 조회 → appr_state: W(대기) / C(수납완료) / D(파기) / F(미확정)
const status = await readBill({ billId: "..." })

// 결제 전 파기 / 결제 후 취소 — 금액이 발행 금액과 일치해야 함 (hash 검증)
await cancelBill({ billId: "...", amount: 209000 })
```

### 프론트 사용 예 (원본: `components/payment-dialog.tsx:139`)

```ts
const res = await fetch("/api/paymint/send-bill", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ memberName, phoneNumber, productKey }),
})
const json = await res.json()
// json.data.shortUrl → 결제 링크 버튼으로 노출 / json.data.deliveryType === "TALK"이면 "카톡 확인" 안내
```

---

## 5. API 스펙 핵심 (코드가 흡수하고 있는 것)

### V1 vs V2 — 두 벌의 API가 있다

| | V1 (legacy) | V2 |
|---|---|---|
| 엔드포인트 | `/if/bill/send` `/if/bill/read` … | `/bill` `/bill/read` … |
| 인증 필드 | `apikey` (소문자 k) | `apiKey` (camelCase) |
| 필드 스타일 | `bill_id`, `product_nm`, `expire_dt`, `callbackURL` | `billId`, `productName`, `expireDt`, `callbackUrl` |
| read 응답 | `code` 없이 bill 객체 그대로 | `{code, data}` |

`client.ts`가 자동 처리한다: `PAYMINT_API_URL`이 `erp-api.payssam.kr`이거나
`PAYMINT_API_VERSION=v1`이면 V1으로, V2 호출이 403/404/405로 거부되면 V1로 폴백.
**현재 운영은 사실상 V1(`erp-api.payssam.kr`)이다.**

### 해시 규칙 (hash.ts)

```
발송:      sha256( billId + "," + 전화번호(숫자만) + "," + 금액문자열 )
취소/파기: sha256( billId + "," + 금액문자열 )        ← 전화번호 없음
```

### 기타 제약

- **`bill_id`는 20자 이하**, 영대문자+숫자. 중복 불가(멱등키 역할)
- `expire_dt` 형식은 `YYYY-MM-DD`
- 금액은 **문자열**로 전송
- 전화번호는 숫자만(`010...`), 발송 전 `/^01[0-9]{8,9}$/` 검증
- 성공 코드는 `"0000"`
- 응답 스키마가 느슨하다 — `shortUrl`/`shortURL`, `billId`/`bill_id`, `message`/`msg`가
  섞여 오고 `data.data` 중첩도 있다. 방어적 파싱 필수 (client.ts·callback의 `pickField` 참고)

---

## 6. billId 인코딩 트릭 (이 프로젝트의 설계 — 선택)

V1 `read` 응답에는 **전화번호·상품명이 없다**. DB 없는 서버리스에서 "결제완료 → 그 고객에게 문자"
를 하려고 billId 자체에 정보를 인코딩했다 (`hash.ts`의 `generateBillId`/`decodeBillId`):

```
B + [T|C](상품 마커) + 전화번호 base36 packed 8자 + 시각 base36 + 랜덤 = 20자
```

새 프로젝트에서 DB(또는 KV)에 billId→주문 매핑을 저장할 수 있으면 이 트릭은 필요 없다.
그냥 `generateBillId()`를 인자 없이 쓰면 랜덤 ID(`BY...`)가 나온다.

---

## 7. 콜백 — 반드시 알아야 할 것

결제선생이 청구서의 `callbackUrl`로 결제 이벤트를 **POST(JSON)** 한다. 최소 구현:

```ts
// app/api/paymint/callback/route.ts (최소형)
export async function POST(request: Request) {
  const data = await request.json()
  const apiKey = data.apikey || data.apiKey            // V1은 apikey, V2는 apiKey
  if (apiKey !== process.env.PAYMINT_API_KEY) {
    return NextResponse.json({ code: "9999", msg: "unauthorized" }, { status: 401 })
  }
  // data.bill_id, data.appr_state, data.appr_price, data.appr_dt ...
  // 여기서 주문 처리 — 단, §9-3 참고: appr_state를 그대로 믿지 말 것
  return NextResponse.json({ code: "0000", msg: "성공하였습니다." })  // ← 반드시 이 형태
}
```

- 콜백 처리에 실패해도 **응답은 항상 `{code:"0000"}` 200**으로 — 아니면 결제선생이 재시도하고,
  내 쪽 부가기능(문자 등) 오류가 결제 흐름을 막게 된다. 부가 로직은 try/catch로 감싼다.
- 콜백 URL은 청구서 발송 요청에 실어 보낸다(관리자 페이지 별도 등록 불필요).
  Vercel 배포면 `PAYMINT_CALLBACK_URL` 또는 `NEXT_PUBLIC_BASE_URL`이 **공개 https**여야 한다
  (localhost로는 콜백이 안 온다 — 로컬 테스트는 dry-run으로).

---

## 8. 리컨사일 크론 (콜백 유실 안전망 — 결제 후 자동화가 있을 때만)

실운영에서 **콜백이 안 오거나, 승인 전 상태로만 오는 사례가 실제로 있었다.**
결제완료에 자동 액션(문자·권한 부여 등)이 걸려 있다면 안전망 필수:

1. 발송 시 pending 목록에 billId 등록 (이 프로젝트는 Vercel Blob `gigclass-bills` 사용 — DB 있으면 DB로)
2. `/api/paymint/reconcile?key=$RECONCILE_SECRET` 를 크론이 15분마다 GET
3. pending 건을 `readBill`로 재조회 → `appr_state === "C"`면 액션 실행 후 pending 제거
4. 7일 지난 건은 만료 처리

원본 크론: howzero 서버 crontab `*/15 * * * *`, env는 `/etc/howzero/gigclass-reconcile.env`,
로그 `/var/log/gigclass-reconcile.log`. Vercel만 쓸 거면 `vercel.json`의 crons로 대체 가능.

---

## 9. 주의사항 (실전에서 밟은 지뢰 모음) ⚠️

1. **DRY_RUN 기본값이 true다** (`config.ts`). env를 안 넣으면 실결제가 안 나가고 가짜 성공이 온다.
   운영 배포 시 `PAYMINT_DRY_RUN=false`를 **명시적으로** 넣을 것. 반대로 개발에서는 절대 false 금지.
2. **dry-run이면 자격증명 없이도 돌아간다** — "로컬에서 됐는데 운영에서 500"은 십중팔구
   운영 env에 `PAYMINT_API_KEY`/`MEMBER_ID`/`MERCHANT_ID` 누락 (`requireEnv`가 throw).
3. **콜백의 `appr_state`를 믿지 마라.** 실결제에서 승인 전 `F` 상태 콜백만 오고 끝난 사례 확인됨.
   콜백을 받으면 `readBill`로 **현재 상태를 직접 재조회**해서 `C`일 때만 완료 처리한다.
4. **서버리스에서 fire-and-forget 금지.** 응답 반환 후 미완 Promise는 죽는다(실제 유실 확인).
   콜백/발송 라우트의 후속 처리(등록·문자)는 반드시 `await`.
5. **중복 실행 대비.** 콜백 재시도 + 크론이 겹칠 수 있다 — 완료 액션은 멱등하게(1회 락) 만든다.
6. **`bill_id` 20자 제한** — 자체 ID를 쓸 거면 길이·문자셋(`A-Z0-9`) 먼저 확인.
7. **취소 vs 파기**: 결제 전 청구서는 `destroy`(파기), 결제 승인된 건은 `cancel`(승인취소).
   둘 다 발행 금액과 정확히 같은 `amount`를 줘야 hash가 맞는다.
8. **에러 메시지를 사용자에게 그대로 노출하지 마라** — 결제선생 에러에 내부 URL이 섞여 나온다.
   사용자에겐 고정 문구, 원본은 서버 로그로 (send-bill 라우트 참고).
9. **같은 번호+같은 금액 재발송**은 새 청구서 발행보다 `resendBill`(카톡 재발송)이 먼저다.
10. **API 키 = 콜백 인증 키.** 키가 새면 가짜 결제완료 콜백을 맞을 수 있다. 콜백 인증 비교
    로직을 지우지 말 것. 키는 `.env.local`/Vercel env에만 (레포·문서에 금지).
11. **금액 하드코딩 주의** — 상품 금액은 단일 출처(`lib/products.ts` 같은 카탈로그)로.
    주석에 적어둔 금액이 낡아서 사고 난 전례가 이 레포에 있다.

---

## 10. 테스트

```bash
# dry-run 상태에서 URL 발송 흐름 점검 (이 프로젝트 스크립트)
npm run test:paymint          # scripts/check-paymint-url-flow.mjs

# 수동: dev 서버 띄우고
curl -X POST localhost:3200/api/paymint/send-bill \
  -H 'Content-Type: application/json' \
  -d '{"memberName":"테스트","phoneNumber":"01012345678"}'
# dry-run이면 shortUrl: https://bill.payssam.kr/dry-run/... 이 온다
```

운영 전환 체크: ① `PAYMINT_DRY_RUN=false` ② 자격증명 3종 등록 ③ 콜백 URL 공개 https
④ 본인 번호로 소액 실발송 → 결제 → `readBill`로 `C` 확인 → `cancelBill`로 취소.

---

## 11. 참고

- 원본 운영 기록: `DEPLOY-CHECKLIST.md` (콜백/크론/실결제 검증 이력)
- 이 문서 기준 코드: `lib/paymint/client.ts`, `lib/paymint/hash.ts`, `app/api/paymint/callback/route.ts`
