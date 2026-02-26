import time
import pytest

from howzero_threads.store.rate_limiter import RateLimiter


@pytest.fixture
def limiter_file(tmp_path):
    return str(tmp_path / "rate_limit.json")


def test_can_post_initially(limiter_file):
    limiter = RateLimiter(limiter_file, max_requests=250)
    assert limiter.can_post() is True
    assert limiter.remaining() == 250


def test_record_decrements_remaining(limiter_file):
    limiter = RateLimiter(limiter_file, max_requests=5)
    limiter.record()
    assert limiter.remaining() == 4


def test_can_post_at_limit(limiter_file):
    limiter = RateLimiter(limiter_file, max_requests=2)
    limiter.record()
    limiter.record()
    assert limiter.can_post() is False
    assert limiter.remaining() == 0


def test_persistence(limiter_file):
    limiter1 = RateLimiter(limiter_file, max_requests=10)
    limiter1.record()
    limiter1.record()

    limiter2 = RateLimiter(limiter_file, max_requests=10)
    assert limiter2.remaining() == 8
