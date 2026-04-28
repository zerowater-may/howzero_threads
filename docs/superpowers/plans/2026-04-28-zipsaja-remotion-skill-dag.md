# Zipsaja Remotion Skill DAG Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** zipsaja 콘텐츠 제작을 `pipeline-state.json` 기반의 Remotion 단일 워크플로우로 고정하고, 긴 절차를 병렬 실행 가능한 개별 스킬 DAG로 분리한다.

**Architecture:** `zipsaja-remotion-orchestrator`가 얇은 마스터 스킬로 상태와 순서를 관리하고, 각 단계 스킬은 자기 입력/출력만 처리한다. 모든 단계는 같은 `brands/zipsaja/zipsaja_pipeline_<slug>/pipeline-state.json`을 읽고 갱신하며, 신규 zipsaja 릴스는 HyperFrames를 사용하지 않고 `.claude/skills/carousel/brands/zipsaja/reels` Remotion 프로젝트만 사용한다.

**Tech Stack:** Python 3.11, pytest, existing `scripts.pipeline`, existing `scripts.content_*`, Remotion 4, ffmpeg, Claude skill metadata under `.claude/skills`, generated mirror via `python3 scripts/sync_ai_meta.py`.

---

## File Structure

- Modify: `scripts/pipeline/state.py`
  - `workflow_version`, `forbidden_tools`, `steps` 필드를 추가한다.
  - 단계 상태/산출물 기록용 작은 메서드를 추가한다.
- Modify: `scripts/pipeline/__main__.py`
  - zipsaja 실행 시 Remotion 워크플로우 메타데이터를 초기화한다.
  - 기존 `content-*` 체인은 유지하되 state에 단계별 완료 상태를 남긴다.
- Create: `tests/pipeline/test_state_remotion_workflow.py`
  - 새 state 계약과 기존 state JSON 호환성을 검증한다.
- Create: `tests/pipeline/test_zipsaja_remotion_workflow_config.py`
  - zipsaja pipeline 초기화가 Remotion v1 단계 목록과 HyperFrames 금지를 기록하는지 검증한다.
- Create: `tests/test_zipsaja_remotion_skill_dag.py`
  - 새 스킬 파일 존재, frontmatter, DAG 참조, HyperFrames 금지 문구를 검증한다.
- Create: `.claude/skills/zipsaja-remotion-orchestrator/SKILL.md`
  - 사용자가 zipsaja 콘텐츠 제작/파이프라인/Remotion 통합을 요청할 때 진입하는 마스터 스킬.
- Create: `.claude/skills/zipsaja-remotion-orchestrator/references/state-contract.md`
  - 모든 하위 스킬이 공유하는 state schema와 단계 순서를 문서화한다.
- Create: `.claude/skills/zipsaja-brief/SKILL.md`
  - 주제, 타깃, 훅, CTA, 리스크를 `brief.md`로 고정한다.
- Modify: `.claude/skills/zipsaja-data-fetch/SKILL.md`
  - 기존 스킬을 유지하되 Remotion DAG의 `data` 단계로 쓰인다는 포인터를 추가한다.
- Create: `.claude/skills/zipsaja-storyboard/SKILL.md`
  - `brief.md`와 `data.json`을 합쳐 `storyboard.json`을 만든다.
- Create: `.claude/skills/zipsaja-carousel-render/SKILL.md`
  - 기존 `scripts.content_carousel` 호출을 zipsaja state 계약으로 감싼다.
- Create: `.claude/skills/zipsaja-remotion-render/SKILL.md`
  - 기존 `scripts.content_reels` 호출을 zipsaja state 계약으로 감싼다.
- Create: `.claude/skills/zipsaja-captions/SKILL.md`
  - 기존 `scripts.content_captions` 호출을 zipsaja state 계약으로 감싼다.
- Create: `.claude/skills/zipsaja-attachments/SKILL.md`
  - 기존 `scripts.content_attachments` 호출을 zipsaja state 계약으로 감싼다.
- Create: `.claude/skills/zipsaja-package-qa/SKILL.md`
  - 최종 검증, HyperFrames 흔적 검사, `brands/zipsaja/INDEX.md` 갱신 확인을 담당한다.
- Modify: `.claude/skills/howzero-content-orchestrator/SKILL.md`
  - zipsaja 신규 콘텐츠는 `zipsaja-remotion-orchestrator`로 라우팅한다고 명시한다.
- Modify: `.claude/skills/reels/SKILL.md`
  - 일반 캐러셀 변환 스킬은 legacy/generic으로 남기고, zipsaja 신규 릴스는 `zipsaja-remotion-render`를 쓰라고 명시한다.
- Modify: `.claude/skills/content-reels/SKILL.md`
  - 내부 CLI 설명은 유지하되 직접 사용보다 zipsaja wrapper skill을 우선한다고 명시한다.
- Modify: `.claude/skills/pipeline/SKILL.md`
  - zipsaja는 Remotion v1 stateful DAG로 실행한다고 갱신한다.
- Modify: `AGENTS.md`
  - `/pipeline` 섹션에 Remotion 단일 워크플로우와 HyperFrames 신규 사용 금지를 추가한다.
- Generated: `docs/ai/**`
  - 직접 수정하지 않고 `python3 scripts/sync_ai_meta.py`로 갱신한다.

---

### Task 1: Pipeline State Contract

