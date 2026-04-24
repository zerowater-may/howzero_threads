#!/usr/bin/env bash
# Carousel → Remotion 9:16 Reel 파이프라인
# Usage: carousel-to-reels.sh <carousel-dir> [--brand <brand>] [--duration <sec>]
# 예시: carousel-to-reels.sh docs/content/carousel-zipsaja-gayang-20260420/ --duration 22

set -euo pipefail

CAROUSEL_DIR=""
BRAND=""
DURATION=22

while [[ $# -gt 0 ]]; do
  case "$1" in
    --brand) BRAND="$2"; shift 2 ;;
    --duration) DURATION="$2"; shift 2 ;;
    -h|--help)
      echo "Usage: $0 <carousel-dir> [--brand <brand>] [--duration <sec>]"
      exit 0 ;;
    -*) echo "Unknown flag: $1"; exit 1 ;;
    *) CAROUSEL_DIR="$1"; shift ;;
  esac
done

if [[ -z "$CAROUSEL_DIR" ]]; then
  echo "Error: carousel-dir 인자 필요"
  exit 1
fi

CAROUSEL_DIR="${CAROUSEL_DIR%/}"

if [[ ! -f "$CAROUSEL_DIR/slides.html" ]]; then
  echo "Error: $CAROUSEL_DIR/slides.html 없음 (카러셀 표준 구조 아님)"
  exit 1
fi

# 브랜드 자동 감지
if [[ -z "$BRAND" ]]; then
  BASENAME=$(basename "$CAROUSEL_DIR")
  if [[ "$BASENAME" == *zipsaja* ]]; then BRAND=zipsaja
  elif [[ "$BASENAME" == *howzero* ]]; then BRAND=howzero
  elif [[ "$BASENAME" == *braveyong* ]]; then BRAND=braveyong
  else
    echo "Error: 디렉토리 이름에서 브랜드 감지 실패. --brand 플래그로 지정"
    exit 1
  fi
fi

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
REELS_DIR="$REPO_ROOT/.claude/skills/carousel/brands/$BRAND/reels"

if [[ ! -d "$REELS_DIR" ]]; then
  echo "Error: $REELS_DIR 없음. 신규 브랜드면 scaffold-reels.sh 먼저 실행"
  exit 1
fi

echo "▶ 브랜드: $BRAND"
echo "▶ 카러셀: $CAROUSEL_DIR"
echo "▶ 릴스 프로젝트: $REELS_DIR"
echo "▶ 길이: ${DURATION}s"

CONTENT_ID=$(basename "$CAROUSEL_DIR" | sed 's/carousel-//')
TMP="/tmp/reels-capture-$BRAND-$(date +%s)"

echo ""
echo "▶ Step 1: 9:16 슬라이드 재캡처 ($TMP)"
mkdir -p "$TMP"
cp "$CAROUSEL_DIR/slides.html" "$TMP/slides.html"
cp "$CAROUSEL_DIR/capture.mjs" "$TMP/capture.mjs"
cp "$CAROUSEL_DIR/package.json" "$TMP/package.json"
[[ -d "$CAROUSEL_DIR/assets" ]] && cp -r "$CAROUSEL_DIR/assets" "$TMP/assets"
ln -sf "$CAROUSEL_DIR/node_modules" "$TMP/node_modules"

sed -i '' 's/width: 1080px; height: 1440px/width: 1080px; height: 1920px/' "$TMP/slides.html"
sed -i '' 's/height: 1440/height: 1920/' "$TMP/capture.mjs"

(cd "$TMP" && node capture.mjs)

echo ""
echo "▶ Step 2: PNG 복사"
rm -f "$REELS_DIR/public/slides/"*.png
cp "$TMP/html/"*.png "$REELS_DIR/public/slides/"
SLIDE_COUNT=$(ls "$REELS_DIR/public/slides/" | wc -l | tr -d ' ')
echo "  → ${SLIDE_COUNT}장 복사 완료"

echo ""
echo "▶ Step 3: Remotion 렌더"
mkdir -p "$REELS_DIR/out"
COMP_ID=$(cat "$REELS_DIR/src/Root.tsx" | grep -o 'id="[A-Z][a-zA-Z]*Reel"' | head -1 | sed 's/id="//;s/"//')
COMP_ID="${COMP_ID:-ZipsajaReel}"

(cd "$REELS_DIR" && npx remotion render "$COMP_ID" "out/$BRAND-$CONTENT_ID-full.mp4" --log=error)

echo ""
echo "▶ Step 4: ${DURATION}초 트림 + 인코딩 최적화"
OUT="$REELS_DIR/out/$BRAND-$CONTENT_ID-${DURATION}s.mp4"
ffmpeg -y -i "$REELS_DIR/out/$BRAND-$CONTENT_ID-full.mp4" \
  -t "$DURATION" \
  -c:v libx264 -preset medium -crf 18 \
  -pix_fmt yuv420p -movflags +faststart \
  "$OUT" 2>&1 | tail -2

echo ""
echo "✅ 완료: $OUT"
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration -of csv=p=0 "$OUT"

# Finder 오픈
if [[ "$OSTYPE" == "darwin"* ]]; then
  open -R "$OUT"
fi

# 임시 디렉토리 정리
rm -rf "$TMP"
