# Vercel 배포 체크리스트 — braveyong-landing-v2

bulsaja Vercel 팀(`team_TJbZrrxEedAkxKUVSniHrdlr`)에 신규 프로젝트로 배포.
도메인 없이 기본 `*.vercel.app` URL만 사용.

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
