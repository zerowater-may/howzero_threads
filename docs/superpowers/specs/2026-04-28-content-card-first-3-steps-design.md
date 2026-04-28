# Content Card First 3 Steps Design

> Date: 2026-04-28  
> Scope: 콘텐츠 소스 → 카드 생성 → 담당자 초대  
> Diagram: `docs/superpowers/specs/2026-04-28-content-card-first-3-steps-flow.excalidraw.md`  
> Parent flow: `docs/superpowers/specs/2026-04-28-content-card-stage-collaboration-flow-design.md`

---

## 1. 목적

콘텐츠 카드 협업 플로우의 첫 3단계를 구현 가능한 수준으로 고정한다.

```txt
1. 콘텐츠 소스
2. 카드 생성
3. 담당자 초대
```

이 3단계의 목표는 단순히 카드를 하나 만드는 것이 아니다. **왜 이 카드를 만들었는지, 어떤 데이터 근거가 있었는지, 누가 담당자인지, 어떤 AI가 참여하는지**를 처음부터 기록 원장에 남기는 것이다.

---

## 2. 전체 흐름

```txt
HOWAAA Trends / 수동 아이디어 / 캠페인
  ↓
트렌드 근거 snapshot 저장
  ↓
content_items 생성
  ↓
trendVideoId 소싱 핀 연결
  ↓
content_issue_links 초기 issue 연결
  ↓
사람 초대 + AI 초대
  ↓
participants 생성
  ↓
activity_logs에 전체 기록
```

이 단계가 끝나면 카드는 `sourcing` stage에 있고, 다음 단계인 `기획`으로 넘어가기 전 필요한 초기 컨텍스트가 갖춰져 있어야 한다.

---

## 3. 1단계: 콘텐츠 소스

### 3.1 진입 경로

콘텐츠 카드는 세 경로에서 생성된다.

| 경로 | 설명 | 기본 처리 |
|---|---|---|
| HOWAAA Trends | 성과가 높은 영상/채널에서 카드 생성 | 지표 snapshot 필수 |
| 수동 아이디어 | 사람이 직접 아이디어 입력 | source type만 `manual`로 기록 |
| 캠페인/프로젝트 | 캠페인 안에서 새 카드 생성 | campaignId/projectId 연결 |

### 3.2 HOWAAA Trends에서 생성할 때

HOWAAA Trends에서 카드를 만들면 현재 화면의 숫자를 그대로 참조하지 않는다. 카드 생성 시점의 snapshot을 저장한다.

필수 snapshot:

```txt
sourceType: howaaa_trend
trendVideoId
videoTitle
channelTitle
channelSubscriberCount
publishedAt
collectedAt
viewCount
averageViewCount
performanceRate
contributionRate
format: shorts | long | unknown
thumbnailUrl
sourceUrl
```

선택 snapshot:

```txt
rank
sortBy
filters
selectedReason
memo
```

### 3.3 수동 아이디어에서 생성할 때

수동 아이디어는 데이터 근거가 없을 수 있다. 대신 사람이 작성한 근거를 남긴다.

```txt
sourceType: manual
ideaText
createdByActorId
memo
campaignId?
projectId?
```

### 3.4 캠페인/프로젝트에서 생성할 때

캠페인이나 프로젝트에서 생성된 카드는 상위 맥락을 반드시 연결한다.

```txt
sourceType: campaign | project
campaignId?
projectId?
goal
targetAudience
channel
deadline?
```

### 3.5 1단계 Activity

1단계에서 남겨야 할 activity:

```txt
content.source.selected
content.source.snapshot.created
content.source.memo.added
```

예시:

```txt
오늘 15:02 사용자가 HOWAAA Trends에서 "로맨틱 겨울" 영상을 소싱 근거로 선택했습니다.
오늘 15:02 시스템이 조회수 2,962.1만 / 평균 48.3만 / 성과율 6,222,831.72 snapshot을 저장했습니다.
```

---

## 4. 2단계: 카드 생성

### 4.1 생성되는 핵심 객체

카드 생성 시 `content_items`가 만들어진다.

```txt
content_items
- id
- companyId
- title
- type
- stage: sourcing
- status
- brief
- body
- campaignId?
- projectId?
- createdByActorId
- createdAt
```

기본값:

```txt
stage = sourcing
status = active
createdByActorId = 현재 사용자 Actor
```

### 4.2 소싱 핀 연결

HOWAAA Trends에서 온 카드라면 소싱 핀을 만든다.

권장 구조:

```txt
content_source_pins
- id
- contentItemId
- sourceType: howaaa_trend
- trendVideoId
- snapshot
- pinnedByActorId
- pinnedAt
```

별도 테이블을 만들지 않는 MVP라면 `work_products`로 대체할 수 있다.

