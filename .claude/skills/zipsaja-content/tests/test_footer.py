from lib.footer import build_footer_text, FOOTER_TEMPLATE

def test_template_has_required_tokens():
    assert "{complexes}" in FOOTER_TEMPLATE
    assert "{active_articles}" in FOOTER_TEMPLATE
    assert "{last_scan}" in FOOTER_TEMPLATE
    assert "300세대" in FOOTER_TEMPLATE

def test_build_footer_with_live_data():
    text = build_footer_text()
    assert "300세대+" in text
    assert "단지" in text
    assert "매물" in text
    import re
    assert re.search(r"\d{4}-\d{2}-\d{2}", text)
