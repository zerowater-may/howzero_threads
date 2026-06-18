from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo


DEFAULT_PIVOT_DATE = "2026-01-01"
DEFAULT_DATA_SUBTITLE = "2025년 평균 vs 2026년 현재 실거래 평균"
DEFAULT_DATA_PERIOD = "2025.01~2025.12 vs 2026.01~현재"
DEFAULT_DATA_SOURCE = "국토부 실거래가(매매), 300세대 이상 단지"


@dataclass(frozen=True)
class TopicPlan:
    topic: str
    data_title: str
    data_subtitle: str = DEFAULT_DATA_SUBTITLE
    data_period: str = DEFAULT_DATA_PERIOD
    data_source: str = DEFAULT_DATA_SOURCE
    pivot_date: str = DEFAULT_PIVOT_DATE
    rationale: str = ""


def dataset_insights(dataset: dict[str, Any]) -> dict[str, Any]:
    districts = list(dataset.get("districts", []))
    ranked = sorted(districts, key=lambda row: row["changePct"], reverse=True)
    bottom_ranked = sorted(districts, key=lambda row: row["changePct"])
    avg = (
        round(sum(row["changePct"] for row in districts) / len(districts), 1)
        if districts
        else 0.0
    )
    return {
        "title": dataset.get("title", ""),
        "periodLabel": dataset.get("periodLabel", ""),
        "avgChangePct": avg,
        "top5": ranked[:5],
        "bottom5": bottom_ranked[:5],
    }


def build_topic_prompt(*, brand: str, dataset: dict[str, Any]) -> str:
    today = datetime.now(ZoneInfo("Asia/Seoul")).strftime("%Y-%m-%d")
    insights = dataset_insights(dataset)
    return f"""
너는 zipsaja 콘텐츠 기획자다.
오늘 날짜: {today}
브랜드: {brand}
타겟: 20~30대 첫집 구매자. 반말 친구 톤. 데이터 기반, 자극적이지만 허위 과장 금지.

아래 실거래 데이터 요약만 보고 오늘 만들 콘텐츠 주제를 골라라.
뉴스를 모르는 척하지 말고, 대출 규제/현금 격차/첫집 난이도 관점으로 해석해라.

데이터 요약:
{json.dumps(insights, ensure_ascii=False, indent=2)}

반드시 JSON object 하나만 출력해라. 마크다운 금지.
스키마:
{{
  "topic": "폴더 slug가 될 짧은 주제. 한국어 가능. 18자~40자",
  "data_title": "캐러셀 첫 장에 들어갈 강한 제목. 16자~34자",
  "data_subtitle": "{DEFAULT_DATA_SUBTITLE}",
  "data_period": "{DEFAULT_DATA_PERIOD}",
  "data_source": "{DEFAULT_DATA_SOURCE}",
  "pivot_date": "{DEFAULT_PIVOT_DATE}",
  "rationale": "왜 이 주제가 오늘 먹히는지 1문장"
}}
""".strip()


def extract_json_object(text: str) -> dict[str, Any]:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?\s*", "", stripped)
        stripped = re.sub(r"\s*```$", "", stripped)

    try:
        value = json.loads(stripped)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", stripped, flags=re.DOTALL)
        if not match:
            raise
        value = json.loads(match.group(0))

    if not isinstance(value, dict):
        raise ValueError("Kimi topic response must be a JSON object")
    return value


def normalize_topic_plan(raw: dict[str, Any], *, fallback_topic: str) -> TopicPlan:
    topic = str(raw.get("topic") or fallback_topic).strip()
    data_title = str(raw.get("data_title") or topic).strip()
    if not topic:
        topic = fallback_topic
    if not data_title:
        data_title = topic

    return TopicPlan(
        topic=topic,
        data_title=data_title,
        data_subtitle=str(raw.get("data_subtitle") or DEFAULT_DATA_SUBTITLE).strip(),
        data_period=str(raw.get("data_period") or DEFAULT_DATA_PERIOD).strip(),
        data_source=str(raw.get("data_source") or DEFAULT_DATA_SOURCE).strip(),
        pivot_date=str(raw.get("pivot_date") or DEFAULT_PIVOT_DATE).strip(),
        rationale=str(raw.get("rationale") or "").strip(),
    )


def topic_plan_to_json(plan: TopicPlan) -> str:
    return json.dumps(plan.__dict__, ensure_ascii=False, indent=2)