```txt
work_products
- type: source_snapshot
- targetType: content
- targetId: contentItemId
- actorId: createdByActorId
- payload: sourceSnapshot
```

### 4.3 초기 issue 연결

카드는 생성 직후 최소 1개의 초기 issue와 연결된다.

```txt
issues
- title: "[소싱] 콘텐츠 근거 정리"
- status: todo
- assigneeActorId: createdByActorId 또는 Howaaa
- parentIssueId?
```

연결:

```txt
content_issue_links
- contentItemId
- issueId
- role: sourcing_initial
```

중요: 카드 stage와 issue status를 섞지 않는다.

```txt
content_items.stage = 콘텐츠 제작 단계
issues.status = 실제 작업 상태
```

### 4.4 2단계 Activity

2단계에서 남겨야 할 activity:

```txt
content.card.created
content.source.pinned
content.issue.linked
```

예시:

```txt
오늘 15:03 사용자가 콘텐츠 카드 "로맨틱 겨울 벤치마크 분석"을 만들었습니다.
오늘 15:03 시스템이 HOWAAA trendVideoId를 카드 소싱 핀으로 연결했습니다.
오늘 15:03 시스템이 초기 소싱 issue를 생성하고 카드에 연결했습니다.
```

---

## 5. 3단계: 담당자 초대

### 5.1 공통 원칙

사람과 AI는 같은 `participants` 구조로 초대된다.

```txt
participants
- id
- targetType: content
- targetId: contentItemId
- actorId
- role
- joinedAt
- invitedByActorId
```

차이는 actor type에서만 난다.

```txt
human actor = 사람 담당자
ai actor = AI 담당자
```

### 5.2 사람 초대

사람 초대 예시:

```txt
대표: 최종 승인자
기획자: 콘텐츠 디렉터
검토자: 품질/팩트 검토
```

사람 초대 시 기본 권한:

| 역할 | 가능 | 제한 |
|---|---|---|
| 대표 | 최종 승인, 발행 승인, 단계 이동 승인 | 없음 |
| 기획자 | 카드 수정, 작업 생성, AI 초대 | 발행 최종 승인 제한 가능 |
| 검토자 | 코멘트, 검토 승인/반려 | 발행/예산/AI 채용 승인 제한 |

### 5.3 AI 초대

AI 초대 예시:

```txt
Howaaa: 리서처
Codex: 대본 제작자
썸네일 QA: 검수 담당
성과 분석가: 발행 후 분석 담당
```

AI 초대 시 선택하는 시작 방식:

```txt
1. 초대만
2. 즉시 시작
3. 다음 단계 진입 시 자동 시작
```

초대 직후 AI가 반드시 실행되는 것은 아니다. 초대와 실행은 분리한다.

```txt
participants 생성 = 카드에 담당자로 합류
content_ai_runs 생성 = 실행 상태 projection 시작
heartbeat wakeup = 실제 실행 요청
```

### 5.4 AI 실행과 issue 연결

AI에게 일을 시킬 때는 issue/sub-issue를 통해 실행한다.

```txt
AI 초대
  ↓
담당 role 확인
  ↓
해당 stage issue 생성 또는 기존 issue 배정
  ↓
content_issue_links 연결
  ↓
heartbeat wakeup
  ↓
content_ai_runs projection 업데이트
```

같은 issue에 여러 AI가 동시에 실행되면 안 된다. 병렬 작업이 필요하면 sub-issue를 만든다.

### 5.5 3단계 Activity

3단계에서 남겨야 할 activity:

```txt
participant.invited
ai.invited
ai.run.queued
ai.run.started
content.issue.assigned
```

예시:

```txt
오늘 15:04 사용자가 대표를 최종 승인자로 초대했습니다.
오늘 15:04 사용자가 Howaaa를 리서처로 초대했습니다.
오늘 15:05 시스템이 Howaaa에게 "[소싱] 콘텐츠 근거 정리" issue를 배정했습니다.
```

---

## 6. 1~3단계 완료 조건

1~3단계가 끝났다고 판단하려면 아래 조건을 만족해야 한다.

```txt
content_items 생성 완료
source snapshot 또는 manual source memo 존재
creator가 participant로 등록됨
필요한 사람 담당자 최소 1명 등록됨
AI 담당자는 초대만 또는 실행 방식이 명시됨
초기 sourcing issue가 생성되거나 연결됨
content_issue_links 존재
activity_logs에 source/card/participant 이벤트가 남음
```

HOWAAA Trends 기반 카드라면 추가 조건:

```txt
trendVideoId 존재
collectedAt 존재
viewCount / averageViewCount / performanceRate snapshot 존재
thumbnailUrl 또는 sourceUrl 존재
```

---

## 7. 실패/예외 처리

