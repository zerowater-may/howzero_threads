import pytest

from scripts.zipsaja_data_fetch.__main__ import build_parser, merge_cli_overrides


def test_parser_defaults():
    parser = build_parser()
    args = parser.parse_args([])
    assert args.preset == "leejaemyung-before-after"
    assert args.ssh_host == "hh-worker-2"
    assert args.pg_host == "localhost"
    assert args.pg_port == 5432
    assert args.pg_user == "proptech"
    assert args.pg_db == "proptech_db"


def test_parser_preset_override():
    parser = build_parser()
    args = parser.parse_args(["--preset", "leejaemyung-before-after"])
    assert args.preset == "leejaemyung-before-after"


def test_parser_requires_title_and_out():
    parser = build_parser()
    args = parser.parse_args([
        "--title", "테스트",
        "--out", "/tmp/out.json",
    ])
    assert args.title == "테스트"
    assert str(args.out) == "/tmp/out.json"


def test_merge_cli_overrides_pivot_date():
    overrides = merge_cli_overrides(pivot_date="2024-01-01", min_total_units=None)
    assert overrides == {"pivot_date": "2024-01-01"}


def test_merge_cli_overrides_min_units():
    overrides = merge_cli_overrides(pivot_date=None, min_total_units=500)
    assert overrides == {"min_total_units": 500}


def test_merge_cli_overrides_both():
    overrides = merge_cli_overrides(pivot_date="2024-01-01", min_total_units=500)
    assert overrides == {"pivot_date": "2024-01-01", "min_total_units": 500}


def test_merge_cli_overrides_neither():
    overrides = merge_cli_overrides(pivot_date=None, min_total_units=None)
    assert overrides == {}
