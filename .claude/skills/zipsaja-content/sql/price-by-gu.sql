SELECT c.gu, COUNT(*) AS n,
  ROUND((PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY a.deal_price))::numeric/10000, 1) AS p25,
  ROUND((PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY a.deal_price))::numeric/10000, 1) AS median,
  ROUND((PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY a.deal_price))::numeric/10000, 1) AS p75,
  ROUND(AVG(a.deal_price)::numeric/10000, 1) AS mean
FROM articles a JOIN complexes c ON c.complex_id=a.complex_id
WHERE a.is_active=true AND a.trade_type='A1'
  AND a.exclusive_area BETWEEN {pyeong_min} AND {pyeong_max}
  AND a.deal_price > 10000
GROUP BY c.gu
HAVING COUNT(*) >= 5
ORDER BY median DESC;
