# Content Card First 3 Steps Design

> Date: 2026-04-28  
> Scope: 기존 HOWAAA Trends → 콘텐츠 기획 카드 생성 흐름의 1~3단계 보강  
> Diagram: `docs/superpowers/specs/2026-04-28-content-card-first-3-steps-flow.excalidraw.md`  
> Parent flow: `docs/superpowers/specs/2026-04-28-content-card-stage-collaboration-flow-design.md`

---

## 1. 정정

이 문서는 새 길을 만드는 문서가 아니다. 이미 구현된 길을 기준으로 1~3단계를 정리하고, 부족한 부분만 보강한다.

현재 이미 구현된 흐름:

```txt
HOWAAA Trends에서 영상 선택
→ "콘텐츠 기획으로 넘기기" 클릭
→ POST /api/companies/:companyId/howaaa/benchmark-content
→ 서버가 content_items 생성
→ metadata에 HOWAAA benchmark 정보 저장
→ activity_logs에 howaaa.benchmark_content_created 기록
→ UI가 /content로 이동
```

확인한 코드:

```txt
ui/src/pages/HowaaaTrends.tsx
ui/src/components/howaaa/trends-action-bar.tsx
ui/src/api/howaaa-trends.ts
server/src/routes/howaaa-trends.ts
server/src/__tests__/howaaa-trends.test.ts
```

따라서 1~3단계 구현 방향은 **신규 API 추가가 아니라 기존 endpoint 확장**이다.

---

## 2. 현재 구현 상태

### 2.1 UI

이미 존재:

```txt
버튼: "콘텐츠 기획으로 넘기기"
위치: ui/src/components/howaaa/trends-action-bar.tsx
호출: howaaaTrendsApi.createBenchmarkContent
```

`HowaaaTrends.tsx`는 선택한 영상 id와 수집일을 서버로 보낸다.

```txt
saveDate: filters.date
videoIds: Array.from(selectedVideos.keys())
```

성공하면:

```txt
selectedVideos 초기화
content list query invalidate
navigate("/content")
```

### 2.2 API

이미 존재:

```txt
POST /api/companies/:companyId/howaaa/benchmark-content
```

파일:

```txt
server/src/routes/howaaa-trends.ts
```

현재 처리:

```txt
getVideosForSnapshot(saveDate, videoIds)
→ content_items insert
→ stage: planning
→ metadata.source = "howaaa_trends"
→ metadata.selectedTrendVideos
→ metadata.metricsSummary
→ logActivity(action="howaaa.benchmark_content_created")
→ { contentItem } 반환
```

### 2.3 저장되는 데이터

현재 `content_items.metadata`에 저장:

```txt
source: "howaaa_trends"
checklist: []
benchmarkStatus: "selected"
analysisStatus: "pending"
selectedTrendVideos
metricsSummary
personaVariants: {}
createdByUserId
```

현재 stage:

```txt
stage = planning
```

이 값은 맞다. HOWAAA Trends 자체가 이미 소싱 화면이므로, 트렌즈에서 만든 카드는 `소싱`이 아니라 `기획`으로 넘어가는 것이 현재 제품 문법에 더 맞다.

---

## 3. 1단계: 콘텐츠 소스

### 3.1 현재 완료된 부분

HOWAAA Trends가 콘텐츠 소스 역할을 이미 수행한다.

```txt
영상 선택
수집일 saveDate
videoIds
필터/정렬 화면
성과 지표
```

서버는 `getVideosForSnapshot(saveDate, videoIds)`로 선택 영상을 다시 가져온다. 이 구조는 좋다. 클라이언트 숫자를 그대로 신뢰하지 않고 서버 store 기준으로 snapshot을 만든다.

### 3.2 보강할 부분

현재 `selectedTrendVideos`와 `metricsSummary`가 metadata에 들어가 있으므로, 별도 snapshot 개념은 이미 부분적으로 충족한다.

다만 앞으로 명시적으로 보존해야 할 필드는 아래처럼 표준화한다.

```txt
metadata.source = "howaaa_trends"
metadata.selectedTrendVideos[]:
  videoId
  title
  channelTitle
  publishedAt
  collectedAt 또는 saveDate
  viewCount
  avgViewCount
  performanceRate
  contributionRate
  subscriberCount
  format
  thumbnailUrl

metadata.metricsSummary:
  saveDate
  videoCount
  maxViewCount
  maxPerformanceRate
  maxContributionRate?
```

필터/정렬까지 추적하고 싶으면 다음 필드를 추가한다.

```txt
metadata.howaaaContext:
  filters
  sortBy
  order
  selectedReason?
```

### 3.3 Activity

현재 activity:

```txt
howaaa.benchmark_content_created
```

이건 유지한다. 추가로 더 세밀한 event를 넣을지는 구현 단계에서 결정한다.

권장 추가 event:

```txt
howaaa.source_snapshot_saved
```

