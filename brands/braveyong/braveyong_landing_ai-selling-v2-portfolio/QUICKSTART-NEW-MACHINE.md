# 새 컴퓨터에서 시작하기 — 위에서부터 그대로 따라하기

> gigclass.kr 랜딩(`braveyong_landing_ai-selling-v2-portfolio`)을 새 컴퓨터에서 받아 실행.
> 자세한 설명·트러블슈팅은 `SETUP-NEW-MACHINE.md` 참고.

---

### Step 0. 준비물 설치 확인
Git · Node.js 20 이상 · GitHub CLI(`gh`) 가 깔려 있어야 함.
```bash
git --version && node -v && npm -v
```

### Step 1. GitHub 로그인 + 계정 맞추기
```bash
gh auth login                    # 새 컴퓨터면 1회 (이미 했으면 생략)
gh auth switch -u zerowater-may
```

### Step 2. 레포 받기  ⚠️ Dropbox 폴더 _밖_에 받을 것
```bash
cd ~
git clone https://github.com/zerowater-may/howzero_threads.git howzero
cd howzero
```

### Step 3. 작업 브랜치로 이동
```bash
git checkout spec/braveyong-landing-v2-portfolio
git pull origin spec/braveyong-landing-v2-portfolio
```

### Step 4. 랜딩 폴더로 이동 + 패키지 설치
```bash
cd brands/braveyong/braveyong_landing_ai-selling-v2-portfolio
npm install
```

### Step 5. 비밀키 파일 `.env.local` 넣기  ⚠️ git에 없음 — 직접 옮겨야 함
기존 컴퓨터의 아래 파일을 안전한 채널(1Password 등)로 복사해 같은 위치에 붙여넣기:
```
brands/braveyong/braveyong_landing_ai-selling-v2-portfolio/.env.local
```
없이 새로 채우려면:
```bash
cp .env.example .env.local        # 그 다음 PAYMINT_*, NCP_SENS_* 등 실제 값 입력
```

### Step 6. 개발 서버 실행
```bash
npm run dev
```
→ 브라우저: **http://localhost:3200**  (815 특강: http://localhost:3200/815)

### Step 7. (선택) 동작 확인
```bash
npm run test:landing
npm run test:815
```

---

### 작업 끝나고 다시 올릴 때
```bash
gh auth switch -u zerowater-may
git add -A
git commit -m "작업 내용 요약"
git push origin spec/braveyong-landing-v2-portfolio
```
