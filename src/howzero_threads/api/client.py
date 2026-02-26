import logging

import requests

from howzero_threads.config import Settings
from howzero_threads.exceptions import ThreadsAPIError, sanitize_url

logger = logging.getLogger("howzero_threads.api.client")


class ThreadsClient:
    def __init__(self, settings: Settings | None = None):
        self.settings = settings or Settings()
        self.base_url = self.settings.api_base_url
        self.session = requests.Session()
        self.session.params = {
            "access_token": self.settings.threads_access_token,
        }

    def _request(self, method: str, endpoint: str, **kwargs) -> dict:
        url = f"{self.base_url}/{endpoint}"
        try:
            resp = self.session.request(method, url, **kwargs)
            resp.raise_for_status()
            return resp.json()
        except requests.HTTPError as e:
            raise ThreadsAPIError(
                message=str(e),
                status_code=resp.status_code,
                url=url,
            ) from None

    def get(self, endpoint: str, params: dict | None = None) -> dict:
        return self._request("GET", endpoint, params=params or {})

    def post(self, endpoint: str, data: dict | None = None) -> dict:
        return self._request("POST", endpoint, data=data or {})

    def update_access_token(self, new_token: str) -> None:
        self.settings.threads_access_token = new_token
        self.session.params["access_token"] = new_token
