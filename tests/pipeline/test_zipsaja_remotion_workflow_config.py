from pathlib import Path
from types import SimpleNamespace

import scripts.pipeline.__main__ as pipeline_main
from scripts.pipeline.__main__ import (
    ZIPSAJA_REMOTION_STEPS,
    configure_zipsaja_remotion_state,
    zipsaja_content_step_for_artifact,
)
from scripts.pipeline.state import PipelineState


def test_zipsaja_remotion_steps_are_ordered():
    assert ZIPSAJA_REMOTION_STEPS == [
        "brief",
        "data",
        "storyboard",
        "remotion",
        "carousel",
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


def test_zipsaja_content_artifacts_map_to_canonical_workflow_steps():
    assert zipsaja_content_step_for_artifact("carousel") == "carousel"
    assert zipsaja_content_step_for_artifact("reels") == "remotion"
    assert zipsaja_content_step_for_artifact("attachments") == "attachments"
    assert zipsaja_content_step_for_artifact("captions") == "captions"


def _patch_pipeline_paths(monkeypatch, tmp_path: Path):
    def fake_bundle_path(brand: str, slug: str) -> Path:
        return tmp_path / brand / f"{brand}_pipeline_{slug}"

    monkeypatch.setattr(pipeline_main, "bundle_path", fake_bundle_path)
    monkeypatch.setattr(
        pipeline_main,
        "state_file_path",
        lambda brand, slug: fake_bundle_path(brand, slug) / "pipeline-state.json",
    )


def test_zipsaja_automatic_pipeline_finishes_with_package_qa_pending(monkeypatch, tmp_path: Path):
    _patch_pipeline_paths(monkeypatch, tmp_path)

    def fake_run(cmd, check=False):
        if cmd[2] == "scripts.zipsaja_data_fetch":
            data_out = Path(cmd[cmd.index("--out") + 1])
            data_out.parent.mkdir(parents=True, exist_ok=True)
            data_out.write_text('{"districts": []}', encoding="utf-8")
        return SimpleNamespace(returncode=0)

    monkeypatch.setattr(pipeline_main.subprocess, "run", fake_run)

    assert pipeline_main.main(["zipsaja", "test topic"]) == 0

    state = PipelineState.load(tmp_path / "zipsaja" / "zipsaja_pipeline_test-topic" / "pipeline-state.json")
    assert state.status == "qa-pending"
    assert state.steps["brief"] == "skipped"
    assert state.steps["storyboard"] == "skipped"
    assert state.steps["package-qa"] == "pending"


def test_zipsaja_pipeline_passes_topic_and_metadata_to_data_fetch(monkeypatch, tmp_path: Path):
    _patch_pipeline_paths(monkeypatch, tmp_path)
    captured_commands = []

    def fake_run(cmd, check=False):
        captured_commands.append(cmd)
        if cmd[2] == "scripts.zipsaja_data_fetch":
            data_out = Path(cmd[cmd.index("--out") + 1])
            data_out.parent.mkdir(parents=True, exist_ok=True)
            data_out.write_text('{"districts": []}', encoding="utf-8")
        return SimpleNamespace(returncode=0)

    monkeypatch.setattr(pipeline_main.subprocess, "run", fake_run)

    assert pipeline_main.main([
        "zipsaja",
        "전세난 대출규제 댓글싸움",
        "--data-subtitle",
        "2025년 vs 2026년",
        "--data-period",
        "2025.1 ~ 2025.12 vs 2026.1 ~ 현재",
        "--data-source",
        "국토부 실거래가 + 웹 이슈",
    ]) == 0

    data_fetch_cmd = captured_commands[0]
    assert data_fetch_cmd[data_fetch_cmd.index("--title") + 1] == "전세난 대출규제 댓글싸움"
    assert data_fetch_cmd[data_fetch_cmd.index("--subtitle") + 1] == "2025년 vs 2026년"
    assert data_fetch_cmd[data_fetch_cmd.index("--period") + 1] == "2025.1 ~ 2025.12 vs 2026.1 ~ 현재"
    assert data_fetch_cmd[data_fetch_cmd.index("--source") + 1] == "국토부 실거래가 + 웹 이슈"


def test_zipsaja_automatic_pipeline_runs_remotion_before_carousel(monkeypatch, tmp_path: Path):
    _patch_pipeline_paths(monkeypatch, tmp_path)
    captured_modules = []

    def fake_run(cmd, check=False):
        captured_modules.append(cmd[2])
        if cmd[2] == "scripts.zipsaja_data_fetch":
            data_out = Path(cmd[cmd.index("--out") + 1])
            data_out.parent.mkdir(parents=True, exist_ok=True)
            data_out.write_text('{"districts": []}', encoding="utf-8")
        return SimpleNamespace(returncode=0)

    monkeypatch.setattr(pipeline_main.subprocess, "run", fake_run)

    assert pipeline_main.main(["zipsaja", "test topic"]) == 0

    assert captured_modules[:3] == [
        "scripts.zipsaja_data_fetch",
        "scripts.content_reels",
        "scripts.content_carousel",
    ]


def test_zipsaja_data_fetch_failure_marks_canonical_data_step(monkeypatch, tmp_path: Path):
    _patch_pipeline_paths(monkeypatch, tmp_path)
    monkeypatch.setattr(
        pipeline_main.subprocess,
        "run",
        lambda cmd, check=False: SimpleNamespace(returncode=7),
    )

    assert pipeline_main.main(["zipsaja", "test topic"]) == 7

    state = PipelineState.load(tmp_path / "zipsaja" / "zipsaja_pipeline_test-topic" / "pipeline-state.json")
    assert state.failed_at == "data"
    assert state.steps["data"] == "failed"
    assert "zipsaja-data-fetch" not in state.steps


def test_zipsaja_reels_failure_marks_canonical_remotion_step(monkeypatch, tmp_path: Path):
    _patch_pipeline_paths(monkeypatch, tmp_path)

    def fake_run(cmd, check=False):
        module = cmd[2]
        if module == "scripts.zipsaja_data_fetch":
            data_out = Path(cmd[cmd.index("--out") + 1])
            data_out.parent.mkdir(parents=True, exist_ok=True)
            data_out.write_text('{"districts": []}', encoding="utf-8")
            return SimpleNamespace(returncode=0)
        if module == "scripts.content_reels":
            return SimpleNamespace(returncode=9)
        return SimpleNamespace(returncode=0)

    monkeypatch.setattr(pipeline_main.subprocess, "run", fake_run)

    assert pipeline_main.main(["zipsaja", "test topic"]) == 9

    state = PipelineState.load(tmp_path / "zipsaja" / "zipsaja_pipeline_test-topic" / "pipeline-state.json")
    assert state.failed_at == "remotion"
    assert state.steps["remotion"] == "failed"
    assert "content-reels" not in state.steps
