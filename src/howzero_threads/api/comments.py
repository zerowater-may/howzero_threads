import logging

from howzero_threads.api.client import ThreadsClient

logger = logging.getLogger("howzero_threads.api.comments")

COMMENT_FIELDS = "id,permalink,username,timestamp,text,hidden"


def get_comments(
    client: ThreadsClient,
    media_id: str,
    include_hidden: bool = False,
) -> list[dict]:
    """특정 게시물의 전체 댓글을 조회한다. 커서 기반 페이지네이션."""
    all_comments = []
    endpoint = f"{media_id}/conversation"
    params = {"fields": COMMENT_FIELDS}

    while True:
        data = client.get(endpoint, params=params)
        comments = data.get("data", [])

        if not include_hidden:
            comments = [
                c for c in comments if not c.get("hidden", False)
            ]

        all_comments.extend(comments)
        logger.info(
            "댓글 %d건 수집 (누적 %d건)", len(comments), len(all_comments)
        )

        paging = data.get("paging", {})
        cursors = paging.get("cursors", {})
        after = cursors.get("after")

        if not after or "next" not in paging:
            break

        params = {"fields": COMMENT_FIELDS, "after": after}

    return all_comments


def get_replies(client: ThreadsClient, comment_id: str) -> list[dict]:
    """특정 댓글의 대댓글을 조회한다."""
    endpoint = f"{comment_id}/replies"
    params = {"fields": COMMENT_FIELDS}
    data = client.get(endpoint, params=params)
    return data.get("data", [])