단, 처음 구현에서는 기존 `howaaa.benchmark_content_created`의 `details`를 확장해도 된다.

---

## 4. 2단계: 카드 생성

### 4.1 현재 완료된 부분

이미 `content_items`가 생성된다.

현재 값:

```txt
title: benchmarkTitle(selectedTrendVideos)
description: "HOWAAA 트렌드 영상의 구조를 벤치마킹해 콘텐츠 기획으로 전환합니다."
contentType: "shorts"
channel: "youtube"
stage: "planning"
priority: "medium"
contentFilePath: `.howzero/companies/${companyId}/content/howaaa-${randomUUID()}.md`
contentBodyPreview: "HOWAAA 트렌드 영상의 구조를 벤치마킹해 콘텐츠 기획으로 전환합니다."
contentSyncStatus: "synced"
automationStatus: "idle"
metadata: HOWAAA benchmark metadata
```

이 흐름은 유지한다.

### 4.2 보강할 부분

현재 1~3단계 원칙 대비 빠진 부분:

```txt
creator를 participant로 자동 등록하지 않음
초기 planning issue를 자동 생성하지 않음
content_issue_links를 만들지 않음
초대할 사람/AI를 Trends 생성 플로우에서 받지 않음
AI startMode를 받지 않음
```

중요: 기존 route 이름은 바꾸지 않는다.

```txt
유지: POST /api/companies/:companyId/howaaa/benchmark-content
금지: 같은 목적의 새 /content-items/from-howaaa-trend route 추가
```

### 4.3 초기 issue 기준

HOWAAA Trends에서 넘어온 카드는 `planning` stage로 생성되므로 초기 issue도 `planning` 역할이어야 한다.

```txt
issues
- title: "[기획] HOWAAA 벤치마크 기반 콘텐츠 기획"
- status: todo
- assigneeActorId: creator 또는 선택한 AI
```

연결:

```txt
content_issue_links
- contentItemId
- issueId
- role: planning
```

이미 `server/src/routes/content.ts`에 `create-issue`와 `ensureStageIssue` 흐름이 있으므로, 새 로직을 만들기보다 그 패턴을 재사용한다.

---

## 5. 3단계: 담당자 초대

### 5.1 현재 완료된 부분

협업자 API는 이미 있다.

```txt
GET  /api/companies/:companyId/collaboration/:targetType/:targetId/participants
POST /api/companies/:companyId/collaboration/:targetType/:targetId/participants
```

UI도 Content Board 상세에서 participants를 읽고 초대할 수 있다.

관련 코드:

```txt
ui/src/pages/ContentBoard.tsx
ui/src/components/modal/LeftRail.tsx
ui/src/components/collaboration/ParticipantsPanel.tsx
server/src/routes/workforce.ts
packages/db/src/schema/collaboration_participants.ts
```

### 5.2 보강할 부분

HOWAAA Trends에서 카드 생성할 때는 아직 담당자를 함께 넘기지 않는다.

보강 방향:

```txt
POST /howaaa/benchmark-content body에 optional participants 추가
```

예시:

```json
{
  "saveDate": "2026-04-25",
  "videoIds": ["video-1", "video-2"],
  "participants": [
    {
      "actorId": "human-1",
      "role": "director",
      "permissionLevel": "edit"
    },
    {
      "actorId": "ai-howaaa",
      "role": "researcher",
      "permissionLevel": "suggest",
      "startMode": "invite_only"
    }
  ]
}
```

기본값:

```txt
creator는 자동 participant
AI는 초대만 기본값
AI 즉시 실행은 명시적으로 startMode=start_now일 때만
```

### 5.3 AI 초대와 실행 분리

초대와 실행은 분리한다.

```txt
participant 추가 = 카드 담당자로 합류
content_ai_runs 생성 = 카드 UI 실행 projection
heartbeat wakeup = 실제 실행 요청
```

기본 모드:

```txt
invite_only
```

지원할 모드:

```txt
invite_only
start_now
start_on_stage
```

---

## 6. 1~3단계 완료 조건

현재 구현만으로 이미 만족하는 조건:

```txt
HOWAAA Trends 선택 영상으로 content_items 생성
HOWAAA benchmark metadata 저장
metricsSummary 저장
stage=planning
activity_logs에 howaaa.benchmark_content_created 기록
/content로 이동
```

보강 후 만족해야 하는 조건:

```txt
creator가 collaboration_participants에 자동 등록됨
선택한 사람/AI 담당자가 participants에 등록됨
초기 planning issue가 생성 또는 재사용됨
content_issue_links가 planning role로 연결됨
AI startMode가 invite_only/start_now/start_on_stage로 저장됨
start_now일 때만 heartbeat wakeup이 발생함
activity_logs에 participant/issue/link 이벤트가 남음
```

---

## 7. 실패/예외 처리

