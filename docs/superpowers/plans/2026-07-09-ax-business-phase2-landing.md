# 하우제로 AX Phase 2 (ax-web 랜딩+챗봇+리드DB) Implementation Plan

> 스펙: `docs/superpowers/specs/2026-07-09-ax-business-phase2-landing-design.md` (승인: "될때까지 다해줘" 2026-07-09)

**Goal:** `ax-web/` — 히어로 AI 상담 챗봇이 리드를 수집하는 하우제로 AX 랜딩을 로컬에서 E2E 동작시킨다.

**Architecture:** Next.js 16 + React 19 + Tailwind 4 단일 랜딩 + API 2개(chat 스트리밍/leads) + Docker Postgres 3테이블. 카피는 docs/ax-business 04/06/08에서.

**Tech:** howzero-web 스택 미러 (`postgres` npm, zod). OpenRouter 키: `hypeduck-saas-server/development.env` → `ax-web/.env.local` (gitignore).

---

### Task 1: 스캐폴드 + 인프라
- [x] `ax-web/` package.json(next 16.1.6/react 19.2.3/tailwind 4/postgres/zod/vitest), tsconfig, next.config, postcss, globals.css
- [x] docker-compose.yml — Postgres 16-alpine, 포트 **5434** (howzero-web 5433 회피), DB `axweb`
- [x] `sql/schema.sql` — chat_sessions / chat_messages / leads (스펙 §3)
- [x] `.env.example` + `.env.local`(키 복사, git 제외), dev 포트 **3300**
- [x] 검증: `npm install` 성공, `docker compose up -d` + psql로 테이블 확인

### Task 2: lib + API
- [x] `src/lib/db.ts` — postgres 클라이언트 (lazy, DATABASE_URL 없으면 null → 저장 skip)
- [x] `src/lib/openrouter.ts` — chat completions 스트리밍 fetch 프록시
- [x] `src/lib/prompt.ts` — 시스템 프롬프트 (04 페르소나 + 08 디스커버리 프레임 + 06 소구점) + 리드 추출 프롬프트
- [x] `src/app/api/chat/route.ts` — 세션 upsert → 메시지 저장 → OpenRouter 스트리밍 → 어시스턴트 응답 저장 → best-effort 리드 추출
- [x] `src/app/api/leads/route.ts` — zod 검증 → INSERT. 실패 400
- [x] 검증: vitest (리드 payload zod, 추출 파서), curl로 /api/leads 200/400

### Task 3: 랜딩 UI (frontend-design 스킬 적용)
- [x] 섹션 6개: HeroChat / 실적 / pain 공감 / 프로세스 4단계 / 오퍼 3단 / CTA+폼
- [x] 카피는 06 메시지 뱅크·04 서사 그대로 사용 (창작 금지, 문서가 원본)
- [x] AI TEAM 벤치마크 톤: 큰 한글 헤드라인, 신뢰형 B2B, 넉넉한 여백
- [x] 검증: `npx tsc --noEmit` + `npm run build` 통과

### Task 4: E2E 검증 + 리뷰
- [x] dev 서버(3300) 기동 → 챗 대화 → DB에 session/messages/lead row 확인
- [x] OpenRouter 장애 시 폼 폴백 동작 확인 (키 제거 상태 테스트)
- [x] 멀티에이전트 코드리뷰 workflow → 확정 이슈 수정
- [x] 커밋 (단계별)

---

## 실행 노트 (2026-07-09)

- **계획 변경**: 이 머신에 Docker/로컬 Postgres 없음 → 로컬 DB를 **PGlite(임베디드 Postgres)** 로 대체. 같은 `sql/schema.sql` 그대로 사용, `docker-compose.yml`은 배포 시점용으로 유지. `src/lib/db.ts`에 교체 경로 주석.
- **E2E 실측**: 챗 스트리밍 + 세션 저장(x-session-id) + **리드 자동 추출**(대화에서 이름/회사/연락처/pain 요약 → `leads` source='chat') + 폼 저장(source='form') + 키 없음 503 폴백 전부 동작 확인. vitest 9/9, tsc 0 err, build 통과.
- **디자인 셀프 크리틱 반영**: 한글 `word-break: keep-all`, "오렌지=숫자 전용" 규칙 위반 카드 2건 수정, 챗 응답 마크다운 서식 금지 프롬프트 추가.
- **코드리뷰 (에이전트 17개, 3관점+적대적 검증)**: 확정 14건(중복 포함, 유니크 8건) 전부 수정 — per-IP rate limit(chat 10/분·leads 5/분), LLM 추출 리드 검증(길이 제약 + 연락처가 고객 발화에 실존하는지 확인 = 프롬프트 인젝션 방어), getDb rejected promise 캐시 해제, 스트림 disconnect 시에도 저장·리드추출 실행 + upstream cancel, 스트림 내 error 이벤트 폴백, HeroChat 실패 롤백 + maxLength, 가짜 sessionId FK 방어. PGlite 다중 프로세스 한계는 README에 문서화. 수정 후 vitest 12/12·tsc·build·E2E(챗/429/가짜세션) 재검증 통과.
