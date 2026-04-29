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
python3 -m scripts.zernio_publish <bundle> --platform instagram --instagram-media reel --dry-run
python3 -m scripts.zernio_publish <bundle> --platform instagram --instagram-media carousel --dry-run
python3 -m scripts.zernio_publish <bundle> --platform threads --threads-media carousel --dry-run
```

Publish:

```bash
python3 -m scripts.zernio_publish <bundle> --platform instagram --instagram-media reel --now
python3 -m scripts.zernio_publish <bundle> --platform instagram --instagram-media carousel --now
python3 -m scripts.zernio_publish <bundle> --platform threads --threads-media carousel --now
```

Submit Instagram Reels, Instagram Carousel, and Threads as separate commands in production. `--instagram-media both` is acceptable for a dry run or a low-risk first attempt, but one Zernio error stops the combined command before later payloads run.

## Duplicate Protection

Zernio may reject a create request with `409` and:

```text
This exact content is already scheduled, publishing, or was posted to this account within the last 24 hours.
```

- Treat `details.existingPostId` as the canonical post to inspect; do not keep retrying the same payload.
- Query the existing post and record its status. `publishing/processing` means the post exists and is still being handled by Zernio/platform APIs.
- If the user explicitly wants another upload, rewrite `captions/instagram.txt` and/or `captions/threads.txt` before resubmitting. Change the opening hook, sentence order, and CTA; whitespace-only or punctuation-only edits are not enough.
- Instagram Reel and Instagram Carousel both use `captions/instagram.txt`; update it before resubmitting either Instagram format.

Status check snippet:

```bash
set -a; source .env; set +a
python3 - <<'PY'
import os
from scripts.zernio_publish.client import ZernioClient

client = ZernioClient(os.environ["ZERNIO_API_KEY"])
for post_id in ["POST_ID"]:
    post = client._request("GET", f"/posts/{post_id}", timeout=60)["post"]
    platform = post.get("platforms", [{}])[0]
    print(post_id, post.get("status"), platform.get("status"))
PY
```

## After Publishing

- Confirm `publish-state.json` contains platform post IDs, statuses, media counts, and timestamps.
- Report `published` only when Zernio returns post status and platform status as `published`.
- If a post remains `publishing/processing`, say it is submitted and still processing; poll again after 30-60 seconds when the user is waiting on it.
- Do not duplicate-post to fix media. If a live post is wrong, ask whether to delete/repost or leave it.