**Files:**
- Create: `tests/pipeline/test_state_remotion_workflow.py`
- Modify: `scripts/pipeline/state.py`

- [ ] **Step 1: Write failing tests for Remotion workflow state**

Create `tests/pipeline/test_state_remotion_workflow.py`:

```python
import json
from pathlib import Path

from scripts.pipeline.state import PipelineState


def test_pipeline_state_records_remotion_workflow_steps(tmp_path: Path):
    state_path = tmp_path / "pipeline-state.json"
    state = PipelineState(
        pipeline_id="zipsaja_20260428_test",
        brand="zipsaja",
        topic="테스트 주제",
        slug="test",
    )

    state.set_workflow(
        version="zipsaja-remotion-v1",
        steps=["brief", "data", "storyboard", "carousel", "remotion"],
        forbidden_tools=["hyperframes"],
    )
    state.mark_step("brief", "done")
    state.record_artifact("brief", "brief.md")
    state.save(state_path)

    loaded = PipelineState.load(state_path)
    assert loaded.workflow_version == "zipsaja-remotion-v1"
    assert loaded.forbidden_tools == ["hyperframes"]
    assert loaded.steps["brief"] == "done"
    assert loaded.steps["data"] == "pending"
    assert loaded.artifacts["brief"]["path"] == "brief.md"
    assert loaded.next_pending_step(["brief", "data", "storyboard"]) == "data"


def test_pipeline_state_loads_existing_json_without_new_fields(tmp_path: Path):
    state_path = tmp_path / "legacy-state.json"
    state_path.write_text(
        json.dumps(
            {
                "pipeline_id": "zipsaja_20260424_legacy",
                "brand": "zipsaja",
                "topic": "legacy",
                "slug": "legacy",
                "created_at": "2026-04-24T00:00:00+09:00",
                "status": "data-ready",
                "failed_at": None,
                "failed_reason": None,
                "data": None,
                "tone": None,
                "artifacts": {},
            },
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    loaded = PipelineState.load(state_path)
    assert loaded.workflow_version == "legacy"
    assert loaded.forbidden_tools == []
    assert loaded.steps == {}


def test_pipeline_state_forbidden_tool_scan():
    state = PipelineState(
        pipeline_id="zipsaja_20260428_test",
        brand="zipsaja",
        topic="테스트",
        slug="test",
    )
    state.forbidden_tools = ["hyperframes"]

    assert state.contains_forbidden_tool("npx hyperframes render") is True
    assert state.contains_forbidden_tool("npx remotion render SeoulPriceReel") is False
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
python3 -m pytest tests/pipeline/test_state_remotion_workflow.py -v
```

Expected: FAIL because `PipelineState` does not define `set_workflow`, `mark_step`, `record_artifact`, `next_pending_step`, `contains_forbidden_tool`, or the new fields.

- [ ] **Step 3: Implement state fields and helpers**

Modify `scripts/pipeline/state.py`:

```python
@dataclass
class PipelineState:
    pipeline_id: str
    brand: str
    topic: str
    slug: str
    created_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).astimezone().isoformat()
    )
    status: str = "pending"
    failed_at: Optional[str] = None
    failed_reason: Optional[str] = None
    data: Optional[dict[str, Any]] = None
    tone: Optional[dict[str, Any]] = None
    artifacts: dict[str, Any] = field(default_factory=dict)
    workflow_version: str = "legacy"
    forbidden_tools: list[str] = field(default_factory=list)
    steps: dict[str, str] = field(default_factory=dict)

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(
            json.dumps(asdict(self), ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    @classmethod
    def load(cls, path: Path) -> "PipelineState":
        raw = json.loads(path.read_text(encoding="utf-8"))
        raw.setdefault("workflow_version", "legacy")
        raw.setdefault("forbidden_tools", [])
        raw.setdefault("steps", {})
        return cls(**raw)

    def mark_failed(self, step: str, reason: str) -> None:
        self.status = "failed"
        self.failed_at = step
        self.failed_reason = reason
        self.steps[step] = "failed"

    def set_workflow(
        self,
        *,
        version: str,
        steps: list[str],
        forbidden_tools: list[str],
    ) -> None:
        self.workflow_version = version
        self.forbidden_tools = forbidden_tools
        for step in steps:
            self.steps.setdefault(step, "pending")

    def mark_step(self, step: str, status: str) -> None:
        self.steps[step] = status

    def record_artifact(self, key: str, path: str | Path) -> None:
        self.artifacts[key] = {"path": str(path)}

    def next_pending_step(self, ordered_steps: list[str]) -> Optional[str]:
        for step in ordered_steps:
            if self.steps.get(step, "pending") not in {"done", "skipped"}:
                return step
        return None

    def contains_forbidden_tool(self, text: str) -> bool:
        lowered = text.lower()
        return any(tool.lower() in lowered for tool in self.forbidden_tools)
```

- [ ] **Step 4: Run state tests**

Run:

```bash
python3 -m pytest tests/pipeline/test_state.py tests/pipeline/test_state_remotion_workflow.py -v
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/pipeline/state.py tests/pipeline/test_state_remotion_workflow.py
git commit -m "feat: zipsaja Remotion 워크플로우 상태 계약 추가"
```

---

### Task 2: Pipeline Remotion Workflow Initialization

