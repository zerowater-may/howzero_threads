from dataclasses import dataclass, field
from typing import Literal, Optional

HighlightKind = Literal["heatmap_peak", "chapter", "transcript_fallback"]
SourceType = Literal["heatmap", "chapters", "transcript_fallback"]


@dataclass(frozen=True)
class TranscriptSegment:
    t: float  # start seconds
    d: float  # duration seconds
    text: str

    def end(self) -> float:
        return self.t + self.d


@dataclass(frozen=True)
class Scene:
    index: int
    start: float
    end: float

    def contains(self, ts: float) -> bool:
        return self.start <= ts < self.end


@dataclass
class HighlightSpan:
    rank: int
    start: float
    end: float
    score: float
    kind: HighlightKind
    chapter: Optional[str] = None
    transcript: list[TranscriptSegment] = field(default_factory=list)
    frames: list[str] = field(default_factory=list)

    def duration(self) -> float:
        return self.end - self.start
