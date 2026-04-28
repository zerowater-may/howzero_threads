# 02. 기획 단계 세부계획서

> Parent: `../2026-04-28-content-card-stage-collaboration-flow-design.md`
> Folder: `docs/superpowers/specs/2026-04-28-content-card-stage-collaboration-flow/`
> Principle: AI와 사람은 모두 `participants`에 초대되는 Actor이며, 단계 이동은 Gate 검증을 통과해야 한다.
> Diagram: `02-planning-stage-map.excalidraw.md`
> Stage: `planning`
> Next: `제작`
> Gate: `전략 승인`

## 1. 단계 미션

소싱 근거를 실제 콘텐츠 전략으로 바꾼다. 이 단계의 핵심은 AI가 여러 전략을 제안하고, 사람이 하나를 승인해 제작 기준을 확정하는 것이다.

실패한 설계는 다음과 같다: AI가 본문 textarea에 바로 긴 초안을 덮어쓰고, 왜 그 전략을 선택했는지 승인 기록 없이 제작으로 넘기는 것.

## 2. 완료 정의

이 단계는 아래 세 가지가 동시에 충족될 때 완료된 것으로 본다.

- 카드에 남아야 할 산출물이 원장에 저장되어 있다.
- 사람 또는 AI 담당자의 작업/판단이 activity로 남아 있다.
- 다음 단계 이동 Gate가 `allowed=true`를 반환한다.

## 3. 참여 Actor와 책임

| Actor | Type | 책임 |
| --- | --- | --- |
| 콘텐츠 디렉터 | 사람 | 전략 선택, 훅 승인, 톤/수위 결정 |
| Howaaa 전략가 | AI | 전략 초안, 각도 비교, 성공 패턴 분석 |
| Codex 제작자 | AI | 대본 구조 초안, 훅 5개, 체크리스트 초안 |
| 대표/검수자 | 사람 | 브랜드 리스크, 메시지 수위, 최종 승인 |

## 4. 입력 데이터 계약

| 입력 | 필수 내용 |
| --- | --- |
| source_snapshot | 소싱 단계에서 고정된 원본과 지표 |
| brand/persona context | 하우제로/용감한용팀장/브랜드별 톤 |
| campaign constraints | 목표, 금지 표현, 마감, 우선순위 |

## 5. 단계 실행 순서

1. **전략 후보 생성**: AI가 2~3개 콘텐츠 각도를 `issue_work_products`로 제안한다.
2. **훅 세트 작성**: 각 전략마다 제목/첫 문장/댓글 유도 훅을 5개 이상 만든다.
3. **구성안 작성**: 선택 가능한 `content_brief`를 문제-증거-전환-CTA 구조로 만든다.
4. **사람 검토**: 디렉터가 전략을 채택, 수정 요청, 반려 중 하나로 결정한다.
5. **approval 생성**: 제작 진입 전에 `content_stage_gate` 또는 stage payload approval을 approved로 남긴다.
6. **기획 산출물 고정**: 승인된 전략만 제작 단계의 입력으로 표시한다.

## 6. 필수 산출물 계약

| 산출물 | 내용 |
| --- | --- |
| strategy_draft | 콘텐츠 각도, 핵심 주장, 성공 근거, 리스크 |
| hook_set | 훅 5개 이상, 각 훅의 의도와 사용 위치 |
| content_brief | 제작자가 따라야 할 구성, 톤, CTA, 금지사항 |
| approval_decision | 누가 어떤 전략을 승인했는지 |

산출물 저장 원칙:

- AI 결과물은 본문에 바로 덮어쓰기 전에 `issue_work_products`에 먼저 저장한다.
- 사람이 선택한 산출물만 카드 본문, 발행 패키지, 다음 단계 입력으로 반영한다.
- 선택, 승인, 반려, 수정 요청은 `activity_log`와 approval 계열 기록으로 남긴다.

## 7. Gate 세부 조건

