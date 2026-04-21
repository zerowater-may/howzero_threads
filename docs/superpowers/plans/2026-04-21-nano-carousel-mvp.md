# Nano Banana 카드뉴스 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 집사자 브랜드 카드뉴스 슬라이드 1장을 end-to-end 파이프라인으로 생성한다. Nano Banana가 내용에 맞춘 빈 레이아웃 이미지를 그리고, Python이 마스코트 위치 마커를 자동 검출하고, HTML이 기존 마스코트 PNG와 텍스트를 overlay해서 Puppeteer로 최종 PNG를 찍는다.

**Architecture:** Python CLI (`scripts/nano_carousel/`)가 `SlideSpec` JSON을 받아서 5단계 파이프라인을 실행한다: (1) 프롬프트 조립 → (2) Nano Banana API로 빈 템플릿 이미지 생성 → (3) 녹색 마스코트 마커 bbox 검출 → (4) HTML 파일에 이미지 + 마스코트 overlay + 텍스트 absolute position으로 렌더 → (5) 기존 `capture.mjs` 재사용해서 PNG 캡처.

**Tech Stack:** Python 3.10+, `requests` (Gemini REST API 직접 호출), `Pillow` (이미지 로드), `numpy` (색상 마스크 기반 마커 검출), Jinja2 불필요 (f-string으로 충분), Node + Puppeteer (기존 재사용). 테스트는 pytest + 픽셀 픽스처 PNG.

**MVP Scope (V2에서 확장):**
- ✅ 1장 end-to-end (매물카드 타입 1장)
- ✅ 녹색 마스코트 마커만 자동 검출 (다른 박스는 타입별 고정 좌표)
- ✅ 기존 `brands/zipsaja-assets/` PNG overlay
- ✅ API 호출 1회 재시도
- ❌ Validator (텍스트 혼입 자동 체크) — V2
- ❌ 다수 슬라이드 일괄 처리 — V2
- ❌ 다양한 슬라이드 타입 — V2 (MVP는 `apartment-card` 1개 타입)

---

## File Structure

```
scripts/nano_carousel/
  __init__.py           # 패키지 마커
  types.py              # SlideSpec, MarkerBBox, RenderResult (frozen dataclass)
  prompt_builder.py     # SlideSpec → Nano Banana 프롬프트 문자열
  gemini_client.py      # Nano Banana API REST 호출 + PNG 저장
  marker_detector.py    # 녹색 원 마커 검출 → bbox 반환
  html_renderer.py      # 이미지 + 마스코트 + 텍스트를 HTML로 조립
  layout_presets.py     # 슬라이드 타입별 고정 좌표 프리셋 (MVP: apartment-card만)
  __main__.py           # CLI: python -m scripts.nano_carousel --spec <path>

tests/nano_carousel/
  __init__.py
  fixtures/
    marker_green_center.png    # 중앙에 녹색 원 하나 있는 1080x1440
    marker_no_green.png        # 녹색 없음 (검출 실패 확인용)
  test_types.py
  test_prompt_builder.py
  test_marker_detector.py
  test_html_renderer.py

docs/content/carousel-nanob-mvp/
  spec.json             # 입력 spec
  template.png          # Nano Banana가 생성한 빈 레이아웃
  markers.json          # 검출된 마스코트 bbox
  slides.html           # 최종 렌더 HTML
  capture.mjs           # 기존 재사용
  slide-1.png           # 최종 결과
```

---

## Task 1: Project scaffolding + dependencies

**Files:**
- Create: `scripts/nano_carousel/__init__.py`
- Create: `tests/nano_carousel/__init__.py`
- Create: `tests/nano_carousel/fixtures/.gitkeep`
- Modify: `pyproject.toml` (optional-dependencies에 `nano-carousel` 섹션 추가)

- [ ] **Step 1: Create package directories**

```bash
mkdir -p scripts/nano_carousel tests/nano_carousel/fixtures
touch scripts/nano_carousel/__init__.py
touch tests/nano_carousel/__init__.py
touch tests/nano_carousel/fixtures/.gitkeep
```

- [ ] **Step 2: Write package docstring**

```python
# scripts/nano_carousel/__init__.py
"""Nano Banana-powered carousel MVP pipeline.

Generates a single branded carousel slide by combining:
- Nano Banana (Gemini 2.5 Flash Image) for blank template generation
- Pillow + numpy for green marker detection
- HTML + Puppeteer for mascot and text overlay
"""
```

- [ ] **Step 3: Add optional dependencies to pyproject.toml**

Edit the `[project.optional-dependencies]` section, add this block after the existing `yt = [...]`:

```toml
nano = [
    "Pillow>=10.0.0",
    "numpy>=1.24.0",
]
```

- [ ] **Step 4: Install deps**

Run: `pip install -e ".[nano]"`
Expected: packages installed without error.

- [ ] **Step 5: Verify import**

Run: `python -c "import scripts.nano_carousel; print(scripts.nano_carousel.__doc__.splitlines()[0])"`
Expected output: `Nano Banana-powered carousel MVP pipeline.`

- [ ] **Step 6: Commit**

```bash
git add scripts/nano_carousel/__init__.py tests/nano_carousel/__init__.py tests/nano_carousel/fixtures/.gitkeep pyproject.toml
git commit -m "nano-carousel: scaffold package with Pillow/numpy deps"
```

