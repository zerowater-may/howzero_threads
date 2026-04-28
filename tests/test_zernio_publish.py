from pathlib import Path

import pytest

from scripts.zernio_publish.bundle import PublishBundle, load_bundle
from scripts.zernio_publish.client import detect_content_type
from scripts.zernio_publish.payloads import (
    find_account_id,
    instagram_carousel_payload,
    instagram_reel_payload,
    threads_media_payload,
    threads_video_payload,
)


def test_detect_content_type_for_supported_media():
    assert detect_content_type(Path("reel.mp4")) == "video/mp4"
    assert detect_content_type(Path("slide.png")) == "image/png"


def test_find_account_id_uses_single_platform_match():
    accounts = [
        {"_id": "acc_ig", "platform": "instagram", "username": "zipsaja_"},
        {"_id": "acc_threads", "platform": "threads", "username": "zipsaja_"},
    ]

    assert find_account_id(accounts, "instagram") == "acc_ig"
    assert find_account_id(accounts, "threads", preferred_handle="zipsaja_") == "acc_threads"


def test_find_account_id_requires_env_when_ambiguous():
    accounts = [
        {"_id": "acc_1", "platform": "instagram", "username": "one"},
        {"_id": "acc_2", "platform": "instagram", "username": "two"},
    ]

    with pytest.raises(RuntimeError, match="Multiple instagram accounts"):
        find_account_id(accounts, "instagram")


def test_instagram_payload_is_reel():
    payload = instagram_reel_payload(
        content="caption",
        account_id="acc_ig",
        video_url="https://cdn.example.com/reel.mp4",
        publish_now=True,
        first_comment="comment",
        instagram_thumbnail_url="https://cdn.example.com/cover.png",
        thumb_offset_ms=10500,
    )

    platform = payload["platforms"][0]
    assert payload["publishNow"] is True
    assert payload["mediaItems"] == [{"type": "video", "url": "https://cdn.example.com/reel.mp4"}]
    assert platform["platform"] == "instagram"
    assert platform["platformSpecificData"]["contentType"] == "reels"
    assert platform["platformSpecificData"]["shareToFeed"] is True
    assert platform["platformSpecificData"]["firstComment"] == "comment"
    assert platform["platformSpecificData"]["instagramThumbnail"] == "https://cdn.example.com/cover.png"
    assert "thumbOffset" not in platform["platformSpecificData"]


def test_instagram_reel_payload_uses_thumb_offset_without_custom_cover():
    payload = instagram_reel_payload(
        content="caption",
        account_id="acc_ig",
        video_url="https://cdn.example.com/reel.mp4",
        publish_now=True,
        thumb_offset_ms=10500,
    )

    platform_data = payload["platforms"][0]["platformSpecificData"]
    assert platform_data["thumbOffset"] == 10500
    assert "instagramThumbnail" not in platform_data


def test_instagram_carousel_payload_omits_content_type_for_feed_post():
    payload = instagram_carousel_payload(
        content="caption",
        account_id="acc_ig",
        image_urls=[
            "https://cdn.example.com/slide-01.png",
            "https://cdn.example.com/slide-02.png",
        ],
        publish_now=True,
    )

    assert payload["publishNow"] is True
    assert payload["mediaItems"][0]["type"] == "image"
    assert len(payload["mediaItems"]) == 2
    assert payload["platforms"][0]["platform"] == "instagram"
    assert "platformSpecificData" not in payload["platforms"][0]


def test_threads_payload_has_topic_tag():
    payload = threads_video_payload(
        content="caption",
        account_id="acc_threads",
        video_url="https://cdn.example.com/reel.mp4",
        publish_now=False,
        topic_tag="부동산",
    )

    assert "publishNow" not in payload
    assert payload["platforms"][0]["platformSpecificData"]["topic_tag"] == "부동산"


