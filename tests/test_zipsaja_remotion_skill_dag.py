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
