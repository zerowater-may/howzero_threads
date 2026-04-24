-- Seoul 25 districts · 300+ households · trade_type A1 (매매)
-- Compare: 12 months before pivot_date vs from pivot_date onward
-- Params: :pivot_date (date), :min_total_units (int, default 300)
WITH seoul AS (
  SELECT complex_id, gu
  FROM complexes
  WHERE total_units >= :min_total_units
    AND gu = ANY(ARRAY[
      '서초구','강남구','용산구','송파구','성동구','마포구','동작구','강동구',
      '광진구','중구','영등포구','종로구','동대문구','서대문구','양천구','강서구',
      '성북구','은평구','관악구','구로구','강북구','금천구','노원구','중랑구','도봉구'
    ])
),
before_p AS (
  SELECT s.gu, ROUND(AVG(rp.price))::bigint AS avg_price, COUNT(*) AS cnt
  FROM real_prices rp JOIN seoul s USING (complex_id)
  WHERE rp.trade_type = 'A1' AND rp.is_cancel = false
    AND rp.trade_date >= (:pivot_date::date - INTERVAL '12 months')
    AND rp.trade_date < :pivot_date::date
  GROUP BY s.gu
),
after_p AS (
  SELECT s.gu, ROUND(AVG(rp.price))::bigint AS avg_price, COUNT(*) AS cnt
  FROM real_prices rp JOIN seoul s USING (complex_id)
  WHERE rp.trade_type = 'A1' AND rp.is_cancel = false
    AND rp.trade_date >= :pivot_date::date
  GROUP BY s.gu
)
SELECT b.gu AS district,
       b.avg_price AS price_before,
       a.avg_price AS price_after,
       b.cnt AS trades_before,
       a.cnt AS trades_after
FROM before_p b JOIN after_p a USING (gu)
ORDER BY b.gu;
