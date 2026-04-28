from __future__ import annotations

from typing import Any


def find_account_id(
    accounts: list[dict[str, Any]],
    platform: str,
    *,
    preferred_handle: str | None = None,
) -> str:
    matches = [
        account
        for account in accounts
        if str(account.get("platform", "")).lower() == platform
    ]
    if preferred_handle:
        normalized = preferred_handle.lstrip("@").lower()
        preferred = [
            account
            for account in matches
            if normalized in {
                str(account.get("username", "")).lstrip("@").lower(),
                str(account.get("handle", "")).lstrip("@").lower(),
                str(account.get("displayName", "")).lstrip("@").lower(),
                str(account.get("name", "")).lstrip("@").lower(),
            }
        ]
        if len(preferred) == 1:
            return str(preferred[0]["_id"])
        if len(preferred) > 1:
            raise RuntimeError(f"Multiple {platform} accounts matched @{preferred_handle}")

    if len(matches) == 1:
        return str(matches[0]["_id"])
    if not matches:
        raise RuntimeError(f"No connected {platform} account found")
    raise RuntimeError(
        f"Multiple {platform} accounts found. Set ZERNIO_{platform.upper()}_ACCOUNT_ID."
    )


def instagram_reel_payload(
    *,
    content: str,
    account_id: str,
    video_url: str,
    publish_now: bool,
    first_comment: str | None = None,
    audio_name: str | None = None,
    instagram_thumbnail_url: str | None = None,
    thumb_offset_ms: int | None = None,
) -> dict[str, Any]:
    platform_data: dict[str, Any] = {
        "contentType": "reels",
        "shareToFeed": True,
    }
    if first_comment:
        platform_data["firstComment"] = first_comment
    if audio_name:
        platform_data["audioName"] = audio_name
    if instagram_thumbnail_url:
        platform_data["instagramThumbnail"] = instagram_thumbnail_url
    elif thumb_offset_ms is not None:
        platform_data["thumbOffset"] = thumb_offset_ms
    body: dict[str, Any] = {
        "content": content,
        "mediaItems": [{"type": "video", "url": video_url}],
        "platforms": [
            {
                "platform": "instagram",
                "accountId": account_id,
                "platformSpecificData": platform_data,
            }
        ],
    }
    if publish_now:
        body["publishNow"] = True
    return body


def instagram_carousel_payload(
    *,
    content: str,
    account_id: str,
    image_urls: list[str],
    publish_now: bool,
    first_comment: str | None = None,
) -> dict[str, Any]:
    if not image_urls:
        raise RuntimeError("Instagram carousel requires at least one image")
    if len(image_urls) > 10:
        raise RuntimeError("Instagram carousel supports up to 10 images")

    platform_data: dict[str, Any] = {}
    if first_comment:
        platform_data["firstComment"] = first_comment
    platform: dict[str, Any] = {
        "platform": "instagram",
        "accountId": account_id,
    }
    if platform_data:
        platform["platformSpecificData"] = platform_data

    body: dict[str, Any] = {
        "content": content,
        "mediaItems": [{"type": "image", "url": url} for url in image_urls],
        "platforms": [platform],
    }
    if publish_now:
        body["publishNow"] = True
    return body


def threads_video_payload(
    *,
    content: str,
    account_id: str,
    video_url: str,
    publish_now: bool,
    topic_tag: str | None = "부동산",
) -> dict[str, Any]:
    return threads_media_payload(
        content=content,
        account_id=account_id,
        media_items=[{"type": "video", "url": video_url}],
        publish_now=publish_now,
        topic_tag=topic_tag,
    )


def threads_media_payload(
    *,
    content: str,
    account_id: str,
    media_items: list[dict[str, str]],
    publish_now: bool,
    topic_tag: str | None = "부동산",
) -> dict[str, Any]:
    platform: dict[str, Any] = {
        "platform": "threads",
        "accountId": account_id,
    }
    if topic_tag:
        platform["platformSpecificData"] = {"topic_tag": topic_tag}
    body: dict[str, Any] = {
        "content": content,
        "mediaItems": media_items,
        "platforms": [platform],
    }
    if publish_now:
        body["publishNow"] = True
    return body
