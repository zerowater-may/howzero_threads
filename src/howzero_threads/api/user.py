import logging

from howzero_threads.api.client import ThreadsClient

logger = logging.getLogger("howzero_threads.api.user")

THREAD_FIELDS = "id,media_type,media_url,permalink,text,timestamp,username,like_count,reply_count"


def get_user_threads(
    client: ThreadsClient,
    limit: int = 25,
) -> list[dict]:
    """사용자의 최근 쓰레드 목록을 조회한다."""
    user_id = client.settings.threads_user_id
    data = client.get(
        f"{user_id}/threads",
        params={"fields": THREAD_FIELDS, "limit": limit},
    )
    threads = data.get("data", [])
    logger.info("쓰레드 %d건 조회", len(threads))
    return threads


def get_user_profile(client: ThreadsClient) -> dict:
    """사용자 프로필 정보를 조회한다."""
    user_id = client.settings.threads_user_id
    return client.get(
        user_id,
        params={"fields": "id,username,threads_profile_picture_url,threads_biography"},
    )
