import json
from pathlib import Path


class StateStore:
    """파이프라인 실행 상태를 JSON 파일에 저장한다."""

    def __init__(self, state_file: str = "data/state.json"):
        self.path = Path(state_file)
        self._data = self._load()

    def _load(self) -> dict:
        if self.path.exists():
            return json.loads(self.path.read_text())
        return {}

    def _save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(self._data, indent=2))

    def get_last_timestamp(self, media_id: str) -> str | None:
        return self._data.get(f"last_ts:{media_id}")

    def set_last_timestamp(self, media_id: str, timestamp: str) -> None:
        self._data[f"last_ts:{media_id}"] = timestamp
        self._save()

    def get(self, key: str, default=None):
        return self._data.get(key, default)

    def set(self, key: str, value) -> None:
        self._data[key] = value
        self._save()