---

## Task 2: Data types

**Files:**
- Create: `scripts/nano_carousel/types.py`
- Create: `tests/nano_carousel/test_types.py`

- [ ] **Step 1: Write failing test**

```python
# tests/nano_carousel/test_types.py
"""Contract tests for nano_carousel dataclasses."""

import pytest
from scripts.nano_carousel.types import SlideSpec, MarkerBBox, TextBlock


def test_slide_spec_construction():
    spec = SlideSpec(
        idx=1,
        layout="apartment-card",
        mascot_pose="shining",
        headline="가양2단지성지 34A",
        body_lines=["5년 +136%", "현재 호가 7.16억"],
        checkpoint_lines=["9호선 급행역", "마곡지구 접근성"],
        whisper="5년 시세 다 뽑아봤다구~",
    )
    assert spec.idx == 1
    assert spec.layout == "apartment-card"
    assert spec.mascot_pose == "shining"


def test_slide_spec_frozen():
    spec = SlideSpec(
        idx=1, layout="apartment-card", mascot_pose="default",
        headline="t", body_lines=[], checkpoint_lines=[], whisper="",
    )
    with pytest.raises(AttributeError):
        spec.idx = 2  # frozen


def test_marker_bbox_construction():
    bbox = MarkerBBox(x=100, y=200, w=160, h=160, cx=180, cy=280)
    assert bbox.cx == 180
    assert bbox.cy == 280


def test_text_block_construction():
    tb = TextBlock(role="headline", content="abc", x=80, y=100, w=800, h=120,
                   font="jua", size=72)
    assert tb.role == "headline"
    assert tb.size == 72
```

- [ ] **Step 2: Run test and verify fail**

Run: `pytest tests/nano_carousel/test_types.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'scripts.nano_carousel.types'`

- [ ] **Step 3: Implement types.py**

```python
# scripts/nano_carousel/types.py
"""Frozen dataclasses for nano_carousel pipeline."""

from dataclasses import dataclass, field
from typing import Literal


LayoutType = Literal["apartment-card", "cover", "list-5", "cta-dark"]

MascotPose = Literal[
    "hero", "default", "smile", "happy", "shining",
    "surprise", "worried", "angry", "blank", "side",
]


@dataclass(frozen=True)
class SlideSpec:
    """Input contract: what a single slide should say."""
    idx: int
    layout: LayoutType
    mascot_pose: MascotPose
    headline: str
    body_lines: list[str]
    checkpoint_lines: list[str]
    whisper: str


@dataclass(frozen=True)
class MarkerBBox:
    """Detected bounding box of a color marker in a generated template."""
    x: int
    y: int
    w: int
    h: int
    cx: int  # center x
    cy: int  # center y


@dataclass(frozen=True)
class TextBlock:
    """Text overlay instruction for HTML renderer."""
    role: str
    content: str
    x: int
    y: int
    w: int
    h: int
    font: str  # "jua" | "gaegu" | "noto"
    size: int
```

- [ ] **Step 4: Run test to verify pass**

Run: `pytest tests/nano_carousel/test_types.py -v`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add scripts/nano_carousel/types.py tests/nano_carousel/test_types.py
git commit -m "nano-carousel: add frozen dataclasses (SlideSpec, MarkerBBox, TextBlock)"
```

---

## Task 3: Prompt builder

**Files:**
- Create: `scripts/nano_carousel/prompt_builder.py`
- Create: `tests/nano_carousel/test_prompt_builder.py`

- [ ] **Step 1: Write failing tests**

```python
# tests/nano_carousel/test_prompt_builder.py
"""Tests for prompt assembly."""

from scripts.nano_carousel.prompt_builder import build_prompt
from scripts.nano_carousel.types import SlideSpec


def _spec(layout="apartment-card"):
    return SlideSpec(
        idx=1, layout=layout, mascot_pose="shining",
        headline="가양2단지성지 34A",
        body_lines=["5년 +136%", "현재 호가 7.16억"],
        checkpoint_lines=["9호선", "마곡지구"],
        whisper="시세 뽑아봤다구~",
    )


def test_prompt_contains_brand_identity():
    prompt = build_prompt(_spec())
    # Zipsaja brand identity must be baked in
    assert "hand-drawn" in prompt.lower()
    assert "lion" in prompt.lower() or "mascot" in prompt.lower()
    assert "#FACC15" in prompt or "mustard" in prompt.lower()


def test_prompt_forbids_text():
    prompt = build_prompt(_spec())
    # Critical: no text must appear in generated image
    lower = prompt.lower()
    assert "no text" in lower or "blank" in lower or "empty" in lower
    assert "letters" in lower or "typography" in lower or "characters" in lower


def test_prompt_requests_green_mascot_marker():
    prompt = build_prompt(_spec())
    # Must instruct the model to place a green circle marker for mascot slot
    lower = prompt.lower()
    assert "green" in lower and ("circle" in lower or "marker" in lower)


def test_prompt_apartment_card_specifics():
    prompt = build_prompt(_spec(layout="apartment-card"))
    lower = prompt.lower()
    # Apartment card layout hints
    assert "headline" in lower or "title" in lower
    assert "box" in lower or "panel" in lower


