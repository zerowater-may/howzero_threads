# 03. 제작 단계 세부계획서

> Parent: `../2026-04-28-content-card-stage-collaboration-flow-design.md`
> Folder: `docs/superpowers/specs/2026-04-28-content-card-stage-collaboration-flow/`
> Principle: AI와 사람은 모두 `participants`에 초대되는 Actor이며, 단계 이동은 Gate 검증을 통과해야 한다.
> Diagram: `03-production-stage-map.excalidraw.md`
> Stage: `production`
> Next: `검토`
> Gate: `초안 선택`

## 1. 단계 미션

승인된 기획을 실제 제작물로 바꾼다. 여러 AI/사람 산출물 중 하나를 선택해 카드 본문 또는 발행 패키지 입력으로 반영한다.

실패한 설계는 다음과 같다: 제작 초안이 여러 개 생겼는데 어떤 버전이 최종인지 표시하지 않고 검토로 넘기는 것.

## 2. 완료 정의

이 단계는 아래 세 가지가 동시에 충족될 때 완료된 것으로 본다.

- 카드에 남아야 할 산출물이 원장에 저장되어 있다.
- 사람 또는 AI 담당자의 작업/판단이 activity로 남아 있다.
- 다음 단계 이동 Gate가 `allowed=true`를 반환한다.

## 3. 참여 Actor와 책임

| Actor | Type | 책임 |
| --- | --- | --- |
| Codex 제작자 | AI | 대본 초안, 구조 정리, CTA 작성 |
| Howaaa 카피라이터 | AI | 제목/캡션/댓글 유도 문구 작성 |
| 디자이너 또는 썸네일 QA | 사람/AI | 썸네일 방향, 소재 체크 |
| 콘텐츠 디렉터 | 사람 | 최종 반영 버전 선택 |

## 4. 입력 데이터 계약

| 입력 | 필수 내용 |
| --- | --- |
| content_brief | 기획 단계에서 승인된 제작 기준 |
| hook_set | 검증된 훅 후보 |
| brand constraints | 톤, 금지 표현, 채널별 길이 |

## 5. 단계 실행 순서

1. **제작 issue 배정**: 대본, 캡션, 소재를 각각 issue/sub-issue로 쪼개 담당자에게 배정한다.
2. **초안 생성**: AI 또는 사람이 산출물을 `issue_work_products`로 업로드한다.
3. **버전 비교**: 초안별 장점, 리스크, 사용 가능한 채널을 비교한다.
4. **최종 버전 선택**: 디렉터가 하나 이상의 산출물을 selected/primary 상태로 지정한다.
5. **본문 반영**: 선택된 산출물의 핵심 내용을 카드 본문 또는 metadata에 반영한다.
6. **반영 activity 기록**: 어떤 work product가 반영됐는지 activity_log에 남긴다.

## 6. 필수 산출물 계약

| 산출물 | 내용 |
| --- | --- |
| script_draft | 대본 또는 본문 초안 |
| caption_draft | 채널별 캡션/제목/해시태그 |
| asset_draft | 썸네일/이미지/소재 방향 |
| selected_output | 검토 단계로 보낼 선택 산출물 |

산출물 저장 원칙:

- AI 결과물은 본문에 바로 덮어쓰기 전에 `issue_work_products`에 먼저 저장한다.
- 사람이 선택한 산출물만 카드 본문, 발행 패키지, 다음 단계 입력으로 반영한다.
- 선택, 승인, 반려, 수정 요청은 `activity_log`와 approval 계열 기록으로 남긴다.

## 7. Gate 세부 조건

| Gate key | 통과 기준 |
| --- | --- |
| selected_output | ready/completed/done 또는 ready_for_review 상태의 제작 산출물이 있어야 한다. |
| reflected_activity | 산출물을 본문/패키지에 반영했다는 activity가 있어야 한다. |

Gate preview UI 문구:

```txt
현재 단계: 제작
다음 단계: 검토
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
| issue_work_products.status=ready|completed|done | 검토로 보낼 제작 산출물 |
| issue_work_products.reviewState=ready_for_review | 검토 준비 상태 |
| issue_work_products.isPrimary=true | 대표 산출물 |
| activity_log.action=issue.work_product_created|updated | 산출물 생성/수정 기록 |
| content_items.contentBodyPreview | 선택 초안의 본문 반영 결과 |

금지 구조:

- 화면 state에만 남는 산출물
- AI 탭에서만 보이는 별도 히스토리
- approval 없이 다음 단계 unlock
- activity_log 없이 조용히 바뀌는 stage

## 9. UI/UX 세부 요구사항

- 제작 워크스페이스는 산출물을 카드 그리드로 보여주고 primary 선택을 명확히 한다.
- 본문 textarea와 산출물 목록은 분리해 표시한다.
- 선택된 산출물에는 `검토로 보낼 버전` 라벨을 붙인다.
- Gate 실패 시 `선택 산출물 없음`, `반영 활동 없음`을 각각 표시한다.

공통 UI 원칙:

- 단계 탭 클릭은 stage 이동이 아니라 workspace view 전환이다.
- 실제 stage 이동은 footer/select/command palette/drag-drop 모두 같은 Gate preview를 사용한다.
- Gate 결과는 성공/실패만 보여주지 말고, 어떤 원장에 무엇이 부족한지 보여준다.

## 10. 생성 또는 재사용할 업무

업무는 새 테이블이 아니라 기존 `issues`와 `content_issue_links`를 사용한다.

권장 업무:

- `대본 초안 작성`
- `캡션 초안 작성`
- `소재 초안 작성`

업무 생성 규칙:

- 같은 카드와 같은 stage role에 이미 issue가 있으면 재사용한다.
- 자동 생성 issue의 `originId`는 `content:<contentItemId>:production` 형식을 우선 사용한다.
- AI 실행이 필요한 업무는 issue를 만든 뒤 heartbeat wakeup으로 연결한다.

## 11. 예외/엣지 케이스

- 오래된 카드라 필요한 metadata가 없으면 Gate preview에서 누락 항목으로 표시한다.
- 이전 단계로 되돌아가는 이동은 허용하되, 되돌아간 이유를 activity로 남기는 것이 좋다.
- 한 번에 두 단계 이상 건너뛰는 이동은 막는다.
- AI 작업이 실패하면 stage를 자동 이동하지 않고 해당 issue를 blocked 또는 failed 상태로 남긴다.

## 12. QA 체크리스트

- draft 상태 산출물만 있으면 review 이동이 막힌다.
- ready 산출물이 있어도 activity 기록이 없으면 review 이동이 막힌다.
- primary 산출물이 바뀌면 이전 primary는 해제된다.
- AI가 생성한 산출물도 issue_work_products에 남아야 한다.

## 13. 구현 연결점

현재 구현 기준:

- Gate service: `server/src/services/stage-gate.ts`
- Gate preview route: `GET /companies/:companyId/content/items/:itemId/gate-preview?stage=production`
- Stage move route: `POST /companies/:companyId/content/items/:itemId/move`
- UI move dialog: `ui/src/components/collaboration/StageMoveProposalDialog.tsx`
- Board caller: `ui/src/pages/ContentBoard.tsx`

이 단계의 세부 UI가 추가될 때도 위 Gate/Move 경로를 우회하지 않는다.
