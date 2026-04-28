"""Zipsaja tone enforcement — 반말 / 친구톤 / 도발·이모지 금지."""
import re
from dataclasses import dataclass

POLITE_PATTERNS = [r"습니다\b", r"입니다\b", r"여러분", r"당신", r"안녕하세요"]
PROVOCATION_PATTERNS = [
    r"끝났다", r"망한다", r"\d+%가 모른", r"비밀", r"충격",
    r"폭락", r"폭등 한다", r"무조건",
]
EMOJI_PATTERN = re.compile(
    "["
    "\U0001F300-\U0001FAFF"
    "\U0001F600-\U0001F64F"
    "☀-➿"
    "]+", flags=re.UNICODE
)


@dataclass
class Violation:
    kind: str
    match: str
    pos: int


class ToneViolation(Exception):
    pass


def check_tone(text: str) -> list[Violation]:
    violations: list[Violation] = []
    for p in POLITE_PATTERNS:
        for m in re.finditer(p, text):
            violations.append(Violation("polite", m.group(0), m.start()))
    for p in PROVOCATION_PATTERNS:
        for m in re.finditer(p, text):
            violations.append(Violation("provocation", m.group(0), m.start()))
    for m in EMOJI_PATTERN.finditer(text):
        violations.append(Violation("emoji", m.group(0), m.start()))
    return violations


def check_tone_strict(text: str) -> None:
    vs = check_tone(text)
    if vs:
        raise ToneViolation(f"{len(vs)}개 위반: {[v.kind for v in vs]}")
