# 07. 재활용 단계 세부계획서

> Parent: `../2026-04-28-content-card-stage-collaboration-flow-design.md`
> Folder: `docs/superpowers/specs/2026-04-28-content-card-stage-collaboration-flow/`
> Principle: AI와 사람은 모두 `participants`에 초대되는 Actor이며, 단계 이동은 Gate 검증을 통과해야 한다.
> Diagram: `07-repurpose-stage-map.excalidraw.md`
> Stage: `repurpose`
> Next: `새 카드/종료`
> Gate: `파생 연결`

## 1. 단계 미션

성과가 검증된 콘텐츠를 파생 카드로 확장한다. 원본과 파생물의 관계를 명확히 남겨 어떤 학습이 어디로 이어졌는지 추적한다.

실패한 설계는 다음과 같다: 좋았던 콘텐츠를 복사해 새 카드로 만들지만 원본 카드와 연결하지 않는 것.

## 2. 완료 정의

이 단계는 아래 세 가지가 동시에 충족될 때 완료된 것으로 본다.

- 카드에 남아야 할 산출물이 원장에 저장되어 있다.
- 사람 또는 AI 담당자의 작업/판단이 activity로 남아 있다.
- 다음 단계 이동 Gate가 `allowed=true`를 반환한다.

## 3. 참여 Actor와 책임

| Actor | Type | 책임 |
| --- | --- | --- |
| 콘텐츠 디렉터 | 사람 | 파생 채널 선택, 우선순위 결정 |
| Howaaa 재활용 AI | AI | 채널별 변환안과 재활용 전략 작성 |
| 채널 담당자 | 사람 | 채널 적합성 확인 |

## 4. 입력 데이터 계약

| 입력 | 필수 내용 |
| --- | --- |
| performance_report | 성과분석 결과 |
| repurpose_recommendation | AI 또는 사람이 제안한 파생 후보 |
| source content item | 원본 카드 ID와 산출물 |

## 5. 단계 실행 순서

1. **파생 후보 생성**: AI가 쇼츠, 릴스, 뉴스레터, 링크드인 등 채널별 변환안을 작성한다.
2. **사람 선택**: 디렉터가 실제로 만들 파생물을 선택한다.
3. **파생 카드 생성**: 새 content_items를 만들고 sourceContentItemId로 원본을 연결한다.
4. **재활용 issue 연결**: 원본 카드와 파생 카드 각각에 repurpose role issue를 연결한다.
5. **원본 학습 복사**: 성과분석의 핵심 인사이트를 파생 카드 metadata에 snapshot으로 복사한다.
6. **종료 기록**: 원본 카드에는 어떤 파생물이 생성됐는지 activity와 metadata로 남긴다.

## 6. 필수 산출물 계약

| 산출물 | 내용 |
| --- | --- |
| repurpose_plan | 파생 채널, 각도, 변환 방식 |
| derivative_content_items | 원본과 연결된 새 카드 |
| source_derivative_link | 원본-파생 연결 정보 |
| repurpose_tasks | 파생물 제작 업무 |

산출물 저장 원칙:

- AI 결과물은 본문에 바로 덮어쓰기 전에 `issue_work_products`에 먼저 저장한다.
- 사람이 선택한 산출물만 카드 본문, 발행 패키지, 다음 단계 입력으로 반영한다.
- 선택, 승인, 반려, 수정 요청은 `activity_log`와 approval 계열 기록으로 남긴다.

## 7. Gate 세부 조건

| Gate key | 통과 기준 |
| --- | --- |
| derivative_link | sourceContentItemId 또는 derivativeContentItemIds 연결이 있어야 한다. |
| repurpose_task | repurpose 역할의 issue/task가 있어야 한다. |

Gate preview UI 문구:

```txt
현재 단계: 재활용
다음 단계: 새 카드/종료
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
| content_items.sourceContentItemId | 파생 카드의 원본 카드 ID |
| content_items.metadata.derivativeContentItemIds | 원본 카드가 가진 파생 카드 목록 |
| content_issue_links.role=repurpose | 재활용 업무 issue 연결 |
| activity_log.action=content.repurpose_created | 파생 생성 기록 |

금지 구조:

- 화면 state에만 남는 산출물
- AI 탭에서만 보이는 별도 히스토리
- approval 없이 다음 단계 unlock
- activity_log 없이 조용히 바뀌는 stage

## 9. UI/UX 세부 요구사항

- 재활용 워크스페이스는 원본 카드와 파생 카드 관계를 그래프로 보여준다.
- 파생 후보는 채널별로 비교할 수 있어야 한다.
- 새 카드 생성 후 바로 해당 카드로 이동할 수 있어야 한다.
- 원본-파생 연결이 없으면 완료 상태로 보이지 않는다.

공통 UI 원칙:

- 단계 탭 클릭은 stage 이동이 아니라 workspace view 전환이다.
- 실제 stage 이동은 footer/select/command palette/drag-drop 모두 같은 Gate preview를 사용한다.
- Gate 결과는 성공/실패만 보여주지 말고, 어떤 원장에 무엇이 부족한지 보여준다.

## 10. 생성 또는 재사용할 업무

업무는 새 테이블이 아니라 기존 `issues`와 `content_issue_links`를 사용한다.

권장 업무:

- `파생 카드 생성`
- `채널별 변환`
- `재활용 실행`

업무 생성 규칙:

- 같은 카드와 같은 stage role에 이미 issue가 있으면 재사용한다.
- 자동 생성 issue의 `originId`는 `content:<contentItemId>:repurpose` 형식을 우선 사용한다.
- AI 실행이 필요한 업무는 issue를 만든 뒤 heartbeat wakeup으로 연결한다.

## 11. 예외/엣지 케이스

- 오래된 카드라 필요한 metadata가 없으면 Gate preview에서 누락 항목으로 표시한다.
- 이전 단계로 되돌아가는 이동은 허용하되, 되돌아간 이유를 activity로 남기는 것이 좋다.
- 한 번에 두 단계 이상 건너뛰는 이동은 막는다.
- AI 작업이 실패하면 stage를 자동 이동하지 않고 해당 issue를 blocked 또는 failed 상태로 남긴다.

## 12. QA 체크리스트

- sourceContentItemId 없이 파생 카드만 만들면 Gate가 실패한다.
- repurpose issue가 없으면 Gate가 실패한다.
- 원본 카드에서 파생 카드 목록을 확인할 수 있어야 한다.
- 파생 카드도 다시 sourcing/planning 흐름을 탈 수 있어야 한다.

## 13. 구현 연결점

현재 구현 기준:

- Gate service: `server/src/services/stage-gate.ts`
- Gate preview route: `GET /companies/:companyId/content/items/:itemId/gate-preview?stage=repurpose`
- Stage move route: `POST /companies/:companyId/content/items/:itemId/move`
- UI move dialog: `ui/src/components/collaboration/StageMoveProposalDialog.tsx`
- Board caller: `ui/src/pages/ContentBoard.tsx`

이 단계의 세부 UI가 추가될 때도 위 Gate/Move 경로를 우회하지 않는다.
