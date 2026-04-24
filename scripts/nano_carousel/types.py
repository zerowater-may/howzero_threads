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
    """Input contract: what a single slide should say.

    ``overrides`` lets a caller bypass auto-detected coordinates and
    specify exact placement for specific roles. Partial overrides merge
    with detected values. Supported keys per role: x, y, w, h, size.
    """
    idx: int
    layout: LayoutType
    mascot_pose: MascotPose
    headline: str
    body_lines: list[str]
    checkpoint_lines: list[str]
    whisper: str
    overrides: dict | None = None


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
