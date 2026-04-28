# 02. 기획 단계 플로우

> Parent: `2026-04-28-content-card-stage-collaboration-flow-design.md`  
> Diagram: `02-planning-stage-map.excalidraw.md`  
> Stage: `planning`  
> Gate: `Gate: 전략 승인`

## 1. 목적

소싱 근거를 콘텐츠 각도, 훅, 구조로 바꾸고 사람 승인을 받는다.

## 2. 입력값

- 소싱 snapshot
- 브랜드/페르소나
- 참여자 지시

## 3. 사람/AI 협업

AI 작업:

- 전략 초안 작성
- 후킹 5개 제안
- 콘텐츠 brief 구성

사람 판단:

- 전략 채택/수정/반려
- 톤과 주장 수위 결정
- 제작 진입 승인

## 4. 필수 산출물

- `strategy_draft`
- `hook_set`
- `content_brief`

## 5. Gate 조건

다음 단계(`제작`)로 이동하려면 아래 조건을 만족해야 한다.

- 전략 산출물 존재
- 사람 approval approved

Gate 실패 시 stage 값은 바꾸지 않고, 누락 항목을 UI에 표시한다.

## 6. 기록 원장 매핑

- `issue_work_products(type=strategy/plan/script)`
- `approvals(type=content_stage_gate)`
- `issue comment/activity`

## 7. 생성/재사용할 업무

- 전략 초안 작성
- 후킹 검토
- 기획 승인

## 8. UI 체크포인트

- 단계 탭 클릭은 보기 전환만 한다.
- 실제 stage 이동은 Gate preview → 이동 확인 → `/move` API 순서로만 처리한다.
- 산출물, 승인, 활동 기록이 화면에서만 보이고 원장에 남지 않는 구조는 금지한다.
- AI 담당자도 사람 담당자와 동일하게 participant로 표시한다.
