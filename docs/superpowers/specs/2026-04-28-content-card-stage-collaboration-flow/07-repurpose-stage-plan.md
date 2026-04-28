# 07. 재활용 단계 플로우

> Parent: `2026-04-28-content-card-stage-collaboration-flow-design.md`  
> Diagram: `07-repurpose-stage-map.excalidraw.md`  
> Stage: `repurpose`  
> Gate: `Gate: 파생 연결`

## 1. 목적

검증된 콘텐츠를 쇼츠, 릴스, 뉴스레터, 링크드인 등 파생 카드로 연결한다.

## 2. 입력값

- 성과분석 리포트
- 파생 채널
- 원본 카드

## 3. 사람/AI 협업

AI 작업:

- 파생 콘텐츠 제안
- 채널별 변환안 작성
- 새 카드 초안 생성

사람 판단:

- 어떤 파생물을 만들지 선택
- 원본-파생 관계 확인
- 새 카드 생성 승인

## 4. 필수 산출물

- `repurpose_plan`
- `derivative content links`

## 5. Gate 조건

다음 단계(`새 카드/종료`)로 이동하려면 아래 조건을 만족해야 한다.

- 원본-파생 카드 링크
- 재활용 issue/task 생성

Gate 실패 시 stage 값은 바꾸지 않고, 누락 항목을 UI에 표시한다.

## 6. 기록 원장 매핑

- `content_items.sourceContentItemId`
- `metadata.derivativeContentItemIds`
- `content_issue_links(role=repurpose)`

## 7. 생성/재사용할 업무

- 파생 카드 생성
- 채널별 변환
- 재활용 실행

## 8. UI 체크포인트

- 단계 탭 클릭은 보기 전환만 한다.
- 실제 stage 이동은 Gate preview → 이동 확인 → `/move` API 순서로만 처리한다.
- 산출물, 승인, 활동 기록이 화면에서만 보이고 원장에 남지 않는 구조는 금지한다.
- AI 담당자도 사람 담당자와 동일하게 participant로 표시한다.
