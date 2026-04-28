# 13 Mistake-Prevention Guards

These are auto-enforced by the pipeline. Documented here for transparency.

1. **외부 이미지 금지** — components only. URL-based <img src> 차단 (lint).
2. **Stale 카운트 금지** — footer는 live-counts.sql 매번 실행 후 자동 주입.
3. **캐시 의존 금지** — meta.json에 SQL 저장, 빌드 시 force-refresh.
4. **지도는 SVG 강제** — "map-*" component만 허용. 외부 캡처 차단.
5. **세대수 컷오프 표기** — footer = "서울 300세대+ N단지 / M매물 / scan_date".
6. **Color contrast 강제** — WCAG AA. 미달 시 빌드 중단.
7. **토큰 변경 영향 표시** — colors_and_type.css 변경 시 grep warning.
8. **다중방법 검증** — median + mean + p25/p75 비교, 차이 크면 caveat.
9. **Outlier 플래그** — n<30 sample → ★ 표시 + caveat 자동 주입.
10. **Tier 임계값 percentile 기반** — P20/40/60/80 자동.
11. **마스코트 위치 고정** — components가 결정 (footer 위 right).
12. **Tone 가드** — 금지어 검사 ("끝났다", "90%", "여러분", 이모지) → 빌드 차단.
13. **Footer 컴포넌트 1개** — 직접 작성 금지 (lint).
