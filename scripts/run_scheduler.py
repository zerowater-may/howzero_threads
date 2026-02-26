#!/usr/bin/env python3
"""스케줄러를 실행한다. 자동 포스팅 + 댓글 파이프라인 + 토큰 갱신."""
import argparse
import json
from pathlib import Path

from howzero_threads.config import Settings
from howzero_threads.logging_config import setup_logging
from howzero_threads.scheduler.posting import HowzeroScheduler


def main():
    setup_logging()

    parser = argparse.ArgumentParser(description="Threads 스케줄러")
    parser.add_argument(
        "--config",
        default="scheduler_config.json",
        help="스케줄러 설정 JSON 파일",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="등록된 작업 목록만 출력",
    )
    args = parser.parse_args()

    settings = Settings()
    scheduler = HowzeroScheduler(settings)

    # 토큰 갱신 잡은 항상 등록
    scheduler.add_token_refresh_job()

    # 설정 파일이 있으면 로드
    config_path = Path(args.config)
    if config_path.exists():
        config = json.loads(config_path.read_text())

        # 포스팅 잡 등록
        for job in config.get("posting_jobs", []):
            scheduler.add_posting_job(
                cron=job["cron"],
                text=job["text"],
                image_url=job.get("image_url"),
            )

        # 댓글 파이프라인 잡 등록
        comment_config = config.get("comment_pipeline", {})
        if comment_config.get("media_ids"):
            scheduler.add_comment_pipeline_job(
                media_ids=comment_config["media_ids"],
                interval_minutes=comment_config.get("interval_minutes", 30),
            )

    if args.dry_run:
        jobs = scheduler.scheduler.get_jobs()
        print(f"등록된 작업: {len(jobs)}건")
        for job in jobs:
            print(f"  - {job.name}: {job.trigger}")
        return

    print("스케줄러 시작 (Ctrl+C로 종료)")
    scheduler.start()


if __name__ == "__main__":
    main()