def test_prompt_does_not_leak_headline_content():
    """Prompt must not leak the Korean headline into Nano Banana,
    because that would cause the model to render Korean text inside the image."""
    spec = _spec()
    prompt = build_prompt(spec)
    assert spec.headline not in prompt
    assert "가양" not in prompt  # No Korean content words
```

- [ ] **Step 2: Run tests to verify fail**

Run: `pytest tests/nano_carousel/test_prompt_builder.py -v`
Expected: ModuleNotFoundError.

- [ ] **Step 3: Implement prompt_builder.py**

```python
# scripts/nano_carousel/prompt_builder.py
"""Assemble Nano Banana prompts for Zipsaja-branded blank slide templates.

Key principle: NEVER include user content (headline text, body) in the
prompt — that tempts the model to render Korean text in the image.
We only describe the LAYOUT STRUCTURE and brand style.
"""

from scripts.nano_carousel.types import SlideSpec


_BRAND_BASE = """A square Instagram carousel slide template, 1080x1440 pixels,
hand-drawn doodle illustration in the style of a Korean influencer's
iPad Procreate notebook. White background (#FFFFFF).

Color palette: only black outlines (#1a1a1a) and mustard yellow accent (#FACC15).
No gradients, no shading, solid flat colors only.

Line quality: hand-drawn, slightly wobbly, imperfect. Not math-perfect,
not vector-clean. Slightly asymmetric — amateur notebook doodle quality,
NOT a polished Canva sticker, NOT a kawaii mascot logo."""


_NEGATIVE = """CRITICAL RULES — violate these and the image is unusable:
- ABSOLUTELY NO text, letters, words, numbers, typography, fonts,
  Korean characters, English characters, or gibberish anywhere
- All yellow highlight patches, speech bubbles, and rectangular info boxes
  must be 100% completely empty and blank inside
- No watermark, no signature, no logo
- No 3D render, no glossy, no gradients
- No photorealistic elements"""


_MASCOT_MARKER = """Mascot placement: draw a single solid bright green circle
(#00FF00, approximately 200 pixels diameter) at the designated mascot slot
location. This circle is a placeholder marker — do NOT draw a lion, animal,
character, or any figure. Just a plain green circle."""


def _layout_instructions(layout: str) -> str:
    if layout == "apartment-card":
        return """LAYOUT: Apartment listing card.
- Top (y 80-220): wide mustard yellow marker highlight patch,
  wobbly hand-drawn brush stroke shape, empty interior.
- Upper-middle (y 260-640): one large rectangular info box with a
  thick wobbly black border, empty interior, occupying most of the width.
- Lower-middle (y 680-950): two side-by-side smaller info boxes.
  Left box: white background with black wobbly border.
  Right box: mustard yellow fill with black wobbly border.
- Bottom-left corner (x 80-280, y 1160-1360): a single solid bright
  green circle (#00FF00) for the mascot placeholder marker.
- Bottom-right area (x 300-1000, y 1160-1340): empty space,
  reserved for handwritten whisper text overlay (keep background white)."""

    if layout == "cover":
        return """LAYOUT: Cover slide.
- Top half (y 100-700): three stacked wobbly mustard yellow marker
  highlights, centered horizontally, empty interior.
- Bottom half: one large solid bright green circle (#00FF00) centered
  for the mascot placeholder marker, flanked by empty wobbly
  speech bubble shape on one side."""

    if layout == "cta-dark":
        return """LAYOUT: Dark CTA slide with inverted colors.
- Background: solid dark charcoal (#1a1a1a).
- Top-center: a large mustard yellow marker highlight, empty interior.
- Middle-center: solid bright green circle (#00FF00) for mascot marker.
- Bottom: one empty rectangular box with mustard yellow fill
  and black wobbly border."""

    return "LAYOUT: Generic — top yellow highlight, middle empty box, bottom green mascot circle."


def build_prompt(spec: SlideSpec) -> str:
    """Assemble the full Nano Banana prompt for a given slide spec.

    Deliberately excludes all user content (headline, body, whisper) —
    those are overlaid later via HTML. Nano Banana only gets structural
    instructions to prevent Korean text leakage into the image.
    """
    return "\n\n".join([
        _BRAND_BASE,
        _layout_instructions(spec.layout),
        _MASCOT_MARKER,
        _NEGATIVE,
    ])
```

- [ ] **Step 4: Run tests to verify pass**

Run: `pytest tests/nano_carousel/test_prompt_builder.py -v`
Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add scripts/nano_carousel/prompt_builder.py tests/nano_carousel/test_prompt_builder.py
git commit -m "nano-carousel: add prompt builder with layout-specific instructions"
```

---

## Task 4: Gemini API client

**Files:**
- Create: `scripts/nano_carousel/gemini_client.py`
- Create: `tests/nano_carousel/test_gemini_client.py`

- [ ] **Step 1: Write failing test (mocked HTTP)**

