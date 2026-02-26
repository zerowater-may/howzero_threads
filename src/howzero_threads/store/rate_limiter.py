import json
import time
from pathlib import Path


class RateLimiter:
    """24시간 윈도우 기반 파일 영속 Rate Limiter."""

    def __init__(
        self,
        rate_limit_file: str = "data/rate_limit.json",
        max_requests: int = 250,
    ):
        self.path = Path(rate_limit_file)
        self.max_requests = max_requests
        self.window = 24 * 3600
        self._load()

    def _load(self) -> None:
        if self.path.exists():
            data = json.loads(self.path.read_text())
            self.timestamps: list[float] = data.get("timestamps", [])
        else:
            self.timestamps = []

    def _save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps({"timestamps": self.timestamps}))

    def _cleanup(self) -> None:
        cutoff = time.time() - self.window
        self.timestamps = [t for t in self.timestamps if t > cutoff]

    def can_post(self) -> bool:
        self._cleanup()
        return len(self.timestamps) < self.max_requests

    def record(self) -> None:
        self.timestamps.append(time.time())
        self._save()

    def remaining(self) -> int:
        self._cleanup()
        return max(0, self.max_requests - len(self.timestamps))
