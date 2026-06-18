---
description: AI 톤 한국어 텍스트를 사람 말투로 정돈 (humanize-text skill 실행). 기본은 diff 제안, --apply 시 파일 적용.
argument-hint: <text or file path> [--mode A|B] [--persona <path>] [--apply] [--max-change 0.3]
allowed-tools: Read, Edit, Write, Bash, Agent, Skill
---

# /humanize $ARGUMENTS

사용자가 `/humanize <args>` 를 호출했다. 먼저 `humanize-text` skill을 invoke해서 절차·규칙·prompt를 로드한 다음, `$ARGUMENTS`를 파싱해서 작업을 수행한다.

## 절차

1. **`humanize-text` skill을 Skill tool로 invoke** (절차·규칙·페르소나 매핑·core prompt 로드)
2. `$ARGUMENTS` 파싱:
   - 첫 토큰이 기존 파일 경로면 → 파일 모드 (Read로 본문 로드)
   - 아니면 → 텍스트 직접 입력 모드
   - `--mode B` 있으면 chain 시뮬레이션, 기본 A
   - `--persona <path>` 있으면 해당 톤 가이드 로드, 없으면 경로 기반 자동 매핑
   - `--apply` 있을 때만 파일에 Edit/Write로 적용
   - `--max-change <0~1>` 변경 비율 상한, 기본 0.3
3. **인자가 비어 있으면**: 사용법 출력 후 종료.
   ```
   /humanize <text or file> [--mode A|B] [--persona <path>] [--apply]
   예시: /humanize brands/braveyong/.../components/hero.tsx
   ```
4. SKILL.md의 "한국어 humanize core prompt"에 따라 처리:
   - AI 톤 신호 5종 이상 표시
   - 변경 부분을 diff 블록으로 제시 (`- 원본` / `+ 수정`)
   - 변경 비율 계산
5. `--apply` 명시 안 했으면 **반드시 멈춤**. 사용자에게 "적용할까요?" 물어보고 응답 후에만 Edit/Write 실행.
6. tsx/jsx 파일이면 JSX 내부 텍스트만 대상, 코드·import·className·props·variable 이름은 절대 건드리지 않는다.
7. md 파일이면 코드 블록, frontmatter, 링크 URL, 표 헤더는 건드리지 않는다.
8. 결과 메시지 끝에 변경 비율과 함께 SKILL.md의 "가드 체크리스트" 5개 OK/FAIL 표시.

## 한 번에 여러 파일

사용자가 여러 파일/디렉터리를 인자로 주면:

- 파일 수 ≤ 3개: 순차 처리, 각 파일 diff 따로 출력
- 파일 수 ≥ 4개: 사용자 확인 받고 → `Agent` tool로 `general-purpose` subagent 병렬 fan-out. 각 subagent는 1개 파일만 처리하고 diff 반환. 결과 통합해서 한 view로.

## 안전

- `--apply` 없으면 절대 자동 적용 X.
- 사람이 직접 다듬은 흔적이 보이는 카피(예: 비표준 어순, 사적 표현, 특수 줄바꿈)는 손대지 말고 "사람 손길로 판단, skip" 메모.
- 의미 drift 의심되면 그 부분 되돌리고 사용자에게 적색 표시.

## 출력 끝맺음

```
적용하려면:
  /humanize <같은 경로> --apply
또는 "적용해줘" / "이 중 1, 3번만 적용" 등으로 응답.
```
