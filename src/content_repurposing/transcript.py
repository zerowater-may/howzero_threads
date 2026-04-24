"""WF1: 유튜브 영상 → 트랜스크립트 자동 추출.

Usage:
    python -m content_repurposing.transcript --url "https://youtube.com/watch?v=..."
    python -m content_repurposing.transcript --file ./my_audio.mp3
"""
import argparse
import json
import subprocess
import tempfile
from pathlib import Path

import requests

from .config import RepurposingSettings


def download_audio(youtube_url: str, output_dir: Path) -> Path:
    """yt-dlp로 유튜브 영상에서 오디오를 추출한다."""
    output_path = output_dir / "%(id)s.%(ext)s"
    cmd = [
        "yt-dlp",
        "-x",
        "--audio-format", "mp3",
        "--audio-quality", "0",
        "-o", str(output_path),
        youtube_url,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)

    # yt-dlp 출력에서 실제 파일 경로 추출
    for line in result.stdout.splitlines():
        if "[ExtractAudio] Destination:" in line:
            return Path(line.split("Destination:")[-1].strip())

    # fallback: output_dir에서 mp3 파일 찾기
    mp3_files = sorted(output_dir.glob("*.mp3"), key=lambda p: p.stat().st_mtime, reverse=True)
    if mp3_files:
        return mp3_files[0]
    raise FileNotFoundError(f"오디오 파일을 찾을 수 없습니다: {output_dir}")


def transcribe_whisper(audio_path: Path, settings: RepurposingSettings) -> dict:
    """OpenAI Whisper API로 오디오를 텍스트로 변환한다."""
    url = "https://api.openai.com/v1/audio/transcriptions"
    headers = {"Authorization": f"Bearer {settings.openai_api_key}"}

    with open(audio_path, "rb") as f:
        resp = requests.post(
            url,
            headers=headers,
            files={"file": (audio_path.name, f, "audio/mpeg")},
            data={
                "model": settings.whisper_model,
                "response_format": "verbose_json",
                "timestamp_granularities[]": "segment",
                "language": "ko",
            },
            timeout=600,
        )
    resp.raise_for_status()
    return resp.json()


def format_transcript(whisper_response: dict) -> str:
    """Whisper 응답을 타임스탬프 포함 텍스트로 변환한다."""
    lines = []
    for seg in whisper_response.get("segments", []):
        start = seg.get("start", 0)
        mm, ss = divmod(int(start), 60)
        hh, mm = divmod(mm, 60)
        timestamp = f"[{hh:02d}:{mm:02d}:{ss:02d}]"
        text = seg.get("text", "").strip()
        if text:
            lines.append(f"{timestamp} {text}")

    return "\n".join(lines)


def extract_transcript(
    youtube_url: str | None = None,
    audio_file: str | None = None,
    settings: RepurposingSettings | None = None,
) -> dict:
    """메인 트랜스크립트 추출 함수.

    Returns:
        {
            "full_text": str,       # 타임스탬프 없는 전체 텍스트
            "timestamped": str,     # 타임스탬프 포함 텍스트
            "segments": list,       # Whisper 세그먼트 원본
            "duration": float,      # 총 길이(초)
            "language": str,        # 감지된 언어
        }
    """
    if settings is None:
        settings = RepurposingSettings()

    if audio_file:
        audio_path = Path(audio_file)
    elif youtube_url:
        tmp_dir = Path(settings.transcript_dir)
        tmp_dir.mkdir(parents=True, exist_ok=True)
        audio_path = download_audio(youtube_url, tmp_dir)
    else:
        raise ValueError("youtube_url 또는 audio_file 중 하나를 지정해야 합니다.")

    whisper_resp = transcribe_whisper(audio_path, settings)

    return {
        "full_text": whisper_resp.get("text", ""),
        "timestamped": format_transcript(whisper_resp),
        "segments": whisper_resp.get("segments", []),
        "duration": whisper_resp.get("duration", 0),
        "language": whisper_resp.get("language", "ko"),
    }


def save_transcript(transcript: dict, output_path: Path) -> None:
    """트랜스크립트를 JSON과 텍스트 파일로 저장한다."""
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # JSON (전체 데이터)
    json_path = output_path.with_suffix(".json")
    json_path.write_text(json.dumps(transcript, ensure_ascii=False, indent=2), encoding="utf-8")

    # 텍스트 (타임스탬프 포함)
    txt_path = output_path.with_suffix(".txt")
    txt_path.write_text(transcript["timestamped"], encoding="utf-8")

    print(f"트랜스크립트 저장: {json_path}, {txt_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="유튜브 영상 트랜스크립트 추출")
    parser.add_argument("--url", help="유튜브 영상 URL")
    parser.add_argument("--file", help="로컬 오디오 파일 경로")
    parser.add_argument("--output", default="./output/transcripts/latest", help="출력 경로 (확장자 제외)")
    args = parser.parse_args()

    settings = RepurposingSettings()
    result = extract_transcript(youtube_url=args.url, audio_file=args.file, settings=settings)
    save_transcript(result, Path(args.output))
    print(f"완료! 전체 길이: {result['duration']:.0f}초, 세그먼트: {len(result['segments'])}개")
