# 하우제로 AX — Phase 2 (랜딩 + AI 상담 챗봇 + 리드 DB) 설계

- 작성일: 2026-07-09
- 상태: 사용자 리뷰 대기
- 선행: Phase 1 완료 (`docs/ax-business/` 12종, 브랜드=하우제로 확정)

---

## 1. 목표

자동화 고민이 있는 대표가 들어오면 **"전문 개발사/자동화 실행사"로 보이는 랜딩**에서, 메인 히어로의 **AI 채팅창**이 자동화·효율화 고민을 들어주며 자연스럽게 **contact(리드)**로 전환시킨다. 설문지 폼이 아니라 대화가 인입 경로다. 이번 Phase는 **로컬 개발·검증까지** (배포는 범위 밖).

## 2. 확정된 결정 (게이트 통과분)

- 코드 위치: **이 monorepo에 새 Next.js 앱** — `ax-web/`
- 챗봇 범위: **상담 어시스턴트 + 리드 캡처** (RAG·스코어링은 이후)
- LLM: **OpenRouter** — hypeduck의 `OPENROUTER_API_KEY` 재사용 (`ax-web/.env.local`, git 제외)
- UIUX 벤치마크: **AI TEAM(alphabrothers)** 스타일 — 큰 한글 헤드라인, 신뢰형 B2B, 사례 중심, 문제정의→설계→실행→성과측정→유지보수 플로우 (레퍼런스: 루트 `ai-team-ax-*.png`)
- 카피·소구점·질문: Phase 1 산출물 사용 — 06(메시지 뱅크)→히어로/섹션 카피, 08(디스커버리 질문)→챗봇 시스템 프롬프트, 04(페르소나)→톤

## 3. 아키텍처

**스택 (howzero-web 미러):** Next.js 16 + React 19 + Tailwind 4 + shadcn + `postgres`(npm) + Docker Postgres. 포트 **3300** (3100/3101/3200 회피).

```
ax-web/
├── docker-compose.yml          # Postgres 로컬
├── sql/schema.sql              # 테이블 3개
├── .env.example                # OPENROUTER_API_KEY, DATABASE_URL
└── src/
    ├── app/
    │   ├── page.tsx            # 랜딩 (단일 페이지, 섹션 구성)
    │   ├── api/chat/route.ts   # OpenRouter 스트리밍 프록시 + 세션/메시지 저장
    │   └── api/leads/route.ts  # 리드 저장 (챗봇 추출 + 폼 공용)
    ├── components/             # Hero(챗), 섹션들, ContactForm
    └── lib/                    # db.ts, openrouter.ts, chat-system-prompt.ts
```

### 랜딩 섹션 (ai-team 벤치마크 + Phase 1 카피)

1. **Hero** — 헤드라인(06 메시지 뱅크) + **AI 상담 채팅창**(중앙, 첫 화면에서 바로 대화 가능)
2. **신뢰 실적** — "내 회사를 먼저 자동화했다": bulsaja(연매출 10억 SaaS 운영)·hypeduck·직원 자동화 실전
3. **문제 공감** — 대표들의 반복업무 pain (05/06 근거)
4. **프로세스** — 진단→설계→구축→운영 4단계
5. **서비스/오퍼** — 무료 진단 → 착수 오딧+빌드 → 월 리테이너
6. **CTA + Contact 폼** — 챗을 안 쓰는 방문자용 최소 폼(이름/연락처/고민 한 줄)

### AI 챗봇 동작

- 시스템 프롬프트: 하우제로 페르소나(04) + 디스커버리 질문 프레임(08 — 업무 인벤토리→시간/빈도→오류 비용) + 소구점(06). "공손하고 전문적인 자동화 컨설턴트, 과장 금지, 2~3턴 안에 구체 pain 파악, 자연스럽게 연락처 요청"
- `/api/chat`: OpenRouter chat completions 스트리밍. 세션 단위로 `chat_sessions`/`chat_messages` 저장
- 리드 추출: 대화 중 연락처가 나오면 구조화 추출(같은 모델에 tool/JSON 모드)해 `leads`에 저장. 실패해도 대화는 계속 (추출은 best-effort)

### DB 스키마 (3 테이블)

```sql
chat_sessions(id, created_at)
chat_messages(id, session_id FK, role, content, created_at)
leads(id, session_id FK nullable, name, contact, company, pain_summary, source(chat|form), created_at)
```

## 4. 에러 처리

- OpenRouter 장애/키 없음 → 챗 영역에 "지금은 상담이 어려워요, 아래 폼으로 남겨주세요" + 폼 앵커 (랜딩은 챗 없이도 성립)
- DB 장애 → 챗은 동작하되 저장 skip + 서버 로그 (대화 우선)
- 리드 API: zod 검증, 실패 400

## 5. 테스트 / 검증 (Definition of Done)

- `npm run build` + `tsc --noEmit` 통과
- vitest: 리드 추출 파서, `/api/leads` 검증 로직
- E2E 수동 검증: 로컬 구동 → 챗 대화 → DB에 세션/메시지/리드 row 확인 (스크린샷)
- 카피가 Phase 1 문서와 일치 (06 메시지 뱅크 대조)

## 6. 범위 밖

배포(Vercel/서버), RAG 사례집 검색, 리드 스코어링, 알림(이메일/슬랙), 어드민 대시보드, 브랜드 로고/일러스트 제작
