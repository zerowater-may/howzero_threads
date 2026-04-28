# 01. 소싱 단계 세부계획서

> Parent: `../2026-04-28-content-card-stage-collaboration-flow-design.md`
> Folder: `docs/superpowers/specs/2026-04-28-content-card-stage-collaboration-flow/`
> Principle: AI와 사람은 모두 `participants`에 초대되는 Actor이며, 단계 이동은 Gate 검증을 통과해야 한다.
> Diagram: `01-sourcing-stage-map.excalidraw.md`
> Stage: `sourcing`
> Next: `기획`
> Gate: `핀/근거 OK`

## 1. 단계 미션

콘텐츠 카드가 왜 생성됐는지 설명할 수 있는 원본 근거를 고정한다. HOWAAA Trends, 수동 아이디어, 캠페인 brief 중 어디서 출발했든 카드 생성 시점의 판단 근거를 snapshot으로 남긴다.

실패한 설계는 다음과 같다: 단순히 제목만 적힌 빈 카드를 만들고 기획으로 넘기는 것. 원본 URL, 지표, 선택 이유가 없으면 다음 단계에서 AI가 근거 없는 기획을 만들게 된다.

## 2. 완료 정의

이 단계는 아래 세 가지가 동시에 충족될 때 완료된 것으로 본다.

- 카드에 남아야 할 산출물이 원장에 저장되어 있다.
- 사람 또는 AI 담당자의 작업/판단이 activity로 남아 있다.
- 다음 단계 이동 Gate가 `allowed=true`를 반환한다.

## 3. 참여 Actor와 책임

| Actor | Type | 책임 |
| --- | --- | --- |
| 콘텐츠 디렉터 | 사람 | 최종 후보 선택, 카드 생성 확정, 약한 후보 제거 |
| Howaaa 리서처 | AI | 트렌드 후보 요약, 벤치마크 구조 비교, 지표 snapshot 정리 |
| 브랜드 담당자 | 사람 | 캠페인 적합성, 금지 주제, 브랜드 리스크 확인 |

## 4. 입력 데이터 계약

| 입력 | 필수 내용 |
| --- | --- |
| HOWAAA Trends 선택 영상 | trendVideoId, title, channelTitle, thumbnailUrl, viewCount, averageViewCount, performanceRate, format, collectedAt |
| 수동 아이디어 | 문제/관찰/제안자/출처/관련 캠페인 |
| 캠페인 brief | 목표 고객, 제품/서비스, KPI, 금지 표현, 마감 |

## 5. 단계 실행 순서

1. **후보 수집**: HOWAAA Trends에서 선택된 영상 또는 수동 아이디어를 카드 입력 후보로 모은다.
2. **원본 snapshot 생성**: 선택 당시의 지표와 썸네일/URL을 `content_items.metadata`에 저장한다.
3. **근거 요약**: AI가 왜 이 후보가 유효한지 3~5줄로 요약하고 `benchmark_summary` 산출물로 남긴다.
4. **사람 선택**: 디렉터가 실제 카드에 핀할 원본을 선택하고 약한 후보는 제외한다.
5. **초기 issue 연결**: 카드가 생성되면 소싱 또는 기획 초기 issue를 `content_issue_links`에 연결한다.
6. **activity 기록**: 카드 생성, 소스 핀, 후보 제외, snapshot 저장을 `activity_log`에 남긴다.

## 6. 필수 산출물 계약

| 산출물 | 내용 |
| --- | --- |
| source_snapshot | 선택 시점의 원본 URL, 썸네일, 제목, 채널, 게시일, 수집일 |
| metrics_snapshot | 조회수, 채널 평균, 성과율, 포맷, 구독자 수 |
| benchmark_summary | 왜 이 후보가 참고 가치가 있는지에 대한 짧은 분석 |
| pinned_sources | 카드에 실제로 귀속된 원본 목록 |

산출물 저장 원칙:

- AI 결과물은 본문에 바로 덮어쓰기 전에 `issue_work_products`에 먼저 저장한다.
- 사람이 선택한 산출물만 카드 본문, 발행 패키지, 다음 단계 입력으로 반영한다.
- 선택, 승인, 반려, 수정 요청은 `activity_log`와 approval 계열 기록으로 남긴다.

