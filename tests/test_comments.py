import responses
import pytest

from howzero_threads.api.client import ThreadsClient
from howzero_threads.api.comments import get_comments, get_replies
from howzero_threads.config import Settings


@pytest.fixture
def settings():
    return Settings(
        threads_app_id="test_app",
        threads_access_token="test_token",
        threads_user_id="12345",
    )


@pytest.fixture
def client(settings):
    return ThreadsClient(settings)


@responses.activate
def test_get_comments_single_page(client):
    responses.add(
        responses.GET,
        "https://graph.threads.net/v1.0/media_1/conversation",
        json={
            "data": [
                {"id": "c1", "username": "user1", "text": "hello", "timestamp": "2026-01-01T00:00:00Z"},
                {"id": "c2", "username": "user2", "text": "world", "timestamp": "2026-01-01T01:00:00Z"},
            ],
        },
        status=200,
    )
    comments = get_comments(client, "media_1")
    assert len(comments) == 2
    assert comments[0]["username"] == "user1"


@responses.activate
def test_get_comments_pagination(client):
    # Page 1
    responses.add(
        responses.GET,
        "https://graph.threads.net/v1.0/media_1/conversation",
        json={
            "data": [
                {"id": "c1", "text": "first", "timestamp": "2026-01-01T00:00:00Z"},
            ],
            "paging": {
                "cursors": {"after": "cursor_abc"},
                "next": "https://graph.threads.net/v1.0/media_1/conversation?after=cursor_abc",
            },
        },
        status=200,
    )
    # Page 2
    responses.add(
        responses.GET,
        "https://graph.threads.net/v1.0/media_1/conversation",
        json={
            "data": [
                {"id": "c2", "text": "second", "timestamp": "2026-01-01T01:00:00Z"},
            ],
        },
        status=200,
    )
    comments = get_comments(client, "media_1")
    assert len(comments) == 2
    assert comments[0]["text"] == "first"
    assert comments[1]["text"] == "second"


@responses.activate
def test_get_comments_filters_hidden(client):
    responses.add(
        responses.GET,
        "https://graph.threads.net/v1.0/media_1/conversation",
        json={
            "data": [
                {"id": "c1", "text": "visible", "hidden": False},
                {"id": "c2", "text": "spam", "hidden": True},
            ],
        },
        status=200,
    )
    comments = get_comments(client, "media_1", include_hidden=False)
    assert len(comments) == 1
    assert comments[0]["text"] == "visible"


@responses.activate
def test_get_comments_includes_hidden(client):
    responses.add(
        responses.GET,
        "https://graph.threads.net/v1.0/media_1/conversation",
        json={
            "data": [
                {"id": "c1", "text": "visible", "hidden": False},
                {"id": "c2", "text": "spam", "hidden": True},
            ],
        },
        status=200,
    )
    comments = get_comments(client, "media_1", include_hidden=True)
    assert len(comments) == 2


@responses.activate
def test_get_replies(client):
    responses.add(
        responses.GET,
        "https://graph.threads.net/v1.0/c1/replies",
        json={
            "data": [
                {"id": "r1", "text": "reply", "username": "user3"},
            ],
        },
        status=200,
    )
    replies = get_replies(client, "c1")
    assert len(replies) == 1
    assert replies[0]["text"] == "reply"
