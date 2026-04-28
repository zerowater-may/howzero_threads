# 05. 예약/발행 단계 플로우

> Parent: `2026-04-28-content-card-stage-collaboration-flow-design.md`  
> Diagram: `05-publishing-stage-map.excalidraw.md`  
> Stage: `publishing`  
> Gate: `Gate: 발행 승인`

## 1. 목적

채널별 발행 패키지를 확정하고 발행 승인 후 예약/발행 상태로 넘긴다.

## 2. 입력값

- 검토 완료 산출물
- 채널별 제약
- 예약 시간 후보

## 3. 사람/AI 협업

AI 작업:

- 플랫폼별 카피 정리
- 예약 시간 제안
- 발행 체크리스트 생성

사람 판단:

- 발행 승인
- 예약 시간 결정
- 최종 문구 확인

## 4. 필수 산출물

- `publish_package`
- `schedule_plan`

## 5. Gate 조건

다음 단계(`성과분석`)로 이동하려면 아래 조건을 만족해야 한다.

- content_publish approval approved

Gate 실패 시 stage 값은 바꾸지 않고, 누락 항목을 UI에 표시한다.

## 6. 기록 원장 매핑

- `approvals(type=content_publish,status=approved)`
- `publishAt/scheduledAt`
- `activity_log(content.publish_*)`

## 7. 생성/재사용할 업무

- 발행 패키지 확정
- 예약 설정
- 최종 승인

## 8. UI 체크포인트

- 단계 탭 클릭은 보기 전환만 한다.
- 실제 stage 이동은 Gate preview → 이동 확인 → `/move` API 순서로만 처리한다.
- 산출물, 승인, 활동 기록이 화면에서만 보이고 원장에 남지 않는 구조는 금지한다.
- AI 담당자도 사람 담당자와 동일하게 participant로 표시한다.
