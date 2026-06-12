# Vercel 배포 체크리스트 — braveyong-landing-v2

bulsaja Vercel 팀(`team_TJbZrrxEedAkxKUVSniHrdlr`)에 신규 프로젝트로 배포.

> **2026-06 현행화**: 커스텀 도메인 **`gigclass.kr`** 연결 완료 — 공개 접근은 이 도메인 기준.
> `*.vercel.app` 배포 URL의 HTTP 401은 팀 Deployment Protection이 의도적으로 켜진 것(프리뷰 보호)이며,
> 프로덕션 공개 경로(gigclass.kr)와 무관하다. 아래 최초 배포 체크리스트의 7·9·10번은 해소됨 — "배포 기록" 참조.

## 배포 기록

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
