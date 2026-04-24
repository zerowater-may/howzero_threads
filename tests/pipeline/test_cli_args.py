import pytest

from scripts.pipeline.__main__ import build_parser, compute_pipeline_id


def test_parser_brand_topic_positional():
    parser = build_parser()
    args = parser.parse_args(["zipsaja", "이재명", "당선후", "변화"])
    assert args.brand == "zipsaja"
    assert args.topic == "이재명 당선후 변화"


def test_parser_brand_only_no_topic():
    parser = build_parser()
    args = parser.parse_args(["zipsaja"])
    assert args.brand == "zipsaja"
    assert args.topic == ""


def test_parser_no_args():
    parser = build_parser()
    args = parser.parse_args([])
    assert args.brand is None
    assert args.topic == ""


def test_parser_accepts_preset_flag():
    parser = build_parser()
    args = parser.parse_args(["zipsaja", "test", "--preset", "leejaemyung-before-after"])
    assert args.preset == "leejaemyung-before-after"


def test_compute_pipeline_id_format():
    from datetime import datetime, timezone
    dt = datetime(2026, 4, 24, 12, 0, 0, tzinfo=timezone.utc)
    pid = compute_pipeline_id("zipsaja", "test-slug", now=dt)
    assert pid == "zipsaja_20260424_test-slug"
