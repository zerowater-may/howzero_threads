# 05. 예약/발행 단계 세부계획서

> Parent: `../2026-04-28-content-card-stage-collaboration-flow-design.md`
> Folder: `docs/superpowers/specs/2026-04-28-content-card-stage-collaboration-flow/`
> Principle: AI와 사람은 모두 `participants`에 초대되는 Actor이며, 단계 이동은 Gate 검증을 통과해야 한다.
> Diagram: `05-publishing-stage-map.excalidraw.md`
> Stage: `publishing`
> Next: `성과분석`
> Gate: `발행 승인`

## 1. 단계 미션

검토 완료 산출물을 채널별 발행 패키지로 확정하고 발행 승인 상태를 남긴다. 실제 외부 플랫폼 자동 발행은 범위 밖이지만, 예약/발행 기록은 카드에 남긴다.

실패한 설계는 다음과 같다: 발행 버튼만 누르고 누가 승인했는지, 어떤 캡션과 예약 시간으로 나갔는지 남기지 않는 것.

## 2. 완료 정의

이 단계는 아래 세 가지가 동시에 충족될 때 완료된 것으로 본다.

- 카드에 남아야 할 산출물이 원장에 저장되어 있다.
- 사람 또는 AI 담당자의 작업/판단이 activity로 남아 있다.
- 다음 단계 이동 Gate가 `allowed=true`를 반환한다.

## 3. 참여 Actor와 책임

| Actor | Type | 책임 |
| --- | --- | --- |
| 발행 담당자 | 사람 | 예약 시간 결정, 채널별 최종 문구 확인 |
| 대표/승인자 | 사람 | content_publish 승인 |
| Howaaa 운영 AI | AI | 채널별 패키지 정리, 예약 시간 제안 |
| 콘텐츠 디렉터 | 사람 | 패키지 최종 확인 |

## 4. 입력 데이터 계약

| 입력 | 필수 내용 |
| --- | --- |
| approved_output | 검토 단계에서 승인된 제작물 |
| channel config | youtube, shorts, blog, newsletter 등 채널 설정 |
| schedule constraints | 마감, 발행 시간, 캠페인 캘린더 |

## 5. 단계 실행 순서

1. **발행 패키지 생성**: 플랫폼별 제목, 설명, 캡션, 해시태그, 썸네일을 묶는다.
2. **예약안 생성**: AI가 과거 성과나 캠페인 캘린더 기반으로 예약 시간을 제안한다.
3. **사람 검토**: 발행 담당자가 문구와 시간을 확정한다.
4. **content_publish approval 생성**: 발행 전 approval을 만들고 승인자를 지정한다.
5. **승인 처리**: 승인자가 approved 상태로 전환한다.
6. **발행/예약 기록**: publishAt/scheduledAt과 activity_log를 갱신한다.

## 6. 필수 산출물 계약

| 산출물 | 내용 |
| --- | --- |
| publish_package | 채널별 최종 제목, 설명, 캡션, 썸네일, URL |
| schedule_plan | 예약 시간, 발행 담당자, 승인자 |
| content_publish_approval | 발행 승인 기록 |
| publish_activity | 예약/발행 상태 변화 기록 |

산출물 저장 원칙:

- AI 결과물은 본문에 바로 덮어쓰기 전에 `issue_work_products`에 먼저 저장한다.
- 사람이 선택한 산출물만 카드 본문, 발행 패키지, 다음 단계 입력으로 반영한다.
- 선택, 승인, 반려, 수정 요청은 `activity_log`와 approval 계열 기록으로 남긴다.

## 7. Gate 세부 조건

| Gate key | 통과 기준 |
| --- | --- |
| publish_approval | content_publish approval이 approved 상태여야 한다. |

Gate preview UI 문구:

```txt
현재 단계: 예약/발행
다음 단계: 성과분석
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
| approvals.type=content_publish | 발행 승인 요청 |
| approvals.status=approved | 발행 승인 완료 |
| content_items.publishAt | 예약/발행 시간 |
| content_items.automationStatus=waiting_approval|running | 발행 진행 상태 |
| activity_log.action=content.publish_approval_requested | 승인 요청 기록 |

금지 구조:

- 화면 state에만 남는 산출물
- AI 탭에서만 보이는 별도 히스토리
- approval 없이 다음 단계 unlock
- activity_log 없이 조용히 바뀌는 stage

## 9. UI/UX 세부 요구사항

- 예약/발행 워크스페이스는 승인 상태와 예약 시간을 가장 먼저 보여준다.
- 승인 전에는 analysis 이동을 막고 승인 요청 CTA를 보여준다.
- 채널별 패키지는 compact하게 접히는 섹션으로 표시한다.
- 외부 플랫폼 자동 발행 미연동 상태를 명확히 표시한다.

공통 UI 원칙:

- 단계 탭 클릭은 stage 이동이 아니라 workspace view 전환이다.
- 실제 stage 이동은 footer/select/command palette/drag-drop 모두 같은 Gate preview를 사용한다.
- Gate 결과는 성공/실패만 보여주지 말고, 어떤 원장에 무엇이 부족한지 보여준다.

## 10. 생성 또는 재사용할 업무

업무는 새 테이블이 아니라 기존 `issues`와 `content_issue_links`를 사용한다.

권장 업무:

- `발행 패키지 확정`
- `예약 설정`
- `발행 승인`

업무 생성 규칙:

- 같은 카드와 같은 stage role에 이미 issue가 있으면 재사용한다.
- 자동 생성 issue의 `originId`는 `content:<contentItemId>:publishing` 형식을 우선 사용한다.
- AI 실행이 필요한 업무는 issue를 만든 뒤 heartbeat wakeup으로 연결한다.

## 11. 예외/엣지 케이스

- 오래된 카드라 필요한 metadata가 없으면 Gate preview에서 누락 항목으로 표시한다.
- 이전 단계로 되돌아가는 이동은 허용하되, 되돌아간 이유를 activity로 남기는 것이 좋다.
- 한 번에 두 단계 이상 건너뛰는 이동은 막는다.
- AI 작업이 실패하면 stage를 자동 이동하지 않고 해당 issue를 blocked 또는 failed 상태로 남긴다.

## 12. QA 체크리스트

- content_publish approval이 pending이면 analysis 이동이 막힌다.
- approved이면 analysis 이동이 가능하다.
- approval payload에는 contentItemId가 포함되어야 한다.
- publishing 진입 시 approval 중복 생성이 없어야 한다.

## 13. 구현 연결점

현재 구현 기준:

- Gate service: `server/src/services/stage-gate.ts`
- Gate preview route: `GET /companies/:companyId/content/items/:itemId/gate-preview?stage=publishing`
- Stage move route: `POST /companies/:companyId/content/items/:itemId/move`
- UI move dialog: `ui/src/components/collaboration/StageMoveProposalDialog.tsx`
- Board caller: `ui/src/pages/ContentBoard.tsx`

이 단계의 세부 UI가 추가될 때도 위 Gate/Move 경로를 우회하지 않는다.