| 상황 | 처리 |
|---|---|
| HOWAAA snapshot 저장 실패 | 카드 생성 차단 또는 수동 아이디어 카드로 전환 확인 |
| trendVideoId 없음 | sourceType을 manual로 저장하고 경고 activity 남김 |
| 카드 생성 성공, issue 연결 실패 | 카드 유지, `content.issue.link_failed` activity, 재시도 CTA |
| 사람 초대 실패 | participant 생성 안 함, 초대 실패 toast |
| AI 초대 성공, 실행 실패 | participant는 유지, `ai.run.start_failed` activity, 재시작 CTA |
| 같은 issue에 이미 active run 있음 | 새 run 생성 금지, deferred 처리 또는 sub-issue 생성 |
| 초대한 AI 권한 부족 | 실행 차단, 필요한 permission 안내 |

---

## 8. API 초안

### 8.1 HOWAAA Trends에서 카드 생성

```txt
POST /api/companies/:companyId/content-items/from-howaaa-trend
```

body:

```json
{
  "trendVideoId": "abc123",
  "title": "로맨틱 겨울 벤치마크 분석",
  "type": "youtube",
  "campaignId": "optional",
  "sourceSnapshot": {
    "viewCount": 29621000,
    "averageViewCount": 483000,
    "performanceRate": 6222831.72,
    "collectedAt": "2026-04-28T00:00:00.000Z"
  },
  "inviteActorIds": ["human-1", "ai-howaaa"],
  "aiStartMode": "invite_only"
}
```

response:

```json
{
  "item": {},
  "sourcePin": {},
  "linkedIssues": [],
  "participants": []
}
```

### 8.2 수동 카드 생성

```txt
POST /api/companies/:companyId/content-items
```

body:

```json
{
  "title": "새 콘텐츠 아이디어",
  "type": "youtube",
  "sourceType": "manual",
  "ideaText": "대표가 직접 입력한 아이디어",
  "inviteActorIds": []
}
```

### 8.3 담당자 초대

```txt
POST /api/companies/:companyId/content-items/:contentItemId/participants
```

body:

```json
{
  "actorId": "ai-howaaa",
  "role": "researcher",
  "startMode": "invite_only"
}
```

---

## 9. UI 초안

### 9.1 HOWAAA Trends 카드 생성 CTA

```txt
[이 영상으로 카드 만들기]
```

클릭 시:

```txt
카드 제목
캠페인/프로젝트 선택
사람 담당자 선택
AI 담당자 선택
AI 시작 방식
```

### 9.2 카드 생성 확인 모달

```txt
이 카드에 저장될 근거
- 조회수
- 평균 조회수
- 성과율
- 수집일
- 채널

초대할 담당자
- 나
- 대표
- Howaaa
- Codex

[카드 만들기] [취소]
```

### 9.3 카드 생성 후 진입 화면

카드 생성 후 바로 `Content Detail` 모달의 `소싱` 워크스페이스로 진입한다.

초기 화면:

```txt
좌측 레일
- 다음 할 일: 소싱 근거 정리
- 참여자: 나, Howaaa
- 트렌드 핀: 선택한 영상

메인
- HOWAAA 벤치마크 카드
- 저장된 source snapshot
- 초기 issue
```

---

## 10. 구현 순서 제안

1. Source snapshot 타입 정의
2. HOWAAA Trends → content card 생성 API 추가
3. 카드 생성 시 source pin/work_product 저장
4. 카드 생성 시 초기 sourcing issue 생성
5. `content_issue_links` 연결
6. creator participant 자동 생성
7. 사람/AI participant 초대 API 정리
8. AI startMode 분리: invite_only / start_now / start_on_stage
9. Activity 이벤트 기록
10. UI에서 “이 영상으로 카드 만들기” CTA 연결

---

## 11. 검증 기준

테스트해야 할 시나리오:

```txt
HOWAAA Trends에서 카드 생성하면 source snapshot이 저장된다.
카드 생성 후 stage는 sourcing이다.
creator는 participant로 자동 등록된다.
초기 sourcing issue가 생성되고 content_issue_links로 연결된다.
AI 초대만 선택하면 heartbeat run은 생성되지 않는다.
즉시 시작을 선택하면 issue 배정 후 heartbeat wakeup이 발생한다.
같은 issue에 active run이 있으면 두 번째 AI run은 생성되지 않는다.
Activity timeline에 source/card/invite 이벤트가 표시된다.
```

---

## 12. 다음 단계와의 연결

1~3단계가 끝나면 카드는 `소싱` 워크스페이스에서 시작한다.

다음 문서에서 다룰 범위:

```txt
4. 소싱 Gate
5. 기획 단계
6. 전략 제안
7. 사람 승인
8. 제작 단계 이동
```