| 상황 | 현재/보강 처리 |
|---|---|
| 선택 영상 없음 | 현재 404 |
| content item 생성 실패 | 현재 500 |
| participant 생성 실패 | 보강 후 카드 생성은 유지, 초대 실패 activity + 재시도 CTA |
| issue 연결 실패 | 보강 후 카드 생성은 유지, link 실패 activity + 재시도 CTA |
| AI start_now 실패 | participant는 유지, run 실패 activity + 재시작 CTA |
| 같은 issue active run 존재 | 새 run 생성 금지, deferred 또는 sub-issue 생성 |

---

## 8. API 기준

### 8.1 유지할 기존 API

```txt
POST /api/companies/:companyId/howaaa/benchmark-content
```

현재 body:

```json
{
  "saveDate": "2026-04-25",
  "videoIds": ["video-1", "video-2"]
}
```

보강 body:

```json
{
  "saveDate": "2026-04-25",
  "videoIds": ["video-1", "video-2"],
  "participants": [
    {
      "actorId": "human-1",
      "role": "director",
      "permissionLevel": "edit"
    },
    {
      "actorId": "ai-howaaa",
      "role": "researcher",
      "permissionLevel": "suggest",
      "startMode": "invite_only"
    }
  ],
  "createPlanningIssue": true
}
```

보강 response:

```json
{
  "contentItem": {},
  "participants": [],
  "linkedIssue": {},
  "aiRuns": []
}
```

### 8.2 유지할 기존 협업자 API

```txt
POST /api/companies/:companyId/collaboration/content/:contentItemId/participants
```

이 API는 카드 생성 후 상세 화면에서 초대할 때 계속 사용한다.

---

## 9. UI 기준

### 9.1 이미 있는 CTA

현재 CTA:

```txt
콘텐츠 기획으로 넘기기
```

이 문구는 유지한다. 새 버튼을 만들지 않는다.

### 9.2 보강할 UX

현재는 클릭 즉시 생성된다. 보강 시에는 선택 사항으로 확인 모달을 둘 수 있다.

모달에 들어갈 내용:

```txt
저장될 HOWAAA 근거
- 선택 영상 수
- 최고 조회수
- 최고 성과율
- 수집일

담당자
- creator 자동 등록
- 사람 담당자 optional
- AI 담당자 optional

실행 방식
- 초대만
- 즉시 시작
- 기획 단계 진입 시 시작
```

단, MVP에서는 모달 없이 기본값으로 처리해도 된다.

```txt
creator 자동 participant
초기 planning issue 자동 생성
AI는 상세 화면에서 초대
```

---

## 10. 구현 순서 제안

새 route를 만들지 않는다. 기존 route를 단계적으로 보강한다.

1. `createBenchmarkContentSchema`에 optional `participants`, `createPlanningIssue` 추가
2. `/howaaa/benchmark-content`에서 creator actor를 participant로 자동 등록
3. 기존 `ensureStageIssue` 패턴을 재사용해 planning issue 생성/연결
4. `content_issue_links.role = "planning"`으로 연결
5. participants 입력이 있으면 사람/AI를 같은 구조로 추가
6. AI participant의 `startMode`를 metadata에 저장
7. `startMode=start_now`일 때만 기존 content AI run/heartbeat 흐름 호출
8. activity details에 `participantCount`, `issueId`, `startModeSummary` 추가
9. 기존 `howaaa-trends.test.ts`에 participant/issue/link 케이스 추가
10. UI는 우선 기존 "콘텐츠 기획으로 넘기기" 버튼을 유지하고, 이후 필요 시 확인 모달 추가

---

## 11. 검증 기준

이미 있는 테스트:

```txt
server/src/__tests__/howaaa-trends.test.ts
- creates a planning content item with HOWAAA benchmark metadata
```

보강 후 추가할 테스트:

```txt
HOWAAA Trends에서 카드 생성하면 stage=planning이다.
metadata.source="howaaa_trends"가 유지된다.
metadata.selectedTrendVideos와 metricsSummary가 저장된다.
creator participant가 자동 생성된다.
createPlanningIssue=true면 planning issue가 생성된다.
content_issue_links가 planning role로 연결된다.
participants 입력이 있으면 사람/AI가 같은 API 구조로 등록된다.
startMode=invite_only면 heartbeat run은 생성되지 않는다.
startMode=start_now면 issue 컨텍스트로 AI run이 시작된다.
activity_logs details에 videoCount/saveDate/issueId/participantCount가 남는다.
```

---

## 12. 다음 단계와의 연결

1~3단계가 끝난 카드는 이미 `planning` stage다.

다음 문서/구현 범위:

```txt
4. 기획 Gate
5. 전략 제안 산출물
6. 사람 승인
7. 제작 단계 이동
```

HOWAAA Trends는 소싱 화면 역할을 이미 하므로, 이 경로에서는 `sourcing` stage로 되돌리지 않는다.

