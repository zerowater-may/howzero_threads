#!/usr/bin/env bash
# brands-organize/check-leftover.sh
# Stop hook용 read-only 잔여 검사. 발견 시 stderr 알림만, 자동 이동 X.

export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

ROOT="${HOWZERO_ROOT:-/Users/zerowater/Dropbox/zerowater/howzero}"
cd "$ROOT" 2>/dev/null || exit 0

shopt -s nullglob
c=0; m=0
for d in docs/content/carousel-*; do [ -d "$d" ] && c=$((c+1)); done
for f in .claude/skills/carousel/brands/*/reels/out/*.mp4; do [ -f "$f" ] && m=$((m+1)); done
total=$((c + m))

if [ "$total" -gt 0 ]; then
  printf '\n[brands-organize] Unfiled content: carousel=%d, reels.mp4=%d\n' "$c" "$m" >&2
  printf '  To organize: ./.claude/skills/brands-organize/scripts/organize.sh --execute\n\n' >&2
fi
exit 0
