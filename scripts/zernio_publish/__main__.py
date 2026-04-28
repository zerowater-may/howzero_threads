from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .bundle import load_bundle, read_publish_state, write_publish_state
from .client import ZernioClient
from .payloads import (
    find_account_id,
    instagram_carousel_payload,
    instagram_reel_payload,
    threads_media_payload,
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="zernio_publish")
    parser.add_argument("bundle", nargs="?", type=Path, help="zipsaja pipeline bundle")
    parser.add_argument("--list-accounts", action="store_true")
    parser.add_argument("--now", action="store_true", help="Publish immediately")
    parser.add_argument("--draft", action="store_true", help="Create drafts instead of publishing")
    parser.add_argument("--dry-run", action="store_true", help="Print payloads without uploading/posting")
    parser.add_argument("--platform", choices=["instagram", "threads"], action="append")
    parser.add_argument("--handle", default="zipsaja_", help="Preferred connected handle")
    parser.add_argument("--topic-tag", default="부동산", help="Threads topic tag")
    parser.add_argument("--threads-media", choices=["video", "carousel"], default="video")
    parser.add_argument(
        "--instagram-media",
        choices=["manual", "reel", "carousel", "both"],
        default="manual",
        help="Instagram API mode. Use manual when platform music must be selected in-app.",
    )
    parser.add_argument("--instagram-audio-name", default="zipsaja original audio")
    parser.add_argument(
        "--instagram-thumb-offset-ms",
        type=int,
        default=10500,
        help="Fallback Reel thumbnail frame offset when no custom cover is present",
    )
    parser.add_argument(
        "--no-instagram-thumbnail",
        action="store_true",
        help="Do not upload publish-ready/instagram-reel-cover.png as the Reel cover",
    )
    parser.add_argument("--api-key-env", default="ZERNIO_API_KEY")
    parser.add_argument(
        "--allow-instagram-api-publish",
        action="store_true",
        help="Use only when Instagram platform music is not required or audio is baked into the video",
    )
    return parser


def _api_key(env_name: str) -> str:
    value = os.environ.get(env_name)
    if not value:
        raise RuntimeError(f"{env_name} is required")
    return value


def _print_accounts(accounts: list[dict[str, Any]]) -> None:
    for account in accounts:
        platform = account.get("platform", "")
        account_id = account.get("_id", "")
        handle = account.get("username") or account.get("handle") or account.get("name") or ""
        profile_id = account.get("profileId") or account.get("profile_id") or ""
        print(f"{platform}\t{account_id}\t{handle}\t{profile_id}")


def _post_id(response: dict[str, Any]) -> str | None:
    post = response.get("post", response.get("data", response))
    if isinstance(post, dict):
        return post.get("_id") or post.get("id")
    return None


