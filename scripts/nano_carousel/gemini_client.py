"""REST wrapper for Gemini Nano Banana image generation.

Supports reference image attachment (for character consistency) and
aspect ratio constraint via generationConfig.
"""

import base64
import time
from pathlib import Path

import requests


_ENDPOINT_TEMPLATE = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
)


class GeminiError(RuntimeError):
    """Raised when Gemini API call fails after retries."""


def _encode_image(path: Path) -> dict:
    return {
        "inline_data": {
            "mime_type": "image/png",
            "data": base64.b64encode(path.read_bytes()).decode(),
        }
    }


def generate_image(
    prompt: str,
    api_key: str,
    out_path: Path,
    model: str = "gemini-3.1-flash-image-preview",
    reference_image_paths: list[Path] | None = None,
    aspect_ratio: str | None = "3:4",
    max_retries: int = 3,
    timeout: int = 90,
) -> Path:
    """Call Nano Banana and save the first inline PNG to ``out_path``.

    Reference images (if any) are encoded as inline_data and placed BEFORE
    the text prompt — this is how Gemini binds style/character guidance.

    Retries with exponential backoff on 429/5xx.
    Raises ``GeminiError`` if no image is returned after all retries.
    """
    url = _ENDPOINT_TEMPLATE.format(model=model)
    headers = {"Content-Type": "application/json", "X-goog-api-key": api_key}

    parts: list[dict] = []
    for ref in reference_image_paths or []:
        parts.append(_encode_image(ref))
    parts.append({"text": prompt})

    payload: dict = {"contents": [{"parts": parts}]}
    if aspect_ratio:
        payload["generationConfig"] = {
            "imageConfig": {"aspectRatio": aspect_ratio},
        }

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
        response_parts = (
            data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [])
        )
        for part in response_parts:
            inline = part.get("inlineData") or part.get("inline_data")
            if inline and "data" in inline:
                out_path.parent.mkdir(parents=True, exist_ok=True)
                out_path.write_bytes(base64.b64decode(inline["data"]))
                return out_path
        raise GeminiError(f"no image in response: {str(data)[:500]}")

    raise GeminiError(f"exhausted retries: {last_err}")
