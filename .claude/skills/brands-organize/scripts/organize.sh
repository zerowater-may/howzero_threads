#!/usr/bin/env bash
# brands-organize/organize.sh
# 잔여 카러셀 + 릴스 mp4를 brands/ 컨벤션에 맞춰 자동 이동.
# 기본은 dry-run. 실제 이동은 --execute.

set -euo pipefail

ROOT="${HOWZERO_ROOT:-/Users/zerowater/Dropbox/zerowater/howzero}"
DRY_RUN=1
[ "${1:-}" = "--execute" ] && DRY_RUN=0

cd "$ROOT"

run() {
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[DRY] $*"
  else
    echo "[EXEC] $*"
    "$@"
  fi
}

# brand 추론
infer_brand() {
  local name="$1"
  case "$name" in
    *zipsaja*)   echo "zipsaja" ;;
    *howzero*)   echo "howzero" ;;
    *braveyong*) echo "braveyong" ;;
    *mkt*|*용팀장*|*인플루언서*|*공간임대*|*네이버1000*|*스마트스토어*) echo "mkt" ;;
    # nanob = 시제품, test/tmp/template-overlay = 실험 — 모두 etc 묶음
    *nanob*|*test*|*claude-design*|*template-overlay*|*tmp*) echo "etc" ;;
    *) echo "etc" ;;
  esac
}

# topic 추출 (날짜 suffix 제거)
extract_topic() {
  local name="$1"
  # carousel-{brand}-{topic}-{date}
  echo "$name" | sed -E 's/^carousel-//; s/-(zipsaja|howzero|braveyong|mkt)-/-/; s/-[0-9]{8}$//; s/^(zipsaja|howzero|braveyong|mkt)-//'
}

echo "=== brands-organize SCAN ==="
[ "$DRY_RUN" -eq 1 ] && echo "(DRY-RUN MODE — 실제 이동 없음. --execute 플래그로 실행)" || echo "(EXECUTE MODE)"
echo ""

# 1. 카러셀 디렉토리 잔여
echo "--- 카러셀 잔여 (docs/content/carousel-*) ---"
shopt -s nullglob
moved_carousel=0
for dir in docs/content/carousel-*; do
  [ -d "$dir" ] || continue
  base=$(basename "$dir")
  brand=$(infer_brand "$base")
  topic=$(extract_topic "$base")
  dest="brands/$brand/${brand}_carousel_${topic}"
  if [ -e "$dest" ]; then
    echo "[SKIP] $dir → $dest (이미 존재)"
    continue
  fi
  run mkdir -p "brands/$brand"
  run mv "$dir" "$dest"
  moved_carousel=$((moved_carousel + 1))
done
echo "  → $moved_carousel 개"

echo ""

# 2. 릴스 mp4 잔여
echo "--- 릴스 mp4 잔여 (.claude/skills/carousel/brands/*/reels/out/*.mp4) ---"
moved_reels=0
for mp4 in .claude/skills/carousel/brands/*/reels/out/*.mp4; do
  [ -f "$mp4" ] || continue
  brand=$(echo "$mp4" | sed -E 's|.claude/skills/carousel/brands/([^/]+)/reels/out/.*|\1|')
  fname=$(basename "$mp4")
  # filename 패턴: {brand}-{topic}-{date?}-{variant}.mp4 또는 {brand}-{topic}.mp4
  rest=$(echo "$fname" | sed -E "s/^${brand}-//; s/\.mp4$//")
  # 마지막이 -full / -22s / -raw / -22s 등이면 variant
  variant="main"
  topic="$rest"
  if [[ "$rest" =~ -(full|raw|22s|30s|cover-demo|smoke-t[0-9]+|header-check|check|v[0-9]+)$ ]]; then
    variant="${BASH_REMATCH[1]}"
    topic=$(echo "$rest" | sed -E "s/-${variant}$//")
  fi
  # 끝에 날짜 (-YYYYMMDD) 있으면 제거
  topic=$(echo "$topic" | sed -E 's/-[0-9]{8}$//')
  dest_dir="brands/$brand/${brand}_reels_${topic}"
  dest="$dest_dir/${variant}.mp4"
  if [ -e "$dest" ]; then
    echo "[SKIP] $mp4 → $dest (이미 존재)"
    continue
  fi
  run mkdir -p "$dest_dir"
  run mv "$mp4" "$dest"
  moved_reels=$((moved_reels + 1))
done
echo "  → $moved_reels 개"

echo ""
echo "=== SUMMARY ==="
echo "Carousel moved: $moved_carousel"
echo "Reels moved:    $moved_reels"

if [ "$DRY_RUN" -eq 1 ] && [ $((moved_carousel + moved_reels)) -gt 0 ]; then
  echo ""
  echo "실행하려면: ./.claude/skills/brands-organize/scripts/organize.sh --execute"
fi
