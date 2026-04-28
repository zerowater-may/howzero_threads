# 06. 성과분석 단계 세부계획서

> Parent: `../2026-04-28-content-card-stage-collaboration-flow-design.md`
> Folder: `docs/superpowers/specs/2026-04-28-content-card-stage-collaboration-flow/`
> Principle: AI와 사람은 모두 `participants`에 초대되는 Actor이며, 단계 이동은 Gate 검증을 통과해야 한다.
> Diagram: `06-analysis-stage-map.excalidraw.md`
> Stage: `analysis`
> Next: `재활용`
> Gate: `성과 기록`

## 1. 단계 미션

발행 후 실제 성과를 소싱 단계의 벤치마크와 비교한다. 성공/실패 원인을 기록하고 재활용 여부를 판단한다.

실패한 설계는 다음과 같다: 발행 후 성과 숫자를 보지 않고 재활용 카드를 만드는 것. 또는 숫자는 봤지만 원본 벤치마크와 비교하지 않는 것.

## 2. 완료 정의

이 단계는 아래 세 가지가 동시에 충족될 때 완료된 것으로 본다.

- 카드에 남아야 할 산출물이 원장에 저장되어 있다.
- 사람 또는 AI 담당자의 작업/판단이 activity로 남아 있다.
- 다음 단계 이동 Gate가 `allowed=true`를 반환한다.

## 3. 참여 Actor와 책임

| Actor | Type | 책임 |
| --- | --- | --- |
| Howaaa 분석가 | AI | 성과 지표 수집 요약, 벤치마크 대비 분석 |
| 콘텐츠 디렉터 | 사람 | 성공/실패 판단, 다음 액션 결정 |
| 마케팅 담당자 | 사람 | 캠페인 KPI와 연결 |

## 4. 입력 데이터 계약

| 입력 | 필수 내용 |
| --- | --- |
| publish record | 발행일, 채널, URL, 캠페인 |
| actual metrics | 조회수, 시청 지속, 클릭, 댓글, 저장, 전환 |
| source benchmark | 소싱 당시 원본 영상 지표와 성과율 |

## 5. 단계 실행 순서

1. **실측 지표 snapshot**: 발행 후 기준 시점의 지표를 metadata에 저장한다.
2. **벤치마크 대비**: 소싱 원본 대비 얼마나 따라갔는지, 다른 점이 무엇인지 분석한다.
3. **원인 추정**: 성공/실패 원인을 제목, 썸네일, 훅, 채널, 타이밍으로 나눠 기록한다.
4. **학습 기록**: 다음 콘텐츠에 재사용할 패턴과 피해야 할 패턴을 남긴다.
5. **재활용 후보 판단**: 쇼츠/릴스/뉴스레터/블로그 등 파생 가능성을 평가한다.
6. **분석 산출물 승인**: 사람이 분석 결론과 재활용 여부를 확정한다.

## 6. 필수 산출물 계약

| 산출물 | 내용 |
| --- | --- |
| actual_metrics_snapshot | 실제 성과 지표 |
| performance_report | 벤치마크 대비 결과와 원인 분석 |
| learning_notes | 재사용할 인사이트 |
| repurpose_recommendation | 재활용 후보와 우선순위 |

산출물 저장 원칙:

- AI 결과물은 본문에 바로 덮어쓰기 전에 `issue_work_products`에 먼저 저장한다.
- 사람이 선택한 산출물만 카드 본문, 발행 패키지, 다음 단계 입력으로 반영한다.
- 선택, 승인, 반려, 수정 요청은 `activity_log`와 approval 계열 기록으로 남긴다.

## 7. Gate 세부 조건

| Gate key | 통과 기준 |
| --- | --- |
| actual_metrics_snapshot | 실측 지표 snapshot이 있어야 한다. |
| analysis_output | 성과 분석 산출물이 있어야 한다. |

Gate preview UI 문구:

```txt
현재 단계: 성과분석
다음 단계: 재활용
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
| content_items.metadata.actualMetrics | 실측 지표 |
| content_items.metadata.analysisMetrics | 분석용 지표 |
| issue_work_products.type=performance_report | 성과 분석 산출물 |
| activity_log.action=content.analysis_recorded | 분석 기록 |

금지 구조:

- 화면 state에만 남는 산출물
- AI 탭에서만 보이는 별도 히스토리
- approval 없이 다음 단계 unlock
- activity_log 없이 조용히 바뀌는 stage

## 9. UI/UX 세부 요구사항

- 성과분석 워크스페이스는 실제 성과와 원본 벤치마크를 나란히 비교한다.
- 숫자만 나열하지 않고 `왜`를 메모/산출물로 남기게 한다.
- 재활용 후보는 다음 단계 CTA로 표시한다.
- 실측 지표가 없으면 수동 입력 또는 수집 실행 CTA를 보여준다.

공통 UI 원칙:

- 단계 탭 클릭은 stage 이동이 아니라 workspace view 전환이다.
- 실제 stage 이동은 footer/select/command palette/drag-drop 모두 같은 Gate preview를 사용한다.
- Gate 결과는 성공/실패만 보여주지 말고, 어떤 원장에 무엇이 부족한지 보여준다.

## 10. 생성 또는 재사용할 업무

업무는 새 테이블이 아니라 기존 `issues`와 `content_issue_links`를 사용한다.

권장 업무:

- `성과 리포트 작성`
- `벤치마크 대비 분석`
- `재활용 후보 선별`

업무 생성 규칙:

- 같은 카드와 같은 stage role에 이미 issue가 있으면 재사용한다.
- 자동 생성 issue의 `originId`는 `content:<contentItemId>:analysis` 형식을 우선 사용한다.
- AI 실행이 필요한 업무는 issue를 만든 뒤 heartbeat wakeup으로 연결한다.

## 11. 예외/엣지 케이스

- 오래된 카드라 필요한 metadata가 없으면 Gate preview에서 누락 항목으로 표시한다.
- 이전 단계로 되돌아가는 이동은 허용하되, 되돌아간 이유를 activity로 남기는 것이 좋다.
- 한 번에 두 단계 이상 건너뛰는 이동은 막는다.
- AI 작업이 실패하면 stage를 자동 이동하지 않고 해당 issue를 blocked 또는 failed 상태로 남긴다.

## 12. QA 체크리스트

- actualMetrics가 없으면 repurpose 이동이 막힌다.
- performance_report가 없으면 repurpose 이동이 막힌다.
- 소싱 snapshot이 없는 오래된 카드는 분석 비교에서 결측 상태를 표시한다.
- 실측 지표 수정은 activity_log에 남는다.

## 13. 구현 연결점

현재 구현 기준:

- Gate service: `server/src/services/stage-gate.ts`
- Gate preview route: `GET /companies/:companyId/content/items/:itemId/gate-preview?stage=analysis`
- Stage move route: `POST /companies/:companyId/content/items/:itemId/move`
- UI move dialog: `ui/src/components/collaboration/StageMoveProposalDialog.tsx`
- Board caller: `ui/src/pages/ContentBoard.tsx`

이 단계의 세부 UI가 추가될 때도 위 Gate/Move 경로를 우회하지 않는다.
