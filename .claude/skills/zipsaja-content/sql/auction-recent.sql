SELECT ai.complex_id, c.complex_name, c.gu, c.dong,
  ai.case_number, ai.appraisal_price, ai.minimum_sale_price, ai.auction_round,
  ai.scheduled_date::text AS scheduled
FROM auction_items ai
JOIN complexes c ON c.complex_id = ai.complex_id
WHERE ai.scheduled_date >= CURRENT_DATE - INTERVAL '{days} days'
  AND ai.status IN ('진행', 'NEW')
ORDER BY ai.scheduled_date ASC
LIMIT {limit};