```python
# tests/nano_carousel/test_gemini_client.py
"""Tests for Nano Banana HTTP wrapper using requests mocking."""

import base64
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest

from scripts.nano_carousel.gemini_client import generate_image, GeminiError


# Fake 1x1 red PNG
_FAKE_PNG_B64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5"
    "+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
)


def _fake_response(status=200, parts=None):
    m = MagicMock()
    m.status_code = status
    m.json.return_value = {
        "candidates": [{"content": {"parts": parts or []}}]
    }
    m.text = ""
    return m


def test_generate_image_saves_png(tmp_path):
    out = tmp_path / "out.png"
    with patch("scripts.nano_carousel.gemini_client.requests.post") as mock_post:
        mock_post.return_value = _fake_response(200, parts=[
            {"inlineData": {"mimeType": "image/png", "data": _FAKE_PNG_B64}},
        ])
        result = generate_image(
            prompt="test prompt",
            api_key="fake-key",
            out_path=out,
            model="gemini-2.5-flash-image",
        )
    assert result == out
    assert out.exists()
    assert out.read_bytes()[:8] == b"\x89PNG\r\n\x1a\n"  # PNG signature


def test_generate_image_retries_on_rate_limit(tmp_path):
    out = tmp_path / "out.png"
    calls = []
    def side_effect(*args, **kwargs):
        calls.append(1)
        if len(calls) == 1:
            return _fake_response(429, parts=[])
        return _fake_response(200, parts=[
            {"inlineData": {"mimeType": "image/png", "data": _FAKE_PNG_B64}},
        ])
    with patch("scripts.nano_carousel.gemini_client.requests.post",
               side_effect=side_effect):
        with patch("scripts.nano_carousel.gemini_client.time.sleep"):
            result = generate_image(
                prompt="p", api_key="k", out_path=out,
                model="m", max_retries=2,
            )
    assert result == out
    assert len(calls) == 2


def test_generate_image_raises_after_max_retries(tmp_path):
    out = tmp_path / "out.png"
    with patch("scripts.nano_carousel.gemini_client.requests.post") as mock_post:
        mock_post.return_value = _fake_response(500, parts=[])
        with patch("scripts.nano_carousel.gemini_client.time.sleep"):
            with pytest.raises(GeminiError):
                generate_image(
                    prompt="p", api_key="k", out_path=out,
                    model="m", max_retries=2,
                )


def test_generate_image_raises_when_no_image_in_response(tmp_path):
    out = tmp_path / "out.png"
    with patch("scripts.nano_carousel.gemini_client.requests.post") as mock_post:
        # text-only response, no inlineData
        mock_post.return_value = _fake_response(200, parts=[{"text": "sorry"}])
        with pytest.raises(GeminiError, match="no image"):
            generate_image(
                prompt="p", api_key="k", out_path=out, model="m",
            )
```

- [ ] **Step 2: Run tests to verify fail**

Run: `pytest tests/nano_carousel/test_gemini_client.py -v`
Expected: ModuleNotFoundError.

- [ ] **Step 3: Implement gemini_client.py**

```python
# scripts/nano_carousel/gemini_client.py
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
```

- [ ] **Step 4: Run tests to verify pass**

Run: `pytest tests/nano_carousel/test_gemini_client.py -v`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add scripts/nano_carousel/gemini_client.py tests/nano_carousel/test_gemini_client.py
git commit -m "nano-carousel: add Gemini REST client with retry/backoff"
```

---

## Task 5: Marker detector

**Files:**
- Create: `scripts/nano_carousel/marker_detector.py`
- Create: `tests/nano_carousel/test_marker_detector.py`
- Create: `tests/nano_carousel/fixtures/marker_green_center.png`
- Create: `tests/nano_carousel/fixtures/marker_no_green.png`

- [ ] **Step 1: Generate fixture images**

Run this Python snippet once to generate test fixtures (this is a one-off; do not commit it as a script):

```python
from PIL import Image, ImageDraw
# Fixture 1: 1080x1440, white background, green circle at (180, 1280) radius 80
im = Image.new("RGB", (1080, 1440), (255, 255, 255))
d = ImageDraw.Draw(im)
d.ellipse([100, 1200, 260, 1360], fill=(0, 255, 0))
im.save("tests/nano_carousel/fixtures/marker_green_center.png")

# Fixture 2: no green
im2 = Image.new("RGB", (1080, 1440), (255, 255, 255))
d2 = ImageDraw.Draw(im2)
d2.ellipse([100, 1200, 260, 1360], fill=(255, 200, 50))  # yellow, not green
im2.save("tests/nano_carousel/fixtures/marker_no_green.png")
```

- [ ] **Step 2: Write failing tests**

```python
# tests/nano_carousel/test_marker_detector.py
"""Tests for green marker bbox detection."""

from pathlib import Path

import pytest

from scripts.nano_carousel.marker_detector import detect_green_marker
from scripts.nano_carousel.types import MarkerBBox


FIXTURES = Path(__file__).parent / "fixtures"


def test_detects_green_circle():
    bbox = detect_green_marker(FIXTURES / "marker_green_center.png")
    assert isinstance(bbox, MarkerBBox)
    # Circle drawn at ellipse [100, 1200, 260, 1360] → center (180, 1280)
    assert 170 <= bbox.cx <= 190
    assert 1270 <= bbox.cy <= 1290
    # Width/height ~160
    assert 150 <= bbox.w <= 170
    assert 150 <= bbox.h <= 170


def test_returns_none_when_no_green():
    bbox = detect_green_marker(FIXTURES / "marker_no_green.png")
    assert bbox is None


def test_raises_on_missing_file(tmp_path):
    with pytest.raises(FileNotFoundError):
        detect_green_marker(tmp_path / "does_not_exist.png")
