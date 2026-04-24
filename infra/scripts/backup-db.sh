#!/usr/bin/env bash
# PostgreSQL 일간 백업 스크립트
# systemd timer (paperclip-backup.timer)에서 매일 03:00 실행
set -euo pipefail

BACKUP_DIR="/opt/paperclip/instances/production/data/backups"
RETENTION_DAILY=7
RETENTION_WEEKLY=4
RETENTION_MONTHLY=3
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DAY_OF_WEEK=$(date +%u)
DAY_OF_MONTH=$(date +%d)

mkdir -p "$BACKUP_DIR"/{daily,weekly,monthly}

# .env 로드
if [ -f /opt/paperclip/.env ]; then
    export $(grep -v '^#' /opt/paperclip/.env | xargs)
fi

# 일간 백업
DAILY_FILE="$BACKUP_DIR/daily/paperclip_${TIMESTAMP}.sql.gz"
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump -h 127.0.0.1 -U paperclip paperclip | gzip > "$DAILY_FILE"
echo "일간 백업 완료: $DAILY_FILE ($(du -h "$DAILY_FILE" | cut -f1))"

# 주간 백업 (월요일)
if [ "$DAY_OF_WEEK" = "1" ]; then
    cp "$DAILY_FILE" "$BACKUP_DIR/weekly/paperclip_weekly_${TIMESTAMP}.sql.gz"
    echo "주간 백업 복사 완료"
fi

# 월간 백업 (1일)
if [ "$DAY_OF_MONTH" = "01" ]; then
    cp "$DAILY_FILE" "$BACKUP_DIR/monthly/paperclip_monthly_${TIMESTAMP}.sql.gz"
    echo "월간 백업 복사 완료"
fi

# 오래된 백업 삭제
find "$BACKUP_DIR/daily" -name "*.sql.gz" -mtime +${RETENTION_DAILY} -delete
find "$BACKUP_DIR/weekly" -name "*.sql.gz" -mtime +$((RETENTION_WEEKLY * 7)) -delete
find "$BACKUP_DIR/monthly" -name "*.sql.gz" -mtime +$((RETENTION_MONTHLY * 30)) -delete

echo "백업 보존 정책 적용 완료 (일간:${RETENTION_DAILY}일, 주간:${RETENTION_WEEKLY}주, 월간:${RETENTION_MONTHLY}개월)"
