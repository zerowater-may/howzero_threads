# zipsaja-content Skill — Design Spec

**Author**: zerowater-may
**Date**: 2026-04-23
**Status**: Draft (awaiting review)
**Related**: `.claude/skills/zipsaja-design/` (sibling — visual tokens), `proptech_db` (data source)

---

## Why this skill exists

집사자(zipsaja) 인스타 카드뉴스를 **proptech_db (서울 300세대+ 1,377 단지 / 실거래 238만건 / 활성매물 42K)** 와 Brave Search API로 매주 여러 장 안정적으로 찍어내야 한다.

이번 세션에서 단발 카드 1장(서울 24평 호가 지도) 만드는 동안 **13개의 반복 가능한 실수**가 발생했다 (외부 이미지 무지성 사용, stale 카운트, 캐시 의존, 타일로 우회, 컷오프 누락, contrast 무시, tier 자의적 등). 다음 카드뉴스부터는 이 실수가 자동으로 차단되어야 한다.

스킬은 **반-자동(B 안)**: 데이터 쿼리·SVG 지도·차트·footer·color tier·검증은 자동, hook 카피·narrative·강조 포인트는 사람.

## Out of scope

- braveyong 등 sibling 브랜드 (zipsaja 톤 전용)
- 캐러셀 외 포맷 (스토리/릴스/유튜브 썸네일은 별도 스킬)
- DB 자체 운영 (proptech 별도 프로젝트가 담당)
- 인스타 자동 업로드 (수동 또는 별도)

---

## 1. Folder structure

```
.claude/skills/zipsaja-content/
├── SKILL.md                 # entry point (user-invocable: true)
├── README.md                # human docs + quick examples
├── CHECKLIST.md             # 13 mistake-prevention rules (load 시 강제)
├── workflows/               # 6-step guides
│   ├── 01-define-hook.md
│   ├── 02-fetch-data.md
│   ├── 03-validate.md
│   ├── 04-render.md
│   ├── 05-review.md
│   └── 06-publish.md
├── sql/
│   ├── live-counts.sql      # always-fresh (단지수/매물수/scan_date)
│   ├── price-by-gu.sql      # 평형 범위 + median by gu
│   ├── price-history-Ny.sql # N년전 vs 지금 비교 (parametric)
│   ├── auction-recent.sql   # 최근 N일 신규 경매
│   ├── distressed.sql       # 급매/인하 매물
│   └── _common.sql          # join fragments
├── components/              # Jinja2 templates
│   ├── _base.html.j2        # 1080×1440 frame, 토큰 import
│   ├── cover.j2
│   ├── map-seoul.j2         # SVG paths inline (cosine-corrected)
│   ├── map-gyeonggi.j2
│   ├── rank-bar.j2          # TOP N 막대
│   ├── compare-2col.j2
│   ├── deep-detail.j2       # 단일 사례 깊이 분석
│   ├── quote-big.j2         # 큰 숫자 한 컷
│   ├── distribution.j2      # 분포표 (서초 동별 같은)
│   └── cta.j2
├── lib/
│   ├── geo/
│   │   ├── seoul.geojson
│   │   ├── gyeonggi.geojson
│   │   └── projector.py     # cosine-corrected lat/lon → SVG path + centroid
│   ├── colors.py            # tier ramp (percentile-based) + WCAG contrast checker
│   ├── footer.py            # build footer with live counts
│   ├── tone.py              # 금지어 검사 ("끝났다", "여러분", 이모지 등)
│   ├── validator.py         # outlier flag (n<30), multi-method (median/mean/p25/p75)
│   ├── render.py            # Jinja → HTML → Puppeteer → PNG
│   └── db.py                # SSH + psql wrapper, query → dict
├── presets/                 # 재사용 가능한 spec 템플릿
│   ├── seoul-map-by-gu.preset.yaml
│   ├── 10y-history-chart.preset.yaml
│   └── auction-list.preset.yaml
└── output/                  # 생성된 캐러셀 (git-ignored 또는 commit)
    └── YYYY-MM-DD-<topic-slug>/
        ├── spec.yaml
        ├── slides/01.html ~ NN.html
        ├── exports/01.png ~ NN.png  (1080×1440)
        └── meta.json        # 출처/시점/SQL/검증결과/카피
```

## 2. Workflow — 6 steps

