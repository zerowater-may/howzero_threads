"""WF6: Notion 캘린더 연동 — 콘텐츠 파이프라인 결과를 Notion DB에 기록한다.

Notion API를 사용하여 콘텐츠 캘린더 데이터베이스에
각 채널별 게시 일정, 상태, 콘텐츠를 기록한다.

Usage:
    python -m content_repurposing.notion_calendar --schedule ./output/schedules/schedule_latest.json
"""
import argparse
import json
from datetime import datetime
from pathlib import Path

import httpx

from .config import RepurposingSettings


NOTION_API_VERSION = "2022-06-28"


def _notion_headers(settings: RepurposingSettings) -> dict:
    return {
        "Authorization": f"Bearer {settings.notion_api_key}",
        "Notion-Version": NOTION_API_VERSION,
        "Content-Type": "application/json",
    }


def create_calendar_entry(
    schedule_item: dict,
    settings: RepurposingSettings,
) -> dict:
    """Notion 콘텐츠 캘린더 DB에 항목을 추가한다."""
    if not settings.notion_api_key or not settings.notion_calendar_db_id:
        raise ValueError("REPURPOSE_NOTION_API_KEY와 REPURPOSE_NOTION_CALENDAR_DB_ID를 설정하세요")

    channel = schedule_item["channel"]
    scheduled_at = schedule_item["scheduled_at"]
    content_preview = schedule_item.get("content_preview", "")
    status = schedule_item.get("status", "예정")

    # 상태 매핑
    status_map = {
        "dry-run": "예정",
        "scheduled": "예약 완료",
        "published": "게시 완료",
        "skipped": "건너뜀",
    }
    notion_status = status_map.get(status, "예정")

    # 채널 한글 이름
    channel_kr = {
        "naver_blog": "네이버 블로그",
        "web_blog_seo": "웹 블로그 SEO",
        "linkedin": "링크드인",
        "x_thread": "X (트위터)",
        "threads": "Threads",
        "instagram_carousel": "인스타그램",
        "newsletter": "뉴스레터",
        "brunch": "브런치",
    }

    payload = {
        "parent": {"database_id": settings.notion_calendar_db_id},
        "properties": {
            "제목": {
                "title": [{"text": {"content": f"[{channel_kr.get(channel, channel)}] 콘텐츠 게시"}}]
            },
            "채널": {
                "select": {"name": channel_kr.get(channel, channel)}
            },
            "상태": {
                "select": {"name": notion_status}
            },
            "게시일": {
                "date": {"start": scheduled_at}
            },
        },
    }

    with httpx.Client() as client:
        resp = client.post(
            "https://api.notion.com/v1/pages",
            headers=_notion_headers(settings),
            json=payload,
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()


def sync_schedule_to_notion(
    schedule: list[dict],
    settings: RepurposingSettings | None = None,
) -> list[dict]:
    """스케줄 전체를 Notion에 동기화한다."""
    if settings is None:
        settings = RepurposingSettings()

    results = []
    for item in schedule:
        try:
            page = create_calendar_entry(item, settings)
            results.append({
                "channel": item["channel"],
                "status": "synced",
                "notion_page_id": page.get("id", ""),
            })
        except Exception as e:
            results.append({
                "channel": item["channel"],
                "status": "error",
                "error": str(e),
            })

    synced = sum(1 for r in results if r["status"] == "synced")
    errors = sum(1 for r in results if r["status"] == "error")
    print(f"Notion 동기화 완료! 성공: {synced}, 실패: {errors}")

    return results


def main():
    parser = argparse.ArgumentParser(description="Notion 콘텐츠 캘린더 동기화")
    parser.add_argument("--schedule", required=True, help="스케줄 JSON 파일 경로")
    args = parser.parse_args()

    schedule_path = Path(args.schedule)
    schedule = json.loads(schedule_path.read_text(encoding="utf-8"))

    settings = RepurposingSettings()
    sync_schedule_to_notion(schedule, settings)


if __name__ == "__main__":
    main()
