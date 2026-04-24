# HowZero 콘텐츠 보드 설계

> Date: 2026-04-24  
> Target repo: `/Users/zerowater/Dropbox/zerowater/howzero-dashboard`  
> Feature: HowZero/Howaaa 기본 기능으로 제공할 마케팅 콘텐츠 칸반 보드

## 1. 배경

HowZero/Howaaa는 범용 프로젝트 관리 도구가 아니라 **마케팅 에이전시 자동화 플랫폼**이다. 따라서 기본 보드는 일반 업무 칸반이 아니라, 회사별 마케팅 콘텐츠 생산과 발행 흐름을 관리하는 **콘텐츠 보드**여야 한다.

현재 `howzero-dashboard`에는 이미 다음 기반이 있다.

- `Company`: 여러 회사/워크스페이스를 선택할 수 있는 구조
- `Project`, `Issue`, `Agent`, `Approval`, `Heartbeat`, `Work Product`: Paperclip fork 기반 실행 모델
- `ui/src/components/KanbanBoard.tsx`: 기존 issue 상태 기반 칸반 컴포넌트
- `IssuesList`: list/board view toggle, filter, group, search, drag update 흐름
- 기존 issue 상태: `backlog`, `todo`, `in_progress`, `in_review`, `done`, `blocked`, `cancelled`

새 기능은 기존 issue 보드를 대체하지 않고, 그 위에 **마케팅 콘텐츠 운영 레이어**를 추가한다.

## 2. 핵심 결정

1. 화면 메뉴명은 **콘텐츠 보드**로 한다.
2. 내부 개념은 **Content DB + Views**로 잡는다.
3. `Company`는 노션의 워크스페이스처럼 동작한다.
4. `Content Item`은 콘텐츠 카드 1개다.
5. 기존 `Issue`는 콘텐츠를 만들기 위한 내부 실행 업무다.
6. 에이전트는 콘텐츠 카드를 직접 소유하지 않고, 콘텐츠 카드에 연결된 issue를 수행한다.
7. 기본 단계는 `소싱 → 기획 → 제작 → 검토 → 예약/발행 → 성과분석 → 재활용`이다.
8. `검토 → 예약/발행` 전환에는 승인 게이트가 필요하다.
9. 외부 플랫폼 실제 업로드는 MVP 범위에서 제외하고, 예약/발행 상태 관리까지만 한다.

## 3. 제품 모델

```txt
Company = 워크스페이스
Content Database = 회사별 콘텐츠 운영 DB
Content Item = 콘텐츠 카드 1개
Content View = 같은 콘텐츠 DB를 보는 저장된 뷰
Campaign = 콘텐츠를 묶는 마케팅 목적/프로젝트
Issue = 콘텐츠 실행을 위한 세부 업무/에이전트 작업
Work Product = 에이전트가 만든 산출물
Approval = 발행/중요 변경 승인 요청
```

사용자 화면의 중심 객체는 `Issue`가 아니라 `Content Item`이다.

```txt
회사 선택
  → 콘텐츠
    → 콘텐츠 보드
    → 캠페인별
    → 전체 콘텐츠
    → 발행 캘린더
    → 채널별
    → 담당자별
```

콘텐츠 카드 예시:

```txt
제목: AI 자동화 에이전시가 돈 버는 방식
콘텐츠 타입: 유튜브
채널: YouTube
단계: 기획
캠페인: 4월 리드 확보
담당: 콘텐츠 디렉터
발행 예정일: 2026-05-02 18:00
우선순위: Medium
체크리스트:
  - 레퍼런스 수집
  - 후킹 5개
  - 대본 초안
  - CTA 작성
```

## 4. 콘텐츠 타입과 단계

단계는 콘텐츠 타입별로 만들지 않는다. 모든 콘텐츠 타입이 공유하는 마케팅 생산 흐름으로 둔다.

```txt
소싱 → 기획 → 제작 → 검토 → 예약/발행 → 성과분석 → 재활용
```

콘텐츠 타입은 카드 속성이다.

```txt
youtube
shortform
carousel
blog
newsletter
linkedin
```

