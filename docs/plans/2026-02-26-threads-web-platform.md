# Threads API 관리 플랫폼 전략 계획서

> **War Room 산출물** | 참여: backend-architect (Lead), security-auditor (Challenger), frontend-engineer
> **작성일**: 2026-02-26

---

## Executive Summary

Threads API 연동 웹 플랫폼을 Next.js + shadcn/ui + TypeScript로 구축한다. 멀티 Threads 계정 관리, 예약 포스팅, 댓글 자동추출 → 이메일 발송을 하나의 대시보드에서 제공한다. 스케줄링은 BullMQ + Redis Worker 방식으로 구현하며, Docker Compose로 VPS에 배포한다.

## 배경 & 현황 (팩트 기반)

- 기존 Python 기반 `howzero_threads` 패키지가 동작 중 (API 클라이언트, 토큰 관리, 댓글 조회, 이메일 발송, APScheduler)
- Threads API: OAuth 2.0, 60일 토큰, 250 posts/24h, DM 미지원, auto_publish_text 지원
- 프론트엔드 없음 — CLI/스크립트로만 운용 중

## 검토된 접근법 (Lead 초안)

### 접근법 A: Next.js Monolith + BullMQ Worker (★ 선택)
- Next.js App Router + API Routes + Prisma/PostgreSQL + BullMQ/Redis + 별도 Worker
- **장점**: 스케줄링 정밀도(밀리초), 재시도/백오프 내장, 동시성 제어, 수평 확장, Bull Board 모니터링
- **단점**: Redis 추가 인프라, Worker 별도 관리, Vercel 배포 불가

### 접근법 B: Vercel Cron (Serverless)
- **장점**: 인프라 관리 없음, git push 배포
- **단점**: 1분 단위 폴링(59초 지연), 함수 실행시간 제한, 동시성 제어 직접 구현

### 접근법 C: Next.js + Fastify 분리
- **장점**: 프론트/백 독립 배포, node-cron 인프로세스
- **단점**: 2서버 관리, CORS, 타입 동기화, 수평확장 시 중복실행

### 선택: 접근법 A — 이유: 스케줄링이 핵심 요구사항이며 BullMQ가 delayed/repeatable/retry를 모두 제공

---

## 기술 스택 (합의안)

```
# 런타임/프레임워크
next 15.x, react 19.x, typescript 5.x

# DB/ORM
prisma 6.x (PostgreSQL), ioredis 5.x

# 스케줄링
bullmq 5.x

# 인증
bcryptjs 2.x (rounds=12), jose 5.x (Edge 호환 JWT)

# 암호화
Node.js crypto 내장 (AES-256-GCM + 키 버전 관리)

# 이메일
nodemailer 6.x

# UI
shadcn/ui (@radix-ui/*), tailwindcss 4.x
@tanstack/react-query 5.x, @tanstack/react-table 8.x
react-hook-form 7.x, zod 3.x, @hookform/resolvers
zustand 5.x, sonner 2.x, lucide-react

# Rate Limiting
Redis sliding window (커스텀)

# DevDeps
tsx, vitest, @testing-library/react
```

---

## DB 스키마 (Prisma)

| 테이블 | 목적 |
|--------|------|
| User | 사용자 (email, passwordHash, isAdmin) |
| RefreshToken | JWT Refresh Token 해시 저장 (C1) |
| InviteCode | 회원가입 초대 코드 (C4) |
| ThreadsAccount | Threads 계정 (암호화된 토큰, v1:iv:ct:tag 형식) |
| ScheduledPost | 예약 포스팅 (PENDING→PROCESSING→PUBLISHED/FAILED) |
| CommentPipeline | 댓글 자동수집 파이프라인 설정 |
| SmtpSetting | SMTP 설정 (암호화) |
| EmailLog | 이메일 발송 이력 |
| RateLimitEntry | Threads API Rate Limit 추적 |

---

## 프로젝트 구조

