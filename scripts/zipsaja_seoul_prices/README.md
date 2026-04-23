# zipsaja Seoul Price Fetcher

batch_server 경유 PostgreSQL에서 서울 25개 구 아파트 평균 실거래가를
조회하여 `reels/public/data/seoul-prices.json` 파일로 출력한다.

## 사전 조건

- SSH alias `batch_server`가 `~/.ssh/config`에 존재 (151.245.106.84 root)
- PostgreSQL 접근 정보: 기본값은 bulsaja_analytics DB (환경 변수로 override 가능)
- `pip install 'psycopg2-binary>=2.9' 'sshtunnel>=0.4.0'`

## 사용

```bash
cd /Users/zerowater/Dropbox/zerowater/howzero
python3 -m scripts.zipsaja_seoul_prices

# 특정 크기·기간으로
python3 -m scripts.zipsaja_seoul_prices \
  --size "30평대 / 전용 80㎡" \
  --period "25.1 vs 26.1"
```

## 테이블 스키마 (가정)

`zipsaja_seoul_gu_price_compare`:
- `gu` TEXT — 구 이름 (예: "서초구")
- `area_pyeong` INT — 평형 (24, 30, 등)
- `price_last_year` INT — 전년 동기 평균 (단위: 만원)
- `price_this_year` INT — 올해 평균

**실제 DB 스키마가 다르면 `__main__.py`의 `SQL` 상수를 조정할 것.**
