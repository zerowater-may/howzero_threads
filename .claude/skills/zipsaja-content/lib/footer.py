"""Auto-build footer text using live-counts SQL. Always fresh, no caching."""
from lib.db import query
from lib.sql_loader import load

# 강제 템플릿 — 300세대+ 컷오프 표기 필수 (CHECKLIST guard #5)
FOOTER_TEMPLATE = (
    "@zipsaja · 서울 300세대+ {complexes}단지 · 활성 매물 {active_articles}건 · {last_scan} 기준"
)


def build_footer_text() -> str:
    rows = query(load("live-counts"))
    if not rows:
        raise RuntimeError("live-counts SQL returned no rows")
    r = rows[0]
    return FOOTER_TEMPLATE.format(
        complexes=f"{int(r['complexes']):,}",
        active_articles=f"{int(r['active_articles']):,}",
        last_scan=r["last_scan"],
    )