```
howzero-web/
├── src/
│   ├── app/
│   │   ├── layout.tsx, loading.tsx, error.tsx
│   │   ├── page.tsx                          # 대시보드
│   │   ├── (auth)/ login, register
│   │   ├── accounts/page.tsx                 # Threads 계정 관리
│   │   ├── posts/
│   │   │   ├── page.tsx, new/page.tsx
│   │   │   └── [postId]/comments/page.tsx    # 중첩 라우트 (F1)
│   │   ├── pipelines/page.tsx
│   │   ├── emails/page.tsx
│   │   ├── settings/page.tsx
│   │   └── api/
│   │       ├── auth/ (register, login, logout, refresh)
│   │       ├── threads/ (authorize, callback, accounts, [accountId]/*)
│   │       ├── schedule/ (posts, pipelines)
│   │       ├── emails/, settings/
│   │       └── admin/invite-codes/
│   ├── middleware.ts                         # matcher 기반 JWT 검증 (F5+C1)
│   ├── lib/
│   │   ├── auth.ts                           # Access/Refresh 이중 토큰 (C1)
│   │   ├── crypto.ts                         # AES-256-GCM 키 버전 관리 (C2)
│   │   ├── rate-limit.ts                     # Redis sliding window (C4+I5)
│   │   ├── threads/ (client, oauth, token-manager, posts, comments)
│   │   ├── email/sender.ts
│   │   └── queue/ (connection, producers, types)
│   ├── components/
│   │   ├── ui/                               # shadcn/ui
│   │   ├── layout/ (sidebar, header)
│   │   ├── shared/ (data-table, skeleton-table, empty-state, media-upload)
│   │   ├── accounts/, posts/, comments/
│   ├── hooks/ (use-posts, use-accounts, use-pipelines, use-auth)
│   ├── schemas/ (auth, post, pipeline, settings)  # Zod (F3)
│   ├── stores/ui-store.ts                    # Zustand (FI4)
│   ├── providers/query-provider.tsx          # React Query (F2)
│   └── worker/
│       ├── index.ts
│       └── processors/ (scheduled-post, comment-pipeline, token-refresh)
├── prisma/ (schema.prisma, migrations/)
├── scripts/rotate-encryption-key.ts          # 키 로테이션 (C2)
├── docker-compose.yml                        # Redis requirepass + 내부 네트워크 (I6)
└── package.json
```

---

## 실행 계획 (합의안)

### Phase 0: 프로젝트 초기화
- Next.js 프로젝트 생성 (App Router, TypeScript, Tailwind)
- 핵심 의존성 설치 (prisma, bullmq, jose, react-query, react-hook-form, zod, zustand, sonner)
- shadcn/ui init + 기본 컴포넌트 설치
- Docker Compose (PostgreSQL + Redis requirepass + AOF + 내부 네트워크)
- Prisma 스키마 + 초기 마이그레이션

### Phase 1: 인증 시스템
- Access/Refresh 이중 토큰 (jose, 15분/7일 TTL) (C1)
- Refresh Token Rotation + DB 해시 저장 (C1)
- 초대 코드 기반 회원가입 + ALLOW_REGISTRATION 플래그 (C4)
- IP Rate Limiting (Redis sliding window) (C4)
- middleware.ts matcher 기반 보호 (F5)
- Cookie 속성: httpOnly, Secure, SameSite=lax (I4)
- bcrypt rounds=12 (I1)

### Phase 2: Threads OAuth + 계정 관리
- OAuth state CSRF 보호 (Redis GETDEL + httpOnly cookie 이중 검증) (C3)
- AES-256-GCM 키 버전 암호화 (v1:iv:ct:tag) (C2)
- 토큰 교환 (authorization_code → short-lived → long-lived)
- 계정 CRUD API + UI

### Phase 3: 핵심 기능 API
- 예약 포스팅 CRUD + BullMQ delayed job
- 댓글 파이프라인 CRUD + BullMQ repeatable job
- 이메일 발송 (nodemailer) + 발송 이력
- SMTP 설정 CRUD (암호화 저장)
- API Rate Limiting (I5)
- Zod 스키마 검증 (F3)

### Phase 4: Worker 프로세스
- Worker 전용 DB 유저 (최소 권한) (I2)
- scheduled-post processor: 예약 시각 도달 → Threads API 발행
- comment-pipeline processor: 주기적 댓글 수집 → 이메일 추출 → 발송
- token-refresh processor: 매일 03:00 → 7일 전 자동 갱신 + 실패 시 사용자 알림 (I3)

### Phase 5: UI 구현
- 레이아웃 (사이드바 + 헤더)
- React Query hooks + 조건부 폴링 (F2, F4)
- DataTable (TanStack Table) 공통 컴포넌트 (FI1)
- Skeleton/Empty State/Error State (FI2)
- 폼: react-hook-form + zod (F3)
- 미디어 업로드 컴포넌트 (FI3)
- Zustand UI 상태 (FI4)
- 대시보드, 계정, 포스트, 댓글, 이메일, 설정 페이지

