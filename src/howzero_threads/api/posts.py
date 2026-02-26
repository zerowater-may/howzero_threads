import logging
import time

from howzero_threads.api.client import ThreadsClient

logger = logging.getLogger("howzero_threads.api.posts")


def create_post(
    client: ThreadsClient,
    text: str,
    image_url: str | None = None,
    reply_to_id: str | None = None,
) -> dict:
    """Threads에 포스트를 게시한다. 2단계: container 생성 → publish."""
    user_id = client.settings.threads_user_id

    # Step 1: container 생성
    container_data = {"text": text, "media_type": "TEXT"}

    if image_url:
        container_data["media_type"] = "IMAGE"
        container_data["image_url"] = image_url

    if reply_to_id:
        container_data["reply_to_id"] = reply_to_id

    container = client.post(f"{user_id}/threads", data=container_data)
    container_id = container["id"]
    logger.info("Container 생성: %s", container_id)

    # Step 2: publish (약간의 딜레이 후)
    time.sleep(2)
    result = client.post(
        f"{user_id}/threads_publish",
        data={"creation_id": container_id},
    )
    logger.info("포스트 게시 완료: %s", result.get("id", ""))
    return result


def get_post(client: ThreadsClient, media_id: str) -> dict:
    """특정 포스트의 정보를 조회한다."""
    fields = "id,media_type,media_url,permalink,text,timestamp,username,like_count,reply_count"
    return client.get(media_id, params={"fields": fields})