콘텐츠 단계 enum은 다음 값으로 고정한다.

```txt
sourcing
planning
production
review
publishing
analysis
repurpose
```

`publishing`은 화면에서 `예약/발행`으로 표시한다. MVP에서는 실제 외부 플랫폼 업로드를 하지 않고, 발행 준비/예약/발행 완료 상태를 관리한다.

타입별 차이는 카드 내부 체크리스트와 자동화 규칙으로 처리한다.

예: 유튜브 카드의 `제작` 체크리스트

```txt
- 대본 확정
- 촬영 완료
- 1차 편집
- 썸네일 제작
- 제목 후보 5개
- 업로드 세팅
```

예: 카드뉴스 카드의 `제작` 체크리스트

```txt
- 슬라이드 구성
- 본문 카피
- 디자인 시안
- 표지 문구
- CTA
```

## 5. 화면 구조

콘텐츠 보드는 노션 데이터베이스 보드처럼 보여야 한다.

### 5.1 상단 저장 뷰 탭

```txt
콘텐츠 보드
캠페인별
전체 콘텐츠
발행 캘린더
채널별
담당자별
```

MVP 기본 뷰는 `콘텐츠 보드`다. 나머지는 같은 `content_items`를 필터/그룹/정렬만 다르게 보는 저장 뷰다.

### 5.2 보드 컬럼

각 컬럼은 마케팅 운영 단계다.

```txt
소싱
기획
제작
검토
예약/발행
성과분석
재활용
```

각 컬럼 헤더에는 라벨, 컬러, 카드 수를 표시한다. 각 컬럼 하단에는 `+ 새 콘텐츠` 액션을 둔다.

### 5.3 카드 표시 정보

카드에는 최소 정보만 보여준다.

```txt
제목
콘텐츠 타입
캠페인
담당자
발행 예정일
우선순위
체크리스트 진행률
자동화 상태
```

### 5.4 카드 상세 패널

카드 클릭 시 오른쪽 상세 패널을 연다.

```txt
기본 속성
타입별 체크리스트
연결된 issue
에이전트 실행 상태
결과물
댓글/승인 요청
파생 콘텐츠
```

상세 패널의 목적은 “이 콘텐츠가 왜 이 단계에 있고, 누가 무엇을 하고 있고, 결과물이 어디 있는지”를 즉시 보여주는 것이다.

## 6. 자동화와 에이전트 실행 모델

칸반보드는 사람이 보는 운영판이고, 에이전트 실행은 기존 Paperclip/HowZero의 `issue` 흐름을 재사용한다.

```txt
콘텐츠 카드 생성
  → 타입별 체크리스트 생성
  → 단계별 자동화 규칙 대기

카드가 특정 단계로 이동
  → 해당 단계의 실행 issue 생성
  → 담당 에이전트에게 할당
  → 에이전트가 checkout
  → 결과물 생성
  → work product/comment 저장
  → 콘텐츠 카드 체크리스트 갱신
  → 조건 충족 시 다음 단계 이동 제안 또는 자동 이동
```

자동화 예시:

```txt
소싱
  - 리서처: 레퍼런스 후보 10개 수집

기획
  - 콘텐츠 디렉터: 기획안 작성
  - 라이터: 제목/후킹 5개 작성

제작
  - 라이터: 대본 초안
  - 디자이너: 썸네일 후보
  - 편집자: 편집 체크리스트

검토
  - 대표/담당자 승인 요청

예약/발행
  - 운영 에이전트: 제목/설명/태그/예약일 세팅

성과분석
  - 성과 분석가: 조회수, 클릭률, 전환, 보완점 리포트

재활용
  - 숏폼 에이전트: 쇼츠 5개
  - 카드뉴스 에이전트: 캐러셀 7장
  - 블로그 에이전트: SEO 글 1개
```

자동 이동 정책:

```txt
소싱 → 기획 → 제작 → 검토: 자동 이동 가능
검토 → 예약/발행: 사람 승인 필요
예약/발행 → 성과분석: 발행일 이후 자동 가능
성과분석 → 재활용: 자동 제안, 사람 선택
```