| # | 단계 | 누가 | 설명 |
|---|------|------|------|
| 1 | HOOK 정하기 | 👤 사람 | 토픽 + hook 카피 + 8~10장 outline (yaml) |
| 2 | DATA 쿼리 | 🤖 자동 | live-counts + 토픽 SQL preset 실행, json 캐시 |
| 3 | VALIDATE | 🤖→👤 | n<30 ★, 다중방법 비교 → 사람 OK 검수 |
| 4 | RENDER | 🤖 자동 | Jinja+컴포넌트 → HTML (slides/01.html ~ NN.html) |
| 5 | REVIEW | 🤖→👤 | contrast/footer/톤/출처 자동 체크 → 사람 최종 검수 |
| 6 | PUBLISH | 🤖 자동 | Puppeteer 1080×1440 PNG (exports/) |

## 3. Mistake prevention — 13 guards (자동)

| # | 실수 | 자동 가드 |
|---|------|----------|
| 1 | 외부 이미지 사용 | "지도/차트" 키워드 → components만 허용. 외부 URL = 빌드 실패 |
| 2 | stale 카운트 | footer = `live-counts.sql` 매번 실행 후 자동 주입 |
| 3 | 캐시 의존 | `meta.json`에 SQL 저장, 빌드 시 재실행 (force-refresh flag) |
| 4 | 타일로 우회 | "지도" 컴포넌트 = `lib/geo/projector.py` 강제, GeoJSON 없으면 에러 |
| 5 | 세대수 컷오프 누락 | footer 템플릿 = "서울 **300세대+ N단지** / M매물 / scan_date" 강제 |
| 6 | 색 contrast 무시 | 빌드 시 `lib/colors.py` WCAG AA 자동 체크, fail = 빌드 중단 |
| 7 | 토큰 변경 영향 누락 | 색·폰트 토큰 변경 시 grep으로 영향 파일 표시 (warning) |
| 8 | 데이터 검증 없이 인용 | `validator.py` median + mean + p25/p75 같이 출력, 차이 크면 caveat |
| 9 | 표본 적은 outlier | n<30 = 자동 ★ 표시 + 출처 caveat 자동 추가 |
| 10 | 색 tier 임계값 자의적 | 데이터 분포 percentile 기반 (P20/40/60/80) 자동 |
| 11 | 마스코트 위치 비일관 | components가 위치/크기 결정 (footer 위 right 고정) |
| 12 | 톤 위반 | `lib/tone.py` 금지어 검사 ("끝났다", "90%", "여러분", 이모지) → 빌드 차단 |
| 13 | footer 비일관 | `lib/footer.py` 컴포넌트 1개 강제, 직접 작성 금지 (lint) |

## 4. Input / Output

### 입력 — `spec.yaml`

사람이 작성. 슬라이드 outline.

```yaml
topic: "10년전 vs 지금 — 서울 어디가 제일 올랐을까"
slug: "seoul-10y-price-change"
mascot_default: hero
slides:
  - type: cover
    headline: "10년간 서울"
    sub: "어디가 제일 올랐을까?"
    mascot: hero
  - type: quote-big
    value: "용산 3.13배"
    subtitle: "강남이 1위 아니다"
    mascot: surprise
  - type: rank-bar
    sql: price-history-Ny
    sql_params: { years: 10, top_n: 5 }
    title: "TOP 5 상승률"
  - type: map-seoul
    sql: price-history-Ny
    sql_params: { years: 10 }
    color_metric: multiple
    title: "구별 10년 상승률 지도"
  - type: deep-detail
    target: "용산구"
    title: "용산은 왜?"
    bullets:
      - "한남뉴타운"
      - "용산국제업무지구 재추진"
  - type: compare-2col
    left: { label: "용산", value: "3.13배" }
    right: { label: "도봉", value: "1.88배" }
    sub: "10년 사이 격차 1.7배 더 벌어짐"
  - type: cta
    handle: "@zipsaja"
    msg: "더 자세한 데이터는 DM으로"
```

### 출력 — `output/2026-04-23-seoul-10y-price-change/`

```
spec.yaml                  # 입력 그대로
slides/01.html ~ 07.html   # 렌더된 HTML
exports/01.png ~ 07.png    # 1080×1440 PNG
meta.json                  # 빌드 메타
```

`meta.json` 예시:
```json
{
  "built_at": "2026-04-23T15:42:00+09:00",
  "data_snapshot": "2026-04-23",
  "live_counts": {
    "complexes": 1377,
    "active_articles": 42048,
    "last_scan": "2026-04-23"
  },
  "sql_executed": [
    "live-counts.sql",
    "price-history-Ny.sql"
  ],
  "validation": {
    "outliers_flagged": ["종로구 (n=16)"],
    "method_consistency": "median/mean diff <10% — OK"
  },
  "tone_check": "passed",
  "contrast_check": "passed (all WCAG AA)"
}
```

## 5. Components — slide types (v1)

