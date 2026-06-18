#!/usr/bin/env bash
# humanize-text PostToolUse hook (informational only — non-blocking).
#
# Trigger: Write/Edit가 카피 파일에 닿았을 때 stderr로 1줄 reminder.
# 대상: brands/**/*.md, brands/**/components/*.tsx, brands/**/components/*.jsx
# 절대 블로킹 X, 절대 자동 humanize X. 사용자가 인지하도록 알림만.
#
# Claude Code hook payload: stdin으로 JSON ({tool_name, tool_input: {file_path, ...}})
# 종료 코드 0이면 통과, stderr 출력은 transcript에 첨부.

set -euo pipefail

# jq 없으면 silent skip (환경 의존성 회피)
if ! command -v jq >/dev/null 2>&1; then
  exit 0
fi

payload=$(cat)

tool_name=$(printf '%s' "$payload" | jq -r '.tool_name // empty')
file_path=$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty')

# Write/Edit 만 대상 (MultiEdit 포함)
case "$tool_name" in
  Write|Edit|MultiEdit) ;;
  *) exit 0 ;;
esac

# 빈 경로면 skip
[ -z "$file_path" ] && exit 0

# 카피 파일 패턴 매칭
case "$file_path" in
  */brands/*/*.md|*/brands/*/components/*.tsx|*/brands/*/components/*.jsx|*/braveyong_landing_*/components/*.tsx)
    echo "[humanize-text] 카피 파일 수정 감지: ${file_path##*/} — 필요 시 /humanize 로 사람 말투 점검 가능 (자동 적용 안 함)." 1>&2
    ;;
  *)
    : # 다른 파일은 조용히
    ;;
esac

exit 0
