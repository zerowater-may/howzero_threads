#!/usr/bin/env bash
# Paperclip 프로덕션 인스턴스 초기화
# 사전 조건: PostgreSQL + Redis 실행 중 (docker compose up -d)
set -euo pipefail

PAPERCLIP_HOME="/opt/paperclip"
INSTANCE_NAME="production"
DOMAIN="${DOMAIN:-paperclip.howzero.co}"

# .env 로드
if [ -f "$PAPERCLIP_HOME/.env" ]; then
    export $(grep -v '^#' "$PAPERCLIP_HOME/.env" | xargs)
fi

echo "=== Paperclip 프로덕션 인스턴스 초기화 ==="

# 인스턴스 디렉토리
INSTANCE_DIR="$PAPERCLIP_HOME/instances/$INSTANCE_NAME"
mkdir -p "$INSTANCE_DIR"/{db,data/backups,data/storage,logs,secrets}

# 프로덕션 config.json 생성
cat > "$INSTANCE_DIR/config.json" <<EOF
{
  "\$meta": {
    "version": 1,
    "source": "manual-production"
  },
  "database": {
    "mode": "external",
    "connectionString": "postgresql://paperclip:${POSTGRES_PASSWORD}@127.0.0.1:5432/paperclip",
    "backup": {
      "enabled": false
    }
  },
  "logging": {
    "mode": "file",
    "logDir": "$INSTANCE_DIR/logs"
  },
  "server": {
    "deploymentMode": "cloud",
    "exposure": "authenticated",
    "host": "0.0.0.0",
    "port": 3100,
    "allowedHostnames": ["$DOMAIN"],
    "serveUi": true
  },
  "auth": {
    "baseUrlMode": "auto",
    "disableSignUp": true
  },
  "storage": {
    "provider": "local_disk",
    "localDisk": {
      "baseDir": "$INSTANCE_DIR/data/storage"
    }
  },
  "secrets": {
    "provider": "local_encrypted",
    "strictMode": true,
    "localEncrypted": {
      "keyFilePath": "$INSTANCE_DIR/secrets/master.key"
    }
  },
  "agents": {
    "dangerouslySkipPermissions": false,
    "defaultAdapterConfig": {
      "dangerouslySkipPermissions": false
    }
  }
}
EOF

echo "config.json 생성 완료: $INSTANCE_DIR/config.json"
echo ""
echo "변경 사항 (현재 → 프로덕션):"
echo "  - database.mode: embedded-postgres → external (별도 PostgreSQL)"
echo "  - server.deploymentMode: local_trusted → cloud"
echo "  - server.exposure: private → authenticated"
echo "  - server.host: 127.0.0.1 → 0.0.0.0"
echo "  - auth.disableSignUp: false → true"
echo "  - secrets.strictMode: false → true"
echo ""
echo "다음 단계:"
echo "  1. npx paperclipai start --instance $INSTANCE_NAME"
echo "  2. 초기 관리자 계정 생성:"
echo "     npx paperclipai user create --instance $INSTANCE_NAME --email admin@howzero.co --role admin"
echo "  3. 에이전트별 권한 화이트리스트 설정:"
echo "     각 에이전트 adapterConfig에 dangerouslySkipPermissions: false 확인"
echo "     필요한 도구만 allowedTools에 명시적 등록"
