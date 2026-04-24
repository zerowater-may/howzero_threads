"""Platform-specific caption prompts.

Each prompt embeds dataset context and constrains the output shape per platform.
zipsaja brand rules: 반말 친구 톤, 오렌지 pill 단어 강조, 이모지 절제.
"""
from __future__ import annotations

from typing import Any

_BRAND_TONE = """브랜드: 집사자(zipsaja) — 친근한 반말 부동산 큐레이터.
- 반말 사용 (~해, ~야, ~다구). 존댓말 금지.
- 도발/위협 톤 금지. 친구가 정리해주는 느낌.
- 이모지 남발 금지 (1-2개만).
- 핵심 숫자를 오렌지색처럼 강조하되 캡션은 plain text."""


def instagram_prompt(ctx: dict[str, Any]) -> str:
    return f"""{_BRAND_TONE}

플랫폼: Instagram 릴스 캡션 (최대 2200자).

요구사항:
1. **첫 문단에 댓글 리드매그넷 훅을 맨 앞에 배치**: "댓글에 '엑셀' 쓰면 데이터 파일, 'PDF' 쓰면 리포트 보내줄게" 스타일.
2. 본문: 주제 요약 + 핵심 수치 3개 소개.
3. 마지막: 해시태그 5-7개 (#서울부동산 #실거래가 #집사자 계열).

데이터 컨텍스트:
- 주제: {ctx['title']}
- 요약: {ctx['insights_text']}

출력: 완성된 Instagram 캡션 하나만. 설명 텍스트 없음."""


def threads_prompt(ctx: dict[str, Any]) -> str:
    return f"""{_BRAND_TONE}

플랫폼: Threads 포스트 (500자 이내, 짧고 대화형).

요구사항:
1. 300~500자 범위의 짧은 호흡.
2. 1-2문장 훅 + 핵심 수치 한 줄 + 의견/질문.
3. 해시태그 2-3개만.

데이터 컨텍스트:
- 주제: {ctx['title']}
- 요약: {ctx['insights_text']}

출력: 완성된 Threads 포스트 하나만."""


def linkedin_prompt(ctx: dict[str, Any]) -> str:
    return f"""{_BRAND_TONE}

플랫폼: LinkedIn 포스트 (1500-2000자). 단, zipsaja 반말 톤 유지.

요구사항:
1. 인사이트 중심 — 수치 나열이 아닌 해석을 제시.
2. 3-4 문단 구성: 훅 → 데이터 → 인사이트(왜?) → 시사점.
3. 해시태그 3-5개 (#부동산 #서울 #실거래 등).

데이터 컨텍스트:
- 주제: {ctx['title']}
- 요약: {ctx['insights_text']}

출력: 완성된 LinkedIn 포스트 하나만."""