## 7. Gate 세부 조건

| Gate key | 통과 기준 |
| --- | --- |
| source_pin | 1개 이상의 source pin 또는 selectedTrendVideos가 있어야 한다. |
| metrics_snapshot | metricsSummary, metricsSnapshot, performanceMetrics 중 하나가 있어야 한다. |
| activity_evidence | 카드 생성 또는 소스 핀 활동이 activity_log에 남아야 한다. |

Gate preview UI 문구:

```txt
현재 단계: 소싱
다음 단계: 기획
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
| content_items.metadata.selectedTrendVideos[] | HOWAAA Trends 기반 카드의 원본 영상 snapshot |
| content_items.metadata.sourcePins[] | 수동 아이디어 또는 외부 URL 기반 source pin |
| content_items.metadata.metricsSummary | 카드 생성 시점의 핵심 지표 |
| content_issue_links.role=sourcing | 소싱 단계 업무 issue 연결 |
| activity_log.action=howaaa.benchmark_content_created | HOWAAA 후보에서 카드 생성된 기록 |

금지 구조:

- 화면 state에만 남는 산출물
- AI 탭에서만 보이는 별도 히스토리
- approval 없이 다음 단계 unlock
- activity_log 없이 조용히 바뀌는 stage

## 9. UI/UX 세부 요구사항

- 소싱 워크스페이스 상단에는 pinned benchmark/source 요약을 먼저 보여준다.
- 썸네일, 원본 제목, 채널, 조회수, 성과율, 게시일은 한 화면에 들어와야 한다.
- source가 없을 때는 HOWAAA Trends로 이동하는 CTA를 보여준다.
- Gate preview 실패 시 `소스 핀`, `지표 스냅샷`, `활동 기록` 중 누락 항목을 표시한다.

공통 UI 원칙:

- 단계 탭 클릭은 stage 이동이 아니라 workspace view 전환이다.
- 실제 stage 이동은 footer/select/command palette/drag-drop 모두 같은 Gate preview를 사용한다.
- Gate 결과는 성공/실패만 보여주지 말고, 어떤 원장에 무엇이 부족한지 보여준다.

## 10. 생성 또는 재사용할 업무

업무는 새 테이블이 아니라 기존 `issues`와 `content_issue_links`를 사용한다.

권장 업무:

- `소싱 후보 검토`
- `벤치마크 근거 정리`
- `원본 snapshot 확인`

업무 생성 규칙:

- 같은 카드와 같은 stage role에 이미 issue가 있으면 재사용한다.
- 자동 생성 issue의 `originId`는 `content:<contentItemId>:sourcing` 형식을 우선 사용한다.
- AI 실행이 필요한 업무는 issue를 만든 뒤 heartbeat wakeup으로 연결한다.

## 11. 예외/엣지 케이스

- 오래된 카드라 필요한 metadata가 없으면 Gate preview에서 누락 항목으로 표시한다.
- 이전 단계로 되돌아가는 이동은 허용하되, 되돌아간 이유를 activity로 남기는 것이 좋다.
- 한 번에 두 단계 이상 건너뛰는 이동은 막는다.
- AI 작업이 실패하면 stage를 자동 이동하지 않고 해당 issue를 blocked 또는 failed 상태로 남긴다.

## 12. QA 체크리스트

- HOWAAA Trends에서 카드 생성 시 selectedTrendVideos가 저장된다.
- 수동 카드 생성 시 sourcePins가 없으면 planning 이동이 막힌다.
- source pin과 metricsSummary가 있어도 activity_log가 없으면 Gate가 실패한다.
- 이전 단계로 돌아가는 이동은 Gate 없이 허용된다.

## 13. 구현 연결점

현재 구현 기준:

- Gate service: `server/src/services/stage-gate.ts`
- Gate preview route: `GET /companies/:companyId/content/items/:itemId/gate-preview?stage=sourcing`
- Stage move route: `POST /companies/:companyId/content/items/:itemId/move`
- UI move dialog: `ui/src/components/collaboration/StageMoveProposalDialog.tsx`
- Board caller: `ui/src/pages/ContentBoard.tsx`

이 단계의 세부 UI가 추가될 때도 위 Gate/Move 경로를 우회하지 않는다.
