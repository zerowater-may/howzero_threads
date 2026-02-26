import responses

from howzero_threads.api.client import ThreadsClient
from howzero_threads.config import Settings
from howzero_threads.exceptions import ThreadsAPIError

import pytest


@pytest.fixture
def settings():
    return Settings(
        threads_app_id="test_app",
        threads_access_token="test_token",
        threads_user_id="12345",
        api_base_url="https://graph.threads.net/v1.0",
    )


@pytest.fixture
def client(settings):
    return ThreadsClient(settings)


@responses.activate
def test_get_success(client):
    responses.add(
        responses.GET,
        "https://graph.threads.net/v1.0/me",
        json={"id": "12345", "username": "test"},
        status=200,
    )
    result = client.get("me", params={"fields": "id,username"})
    assert result["id"] == "12345"


@responses.activate
def test_get_error_raises_threads_api_error(client):
    responses.add(
        responses.GET,
        "https://graph.threads.net/v1.0/invalid",
        json={"error": "not found"},
        status=404,
    )
    with pytest.raises(ThreadsAPIError) as exc_info:
        client.get("invalid")
    assert exc_info.value.status_code == 404
    assert "test_token" not in str(exc_info.value)


@responses.activate
def test_post_success(client):
    responses.add(
        responses.POST,
        "https://graph.threads.net/v1.0/12345/threads",
        json={"id": "container_1"},
        status=200,
    )
    result = client.post("12345/threads", data={"text": "hello"})
    assert result["id"] == "container_1"


def test_update_access_token(client):
    assert client.session.params["access_token"] == "test_token"
    client.update_access_token("new_token")
    assert client.session.params["access_token"] == "new_token"
