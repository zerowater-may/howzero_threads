"""Call Anthropic API with platform-specific prompts, write 3 caption files."""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import anthropic

from .prompts import instagram_prompt, linkedin_prompt, threads_prompt

_DEFAULT_MODEL = "claude-sonnet-4-6"
_MAX_TOKENS = 2048


def _summarize_insights(dataset: dict[str, Any]) -> str:
    """One-line summary text to embed in prompts."""
    districts = dataset.get("districts", [])
    if not districts:
        return "(데이터 없음)"
    top = max(districts, key=lambda d: d["changePct"])
    bottom = min(districts, key=lambda d: d["changePct"])
    avg = sum(d["changePct"] for d in districts) / len(districts)
    return (
        f"상위 {top['district']} {top['changePct']:+.1f}%, "
        f"하위 {bottom['district']} {bottom['changePct']:+.1f}%, "
        f"평균 {avg:+.1f}%"
    )


def _call_claude(client: anthropic.Anthropic, prompt: str) -> str:
    message = client.messages.create(
        model=_DEFAULT_MODEL,
        max_tokens=_MAX_TOKENS,
        messages=[{"role": "user", "content": prompt}],
    )
    return "".join(block.text for block in message.content if hasattr(block, "text")).strip()


def generate_captions(dataset: dict[str, Any], *, out_dir: Path) -> dict[str, Path]:
    """Call Anthropic 3 times, one per platform. Writes IG/Threads/LinkedIn .txt files.

    Returns {platform: path} map.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is required for content-captions")

    client = anthropic.Anthropic(api_key=api_key)

    ctx = {
        "title": dataset.get("title", ""),
        "insights_text": _summarize_insights(dataset),
    }

    results: dict[str, Path] = {}
    for platform, builder in (
        ("instagram", instagram_prompt),
        ("threads", threads_prompt),
        ("linkedin", linkedin_prompt),
    ):
        prompt = builder(ctx)
        text = _call_claude(client, prompt)
        out_path = out_dir / f"{platform}.txt"
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(text, encoding="utf-8")
        results[platform] = out_path

    return results
