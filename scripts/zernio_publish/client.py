from __future__ import annotations

import json
import mimetypes
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any


BASE_URL = "https://zernio.com/api/v1"


class ZernioError(RuntimeError):
    pass


@dataclass(frozen=True)
class UploadedMedia:
    path: Path
    public_url: str
    media_type: str
    content_type: str


class ZernioClient:
    def __init__(self, api_key: str, *, base_url: str = BASE_URL):
        if not api_key:
            raise ZernioError("ZERNIO_API_KEY is required")
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def _request(self, method: str, path: str, *, timeout: int = 60, **kwargs: Any) -> Any:
        request_body = kwargs.get("json")
        body = (
            json.dumps(request_body, ensure_ascii=False).encode("utf-8")
            if request_body is not None
            else None
        )
        request = urllib.request.Request(
            f"{self.base_url}{path}",
            data=body,
            headers=self._headers(),
            method=method,
        )
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                text = response.read().decode("utf-8")
        except urllib.error.HTTPError as error:
            text = error.read().decode("utf-8", errors="replace")
            raise ZernioError(f"Zernio {method} {path} failed: {error.code} {text}") from error

        if not text:
            return {}
        return json.loads(text)

    def list_accounts(self) -> list[dict[str, Any]]:
        payload = self._request("GET", "/accounts")
        return payload.get("accounts", payload.get("data", []))

    def presign_media(self, path: Path, content_type: str) -> dict[str, Any]:
        payload = {
            "filename": path.name,
            "contentType": content_type,
            "size": path.stat().st_size,
        }
        try:
            return self._request("POST", "/media/presign", json=payload)
        except ZernioError:
            # Quickstart examples use camel names. Keep a fallback for API drift.
            fallback = {
                "fileName": path.name,
                "fileType": content_type,
                "size": path.stat().st_size,
            }
            return self._request("POST", "/media/presign", json=fallback)

    def upload_media(self, path: Path) -> UploadedMedia:
        content_type = detect_content_type(path)
        media_type = "video" if content_type.startswith("video/") else "image"
        presigned = self.presign_media(path, content_type)
        upload_url = presigned.get("uploadUrl") or presigned.get("upload_url")
        public_url = presigned.get("publicUrl") or presigned.get("public_url")
        if not upload_url or not public_url:
            raise ZernioError(f"Invalid presign response: {json.dumps(presigned, ensure_ascii=False)}")

        with path.open("rb") as file:
            request = urllib.request.Request(
                upload_url,
                data=file.read(),
                headers={"Content-Type": content_type},
                method="PUT",
            )
        try:
            with urllib.request.urlopen(request, timeout=600):
                pass
        except urllib.error.HTTPError as error:
            text = error.read().decode("utf-8", errors="replace")
            raise ZernioError(f"Media upload failed: {error.code} {text}") from error

        return UploadedMedia(
            path=path,
            public_url=public_url,
            media_type=media_type,
            content_type=content_type,
        )

    def create_post(self, body: dict[str, Any]) -> dict[str, Any]:
        return self._request("POST", "/posts", json=body, timeout=300)


def detect_content_type(path: Path) -> str:
    guessed, _ = mimetypes.guess_type(path.name)
    if guessed:
        return guessed
    suffix = path.suffix.lower()
    if suffix == ".mp4":
        return "video/mp4"
    if suffix == ".png":
        return "image/png"
    if suffix in {".jpg", ".jpeg"}:
        return "image/jpeg"
    raise ZernioError(f"Unsupported media file type: {path}")
