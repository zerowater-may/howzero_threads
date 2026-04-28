# 04. 검토 단계 플로우

> Parent: `2026-04-28-content-card-stage-collaboration-flow-design.md`  
> Diagram: `04-review-stage-map.excalidraw.md`  
> Stage: `review`  
> Gate: `Gate: 검토 완료`

## 1. 목적

제작 산출물을 팩트, 톤, 품질 기준으로 검토하고 승인/반려 결정을 남긴다.

## 2. 입력값

- 선택 초안
- 검토 기준
- 브랜드 리스크

## 3. 사람/AI 협업

AI 작업:

- 팩트 체크
- 브랜드 톤 검사
- 리스크 탐지

사람 판단:

- 수정 요청
- 반려
- 발행 승인 요청

## 4. 필수 산출물

- `review_report`
- `fact_check`
- `tone_check`

## 5. Gate 조건

다음 단계(`예약/발행`)로 이동하려면 아래 조건을 만족해야 한다.

- 검토 산출물 존재
- 승인/반려 decision 기록

Gate 실패 시 stage 값은 바꾸지 않고, 누락 항목을 UI에 표시한다.

## 6. 기록 원장 매핑

- `issue_work_products(reviewState)`
- `approvals/status`
- `activity_log(review)`

## 7. 생성/재사용할 업무

- 팩트 체크
- 톤 검수
- 최종 검토

## 8. UI 체크포인트

- 단계 탭 클릭은 보기 전환만 한다.
- 실제 stage 이동은 Gate preview → 이동 확인 → `/move` API 순서로만 처리한다.
- 산출물, 승인, 활동 기록이 화면에서만 보이고 원장에 남지 않는 구조는 금지한다.
- AI 담당자도 사람 담당자와 동일하게 participant로 표시한다.
