# 콘텐츠 카드 단계형 협업 플로우 — 단계별 문서 묶음

> Parent: `../2026-04-28-content-card-stage-collaboration-flow-design.md`  
> Overview diagram: `00-overview-stage-map.excalidraw.md`

이 폴더는 큰 플로우 문서의 `4. 단계형 워크스페이스 + 검증 Gate` 영역을 단계별로 분리한 구현 기준 문서다.

## 전체 흐름

```txt
콘텐츠 소스
→ 카드 생성
→ 사람/AI 담당자 초대
→ 소싱
→ Gate
→ 기획
→ Gate
→ 제작
→ Gate
→ 검토
→ Gate
→ 예약/발행
→ Gate
→ 성과분석
→ Gate
→ 재활용
```

## 단계별 문서

- [01. 소싱 단계](./01-sourcing-stage-plan.md) / [Excalidraw](./01-sourcing-stage-map.excalidraw.md)
- [02. 기획 단계](./02-planning-stage-plan.md) / [Excalidraw](./02-planning-stage-map.excalidraw.md)
- [03. 제작 단계](./03-production-stage-plan.md) / [Excalidraw](./03-production-stage-map.excalidraw.md)
- [04. 검토 단계](./04-review-stage-plan.md) / [Excalidraw](./04-review-stage-map.excalidraw.md)
- [05. 예약/발행 단계](./05-publishing-stage-plan.md) / [Excalidraw](./05-publishing-stage-map.excalidraw.md)
- [06. 성과분석 단계](./06-analysis-stage-plan.md) / [Excalidraw](./06-analysis-stage-map.excalidraw.md)
- [07. 재활용 단계](./07-repurpose-stage-plan.md) / [Excalidraw](./07-repurpose-stage-map.excalidraw.md)

## 공통 원칙

- AI는 버튼이 아니라 participant 담당자다.
- 단계 탭 클릭은 보기 전환이고, 실제 stage 이동은 Gate 검증을 통과해야 한다.
- 전략, 작업내역, 활동, 산출물, 지시/스킬 근거, HOWAAA 트렌드 근거는 별도 AI 히스토리에만 저장하지 않는다.
- 저장 원장은 `issues`, `content_issue_links`, `issue_work_products`, `approvals`, `activity_log`, `heartbeat_runs`, `content_items.metadata`를 우선 사용한다.