**Files:**
- Create: `tests/pipeline/test_zipsaja_remotion_workflow_config.py`
- Modify: `scripts/pipeline/__main__.py`

- [ ] **Step 1: Write failing tests for workflow configuration**

Create `tests/pipeline/test_zipsaja_remotion_workflow_config.py`:

```python
from scripts.pipeline.__main__ import (
    ZIPSAJA_REMOTION_STEPS,
    configure_zipsaja_remotion_state,
)
from scripts.pipeline.state import PipelineState


def test_zipsaja_remotion_steps_are_ordered():
    assert ZIPSAJA_REMOTION_STEPS == [
        "brief",
        "data",
        "storyboard",
        "carousel",
        "remotion",
        "attachments",
        "captions",
        "package-qa",
    ]


def test_configure_zipsaja_remotion_state_sets_contract():
    state = PipelineState(
        pipeline_id="zipsaja_20260428_test",
        brand="zipsaja",
        topic="테스트",
        slug="test",
    )

    configure_zipsaja_remotion_state(state)

    assert state.workflow_version == "zipsaja-remotion-v1"
    assert state.forbidden_tools == ["hyperframes"]
    assert state.steps["brief"] == "pending"
    assert state.steps["package-qa"] == "pending"
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
python3 -m pytest tests/pipeline/test_zipsaja_remotion_workflow_config.py -v
```

Expected: FAIL because `ZIPSAJA_REMOTION_STEPS` and `configure_zipsaja_remotion_state` do not exist.

- [ ] **Step 3: Add workflow constants and initializer**

Modify `scripts/pipeline/__main__.py` near the imports:

```python
ZIPSAJA_REMOTION_STEPS = [
    "brief",
    "data",
    "storyboard",
    "carousel",
    "remotion",
    "attachments",
    "captions",
    "package-qa",
]


def configure_zipsaja_remotion_state(state: PipelineState) -> None:
    state.set_workflow(
        version="zipsaja-remotion-v1",
        steps=ZIPSAJA_REMOTION_STEPS,
        forbidden_tools=["hyperframes"],
    )
```

In `main()`, after `state = PipelineState(...)`:

```python
    if args.brand == "zipsaja":
        configure_zipsaja_remotion_state(state)
```

Inside the zipsaja data-fetch success branch, after `state.status = "data-ready"`:

```python
        state.mark_step("data", "done")
        state.record_artifact("data", data_out)
```

Inside the content step loop, after each successful step:

```python
            artifact_key = step_name.split("-", 1)[1]
            state.record_artifact(artifact_key, bundle / artifact_key)
            if artifact_key == "reels":
                state.mark_step("remotion", "done")
            else:
                state.mark_step(artifact_key, "done")
            state.save(state_path)
```

When all chained content steps complete, before `state.status = "completed"`:

```python
        state.mark_step("package-qa", "skipped")
```

This preserves the current automatic CLI behavior while making the state contract visible to the new skills.

- [ ] **Step 4: Run pipeline tests**

Run:

```bash
python3 -m pytest tests/pipeline -v
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/pipeline/__main__.py tests/pipeline/test_zipsaja_remotion_workflow_config.py
git commit -m "feat: zipsaja Remotion 워크플로우 초기화 추가"
```

---

### Task 3: Skill DAG Smoke Tests

**Files:**
- Create: `tests/test_zipsaja_remotion_skill_dag.py`

- [ ] **Step 1: Write failing tests for required skills**

Create `tests/test_zipsaja_remotion_skill_dag.py`:

```python
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]

EXPECTED_SKILLS = [
    "zipsaja-remotion-orchestrator",
    "zipsaja-brief",
    "zipsaja-storyboard",
    "zipsaja-carousel-render",
    "zipsaja-remotion-render",
    "zipsaja-captions",
    "zipsaja-attachments",
    "zipsaja-package-qa",
]


def read_skill(name: str) -> str:
    return (REPO_ROOT / ".claude" / "skills" / name / "SKILL.md").read_text(
        encoding="utf-8"
    )


def test_zipsaja_remotion_skill_files_exist():
    for name in EXPECTED_SKILLS:
        assert (REPO_ROOT / ".claude" / "skills" / name / "SKILL.md").exists(), name


def test_orchestrator_mentions_all_dag_skills():
    body = read_skill("zipsaja-remotion-orchestrator")
    for name in EXPECTED_SKILLS[1:]:
        assert name in body


def test_remotion_render_skill_forbids_hyperframes_for_new_reels():
    body = read_skill("zipsaja-remotion-render").lower()
    assert "remotion" in body
    assert "hyperframes" in body
    assert "never use hyperframes" in body


def test_package_qa_checks_hyperframes_absence():
    body = read_skill("zipsaja-package-qa").lower()
    assert "find" in body
    assert "hyperframes" in body
    assert "ffprobe" in body
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
python3 -m pytest tests/test_zipsaja_remotion_skill_dag.py -v
```

Expected: FAIL because the new skill files do not exist.

- [ ] **Step 3: Commit the failing test**

```bash
git add tests/test_zipsaja_remotion_skill_dag.py
git commit -m "test: zipsaja Remotion 스킬 DAG 계약 추가"
```

---

### Task 4: Orchestrator Skill and Shared State Contract

**Files:**
- Create: `.claude/skills/zipsaja-remotion-orchestrator/SKILL.md`
- Create: `.claude/skills/zipsaja-remotion-orchestrator/references/state-contract.md`

