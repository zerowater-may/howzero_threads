from scripts.content_captions.generate import normalize_threads_caption, resolve_caption_provider
from scripts.content_captions.prompts import (
    instagram_prompt,
    linkedin_prompt,
    threads_prompt,
)


def test_instagram_prompt_contains_lead_magnet_hook_front():
    prompt = instagram_prompt({"title": "t", "insights_text": "x"})
    assert "댓글" in prompt
    assert "엑셀" in prompt or "PDF" in prompt
    assert "앞쪽" in prompt or "첫" in prompt or "맨 앞" in prompt


def test_threads_prompt_is_short_conversational():
    prompt = threads_prompt({"title": "t", "insights_text": "x"})
    assert "2~3줄" in prompt
    assert "140자" in prompt
    assert "해시태그 금지" in prompt
    assert "첫 줄" in prompt and "훅" in prompt
    assert "Threads" in prompt or "대화" in prompt


def test_linkedin_prompt_insight_driven():
    prompt = linkedin_prompt({"title": "t", "insights_text": "x"})
    assert "LinkedIn" in prompt or "링크드인" in prompt
    assert "인사이트" in prompt or "분석" in prompt


def test_all_prompts_embed_context():
    ctx = {"title": "서울 실거래 변화", "insights_text": "광진 +17.3"}
    for fn in (instagram_prompt, threads_prompt, linkedin_prompt):
        p = fn(ctx)
        assert "서울 실거래 변화" in p
        assert "광진 +17.3" in p


def test_normalize_threads_caption_keeps_only_hook_lines():
    caption = normalize_threads_caption(
        """
        대출 막으면 집값 잡힌다는 말, 진짜 맞아?

        용산 +18.5%, 광진 +17.9%인데 강남은 -2.5%야.
        너라면 1 대출규제, 2 전세공급?
        #부동산 #서울
        """
    )

    lines = caption.splitlines()
    assert len(lines) == 3
    assert all(not line.startswith("#") for line in lines)


def test_resolve_caption_provider_prefers_explicit_env(monkeypatch):
    monkeypatch.setenv("CONTENT_CAPTIONS_PROVIDER", "kimi")
    monkeypatch.setenv("ANTHROPIC_API_KEY", "anthropic-key")

    assert resolve_caption_provider() == "kimi"


def test_resolve_caption_provider_supports_kimi_and_deepseek_without_anthropic(monkeypatch):
    monkeypatch.delenv("CONTENT_CAPTIONS_PROVIDER", raising=False)
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.setenv("MOONSHOT_API_KEY", "moonshot-key")
    monkeypatch.setenv("DEEPSEEK_API_KEY", "deepseek-key")

    assert resolve_caption_provider() == "kimi"

    monkeypatch.delenv("MOONSHOT_API_KEY", raising=False)
    assert resolve_caption_provider() == "deepseek"
