# Threads API 자동화 프로젝트 전략 계획서

> **War Room 산출물** | 참여: backend-architect (Lead), security-auditor (Challenger), data-engineer
> **작성일**: 2026-02-26

---

## Executive Summary

Threads Graph API를 활용하여 댓글 수집, 자동 포스팅, 이메일 발송을 자동화하는 Python 패키지를 구축한다. AI 사용을 최소화하고 순수 Python 코드로 구현한다.

## 배경 & 현황 (팩트 기반)

- **Threads API**: `https://graph.threads.net/v1.0` (Meta Graph API 기반)
- **인증**: OAuth 2.0 + Access Token (Long-lived: 60일, 갱신 가능)
- **필수 권한**: `threads_basic`, `threads_content_publish`, `threads_manage_replies`
- **포스팅**: 2단계 (container 생성 → publish)
- **댓글 조회**: `GET /{media_id}/conversation` (커서 기반 페이지네이션)
- **Rate limit**: 250 posts / 24시간
- **Python 공식 SDK 없음** → `requests` 직접 사용
- **프로젝트 위치**: Dropbox 동기화 폴더 내 (보안 주의)

## 검토된 접근법 (Lead 초안)

### 접근법 A: 모놀리식 스크립트
- 장점: 빠른 구현 (6개 파일)
- 단점: 테스트 어려움, 확장성 부족

### 접근법 B: 모듈형 패키지 (추천)
- 장점: 단일 책임, 테스트 용이, 확장 용이
- 단점: 초기 파일 수 많음

### 접근법 C: CLI 프레임워크 (Click/Typer)
- 장점: CLI 명령어 제공
- 단점: 자동화 목적에 과도한 추상화

### 선택: 접근법 B — 이유: API 클라이언트 안정성과 파이프라인 모듈 분리가 핵심

## 실행 계획 (합의안)

### 프로젝트 구조

```
howzero/
├── src/
│   └── howzero_threads/
│       ├── __init__.py
│       ├── api/
│       │   ├── __init__.py
│       │   ├── auth.py          # TokenManager (토큰 갱신/관리)
│       │   ├── client.py        # ThreadsClient (HTTP, 토큰 새니타이징)
│       │   ├── posts.py         # 포스팅 (create, publish)
│       │   ├── comments.py      # 댓글 조회 (페이지네이션)
│       │   └── user.py          # 사용자 쓰레드 조회
│       ├── scheduler/
│       │   ├── __init__.py
│       │   └── posting.py       # APScheduler (포스팅 + 댓글 + 토큰 갱신)
│       ├── notifier/
│       │   ├── __init__.py
│       │   └── email.py         # smtplib + TLS 강제
│       ├── pipeline/
│       │   ├── __init__.py
│       │   └── comments_to_email.py  # 댓글 → 이메일 (중복방지, 요약)
│       ├── store/
│       │   ├── __init__.py
│       │   ├── state.py         # StateStore (중복 방지)
│       │   └── rate_limiter.py  # 파일 기반 RateLimiter
│       ├── exceptions.py        # ThreadsAPIError (토큰 마스킹)
│       ├── logging_config.py    # TokenMaskingFilter
│       └── config.py            # pydantic-settings 설정
├── data/                        # 상태/카운터 저장 (gitignore)
│   └── .gitkeep
├── tests/
├── scripts/
│   ├── fetch_comments.py        # CLI: 댓글 조회
│   ├── post.py                  # CLI: 수동 포스팅
│   └── run_scheduler.py         # CLI: 스케줄러 실행
├── .env.example
├── .gitignore
├── .pre-commit-config.yaml      # .env 커밋 방지
├── pyproject.toml
└── README.md
```

### Phase 1: 프로젝트 초기화
- Task 1.1: GitHub 레포 생성 (`zerowater-may/howzero_threads`)
- Task 1.2: pyproject.toml (requests, python-dotenv, apscheduler, pydantic-settings)
- Task 1.3: 디렉토리 구조 + __init__.py
- Task 1.4: .pre-commit-config.yaml (.env 커밋 방지)
- Task 1.5: data/ 디렉토리 (상태 파일 저장)

### Phase 2: API 클라이언트 핵심
- Task 2.1: config.py (pydantic-settings, app_secret optional)
- Task 2.2: exceptions.py (ThreadsAPIError, sanitize_url - access_token + client_secret 마스킹)
- Task 2.3: logging_config.py (TokenMaskingFilter)
- Task 2.4: client.py (ThreadsClient, HTTPError→ThreadsAPIError 변환, from None)
- Task 2.5: auth.py (TokenManager - 교환/갱신/영속화, 갱신 실패 시 이메일 알림)
- Task 2.6: comments.py (커서 기반 페이지네이션, hidden 필터, get_replies)
- Task 2.7: posts.py (2단계 포스팅)
- Task 2.8: user.py (사용자 쓰레드 조회)

### Phase 3: 상태 관리 + 이메일 파이프라인
- Task 3.1: state.py (StateStore - last_processed_timestamp JSON 저장)
- Task 3.2: rate_limiter.py (24시간 윈도우, 파일 영속)
- Task 3.3: email.py (smtplib + ssl.create_default_context() TLS 강제)
- Task 3.4: comments_to_email.py (중복 필터 + 대량 요약 + 발송 성공 시에만 상태 갱신)