- [ ] **Step 1: Create shared state contract reference**

Create `.claude/skills/zipsaja-remotion-orchestrator/references/state-contract.md`:

````markdown
# zipsaja Remotion State Contract

All zipsaja Remotion workflow skills use one bundle:

```text
brands/zipsaja/zipsaja_pipeline_<slug>/
├── pipeline-state.json
├── brief.md
├── data.json
├── storyboard.json
├── carousel/
├── reels/
├── attachments/
└── captions/
```

## Required State Fields

```json
{
  "workflow_version": "zipsaja-remotion-v1",
  "brand": "zipsaja",
  "topic": "주제",
  "slug": "slug",
  "forbidden_tools": ["hyperframes"],
  "steps": {
    "brief": "pending",
    "data": "pending",
    "storyboard": "pending",
    "carousel": "pending",
    "remotion": "pending",
    "attachments": "pending",
    "captions": "pending",
    "package-qa": "pending"
  },
  "artifacts": {}
}
```

Valid step statuses: `pending`, `running`, `done`, `skipped`, `failed`.

## Ordered Steps

1. `brief`
2. `data`
3. `storyboard`
4. `carousel`
5. `remotion`
6. `attachments`
7. `captions`
8. `package-qa`

## Parallel Windows

After `brief` exists, `data` and asset checks may run in parallel.
After `storyboard` exists, `carousel`, `attachments`, and `captions` may run in parallel.
`remotion` requires `carousel` and `data`.
`package-qa` runs last.

## Hard Rule

New zipsaja reels are Remotion-only.
Never use HyperFrames for new zipsaja reels.
Existing folders containing `hyperframes_reel` are historical artifacts only.
````

- [ ] **Step 2: Create orchestrator skill**

Create `.claude/skills/zipsaja-remotion-orchestrator/SKILL.md`:

````markdown
---
name: zipsaja-remotion-orchestrator
description: "zipsaja 콘텐츠 제작, zipsaja 파이프라인, 집사자 캐러셀+릴스, Remotion 단일 워크플로우, HyperFrames 제거/금지, 단계별 스킬 병렬화 요청 시 반드시 사용. 신규 zipsaja 릴스는 항상 Remotion으로만 만든다."
---

# zipsaja Remotion Orchestrator

This is the master skill for zipsaja content production. It coordinates small skills through `pipeline-state.json` instead of relying on memory.

## First Read

Read `references/state-contract.md` when you need exact step order, artifact paths, or recovery rules.

## Core Rule

New zipsaja reels are Remotion-only.
Never use HyperFrames for new zipsaja reels.
Historical `hyperframes_reel` folders may stay in old bundles, but do not create or extend them.

## Workflow

1. Locate or create `brands/zipsaja/zipsaja_pipeline_<slug>/pipeline-state.json`.
2. Confirm `workflow_version` is `zipsaja-remotion-v1`.
3. Inspect `steps` and choose the next actionable step.
4. Use the matching sub-skill:
   - `brief` → `zipsaja-brief`
   - `data` → `zipsaja-data-fetch`
   - `storyboard` → `zipsaja-storyboard`
   - `carousel` → `zipsaja-carousel-render`
   - `remotion` → `zipsaja-remotion-render`
   - `attachments` → `zipsaja-attachments`
   - `captions` → `zipsaja-captions`
   - `package-qa` → `zipsaja-package-qa`
5. Each sub-skill must update its own step status and artifact path.
6. When the user explicitly asks for parallel work, split only independent steps:
   - after `brief`: `data` and asset checks
   - after `storyboard`: `carousel`, `attachments`, `captions`
7. Report the current state path and next step after each run.

## Recovery

If context is lost, reload `pipeline-state.json` and continue from `next_pending_step`.
If the state mentions HyperFrames for a new reel, stop and ask to migrate that step to Remotion.

## Completion

The workflow is complete only when:

- `reels/full.mp4` exists
- a 22s mp4 exists under `reels/`
- `carousel/slides.html` exists
- `captions/` exists when captions were requested
- `attachments/` exists when lead magnet files were requested
- `zipsaja-package-qa` has verified no new HyperFrames output was created
````

- [ ] **Step 3: Run smoke tests**

Run:

```bash
python3 -m pytest tests/test_zipsaja_remotion_skill_dag.py::test_orchestrator_mentions_all_dag_skills -v
```

Expected: FAIL until the remaining sub-skill files are created.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/zipsaja-remotion-orchestrator
git commit -m "docs: zipsaja Remotion 오케스트레이터 스킬 추가"
```

---

### Task 5: Brief and Storyboard Skills

**Files:**
- Create: `.claude/skills/zipsaja-brief/SKILL.md`
- Create: `.claude/skills/zipsaja-storyboard/SKILL.md`

- [ ] **Step 1: Create brief skill**

Create `.claude/skills/zipsaja-brief/SKILL.md`:

````markdown
---
name: zipsaja-brief
description: "zipsaja 콘텐츠 주제에서 훅, 타깃, 핵심 주장, CTA, 리스크를 brief.md로 고정할 때 사용. zipsaja Remotion 워크플로우의 brief 단계 전용 스킬."
---

# zipsaja Brief

Create or update `brands/zipsaja/zipsaja_pipeline_<slug>/brief.md`.

## Inputs

- `pipeline-state.json`
- user topic
- brand tone from `brands/zipsaja/INDEX.md`
- persona and project rules from `AGENTS.md`

## Output

Write `brief.md` with this structure:

```markdown
# <topic>

