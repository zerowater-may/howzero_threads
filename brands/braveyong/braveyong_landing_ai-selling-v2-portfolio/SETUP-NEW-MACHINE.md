# 다른 컴퓨터에서 셋업하기 (gigclass.kr 랜딩)

> 용팀장 AI셀링 랜딩(`braveyong_landing_ai-selling-v2-portfolio`, 배포 도메인 **gigclass.kr**)을
> 새 컴퓨터에서 받아 작업·실행하기 위한 단계별 가이드.

## 핵심 정보 요약

| 항목 | 값 |
|---|---|
| GitHub 레포 | `https://github.com/zerowater-may/howzero_threads.git` (PUBLIC) |
| 작업 브랜치 | `spec/braveyong-landing-v2-portfolio` |
| 랜딩 경로 | `brands/braveyong/braveyong_landing_ai-selling-v2-portfolio` |
| 프레임워크 | Next.js 15 + shadcn/ui + Tailwind v4 |
| 패키지 매니저 | **npm** (pnpm/yarn 아님) |
| dev 포트 | **3200** (`http://localhost:3200`) |
| push 권한 계정 | **`zerowater-may`** |

---

## ⚠️ 먼저 알아둘 2가지

1. **커밋 + push된 것만 넘어온다.** 기존 컴퓨터에서 작업 후 `git commit` + `git push`를
   먼저 해야 새 컴퓨터에서 `git pull` 시 최신본을 받는다.
2. **비밀키(`.env.local`)는 git에 없다.** 결제선생(PAYMINT)·네이버 SENS 키가 들어있는
   `.env.local`은 `.gitignore` 대상이라 clone으로 안 따라온다 → **따로 옮겨야** 한다 (Step 5).

---

## Step 0. 사전 준비물

- **Git**, **Node.js 20 LTS 이상** (Next.js 15라 18.18+ 필수, 20 권장), **GitHub CLI(`gh`)**
- 설치 확인:
  ```bash
  git --version && node -v && npm -v
  ```

## Step 1. GitHub 로그인 + 계정 맞추기

```bash
gh auth login          # 새 컴퓨터면 1회 실행 / 이미 했으면 생략
gh auth switch -u zerowater-may
```
> 레포는 PUBLIC이라 clone/pull은 로그인 없이도 되지만, **push는 `zerowater-may` 계정**이어야 한다.

## Step 2. 레포 clone (처음인 경우)

```bash
cd ~                   # 원하는 위치 (Dropbox 폴더 밖 권장 — 아래 주의 참고)
git clone https://github.com/zerowater-may/howzero_threads.git howzero
cd howzero
```
> 이미 clone돼 있으면 대신: `cd howzero && git fetch origin`

## Step 3. 작업 브랜치로 이동

작업물은 `main`이 아니라 이 브랜치에 있다.

```bash
git checkout spec/braveyong-landing-v2-portfolio
git pull origin spec/braveyong-landing-v2-portfolio
```

## Step 4. 패키지 설치

```bash
cd brands/braveyong/braveyong_landing_ai-selling-v2-portfolio
npm install
```

## Step 5. 환경변수 `.env.local` 만들기

git에 없으니 직접 만들어야 한다. 둘 중 하나:

**(A) 기존 컴퓨터의 `.env.local`을 그대로 옮기기 (권장)**
- 기존 컴퓨터의
  `brands/braveyong/braveyong_landing_ai-selling-v2-portfolio/.env.local` 파일을
- 1Password / 비밀번호 매니저 보안노트 등 **안전한 채널**로 복사해 같은 위치에 붙여넣기

**(B) 템플릿에서 새로 채우기**
```bash
cp .env.example .env.local
# .env.local 열어서 실제 값 입력
```
채워야 할 주요 키:
- `PAYMINT_*` — 결제선생(청구서 발행)
- `NCP_SENS_*` — 네이버 SENS(문자 발송)
- `NEXT_PUBLIC_*` — 사이트 URL·GA4 등 공개 설정

## Step 6. 개발 서버 실행

```bash
npm run dev
```
→ 브라우저에서 **`http://localhost:3200`**
- `/815` 통관 특강 페이지 → `http://localhost:3200/815`

## Step 7. (선택) 동작 검증

```bash
npm run test:landing    # 랜딩 구조 체크
npm run test:815        # 815 특강 페이지 + 결제 흐름 체크
npm run test:paymint    # 결제선생 URL 흐름 체크
```

---

## 작업 후 다시 push할 때

```bash
gh auth switch -u zerowater-may          # 계정 확인
git add -A
git commit -m "작업 내용 요약"
git push origin spec/braveyong-landing-v2-portfolio
```

---

## ⚠️ 주의: 대용량 raw 미디어 & Dropbox

- 이 레포는 **원본 영상/통화녹음 같은 대용량 raw 미디어를 git에 넣지 않는다.**
  GitHub 100MB 제한 때문이며, `.gitignore`로 제외돼 있다 (예: `source/highres/`,
  `yt-highlights/*.mp4`, 통화녹음 m4a). 이 원본들은 **Dropbox로만 동기화**된다.
- 그래서 기존 컴퓨터와 새 컴퓨터가 **같은 Dropbox 계정**이면 원본 미디어는 Dropbox가 옮겨준다.
- **단, git clone은 Dropbox 폴더 _밖_에 하라.** Dropbox 폴더 안에 clone하면 Dropbox가
  `.git` 내부를 실시간 동기화하면서 저장소가 손상될 수 있다.

## 트러블슈팅

| 증상 | 원인 / 해결 |
|---|---|
| push 시 `Repository not found` | 계정 불일치 → `gh auth switch -u zerowater-may` 후 재시도 |
| push 시 `Large files detected` (100MB 초과) | 대용량 파일이 커밋에 섞임 → `git rm --cached <파일>` 후 `.gitignore`에 추가, 재커밋 |
| `npm run dev` 후 페이지 빈 화면/에러 | `.env.local` 누락 → Step 5 확인 |
| 포트 충돌 | dev 포트는 3200. 점유 중이면 해당 프로세스 종료 |
