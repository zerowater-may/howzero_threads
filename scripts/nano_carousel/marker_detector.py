"""Detect text-overlay regions in Nano Banana generated templates.

V2 approach (replaces failed V1 green-circle markers): instead of asking
Nano Banana to draw color markers, we detect the empty black-outlined
boxes, yellow highlights, and speech bubbles that it actually draws
anyway. This is more robust because we are reading what the model
produced, not trying to force it to include tokens it doesn't want to.

Public API:
    detect_regions(image_path, layout) -> dict[str, MarkerBBox]

Each role name matches the ``TextBlock.role`` used in layout_presets.
"""

from pathlib import Path

import cv2
import numpy as np

from scripts.nano_carousel.types import MarkerBBox


# ===== V1 legacy (green circle) ==================================
# Kept for backward compatibility with any callers that still use it.

_GREEN_MIN = 180
_RED_MAX = 100
_BLUE_MAX = 100
_MIN_PIXELS = 500


def detect_green_marker(image_path: Path) -> MarkerBBox | None:
    """V1: find the largest green blob (legacy)."""
    image_path = Path(image_path)
    if not image_path.exists():
        raise FileNotFoundError(image_path)

    im = cv2.imread(str(image_path))
    if im is None:
        return None
    b, g, r = im[..., 0], im[..., 1], im[..., 2]
    mask = (g >= _GREEN_MIN) & (r <= _RED_MAX) & (b <= _BLUE_MAX)
    if mask.sum() < _MIN_PIXELS:
        return None
    ys, xs = np.where(mask)
    x0, x1 = int(xs.min()), int(xs.max())
    y0, y1 = int(ys.min()), int(ys.max())
    w, h = x1 - x0, y1 - y0
    return MarkerBBox(x0, y0, w, h, x0 + w // 2, y0 + h // 2)


# ===== V2 region detectors =======================================


def _to_bbox(x: int, y: int, w: int, h: int) -> MarkerBBox:
    return MarkerBBox(x=x, y=y, w=w, h=h, cx=x + w // 2, cy=y + h // 2)


def _detect_yellow_regions(
    im_bgr: np.ndarray, min_area: int = 20000
) -> list[MarkerBBox]:
    """Find mustard-yellow filled regions (ribbons, highlights, buttons).

    Uses HSV thresholding calibrated for Nano Banana's #FACC15-ish output.
    Returns contours sorted by area (largest first) with solid body boxes.
    """
    hsv = cv2.cvtColor(im_bgr, cv2.COLOR_BGR2HSV)
    # Mustard yellow band: H 20-40, S 100+, V 150+
    mask = cv2.inRange(hsv, (18, 80, 140), (42, 255, 255))
    # Clean noise
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))

    contours, _ = cv2.findContours(
        mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    boxes: list[MarkerBBox] = []
    for c in contours:
        area = cv2.contourArea(c)
        if area < min_area:
            continue
        x, y, w, h = cv2.boundingRect(c)
        boxes.append(_to_bbox(x, y, w, h))
    boxes.sort(key=lambda b: b.w * b.h, reverse=True)
    return boxes


def _detect_outlined_boxes(
    im_bgr: np.ndarray,
    min_w: int = 180,
    min_h: int = 100,
    max_w: int = 1000,
    max_h: int = 700,
) -> list[MarkerBBox]:
    """Find empty white regions enclosed by thick black outlines.

    Strategy:
    1. Binarize black lines (Nano Banana outlines are ~1a1a1a).
    2. Dilate to close gaps in the hand-drawn strokes.
    3. Invert → connected white regions = potential box interiors.
    4. Bounding-rect filter by plausible size.
    """
    gray = cv2.cvtColor(im_bgr, cv2.COLOR_BGR2GRAY)
    # Black pixels → white mask
    _, black_mask = cv2.threshold(gray, 80, 255, cv2.THRESH_BINARY_INV)
    # Close gaps in hand-drawn wobbly lines
    kernel = np.ones((9, 9), np.uint8)
    closed = cv2.morphologyEx(black_mask, cv2.MORPH_CLOSE, kernel)
    # Dilate outlines a bit more to ensure enclosure
    closed = cv2.dilate(closed, np.ones((3, 3), np.uint8), iterations=1)

    # Find outer contours of black-stroke shapes (boxes, bubbles)
    contours, _ = cv2.findContours(
        closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    boxes: list[MarkerBBox] = []
    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        if not (min_w <= w <= max_w and min_h <= h <= max_h):
            continue
        # Rough "empty inside" check: interior mostly white
        interior = im_bgr[
            y + 10: y + h - 10, x + 10: x + w - 10
        ]
        if interior.size == 0:
            continue
        interior_gray = cv2.cvtColor(interior, cv2.COLOR_BGR2GRAY)
        white_ratio = (interior_gray > 230).mean()
        if white_ratio < 0.55:
            continue
        boxes.append(_to_bbox(x, y, w, h))
    # Top-to-bottom order
    boxes.sort(key=lambda b: b.y)
    return boxes


def _detect_mascot_and_bubble(
    im_bgr: np.ndarray,
) -> tuple[MarkerBBox | None, MarkerBBox | None]:
    """Find the mascot (bottom) and its associated speech bubble.

    Mascot = dense yellow+black cluster in bottom third of slide.
    Bubble = rounded white-interior shape near the mascot.
    """
    h, w = im_bgr.shape[:2]
    bottom = im_bgr[int(h * 0.55):, :]
    offset_y = int(h * 0.55)

    hsv = cv2.cvtColor(bottom, cv2.COLOR_BGR2HSV)
    yellow = cv2.inRange(hsv, (18, 80, 140), (42, 255, 255))
    yellow = cv2.morphologyEx(yellow, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    contours, _ = cv2.findContours(yellow, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    mascot: MarkerBBox | None = None
    for c in contours:
        if cv2.contourArea(c) < 8000:
            continue
        x, y, w2, h2 = cv2.boundingRect(c)
        # mascot is usually roughly square & compact
        aspect = w2 / max(h2, 1)
        if 0.5 < aspect < 2.0 and w2 < 400 and h2 < 400:
            mascot = _to_bbox(x, y + offset_y, w2, h2)
            break

    # Speech bubble: white-interior shape that is *beside* or *near level
    # with* the mascot, not above it. The bubble is also typically the
    # widest empty box in the bottom third.
    boxes = _detect_outlined_boxes(
        bottom, min_w=300, min_h=100, max_w=900, max_h=400
    )
    bubble: MarkerBBox | None = None
    candidates: list[MarkerBBox] = []
    for b in boxes:
        global_y = b.y + offset_y
        # Reject boxes that sit noticeably above the mascot (those are
        # 2x2-grid artifacts Nano Banana sometimes draws).
        if mascot is not None:
            mascot_mid = mascot.y + mascot.h // 2
            box_bottom = global_y + b.h
            if box_bottom < mascot_mid - 50:
                continue
            # Reject overlap with mascot body
            mx0, mx1 = mascot.x, mascot.x + mascot.w
            bx0, bx1 = b.x, b.x + b.w
            overlap_x = max(0, min(mx1, bx1) - max(mx0, bx0))
            if overlap_x > mascot.w * 0.5:
                continue
        candidates.append(_to_bbox(b.x, global_y, b.w, b.h))
    # Prefer wide boxes (real bubble is wider than 2x2 squares)
    candidates.sort(key=lambda c: c.w, reverse=True)
    if candidates:
        bubble = candidates[0]

    return mascot, bubble


def _overlaps(a: MarkerBBox, b: MarkerBBox, threshold: float = 0.3) -> bool:
    """True if bbox ``a`` significantly overlaps ``b``.

    Uses intersection-over-area(a) so a small box embedded in a larger one
    counts as overlap (we want to reject role candidates that sit inside
    the mascot, even if the mascot is huge).
    """
    ax0, ay0, ax1, ay1 = a.x, a.y, a.x + a.w, a.y + a.h
    bx0, by0, bx1, by1 = b.x, b.y, b.x + b.w, b.y + b.h
    inter_w = max(0, min(ax1, bx1) - max(ax0, bx0))
    inter_h = max(0, min(ay1, by1) - max(ay0, by0))
    inter = inter_w * inter_h
    area_a = max(a.w * a.h, 1)
    return inter / area_a >= threshold


def detect_regions(
    image_path: Path, layout: str
) -> dict[str, MarkerBBox]:
    """Return a role→bbox dict for the given layout.

    Roles returned per layout:
    - apartment-card: headline, body, checkpoint, whisper
    - cover:          brand-tag, hl-1, hl-2, hl-3, whisper
    - cta-dark:       headline, body, button, whisper

    Missing roles are simply absent from the result dict; callers should
    fall back to layout_presets defaults.
    """
    image_path = Path(image_path)
    im = cv2.imread(str(image_path))
    if im is None:
        raise FileNotFoundError(image_path)

    yellow = _detect_yellow_regions(im)
    boxes = _detect_outlined_boxes(im)
    mascot, bubble = _detect_mascot_and_bubble(im)

    # Reject any role candidate that overlaps the mascot (Nano Banana
    # sometimes draws the lion's mane as a big circle that looks like a
    # box to our contour finder).
    if mascot is not None:
        yellow = [y for y in yellow if not _overlaps(y, mascot)]
        boxes = [b for b in boxes if not _overlaps(b, mascot)]

    result: dict[str, MarkerBBox] = {}

    if layout == "apartment-card":
        # headline: prefer the OUTLINED empty rectangle inside the ribbon
        # (top of slide). Fall back to the yellow ribbon body if no inner
        # box is detected.
        top_outline = next(
            (b for b in boxes if b.y < 350 and b.w > 400),
            None,
        )
        if top_outline:
            result["headline"] = top_outline
        else:
            ribbon = next(
                (b for b in yellow if b.y < 400 and b.w > 400), None
            )
            if ribbon:
                result["headline"] = ribbon
        # body: largest outlined box in the upper-middle (but not the
        # headline rectangle itself)
        headline_y = result.get("headline", _to_bbox(0, 0, 0, 0)).y
        body_candidates = [
            b for b in boxes
            if b.y > headline_y + 50 and b.y < 900 and b.w > 400 and b.h > 180
        ]
        body_candidates.sort(key=lambda b: b.w * b.h, reverse=True)
        if body_candidates:
            result["body"] = body_candidates[0]
        # checkpoint: solid yellow square in the mid-lower-right area
        # (distinct from mascot at bottom-left)
        checkpoint_candidates = [
            b for b in yellow
            if 500 < b.y < 1050 and b.w < 500 and (mascot is None or b.y + b.h < mascot.y)
        ]
        checkpoint_candidates.sort(key=lambda b: b.x, reverse=True)
        if checkpoint_candidates:
            result["checkpoint"] = checkpoint_candidates[0]
        # bubble = whisper
        if bubble:
            result["whisper"] = bubble

    elif layout == "cover":
        # three yellow highlights, top-to-bottom
        top_yellow = sorted(
            [b for b in yellow if b.w > 400 and b.y < 1000],
            key=lambda b: b.y,
        )
        for i, b in enumerate(top_yellow[:3]):
            result[f"hl-{i+1}"] = b
        if bubble:
            result["whisper"] = bubble

    elif layout == "cta-dark":
        # top yellow highlight = headline strip
        top = next((b for b in yellow if b.y < 500 and b.w > 500), None)
        if top:
            result["headline"] = top
        # bottom yellow button (large, lower third)
        bottom_btn = next(
            (b for b in yellow if b.y > 900 and b.w > 500),
            None,
        )
        if bottom_btn:
            result["button"] = bottom_btn
        if bubble:
            result["whisper"] = bubble

    return result