## Hook
<one short opening claim in zipsaja casual Korean tone>

## Audience
20-30대 첫집 구매자, 신혼부부, 생애최초 구매 예정자

## Core Claim
<data-backed claim without 투자 권유>

## Proof Needed
- <dataset or source needed>
- <comparison needed>

## Carousel Promise
<what the carousel will teach>

## Reel Promise
<what the 22s Remotion reel will show first>

## CTA
<save/comment/DM CTA>

## Risk Notes
- 과장 금지
- 투자 권유 금지
- 미혼 무주택 비하 금지
```

## State Update

After writing `brief.md`, set:

- `steps.brief = "done"`
- `artifacts.brief.path = "brands/zipsaja/zipsaja_pipeline_<slug>/brief.md"`

Never create video output in this skill.
````

- [ ] **Step 2: Create storyboard skill**

Create `.claude/skills/zipsaja-storyboard/SKILL.md`:

````markdown
---
name: zipsaja-storyboard
description: "zipsaja brief.md와 data.json을 합쳐 카러셀/Remotion 릴스 공통 storyboard.json을 만들 때 사용. slide 순서, reel beat, CTA를 고정하는 단계."
---

# zipsaja Storyboard

Create `brands/zipsaja/zipsaja_pipeline_<slug>/storyboard.json`.

## Required Inputs

- `pipeline-state.json`
- `brief.md`
- `data.json`

If `brief.md` or `data.json` is missing, stop and report the missing file.

## Output Schema

```json
{
  "topic": "주제",
  "hook": "첫 장 훅",
  "carousel": [
    {
      "slide": 1,
      "role": "cover",
      "headline": "짧은 제목",
      "body": ["핵심 문장"],
      "visual": "zipsaja beige/orange card"
    }
  ],
  "reel": {
    "durationSec": 22,
    "composition": "SeoulPriceReel",
    "beats": [
      {"start": 0, "end": 3, "message": "첫 훅"},
      {"start": 3, "end": 18, "message": "데이터 전개"},
      {"start": 18, "end": 22, "message": "CTA"}
    ]
  },
  "cta": "댓글/저장/DM CTA"
}
```

## Rules

- Keep carousel and reel messaging consistent.
- Use zipsaja 반말 tone.
- Do not add 투자 권유.
- Do not mention HyperFrames.
- The Remotion composition field must name a Remotion composition or the existing data-driven component that will be reused.

## State Update

After writing `storyboard.json`, set:

- `steps.storyboard = "done"`
- `artifacts.storyboard.path = "brands/zipsaja/zipsaja_pipeline_<slug>/storyboard.json"`
````

- [ ] **Step 3: Run skill smoke tests**

Run:

```bash
python3 -m pytest tests/test_zipsaja_remotion_skill_dag.py::test_zipsaja_remotion_skill_files_exist -v
```

Expected: FAIL until all remaining skill files exist.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/zipsaja-brief .claude/skills/zipsaja-storyboard
git commit -m "docs: zipsaja brief와 storyboard 스킬 추가"
```

---

### Task 6: Production Wrapper Skills

**Files:**
- Create: `.claude/skills/zipsaja-carousel-render/SKILL.md`
- Create: `.claude/skills/zipsaja-remotion-render/SKILL.md`
- Create: `.claude/skills/zipsaja-captions/SKILL.md`
- Create: `.claude/skills/zipsaja-attachments/SKILL.md`

- [ ] **Step 1: Create carousel render skill**

Create `.claude/skills/zipsaja-carousel-render/SKILL.md`:

````markdown
---
name: zipsaja-carousel-render
description: "zipsaja Remotion 워크플로우에서 data.json 또는 storyboard.json을 입력으로 carousel/slides.html과 slide PNG를 생성할 때 사용. 기존 scripts.content_carousel을 stateful하게 호출한다."
---

# zipsaja Carousel Render

Render the carousel artifact for a zipsaja pipeline bundle.

## Inputs

- `pipeline-state.json`
- `data.json`
- optional `storyboard.json`

## Command

```bash
python3 -m scripts.content_carousel \
  --data brands/zipsaja/zipsaja_pipeline_<slug>/data.json \
  --out brands/zipsaja/zipsaja_pipeline_<slug>/carousel/
```

## Validate

```bash
test -f brands/zipsaja/zipsaja_pipeline_<slug>/carousel/slides.html
find brands/zipsaja/zipsaja_pipeline_<slug>/carousel -name 'slide-*.png' | sort
```

## State Update

Set:

- `steps.carousel = "done"`
- `artifacts.carousel.path = "brands/zipsaja/zipsaja_pipeline_<slug>/carousel"`

If rendering fails, set `steps.carousel = "failed"` and record the failing command output.
````

- [ ] **Step 2: Create Remotion render skill**

Create `.claude/skills/zipsaja-remotion-render/SKILL.md`:

````markdown
---
name: zipsaja-remotion-render
description: "zipsaja 신규 릴스 mp4를 만들 때 반드시 사용. Remotion만 사용하며 .claude/skills/carousel/brands/zipsaja/reels 프로젝트와 scripts.content_reels를 호출한다. Never use HyperFrames for new zipsaja reels."
---

