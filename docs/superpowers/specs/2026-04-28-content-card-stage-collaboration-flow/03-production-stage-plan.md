# 03. 제작 단계 플로우

> Parent: `2026-04-28-content-card-stage-collaboration-flow-design.md`  
> Diagram: `03-production-stage-map.excalidraw.md`  
> Stage: `production`  
> Gate: `Gate: 초안 선택`

## 1. 목적

승인된 기획을 실제 본문, 대본, 캡션, 소재 초안으로 만든다.

## 2. 입력값

- 승인된 content_brief
- 작업 담당자
- 브랜드 톤

## 3. 사람/AI 협업

AI 작업:

- 대본 초안 제작
- 캡션/제목 후보 작성
- 썸네일/소재 방향 제안

사람 판단:

- 반영할 버전 선택
- 본문에 반영
- 검토 단계로 보낼 초안 확정

## 4. 필수 산출물

- `script_draft`
- `asset_draft`
- `caption_draft`

## 5. Gate 조건

다음 단계(`검토`)로 이동하려면 아래 조건을 만족해야 한다.

- 선택된 산출물 ready/completed
- 반영 activity 기록

Gate 실패 시 stage 값은 바꾸지 않고, 누락 항목을 UI에 표시한다.

## 6. 기록 원장 매핑

- `issue_work_products(status=ready/completed)`
- `activity_log(issue.work_product_*)`
- `content body update`

## 7. 생성/재사용할 업무

- 대본 초안 작성
- 캡션 초안 작성
- 소재 초안 작성

## 8. UI 체크포인트

- 단계 탭 클릭은 보기 전환만 한다.
- 실제 stage 이동은 Gate preview → 이동 확인 → `/move` API 순서로만 처리한다.
- 산출물, 승인, 활동 기록이 화면에서만 보이고 원장에 남지 않는 구조는 금지한다.
- AI 담당자도 사람 담당자와 동일하게 participant로 표시한다.