def _write_manual_instagram_package(bundle) -> Path:
    package_dir = bundle.root / "publish-manual"
    package_dir.mkdir(parents=True, exist_ok=True)
    (package_dir / "instagram-caption.txt").write_text(
        bundle.instagram_caption + "\n",
        encoding="utf-8",
    )
    (package_dir / "instagram-upload-checklist.md").write_text(
        "\n".join(
            [
                "# Instagram Manual Upload Checklist",
                "",
                "Instagram 플랫폼 음악을 추가해야 하므로 API 즉시 게시를 사용하지 않는다.",
                "",
                "## Reel",
                "",
                f"- 영상: `{bundle.reel_path.relative_to(bundle.root)}`",
                "- Instagram 앱에서 Reel 업로드",
                "- 앱 안에서 음악/오디오 선택",
                "- `publish-manual/instagram-caption.txt` 캡션 붙여넣기",
                "- 커버/썸네일 확인 후 게시",
                "",
                "## Carousel Feed",
                "",
                "- 이미지: `carousel/slide-01.png`부터 순서대로 선택",
                "- Instagram 앱에서 게시글 음악 추가",
                "- 같은 캡션 또는 짧은 변형 캡션 사용",
                "",
                "## CTA",
                "",
                "- 댓글 키워드: `전세난`",
                "- 자료: `attachments/seoul-price-data.xlsx`, `attachments/seoul-price-insights.pdf`",
                "",
            ]
        ),
        encoding="utf-8",
    )
    return package_dir


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if args.now and args.draft:
        print("ERROR: choose only one of --now or --draft", file=sys.stderr)
        return 2

    client = None if args.dry_run and not args.list_accounts else ZernioClient(_api_key(args.api_key_env))
    if args.list_accounts:
        assert client is not None
        _print_accounts(client.list_accounts())
        return 0

    if not args.bundle:
        print("ERROR: bundle path required unless --list-accounts is used", file=sys.stderr)
        return 2

    platforms = args.platform or ["instagram", "threads"]
    bundle = load_bundle(args.bundle)
    accounts = client.list_accounts() if client else []
    instagram_account_id = os.environ.get("ZERNIO_INSTAGRAM_ACCOUNT_ID")
    threads_account_id = os.environ.get("ZERNIO_THREADS_ACCOUNT_ID")
    if "instagram" in platforms and not instagram_account_id:
        instagram_account_id = (
            find_account_id(accounts, "instagram", preferred_handle=args.handle)
            if client
            else "DRY_RUN_INSTAGRAM_ACCOUNT_ID"
        )
    if "threads" in platforms and not threads_account_id:
        threads_account_id = (
            find_account_id(accounts, "threads", preferred_handle=args.handle)
            if client
            else "DRY_RUN_THREADS_ACCOUNT_ID"
        )

    instagram_api_allowed = (
        args.allow_instagram_api_publish
        or "instagram" not in platforms
        or args.instagram_media != "manual"
    )
    manual_instagram_dir = None
    if "instagram" in platforms and not instagram_api_allowed:
        manual_instagram_dir = _write_manual_instagram_package(bundle)
        print(
            "[zernio-publish] instagram skipped: platform music requires manual Instagram upload",
            file=sys.stderr,
        )

    publish_now = bool(args.now)
    uploaded_video = None
    uploaded_instagram_reel_cover = None
    uploaded_threads_images = []
    uploaded_instagram_carousel_images = []
    video_url = "DRY_RUN_VIDEO_URL"
    instagram_reel_thumbnail_url = None
    threads_media_items = [{"type": "video", "url": video_url}]
    platforms_requiring_api = [
        platform
        for platform in platforms
        if platform == "threads" or (platform == "instagram" and instagram_api_allowed)
    ]
    instagram_needs_reel = "instagram" in platforms and args.instagram_media in {"reel", "both"}
    instagram_needs_carousel = "instagram" in platforms and args.instagram_media in {"carousel", "both"}
    needs_video_upload = instagram_needs_reel or (
        "threads" in platforms and args.threads_media == "video"
    )
    if platforms_requiring_api and not args.dry_run and needs_video_upload:
        reel_path = bundle.audio_mapped_reel_path if instagram_needs_reel else bundle.reel_path
        uploaded_video = client.upload_media(reel_path)
        video_url = uploaded_video.public_url
        threads_media_items = [{"type": "video", "url": video_url}]

    instagram_reel_cover_path = bundle.instagram_reel_cover_path
    if instagram_needs_reel and instagram_reel_cover_path and not args.no_instagram_thumbnail:
        if args.dry_run:
            instagram_reel_thumbnail_url = "DRY_RUN_INSTAGRAM_THUMBNAIL_URL"
        else:
            uploaded_instagram_reel_cover = client.upload_media(instagram_reel_cover_path)
            instagram_reel_thumbnail_url = uploaded_instagram_reel_cover.public_url

    instagram_carousel_items: list[dict[str, str]] = []
    if instagram_needs_carousel:
        image_paths = bundle.instagram_carousel_paths
        if not image_paths:
            raise RuntimeError("No carousel slide images found for Instagram")
        if len(image_paths) > 10:
            raise RuntimeError("Instagram carousel supports up to 10 images")
        if args.dry_run:
            instagram_carousel_items = [
                {"type": "image", "url": f"DRY_RUN_INSTAGRAM_IMAGE_URL_{index:02d}"}
                for index, _ in enumerate(image_paths, start=1)
            ]
        else:
            uploaded_instagram_carousel_images = [client.upload_media(path) for path in image_paths]
            instagram_carousel_items = [
                {"type": "image", "url": uploaded.public_url}
                for uploaded in uploaded_instagram_carousel_images
            ]

    if "threads" in platforms and args.threads_media == "carousel":
        slide_paths = bundle.threads_carousel_paths
        if not slide_paths:
            raise RuntimeError("No carousel slide images found for Threads")
        if len(slide_paths) > 10:
            raise RuntimeError("Threads supports up to 10 images per post")
        if args.dry_run:
            threads_media_items = [
                {"type": "image", "url": f"DRY_RUN_IMAGE_URL_{index:02d}"}
                for index, _ in enumerate(slide_paths, start=1)
            ]
        else:
            uploaded_threads_images = [client.upload_media(path) for path in slide_paths]
            threads_media_items = [
                {"type": "image", "url": uploaded.public_url}
                for uploaded in uploaded_threads_images
            ]

    payloads: dict[str, dict[str, Any]] = {}
    if instagram_needs_reel:
        payloads["instagram_reel"] = instagram_reel_payload(
            content=bundle.instagram_caption,
            account_id=str(instagram_account_id),
            video_url=video_url,
            publish_now=publish_now,
            audio_name=args.instagram_audio_name,
            instagram_thumbnail_url=instagram_reel_thumbnail_url,
            thumb_offset_ms=args.instagram_thumb_offset_ms,
        )
    if instagram_needs_carousel:
        payloads["instagram_carousel"] = instagram_carousel_payload(
            content=bundle.instagram_caption,
            account_id=str(instagram_account_id),
            image_urls=[item["url"] for item in instagram_carousel_items],
            publish_now=publish_now,
        )
    if "threads" in platforms:
        payloads["threads"] = threads_media_payload(
            content=bundle.threads_caption,
            account_id=str(threads_account_id),
            media_items=threads_media_items,
            publish_now=publish_now,
            topic_tag=args.topic_tag,
        )

    if args.dry_run:
        for platform, body in payloads.items():
            print(f"--- {platform} payload ---")
            print(json.dumps(body, ensure_ascii=False, indent=2))
        return 0

    existing_state = read_publish_state(bundle.publish_state_path)
    state: dict[str, Any] = {
        **existing_state,
        "updatedAt": datetime.now(timezone.utc).astimezone().isoformat(),
        "mode": "dry-run" if args.dry_run else ("publish-now" if args.now else "draft"),
        "bundle": str(bundle.root),
        "media": {
            "path": str(bundle.reel_path),
            "publicUrl": video_url,
            "type": "video",
        },
        "platforms": existing_state.get("platforms", {}),
    }
    state.setdefault("createdAt", state["updatedAt"])
    if manual_instagram_dir:
        state["platforms"]["instagram"] = {
            "status": "manual-required",
            "reason": "Instagram platform music cannot be added through the API",
            "manualPackage": str(manual_instagram_dir),
        }

    for platform, body in payloads.items():
        response = client.create_post(body)
        state["platforms"][platform] = {
            "status": "submitted",
            "postId": _post_id(response),
            "response": response,
        }
        print(f"[zernio-publish] {platform} submitted postId={state['platforms'][platform]['postId']}")

    if uploaded_video:
        state["media"]["contentType"] = uploaded_video.content_type
        state["media"]["path"] = str(uploaded_video.path)
    if uploaded_instagram_reel_cover:
        state["instagramReelThumbnail"] = {
            "path": str(uploaded_instagram_reel_cover.path),
            "publicUrl": uploaded_instagram_reel_cover.public_url,
            "contentType": uploaded_instagram_reel_cover.content_type,
        }
    if uploaded_threads_images:
        state["threadsCarouselMedia"] = [
            {
                "path": str(uploaded.path),
                "publicUrl": uploaded.public_url,
                "contentType": uploaded.content_type,
            }
            for uploaded in uploaded_threads_images
        ]
    if uploaded_instagram_carousel_images:
        state["instagramCarouselMedia"] = [
            {
                "path": str(uploaded.path),
                "publicUrl": uploaded.public_url,
                "contentType": uploaded.content_type,
            }
            for uploaded in uploaded_instagram_carousel_images
        ]
    write_publish_state(bundle.publish_state_path, state)
    print(f"[zernio-publish] state → {bundle.publish_state_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