# zipsaja Remotion Render

Render zipsaja reels with Remotion only.

## Hard Rule

Never use HyperFrames for new zipsaja reels.
Do not run `npx hyperframes`, do not create `hyperframes_reel`, and do not add HyperFrames files to a new bundle.

## Inputs

- `pipeline-state.json`
- `data.json`
- `carousel/` if the selected Remotion composition uses captured slides
- `storyboard.json` for title, beats, and CTA decisions

## Command

For the current data-driven Remotion path:

```bash
python3 -m scripts.content_reels \
  --data brands/zipsaja/zipsaja_pipeline_<slug>/data.json \
  --out brands/zipsaja/zipsaja_pipeline_<slug>/reels/
```

This writes mapped data to:

```text
.claude/skills/carousel/brands/zipsaja/reels/public/data/seoul-prices.json
```

and renders through:

```bash
cd .claude/skills/carousel/brands/zipsaja/reels
npm run build:seoul
```

## Validate

```bash
test -f brands/zipsaja/zipsaja_pipeline_<slug>/reels/full.mp4
test -f brands/zipsaja/zipsaja_pipeline_<slug>/reels/zipsaja-reel-22s.mp4
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate \
  -of default=nokey=1:noprint_wrappers=1 \
  brands/zipsaja/zipsaja_pipeline_<slug>/reels/zipsaja-reel-22s.mp4
```

Expected video stream includes `1080`, `1920`, and `30/1`.

## State Update

Set:

- `steps.remotion = "done"`
- `artifacts.reels.path = "brands/zipsaja/zipsaja_pipeline_<slug>/reels"`

If any command or validation references HyperFrames, stop and mark `steps.remotion = "failed"`.
````

- [ ] **Step 3: Create captions skill**

Create `.claude/skills/zipsaja-captions/SKILL.md`:

````markdown
---
name: zipsaja-captions
description: "zipsaja Remotion 워크플로우에서 Instagram, Threads, LinkedIn 캡션을 생성할 때 사용. 기존 scripts.content_captions를 stateful하게 호출한다."
---

# zipsaja Captions

Generate platform captions for a zipsaja pipeline bundle.

## Inputs

- `pipeline-state.json`
- `data.json`
- optional `brief.md`
- optional `storyboard.json`

## Command

```bash
python3 -m scripts.content_captions \
  --data brands/zipsaja/zipsaja_pipeline_<slug>/data.json \
  --out brands/zipsaja/zipsaja_pipeline_<slug>/captions/
```

Requires `ANTHROPIC_API_KEY`.

## Validate

```bash
test -f brands/zipsaja/zipsaja_pipeline_<slug>/captions/instagram.txt
test -f brands/zipsaja/zipsaja_pipeline_<slug>/captions/threads.txt
test -f brands/zipsaja/zipsaja_pipeline_<slug>/captions/linkedin.txt
```

## State Update

Set:

- `steps.captions = "done"`
- `artifacts.captions.path = "brands/zipsaja/zipsaja_pipeline_<slug>/captions"`
````

- [ ] **Step 4: Create attachments skill**

Create `.claude/skills/zipsaja-attachments/SKILL.md`:

````markdown
---
name: zipsaja-attachments
description: "zipsaja Remotion 워크플로우에서 댓글 리드마그넷용 Excel/PDF 첨부자료를 생성할 때 사용. 기존 scripts.content_attachments를 stateful하게 호출한다."
---

# zipsaja Attachments

Generate lead magnet attachments for a zipsaja pipeline bundle.

## Inputs

- `pipeline-state.json`
- `data.json`

## Command

```bash
python3 -m scripts.content_attachments \
  --data brands/zipsaja/zipsaja_pipeline_<slug>/data.json \
  --out brands/zipsaja/zipsaja_pipeline_<slug>/attachments/
```

## Validate

```bash
test -f brands/zipsaja/zipsaja_pipeline_<slug>/attachments/seoul-price-data.xlsx
test -f brands/zipsaja/zipsaja_pipeline_<slug>/attachments/seoul-price-insights.pdf
```

## State Update

Set:

- `steps.attachments = "done"`
- `artifacts.attachments.path = "brands/zipsaja/zipsaja_pipeline_<slug>/attachments"`
````

- [ ] **Step 5: Run skill smoke tests**

Run:

```bash
python3 -m pytest tests/test_zipsaja_remotion_skill_dag.py::test_remotion_render_skill_forbids_hyperframes_for_new_reels -v
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add \
  .claude/skills/zipsaja-carousel-render \
  .claude/skills/zipsaja-remotion-render \
  .claude/skills/zipsaja-captions \
  .claude/skills/zipsaja-attachments
git commit -m "docs: zipsaja 제작 단계별 렌더 스킬 추가"
```

---

### Task 7: Package QA Skill

**Files:**
- Create: `.claude/skills/zipsaja-package-qa/SKILL.md`

- [ ] **Step 1: Create package QA skill**

Create `.claude/skills/zipsaja-package-qa/SKILL.md`:

````markdown
---
name: zipsaja-package-qa
description: "zipsaja Remotion 워크플로우 최종 검수에 사용. bundle 산출물, Remotion mp4, ffprobe, slide PNG, captions/attachments, brands/zipsaja/INDEX.md, HyperFrames 신규 생성 금지를 확인한다."
---

