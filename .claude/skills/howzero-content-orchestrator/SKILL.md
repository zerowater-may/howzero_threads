---
name: howzero-content-orchestrator
description: "HowZero 콘텐츠 에이전트 팀을 조율하는 오케스트레이터. 캐러셀 제작, 릴스 변환, brands 정리, 기존 콘텐츠 수정, 부분 재실행, 이전 결과 개선 요청 시 반드시 이 스킬을 사용."
---

# HowZero Content Orchestrator

HowZero의 콘텐츠 에이전트 팀을 조율하여 `캐러셀`, `릴스`, `brands 정리`를 하나의 흐름으로 처리하는 통합 스킬.

## zipsaja Remotion Rule

For new zipsaja content, route to `zipsaja-remotion-orchestrator`.
Do not use the generic `reels` skill directly for new zipsaja reels unless the user explicitly asks for the legacy carousel-to-video path.
New zipsaja reels are Remotion-only and must not use HyperFrames.

## 실행 모드: 에이전트 팀

## 에이전트 구성

| 팀원 | 역할 | 주력 스킬 | 출력 |
|------|------|----------|------|
| `content-director` | 요구사항 정리, brief 작성, 최종 품질 판단 | 공용 문서/브랜드 문서 참조 | `_workspace/01_brief.md`, `_workspace/99_final_report.md` |
| `carousel-specialist` | 캐러셀 제작/수정 | `carousel`, `zipsaja-design` | `_workspace/02_carousel_result.md` |
| `reels-specialist` | 릴스 제작/수정 | generic/legacy: `reels`; new zipsaja: `zipsaja-remotion-orchestrator`, `zipsaja-remotion-render` | `_workspace/03_reels_result.md` |
| `archive-operator` | 산출물 정리, brands 규칙 적용 | `brands-organize` | `_workspace/04_archive_result.md` |

## 워크플로우

### Phase 0: 컨텍스트 확인

1. 사용자 요청이 새 제작인지, 기존 산출물 수정인지, 정리만 필요한지 분류한다.
2. 기존 `_workspace/`와 관련 `brands/` 디렉토리가 있으면 재사용 가능한 입력을 먼저 찾는다.
3. 새 요청이면 `_workspace/`를 새로 만들고, 기존 결과 개선 요청이면 기존 경로를 입력으로 재사용한다.

### Phase 1: 준비

1. `content-director`가 아래 항목을 기준으로 `_workspace/01_brief.md`를 만든다.
   - 브랜드
   - 타겟 오디언스
   - 핵심 메시지 / CTA
   - 필요한 산출물 (`carousel`, `reels`, `organize`)
   - 최종 저장 경로 또는 slug
2. 관련 원문 자료가 있으면 `_workspace/00_input/` 아래에 경로를 기록한다.

### Phase 2: 팀 구성

1. `content-director`, `carousel-specialist`, `reels-specialist`, `archive-operator`로 팀을 만든다.
2. `TaskCreate` 기준 기본 작업은 다음과 같다.
   - brief 정리
   - 캐러셀 제작 또는 기존 캐러셀 검토
   - 릴스 제작 또는 기존 릴스 검토
   - 최종 정리 및 `INDEX.md` 반영
3. 요청 범위에 따라 불필요한 작업은 `skip`으로 표시한다.

### Phase 3: 제작

1. `carousel-specialist`는 `carousel` 스킬을 사용해 캐러셀을 만들거나 수정한다.
2. zipsaja 브랜드면 `zipsaja-design`과 해당 자산 경로를 먼저 확인한다.
3. 결과는 `_workspace/02_carousel_result.md`에 남기고, 릴스 입력 경로를 `reels-specialist`에게 전달한다.

### Phase 4: 릴스

1. 브랜드가 zipsaja이고 신규 콘텐츠면 `zipsaja-remotion-orchestrator` 또는 `zipsaja-remotion-render`를 사용한다.
2. generic `reels`는 non-zipsaja 또는 사용자가 legacy carousel-to-video 경로를 명시 요청한 경우에만 사용한다.
3. 입력 캐러셀이 부족하면 즉시 `content-director`와 `carousel-specialist`에게 피드백한다.
4. 결과는 `_workspace/03_reels_result.md`에 남긴다.

### Phase 5: 정리 및 보고

1. `archive-operator`가 `brands-organize` 스킬 또는 수동 정리로 최종 경로에 산출물을 배치한다.
2. `brands/{brand}/INDEX.md` 갱신 여부를 확인한다.
3. `content-director`가 `_workspace/99_final_report.md`에 아래를 정리한다.
   - 생성/수정한 경로
   - 스킵된 단계
   - 남은 수동 확인 항목

## 데이터 흐름

`content-director`가 brief를 만든 뒤 `carousel-specialist`가 캐러셀을 만들고, 필요 시 `reels-specialist`가 이를 입력으로 릴스를 만든다. 마지막으로 `archive-operator`가 최종 경로와 `INDEX.md`를 정리한다.

## 에러 핸들링

- 브랜드나 소스가 모호하면 `content-director`가 가정을 명시한 brief를 먼저 만든다.
- 캐러셀 실패 시 릴스 단계는 자동 스킵하고 이유를 보고한다.
- `brands-organize`가 처리하지 못하는 구조면 `archive-operator`가 수동 정리 후 차이를 기록한다.

## 후속 작업 규칙

- 기존 결과 수정, 부분 재실행, 보완, 업데이트 요청에도 이 스킬을 다시 사용한다.
- 재실행 시 가능한 경우 기존 `brands/` 산출물과 `_workspace/` 기록을 우선 재사용한다.