```

- [ ] **Step 3: Run tests to verify fail**

Run: `pytest tests/nano_carousel/test_marker_detector.py -v`
Expected: fixtures missing or ModuleNotFoundError. Generate fixtures first (Step 1).

- [ ] **Step 4: Implement marker_detector.py**

```python
# scripts/nano_carousel/marker_detector.py
"""Detect solid green circle markers in Nano Banana generated templates."""

from pathlib import Path

import numpy as np
from PIL import Image

from scripts.nano_carousel.types import MarkerBBox


# Green channel must dominate, red and blue must be low
_GREEN_MIN = 180  # G channel lower bound
_RED_MAX = 100    # R channel upper bound
_BLUE_MAX = 100   # B channel upper bound
_MIN_PIXELS = 500  # noise floor


def detect_green_marker(image_path: Path) -> MarkerBBox | None:
    """Find the largest green blob and return its bounding box.

    Returns ``None`` if no qualifying green region is found.
    Raises ``FileNotFoundError`` if the image does not exist.
    """
    image_path = Path(image_path)
    if not image_path.exists():
        raise FileNotFoundError(image_path)

    im = Image.open(image_path).convert("RGB")
    arr = np.array(im)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    mask = (g >= _GREEN_MIN) & (r <= _RED_MAX) & (b <= _BLUE_MAX)

    if mask.sum() < _MIN_PIXELS:
        return None

    ys, xs = np.where(mask)
    x0, x1 = int(xs.min()), int(xs.max())
    y0, y1 = int(ys.min()), int(ys.max())
    w, h = x1 - x0, y1 - y0
    return MarkerBBox(
        x=x0, y=y0, w=w, h=h,
        cx=x0 + w // 2,
        cy=y0 + h // 2,
    )
```

- [ ] **Step 5: Run tests to verify pass**

Run: `pytest tests/nano_carousel/test_marker_detector.py -v`
Expected: 3 passed.

- [ ] **Step 6: Commit**

```bash
git add scripts/nano_carousel/marker_detector.py tests/nano_carousel/test_marker_detector.py tests/nano_carousel/fixtures/
git commit -m "nano-carousel: detect green mascot marker via numpy color mask"
```

---

## Task 6: Layout presets (hardcoded text coordinates per slide type)

**Files:**
- Create: `scripts/nano_carousel/layout_presets.py`

- [ ] **Step 1: Implement layout_presets.py**

No test for this file — it's pure data. It will be exercised by the HTML renderer tests.

```python
# scripts/nano_carousel/layout_presets.py
"""Fixed text-overlay coordinates per slide layout type.

These are measured from the Nano Banana prompt's layout spec — as long as
the prompt asks for consistent regions, the text overlay coordinates stay
stable. If Nano Banana drifts, re-tune these values.
"""

from scripts.nano_carousel.types import TextBlock


def apartment_card_text_blocks(
    headline: str,
    body_lines: list[str],
    checkpoint_lines: list[str],
    whisper: str,
) -> list[TextBlock]:
    """Return text blocks for apartment-card layout.

    Coordinates match the prompt regions:
    - headline: yellow highlight strip (y 80-220)
    - body box: large rectangle (y 260-640)
    - checkpoint: right yellow box (y 680-950)
    - whisper: lower right area (y 1160-1340)
    """
    body_text = "\n".join(body_lines)
    check_text = "\n".join(f"· {line}" for line in checkpoint_lines)
    return [
        TextBlock(
            role="headline", content=headline,
            x=110, y=95, w=860, h=120,
            font="jua", size=72,
        ),
        TextBlock(
            role="body", content=body_text,
            x=130, y=290, w=820, h=320,
            font="noto", size=36,
        ),
        TextBlock(
            role="checkpoint", content=check_text,
            x=580, y=710, w=400, h=220,
            font="noto", size=26,
        ),
        TextBlock(
            role="whisper", content=whisper,
            x=340, y=1190, w=660, h=140,
            font="gaegu", size=40,
        ),
    ]
```

- [ ] **Step 2: Smoke check**

Run: `python -c "from scripts.nano_carousel.layout_presets import apartment_card_text_blocks; print(len(apartment_card_text_blocks('h', ['a'], ['b'], 'w')))"`
Expected: `4`

- [ ] **Step 3: Commit**

```bash
git add scripts/nano_carousel/layout_presets.py
git commit -m "nano-carousel: add apartment-card layout preset coordinates"
```

---

## Task 7: HTML renderer

**Files:**
- Create: `scripts/nano_carousel/html_renderer.py`
- Create: `tests/nano_carousel/test_html_renderer.py`

- [ ] **Step 1: Write failing tests**

```python
# tests/nano_carousel/test_html_renderer.py
"""Tests for slides.html assembly."""

from pathlib import Path

from scripts.nano_carousel.html_renderer import render_slide_html
from scripts.nano_carousel.types import MarkerBBox, SlideSpec


def _spec():
    return SlideSpec(
        idx=1, layout="apartment-card", mascot_pose="shining",
        headline="가양2단지성지 34A",
        body_lines=["5년 +136%", "현재 호가 7.16억"],
        checkpoint_lines=["9호선 급행역", "마곡지구"],
        whisper="시세 뽑아봤다구~",
    )