# zipsaja Package QA

Run this after zipsaja carousel, Remotion reel, attachments, and captions are generated.

## Required Checks

Replace `<slug>` with the bundle slug.

```bash
BUNDLE=brands/zipsaja/zipsaja_pipeline_<slug>
test -f "$BUNDLE/pipeline-state.json"
test -f "$BUNDLE/data.json"
test -f "$BUNDLE/carousel/slides.html"
test -f "$BUNDLE/reels/full.mp4"
test -f "$BUNDLE/reels/zipsaja-reel-22s.mp4"
```

Check video metadata:

```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate \
  -of default=nokey=1:noprint_wrappers=1 \
  "$BUNDLE/reels/zipsaja-reel-22s.mp4"
```

Expected stream values:

```text
1080
1920
30/1
```

Check slides:

```bash
find "$BUNDLE/carousel" -name 'slide-*.png' | sort | wc -l
```

Expected: at least `1`.

Check no new HyperFrames output exists:

```bash
find "$BUNDLE" -iname '*hyperframes*' -print
```

Expected: no output for new Remotion workflow bundles.

Check brand index:

```bash
rg -n "<slug>|zipsaja_pipeline_<slug>" brands/zipsaja/INDEX.md
```

If the index is missing the new content, add one row under the zipsaja series table.

## State Update

Set:

- `steps.package-qa = "done"`
- `status = "completed"`

If any check fails, set:

- `steps.package-qa = "failed"`
- `status = "failed"`
- `failed_at = "package-qa"`
- `failed_reason` to the exact failed command or missing file.
````

- [ ] **Step 2: Run smoke tests**

Run:

```bash
python3 -m pytest tests/test_zipsaja_remotion_skill_dag.py -v
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/zipsaja-package-qa tests/test_zipsaja_remotion_skill_dag.py
git commit -m "docs: zipsaja 패키지 QA 스킬 추가"
```

---

### Task 8: Route Existing Skills to the New DAG

**Files:**
- Modify: `.claude/skills/howzero-content-orchestrator/SKILL.md`
- Modify: `.claude/skills/reels/SKILL.md`
- Modify: `.claude/skills/content-reels/SKILL.md`
- Modify: `.claude/skills/pipeline/SKILL.md`
- Modify: `.claude/skills/zipsaja-data-fetch/SKILL.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Update howzero content orchestrator**

In `.claude/skills/howzero-content-orchestrator/SKILL.md`, add this block after the opening description:

```markdown
## zipsaja Remotion Rule

For new zipsaja content, route to `zipsaja-remotion-orchestrator`.
Do not use the generic `reels` skill directly for new zipsaja reels unless the user explicitly asks for the legacy carousel-to-video path.
New zipsaja reels are Remotion-only and must not use HyperFrames.
```

- [ ] **Step 2: Update reels skill**

In `.claude/skills/reels/SKILL.md`, add this block near the top:

```markdown
## zipsaja 신규 제작 예외

이 스킬은 일반/legacy 캐러셀 → Remotion 변환 경로다.
신규 zipsaja 콘텐츠 제작은 `zipsaja-remotion-render` 또는 `zipsaja-remotion-orchestrator`를 우선 사용한다.
신규 zipsaja 릴스에는 HyperFrames를 사용하지 않는다.
```

- [ ] **Step 3: Update content-reels skill**

In `.claude/skills/content-reels/SKILL.md`, add this block after the first paragraph:

```markdown
## zipsaja wrapper 우선

이 스킬은 내부 CLI 설명이다.
신규 zipsaja 콘텐츠 제작에서는 `zipsaja-remotion-render`가 이 CLI를 호출하고 `pipeline-state.json`을 갱신한다.
사용자가 zipsaja 워크플로우를 요청하면 직접 이 스킬로 시작하지 말고 `zipsaja-remotion-orchestrator`를 사용한다.
```

- [ ] **Step 4: Update pipeline skill**

In `.claude/skills/pipeline/SKILL.md`, replace the Plan 1 limitation text about reels with:

```markdown
## zipsaja Remotion v1

zipsaja는 `zipsaja-remotion-v1` stateful DAG를 사용한다.
`python3 -m scripts.pipeline zipsaja <주제>`는 `pipeline-state.json`에 Remotion 워크플로우 메타데이터를 기록하고, 개별 단계는 `zipsaja-*` 스킬들이 이어서 처리할 수 있다.

신규 zipsaja 릴스는 Remotion만 사용한다. HyperFrames는 신규 산출물에 사용하지 않는다.
```

- [ ] **Step 5: Update zipsaja data fetch skill**

In `.claude/skills/zipsaja-data-fetch/SKILL.md`, add this block after usage:

```markdown
## Remotion DAG에서의 역할

이 스킬은 `zipsaja-remotion-v1`의 `data` 단계다.
완료 후 `pipeline-state.json`의 `steps.data = "done"`과 `artifacts.data.path`를 기록한다.
이 스킬은 영상이나 카러셀을 만들지 않는다.
```

- [ ] **Step 6: Update AGENTS.md**

In `AGENTS.md` section `8. 콘텐츠 파이프라인`, add this subsection:

```markdown
### zipsaja Remotion 단일 워크플로우

신규 zipsaja 콘텐츠는 `zipsaja-remotion-v1`을 표준으로 사용한다.

