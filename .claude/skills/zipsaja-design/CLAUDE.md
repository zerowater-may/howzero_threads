# 집사자 (zipsaja) Design — 프로젝트 메모

## 데이터 소스: proptech (필수 활용)

집사자 부동산 콘텐츠를 만들 때 **외부 사이트(yumyum 등) 이미지·데이터를 절대 그대로 쓰지 말 것**. proptech 프로젝트에 본인 소유 DB·크롤러가 다 있다. 여기서 끌어와 시각화한다.

### 접속 정보

- **로컬 코드**: `/Users/zerowater/Dropbox/proptech/`
- **서버**: `root@151.245.106.86` (hh-worker-2) — SSH 키 등록 완료
- **서버 경로**: `/opt/proptech/`
- **DB**: `postgresql://proptech:proptech2026@localhost:5432/proptech_db`
  - 외부 노출 안 됨. SSH로 들어가서 `psql` 실행 또는 ssh-tunnel.

### 테이블 (proptech_db)

| 테이블 | 내용 |
|---|---|
| `complexes` | 단지 마스터 (서울 300세대+ 아파트, 2026-04 기준 **1,377 단지**) |
| `pyeongs` | 단지별 평형 정보 |
| `articles` | 매매/전세 매물 (실시간 갱신) |
| `real_prices` | 실거래가 |
| `article_changes` | 24h 매물 변동 (신규/삭제/가격변동) |
| `scan_history` | 스캐너 실행 이력 |
| `user_financial_profiles` | 앱 사용자 프로필 |

### 경매 데이터

`server/auction_crawler.py` + `server/auction_db.py` — 경매 진행 매물 크롤링 + 알림 (notify_auction_*.py).
경매 관련 콘텐츠는 이 데이터 사용.

### 자주 쓰는 SQL 패턴

```sql
-- 구별 24평형 평균 매매호가 (활용 예: market-maps 캐러셀)
SELECT
  c.gu,
  ROUND(AVG(a.deal_price)::numeric / 10000, 1) AS avg_eok
FROM articles a
JOIN complexes c ON c.id = a.complex_id
JOIN pyeongs p ON p.id = a.pyeong_id
WHERE a.trade_type = '매매'
  AND p.area_pyeong BETWEEN 23 AND 25
  AND a.is_active = true
GROUP BY c.gu
ORDER BY avg_eok DESC;
```

(컬럼명은 실제 스키마 확인 후 조정 — `proptech/server/db.py` 참조)

### SSH 빠른 쿼리

```bash
# DB 직접 쿼리
ssh root@151.245.106.86 "psql -U proptech -d proptech_db -c \"<SQL>\""

# CSV로 떠서 로컬 분석
ssh root@151.245.106.86 "psql -U proptech -d proptech_db -A -F',' -c \"<SQL>\"" > local.csv
```

## 사용 원칙

1. **콘텐츠 데이터는 proptech DB가 1순위.** 외부 캡처/스크린샷 인용 절대 금지.
2. **데이터는 매시 cron 으로 갱신**된다. 슬라이드/캐러셀 만들 때 **그 시점 라이브 SQL** 다시 떠라. 캐시 JSON 그대로 쓰지 말 것 (호가는 매일 변함).
3. 슬라이드에 숫자 들어갈 때 **출처·시점 명시** (예: "2026.4.23 기준 / 서울 1,377 단지 / 24평 매물 7,914건"). yumyum·KB 등 외부 출처 표기 금지.
4. 지도는 **오픈 GeoJSON 기반 SVG path** 로 직접 렌더 (`southkorea/seoul-maps` 활용). 외부 캡처 이미지 사용 금지.
5. **경매 콘텐츠**는 `auction_items` / `auction_changes` 테이블 사용. notify_auction_* 의 알림 패턴이 콘텐츠 hook으로 좋음.

## 자주 쓰는 라이브 카운트 SQL

```bash
ssh root@151.245.106.86 "PGPASSWORD=proptech2026 psql -h 127.0.0.1 -U proptech -d proptech_db -c \"
SELECT 'complexes: ' || COUNT(*) FROM complexes;
SELECT 'articles active: ' || COUNT(*) FROM articles WHERE is_active=true;
SELECT 'last scan: ' || MAX(scan_date) FROM articles;
\""
```

## 관련 스킬·문서

- proptech 전체 구조: `/Users/zerowater/Dropbox/proptech/CLAUDE.md`
- 디자인 가이드: 같은 디렉토리 `README.md` + `SKILL.md`
- 카드뉴스 캐러셀 컴포넌트: `ui_kits/carousel/`
- 부동산 지도 캐러셀: `ui_kits/market-maps/` (현재 yumyum 이미지 사용 — proptech DB로 교체 작업 중)
