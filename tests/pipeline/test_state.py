import json
from pathlib import Path

from scripts.pipeline.state import PipelineState


def test_pipeline_state_roundtrip(tmp_path: Path):
    state_path = tmp_path / "pipeline-state.json"
    state = PipelineState(
        pipeline_id="zipsaja_20260424_test",
        brand="zipsaja",
        topic="테스트 주제",
        slug="test",
    )
    state.status = "pending"
    state.save(state_path)

    loaded = PipelineState.load(state_path)
    assert loaded.pipeline_id == "zipsaja_20260424_test"
    assert loaded.brand == "zipsaja"
    assert loaded.topic == "테스트 주제"
    assert loaded.slug == "test"
    assert loaded.status == "pending"


def test_pipeline_state_load_missing_file_raises(tmp_path: Path):
    import pytest
    with pytest.raises(FileNotFoundError):
        PipelineState.load(tmp_path / "nope.json")


def test_pipeline_state_mark_failed(tmp_path: Path):
    state = PipelineState(
        pipeline_id="zipsaja_20260424_x",
        brand="zipsaja",
        topic="x",
        slug="x",
    )
    state.mark_failed("zipsaja-data-fetch", "SSH tunnel timeout")
    assert state.status == "failed"
    assert state.failed_at == "zipsaja-data-fetch"
    assert state.failed_reason == "SSH tunnel timeout"


def test_pipeline_state_data_block_optional(tmp_path: Path):
    state_path = tmp_path / "p.json"
    state = PipelineState(
        pipeline_id="howzero_20260424_x",
        brand="howzero",
        topic="x",
        slug="x",
    )
    assert state.data is None
    state.save(state_path)
    raw = json.loads(state_path.read_text())
    assert raw["data"] is None
