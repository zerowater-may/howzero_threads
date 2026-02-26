#!/usr/bin/env python3
"""Threads에 포스트를 게시한다."""
import argparse

from howzero_threads.api.client import ThreadsClient
from howzero_threads.api.posts import create_post
from howzero_threads.config import Settings
from howzero_threads.logging_config import setup_logging
from howzero_threads.store.rate_limiter import RateLimiter


def main():
    setup_logging()

    parser = argparse.ArgumentParser(description="Threads 포스팅")
    parser.add_argument("--text", required=True, help="포스트 내용")
    parser.add_argument("--image-url", help="이미지 URL (선택)")
    parser.add_argument(
        "--reply-to", help="답글 대상 게시물 ID (선택)"
    )
    args = parser.parse_args()

    settings = Settings()
    rate_limiter = RateLimiter(settings.rate_limit_file)

    if not rate_limiter.can_post():
        print(
            f"Rate limit 도달. 남은 횟수: {rate_limiter.remaining()}"
        )
        return

    client = ThreadsClient(settings)
    result = create_post(
        client,
        args.text,
        image_url=args.image_url,
        reply_to_id=args.reply_to,
    )
    rate_limiter.record()
    print(f"포스트 게시 완료: {result}")
    print(f"남은 포스팅 횟수: {rate_limiter.remaining()}")


if __name__ == "__main__":
    main()
