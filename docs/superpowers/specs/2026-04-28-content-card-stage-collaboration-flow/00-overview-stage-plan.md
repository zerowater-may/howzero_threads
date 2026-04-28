# 00. 콘텐츠 카드 단계형 협업 플로우 세부계획서

> Parent: `../2026-04-28-content-card-stage-collaboration-flow-design.md`
> Folder: `docs/superpowers/specs/2026-04-28-content-card-stage-collaboration-flow/`
> Principle: AI와 사람은 모두 `participants`에 초대되는 Actor이며, 단계 이동은 Gate 검증을 통과해야 한다.
> Diagram: `00-overview-stage-map.excalidraw.md`

## 1. 전체 미션

콘텐츠 카드 하나를 작은 협업룸으로 보고, 초안 생성부터 AI/사람 초대, 기획, 제작, 검토, 발행, 성과분석, 재활용까지 하나의 추적 가능한 흐름으로 만든다.

핵심은 두 가지다.

- AI도 사람과 같은 담당자 문법으로 카드에 초대된다.
- 다음 단계로 넘어가려면 산출물, 활동 기록, 승인 evidence가 원장에 남아야 한다.

## 2. 전체 흐름

```txt
콘텐츠 소스 / 초안
→ 카드 생성
→ 사람·AI 담당자 초대
→ 소싱
→ Gate
→ 기획
→ Gate
→ 제작
→ Gate
→ 검토
→ Gate
→ 예약/발행
→ Gate
→ 성과분석
→ Gate
→ 재활용
```

## 3. 단계 목록

| 문서 | Stage 값 | 다음 단계 | Gate |
| --- | --- | --- | --- |
| 01 소싱 | sourcing | 기획 | 핀/근거 OK |
| 02 기획 | planning | 제작 | 전략 승인 |
| 03 제작 | production | 검토 | 초안 선택 |
| 04 검토 | review | 예약/발행 | 검토 완료 |
| 05 예약/발행 | publishing | 성과분석 | 발행 승인 |
| 06 성과분석 | analysis | 재활용 | 성과 기록 |
| 07 재활용 | repurpose | 새 카드/종료 | 파생 연결 |

## 4. 공통 데이터 모델

| 도메인 | 저장 위치 | 역할 |
| --- | --- | --- |
| 카드 | `content_items` | 콘텐츠 카드의 제목, 타입, 현재 stage, metadata |
| 담당자 | `collaboration_participants` | 사람/AI Actor를 같은 문법으로 초대 |
| 작업 | `issues` + `content_issue_links` | 카드 내부 task처럼 보이는 실제 실행 단위 |
| 산출물 | `issue_work_products` | AI/사람 작업 결과, 전략/대본/검토/분석 리포트 |
| 승인 | `approvals` | 기획 승인, 발행 승인, stage gate 결정 |
| 활동 | `activity_log` | 누가 무엇을 했는지 남기는 협업 기록 |
| 실행 | `heartbeat_runs` + `content_ai_runs` | 실제 AI 실행 원장과 UI projection |
| HOWAAA 근거 | `content_items.metadata.selectedTrendVideos/sourcePins` | 트렌드 원본과 지표 snapshot |

## 5. Stage 이동 규칙

1. 단계 탭 클릭은 workspace 보기 전환이다.
2. 실제 stage 이동은 `gate-preview`를 먼저 호출한다.
3. `allowed=false`이면 `/move`를 호출하지 않거나, 서버에서 422로 차단한다.
4. 이전 단계로 돌아가는 이동은 허용한다.
5. 한 번에 두 단계 이상 건너뛰는 이동은 차단한다.
6. 이동 성공 시 `activity_log.action=content.stage_moved`를 남긴다.

## 6. AI 초대와 실행 규칙

- AI 초대는 `participants` 생성이다.
- AI 실행은 별도 액션이며, 초대와 실행을 같은 버튼으로 숨기지 않는다.
- AI가 만든 결과는 `issue_work_products`로 남기고 사람이 선택/승인해야 다음 단계 입력이 된다.
- `content_ai_runs`는 UI 상태 projection이고, 실제 작업 기록은 issue, heartbeat, activity, work product에 남긴다.

## 7. 공통 Gate 판정 구조

```txt
Gate 통과 =
  required outputs 존재
  + activity evidence 존재
  + 필요한 approval 상태가 approved
```

Gate preview 응답은 최소 아래 정보를 가진다.

```txt
itemId
currentStage
targetStage
gateStage
direction
allowed
status
summary
requirements[]
```

`requirements[]`는 `id`, `label`, `description`, `passed`, `evidenceCount`, `evidenceLabel`을 포함한다.

## 8. 화면 공통 구조

- 좌측: 다음 할 일, 참여자, 문서 속성
- 상단: 현재 카드 제목, 타입, 채널, 단계, 담당 상태
- 탭: 7개 workspace 보기 전환
- 본문: 현재 workspace의 입력, 작업, 산출물, Gate 상태
- 하단: 활동 보기, 단계 이동 select, 저장
- 모달: Gate preview와 누락 evidence 표시

## 9. 전체 QA 기준

- HOWAAA Trends에서 카드 생성 후 소싱 evidence가 저장된다.
- AI 초대 후 participant 목록에 AI와 사람이 같은 구조로 보인다.
- 기획에서 승인 없이 제작으로 넘어갈 수 없다.
- 제작에서 선택 산출물 없이 검토로 넘어갈 수 없다.
- 검토에서 decision 없이 발행으로 넘어갈 수 없다.
- 발행 승인 없이 성과분석으로 넘어갈 수 없다.
- 실측 지표와 분석 산출물 없이 재활용으로 넘어갈 수 없다.
- 재활용 카드가 원본 카드와 연결된다.

## 10. 세부 문서

- [01. 소싱 단계](./01-sourcing-stage-plan.md)
- [02. 기획 단계](./02-planning-stage-plan.md)
- [03. 제작 단계](./03-production-stage-plan.md)
- [04. 검토 단계](./04-review-stage-plan.md)
- [05. 예약/발행 단계](./05-publishing-stage-plan.md)
- [06. 성과분석 단계](./06-analysis-stage-plan.md)
- [07. 재활용 단계](./07-repurpose-stage-plan.md)

## 11. 실행 우선순위

1. Gate service와 서버 강제 로직
2. Gate preview UI와 단계 이동 모달
3. 단계별 산출물 패널
4. approval 생성/승인 UX
5. AI 초대/실행/산출물 연결 UX
6. 성과분석과 재활용 카드 연결

현재 완료된 기반 구현은 `StageGateService`, `/gate-preview`, `/move` Gate 강제, UI Gate preview dialog다. 이후 작업은 각 단계 workspace가 실제 evidence를 만들도록 연결하는 것이다.
