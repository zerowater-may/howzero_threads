WITH then_data AS (
  SELECT c.gu, AVG(rp.price)::numeric AS p_then, COUNT(*) AS n_then
  FROM real_prices rp JOIN complexes c ON c.complex_id=rp.complex_id
  WHERE rp.trade_type='A1' AND rp.is_cancel=false
    AND EXTRACT(YEAR FROM rp.trade_date) = EXTRACT(YEAR FROM CURRENT_DATE) - {years_ago}
  GROUP BY c.gu
), now_data AS (
  SELECT c.gu, AVG(rp.price)::numeric AS p_now, COUNT(*) AS n_now
  FROM real_prices rp JOIN complexes c ON c.complex_id=rp.complex_id
  WHERE rp.trade_type='A1' AND rp.is_cancel=false
    AND EXTRACT(YEAR FROM rp.trade_date) = EXTRACT(YEAR FROM CURRENT_DATE)
  GROUP BY c.gu
)
SELECT t.gu,
  ROUND(t.p_then/10000, 1) AS eok_then,
  ROUND(n.p_now/10000, 1)  AS eok_now,
  ROUND((n.p_now/t.p_then)::numeric, 2) AS multiple,
  ROUND(((n.p_now - t.p_then)/t.p_then*100)::numeric, 0) AS gain_pct,
  t.n_then::text || '/' || n.n_now::text AS samples
FROM then_data t JOIN now_data n USING(gu)
ORDER BY multiple DESC;
