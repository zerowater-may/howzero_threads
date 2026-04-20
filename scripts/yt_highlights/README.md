# yt_highlights

Extract highlight spans + frames from a YouTube video.

## Install

```bash
pip install -e '.[yt,dev]'
```

Requires `yt-dlp` and `ffmpeg` on PATH (both installed via Homebrew).

## Run

```bash
python3 -m scripts.yt_highlights "<YOUTUBE_URL>" --out ./out/<run_name>
```

Produces in `./out/<run_name>/`:
- `<video_id>.mp4` + `<video_id>.info.json` (yt-dlp artifacts)
- `transcript.json` — `[{t, d, text}, ...]`
- `scenes.json` — `[{index, start, end}, ...]`
- `frames/h01_f01.jpg`, … — cropped 3:4 JPGs, ordered by highlight rank
- `highlights.json` — final assembled output

## Flags

| Flag | Default | Meaning |
|---|---:|---|
| `--threshold` | 0.7 | Heatmap value cutoff (0–1). Lower = more highlights. |
| `--top-n` | 15 | Max highlight spans returned. |
| `--scene-threshold` | 27.0 | PySceneDetect `ContentDetector` threshold. Lower = more sensitive. |
| `--max-frames` | 2 | Frames extracted per highlight span. |

## Source-detection logic

1. If `heatmap` field exists in `info.json` → rank by replay value (YouTube Most Replayed).
2. Else if `chapters` exist → each chapter becomes one highlight span.
3. Else → heuristic lexical scorer on the transcript (`fallback.py`):
   sliding 15s windows scored by hook words (핵심, 결론, 놀랍…), concrete
   numbers/amounts (만원/%/억), and punctuation (? !). Top N non-overlapping
   windows returned, kind=`transcript_fallback`.

## highlights.json schema (v1)

```json
{
  "schema_version": 1,
  "video_id": "...",
  "title": "...",
  "duration": 720.5,
  "source": "heatmap|chapters|transcript_fallback",
  "highlights": [
    {
      "rank": 1,
      "start": 125.3,
      "end": 145.7,
      "score": 0.95,
      "kind": "heatmap_peak|chapter",
      "chapter": "Chapter title or null",
      "transcript": [{"t": 126.0, "d": 2.1, "text": "..."}],
      "frames": ["frames/h01_f01.jpg"]
    }
  ]
}
```

## Smoke test

```bash
python3 -m scripts.yt_highlights \
  "https://www.youtube.com/watch?v=<any_popular_video>" \
  --out /tmp/yt-highlights-smoke

jq '.source, (.highlights | length)' /tmp/yt-highlights-smoke/highlights.json
ls /tmp/yt-highlights-smoke/frames/ | head
```

If `source == "heatmap"` and the frames directory has files → the pipeline is working.

If `source == "transcript_fallback"` → the video has no Most Replayed or chapter markers. This is expected for recently uploaded or low-traffic videos. Pick a more popular video and retry.

## Verified behavior on real video (2026-04-20)

Ran against `https://youtu.be/H-IdU1jTr6M` (KBS 추적60분, 583s):
- Download: ✅ 480p mp4 + info.json
- Transcript: ✅ 220 Korean segments
- Scene detection: ✅ 92 scenes
- Heatmap/chapters: both `null` (not yet populated by YouTube)
- Highlights: ✅ **14 spans via `transcript_fallback`**, 28 cropped JPGs
- Top-ranked span transcript preview: `">> 수강생들의 피해가 생기는 이유는 무엇일까? 고액강이 강사 제한을 받았던…"` (the documentary's central question — correctly identified by hook-word + number scoring).

## Tests

```bash
pytest tests/yt_highlights/ -v
```

Expected: 33 tests pass.