| 타입 | 용도 | parametric props |
|---|---|---|
| `cover` | 1장차 hook | headline, sub, mascot |
| `quote-big` | 한 큰 숫자 강조 | value, subtitle, mascot |
| `rank-bar` | TOP N 막대 차트 | sql_preset, top_n, metric |
| `map-seoul` | 25구 SVG 지도 | sql_preset, color_metric, title |
| `map-gyeonggi` | 경기도 지도 | (same) |
| `compare-2col` | 2개 항목 비교 | left, right, sub |
| `deep-detail` | 단일 단지/구 깊이 | target, bullets |
| `distribution` | 분포표 (서초 동별) | sql_preset, group_by |
| `cta` | 마지막 장 | handle, msg |

각 컴포넌트는 `_base.html.j2` 상속 → `colors_and_type.css` 자동 import.

## 6. SQL preset library (v1)

| 파일 | 파라미터 | 반환 |
|---|---|---|
| `live-counts.sql` | — | complexes / active / last_scan |
| `price-by-gu.sql` | pyeong_min, pyeong_max | gu, n, p25, median, p75 |
| `price-history-Ny.sql` | years, pyeong_min, pyeong_max | gu, p_then, p_now, multiple, gain_pct |
| `auction-recent.sql` | days, limit | complex, gu, current_price, status |
| `distressed.sql` | gu_filter, limit | matching distressed articles |

추후 add: `gap-investment.sql`, `complex-deep.sql`, `top-mover.sql` 등

## 7. Tech stack

- **DB 접근**: SSH + psql (`lib/db.py` wrapper). PGPASSWORD 환경변수.
- **템플릿**: Jinja2 (Python)
- **지도 투영**: Python `lib/geo/projector.py` — cosine-corrected, viewBox 1000×N
- **렌더**: Puppeteer (Node) — 이미 카드뉴스 스킬에서 검증된 1080×1440 capture
- **검증**: pytest 단위 (validator/tone/contrast)
- **호출**: `/zipsaja-content <spec.yaml>` 또는 자연어 → 스킬이 spec.yaml 작성 도와줌

## 8. Build commands (CLI)

```bash
# 신규 카드뉴스 시작 (spec 템플릿 생성)
zipsaja-content init <slug>

# 데이터만 쿼리 (검증용)
zipsaja-content fetch <slug> --refresh

# 슬라이드 렌더 (HTML)
zipsaja-content render <slug>

# PNG 추출
zipsaja-content export <slug>

# 전체 (init 후 spec.yaml 작성 → 한방)
zipsaja-content build <slug>
```

스킬은 자연어로 호출돼도 동일 단계를 거친다 (CLI는 디버깅용).

## 9. Migration & dogfood

스킬 v1 완성 후 **첫 dogfood 카드뉴스**:
- "10년전 vs 지금 — 서울 어디가 제일 올랐을까" (오늘 user가 선택한 토픽)
- 7~10장 캐러셀
- 데이터: `price-history-Ny.sql` years=10
- 컴포넌트: cover + quote-big + rank-bar + map-seoul + deep-detail + compare-2col + cta
- 결과는 카드 1(서울 24평 지도)과 같은 폴더에 인덱싱

## 10. Acceptance criteria

스킬이 "완성됐다"고 하려면:

- [ ] 13개 가드 모두 자동화됨 (각 가드 unit test 통과)
- [ ] 9개 컴포넌트 모두 1080×1440 렌더 OK
- [ ] 5개 SQL preset 모두 라이브 쿼리 통과
- [ ] dogfood 카드뉴스 ("10년 비교") 7~10장 PNG 추출 완료
- [ ] meta.json에 출처/시점/검증/카피 모두 기록
- [ ] tone/contrast 위반 시 빌드가 실제로 멈춤
- [ ] 자연어 호출 ("강남 vs 서초 카드뉴스") → spec.yaml draft까지 자동

## 11. Risks / open questions

- **Puppeteer 환경**: 기존 carousel 스킬이 사용 중이니 재활용 가능. 의존성 충돌 주의.
- **Brave Search API 통합 시점**: v1엔 빠짐. v1.1에서 "뉴스 검증형" 컴포넌트 추가 시 통합.
- **GeoJSON 라이센스**: `southkorea/seoul-maps` (CC BY 4.0 추정 — 확인 필요).
- **SSH 비밀번호 노출**: PGPASSWORD를 코드에 직박지 말고 `.env.proptech` 또는 keychain.
- **마스코트 톤 매칭**: `mascot: hero` 같은 props가 카피 톤과 안 맞으면? → 자동 추천 alg는 v2.
