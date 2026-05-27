"""
네이버 카페 대문 배너 PNG 2장을 bulsaja B2 버킷에 업로드하고
placeholder HTML 의 IMG_*_URL 토큰을 CDN URL 로 swap 한 최종 HTML 을 출력한다.

B2 자격증명은 bulsaja-issue 의 bulsa_product_analytics/.env 에서 읽는다.

usage:
    python3 scripts/naver_cafe_banner/upload_to_b2.py
"""

import os
from pathlib import Path

import boto3
from botocore.config import Config
from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
BULSAJA_ENV = Path(
    "/Users/zerowater/Dropbox/zerowater/firelion/bulsaja/bulsaja-issue/bulsa_product_analytics/.env"
)

# 업로드할 PNG 와 B2 key (deterministic — re-upload 시 같은 URL 유지)
UPLOADS = [
    {
        "local": REPO_ROOT / "brands/braveyong/braveyong_misc_naver-cafe-banner.png",
        "key": "naver-cafe-banner/2026-05-27/braveyong.png",
        "token": "IMG_BRAVEYONG_URL",
    },
    {
        "local": REPO_ROOT / "brands/bulsaja/bulsaja_misc_naver-cafe-banner.png",
        "key": "naver-cafe-banner/2026-05-27/bulsaja.png",
        "token": "IMG_BULSAJA_URL",
    },
]

SOURCE_HTML = REPO_ROOT / "brands/howzero/howzero_misc_naver-cafe-bulsaja-renewal.html"
OUTPUT_HTML = REPO_ROOT / "brands/howzero/howzero_misc_naver-cafe-bulsaja-renewal-final.html"


def main():
    load_dotenv(BULSAJA_ENV)

    endpoint = os.getenv("B2_ENDPOINT")
    key_id = os.getenv("B2_KEY_ID")
    app_key = os.getenv("B2_APP_KEY")
    bucket = os.getenv("B2_BUCKET_NAME")
    region = os.getenv("B2_REGION")
    cdn = os.getenv("CDN_DOMAIN", "").rstrip("/")

    missing = [k for k, v in {
        "B2_ENDPOINT": endpoint,
        "B2_KEY_ID": key_id,
        "B2_APP_KEY": app_key,
        "B2_BUCKET_NAME": bucket,
        "CDN_DOMAIN": cdn,
    }.items() if not v]
    if missing:
        raise SystemExit(f"missing env: {missing} (source: {BULSAJA_ENV})")

    client = boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=key_id,
        aws_secret_access_key=app_key,
        region_name=region,
        config=Config(retries={"max_attempts": 2}),
    )

    template = SOURCE_HTML.read_text(encoding="utf-8")

    for item in UPLOADS:
        local: Path = item["local"]
        if not local.exists():
            raise SystemExit(f"local file missing: {local}")
        size_kb = local.stat().st_size / 1024
        print(f"uploading {local.name} ({size_kb:.1f} KB) → s3://{bucket}/{item['key']}")
        with open(local, "rb") as f:
            client.put_object(
                Bucket=bucket,
                Key=item["key"],
                Body=f.read(),
                ContentType="image/png",
                CacheControl="public, max-age=31536000, immutable",
            )
        url = f"{cdn}/{item['key']}"
        item["url"] = url
        template = template.replace(item["token"], url)
        print(f"   → {url}")

    OUTPUT_HTML.write_text(template, encoding="utf-8")
    print(f"\nwrote {OUTPUT_HTML} ({OUTPUT_HTML.stat().st_size:,} bytes)")
    print("\n=== 카페에 붙여넣을 URL 요약 ===")
    for item in UPLOADS:
        print(f"  {item['token']}: {item['url']}")


if __name__ == "__main__":
    main()
