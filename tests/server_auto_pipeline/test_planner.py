import json

from scripts.server_auto_pipeline.planner import (
    dataset_insights,
    extract_json_object,
    normalize_topic_plan,
)


def test_dataset_insights_ranks_top_and_bottom():
    dataset = {
        "districts": [
            {"district": "강남구", "changePct": -2.5},
            {"district": "용산구", "changePct": 18.5},
            {"district": "광진구", "changePct": 17.9},
        ]
    }

    insights = dataset_insights(dataset)

    assert insights["avgChangePct"] == 11.3
    assert insights["top5"][0]["district"] == "용산구"
    assert insights["bottom5"][0]["district"] == "강남구"


def test_extract_json_object_accepts_markdown_fence():
    text = """```json
    {"topic":"대출규제 현금격차", "data_title":"현금 없는 사람만 막혔다"}
    ```"""

    assert extract_json_object(text)["topic"] == "대출규제 현금격차"


def test_extract_json_object_finds_embedded_object():
    text = '기획안: {"topic":"서울 상승률", "data_title":"서울은 아직 올랐다"} 끝'

    assert extract_json_object(text)["data_title"] == "서울은 아직 올랐다"


def test_normalize_topic_plan_applies_defaults():
    plan = normalize_topic_plan(
        {"topic": "대출 막힌 뒤 서울", "data_title": "대출은 막혔는데 서울은 올랐다"},
        fallback_topic="fallback",
    )

    assert plan.topic == "대출 막힌 뒤 서울"
    assert plan.data_title == "대출은 막혔는데 서울은 올랐다"
    assert plan.pivot_date == "2026-01-01"
    assert json.loads(json.dumps(plan.__dict__, ensure_ascii=False))["topic"] == plan.topic
