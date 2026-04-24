"""원소스 멀티유즈 콘텐츠 파이프라인 — WF1 → WF2 → WF3 → WF5 → WF6 통합 실행.

유튜브 URL 입력 → 트랜스크립트 추출 → 숏폼 클립 분석 → 8개 채널 콘텐츠 생성
→ 예약 게시 스케줄 → Notion 캘린더 연동.

Usage:
    python -m content_repurposing.pipeline --url "https://youtube.com/watch?v=..." --keyword "AI 자동화"
    python -m content_repurposing.pipeline --url "..." --keyword "..." --skip-shortform --skip-schedule
"""
import argparse
import asyncio
import json
from datetime import datetime
from pathlib import Path

from .config import RepurposingSettings
from .transcript import extract_transcript, save_transcript
from .repurpose import repurpose_all, save_results
from .shortform import generate_shortform_clips, save_clips
from .scheduler import build_schedule, execute_schedule, save_schedule
from .notion_calendar import sync_schedule_to_notion


def run_pipeline(
    youtube_url: str,
    keyword: str = "AI 자동화",
    channels: list[str] | None = None,
    skip_shortform: bool = False,
    skip_schedule: bool = False,
    skip_notion: bool = False,
    schedule_mode: str = "dry-run",
    settings: RepurposingSettings | None = None,
) -> dict:
    """전체 파이프라인 실행: URL → 트랜스크립트 → 숏폼 → 멀티채널 → 스케줄."""
    if settings is None:
        settings = RepurposingSettings()

    output_base = Path(settings.output_dir)
    transcript_dir = Path(settings.transcript_dir)
    shortform_dir = Path(settings.shortform_dir)
    schedule_dir = Path(settings.schedule_dir)

    total_steps = 3 + (0 if skip_shortform else 1) + (0 if skip_schedule else 1) + (0 if skip_notion else 1)
    step = 0

    # 영상 ID 추출
    video_id = "unknown"
    if "v=" in youtube_url:
        video_id = youtube_url.split("v=")[-1].split("&")[0]
    elif "youtu.be/" in youtube_url:
        video_id = youtube_url.split("youtu.be/")[-1].split("?")[0]

    # WF1: 트랜스크립트 추출
    step += 1
    print(f"[{step}/{total_steps}] 트랜스크립트 추출 중... (영상: {video_id})")
    transcript = extract_transcript(youtube_url=youtube_url, settings=settings)
    save_transcript(transcript, transcript_dir / video_id)
    print(f"  완료! 길이: {transcript['duration']:.0f}초, 세그먼트: {len(transcript['segments'])}개")

    # WF2: 숏폼 클리핑
    clips_dir = None
    clips_count = 0
    if not skip_shortform:
        step += 1
        print(f"[{step}/{total_steps}] 숏폼 클립 분석 중...")
        clips = asyncio.run(
            generate_shortform_clips(youtube_url, transcript["full_text"], mode="ai", settings=settings)
        )
        clips_dir = save_clips(clips, shortform_dir, video_id)
        clips_count = len(clips)
        print(f"  완료! 클립 {clips_count}개 추출")

    # WF3: 멀티채널 콘텐츠 변환
    step += 1
    print(f"[{step}/{total_steps}] 멀티채널 콘텐츠 변환 중... (키워드: {keyword})")
    results = asyncio.run(
        repurpose_all(transcript["full_text"], keyword, channels, settings)
    )

    step += 1
    print(f"[{step}/{total_steps}] 결과 저장 중...")
    batch_dir = save_results(results, output_base, video_id)

    # WF5: 예약 게시 스케줄
    schedule_result = None
    if not skip_schedule:
        step += 1
        print(f"[{step}/{total_steps}] 게시 스케줄 생성 중... (모드: {schedule_mode})")
        schedule = build_schedule(batch_dir)
        schedule_results = execute_schedule(schedule, schedule_mode, settings)
        save_schedule(schedule, schedule_results, schedule_dir)
        schedule_result = {
            "total": len(schedule),
            "mode": schedule_mode,
        }

    # WF6: Notion 캘린더 동기화
    notion_result = None
    if not skip_notion and not skip_schedule and schedule_result:
        step += 1
        print(f"[{step}/{total_steps}] Notion 캘린더 동기화 중...")
        schedule_data = json.loads((schedule_dir / "schedule_latest.json").read_text(encoding="utf-8")) if (schedule_dir / "schedule_latest.json").exists() else schedule
        notion_results = sync_schedule_to_notion(schedule_data, settings)
        synced = sum(1 for r in notion_results if r["status"] == "synced")
        notion_result = {"synced": synced, "total": len(notion_results)}
        print(f"  완료! Notion 동기화: {synced}/{len(notion_results)}")

    # 파이프라인 실행 리포트
    report = {
        "pipeline_run": datetime.now().isoformat(),
        "youtube_url": youtube_url,
        "video_id": video_id,
        "keyword": keyword,
        "transcript_duration_sec": transcript["duration"],
        "transcript_segments": len(transcript["segments"]),
        "shortform_clips": clips_count,
        "channels_generated": len([r for r in results if "error" not in r]),
        "channels_failed": len([r for r in results if "error" in r]),
        "schedule": schedule_result,
        "notion": notion_result,
        "output_dir": str(batch_dir),
        "clips_dir": str(clips_dir) if clips_dir else None,
    }

    report_path = batch_dir / "_pipeline_report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\n파이프라인 완료!")
    print(f"  영상: {youtube_url}")
    print(f"  숏폼: {clips_count}개 클립")
    print(f"  텍스트: {report['channels_generated']}개 채널 콘텐츠")
    if schedule_result:
        print(f"  스케줄: {schedule_result['total']}개 예약 ({schedule_mode})")
    print(f"  출력: {batch_dir}")

    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="원소스 멀티유즈 콘텐츠 파이프라인")
    parser.add_argument("--url", required=True, help="유튜브 영상 URL")
    parser.add_argument("--keyword", default="AI 자동화", help="SEO 키워드")
    parser.add_argument("--channels", help="변환할 채널 (쉼표 구분)")
    parser.add_argument("--skip-shortform", action="store_true", help="숏폼 클립 분석 건너뛰기")
    parser.add_argument("--skip-schedule", action="store_true", help="게시 스케줄 건너뛰기")
    parser.add_argument("--skip-notion", action="store_true", help="Notion 캘린더 동기화 건너뛰기")
    parser.add_argument("--schedule-mode", choices=["buffer", "dry-run"], default="dry-run", help="스케줄 실행 모드")
    args = parser.parse_args()

    channels = args.channels.split(",") if args.channels else None
    run_pipeline(
        args.url, args.keyword, channels,
        skip_shortform=args.skip_shortform,
        skip_schedule=args.skip_schedule,
        skip_notion=args.skip_notion,
        schedule_mode=args.schedule_mode,
    )
