import json
import logging
import time
from pathlib import Path

import requests

from howzero_threads.config import Settings
from howzero_threads.exceptions import ThreadsAPIError

logger = logging.getLogger("howzero_threads.api.auth")


class TokenManager:
    REFRESH_URL = "https://graph.threads.net/refresh_access_token"
    EXCHANGE_URL = "https://graph.threads.net/access_token"

    def __init__(self, settings: Settings):
        self.settings = settings
        self.token_path = Path(settings.token_file)
        self._load_token_info()

    def _load_token_info(self) -> None:
        if self.token_path.exists():
            data = json.loads(self.token_path.read_text())
            self.access_token = data["access_token"]
            self.expires_at = data.get("expires_at", 0)
        else:
            self.access_token = self.settings.threads_access_token
            self.expires_at = 0

    def _save_token_info(self) -> None:
        self.token_path.parent.mkdir(parents=True, exist_ok=True)
        self.token_path.write_text(
            json.dumps(
                {
                    "access_token": self.access_token,
                    "expires_at": self.expires_at,
                }
            )
        )
        self.token_path.chmod(0o600)

    def exchange_long_lived_token(self) -> str:
        if not self.settings.threads_app_secret:
            raise ThreadsAPIError(
                "app_secret이 설정되지 않아 토큰 교환 불가",
                status_code=None,
            )
        resp = requests.get(
            self.EXCHANGE_URL,
            params={
                "grant_type": "th_exchange_token",
                "client_secret": self.settings.threads_app_secret,
                "access_token": self.access_token,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        self.access_token = data["access_token"]
        self.expires_at = int(time.time()) + data["expires_in"]
        self._save_token_info()
        logger.info("장기 토큰 교환 완료. 만료: %d초 후", data["expires_in"])
        return self.access_token

    def refresh_token(self) -> str:
        resp = requests.get(
            self.REFRESH_URL,
            params={
                "grant_type": "th_refresh_token",
                "access_token": self.access_token,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        self.access_token = data["access_token"]
        self.expires_at = int(time.time()) + data["expires_in"]
        self._save_token_info()
        logger.info("토큰 갱신 완료. 만료: %d초 후", data["expires_in"])
        return self.access_token

    def ensure_valid_token(self) -> str:
        SEVEN_DAYS = 7 * 24 * 3600
        if self.expires_at == 0:
            logger.warning("토큰 만료 시점 미확인. 갱신을 시도한다.")
            return self.refresh_token()
        remaining = self.expires_at - int(time.time())
        if remaining < SEVEN_DAYS:
            logger.info("토큰 만료 %d초 전. 갱신 실행.", remaining)
            return self.refresh_token()
        return self.access_token
