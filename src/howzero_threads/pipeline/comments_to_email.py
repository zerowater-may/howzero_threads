import logging

from howzero_threads.api.client import ThreadsClient
from howzero_threads.api.comments import get_comments
from howzero_threads.config import Settings
from howzero_threads.notifier.email import send_email
from howzero_threads.store.state import StateStore

logger = logging.getLogger("howzero_threads.pipeline.comments_to_email")


def run(
    media_id: str,
    client: ThreadsClient,
    settings: Settings | None = None,
) -> int:
    """댓글 수집 → 중복 필터 → 포맷팅 → 이메일 발송.
    반환: 새로 처리된 댓글 수
    """
    settings = settings or Settings()
    state = StateStore(settings.state_file)

    # 1. 전체 댓글 수집
    all_comments = get_comments(client, media_id, include_hidden=False)

    if not all_comments:
        logger.info("댓글 없음: media_id=%s", media_id)
        return 0

    # 2. 중복 필터링
    last_ts = state.get_last_timestamp(media_id)
    if last_ts:
        new_comments = [
            c for c in all_comments if c.get("timestamp", "") > last_ts
        ]
    else:
        new_comments = all_comments

    if not new_comments:
        logger.info("새 댓글 없음: media_id=%s", media_id)
        return 0

    # 3. 최신 timestamp 추출
    latest_ts = max(c.get("timestamp", "") for c in new_comments)

    # 4. 포맷팅
    threshold = settings.comments_summary_threshold
    if len(new_comments) > threshold:
        body_html = _format_summary(new_comments, threshold)
        subject = f"[Threads] 새 댓글 {len(new_comments)}건 (요약)"
    else:
        body_html = _format_table(new_comments)
        subject = f"[Threads] 새 댓글 {len(new_comments)}건"

    # 5. 이메일 발송 (성공 시에만 상태 갱신)
    try:
        send_email(subject, body_html, settings)
        state.set_last_timestamp(media_id, latest_ts)
        logger.info("파이프라인 완료: %d건 처리", len(new_comments))
    except Exception:
        logger.exception(
            "이메일 발송 실패. 다음 실행에서 재시도. media_id=%s", media_id
        )
        raise

    return len(new_comments)


def _format_table(comments: list[dict]) -> str:
    rows = ""
    for c in comments:
        username = c.get("username", "")
        text = c.get("text", "")
        timestamp = c.get("timestamp", "")
        permalink = c.get("permalink", "#")
        rows += (
            f"<tr>"
            f"<td><a href='{permalink}'>{username}</a></td>"
            f"<td>{text}</td>"
            f"<td>{timestamp}</td>"
            f"</tr>"
        )
    return (
        "<table border='1' cellpadding='8' cellspacing='0'>"
        "<tr><th>사용자</th><th>댓글</th><th>시간</th></tr>"
        f"{rows}</table>"
    )


def _format_summary(comments: list[dict], threshold: int) -> str:
    top = comments[:threshold]
    table = _format_table(top)
    summary = (
        f"<p>전체 {len(comments)}건 중 최신 {threshold}건 표시. "
        f"나머지 {len(comments) - threshold}건 생략.</p>"
    )
    return summary + table
