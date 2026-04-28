# Content Card Stage Collaboration Flow Design

> Date: 2026-04-28  
> Repo: `/Users/zerowater/Dropbox/zerowater/howzero-dashboard`  
> Worktree: `/Users/zerowater/.config/superpowers/worktrees/howzero-dashboard/howaaa-trends-redesign-impl`  
> Diagram: `docs/superpowers/specs/2026-04-28-content-card-stage-collaboration-flow.excalidraw.md`  
> Depends on:
> - `docs/superpowers/specs/2026-04-27-howaa-actor-workforce-collaboration-design.md`
> - `docs/superpowers/specs/2026-04-27-content-detail-board-redesign-design.md`
> - `doc/plans/2026-02-20-issue-run-orchestration-plan.md`
> - `doc/plans/2026-04-24-content-board.md`

---

## 1. 목적

콘텐츠 카드 하나를 작은 협업룸으로 보고, 사람과 AI가 같은 담당자 문법으로 참여하는 전체 흐름을 정의한다.

핵심 목표:

```txt
콘텐츠 소스
→ 카드 생성
→ 사람/AI 담당자 초대
→ 단계별 작업
→ 단계 검증 Gate
→ 다음 단계 이동
→ 모든 전략/작업/활동/HOWAAA 근거를 기존 기록 원장에 보존
```

이 문서는 화면 설계가 아니라 **제품 흐름의 기준 문서**다. UI는 `content-detail-board-redesign-design.md`를 따르고, Actor/Task/Output/Activity/Approval 문법은 `howaa-actor-workforce-collaboration-design.md`를 따른다.

---

## 2. 핵심 원칙

### 2.1 AI는 버튼이 아니라 담당자다

```txt
나 = Actor
팀원 = Actor
대표 = Actor
Howaaa = Actor
Codex = Actor
썸네일 QA = Actor
```

카드에는 사람과 AI가 같은 `participants` 문법으로 초대된다. 차이는 `type`, `permission`, `budget`, `autonomy`, `instruction`에서만 난다.

### 2.2 카드 단계 이동은 검증 후에만 가능하다

단계 탭을 보는 것과 실제 카드 stage를 이동하는 것은 다르다.

```txt
단계 탭 클릭 = 워크스페이스 보기
단계 이동 = Gate 검증 + 필요 승인 + activity 기록
```

### 2.3 AI 기록은 HOWAAA/Howaa 기존 원장에 귀속된다

AI 전략, 작업내역, 실행 상태, 활동, 산출물, 지시/스킬 근거, HOWAAA 지표 근거는 별도 AI 히스토리에만 저장하지 않는다. 기존 `issues`, `heartbeat_runs`, `work_products`, `activity_logs`, `approvals`에 연결한다.

### 2.4 `content_ai_runs`는 실행 원장이 아니다

`content_ai_runs`는 카드 UI에서 실행 상태를 빠르게 보여주는 projection이다. 실제 실행 원장은 `issue + heartbeat_run + activity_log + work_product`다.

---

## 3. Excalidraw 플로우

파일:

```txt
docs/superpowers/specs/2026-04-28-content-card-stage-collaboration-flow.excalidraw.md
```

1~3단계만 따로 보는 축약 다이어그램과 상세 기획:

```txt
docs/superpowers/specs/2026-04-28-content-card-first-3-steps-flow.excalidraw.md
docs/superpowers/specs/2026-04-28-content-card-first-3-steps-design.md
```

다이어그램은 5개 영역으로 구성된다.

| 영역 | 의미 |
|---|---|
| 1. 콘텐츠 소스 | HOWAAA Trends, 수동 아이디어, 캠페인/프로젝트 |
| 2. 카드 생성 | `content_items`, 트렌드 핀, 초기 issue 링크 |
| 3. 담당자 초대 | 사람/AI를 같은 `participants` 구조로 초대 |
| 4. 단계형 워크스페이스 | 소싱 → 기획 → 제작 → 검토 → 예약/발행 → 성과분석 → 재활용 |
| 5. HOWAAA 기록 원장 | 전략/작업/실행/활동/산출물/지시/트렌드 근거 보존 |

