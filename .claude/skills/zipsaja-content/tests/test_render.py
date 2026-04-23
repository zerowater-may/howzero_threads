import os, tempfile, yaml
from lib.render import render_carousel

SAMPLE_SPEC = {
    "slug": "test-cover",
    "topic": "test",
    "slides": [
        {"type": "cover", "headline": "테스트 hook", "sub": "한 줄 더", "mascot": "hero"},
    ],
}

def test_render_one_cover_slide(tmp_path):
    spec_path = tmp_path / "spec.yaml"
    spec_path.write_text(yaml.safe_dump(SAMPLE_SPEC, allow_unicode=True))
    out = render_carousel(str(spec_path), str(tmp_path))
    assert len(out) == 1
    html = open(out[0]).read()
    assert "테스트 hook" in html
    assert "한 줄 더" in html
    assert "@zipsaja" in html  # footer auto

def test_tone_violation_raises(tmp_path):
    bad_spec = {**SAMPLE_SPEC, "slides": [{"type": "cover", "headline": "여러분 안녕하세요", "sub": "test"}]}
    spec_path = tmp_path / "spec.yaml"
    spec_path.write_text(yaml.safe_dump(bad_spec, allow_unicode=True))
    import pytest
    with pytest.raises(ValueError, match="tone violations"):
        render_carousel(str(spec_path), str(tmp_path))


def test_render_quote_big(tmp_path):
    spec = {"slug": "qb", "slides": [{"type": "quote-big", "value": "용산 3.13배", "subtitle": "강남이 1위 아니다"}]}
    sp = tmp_path / "spec.yaml"
    sp.write_text(yaml.safe_dump(spec, allow_unicode=True))
    out = render_carousel(str(sp), str(tmp_path))
    h = open(out[0]).read()
    assert "용산 3.13배" in h

def test_render_cta(tmp_path):
    spec = {"slug": "cta", "slides": [{"type": "cta", "handle": "@zipsaja", "msg": "DM 환영"}]}
    sp = tmp_path / "spec.yaml"
    sp.write_text(yaml.safe_dump(spec, allow_unicode=True))
    out = render_carousel(str(sp), str(tmp_path))
    assert "DM 환영" in open(out[0]).read()


def test_render_map_seoul_live(tmp_path):
    spec = {
        "slug": "map-test",
        "slides": [{
            "type": "map-seoul",
            "sql": "price-by-gu",
            "sql_params": {"pyeong_min": 56, "pyeong_max": 63},
            "color_metric": "median",
            "title": "서울 24평 호가",
            "sub": "테스트",
        }],
    }
    sp = tmp_path / "spec.yaml"
    sp.write_text(yaml.safe_dump(spec, allow_unicode=True))
    out = render_carousel(str(sp), str(tmp_path))
    h = open(out[0]).read()
    assert "<svg" in h
    assert 'data-name="강남구"' in h
    assert "viewBox" in h


def test_render_rank_bar_live(tmp_path):
    spec = {
        "slug": "rb",
        "slides": [{
            "type": "rank-bar",
            "sql": "price-by-gu",
            "sql_params": {"pyeong_min": 56, "pyeong_max": 63},
            "metric": "median",
            "top_n": 5,
            "title": "TOP 5",
        }],
    }
    sp = tmp_path / "spec.yaml"
    sp.write_text(yaml.safe_dump(spec, allow_unicode=True))
    out = render_carousel(str(sp), str(tmp_path))
    h = open(out[0]).read()
    assert h.count('class="rb-row"') == 5
    assert "서초" in h


def test_render_compare_2col(tmp_path):
    spec = {"slug":"c2","slides":[{"type":"compare-2col","title":"비교","left":{"label":"용산","value":"3.13배"},"right":{"label":"도봉","value":"1.88배"},"sub":"양극화"}]}
    sp = tmp_path / "spec.yaml"; sp.write_text(yaml.safe_dump(spec, allow_unicode=True))
    h = open(render_carousel(str(sp), str(tmp_path))[0]).read()
    assert "3.13배" in h and "1.88배" in h

def test_render_deep_detail(tmp_path):
    spec = {"slug":"dd","slides":[{"type":"deep-detail","title":"용산은 왜?","target":"용산","bullets":["한남","국제업무지구"]}]}
    sp = tmp_path / "spec.yaml"; sp.write_text(yaml.safe_dump(spec, allow_unicode=True))
    h = open(render_carousel(str(sp), str(tmp_path))[0]).read()
    assert "한남" in h and "국제업무지구" in h
