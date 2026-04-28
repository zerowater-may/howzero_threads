# 06. 성과분석 단계 플로우

> Parent: `2026-04-28-content-card-stage-collaboration-flow-design.md`  
> Diagram: `06-analysis-stage-map.excalidraw.md`  
> Stage: `analysis`  
> Gate: `Gate: 성과 기록`

## 1. 목적

발행 후 실제 성과를 원본 벤치마크와 비교하고 다음 액션을 결정한다.

## 2. 입력값

- 발행 결과
- 실측 지표
- 소싱 벤치마크

## 3. 사람/AI 협업

AI 작업:

- 성과 원인 추정
- 벤치마크 대비 분석
- 재활용 후보 제안

사람 판단:

- 성공/실패 판단
- 재활용 여부 결정
- 다음 실험 정의

## 4. 필수 산출물

- `performance_report`
- `actual_metrics_snapshot`

## 5. Gate 조건

다음 단계(`재활용`)로 이동하려면 아래 조건을 만족해야 한다.

- 실제 지표 snapshot
- 분석 산출물 존재

Gate 실패 시 stage 값은 바꾸지 않고, 누락 항목을 UI에 표시한다.

## 6. 기록 원장 매핑

- `metadata.actualMetrics/analysisMetrics`
- `issue_work_products(type=analysis/report)`
- `activity_log(analysis)`

## 7. 생성/재사용할 업무

- 성과 리포트 작성
- 원인 분석
- 재활용 후보 선별

## 8. UI 체크포인트

- 단계 탭 클릭은 보기 전환만 한다.
- 실제 stage 이동은 Gate preview → 이동 확인 → `/move` API 순서로만 처리한다.
- 산출물, 승인, 활동 기록이 화면에서만 보이고 원장에 남지 않는 구조는 금지한다.
- AI 담당자도 사람 담당자와 동일하게 participant로 표시한다.