| Gate key | 통과 기준 |
| --- | --- |
| strategy_output | strategy/plan/script/outline 계열 work product 또는 충분한 카드 본문이 있어야 한다. |
| human_approval | 사람 Actor가 승인한 approval이 있어야 한다. |

Gate preview UI 문구:

```txt
현재 단계: 기획
다음 단계: 제작
통과 상태: allowed | blocked
부족한 evidence: Gate key별 누락 사유 표시
```

Gate 실패 처리:

- `/move` API는 stage 값을 변경하지 않는다.
- UI는 이동 버튼을 비활성화하고 누락 항목을 표시한다.
- 누락 항목을 채운 뒤 같은 이동 액션을 다시 실행한다.

## 8. 기록 원장 매핑

| 저장 위치 | 용도 |
| --- | --- |
| issue_work_products.type=content_strategy | 전략 초안 |
| issue_work_products.type=hook_set | 훅 세트 |
| issue_work_products.type=content_brief | 승인된 제작 brief |
| approvals.type=content_stage_gate | 제작 진입 승인 |
| activity_log.action=approval.approved | 승인 활동 기록 |

금지 구조:

- 화면 state에만 남는 산출물
- AI 탭에서만 보이는 별도 히스토리
- approval 없이 다음 단계 unlock
- activity_log 없이 조용히 바뀌는 stage

## 9. UI/UX 세부 요구사항

- 기획 워크스페이스는 본문 textarea보다 전략 후보와 승인 상태를 먼저 보여준다.
- AI 초대 버튼은 담당자 추가이며, 실행 버튼과 분리한다.
- 승인된 전략에는 `제작 입력으로 고정됨` 상태를 표시한다.
- Gate 실패 시 전략 산출물과 사람 승인 중 어떤 것이 빠졌는지 분리해서 보여준다.

공통 UI 원칙:

- 단계 탭 클릭은 stage 이동이 아니라 workspace view 전환이다.
- 실제 stage 이동은 footer/select/command palette/drag-drop 모두 같은 Gate preview를 사용한다.
- Gate 결과는 성공/실패만 보여주지 말고, 어떤 원장에 무엇이 부족한지 보여준다.

## 10. 생성 또는 재사용할 업무

업무는 새 테이블이 아니라 기존 `issues`와 `content_issue_links`를 사용한다.

권장 업무:

- `전략 초안 작성`
- `후킹 5개 검토`
- `기획 승인`

업무 생성 규칙:

- 같은 카드와 같은 stage role에 이미 issue가 있으면 재사용한다.
- 자동 생성 issue의 `originId`는 `content:<contentItemId>:planning` 형식을 우선 사용한다.
- AI 실행이 필요한 업무는 issue를 만든 뒤 heartbeat wakeup으로 연결한다.

## 11. 예외/엣지 케이스

- 오래된 카드라 필요한 metadata가 없으면 Gate preview에서 누락 항목으로 표시한다.
- 이전 단계로 되돌아가는 이동은 허용하되, 되돌아간 이유를 activity로 남기는 것이 좋다.
- 한 번에 두 단계 이상 건너뛰는 이동은 막는다.
- AI 작업이 실패하면 stage를 자동 이동하지 않고 해당 issue를 blocked 또는 failed 상태로 남긴다.

## 12. QA 체크리스트

- 본문이 짧고 work product가 없으면 production 이동이 막힌다.
- 전략 산출물이 있어도 approval이 없으면 production 이동이 막힌다.
- approval이 approved이면 production 이동이 가능해야 한다.
- 반려된 전략은 Gate evidence로 인정하지 않는다.

## 13. 구현 연결점

현재 구현 기준:

- Gate service: `server/src/services/stage-gate.ts`
- Gate preview route: `GET /companies/:companyId/content/items/:itemId/gate-preview?stage=planning`
- Stage move route: `POST /companies/:companyId/content/items/:itemId/move`
- UI move dialog: `ui/src/components/collaboration/StageMoveProposalDialog.tsx`
- Board caller: `ui/src/pages/ContentBoard.tsx`

이 단계의 세부 UI가 추가될 때도 위 Gate/Move 경로를 우회하지 않는다.
