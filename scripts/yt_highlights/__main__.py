"""CLI: python -m scripts.yt_highlights <url> --out <path>"""

import argparse
import json
import sys
from pathlib import Path

from .download import download_video, DownloadError
from .transcript import fetch_transcript, save_transcript
from .scenes import detect_scenes, save_scenes
from .heatmap import extract_highlight_candidates, detect_source
from .frames import extract_frames_for_span
from .merge import build_highlights


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(
        prog="yt-highlights",
        description="Extract highlight spans + frames from a YouTube video.",
    )
    p.add_argument("url", help="YouTube video URL")
    p.add_argument("--out", required=True, help="Output directory")
    p.add_argument("--threshold", type=float, default=0.7,
                   help="Heatmap value threshold (default 0.7)")
    p.add_argument("--top-n", type=int, default=15,
                   help="Max number of highlight spans (default 15)")
    p.add_argument("--scene-threshold", type=float, default=27.0,
                   help="PySceneDetect content threshold (default 27.0)")
    p.add_argument("--max-frames", type=int, default=2,
                   help="Max frames per highlight (default 2)")
    args = p.parse_args(argv)

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    frames_dir = out / "frames"

    # 1. Download video + info.json
    try:
        dl = download_video(args.url, out)
    except (ValueError, DownloadError) as e:
        print(f"[error] download: {e}", file=sys.stderr)
        return 2

    print(f"[1/5] downloaded: {dl['video_id']}")

    # 2. Transcript
    try:
        transcript = fetch_transcript(dl["video_id"])
    except Exception as e:
        print(f"[warn] transcript unavailable: {e}", file=sys.stderr)
        transcript = []
    save_transcript(transcript, out / "transcript.json")
    print(f"[2/5] transcript: {len(transcript)} segments")

    # 3. Scenes
    try:
        scenes = detect_scenes(dl["video_path"], threshold=args.scene_threshold)
    except Exception as e:
        print(f"[warn] scene detection failed: {e}", file=sys.stderr)
        scenes = []
    save_scenes(scenes, out / "scenes.json")
    print(f"[3/5] scenes: {len(scenes)} detected")

    # 4. Highlight candidates
    info = json.loads(dl["info_path"].read_text(encoding="utf-8"))
    source = detect_source(info)
    spans = extract_highlight_candidates(
        info, threshold=args.threshold, top_n=args.top_n
    )
    print(f"[4/5] highlights: {len(spans)} spans from {source}")

    # 5. Frames per span
    frames_by_rank: dict[int, list[Path]] = {}
    for span in spans:
        paths = extract_frames_for_span(
            span, scenes, dl["video_path"], frames_dir,
            max_frames=args.max_frames,
        )
        if paths:
            frames_by_rank[span.rank] = paths

    # 6. Merge → highlights.json
    output = build_highlights(
        info=info, source=source,
        transcript=transcript, spans=spans,
        frames_by_rank=frames_by_rank,
        frames_root=frames_dir,
    )
    (out / "highlights.json").write_text(
        json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"[5/5] wrote {out / 'highlights.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
