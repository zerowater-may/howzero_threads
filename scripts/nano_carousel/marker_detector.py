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