### Phase 6: 배포
- Dockerfile (Multi-stage build)
- docker-compose.production.yml (app + worker + postgres + redis)
- Worker: Docker restart: unless-stopped
- 키 로테이션 스크립트 (C2)

---

## 리스크 & 대응 (Challenger + 전문가 분석 반영)

| # | 리스크 | 심각도 | 지적자 | 대응 |
|---|--------|--------|--------|------|
| 1 | Redis 장애 시 잡 유실 | Critical | 초안 | AOF 영속화 + DB 이중 기록 |
| 2 | 암호화 키 유출 | Critical | security-auditor | 키 버전 관리 + 로테이션 스크립트 |
| 3 | JWT 탈취 | Critical | security-auditor | 15분 TTL + Refresh Rotation + 전체 무효화 |
| 4 | OAuth CSRF | Critical | security-auditor | state 이중 검증 (Redis GETDEL + Cookie) |
| 5 | 대량 가입 남용 | Critical | security-auditor | 초대 코드 + IP Rate Limiting |
| 6 | 토큰 만료 미감지 | Critical | security-auditor | Worker 갱신 + 401 즉시 갱신 + 사용자 알림 |
| 7 | Worker 비정상 종료 | Important | 초안 | Docker restart + graceful shutdown |
| 8 | DB 커넥션 풀 고갈 | Important | security-auditor | Worker 전용 DB 유저 + PgBouncer |
| 9 | Redis 무인증 접근 | Important | security-auditor | requirepass + Docker 내부 네트워크 |

---

## 전문가별 평가 요약

| 전문가 | 핵심 의견 | 반영 여부 |
|--------|----------|----------|
| backend-architect (Lead) | BullMQ+Redis 스케줄링, Prisma/PostgreSQL, 6단계 실행 계획 | ✅ 기반 채택 |
| security-auditor (Challenger) | JWT Revocation, 암호화 키 로테이션, OAuth CSRF, 회원가입 보호 | ✅ Critical 4건 모두 반영 |
| frontend-engineer | React Query, react-hook-form+zod, 중첩 라우트, DataTable, 조건부 폴링 | ✅ Critical 5건 모두 반영 |

## 토론 기록

### 주요 논쟁점
| 쟁점 | Lead | Challenger | 합의 |
|------|------|-----------|------|
| JWT 방식 | stateless JWT | Revocation 필수 | Access(15분)+Refresh(7일) 이중 구조 |
| 암호화 키 | 단일 env 변수 | 키 로테이션 필수 | 버전 prefix + 마이그레이션 스크립트 |
| OAuth callback | code만 처리 | state CSRF 필수 | Redis GETDEL + Cookie 이중 검증 |
| 회원가입 | 오픈 가입 | 보호 필수 | 초대 코드 + Rate Limiting |
| 상태관리 | Server Components | React Query 필요 | @tanstack/react-query 채택 |

### 반영된 개선사항
| 지적 (severity) | 지적자 | 수정 내용 |
|----------------|--------|----------|
| C1: JWT Revocation (Critical) | security-auditor | Access/Refresh 이중 토큰 + DB 해시 |
| C2: 암호화 키 SPOF (Critical) | security-auditor | 키 버전 prefix + 로테이션 스크립트 |
| C3: OAuth CSRF (Critical) | security-auditor | state 이중 검증 + GETDEL |
| C4: 회원가입 무방비 (Critical) | security-auditor | 초대 코드 + IP Rate Limiting |
| F1: 동적 라우트 (Critical) | frontend-engineer | posts/[postId]/comments 중첩 |
| F2: 서버 상태 관리 (Critical) | frontend-engineer | @tanstack/react-query |
| F3: 폼 처리 (Critical) | frontend-engineer | react-hook-form + zod |
| F4: 실시간 업데이트 (Critical) | frontend-engineer | 조건부 폴링 (refetchInterval) |
| F5: 인증 미들웨어 (Critical) | frontend-engineer | middleware.ts matcher |

## Challenger 최종 판정
- C1: ✅ 해결됨 — 공격 창 15분, Rotation, 즉시 무효화
- C2: ✅ 해결됨 — 키 버전 내장, 점진적 재암호화
- C3: ✅ 해결됨 — GETDEL 원자적 검증, OWASP 충족
- C4: ✅ 해결됨 — 다층 보호 (플래그 + 초대코드 + Rate Limit)

---

## 다음 단계
- [ ] Next.js 프로젝트 생성 + 의존성 설치
- [ ] Docker Compose 환경 구성
- [ ] Prisma 스키마 적용 + 마이그레이션
- [ ] Phase 1~6 순차 구현