def test_html_contains_template_image():
    html = render_slide_html(
        spec=_spec(),
        template_image_path=Path("template.png"),
        mascot_bbox=MarkerBBox(x=100, y=1200, w=160, h=160, cx=180, cy=1280),
        mascot_asset_path=Path("mascot-shining.png"),
    )
    assert "template.png" in html
    assert "mascot-shining.png" in html


def test_html_contains_all_text_blocks():
    html = render_slide_html(
        spec=_spec(),
        template_image_path=Path("template.png"),
        mascot_bbox=MarkerBBox(x=100, y=1200, w=160, h=160, cx=180, cy=1280),
        mascot_asset_path=Path("mascot.png"),
    )
    assert "가양2단지성지 34A" in html
    assert "5년 +136%" in html
    assert "9호선 급행역" in html
    assert "시세 뽑아봤다구~" in html


def test_html_positions_mascot_at_bbox():
    html = render_slide_html(
        spec=_spec(),
        template_image_path=Path("template.png"),
        mascot_bbox=MarkerBBox(x=100, y=1200, w=160, h=160, cx=180, cy=1280),
        mascot_asset_path=Path("mascot.png"),
    )
    # Mascot must be positioned near the bbox (x=100, y=1200, width 160)
    assert "left: 100px" in html or "left:100px" in html
    assert "top: 1200px" in html or "top:1200px" in html


def test_html_has_slide_id():
    html = render_slide_html(
        spec=_spec(),
        template_image_path=Path("t.png"),
        mascot_bbox=MarkerBBox(x=0, y=0, w=1, h=1, cx=0, cy=0),
        mascot_asset_path=Path("m.png"),
    )
    assert 'id="slide-1"' in html


def test_html_includes_fonts():
    html = render_slide_html(
        spec=_spec(),
        template_image_path=Path("t.png"),
        mascot_bbox=MarkerBBox(x=0, y=0, w=1, h=1, cx=0, cy=0),
        mascot_asset_path=Path("m.png"),
    )
    assert "Jua" in html
    assert "Gaegu" in html
    assert "Noto+Sans+KR" in html or "Noto Sans KR" in html
```

- [ ] **Step 2: Run tests to verify fail**

Run: `pytest tests/nano_carousel/test_html_renderer.py -v`
Expected: ModuleNotFoundError.

- [ ] **Step 3: Implement html_renderer.py**

```python
# scripts/nano_carousel/html_renderer.py
"""Assemble the final slides.html with image + mascot + text overlay."""

from pathlib import Path

from scripts.nano_carousel.layout_presets import apartment_card_text_blocks
from scripts.nano_carousel.types import MarkerBBox, SlideSpec, TextBlock


_FONT_MAP = {
    "jua": "'Jua', sans-serif",
    "gaegu": "'Gaegu', cursive",
    "noto": "'Noto Sans KR', sans-serif",
}

_FONT_WEIGHT = {"jua": "400", "gaegu": "700", "noto": "700"}


def _text_blocks_for(spec: SlideSpec) -> list[TextBlock]:
    if spec.layout == "apartment-card":
        return apartment_card_text_blocks(
            spec.headline, spec.body_lines, spec.checkpoint_lines, spec.whisper,
        )
    raise ValueError(f"layout not supported in MVP: {spec.layout}")


def _block_css(block: TextBlock) -> str:
    family = _FONT_MAP.get(block.font, _FONT_MAP["noto"])
    weight = _FONT_WEIGHT.get(block.font, "700")
    return (
        f"position:absolute; left:{block.x}px; top:{block.y}px; "
        f"width:{block.w}px; height:{block.h}px; "
        f"font-family:{family}; font-weight:{weight}; "
        f"font-size:{block.size}px; line-height:1.3; color:#1a1a1a; "
        f"white-space:pre-line;"
    )


def render_slide_html(
    *,
    spec: SlideSpec,
    template_image_path: Path,
    mascot_bbox: MarkerBBox,
    mascot_asset_path: Path,
) -> str:
    """Return a complete HTML document containing one slide."""
    blocks = _text_blocks_for(spec)
    text_html = "\n".join(
        f'<div style="{_block_css(b)}">{b.content}</div>' for b in blocks
    )
    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Jua&family=Gaegu:wght@700&family=Noto+Sans+KR:wght@700&display=swap" rel="stylesheet">
