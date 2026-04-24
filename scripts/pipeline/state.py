"""PipelineState dataclass + JSON persistence.

Mirrors the StateStore pattern from src/howzero_threads/store/state.py but with
fields tailored for the /pipeline skill (brand, topic, slug, data block, artifacts).
"""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional


@dataclass
class PipelineState:
    pipeline_id: str
    brand: str
    topic: str
    slug: str
    created_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).astimezone().isoformat()
    )
    status: str = "pending"
    failed_at: Optional[str] = None
    failed_reason: Optional[str] = None
    data: Optional[dict[str, Any]] = None
    tone: Optional[dict[str, Any]] = None
    artifacts: dict[str, Any] = field(default_factory=dict)

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(
            json.dumps(asdict(self), ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    @classmethod
    def load(cls, path: Path) -> "PipelineState":
        raw = json.loads(path.read_text(encoding="utf-8"))
        return cls(**raw)

    def mark_failed(self, step: str, reason: str) -> None:
        self.status = "failed"
        self.failed_at = step
        self.failed_reason = reason