Obsidian에서 볼 때는 파일을 열고 Excalidraw View로 전환한다. 플러그인이 캐시를 잡고 있으면 탭을 닫고 다시 열어야 한다.

---

## 4. 전체 흐름

### 4.1 콘텐츠 소스 진입

카드 생성은 세 경로에서 시작된다.

```txt
1. HOWAAA Trends에서 "이 영상으로 카드 만들기"
2. 수동 아이디어 입력
3. 캠페인/프로젝트에서 카드 생성
```

HOWAAA Trends에서 시작한 경우 반드시 의사결정 당시 snapshot을 저장한다.

```txt
trendVideoId
title
channelTitle
publishedAt
collectedAt
viewCount
averageViewCount
performanceRate
format
thumbnailUrl
sourceUrl
```

현재 값만 참조하면 나중에 왜 이 카드를 만들었는지 추적할 수 없으므로, 카드 생성 시점의 숫자를 보존한다.

### 4.2 카드 생성

카드 생성 시 최소 데이터:

```txt
content_items
- id
- companyId
- title
- type
- stage: sourcing
- body / brief
- campaignId / projectId
- createdByActorId
```

연결 데이터:

```txt
content_source_pins 또는 work_products.payload.sourceSnapshot
content_issue_links
participants
activity_logs(action=content.card.created)
```

카드를 만든 사람은 기본 participant가 된다.

### 4.3 담당자 초대

카드에 사람과 AI를 초대한다.

```txt
participants
- targetType: content
- targetId: contentItemId
- actorId
- role
- joinedAt
- invitedByActorId
```

예시:

```txt
나: 디렉터
대표: 최종 승인자
Howaaa: 리서처
Codex: 대본 제작자
썸네일 QA: 검수 담당
```

AI를 초대해도 즉시 실행이 필수는 아니다.

```txt
초대만
즉시 시작
다음 단계 진입 시 자동 시작
```

### 4.4 단계 워크스페이스 루프

카드는 아래 7단계를 가진다.

```txt
sourcing
planning
production
review
publishing
analysis
repurpose
```

각 단계는 같은 구조를 가진다.

```txt
입력값
작업 담당자
AI/사람 작업
산출물
검증 Gate
다음 단계 이동
```

### 4.5 Gate 검증

단계 이동은 단순 stage 값 변경이 아니다.

```txt
Gate 통과 조건 =
  required outputs 존재
  + activity evidence 존재
  + 필요한 approval 상태가 approved
```

Gate가 실패하면 stage를 이동하지 않고 부족한 항목을 보여준다.

```txt
기획 단계로 이동할 수 없습니다.
- 전략 초안 산출물이 없습니다.
- 사람 승인 기록이 없습니다.
- HOWAAA 근거 snapshot이 없습니다.
```

---

## 5. 단계별 정의

| 단계 | 목적 | AI 작업 | 사람 판단 | 필수 산출물 | Gate 조건 |
|---|---|---|---|---|---|
| 소싱 | 후보와 근거 수집 | 트렌드 후보 요약, 벤치마크 비교 | 어떤 영상을 카드 근거로 쓸지 선택 | `source_snapshot`, `benchmark_summary`, pinned sources | 1개 이상 source pin + 지표 snapshot + activity |
| 기획 | 각도, 훅, 구조 확정 | 전략 초안, 훅 5개, 구성안 | 어떤 전략을 채택할지 승인 | `strategy_draft`, `hook_set`, `content_brief` | 전략 산출물 + 사람 승인 |
| 제작 | 실제 초안 제작 | 대본, 캡션, 소재 초안 | 어떤 버전을 본문/제작물로 반영할지 선택 | `script_draft`, `asset_draft`, `caption_draft` | 선택된 산출물 + 반영 activity |
| 검토 | 품질, 팩트, 톤 확인 | 팩트 체크, 브랜드 톤 검사, 리스크 탐지 | 반려/수정/승인 | `review_report`, `fact_check`, `tone_check` | 검토 완료 + 승인/반려 결정 |
| 예약/발행 | 채널별 발행 패키지 확정 | 플랫폼별 카피, 예약 제안 | 발행 승인, 예약 시간 결정 | `publish_package`, `schedule_plan` | `content_publish` approval approved |
| 성과분석 | 실제 성과 기록 | 벤치마크 대비 분석, 원인 추정 | 다음 액션 판단 | `performance_report` | 실제 지표 snapshot + 분석 산출물 |
| 재활용 | 파생 콘텐츠 생성 | 쇼츠/릴스/뉴스레터 변환안 | 어떤 파생물을 만들지 선택 | `repurpose_plan`, derivative content links | 원본-파생 카드 링크 + 작업 생성 |

