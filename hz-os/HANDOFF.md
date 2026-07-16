# hz-os 핸드오프 — 다른 세션에서 이어서 구현하기

> 2026-07-16 기준. 새 세션은 이 파일 + `../docs/superpowers/specs/2026-07-16-hz-os-portal-design.md`(스펙)를 먼저 읽고 시작할 것.

## 0. 한 줄 요약

howzero AX 프로젝트 포털. 미팅 전사 → AI 니즈 추출 → 문서 → 고객 공유 링크 → 양방향 코멘트. **MVP 완성·E2E 통과 상태**이며, 남은 것은 아래 §4 로드맵.

## 1. 현재 상태 (완료된 것)

| 커밋 | 내용 | 검증 |
|---|---|---|
| f40cc5ba | 스펙 문서 | - |
| 6c285de4 | 파운데이션: Next 16 + Tailwind4 + shadcn 15종(다크 코발트 테마), `sql/schema.sql`, `src/lib/db.ts`(PGlite/DATABASE_URL 어댑터), `src/lib/auth.ts`(HMAC 쿠키 세션 + 공유 토큰) | build |
| 7f66115c | 인증(`/login`, `/logout`), 프로젝트 리스트(`/`)·개요(`/p/[id]`): 스텝퍼·업데이트 타임라인·공유토큰·코멘트, 서버 액션 `src/lib/actions/projects.ts` | build + curl 실동작 |
| 326dd0d5 | 문서: 트리 사이드바(`/p/[id]/docs`), 마크다운 에디터(자동저장 2초+버전 스냅샷), visibility 토글, md 내보내기(`.../export`), `md-export.ts`+테스트 | build + vitest + curl |
| 968792b2 | 미팅(`/p/[id]/meetings/[mid]`): 전사→AI 분석(OpenRouter, summary+needs)→문서 변환. 고객 뷰 `/share/[token]`(+`docs/[docId]`), 고객 질문/코멘트 서버액션(`actions/share.ts`) | build + OpenRouter 실호출 + 보안 404 확인 |
| (마지막) | README + **Playwright 실브라우저 E2E 9단계 통과** (로그인→생성→업데이트→토큰→문서 편집→공개 전환→고객 열람→고객 질문→스태프 확인) | E2E |

## 2. 실행 방법

```bash
cd hz-os
npm install
npm run dev        # http://localhost:3400
```

- 스태프 로그인: `.env.local`의 `HZOS_PASSWORD`
- AI 분석: `.env.local`의 `OPENROUTER_API_KEY`(ax-web과 동일 키), `OPENROUTER_MODEL`
- DB: 기본 PGlite(`./.pglite`, gitignore). `DATABASE_URL` 넣으면 실 Postgres 자동 전환(부팅 시 스키마 적용)
- 검증 3종: `npm test` · `npx tsc --noEmit` · `npm run build`

## 3. 함정 목록 (이번 세션에서 실제로 밟은 것들)

1. **Next 16**: `params`는 `Promise` — `const { id } = await params`. `cookies()`도 await.
2. **PGlite + Turbopack**: 번들되면 WASM 로드가 깨짐 → `next.config.ts`의 `serverExternalPackages: ["@electric-sql/pglite"]` 필수 (이미 적용됨, 지우지 말 것).
3. **PGlite 동시성/종료**: 단일 프로세스 전용. dev 서버 떠 있는 동안 다른 프로세스로 `.pglite` 열지 말 것. 종료는 SIGINT(Ctrl+C) — SIGTERM은 직전 쓰기 유실.
4. **서버 액션은 curl로 못 누름**: 액션 ID가 빌드마다 바뀜. 검증은 Playwright 실브라우저(이번에 스크립트로 성공) 또는 로직 직접 호출로.
5. **`"use server"` 파일은 async export만 허용**: 동기 유틸은 별도 파일로 (예: `meeting-analysis.ts`, `doc-content.ts`가 그렇게 분리된 이유).
6. **shadcn CLI**: `init -y`가 프리셋 프롬프트에 걸릴 수 있음 → `components.json`을 손으로 쓰고 `add --yes`가 확실.
7. **Plate 에디터**: 기본 레지스트리(`editor-basic`)에 리스트·표·코드블록 없음. 그래서 마크다운+GFM으로 감. 콘텐츠 포맷 `{"format":"md","text":"..."}`라 나중에 Plate 승격 시 마이그레이션 가능.
8. **git 커밋은 repo 루트에서**: `cd hz-os` 상태에서 `git add hz-os/...` 하면 경로 이중화로 실패.

## 4. 다음 단계 (우선순위순, step by step)

### Step 1 — 실데이터 투입 (30분, 코드 변경 없음)
왕십리 첫 미팅을 실제로 넣어 dogfooding.
1. `npm run dev` → 로그인 → 프로젝트 "이커머스 교육 기업 운영 OS" 생성
2. 미팅 생성 → 전사 붙여넣기 (전사 원문은 임시폴더라 소실 가능 — 없으면 원본 .qta를 `mlx_whisper`로 재전사: `/Users/howzero/.local/python-standalone/python/bin/mlx_whisper <wav> --model mlx-community/whisper-large-v3-turbo --language ko --condition-on-previous-text False`)
3. AI 분석 → 니즈 확인 → 문서 변환 → 다듬고 shared 전환 → 공유 링크를 고객에게 전달

### Step 2 — 실DB + 배포 (반나절)
1. Supabase 프로젝트 생성(Seoul) → Transaction pooler(6543) URI 확보
2. Vercel 새 프로젝트(hz-os), env: `DATABASE_URL`, `HZOS_PASSWORD`, `HZOS_SESSION_SECRET`(별도 랜덤 권장), `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`
3. ax-web 전례: `vercel link` 후 `vercel deploy --prod --yes`. PGlite 폴백은 Vercel에서 휘발성이므로 반드시 DATABASE_URL 설정
4. 배포 후 스모크: 로그인, 프로젝트 생성, `/share/<token>` 200, internal 문서 404

### Step 3 — 녹음 업로드 → 자동 전사 (1일)
1. 미팅 Dialog에 오디오 업로드 필드 추가 (로컬 운영 전제: 파일을 서버 로컬 임시 저장)
2. 큐 없이 단순하게: 업로드 → `ffmpeg -ac 1 -ar 16000` → `mlx_whisper` 실행(로컬 전용 스크립트, Vercel에서는 미지원 표시) → transcript 저장
3. 배포 환경용은 후속(외부 STT API 또는 로컬에서 전사 후 붙여넣기 유지)

### Step 4 — 코멘트 고도화 (반나절)
- 문서 인라인 앵커 코멘트(블록 단위 id), 코멘트 알림 표시(개요에 미확인 카운트)

### Step 5 — RBAC·멀티스태프 (후속)
- staff 계정 테이블 + 초대, 역할(admin/member). 스펙 §3 참조

## 5. 건드리지 말 것

- `ax-web/` — 별도 제품(랜딩). hz-os와 코드 공유 안 함(패턴만 복사)
- `SHOW_PRICING`, 랜딩 카피 예산 등 ax-web 결정사항 (메모리 `ax-business-howzero.md` 참조)
- 레퍼런스 제품(manyfast)은 기능 목록으로만 — 코드·디자인·문구 복제 금지 원칙 유지