## 7. 데이터 모델

MVP 신규 엔티티:

```txt
content_items
content_views
content_automation_rules
content_issue_links
```

### 7.1 content_items

콘텐츠 카드 본체.

```txt
id
company_id
campaign_id
title
description
content_type
channel
stage
priority
owner_agent_id
owner_user_id
publish_at
due_at
automation_status
source_content_item_id
metadata
created_at
updated_at
```

`campaign_id`는 MVP에서 기존 `projects.id`를 참조한다. 별도 campaign 테이블은 만들지 않는다. 화면에서는 프로젝트를 마케팅 사용자 언어로 `캠페인`이라고 부른다.

`metadata`에는 MVP에서 체크리스트, 채널별 원고 속성, 외부 URL, 성과 수동 입력값을 보관한다. 체크리스트를 별도 테이블로 분리하는 것은 Phase 2로 미룬다.

`automation_status` 값:

```txt
idle
running
waiting_approval
failed
blocked
delayed
ready
```

`source_content_item_id`는 재활용 관계에 사용한다.

```txt
원본 유튜브 콘텐츠
  → 숏폼 5개
  → 카드뉴스 1개
  → 블로그 글 1개
```

### 7.2 content_views

노션식 저장된 뷰.

```txt
id
company_id
name
view_type
filters
sorts
group_by
visible_fields
is_default
created_at
updated_at
```

`view_type`:

```txt
board
table
calendar
list
```

MVP 구현은 `board`를 우선한다. 데이터 모델은 table/calendar/list 확장을 막지 않게 둔다.

### 7.3 content_automation_rules

단계별 자동화 규칙.

```txt
id
company_id
content_type
from_stage
to_stage
trigger
issue_templates
requires_approval
enabled
created_at
updated_at
```

예:

```txt
content_type: youtube
to_stage: planning
trigger: on_stage_enter
issue_templates:
  - 레퍼런스 후보 10개 수집
  - 제목/후킹 5개 작성
  - 기획안 작성
```

### 7.4 content_issue_links

콘텐츠 카드와 내부 실행 업무 연결.

```txt
id
company_id
content_item_id
issue_id
role
created_at
```

`role` 예:

```txt
sourcing
script
thumbnail
editing
review
publish
analytics
repurpose
```

## 8. API 설계

MVP API:

```txt
GET    /api/companies/:companyId/content-items
POST   /api/companies/:companyId/content-items
GET    /api/content-items/:id
PATCH  /api/content-items/:id
DELETE /api/content-items/:id

GET    /api/companies/:companyId/content-views
POST   /api/companies/:companyId/content-views
PATCH  /api/content-views/:id

POST   /api/content-items/:id/move-stage
POST   /api/content-items/:id/run-automation
GET    /api/content-items/:id/issues
GET    /api/content-items/:id/work-products
```

공유 상수/검증 변경:

```txt
CONTENT_TYPES 추가
CONTENT_STAGES 추가
CONTENT_AUTOMATION_STATUSES 추가
content item create/update/move validators 추가
```

회사 하위 화면 라우트로 `/content`를 쓰려면 `PLUGIN_RESERVED_COMPANY_ROUTE_SEGMENTS`에 `content`를 추가해 플러그인 라우트와 충돌하지 않게 한다.

단계 이동 흐름:

```txt
1. 사용자가 카드를 다른 컬럼으로 드래그
2. move-stage API 호출
3. 서버가 stage 변경 저장
4. stage enter automation rule 확인
5. 필요한 issue 생성
6. content_issue_links 생성
7. 담당 에이전트 wakeup/assignment
8. UI에서 카드 상세 패널에 진행 상태 표시
```

기존 API 재사용:

```txt
GET  /api/agents/me/inbox-lite
POST /api/issues/:issueId/checkout
PATCH /api/issues/:issueId
POST /api/issues/:issueId/comments
POST /api/issues/:issueId/work-products
POST /api/companies/:companyId/approvals
POST /api/approvals/:id/approve
POST /api/approvals/:id/reject
```

## 9. 권한과 승인

