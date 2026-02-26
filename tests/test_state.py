import json
import pytest
from pathlib import Path

from howzero_threads.store.state import StateStore


@pytest.fixture
def state_file(tmp_path):
    return str(tmp_path / "state.json")


def test_get_set_last_timestamp(state_file):
    store = StateStore(state_file)
    assert store.get_last_timestamp("media_1") is None

    store.set_last_timestamp("media_1", "2026-01-01T00:00:00Z")
    assert store.get_last_timestamp("media_1") == "2026-01-01T00:00:00Z"


def test_persistence(state_file):
    store1 = StateStore(state_file)
    store1.set_last_timestamp("media_1", "2026-01-01T00:00:00Z")

    store2 = StateStore(state_file)
    assert store2.get_last_timestamp("media_1") == "2026-01-01T00:00:00Z"


def test_get_set_generic(state_file):
    store = StateStore(state_file)
    assert store.get("key1") is None
    assert store.get("key1", "default") == "default"

    store.set("key1", "value1")
    assert store.get("key1") == "value1"


def test_multiple_media_ids(state_file):
    store = StateStore(state_file)
    store.set_last_timestamp("media_1", "2026-01-01T00:00:00Z")
    store.set_last_timestamp("media_2", "2026-02-01T00:00:00Z")

    assert store.get_last_timestamp("media_1") == "2026-01-01T00:00:00Z"
    assert store.get_last_timestamp("media_2") == "2026-02-01T00:00:00Z"
