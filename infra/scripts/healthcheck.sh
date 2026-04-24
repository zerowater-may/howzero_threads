#!/usr/bin/env bash
# Paperclip 프로덕션 헬스체크 + 알림
# crontab: */5 * * * * /opt/paperclip/scripts/healthcheck.sh
set -euo pipefail

DOMAIN="${DOMAIN:-paperclip.howzero.co}"
HEALTHCHECK_URL="https://${DOMAIN}/api/health"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"
LOG_FILE="/var/log/paperclip/healthcheck.log"
STATE_FILE="/tmp/paperclip-healthcheck-state"

timestamp() { date '+%Y-%m-%d %H:%M:%S'; }

send_alert() {
    local message="$1"
    local level="${2:-error}"

    echo "[$(timestamp)] ALERT ($level): $message" >> "$LOG_FILE"

    # Telegram 알림 (우선)
    if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
        local emoji="🔴"
        [ "$level" = "recovery" ] && emoji="🟢"
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d chat_id="$TELEGRAM_CHAT_ID" \
            -d text="${emoji} Paperclip ${message}" \
            -d parse_mode="Markdown" \
            > /dev/null 2>&1 || true
    fi

    # Slack 알림 (대체)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local color="#ff0000"
        [ "$level" = "recovery" ] && color="#36a64f"
        curl -s -X POST "$SLACK_WEBHOOK_URL" \
            -H 'Content-Type: application/json' \
            -d "{\"text\": \"Paperclip: ${message}\", \"attachments\": [{\"color\": \"${color}\"}]}" \
            > /dev/null 2>&1 || true
    fi
}

# 이전 상태 확인
PREV_STATE="ok"
[ -f "$STATE_FILE" ] && PREV_STATE=$(cat "$STATE_FILE")

CURRENT_STATE="ok"
FAILURES=""

# 1. HTTP 헬스체크
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 30 "$HEALTHCHECK_URL" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" != "200" ]; then
    CURRENT_STATE="down"
    FAILURES="${FAILURES}\n- HTTP 헬스체크 실패 (status: ${HTTP_CODE})"
fi

# 2. PostgreSQL 연결 확인
if ! docker exec paperclip-postgres pg_isready -U paperclip > /dev/null 2>&1; then
    CURRENT_STATE="down"
    FAILURES="${FAILURES}\n- PostgreSQL 연결 실패"
fi

# 3. Redis 연결 확인
if ! docker exec paperclip-redis redis-cli ping > /dev/null 2>&1; then
    CURRENT_STATE="down"
    FAILURES="${FAILURES}\n- Redis 연결 실패"
fi

# 4. 디스크 사용량 확인 (90% 이상 경고)
DISK_USAGE=$(df /opt/paperclip --output=pcent 2>/dev/null | tail -1 | tr -d ' %' || echo "0")
if [ "$DISK_USAGE" -gt 90 ]; then
    CURRENT_STATE="warning"
    FAILURES="${FAILURES}\n- 디스크 사용량 ${DISK_USAGE}% (임계치 90%)"
fi

# 5. systemd 서비스 상태 확인
if ! systemctl is-active --quiet paperclip 2>/dev/null; then
    CURRENT_STATE="down"
    FAILURES="${FAILURES}\n- paperclip 서비스 비활성"
fi

# 상태 전환 감지 및 알림
if [ "$CURRENT_STATE" != "ok" ] && [ "$PREV_STATE" = "ok" ]; then
    send_alert "서비스 장애 감지\n${FAILURES}" "error"
elif [ "$CURRENT_STATE" = "ok" ] && [ "$PREV_STATE" != "ok" ]; then
    send_alert "서비스 복구 완료" "recovery"
fi

echo "$CURRENT_STATE" > "$STATE_FILE"
echo "[$(timestamp)] state=${CURRENT_STATE} http=${HTTP_CODE} disk=${DISK_USAGE}%" >> "$LOG_FILE"
