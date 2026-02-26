#!/usr/bin/env python3
"""특정 게시물의 댓글을 조회하고, 선택적으로 이메일로 발송한다."""
import argparse
import json
import sys

from howzero_threads.api.client import ThreadsClient
from howzero_threads.api.comments import get_comments
from howzero_threads.config import Settings
from howzero_threads.logging_config import setup_logging
from howzero_threads.pipeline.comments_to_email import run as run_pipeline


def main():
    setup_logging()

    parser = argparse.ArgumentParser(description="Threads 댓글 조회")
    parser.add_argument("--media-id", required=True, help="게시물 ID")
    parser.add_argument(
        "--email", action="store_true", help="댓글을 이메일로 발송"
    )
    parser.add_argument(
        "--include-hidden",
        action="store_true",
        help="숨김 댓글 포함",
    )
    args = parser.parse_args()

    settings = Settings()
    client = ThreadsClient(settings)

    if args.email:
        count = run_pipeline(args.media_id, client, settings)
        print(f"이메일 발송 완료: {count}건")
    else:
        comments = get_comments(
            client, args.media_id, include_hidden=args.include_hidden
        )
        print(json.dumps(comments, indent=2, ensure_ascii=False))
        print(f"\n총 {len(comments)}건")


if __name__ == "__main__":
    main()
