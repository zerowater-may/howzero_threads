import re

SENSITIVE_PARAMS = ["access_token", "client_secret"]


def sanitize_url(url: str) -> str:
    for param in SENSITIVE_PARAMS:
        url = re.sub(rf"{param}=[^&\s]+", f"{param}=[REDACTED]", url)
    return url


class ThreadsAPIError(Exception):
    def __init__(
        self,
        message: str,
        status_code: int | None = None,
        url: str = "",
    ):
        self.status_code = status_code
        self.url = sanitize_url(url)
        safe_message = sanitize_url(message)
        super().__init__(f"[{status_code}] {safe_message}")