기존 `board`, `approval`, `permission` 구조를 사용한다.

MVP 권한:

```txt
content:read
content:write
content:move
content:approve_publish
content:run_automation
```

구현 시 `PERMISSION_KEYS`에 위 권한을 추가한다.

기본 정책:

```txt
Board/User
  - 콘텐츠 생성/수정
  - 단계 이동
  - 발행 승인
  - 자동화 실행/중단
  - 에이전트 결과물 승인/반려

Agent
  - 할당된 issue 수행
  - work product 생성
  - 댓글/진행 상황 보고
  - 체크리스트 완료 보고
  - 승인 요청 생성

System
  - stage enter 자동화 실행
  - issue 생성/연결
  - 발행일 이후 성과분석 단계 이동
  - 실패/지연 상태 표시
```

발행 승인 흐름:

```txt
1. 콘텐츠 카드가 검토 단계에 들어감
2. 자동화가 품질 체크 issue 생성
3. 검토 결과물이 완료됨
4. 시스템이 approval 생성
5. Board/User가 승인 또는 반려
6. 승인되면 예약/발행 단계 이동 가능
7. 반려되면 제작 또는 기획 단계로 되돌림
```

approval payload 예시:

```json
{
  "type": "content_publish",
  "contentItemId": "content_123",
  "title": "AI 에이전시 자동화 유튜브",
  "contentType": "youtube",
  "channel": "youtube",
  "publishAt": "2026-05-02T09:00:00.000Z",
  "checklistSummary": {
    "total": 8,
    "completed": 8
  },
  "workProductIds": ["wp_1", "wp_2"]
}
```

구현 시 `APPROVAL_TYPES`에 `content_publish`를 추가한다. 기존 approval 저장 구조는 그대로 쓰고, payload로 콘텐츠 정보를 담는다.

MVP에서 자동으로 하지 않는 작업:

```txt
실제 외부 플랫폼 업로드
광고비 집행
고객 승인 필요한 게시물 발행
이미 발행된 콘텐츠 삭제
```

## 10. 에러와 병목 처리

카드에 표시할 운영 상태:

```txt
정상 진행
자동화 실행 중
승인 대기
차단됨
실패
지연
발행 준비 완료
성과 수집 대기
재활용 가능
```

### 10.1 자동화 실패

처리:

```txt
카드에 실패 배지 표시
실패한 issue 링크 표시
재시도 버튼 제공
에이전트 로그/댓글 연결
```

### 10.2 체크리스트 미완료

처리:

```txt
다음 단계 이동 차단
상세 패널에서 누락 항목 표시
필요한 issue 자동 생성 제안
```

### 10.3 승인 대기

처리:

```txt
검토 컬럼에 유지
카드에 승인 대기 배지
approval 링크 표시
승인/반려 버튼
```

### 10.4 발행 지연

처리:

```txt
지연 배지
담당자/에이전트에게 알림
발행 완료 처리 또는 일정 변경 CTA
```

### 10.5 성과 데이터 없음

처리:

```txt
성과분석 컬럼에서 데이터 대기 표시
수동 입력 또는 API 연결 안내
성과분석 issue 생성
```

## 11. UI 구현 방향

기존 `KanbanBoard.tsx`는 issue 상태 기반이다. 콘텐츠 보드는 별도 컴포넌트로 시작하는 것이 안전하다.

권장 컴포넌트:

```txt
ContentBoardPage
ContentViewTabs
ContentBoard
ContentColumn
ContentCard
ContentDetailPanel
ContentChecklist
ContentAutomationPanel
```

기존 `IssuesList`와 `KanbanBoard`의 패턴은 참고한다.

재사용할 수 있는 것:

```txt
@dnd-kit drag/drop 패턴
queryKeys 패턴
api client 패턴
StatusBadge/PriorityIcon/Identity류 UI 구성
approval/work product 상세 연결 방식
```

분리해야 하는 것:

```txt
Issue status 컬럼과 content stage 컬럼
Issue 카드와 content 카드
Issue 상세와 content 상세 패널
```

## 12. 테스트와 검증

