"""콘텐츠 리퍼포징 파이프라인 테스트.

모듈 임포트, 설정 구조, 파이프라인 로직을 검증한다.
외부 API 호출 없이 파이프라인 구조와 데이터 흐름을 테스트.
"""
import json
import sys
from pathlib import Path
from unittest.mock import patch, AsyncMock, MagicMock

import pytest

# src 경로 추가
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from content_repurposing.config import RepurposingSettings
from content_repurposing.transcript import format_transcript, save_transcript
from content_repurposing.repurpose import save_results
from content_repurposing.shortform import save_clips
from content_repurposing.prompts.templates import TEMPLATES, TEMPLATE_NAMES_KR


# ── Fixtures ──────────────────────────────────────────────────

@pytest.fixture
def settings(tmp_path, monkeypatch):
    monkeypatch.delenv("REPURPOSE_ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("REPURPOSE_OPENAI_API_KEY", raising=False)
    return RepurposingSettings(
        _env_file=None,
        openai_api_key="test-openai-key",
        anthropic_api_key="test-anthropic-key",
        output_dir=str(tmp_path / "repurposed"),
        transcript_dir=str(tmp_path / "transcripts"),
        shortform_dir=str(tmp_path / "shortform"),
        schedule_dir=str(tmp_path / "schedules"),
    )


@pytest.fixture
def sample_transcript():
    return {
        "full_text": "AI 자동화는 비즈니스의 미래입니다. 반복 작업을 자동화하면 생산성이 10배 향상됩니다.",
        "timestamped": "[00:00:00] AI 자동화는 비즈니스의 미래입니다.\n[00:00:15] 반복 작업을 자동화하면 생산성이 10배 향상됩니다.",
        "segments": [
            {"start": 0, "end": 15, "text": "AI 자동화는 비즈니스의 미래입니다."},
            {"start": 15, "end": 30, "text": "반복 작업을 자동화하면 생산성이 10배 향상됩니다."},
        ],
        "duration": 30.0,
        "language": "ko",
    }


@pytest.fixture
def sample_clips():
    return [
        {
            "clip_number": 1,
            "start_time": "00:01:00",
            "end_time": "00:02:10",
            "duration_sec": 70,
            "hook": "AI로 월 1000만원 버는 법",
            "title_ko": "AI 자동화로 수익 만들기",
            "title_en": "Make Money with AI Automation",
            "description": "AI 자동화 사업 핵심 인사이트",
            "hashtags": ["#AI자동화", "#하우제로"],
            "virality_score": 8,
            "virality_reason": "숫자 훅 + 실전 사례",
        },
    ]


@pytest.fixture
def sample_repurpose_results():
    return [
        {
            "channel": "naver_blog",
            "channel_kr": "네이버 블로그",
            "content": "# AI 자동화 완벽 가이드\n\n본문 내용...",
            "input_tokens": 1000,
            "output_tokens": 500,
        },
        {
            "channel": "web_blog_seo",
            "channel_kr": "웹 블로그 SEO",
            "content": "# AI Automation Guide\n\nContent...",
            "input_tokens": 1000,
            "output_tokens": 600,
        },
    ]


# ── Config Tests ──────────────────────────────────────────────

class TestConfig:
    def test_default_settings(self, monkeypatch):
        monkeypatch.delenv("REPURPOSE_ANTHROPIC_API_KEY", raising=False)
        monkeypatch.delenv("REPURPOSE_OPENAI_API_KEY", raising=False)
        s = RepurposingSettings(_env_file=None)
        assert s.claude_model == "claude-sonnet-4-20250514"
        assert s.whisper_model == "whisper-1"
        assert s.output_dir == "./output/repurposed"

    def test_env_prefix(self):
        assert RepurposingSettings.model_config["env_prefix"] == "REPURPOSE_"


# ── Template Tests ────────────────────────────────────────────

class TestTemplates:
    def test_all_channels_have_templates(self):
        expected_channels = [
            "naver_blog", "web_blog_seo", "linkedin", "x_thread",
            "threads", "instagram_carousel", "email_newsletter", "brunch_essay",
        ]
        for ch in expected_channels:
            assert ch in TEMPLATES, f"채널 '{ch}' 템플릿이 없습니다"

    def test_all_channels_have_kr_names(self):
        for ch in TEMPLATES:
            assert ch in TEMPLATE_NAMES_KR, f"채널 '{ch}' 한글 이름이 없습니다"

    def test_templates_have_placeholders(self):
        for ch, tmpl in TEMPLATES.items():
            assert "{persona}" in tmpl, f"'{ch}' 템플릿에 persona 자리표시자가 없습니다"
            assert "{transcript}" in tmpl, f"'{ch}' 템플릿에 transcript 자리표시자가 없습니다"

    def test_seo_templates_have_keyword(self):
        """SEO 관련 채널은 keyword 자리표시자가 있어야 한다."""
        seo_channels = ["naver_blog", "web_blog_seo"]
        for ch in seo_channels:
            assert "{keyword}" in TEMPLATES[ch], f"'{ch}' 템플릿에 keyword 자리표시자가 없습니다"


# ── Transcript Tests ──────────────────────────────────────────

class TestTranscript:
    def test_format_transcript(self):
        whisper_resp = {
            "segments": [
                {"start": 0, "text": "첫 번째 문장"},
                {"start": 65, "text": "두 번째 문장"},
                {"start": 3661, "text": "한 시간 후"},
            ],
        }
        formatted = format_transcript(whisper_resp)
        assert "[00:00:00] 첫 번째 문장" in formatted
        assert "[00:01:05] 두 번째 문장" in formatted
        assert "[01:01:01] 한 시간 후" in formatted

    def test_format_transcript_empty(self):
        assert format_transcript({"segments": []}) == ""

    def test_save_transcript(self, sample_transcript, tmp_path):
        output_path = tmp_path / "test_video"
        save_transcript(sample_transcript, output_path)

        json_path = output_path.with_suffix(".json")
        txt_path = output_path.with_suffix(".txt")

        assert json_path.exists()
        assert txt_path.exists()

        data = json.loads(json_path.read_text(encoding="utf-8"))
        assert data["duration"] == 30.0
        assert len(data["segments"]) == 2


# ── Shortform Tests ───────────────────────────────────────────

class TestShortform:
    def test_save_clips(self, sample_clips, tmp_path):
        clips_dir = save_clips(sample_clips, tmp_path / "shortform", "test_vid")
        assert clips_dir.exists()
        assert (clips_dir / "clips_analysis.json").exists()
        assert (clips_dir / "clip_01.md").exists()

        analysis = json.loads((clips_dir / "clips_analysis.json").read_text(encoding="utf-8"))
        assert len(analysis) == 1
        assert analysis[0]["virality_score"] == 8


# ── Repurpose Tests ───────────────────────────────────────────

class TestRepurpose:
    def test_save_results(self, sample_repurpose_results, tmp_path):
        batch_dir = save_results(sample_repurpose_results, tmp_path / "repurposed", "test_vid")
        assert batch_dir.exists()
        assert (batch_dir / "naver_blog.md").exists()
        assert (batch_dir / "web_blog_seo.md").exists()
        assert (batch_dir / "_summary.json").exists()

        summary = json.loads((batch_dir / "_summary.json").read_text(encoding="utf-8"))
        assert summary["channels"] == 2
        assert summary["errors"] == 0
        assert summary["total_input_tokens"] == 2000


# ── Pipeline Integration Tests ────────────────────────────────

class TestPipeline:
    @patch("content_repurposing.pipeline.sync_schedule_to_notion")
    @patch("content_repurposing.pipeline.execute_schedule")
    @patch("content_repurposing.pipeline.build_schedule")
    @patch("content_repurposing.pipeline.save_clips")
    @patch("content_repurposing.pipeline.generate_shortform_clips")
    @patch("content_repurposing.pipeline.repurpose_all")
    @patch("content_repurposing.pipeline.save_results")
    @patch("content_repurposing.pipeline.extract_transcript")
    @patch("content_repurposing.pipeline.save_transcript")
    def test_pipeline_dry_run(
        self,
        mock_save_tx, mock_extract_tx, mock_save_results, mock_repurpose,
        mock_shortform, mock_save_clips,
        mock_build_sched, mock_exec_sched, mock_notion,
        settings, tmp_path, sample_transcript, sample_repurpose_results,
    ):
        from content_repurposing.pipeline import run_pipeline

        mock_extract_tx.return_value = sample_transcript
        mock_shortform.return_value = [{"clip_number": 1, "hook": "test"}]
        mock_save_clips.return_value = tmp_path / "clips"
        mock_repurpose.return_value = sample_repurpose_results

        batch_dir = tmp_path / "repurposed" / "test_20260401"
        batch_dir.mkdir(parents=True, exist_ok=True)
        mock_save_results.return_value = batch_dir

        report = run_pipeline(
            youtube_url="https://youtube.com/watch?v=test123",
            keyword="AI 자동화",
            skip_schedule=True,
            skip_notion=True,
            settings=settings,
        )

        assert report["video_id"] == "test123"
        assert report["transcript_duration_sec"] == 30.0
        assert report["channels_generated"] == 2
        mock_extract_tx.assert_called_once()
        mock_repurpose.assert_called_once()

    def test_video_id_extraction(self):
        """유튜브 URL에서 video_id 추출 로직 검증."""
        from content_repurposing.pipeline import run_pipeline
        import inspect
        source = inspect.getsource(run_pipeline)
        # video_id 추출 로직이 존재하는지 확인
        assert "v=" in source
        assert "youtu.be/" in source
