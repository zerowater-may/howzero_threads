"""Call an LLM API with platform-specific prompts, write 3 caption files."""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from .prompts import instagram_prompt, linkedin_prompt, threads_prompt

_DEFAULT_MODEL = "claude-sonnet-4-6"
_DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-flash"
_DEFAULT_KIMI_MODEL = "kimi-k2.6"
_MAX_TOKENS = 2048
_THREADS_MAX_LINES = 3

CaptionProvider = str


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


def _read_env(*names: str) -> str | None:
    for name in names:
        value = os.environ.get(name)
        if value and value.strip():
            return value.strip()
    return None


def resolve_caption_provider() -> CaptionProvider:
    """Resolve provider from env while preserving the original Anthropic default."""
    explicit = _read_env("CONTENT_CAPTIONS_PROVIDER")
    if explicit:
        return explicit.lower().replace("-", "_")
    if _read_env("ANTHROPIC_API_KEY"):
        return "anthropic"
    if _read_env("KIMI_API_KEY", "MOONSHOT_API_KEY"):
        return "kimi"
    if _read_env("DEEPSEEK_API_KEY"):
        return "deepseek"
    return "anthropic"


def _call_claude(prompt: str) -> str:
    import anthropic

    api_key = _read_env("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is required when CONTENT_CAPTIONS_PROVIDER=anthropic")

    client = anthropic.Anthropic(api_key=api_key)
    message = client.messages.create(
        model=_read_env("CONTENT_CAPTIONS_MODEL", "ANTHROPIC_MODEL") or _DEFAULT_MODEL,
        max_tokens=_MAX_TOKENS,
        messages=[{"role": "user", "content": prompt}],
    )
    return "".join(block.text for block in message.content if hasattr(block, "text")).strip()


def _call_openai_compatible(
    *,
    provider: CaptionProvider,
    prompt: str,
    api_key: str,
    base_url: str,
    model: str,
) -> str:
    from openai import OpenAI

    client = OpenAI(api_key=api_key, base_url=base_url)
    extra_body: dict[str, Any] | None = None
    if provider == "kimi":
        extra_body = {"thinking": {"type": _read_env("KIMI_THINKING") or "disabled"}}

    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=_MAX_TOKENS,
        temperature=0.7,
        stream=False,
        **({"extra_body": extra_body} if extra_body else {}),
    )
    content = response.choices[0].message.content
    return (content or "").strip()


def _call_model(provider: CaptionProvider, prompt: str) -> str:
    if provider == "anthropic":
        return _call_claude(prompt)
    if provider == "deepseek":
        api_key = _read_env("DEEPSEEK_API_KEY")
        if not api_key:
            raise RuntimeError("DEEPSEEK_API_KEY is required when CONTENT_CAPTIONS_PROVIDER=deepseek")
        return _call_openai_compatible(
            provider=provider,
            prompt=prompt,
            api_key=api_key,
            base_url=_read_env("CONTENT_CAPTIONS_BASE_URL", "DEEPSEEK_BASE_URL") or "https://api.deepseek.com",
            model=_read_env("CONTENT_CAPTIONS_MODEL", "DEEPSEEK_MODEL") or _DEFAULT_DEEPSEEK_MODEL,
        )
    if provider in {"kimi", "moonshot"}:
        api_key = _read_env("KIMI_API_KEY", "MOONSHOT_API_KEY")
        if not api_key:
            raise RuntimeError("KIMI_API_KEY or MOONSHOT_API_KEY is required when CONTENT_CAPTIONS_PROVIDER=kimi")
        return _call_openai_compatible(
            provider="kimi",
            prompt=prompt,
            api_key=api_key,
            base_url=_read_env("CONTENT_CAPTIONS_BASE_URL", "KIMI_BASE_URL", "MOONSHOT_BASE_URL")
            or "https://api.moonshot.ai/v1",
            model=_read_env("CONTENT_CAPTIONS_MODEL", "KIMI_MODEL", "MOONSHOT_MODEL") or _DEFAULT_KIMI_MODEL,
        )
    raise RuntimeError(
        "Unsupported CONTENT_CAPTIONS_PROVIDER. Use anthropic, deepseek, or kimi."
    )


def normalize_threads_caption(text: str) -> str:
    """Keep Threads copy in the zipsaja 2-3 line hook format."""
    lines = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        if line.startswith("#"):
            continue
        if line.lower().startswith(("출력:", "threads:", "thread:")):
            continue
        lines.append(line)
        if len(lines) == _THREADS_MAX_LINES:
            break
    return "\n".join(lines).strip()


def generate_captions(dataset: dict[str, Any], *, out_dir: Path) -> dict[str, Path]:
    """Call the configured LLM 3 times, one per platform. Writes IG/Threads/LinkedIn .txt files.

    Returns {platform: path} map.
    """
    provider = resolve_caption_provider()

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
        text = _call_model(provider, prompt)
        if platform == "threads":
            text = normalize_threads_caption(text)
        out_path = out_dir / f"{platform}.txt"
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(text, encoding="utf-8")
        results[platform] = out_path

    return results