---

## 6. Actor 작업 모델

### 6.1 작업은 issue/sub-issue다

카드 안 작업은 UI상 카드 내부 task처럼 보이지만, 실행 원장은 기존 issue 모델을 탄다.

```txt
content_items
  ↕
content_issue_links
  ↕
issues / sub-issues
  ↕
heartbeat_runs
```

한 issue에는 active execution owner가 하나만 있어야 한다. 같은 단계에서 AI를 병렬로 쓰려면 issue 하나에 여러 AI를 붙이지 말고 sub-issue로 나눈다.

예시:

```txt
제작 단계
- 대본 초안 작성 issue → Codex
- 캡션 초안 작성 issue → Howaaa
- 썸네일 문구 검수 issue → 썸네일 QA
```

### 6.2 AI 실행 상태

AI row에 표시되는 상태:

```txt
idle
running
paused
stopped
done
error
blocked
```

상태 원천:

```txt
heartbeat_runs = 실제 실행 상태
content_ai_runs = 카드 UI projection
activity_logs = 사용자가 읽는 타임라인
```

### 6.3 AI 산출물

AI는 `content_items.body`를 직접 덮어쓰지 않는다.

```txt
AI output
→ work_products 생성
→ activity_logs(action=ai.output.created)
→ 사람이 선택/승인
→ 본문 또는 발행 패키지에 반영
```

---

## 7. HOWAAA 기록 연동 매핑

| AI 정보 | 기존 Howaa 저장/연동 대상 | UI 표시 |
|---|---|---|
| 전략 제안 | `work_products` + `approvals` + issue comment | 기획 워크스페이스, Activity, 승인 Gate |
| 작업내역 | `tasks/issues` + `content_issue_links` + `heartbeat_runs` | 좌측 다음 할 일, Active Workers Board |
| 실행 상태 | `heartbeat_runs` + `content_ai_runs` | AI row progress, live dot, 실행 필터 |
| 활동 로그 | `activity_logs` | Activity Side Panel |
| 산출물 | `work_products` + issue work products | 제작/검토 워크스페이스 산출물 영역 |
| 지시/스킬 근거 | `instruction_versions` + `agent_skills` snapshot | AI row 상세, 산출물 메타 |
| HOWAAA 트렌드 근거 | `trendVideoId` + 지표 snapshot | 소싱 핀, 전략 산출물 근거, 분석 비교 |

금지:

```txt
content_ai_runs 안에 전략/작업내역/활동을 모두 독자 저장
AI 탭에서만 보이는 별도 히스토리
카드 Activity와 issue 기록에 남지 않는 AI 작업
AI가 만든 전략이 승인 없이 다음 단계 unlock
```

---

## 8. Activity 이벤트 표준

최소 이벤트:

```txt
content.card.created
content.source.pinned
participant.invited
ai.invited
ai.run.started
ai.strategy.proposed
ai.step.completed
ai.output.created
ai.run.paused
ai.run.stopped
approval.requested
approval.approved
approval.rejected
stage.gate.failed
stage.gate.passed
stage.moved
content.published
performance.snapshot.created
repurpose.card.created
```

payload에는 최소한 아래 값을 넣는다.

```txt
contentItemId
stage
actorId
issueId?
heartbeatRunId?
workProductId?
approvalId?
trendVideoId?
instructionVersionId?
createdAt
summary
```

---

## 9. UI 요구사항

### 9.1 카드 헤더

카드 헤더는 현재 단계와 다음 검증 액션을 보여준다.

```txt
[기획 ●] 담당: 나 · Howaaa · Codex · D-2 · 다음: 전략 승인
```

### 9.2 좌측 레일

좌측 레일은 카드의 현재 운영 상태를 압축한다.

```txt
다음 할 일
참여자
메타
트렌드 핀
더보기
```

