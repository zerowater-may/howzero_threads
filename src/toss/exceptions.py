class TossInvestError(Exception):
    """Base exception for TossInvest Open API client errors."""


class TossInvestConfigError(TossInvestError):
    """Raised when required client configuration is missing."""


class TossInvestOAuthError(TossInvestError):
    def __init__(
        self,
        error: str,
        error_description: str | None = None,
        status_code: int | None = None,
    ) -> None:
        self.error = error
        self.error_description = error_description
        self.status_code = status_code
        message = error
        if error_description:
            message = f"{message}: {error_description}"
        super().__init__(f"[{status_code}] {message}")


class TossInvestAPIError(TossInvestError):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        request_id: str | None = None,
        data: dict | None = None,
        headers: dict | None = None,
    ) -> None:
        self.status_code = status_code
        self.code = code
        self.message = message
        self.request_id = request_id
        self.data = data
        self.headers = headers or {}

        request_part = f" requestId={request_id}" if request_id else ""
        super().__init__(f"[{status_code}] {code}: {message}{request_part}")
