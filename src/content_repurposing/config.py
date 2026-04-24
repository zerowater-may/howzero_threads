"""콘텐츠 리퍼포징 파이프라인 설정."""
from pydantic_settings import BaseSettings


class RepurposingSettings(BaseSettings):
    # YouTube / Transcript
    youtube_api_key: str = ""

    # Whisper (OpenAI) for transcript
    openai_api_key: str = ""
    whisper_model: str = "whisper-1"

    # Claude API for text conversion
    anthropic_api_key: str = ""
    claude_model: str = "claude-sonnet-4-20250514"
    claude_max_tokens: int = 4096

    # OpusClip for short-form clipping
    opusclip_api_key: str = ""

    # Buffer for scheduled posting
    buffer_access_token: str = ""

    # Notion for content calendar
    notion_api_key: str = ""
    notion_calendar_db_id: str = ""

    # Output directories
    output_dir: str = "./output/repurposed"
    transcript_dir: str = "./output/transcripts"
    shortform_dir: str = "./output/shortform"
    schedule_dir: str = "./output/schedules"

    model_config = {"env_prefix": "REPURPOSE_", "env_file": ".env"}