def test_threads_media_payload_supports_image_carousel():
    payload = threads_media_payload(
        content="caption",
        account_id="acc_threads",
        media_items=[
            {"type": "image", "url": "https://cdn.example.com/slide-01.png"},
            {"type": "image", "url": "https://cdn.example.com/slide-02.png"},
        ],
        publish_now=True,
        topic_tag="부동산",
    )

    assert payload["publishNow"] is True
    assert payload["mediaItems"][0]["type"] == "image"
    assert len(payload["mediaItems"]) == 2


def test_load_bundle_requires_completed_state(tmp_path):
    bundle = tmp_path / "bundle"
    (bundle / "reels").mkdir(parents=True)
    (bundle / "captions").mkdir()
    (bundle / "reels" / "zipsaja-reel-30s.mp4").write_bytes(b"mp4")
    (bundle / "captions" / "instagram.txt").write_text("ig", encoding="utf-8")
    (bundle / "captions" / "threads.txt").write_text("threads", encoding="utf-8")
    (bundle / "pipeline-state.json").write_text('{"status": "qa-pending"}', encoding="utf-8")

    with pytest.raises(RuntimeError, match="completed"):
        load_bundle(bundle)


def test_bundle_prefers_safe_audio_mapped_reel_and_cover(tmp_path):
    root = tmp_path / "bundle"
    (root / "reels").mkdir(parents=True)
    (root / "captions").mkdir()
    (root / "publish-ready").mkdir()
    reel = root / "reels" / "zipsaja-reel-30s.mp4"
    audio = root / "reels" / "zipsaja-reel-30s-audio-mapped.mp4"
    safe = root / "reels" / "zipsaja-reel-30s-audio-mapped-ig-safe.mp4"
    cover = root / "publish-ready" / "instagram-reel-cover.png"
    for path in (reel, audio, safe, cover):
        path.write_bytes(b"x")

    bundle = PublishBundle(
        root=root,
        reel_path=reel,
        instagram_caption_path=root / "captions" / "instagram.txt",
        threads_caption_path=root / "captions" / "threads.txt",
        state_path=root / "pipeline-state.json",
        publish_state_path=root / "publish-state.json",
    )

    assert bundle.audio_mapped_reel_path == safe
    assert bundle.instagram_reel_cover_path == cover


def test_load_bundle_prefers_30s_reel_but_accepts_22s_fallback(tmp_path):
    root = tmp_path / "bundle"
    (root / "reels").mkdir(parents=True)
    (root / "captions").mkdir()
    (root / "reels" / "zipsaja-reel-22s.mp4").write_bytes(b"legacy")
    (root / "captions" / "instagram.txt").write_text("ig", encoding="utf-8")
    (root / "captions" / "threads.txt").write_text("threads", encoding="utf-8")
    (root / "pipeline-state.json").write_text('{"status": "completed"}', encoding="utf-8")

    bundle = load_bundle(root)
    assert bundle.reel_path.name == "zipsaja-reel-22s.mp4"

    (root / "reels" / "zipsaja-reel-30s.mp4").write_bytes(b"new")

    bundle = load_bundle(root)
    assert bundle.reel_path.name == "zipsaja-reel-30s.mp4"


def test_bundle_does_not_prefer_legacy_audio_when_30s_reel_exists(tmp_path):
    root = tmp_path / "bundle"
    (root / "reels").mkdir(parents=True)
    (root / "captions").mkdir()
    reel = root / "reels" / "zipsaja-reel-30s.mp4"
    legacy_safe = root / "reels" / "zipsaja-reel-22s-audio-mapped-ig-safe.mp4"
    reel.write_bytes(b"new")
    legacy_safe.write_bytes(b"legacy")

    bundle = PublishBundle(
        root=root,
        reel_path=reel,
        instagram_caption_path=root / "captions" / "instagram.txt",
        threads_caption_path=root / "captions" / "threads.txt",
        state_path=root / "pipeline-state.json",
        publish_state_path=root / "publish-state.json",
    )

    assert bundle.audio_mapped_reel_path == reel