참여자에는 사람과 AI가 같은 리스트에 보인다. AI만 `▶ / ⏸ / ⏹` 컨트롤을 가진다.

### 9.3 Active Workers Board

각 AI row는 다음을 보여준다.

```txt
현재 담당 issue/sub-issue
현재 heartbeat run
최근 전략/판단 산출물
최근 activity event
사용 instruction version
사용한 HOWAAA 트렌드 근거
생성한 work products
승인 대기/승인 완료 상태
```

### 9.4 Stage Move Modal

단계 이동은 항상 모달을 거친다.

```txt
이동하려는 단계
Gate 검증 결과
부족한 산출물
생성될 issue/sub-issue
자동 시작할 AI 담당자
필요 approval
```

CTA:

```txt
[검증하고 이동]
[단계만 보기]
[취소]
```

---

## 10. 예외 처리

| 상황 | 처리 |
|---|---|
| Gate 필수 산출물 없음 | stage 이동 차단, 부족한 산출물 생성 CTA |
| approval pending | `waiting_approval` 또는 이동 보류 |
| approval rejected | 반려 activity 기록, 이전 단계 유지 |
| active AI run 중 단계 이동 | 기본값: 현재 step 종료 후 pause, 사용자에게 표시 |
| AI budget cap 도달 | 자동 pause, activity 기록, 예산 승인 요청 옵션 |
| AI output 충돌 | 본문 직접 수정 금지. work product 비교 후 사람 선택 |
| HOWAAA snapshot 없음 | 소싱 Gate 실패. 현재 지표를 새 snapshot으로 저장할지 확인 |
| issue execution lock 점유 | 같은 issue 새 run 금지. 다른 AI 요청은 deferred 또는 sub-issue 생성 |

---

## 11. 데이터 계약

### 11.1 Source Snapshot

HOWAAA 기반 카드에는 최소 snapshot이 필요하다.

```txt
sourceSnapshot
- provider: howaaa
- trendVideoId
- title
- channelTitle
- subscriberCount
- publishedAt
- collectedAt
- viewCount
- averageViewCount
- performanceRate
- contributionRate?
- format
- thumbnailUrl
- sourceUrl
```

### 11.2 Work Product Metadata

AI 산출물에는 생성 근거를 남긴다.

```txt
workProduct.payload
- stage
- actorId
- issueId
- heartbeatRunId
- instructionVersionId
- skillSnapshotIds
- sourceSnapshotIds
- approvalId?
- summary
```

### 11.3 Stage Gate Result

Gate 검증 결과는 activity payload로 남긴다.

```txt
gateResult
- fromStage
- toStage
- passed
- checkedOutputs
- missingOutputs
- approvalStatus
- checkedByActorId
- createdIssueIds
```

---

## 12. 범위

이번 플로우 spec에 포함:

```txt
콘텐츠 소스 → 카드 생성
사람/AI 담당자 초대
7단계 워크스페이스 흐름
단계 Gate 검증
HOWAAA 기록 원장 연동
Activity 이벤트 표준
UI 표면 요구사항
데이터 계약
```

범위 외:

```txt
AI 직원 관리 페이지 전체 설계
AGENTS.md/SOUL.md/TOOLS.md 편집기
외부 플랫폼 실제 자동 발행 API
Level 2/3 자율 채용
성과 지표 수집 크롤러/수집기 구현
```

---

## 13. 성공 기준

1. 사용자는 카드 하나를 열고 5초 안에 현재 단계, 담당자, 다음 검증 액션을 알 수 있다.
2. AI와 사람은 같은 참여자/작업/산출물/활동 문법으로 보인다.
3. AI 전략과 작업내역은 기존 issue/heartbeat/activity/work product에서 역추적 가능하다.
4. HOWAAA Trends에서 만든 카드의 의사결정 근거 숫자는 snapshot으로 남는다.
5. Gate 검증 없이 다음 단계로 넘어가지 않는다.
6. `content_ai_runs`만 보고는 원장을 구성하지 않는다. 반드시 기존 실행/기록 모델에 연결된다.
7. 병렬 AI 작업은 같은 issue에 여러 run을 붙이지 않고 sub-issue로 나눈다.
