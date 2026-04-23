SELECT
  (SELECT COUNT(*) FROM complexes) AS complexes,
  (SELECT COUNT(*) FROM articles WHERE is_active=true) AS active_articles,
  (SELECT MAX(scan_date)::text FROM articles) AS last_scan,
  (SELECT MIN(total_units) FROM complexes) AS min_units;
