from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any


REEL_OUTPUT_NAMES = (
    "zipsaja-reel-30s.mp4",
    "zipsaja-reel-22s.mp4",
)
AUDIO_MAPPED_REEL_NAMES = (
    "zipsaja-reel-30s-audio-mapped-ig-safe.mp4",
    "zipsaja-reel-30s-audio-mapped.mp4",
)
LEGACY_AUDIO_MAPPED_REEL_NAMES = (
    "zipsaja-reel-22s-audio-mapped-ig-safe.mp4",
    "zipsaja-reel-22s-audio-mapped.mp4",
)


@dataclass(frozen=True)
class PublishBundle:
    root: Path
    reel_path: Path
    instagram_caption_path: Path
    threads_caption_path: Path
    state_path: Path
    publish_state_path: Path

    @property
    def carousel_slide_paths(self) -> list[Path]:
        return sorted((self.root / "carousel").glob("slide-*.png"))

    @property
    def threads_carousel_paths(self) -> list[Path]:
        prepared = sorted((self.root / "publish-ready" / "threads-carousel").glob("slide-*.png"))
        return prepared or self.carousel_slide_paths

    @property
    def instagram_carousel_paths(self) -> list[Path]:
        prepared = sorted((self.root / "publish-ready" / "instagram-carousel").glob("slide-*.png"))
        return prepared or self.threads_carousel_paths

    @property
    def audio_mapped_reel_path(self) -> Path:
        candidates = [self.root / "reels" / name for name in AUDIO_MAPPED_REEL_NAMES]
        preferred = next((path for path in candidates if path.exists()), None)
        if preferred:
            return preferred
        if self.reel_path.name == "zipsaja-reel-30s.mp4":
            return self.reel_path

        legacy_candidates = [self.root / "reels" / name for name in LEGACY_AUDIO_MAPPED_REEL_NAMES]
        return next((path for path in legacy_candidates if path.exists()), self.reel_path)

    @property
    def instagram_reel_cover_path(self) -> Path | None:
        cover = self.root / "publish-ready" / "instagram-reel-cover.png"
        return cover if cover.exists() else None

    @property
    def instagram_caption(self) -> str:
        return self.instagram_caption_path.read_text(encoding="utf-8").strip()

    @property
    def threads_caption(self) -> str:
        return self.threads_caption_path.read_text(encoding="utf-8").strip()


def load_bundle(path: Path) -> PublishBundle:
    root = path.resolve()
    reel_path = _first_existing(root / "reels", REEL_OUTPUT_NAMES) or root / "reels" / REEL_OUTPUT_NAMES[0]
    bundle = PublishBundle(
        root=root,
        reel_path=reel_path,
        instagram_caption_path=root / "captions" / "instagram.txt",
        threads_caption_path=root / "captions" / "threads.txt",
        state_path=root / "pipeline-state.json",
        publish_state_path=root / "publish-state.json",
    )
    missing = [
        p
        for p in (
            bundle.reel_path,
            bundle.instagram_caption_path,
            bundle.threads_caption_path,
            bundle.state_path,
        )
        if not p.exists()
    ]
    if missing:
        names = ", ".join(str(p) for p in missing)
        raise FileNotFoundError(f"Required bundle files missing: {names}")

    state = json.loads(bundle.state_path.read_text(encoding="utf-8"))
    if state.get("status") != "completed":
        raise RuntimeError(f"Pipeline bundle must be completed before publishing: {state.get('status')}")

    return bundle


def _first_existing(directory: Path, names: tuple[str, ...]) -> Path | None:
    for name in names:
        path = directory / name
        if path.exists():
            return path
    return None


def write_publish_state(path: Path, state: dict[str, Any]) -> None:
    path.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


def read_publish_state(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))
