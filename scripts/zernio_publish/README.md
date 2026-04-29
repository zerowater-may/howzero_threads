# zernio_publish workflow

zipsaja 번들을 Zernio API로 Instagram/Threads에 게시한다.

## 원칙

- Instagram 플랫폼 음악을 앱에서 고를 필요가 있으면 API 게시를 쓰지 않는다.
- API 게시를 할 Reels는 오디오가 영상 파일에 미리 들어 있어야 한다.
- Reels는 1080x1920, 9:16, H.264, 30fps를 기준으로 한다. 화면 UI/그리드 crop 때문에 `*-ig-safe.mp4`처럼 핵심 텍스트를 중앙 4:5 안쪽에 둔 파일을 우선 사용한다.
- 신규 번들은 30초 Reel을 표준으로 한다. 22초 Reel은 30초 파일이 없는 legacy 번들에서만 fallback으로 쓴다.
- Reels 커버는 `publish-ready/instagram-reel-cover.png`를 1080x1920으로 만들고, Zernio `instagramThumbnail`로 업로드한다. 커버가 없으면 `--instagram-thumb-offset-ms` 프레임을 썸네일로 쓴다.
- 이미지 캐러셀은 1080x1350, 4:5를 기준으로 한다. 오디오를 담을 수 없으므로 음악 없이 Feed carousel로 게시한다.
- Threads는 이미지 캐러셀 또는 영상 중 선택한다. 기본 운영은 이미지 캐러셀이며 본문은 2~3줄 훅만 쓴다. 해시태그는 본문에 넣지 않고 `topic_tag`로 처리한다.

## 산출물 규칙

```text
brands/zipsaja/zipsaja_pipeline_<slug>/
├── reels/
│   ├── zipsaja-reel-30s.mp4
│   ├── zipsaja-reel-30s-audio-mapped.mp4
│   └── zipsaja-reel-30s-audio-mapped-ig-safe.mp4 # Instagram Reels API 게시용 우선 파일
├── carousel/
│   └── slide-01.png ...
├── publish-ready/
│   ├── instagram-carousel/slide-01.png ... # 1080x1350 feed carousel
│   ├── instagram-reel-cover.png            # 1080x1920 custom Reel cover
│   └── threads-carousel/slide-01.png ...   # 1080x1350 Threads carousel
└── publish-state.json
```

## 게시 명령

계정 확인:

```bash
set -a; source .env; set +a
python3 -m scripts.zernio_publish \
  brands/zipsaja/zipsaja_pipeline_<slug> \
  --list-accounts
```

Instagram Reels:

```bash
set -a; source .env; set +a
python3 -m scripts.zernio_publish \
  brands/zipsaja/zipsaja_pipeline_<slug> \
  --platform instagram \
  --instagram-media reel \
  --now
```

Instagram Carousel:

```bash
set -a; source .env; set +a
python3 -m scripts.zernio_publish \
  brands/zipsaja/zipsaja_pipeline_<slug> \
  --platform instagram \
  --instagram-media carousel \
  --now
```

Threads 이미지 캐러셀:

```bash
set -a; source .env; set +a
python3 -m scripts.zernio_publish \
  brands/zipsaja/zipsaja_pipeline_<slug> \
  --platform threads \
  --threads-media carousel \
  --now
```

전체 dry-run:

```bash
python3 -m scripts.zernio_publish \
  brands/zipsaja/zipsaja_pipeline_<slug> \
  --platform instagram \
  --instagram-media both \
  --dry-run
```

`--dry-run`은 API 키 없이 payload만 출력하며 `publish-state.json`을 변경하지 않는다.

## 중복 보호 대응

Zernio가 아래 409를 반환하면 같은 본문/미디어 조합이 이미 생성된 것이다.

```text
This exact content is already scheduled, publishing, or was posted to this account within the last 24 hours.
```

1. 응답의 `details.existingPostId`를 기록한다.
2. 같은 payload를 반복 제출하지 않는다.
3. `GET /posts/<existingPostId>`로 상태를 조회한다. `publishing/processing`이면 Zernio나 플랫폼 API가 처리 중인 상태다.
4. 사용자가 재업로드를 지시하면 `captions/instagram.txt` 또는 `captions/threads.txt`를 먼저 바꾼다. 첫 문장, 문장 순서, CTA가 달라져야 한다.
5. 재제출은 `reel`, `carousel`, `threads`를 개별 명령으로 실행한다. 하나가 막혀도 나머지 업로드를 계속 진행하기 위해서다.

상태 조회 예시:

```bash
set -a; source .env; set +a
python3 - <<'PY'
import os
from scripts.zernio_publish.client import ZernioClient

client = ZernioClient(os.environ["ZERNIO_API_KEY"])
for post_id in ["POST_ID_1", "POST_ID_2"]:
    post = client._request("GET", f"/posts/{post_id}", timeout=60)["post"]
    platform = post.get("platforms", [{}])[0]
    print(post_id, post.get("status"), platform.get("status"), len(post.get("mediaItems") or []))
PY
```

## 상태 기록 기준

- `published/published`: 게시 완료.
- `publishing/processing`: post record는 생성됐고 플랫폼 처리 중. 30-60초 후 다시 조회한다.
- `publishedUrl`은 null일 수 있다. 공개 URL이 없어도 postId와 상태를 `publish-state.json`에 남긴다.
- `publish-state.json`에는 platform별 `postId`, `status`, `platformStatus`, `mediaCount`, `scheduledFor`, `updatedAt`을 기록한다.