<style>
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{ background:#ddd; }}
.slide {{ width:1080px; height:1440px; position:relative; overflow:hidden;
  background:url('{template_image_path.name}') no-repeat top left / 1080px 1440px; }}
.mascot {{ position:absolute; left:{mascot_bbox.x}px; top:{mascot_bbox.y}px;
  width:{mascot_bbox.w}px; height:{mascot_bbox.h}px; object-fit:contain; }}
</style>
</head>
<body>
<div class="slide" id="slide-{spec.idx}">
  <img class="mascot" src="{mascot_asset_path.name}" alt="mascot">
  {text_html}
</div>
</body>
</html>
"""
```

- [ ] **Step 4: Run tests to verify pass**

Run: `pytest tests/nano_carousel/test_html_renderer.py -v`
Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add scripts/nano_carousel/html_renderer.py tests/nano_carousel/test_html_renderer.py
git commit -m "nano-carousel: render slide HTML with text overlay and mascot positioning"
```

---

## Task 8: CLI entrypoint (end-to-end integration)

**Files:**
- Create: `scripts/nano_carousel/__main__.py`
- Create: `docs/content/carousel-nanob-mvp/spec.json` (example input)

- [ ] **Step 1: Write example spec.json**

```json
{
  "idx": 1,
  "layout": "apartment-card",
  "mascot_pose": "shining",
  "headline": "가양2단지성지 34A",
  "body_lines": ["5년 +136%", "현재 호가 7.16억"],
  "checkpoint_lines": ["9호선 급행역 근처", "마곡지구 접근성", "1624세대 대단지"],
  "whisper": "5년 시세 다 뽑아봤다구~"
}
```

- [ ] **Step 2: Implement __main__.py**

```python
# scripts/nano_carousel/__main__.py
"""CLI for nano_carousel MVP.

Usage:
    python -m scripts.nano_carousel --spec spec.json --out output-dir/

Requires GEMINI_API_KEY in env (load via .env.gemini).
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

from scripts.nano_carousel.gemini_client import generate_image, GeminiError
from scripts.nano_carousel.html_renderer import render_slide_html
from scripts.nano_carousel.marker_detector import detect_green_marker
from scripts.nano_carousel.prompt_builder import build_prompt
from scripts.nano_carousel.types import SlideSpec


_BRAND_ASSETS_DIR = Path(
    ".claude/skills/carousel/brands/zipsaja-assets"
).resolve()


def _load_spec(path: Path) -> SlideSpec:
    raw = json.loads(path.read_text(encoding="utf-8"))
    return SlideSpec(**raw)


def _resolve_api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY")
    if key:
        return key
    env_file = Path(".env.gemini")
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            if line.startswith("GEMINI_API_KEY="):
                return line.split("=", 1)[1].strip()
    raise SystemExit("GEMINI_API_KEY not found (env or .env.gemini)")


def _copy_mascot(pose: str, out_dir: Path) -> Path:
    src = _BRAND_ASSETS_DIR / f"mascot-{pose}.png"
    if not src.exists():
        raise SystemExit(f"mascot asset not found: {src}")
    dst = out_dir / src.name
    shutil.copy(src, dst)
    return dst


def _write_capture_mjs(out_dir: Path) -> Path:
    mjs = out_dir / "capture.mjs"
    mjs.write_text("""import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1440, deviceScaleFactor: 2 });
await page.goto(`file://${resolve(__dirname, 'slides.html')}`, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));
const n = await page.$$eval('[id^="slide-"]', els => els.length);
for (let i = 1; i <= n; i++) {
  const el = await page.$(`#slide-${i}`);
  await el.screenshot({ path: resolve(__dirname, `slide-${i}.png`), type: 'png' });
  console.log(`slide-${i}.png`);
}
await browser.close();
""")
    return mjs


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="nano_carousel")
    p.add_argument("--spec", required=True, type=Path)
    p.add_argument("--out", required=True, type=Path)
    p.add_argument(
        "--model", default="gemini-2.5-flash-image",
        help="Gemini image model id",
    )
    p.add_argument("--skip-capture", action="store_true",
                   help="render HTML only, skip Puppeteer")
    args = p.parse_args(argv)

    spec = _load_spec(args.spec)
    args.out.mkdir(parents=True, exist_ok=True)

    # Stage 1: build prompt
    prompt = build_prompt(spec)
    (args.out / "prompt.txt").write_text(prompt, encoding="utf-8")
    print(f"[1/5] prompt built ({len(prompt)} chars)")

    # Stage 2: generate template image
    template_path = args.out / "template.png"
    try:
        generate_image(
            prompt=prompt, api_key=_resolve_api_key(),
            out_path=template_path, model=args.model,
        )
    except GeminiError as e:
        print(f"[FAIL] image generation: {e}")
        return 1
    print(f"[2/5] template generated: {template_path}")

    # Stage 3: detect green marker
    bbox = detect_green_marker(template_path)
    if bbox is None:
        print("[WARN] no green marker detected — using default position")
        bbox = _default_mascot_bbox_for(spec.layout)
    (args.out / "markers.json").write_text(
        json.dumps({"mascot": bbox.__dict__}, indent=2),
        encoding="utf-8",
    )
    print(f"[3/5] mascot bbox: x={bbox.x} y={bbox.y} w={bbox.w} h={bbox.h}")

    # Stage 4: copy mascot asset + render HTML
    mascot_path = _copy_mascot(spec.mascot_pose, args.out)
    html = render_slide_html(
        spec=spec,
        template_image_path=template_path,
        mascot_bbox=bbox,
        mascot_asset_path=mascot_path,
    )
    html_path = args.out / "slides.html"
    html_path.write_text(html, encoding="utf-8")
    print(f"[4/5] html rendered: {html_path}")

    # Stage 5: Puppeteer capture
    if args.skip_capture:
        print("[5/5] capture skipped")
        return 0

    _write_capture_mjs(args.out)
    npm_ok = (args.out / "node_modules" / "puppeteer").exists()
    if not npm_ok:
        print("[5/5] puppeteer not installed in out dir. "
              "Run once:  cd <out> && npm init -y && npm install puppeteer")
        return 0
    subprocess.run(["node", "capture.mjs"], cwd=args.out, check=True)
    print(f"[5/5] PNG captured → {args.out}/slide-1.png")
    return 0


