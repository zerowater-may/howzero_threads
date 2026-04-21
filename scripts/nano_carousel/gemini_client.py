"""REST wrapper for Gemini Nano Banana image generation."""

import base64
import time
from pathlib import Path

import requests


_ENDPOINT_TEMPLATE = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
)


class GeminiError(RuntimeError):
    """Raised when Gemini API call fails after retries."""


def generate_image(
    prompt: str,
    api_key: str,
    out_path: Path,
    model: str = "gemini-2.5-flash-image",
    max_retries: int = 3,
    timeout: int = 60,
) -> Path:
    """Call Nano Banana and save the first inline PNG to ``out_path``.

    Retries with exponential backoff on 429/5xx.
    Raises ``GeminiError`` if no image is returned after all retries.
    """
    url = _ENDPOINT_TEMPLATE.format(model=model)
    headers = {"Content-Type": "application/json", "X-goog-api-key": api_key}
    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    last_err: str | None = None
    for attempt in range(max_retries):
        resp = requests.post(url, headers=headers, json=payload, timeout=timeout)
        if resp.status_code in (429, 500, 502, 503, 504):
            last_err = f"HTTP {resp.status_code}: {resp.text[:200]}"
            time.sleep(2 ** attempt)
            continue
        if resp.status_code != 200:
            raise GeminiError(f"HTTP {resp.status_code}: {resp.text[:500]}")

        data = resp.json()
        parts = (
            data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [])
        )
        for part in parts:
            inline = part.get("inlineData") or part.get("inline_data")
            if inline and "data" in inline:
                out_path.parent.mkdir(parents=True, exist_ok=True)
                out_path.write_bytes(base64.b64decode(inline["data"]))
                return out_path
        raise GeminiError(f"no image in response: {str(data)[:500]}")

    raise GeminiError(f"exhausted retries: {last_err}")
