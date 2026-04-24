#!/usr/bin/env bash
# Paperclip Linux 서버 초기 설정 스크립트
# 대상: Hetzner CPX41 (8 vCPU, 16GB RAM, 240GB NVMe, Ubuntu 24.04)
#
# 사용법: curl -sSL <url> | sudo bash
# 또는:  sudo bash setup-server.sh
set -euo pipefail

PAPERCLIP_USER="paperclip"
PAPERCLIP_HOME="/opt/paperclip"
DOMAIN="${DOMAIN:-paperclip.howzero.co}"
NODE_VERSION="22"

echo "=== [1/8] 시스템 업데이트 ==="
apt-get update && apt-get upgrade -y
apt-get install -y curl wget git ufw fail2ban jq certbot python3-certbot-nginx

echo "=== [2/8] Node.js ${NODE_VERSION} 설치 ==="
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs
npm install -g npm@latest

echo "=== [3/8] Docker 설치 ==="
if ! command -v docker &>/dev/null; then
    curl -fsSL https://get.docker.com | bash
fi
apt-get install -y docker-compose-plugin
systemctl enable --now docker

echo "=== [4/8] 사용자 및 디렉토리 생성 ==="
if ! id "$PAPERCLIP_USER" &>/dev/null; then
    useradd -r -m -d "$PAPERCLIP_HOME" -s /bin/bash "$PAPERCLIP_USER"
fi
usermod -aG docker "$PAPERCLIP_USER"

mkdir -p "$PAPERCLIP_HOME"/{instances/production,scripts,logs}
mkdir -p /var/log/paperclip
chown -R "$PAPERCLIP_USER":"$PAPERCLIP_USER" "$PAPERCLIP_HOME" /var/log/paperclip

echo "=== [5/8] 방화벽 설정 ==="
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "=== [6/8] fail2ban 설정 ==="
cat > /etc/fail2ban/jail.local <<'JAIL'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
findtime = 60
bantime = 600
JAIL
systemctl enable --now fail2ban

echo "=== [7/8] Paperclip 설치 ==="
sudo -u "$PAPERCLIP_USER" bash -c "
    cd $PAPERCLIP_HOME
    npm init -y
    npm install paperclipai@latest
"

echo "=== [8/8] SSL 인증서 발급 ==="
echo "도메인 DNS가 이 서버를 가리키고 있다면:"
echo "  certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@howzero.co"
echo ""
echo "=== 설치 완료 ==="
echo ""
echo "다음 단계:"
echo "1. infra/docker/.env 파일 생성 (비밀번호 설정)"
echo "2. docker compose up -d (PostgreSQL + Redis 시작)"
echo "3. infra/scripts/init-paperclip.sh 실행 (Paperclip 초기화)"
echo "4. systemctl enable --now paperclip (서비스 등록)"
echo "5. certbot 실행 (SSL 인증서)"
echo "6. nginx 설정 복사 및 reload"
