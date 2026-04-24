"""WF2: 숏폼 클리핑 — 유튜브 롱폼에서 바이럴 가능한 쇼츠/릴스 구간을 추출한다.

OpusClip API를 사용하여 자동으로 하이라이트 구간을 식별하고,
각 클립에 대한 메타데이터(제목, 설명, 해시태그)를 생성한다.

대안 모드: OpusClip API 없이 트랜스크립트 기반으로 Claude가
최적 클립 구간을 추천하는 fallback 모드도 지원한다.

Usage:
    python -m content_repurposing.shortform --url "https://youtube.com/watch?v=..." --mode opusclip
    python -m content_repurposing.shortform --url "https://youtube.com/watch?v=..." --mode ai
"""
import argparse
import asyncio
import json
from datetime import datetime
from pathlib import Path

import httpx

from .config import RepurposingSettings
from .prompts.templates import PERSONA_CONTEXT


CLIP_ANALYSIS_PROMPT = """{persona}

당신은 유튜브 숏폼 전문 편집자입니다. 아래 트랜스크립트에서 바이럴 가능한 숏폼 클립 구간을 3~5개 추출하세요.

## 기준
- 각 클립은 30~90초 분량
- 단독으로 봐도 이해되는 완결된 이야기
- 강한 훅(첫 3초에 시선을 잡는 문장)이 있는 구간
- 감정적 반응(놀라움, 공감, 분노)을 유발하는 구간 우선
- 하우제로 페르소나의 직설적 톤과 맞는 구간

## 출력 형식 (JSON 배열)
```json
[
  {{
    "clip_number": 1,
    "start_time": "00:03:45",
    "end_time": "00:04:52",
    "duration_sec": 67,
    "hook": "남들이 챗GPT 프롬프트 입력할 때 저는 10억을 벌었습니다",
    "title_ko": "코딩 없이 AI로 10억 번 방법",
    "title_en": "How I Made $700K with AI Without Coding",
    "description": "GPT-3로 SaaS를 만들어 연매출 10억을 달성한 과정의 핵심 인사이트",
    "hashtags": ["#AI자동화", "#SaaS", "#하우제로", "#1인기업"],
    "virality_score": 9,
    "virality_reason": "강한 숫자 훅 + 역발상 메시지"
  }}
]
```

## 트랜스크립트
{transcript}
"""


async def analyze_clips_with_ai(
    transcript: str,
    settings: RepurposingSettings,
) -> list[dict]:
    """Claude를 사용하여 트랜스크립트에서 숏폼 클립 구간을 분석한다."""
    prompt = CLIP_ANALYSIS_PROMPT.format(
        persona=PERSONA_CONTEXT,
        transcript=transcript,
    )

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": settings.anthropic_api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": settings.claude_model,
                "max_tokens": settings.claude_max_tokens,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=120,
        )
        resp.raise_for_status()
        data = resp.json()

    content_text = ""
    for block in data.get("content", []):
        if block.get("type") == "text":
            content_text += block["text"]

    # JSON 배열 추출
    start = content_text.find("[")
    end = content_text.rfind("]") + 1
    if start == -1 or end == 0:
        raise ValueError("클립 분석 결과에서 JSON을 찾을 수 없습니다")

    clips = json.loads(content_text[start:end])
    return clips


async def create_clips_opusclip(
    youtube_url: str,
    settings: RepurposingSettings,
) -> list[dict]:
    """OpusClip API를 사용하여 숏폼 클립을 생성한다."""
    if not settings.opusclip_api_key:
        raise ValueError("REPURPOSE_OPUSCLIP_API_KEY가 설정되지 않았습니다")

    async with httpx.AsyncClient() as client:
        # 클립 생성 요청
        resp = await client.post(
            "https://api.opus.pro/v1/clip",
            headers={
                "Authorization": f"Bearer {settings.opusclip_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "url": youtube_url,
                "num_clips": 5,
                "min_duration": 30,
                "max_duration": 90,
                "language": "ko",
            },
            timeout=300,
        )
        resp.raise_for_status()
        data = resp.json()

    clips = []
    for i, clip in enumerate(data.get("clips", []), 1):
        clips.append({
            "clip_number": i,
            "start_time": clip.get("start_time", "00:00:00"),
            "end_time": clip.get("end_time", "00:00:00"),
            "duration_sec": clip.get("duration", 0),
            "hook": clip.get("hook", ""),
            "title_ko": clip.get("title", f"클립 {i}"),
            "virality_score": clip.get("virality_score", 0),
            "download_url": clip.get("download_url", ""),
        })

    return clips


async def generate_shortform_clips(
    youtube_url: str,
    transcript: str | None = None,
    mode: str = "ai",
    settings: RepurposingSettings | None = None,
) -> list[dict]:
    """숏폼 클립 생성 — OpusClip 또는 AI 분석 모드 선택."""
    if settings is None:
        settings = RepurposingSettings()

    if mode == "opusclip":
        return await create_clips_opusclip(youtube_url, settings)
    elif mode == "ai":
        if transcript is None:
            raise ValueError("AI 모드에서는 transcript가 필요합니다")
        return await analyze_clips_with_ai(transcript, settings)
    else:
        raise ValueError(f"지원하지 않는 모드: {mode}. 'opusclip' 또는 'ai'를 사용하세요.")


def save_clips(clips: list[dict], output_dir: Path, video_id: str = "latest") -> Path:
    """클립 분석 결과를 파일로 저장한다."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    clips_dir = output_dir / f"{video_id}_{timestamp}_clips"
    clips_dir.mkdir(parents=True, exist_ok=True)

    # 전체 결과
    result_path = clips_dir / "clips_analysis.json"
    result_path.write_text(
        json.dumps(clips, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # 개별 클립 메타데이터 + 편집 지시서
    for clip in clips:
        num = clip.get("clip_number", 0)
        clip_path = clips_dir / f"clip_{num:02d}.md"
        content = f"""# 클립 {num}: {clip.get('title_ko', '')}

## 타임코드
- 시작: {clip.get('start_time', '')}
- 끝: {clip.get('end_time', '')}
- 길이: {clip.get('duration_sec', 0)}초

## 훅 (첫 3초)
> {clip.get('hook', '')}

## 제목
- 한글: {clip.get('title_ko', '')}
- 영문: {clip.get('title_en', '')}

## 설명
{clip.get('description', '')}

## 해시태그
{' '.join(clip.get('hashtags', []))}

## 바이럴 점수: {clip.get('virality_score', 0)}/10
{clip.get('virality_reason', '')}
"""
        clip_path.write_text(content, encoding="utf-8")

    print(f"클립 분석 완료! {clips_dir}")
    print(f"  클립 수: {len(clips)}개")

    return clips_dir


def main():
    parser = argparse.ArgumentParser(description="숏폼 클리핑 — 유튜브 → 쇼츠/릴스")
    parser.add_argument("--url", required=True, help="유튜브 영상 URL")
    parser.add_argument("--mode", choices=["opusclip", "ai"], default="ai", help="클리핑 모드")
    parser.add_argument("--transcript", help="트랜스크립트 파일 경로 (ai 모드)")
    parser.add_argument("--output", default="./output/shortform", help="출력 디렉토리")
    parser.add_argument("--video-id", default="latest", help="영상 식별자")
    args = parser.parse_args()

    transcript = None
    if args.transcript:
        transcript = Path(args.transcript).read_text(encoding="utf-8")

    clips = asyncio.run(
        generate_shortform_clips(args.url, transcript, args.mode)
    )
    save_clips(clips, Path(args.output), args.video_id)


if __name__ == "__main__":
    main()