### Phase 4: 스케줄러
- Task 4.1: posting.py (HowzeroScheduler - max_instances=1, misfire_grace_time)
  - 포스팅 잡 (cron + RateLimiter)
  - 댓글 파이프라인 잡 (interval)
  - 토큰 갱신 잡 (매일 03:00, 실패 시 이메일 알림 + 재시도)

### Phase 5: 테스트 및 마무리
- Task 5.1: 단위 테스트 (test_client, test_auth, test_comments, test_state, test_pipeline)
- Task 5.2: .env.example
- Task 5.3: 초기 커밋 및 Push

## 리스크 & 대응 (Challenger + data-engineer 분석 반영)

| # | 리스크 | 심각도 | 지적자 | 대응 |
|---|--------|--------|--------|------|
| 1 | URL 토큰 노출 | Critical | security-auditor | ThreadsAPIError + TokenMaskingFilter + sanitize_url (client_secret 포함) |
| 2 | 토큰 갱신 미구현 | Critical | security-auditor | TokenManager + 스케줄러 자동 갱신 + 실패 시 이메일 알림 |
| 3 | App Secret 관리 | Critical | security-auditor | TokenManager에만 격리, optional 처리 |
| 4 | 페이지네이션 누락 | Critical | data-engineer | 커서 기반 while 루프 |
| 5 | 중복 방지 부재 | Critical | data-engineer | StateStore timestamp 비교 |
| 6 | .env Dropbox 동기화 | Important | security-auditor | chmod 600 + pre-commit hook + .gitignore 강화 |
| 7 | SMTP TLS 미강제 | Important | security-auditor | ssl.create_default_context() |
| 8 | Rate limit 카운터 휘발성 | Important | security-auditor + data-engineer | 파일 기반 RateLimiter |
| 9 | 에러 핸들링 정보 유출 | Important | security-auditor | ThreadsAPIError (from None) |
| 10 | 파이프라인 실패 재시도 | Important | data-engineer | 발송 성공 시에만 상태 갱신 |
| 11 | 잡 중복 실행 | Important | data-engineer | max_instances=1, misfire_grace_time |
| 12 | 대량 댓글 | Important | data-engineer | 50건 초과 시 요약 포맷 |
| 13 | token.json 보안 | Important | security-auditor | .gitignore + chmod 600 |

## 전문가별 평가 요약

| 전문가 | 핵심 의견 | 반영 여부 |
|--------|----------|----------|
| backend-architect (Lead) | 모듈형 패키지 구조, 5 Phase 실행 계획 | ✅ 채택 |
| security-auditor (Challenger) | 토큰 마스킹, 갱신 자동화, .env 보안 강화 | ✅ Critical 전부 반영 |
| data-engineer | 페이지네이션, 중복 방지, 파이프라인 상태 관리 | ✅ Critical 전부 반영 |

## 토론 기록

### 주요 논쟁점
| 쟁점 | Lead | Challenger | data-engineer | 합의 |
|------|------|-----------|---------------|------|
| 토큰 저장 방식 | .env 파일 | Dropbox 동기화 위험 | - | chmod 600 + pre-commit hook |
| Rate limit 관리 | 메모리 카운터 | 휘발성 위험 | 파일 기반 필수 | JSON 파일 영속 |
| 댓글 수집 범위 | 첫 페이지 | - | 전체 페이지네이션 필수 | 커서 기반 루프 |
| 에러 핸들링 | raise_for_status | 토큰 노출 위험 | - | ThreadsAPIError (from None) |

### 반영된 개선사항
| 지적 (severity) | 지적자 | 수정 내용 |
|----------------|--------|----------|
| URL 토큰 노출 (Critical) | security-auditor | exceptions.py + logging_config.py 신규 |
| 토큰 갱신 (Critical) | security-auditor | api/auth.py TokenManager 신규 |
| 페이지네이션 (Critical) | data-engineer | comments.py while 루프 추가 |
| 중복 방지 (Critical) | data-engineer | store/state.py StateStore 신규 |
| 갱신 실패 알림 (Important) | security-auditor | 구현 시 이메일 알림 + 재시도 반영 |
| token.json 보안 (Important) | security-auditor | chmod 600 + .gitignore |

## 의존성

| 패키지 | 버전 | 용도 |
|--------|------|------|
| requests | >=2.31.0 | HTTP 클라이언트 |
| python-dotenv | >=1.0.0 | .env 파일 로드 |
| apscheduler | >=3.10.0 | 작업 스케줄링 |
| pydantic-settings | >=2.0.0 | 설정 관리/검증 |
| pytest | >=7.0 | 테스트 (dev) |
| responses | >=0.23.0 | HTTP 모킹 (dev) |
| pre-commit | >=3.0 | Git hook (dev) |

## 다음 단계
- [ ] GitHub 레포 생성 (zerowater-may/howzero_threads)
- [ ] Phase 1~5 순차 구현
- [ ] Meta Developer Portal에서 Threads API 앱 등록 + Access Token 발급
- [ ] .env 설정 후 통합 테스트