from scripts.nano_carousel.types import MarkerBBox


def _default_mascot_bbox_for(layout: str) -> MarkerBBox:
    if layout == "apartment-card":
        return MarkerBBox(x=100, y=1200, w=180, h=180, cx=190, cy=1290)
    return MarkerBBox(x=420, y=620, w=240, h=240, cx=540, cy=740)


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 3: Dry run without API call**

Run: `python -m scripts.nano_carousel --spec docs/content/carousel-nanob-mvp/spec.json --out /tmp/nanob-dry --skip-capture`

If GEMINI_API_KEY is not set, this will fail at stage 2 with "GEMINI_API_KEY not found". That's the expected smoke test for Step 1-1 (prompt file written).

Check: `cat /tmp/nanob-dry/prompt.txt | head -5`
Expected: first 5 lines of the Zipsaja brand prompt.

- [ ] **Step 4: Commit**

```bash
git add scripts/nano_carousel/__main__.py docs/content/carousel-nanob-mvp/spec.json
git commit -m "nano-carousel: add CLI entrypoint and example spec"
```

---

## Task 9: End-to-end MVP run (manual verification)

This task is manual — it calls the paid API, so no automated test. It validates the whole pipeline on real data.

**Files:**
- Modify: `docs/content/carousel-nanob-mvp/` (populated by the run)

- [ ] **Step 1: Ensure API key is available**

```bash
test -f .env.gemini && echo ".env.gemini OK" || echo "MISSING"
```

If missing, populate it with `GEMINI_API_KEY=<key>`.

- [ ] **Step 2: Install Puppeteer in output folder**

```bash
mkdir -p docs/content/carousel-nanob-mvp
cd docs/content/carousel-nanob-mvp && ln -sfn ../carousel-gayang-template-overlay/node_modules node_modules
```

- [ ] **Step 3: Run end-to-end pipeline**

```bash
set -a; source .env.gemini; set +a
python -m scripts.nano_carousel \
  --spec docs/content/carousel-nanob-mvp/spec.json \
  --out docs/content/carousel-nanob-mvp
```

Expected stages printed:
```
[1/5] prompt built (~1200 chars)
[2/5] template generated: docs/content/carousel-nanob-mvp/template.png
[3/5] mascot bbox: x=... y=... w=... h=...
[4/5] html rendered: docs/content/carousel-nanob-mvp/slides.html
[5/5] PNG captured → docs/content/carousel-nanob-mvp/slide-1.png
```

- [ ] **Step 4: Open the result**

```bash
open docs/content/carousel-nanob-mvp/slide-1.png
open docs/content/carousel-nanob-mvp/template.png
```

- [ ] **Step 5: Visual acceptance criteria**

Check the rendered `slide-1.png` against this list:

| Criterion | How to verify |
|-----------|---------------|
| Template has mustard yellow highlight at top | Look at `template.png` |
| Template has empty info box(es) (no Korean/English text inside) | Look at `template.png` |
| A green circle marker is visible in bottom-left area | Look at `template.png` (should be overwritten by mascot in final) |
| Headline "가양2단지성지 34A" is visible in Jua font inside yellow area | Look at `slide-1.png` |
| Body "5년 +136% / 현재 호가 7.16억" is visible | Look at `slide-1.png` |
| Checkpoint bullets visible in Noto Sans KR | Look at `slide-1.png` |
| Whisper "시세 뽑아봤다구~" in Gaegu font | Look at `slide-1.png` |
| Mascot shining pose visible on top of green circle position | Look at `slide-1.png` |

If any criterion fails, record what went wrong in a note and fix in the appropriate earlier task (prompt tuning → Task 3, coordinates → Task 6, etc.).

- [ ] **Step 6: Commit the result**

```bash
git add docs/content/carousel-nanob-mvp/spec.json
# Do NOT commit template.png, slide-1.png, node_modules (add to .gitignore if needed)
git commit -m "nano-carousel: MVP end-to-end verification with gayang sample"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Data input (JSON spec) → Task 2 (types) + Task 8 (CLI loads)
- ✅ Content-aware prompt assembly → Task 3
- ✅ Nano Banana API call → Task 4
- ✅ Green marker detection → Task 5
- ✅ Existing mascot asset overlay (no AI-generated character) → Task 7 (`mascot_asset_path`) + Task 8 (_copy_mascot)
- ✅ Text HTML overlay with fixed per-layout coordinates → Task 6 + Task 7
- ✅ Puppeteer capture (existing capture.mjs reused) → Task 8
- ✅ End-to-end verification → Task 9

**Placeholder scan:** No "TBD", no "implement later". Every code block is executable as-is.

**Type consistency:** `SlideSpec.mascot_pose` (Literal of asset names) matches `_copy_mascot`'s `mascot-{pose}.png` lookup. `MarkerBBox` fields (`cx`, `cy`) are populated by detector and read by renderer. `TextBlock` fields match renderer's CSS emission.

**MVP scope discipline:** Only `apartment-card` layout implemented. `cover` and `cta-dark` have prompt stubs but no layout preset — they are V2. Validator (text detection) is skipped — V2.

---

## Execution Handoff

**Plan saved to `docs/superpowers/plans/2026-04-21-nano-carousel-mvp.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Best for this plan because tasks 2–7 are independent pure-Python modules with clear contracts.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
