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
        steps=["brief", "data", "storyboard", "remotion", "carousel"],
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


def test_pipeline_state_record_artifact_serializes_path_as_string(tmp_path: Path):
    state_path = tmp_path / "pipeline-state.json"
    artifact_path = tmp_path / "data.json"
    state = PipelineState(
        pipeline_id="zipsaja_20260428_test",
        brand="zipsaja",
        topic="테스트 주제",
        slug="test",
    )

    state.record_artifact("data", artifact_path)
    state.save(state_path)

    raw = json.loads(state_path.read_text(encoding="utf-8"))
    assert raw["artifacts"]["data"]["path"] == str(artifact_path)


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
