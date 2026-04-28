# 04. 검토 단계 세부계획서

> Parent: `../2026-04-28-content-card-stage-collaboration-flow-design.md`
> Folder: `docs/superpowers/specs/2026-04-28-content-card-stage-collaboration-flow/`
> Principle: AI와 사람은 모두 `participants`에 초대되는 Actor이며, 단계 이동은 Gate 검증을 통과해야 한다.
> Diagram: `04-review-stage-map.excalidraw.md`
> Stage: `review`
> Next: `예약/발행`
> Gate: `검토 완료`

## 1. 단계 미션

제작 산출물을 발행 가능한 품질로 검토한다. 팩트, 톤, 리스크, 채널 적합성을 확인하고 승인/반려 결정을 남긴다.

실패한 설계는 다음과 같다: 검토 탭에서 사람이 눈으로만 보고 아무 기록 없이 발행 단계로 넘기는 것.

## 2. 완료 정의

이 단계는 아래 세 가지가 동시에 충족될 때 완료된 것으로 본다.

- 카드에 남아야 할 산출물이 원장에 저장되어 있다.
- 사람 또는 AI 담당자의 작업/판단이 activity로 남아 있다.
- 다음 단계 이동 Gate가 `allowed=true`를 반환한다.

## 3. 참여 Actor와 책임

| Actor | Type | 책임 |
| --- | --- | --- |
| 대표/검수자 | 사람 | 최종 승인, 반려, 수정 요청 |
| 팩트 체크 AI | AI | 주장/숫자/출처 검증 |
| 브랜드 톤 QA | AI | 톤, 금지 표현, 과장 탐지 |
| 콘텐츠 디렉터 | 사람 | 수정 반영과 재검토 요청 |

## 4. 입력 데이터 계약

| 입력 | 필수 내용 |
| --- | --- |
| selected_output | 제작 단계에서 선택된 대표 산출물 |
| brand policy | 금지 표현, 법적 리스크, 톤 가이드 |
| source_snapshot | 소싱 단계의 원본 근거 |

## 5. 단계 실행 순서

1. **검토 요청 생성**: 검토 issue를 만들고 대표/검수자와 QA AI를 배정한다.
2. **팩트 체크**: 숫자, 인용, 주장, 원본 근거와의 일치 여부를 산출물로 남긴다.
3. **톤 체크**: 브랜드 톤, 과장, 자극성, 금지 표현을 검사한다.
4. **수정 요청**: 문제가 있으면 changes_requested 상태와 구체적 수정 항목을 남긴다.
5. **승인/반려 결정**: 검수자가 approved 또는 rejected decision을 남긴다.
6. **다음 단계 입력 고정**: 승인된 산출물만 발행 패키지 생성 입력으로 사용한다.

## 6. 필수 산출물 계약

| 산출물 | 내용 |
| --- | --- |
| review_report | 검토 요약과 결정 |
| fact_check | 검증된 주장과 수정 필요 주장 |
| tone_check | 브랜드 톤 적합성 결과 |
| approval_decision | 승인/반려/수정 요청 기록 |

산출물 저장 원칙:

- AI 결과물은 본문에 바로 덮어쓰기 전에 `issue_work_products`에 먼저 저장한다.
- 사람이 선택한 산출물만 카드 본문, 발행 패키지, 다음 단계 입력으로 반영한다.
- 선택, 승인, 반려, 수정 요청은 `activity_log`와 approval 계열 기록으로 남긴다.

## 7. Gate 세부 조건

| Gate key | 통과 기준 |
| --- | --- |
| review_complete | review/fact/tone 산출물 또는 reviewState 기록이 있어야 한다. |
| approval_decision | 승인 또는 반려 decision이 있어야 한다. |

Gate preview UI 문구:

```txt
현재 단계: 검토
다음 단계: 예약/발행
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
| issue_work_products.reviewState=approved|changes_requested|rejected | 검토 상태 |
| issue_work_products.type=review_report|fact_check|tone_check | 검토 산출물 |
| approvals.payload.stage=review | 검토 승인 기록 |
| activity_log.action=approval.approved|rejected|revision_requested | 검토 decision |

금지 구조:

- 화면 state에만 남는 산출물
- AI 탭에서만 보이는 별도 히스토리
- approval 없이 다음 단계 unlock
- activity_log 없이 조용히 바뀌는 stage

## 9. UI/UX 세부 요구사항

- 검토 워크스페이스는 본문 미리보기, 검토 산출물, 승인 패널을 같은 화면에 배치한다.
- 수정 요청은 작업으로 생성되어 production 단계로 되돌릴 수 있어야 한다.
- 발행 승인 요청 버튼은 검토 Gate 상태를 먼저 보여준다.
- 반려된 콘텐츠는 publishing으로 이동할 수 없다.

공통 UI 원칙:

- 단계 탭 클릭은 stage 이동이 아니라 workspace view 전환이다.
- 실제 stage 이동은 footer/select/command palette/drag-drop 모두 같은 Gate preview를 사용한다.
- Gate 결과는 성공/실패만 보여주지 말고, 어떤 원장에 무엇이 부족한지 보여준다.

## 10. 생성 또는 재사용할 업무

업무는 새 테이블이 아니라 기존 `issues`와 `content_issue_links`를 사용한다.

권장 업무:

- `팩트 체크`
- `브랜드 톤 검수`
- `최종 검토`

업무 생성 규칙:

- 같은 카드와 같은 stage role에 이미 issue가 있으면 재사용한다.
- 자동 생성 issue의 `originId`는 `content:<contentItemId>:review` 형식을 우선 사용한다.
- AI 실행이 필요한 업무는 issue를 만든 뒤 heartbeat wakeup으로 연결한다.

## 11. 예외/엣지 케이스

- 오래된 카드라 필요한 metadata가 없으면 Gate preview에서 누락 항목으로 표시한다.
- 이전 단계로 되돌아가는 이동은 허용하되, 되돌아간 이유를 activity로 남기는 것이 좋다.
- 한 번에 두 단계 이상 건너뛰는 이동은 막는다.
- AI 작업이 실패하면 stage를 자동 이동하지 않고 해당 issue를 blocked 또는 failed 상태로 남긴다.

## 12. QA 체크리스트

- review 산출물이 없으면 publishing 이동이 막힌다.
- review 산출물이 있어도 승인/반려 decision이 없으면 publishing 이동이 막힌다.
- 반려 decision은 다음 단계 이동이 아니라 production 재작업을 유도한다.
- 승인된 산출물만 publish package 입력으로 사용된다.

## 13. 구현 연결점

현재 구현 기준:

- Gate service: `server/src/services/stage-gate.ts`
- Gate preview route: `GET /companies/:companyId/content/items/:itemId/gate-preview?stage=review`
- Stage move route: `POST /companies/:companyId/content/items/:itemId/move`
- UI move dialog: `ui/src/components/collaboration/StageMoveProposalDialog.tsx`
- Board caller: `ui/src/pages/ContentBoard.tsx`

이 단계의 세부 UI가 추가될 때도 위 Gate/Move 경로를 우회하지 않는다.