### 12.1 데이터 모델 테스트

```txt
content_item 생성
content_item 단계 변경
source_content_item_id로 재활용 관계 생성
content_view 저장/조회
content_issue_link 생성/조회
```

### 12.2 API 테스트

```txt
GET /companies/:companyId/content-items
POST /companies/:companyId/content-items
PATCH /content-items/:id
POST /content-items/:id/move-stage
POST /content-items/:id/run-automation
GET /content-items/:id/issues
```

검증:

```txt
회사별 데이터 격리
권한 없는 사용자의 수정 차단
존재하지 않는 company/content 처리
잘못된 stage 값 거부
```

### 12.3 자동화 규칙 테스트

```txt
content_automation_rules 조회
issue_templates 기반 issue 생성
content_issue_links 생성
담당 에이전트 할당
중복 실행 방지
```

중요 케이스:

```txt
같은 단계에 두 번 들어가도 issue 중복 생성 안 됨
automation rule disabled면 실행 안 됨
issue 생성 실패 시 stage 변경은 유지하고 automationStatus=failed로 표시
```

### 12.4 UI 테스트

```txt
콘텐츠 보드 렌더링
컬럼별 카드 수 표시
카드 드래그 시 stage 업데이트
카드 클릭 시 상세 패널 열림
상세 패널에서 체크리스트/연결 issue/결과물 표시
```

### 12.5 승인 게이트 테스트

```txt
검토 → 예약/발행 이동 시 approval 생성
approval 승인 전에는 발행 단계 확정 불가
approval 승인 후 이동 가능
approval 반려 시 제작/검토로 되돌림
```

### 12.6 회귀 테스트

```txt
기존 issue 보드 계속 작동
기존 project detail issue list 계속 작동
기존 agent checkout 계속 작동
기존 approval API 계속 작동
```

Playwright 확인 화면:

```txt
회사 선택
콘텐츠 메뉴 진입
콘텐츠 보드 표시
새 콘텐츠 생성
카드 단계 이동
상세 패널 확인
검토 단계에서 승인 요청 확인
```

## 13. MVP 범위

포함:

```txt
회사별 콘텐츠 DB
콘텐츠 보드 기본 뷰
콘텐츠 카드 생성/수정/삭제
단계 이동
카드 상세 패널
타입별 체크리스트
콘텐츠와 issue 연결
단계 진입 자동화 규칙
발행 승인 게이트
재활용 콘텐츠 생성 관계
```

제외:

```txt
외부 플랫폼 실제 업로드
광고 집행
완전한 노션식 커스텀 DB 엔진
사용자 정의 컬럼/속성 빌더
복잡한 권한 매트릭스
성과 API 자동 연동
```

## 14. 구현 리스크

1. 기존 `Issue`를 콘텐츠 카드로 재사용하면 빠르지만 수명이 달라져 향후 확장을 막는다.
2. 처음부터 범용 노션 DB 엔진을 만들면 MVP가 커진다.
3. 발행 자동화를 너무 일찍 실제 외부 API까지 연결하면 실수 비용이 커진다.
4. 자동화 실패와 단계 이동 실패를 하나로 묶으면 UX가 답답해진다.
5. 기존 issue 보드와 콘텐츠 보드를 같은 컴포넌트로 과도하게 합치면 양쪽 요구가 충돌한다.

## 15. 최종 방향

MVP는 **콘텐츠 DB를 1급 객체로 추가하고, 기존 issue/agent/approval/work-product 런타임을 실행 엔진으로 재사용**한다.

```txt
사용자: 콘텐츠 보드에서 콘텐츠 생산 흐름을 본다.
시스템: stage 변경과 automation rule로 내부 issue를 만든다.
에이전트: issue를 checkout해서 작업한다.
결과물: work product/comment로 남고 콘텐츠 카드에 연결된다.
승인자: 검토 이후 발행 전 approval을 승인/반려한다.
```

이 구조가 HowZero의 마케팅 에이전시 자동화 플랫폼 정체성과 기존 Paperclip fork 구조를 가장 적게 충돌시킨다.
