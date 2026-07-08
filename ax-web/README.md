# ax-web — 하우제로 AX 랜딩

히어로 AI 상담 챗봇(OpenRouter)이 리드를 수집하는 랜딩. 스펙: `../docs/superpowers/specs/2026-07-09-ax-business-phase2-landing-design.md`

## 실행

```bash
cp .env.example .env.local   # OPENROUTER_API_KEY 채우기 (hypeduck-saas-server/development.env 참조)
npm install
npm run dev                  # http://localhost:3300
```

DB는 **PGlite**(임베디드 Postgres, `./.pglite/`) — 별도 설치 불필요. 스키마는 서버 기동 시 자동 적용(`sql/schema.sql`, IF NOT EXISTS).

## 주의 — PGlite 동시성

PGlite는 **단일 프로세스 전용**이다. dev 서버가 떠 있는 동안 다른 프로세스(스크립트, 두 번째 서버)가 같은 `.pglite/`를 열면 데이터가 손상될 수 있다. 리드 확인은 서버를 내리고 하거나 읽기 전용으로 짧게:

```bash
node -e "const {PGlite}=require('@electric-sql/pglite');new PGlite('./.pglite').query('SELECT source,name,contact,company,pain_summary,created_at FROM leads ORDER BY id DESC').then(r=>console.table(r.rows))"
```

실 Postgres로 옮길 때: `docker-compose.yml`(포트 5434) + `src/lib/db.ts`를 `postgres` npm 클라이언트로 교체.

## 구조

- `src/app/page.tsx` — 랜딩 6섹션 (카피 원천: `../docs/ax-business/04·06·07·10`)
- `src/components/HeroChat.tsx` — 진단 콘솔 챗 (스트리밍)
- `src/app/api/chat/route.ts` — OpenRouter 프록시 + 세션/메시지 저장 + 리드 자동 추출
- `src/app/api/leads/route.ts` — 폼 리드 저장
- `src/lib/prompt.ts` — 시스템 프롬프트(04 페르소나 + 08 디스커버리 프레임) + 리드 추출
- rate limit: 인메모리 per-IP (chat 10/분, leads 5/분) — 스케일아웃 시 WAF/Redis로

## 테스트 / 검증

```bash
npm test          # vitest — 파서/rate limit
npx tsc --noEmit
npm run build
```
