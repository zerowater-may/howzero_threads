from howzero_threads.exceptions import ThreadsAPIError, sanitize_url


def test_sanitize_url_masks_access_token():
    url = "https://api.com?access_token=SECRET123&fields=id"
    assert "SECRET123" not in sanitize_url(url)
    assert "access_token=[REDACTED]" in sanitize_url(url)
    assert "fields=id" in sanitize_url(url)


def test_sanitize_url_masks_client_secret():
    url = "https://api.com?client_secret=MYSECRET&grant_type=token"
    assert "MYSECRET" not in sanitize_url(url)
    assert "client_secret=[REDACTED]" in sanitize_url(url)


def test_sanitize_url_masks_multiple_params():
    url = "https://api.com?access_token=TOKEN&client_secret=SECRET"
    result = sanitize_url(url)
    assert "TOKEN" not in result
    assert "SECRET" not in result


def test_threads_api_error_masks_url():
    err = ThreadsAPIError(
        message="401 error at https://api.com?access_token=TOKEN",
        status_code=401,
        url="https://api.com?access_token=TOKEN",
    )
    assert "TOKEN" not in str(err)
    assert "TOKEN" not in err.url
    assert "[REDACTED]" in str(err)
