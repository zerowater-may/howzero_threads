---
name: zipsaja-publish
description: "Use when the user asks to post, upload, schedule, publish, or dry-run a completed zipsaja pipeline bundle to Instagram or Threads through Zernio."
---

# zipsaja Publish

Post a completed zipsaja bundle through Zernio. Publishing is explicit; do not run it unless the user asks.

## Preconditions

- Bundle state is `status="completed"`.
- `ZERNIO_API_KEY` is in the environment, not written to files.
- Instagram/Threads connected accounts are visible through `--list-accounts`.
- Use `scripts/zernio_publish/README.md` for command details.

## Media Rules

- Instagram Reels: upload `reels/zipsaja-reel-30s-audio-mapped-ig-safe.mp4` when present. If no 30s reel exists, treat `22s` files as legacy fallback. The video must be 1080x1920, 9:16, H.264, 30fps, SAR 1:1.
- Reels music: Instagram API cannot add platform music. External audio must be baked into the video before upload.
- Reels cover: upload `publish-ready/instagram-reel-cover.png` as `instagramThumbnail`; expected size 1080x1920.
- Instagram Carousel: upload `publish-ready/instagram-carousel/slide-*.png`; expected size 1080x1350. Image carousel cannot carry audio.
- Threads: default to `publish-ready/threads-carousel/slide-*.png`; use `--threads-media video` only when requested. Body copy must be only `captions/threads.txt`: 2-3 lines, no hashtags, no summary paragraph.

## Commands

```bash
python3 -m scripts.zernio_publish <bundle> --list-accounts
python3 -m scripts.zernio_publish <bundle> --platform instagram --instagram-media both --dry-run
python3 -m scripts.zernio_publish <bundle> --platform threads --threads-media carousel --dry-run
```

Publish:

```bash
python3 -m scripts.zernio_publish <bundle> --platform instagram --instagram-media both --now
python3 -m scripts.zernio_publish <bundle> --platform threads --threads-media carousel --now
```

## After Publishing

- Confirm `publish-state.json` contains the platform post IDs and URLs.
- Do not duplicate-post to fix media. If a live post is wrong, ask whether to delete/repost or leave it.
