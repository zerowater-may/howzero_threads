SELECT c.gu, c.complex_name, a.pyeong_name,
  ROUND(a.deal_price::numeric/10000, 1) AS eok,
  a.is_distressed, a.is_price_down, a.days_listed
FROM articles a JOIN complexes c ON c.complex_id=a.complex_id
WHERE a.is_active=true AND a.trade_type='A1'
  AND (a.is_distressed=true OR a.is_price_down=true)
  AND c.gu LIKE '{gu_filter}'
ORDER BY a.days_listed DESC
LIMIT 30;
