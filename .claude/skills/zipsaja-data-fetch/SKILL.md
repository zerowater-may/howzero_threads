---
name: zipsaja-data-fetch
description: zipsaja 브랜드 전용 부동산 실거래가 데이터 페치 스킬. SSH → hh-worker-2 → proptech_db (real_prices × complexes) 쿼리 후 JSON 출력. /pipeline 스킬의 zipsaja 분기에서 자동 호출되지만, 단독 실행도 가능.
---

# zipsaja Data Fetch 스킬

SSH 터널로 `hh-worker-2` → PostgreSQL `proptech_db` 접속해 서울 25개 구 × 300세대 이상 아파트의 매매가 집계 데이터를 JSON으로 출력.

## 데이터 소스 (고정)

| 항목 | 값 |
|---|---|
| SSH alias | `hh-worker-2` (151.245.106.86, root) |
| DB | `postgresql://proptech@localhost:5432/proptech_db` |
| Password | `/opt/proptech/.env` 의 DATABASE_URL 참조 |
| 주요 테이블 | `real_prices` (2.4M rows) × `complexes` (1377 rows) |

## SQL 프리셋

| 프리셋 | 설명 | 파라미터 |
|---|---|---|
| `leejaemyung-before-after` | 취임 전 12개월 vs 취임 후 현재 평균가 비교 | `pivot_date` (default 2025-06-04), `min_total_units` (default 300) |

Plan 2+에서 `weekly-rate`, `custom-period` 프리셋 추가 예정.

## 사용

```bash
# 기본 (leejaemyung-before-after, default 파라미터)
export PG_PASSWORD=<from ssh hh-worker-2 cat /opt/proptech/.env>
python3 -m scripts.zipsaja_data_fetch \
  --out brands/zipsaja/zipsaja_pipeline_leejaemyung-seoul/data.json

# 기준일 변경
python3 -m scripts.zipsaja_data_fetch \
  --pivot-date 2024-01-01 \
  --title "2024년 vs 2026년 서울 실거래 변화" \
  --out brands/zipsaja/zipsaja_pipeline_2024-vs-now/data.json

# 세대수 필터 변경 (500세대 이상)
python3 -m scripts.zipsaja_data_fetch --min-total-units 500 \
  --out brands/zipsaja/zipsaja_pipeline_500plus/data.json
```

## 출력 스키마

```json
{
  "generatedAt": "2026-04-24T12:00:00+09:00",
  "title": "...",
  "subtitle": "...",
  "periodLabel": "...",
  "source": "국토부 실거래가 (매매)",
  "districts": [
    {
      "district": "광진구",
      "priceBefore": 144870,
      "priceAfter": 169973,
      "changePct": 17.3
    }
  ]
}
```

- `priceBefore` / `priceAfter` 단위: **만원** (원 → 만원 truncated, ex: 1억 7천만원 = 17000).
- `changePct` 소수점 1자리.
- `districts` 는 항상 SEOUL_DISTRICTS_ORDER 순서 (서초구부터 도봉구).

## 관련 파일

- `scripts/zipsaja_data_fetch/presets.py` — 프리셋 레지스트리
- `scripts/zipsaja_data_fetch/presets_sql/leejaemyung_before_after.sql` — SQL 템플릿
- `scripts/zipsaja_data_fetch/fetch.py` — SSH 터널 + row→dataset 변환

## 구 `scripts/zipsaja_seoul_prices` 와의 관계

**완전 교체**. 구 모듈은 잘못된 인프라(batch_server + bulsaja_analytics + 존재하지 않는 view `zipsaja_seoul_gu_price_compare`)를 참조하여 작동 불가. 이 스킬이 후속.
