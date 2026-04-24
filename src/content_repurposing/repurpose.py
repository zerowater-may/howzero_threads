"""WF3: 트랜스크립트 → 멀티채널 콘텐츠 자동 변환.

Claude API를 사용하여 유튜브 대본을 8개 채널 포맷으로 병렬 변환한다.

Usage:
    python -m content_repurposing.repurpose --transcript ./output/transcripts/latest.txt --keyword "AI 자동화"
    python -m content_repurposing.repurpose --transcript ./output/transcripts/latest.txt --channels naver_blog,linkedin
"""
import argparse
import asyncio
import json
from datetime import datetime
from pathlib import Path

import httpx

from .config import RepurposingSettings
from .prompts.templates import PERSONA_CONTEXT, TEMPLATES, TEMPLATE_NAMES_KR


async def convert_single(
    channel: str,
    transcript: str,
    keyword: str,
    settings: RepurposingSettings,
    client: httpx.AsyncClient,
) -> dict:
    """단일 채널로 콘텐츠를 변환한다."""
    template = TEMPLATES[channel]
    prompt = template.format(
        persona=PERSONA_CONTEXT,
        transcript=transcript,
        keyword=keyword,
    )

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

    return {
        "channel": channel,
        "channel_kr": TEMPLATE_NAMES_KR.get(channel, channel),
        "content": content_text,
        "input_tokens": data.get("usage", {}).get("input_tokens", 0),
        "output_tokens": data.get("usage", {}).get("output_tokens", 0),
    }


async def repurpose_all(
    transcript: str,
    keyword: str,
    channels: list[str] | None = None,
    settings: RepurposingSettings | None = None,
) -> list[dict]:
    """트랜스크립트를 여러 채널로 병렬 변환한다."""
    if settings is None:
        settings = RepurposingSettings()

    if channels is None:
        channels = list(TEMPLATES.keys())

    invalid = set(channels) - set(TEMPLATES.keys())
    if invalid:
        raise ValueError(f"지원하지 않는 채널: {invalid}. 가능한 채널: {list(TEMPLATES.keys())}")

    async with httpx.AsyncClient() as client:
        tasks = [
            convert_single(ch, transcript, keyword, settings, client)
            for ch in channels
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    outputs = []
    for r in results:
        if isinstance(r, Exception):
            outputs.append({"channel": "error", "error": str(r)})
        else:
            outputs.append(r)

    return outputs


def save_results(results: list[dict], output_dir: Path, video_id: str = "latest") -> Path:
    """변환 결과를 파일로 저장한다."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    batch_dir = output_dir / f"{video_id}_{timestamp}"
    batch_dir.mkdir(parents=True, exist_ok=True)

    # 채널별 개별 파일
    for r in results:
        if "error" in r:
            continue
        channel = r["channel"]
        filepath = batch_dir / f"{channel}.md"
        filepath.write_text(r["content"], encoding="utf-8")

    # 전체 결과 JSON
    summary_path = batch_dir / "_summary.json"
    summary = {
        "generated_at": timestamp,
        "video_id": video_id,
        "channels": len([r for r in results if "error" not in r]),
        "errors": len([r for r in results if "error" in r]),
        "total_input_tokens": sum(r.get("input_tokens", 0) for r in results),
        "total_output_tokens": sum(r.get("output_tokens", 0) for r in results),
        "results": results,
    }
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"변환 완료! {batch_dir}")
    print(f"  성공: {summary['channels']}개 채널, 실패: {summary['errors']}개")
    print(f"  토큰 사용: 입력 {summary['total_input_tokens']:,}, 출력 {summary['total_output_tokens']:,}")

    return batch_dir


def main():
    parser = argparse.ArgumentParser(description="트랜스크립트 → 멀티채널 콘텐츠 변환")
    parser.add_argument("--transcript", required=True, help="트랜스크립트 텍스트 파일 경로")
    parser.add_argument("--keyword", default="AI 자동화", help="SEO 키워드")
    parser.add_argument("--channels", help="변환할 채널 (쉼표 구분, 미지정시 전체)")
    parser.add_argument("--output", default="./output/repurposed", help="출력 디렉토리")
    parser.add_argument("--video-id", default="latest", help="영상 식별자")
    args = parser.parse_args()

    settings = RepurposingSettings()

    transcript_text = Path(args.transcript).read_text(encoding="utf-8")
    channels = args.channels.split(",") if args.channels else None

    results = asyncio.run(repurpose_all(transcript_text, args.keyword, channels, settings))
    save_results(results, Path(args.output), args.video_id)


if __name__ == "__main__":
    main()
