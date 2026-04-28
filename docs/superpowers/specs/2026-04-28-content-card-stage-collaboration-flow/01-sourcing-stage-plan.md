# 01. 소싱 단계 플로우

> Parent: `2026-04-28-content-card-stage-collaboration-flow-design.md`  
> Diagram: `01-sourcing-stage-map.excalidraw.md`  
> Stage: `sourcing`  
> Gate: `Gate: 핀/근거 OK`

## 1. 목적

성과가 검증된 원본 후보를 카드의 기획 근거로 고정한다.

## 2. 입력값

- HOWAAA Trends 선택 영상
- 수동 아이디어
- 캠페인/프로젝트 brief

## 3. 사람/AI 협업

AI 작업:

- 트렌드 후보 요약
- 벤치마크 구조 비교
- 조회수·평균·성과율 스냅샷 정리

사람 판단:

- 어떤 영상을 근거로 쓸지 선택
- 너무 약한 후보 제거
- 카드 생성 확정

## 4. 필수 산출물

- `source_snapshot`
- `benchmark_summary`
- `pinned sources`

## 5. Gate 조건

다음 단계(`기획`)로 이동하려면 아래 조건을 만족해야 한다.

- source pin 1개 이상
- 지표 snapshot 저장
- 소싱 activity 기록

Gate 실패 시 stage 값은 바꾸지 않고, 누락 항목을 UI에 표시한다.

## 6. 기록 원장 매핑

- `content_items.metadata.selectedTrendVideos/sourcePins`
- `metadata.metricsSummary`
- `activity_log`

## 7. 생성/재사용할 업무

- 소싱 검토 업무
- 벤치마크 근거 정리 업무

## 8. UI 체크포인트

- 단계 탭 클릭은 보기 전환만 한다.
- 실제 stage 이동은 Gate preview → 이동 확인 → `/move` API 순서로만 처리한다.
- 산출물, 승인, 활동 기록이 화면에서만 보이고 원장에 남지 않는 구조는 금지한다.
- AI 담당자도 사람 담당자와 동일하게 participant로 표시한다.