1. `zipsaja-remotion-orchestrator`가 `pipeline-state.json`을 기준으로 다음 단계를 결정한다.
2. 단계 스킬은 `zipsaja-brief`, `zipsaja-data-fetch`, `zipsaja-storyboard`, `zipsaja-carousel-render`, `zipsaja-remotion-render`, `zipsaja-attachments`, `zipsaja-captions`, `zipsaja-package-qa`로 나눈다.
3. 신규 zipsaja 릴스는 Remotion만 사용한다.
4. HyperFrames는 기존 산출물 보관용으로만 취급하고, 신규 zipsaja 릴스 제작에는 사용하지 않는다.
5. 모든 단계는 `pipeline-state.json`을 읽고 자기 단계 상태와 artifact path를 갱신한다.
```

- [ ] **Step 7: Run route text checks**

Run:

```bash
rg -n "zipsaja-remotion-orchestrator|zipsaja-remotion-render|HyperFrames|Remotion" \
  .claude/skills/howzero-content-orchestrator/SKILL.md \
  .claude/skills/reels/SKILL.md \
  .claude/skills/content-reels/SKILL.md \
  .claude/skills/pipeline/SKILL.md \
  .claude/skills/zipsaja-data-fetch/SKILL.md \
  AGENTS.md
```

Expected: each modified file appears at least once.

- [ ] **Step 8: Commit**

```bash
git add \
  .claude/skills/howzero-content-orchestrator/SKILL.md \
  .claude/skills/reels/SKILL.md \
  .claude/skills/content-reels/SKILL.md \
  .claude/skills/pipeline/SKILL.md \
  .claude/skills/zipsaja-data-fetch/SKILL.md \
  AGENTS.md
git commit -m "docs: zipsaja 신규 제작을 Remotion DAG로 라우팅"
```

---

### Task 9: Mirror AI Metadata and Verify

**Files:**
- Generated: `docs/ai/**`

- [ ] **Step 1: Sync generated AI metadata**

Run:

```bash
python3 scripts/sync_ai_meta.py
```

Expected output: either `Updated <N> generated AI metadata files.` or `AI metadata already up to date.`

- [ ] **Step 2: Verify generated mirror is clean**

Run:

```bash
python3 scripts/sync_ai_meta.py --check
```

Expected output:

```text
AI metadata is in sync.
```

- [ ] **Step 3: Run focused tests**

Run:

```bash
python3 -m pytest \
  tests/pipeline \
  tests/content_carousel \
  tests/content_reels \
  tests/test_zipsaja_remotion_skill_dag.py \
  tests/test_sync_ai_meta.py \
  -v
```

Expected: PASS.

- [ ] **Step 4: Check no generated files were edited manually**

Run:

```bash
git diff -- docs/ai | sed -n '1,120p'
```

Expected: diffs include generated notices from `scripts/sync_ai_meta.py`; no hand-written prose outside the generated format.

- [ ] **Step 5: Commit**

```bash
git add docs/ai
git commit -m "chore: AI 메타 미러 갱신"
```

---

### Task 10: End-to-End Dry Run Without External Secrets

**Files:**
- No required source file changes.

- [ ] **Step 1: Run tests that do not need DB/API secrets**

Run:

```bash
python3 -m pytest tests/pipeline tests/content_carousel tests/content_reels tests/test_zipsaja_remotion_skill_dag.py -v
```

Expected: PASS.

- [ ] **Step 2: Confirm Remotion project script exists**

Run:

```bash
node -e "const p=require('./.claude/skills/carousel/brands/zipsaja/reels/package.json'); if (!p.scripts['build:seoul']) process.exit(1); console.log(p.scripts['build:seoul'])"
```

Expected output:

```text
remotion render SeoulPriceReel out/zipsaja-seoul-price.mp4 --log=error
```

- [ ] **Step 3: Confirm no new skill tells agents to create HyperFrames**

Run:

```bash
rg -n "npx hyperframes|hyperframes init|hyperframes render|hyperframes_reel" \
  .claude/skills/zipsaja-remotion-orchestrator \
  .claude/skills/zipsaja-brief \
  .claude/skills/zipsaja-storyboard \
  .claude/skills/zipsaja-carousel-render \
  .claude/skills/zipsaja-remotion-render \
  .claude/skills/zipsaja-captions \
  .claude/skills/zipsaja-attachments \
  .claude/skills/zipsaja-package-qa
```

Expected: no command that creates or renders HyperFrames. Mentions of HyperFrames should only be prohibition text.

- [ ] **Step 4: Final status**

Run:

```bash
git status --short
```

Expected: only intentional uncommitted files remain. If this plan is executed commit-by-commit, working tree should be clean except unrelated user changes that predated the work.

---

## Self-Review

- Spec coverage: The plan implements the requested split into individual skills, preserves `AGENTS.md` as source-of-truth, and routes new zipsaja videos through Remotion only.
- Scope: This plan changes workflow metadata, skill docs, tests, and generated AI mirrors. It does not rewrite Remotion components or carousel rendering internals.
- Risk: Existing uncommitted changes in `.claude/skills/carousel/brands/zipsaja/reels` should not be reverted. Workers must inspect diffs before committing.
- Verification: The plan includes state tests, skill DAG smoke tests, metadata sync checks, and Remotion package-script validation.
