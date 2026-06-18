#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${HOWZERO_ENV_FILE:-/etc/howzero/howzero.env}"
PYTHON_BIN="${HOWZERO_PYTHON:-$ROOT_DIR/.venv/bin/python}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: env file not found: $ENV_FILE" >&2
  exit 2
fi

if [[ ! -x "$PYTHON_BIN" ]]; then
  echo "ERROR: venv python not executable: $PYTHON_BIN" >&2
  exit 2
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

cd "$ROOT_DIR"
exec "$PYTHON_BIN" -m scripts.pipeline "$@"
