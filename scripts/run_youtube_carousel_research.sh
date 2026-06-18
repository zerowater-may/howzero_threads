#!/usr/bin/env bash
set -uo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/run_youtube_carousel_research.sh <youtube-url> [options]

Options:
  --brand <brand>        산출물 이름에 쓸 브랜드 키. 기본: braveyong
  --slug <slug>          산출물 slug. 기본: 영상 ID 또는 timestamp
  --mode <text|full>     mcptube 모드. text는 vision frame 분석 생략. 기본: text
  --out-root <path>      출력 루트. 기본: reports/youtube-carousel
  --skip-highlights      scripts.yt_highlights fallback 추출 생략
  --dry-run              실제 실행 없이 명령만 출력
  -h, --help             도움말 출력

Outputs:
  <out-root>/<brand>-<slug>-<timestamp>/
    mcptube-add.log
    mcptube-export.log
    mcptube-wiki/
    yt-highlights/
    NEXT_STEPS.md
EOF
}

if [[ $# -eq 0 ]]; then
  usage
  exit 2
fi

url=""
brand="braveyong"
slug=""
mode="text"
out_root="reports/youtube-carousel"
skip_highlights=0
dry_run=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --brand)
      brand="${2:?--brand requires a value}"
      shift 2
      ;;
    --slug)
      slug="${2:?--slug requires a value}"
      shift 2
      ;;
    --mode)
      mode="${2:?--mode requires a value}"
      shift 2
      ;;
    --out-root)
      out_root="${2:?--out-root requires a value}"
      shift 2
      ;;
    --skip-highlights)
      skip_highlights=1
      shift
      ;;
    --dry-run)
      dry_run=1
      shift
      ;;
    --*)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
    *)
      if [[ -n "$url" ]]; then
        echo "Only one YouTube URL is supported per run." >&2
        exit 2
      fi
      url="$1"
      shift
      ;;
  esac
done

if [[ -z "$url" ]]; then
  echo "YouTube URL is required." >&2
  exit 2
fi

if [[ "$mode" != "text" && "$mode" != "full" ]]; then
  echo "--mode must be text or full." >&2
  exit 2
fi

if ! command -v mcptube >/dev/null 2>&1; then
  echo "mcptube is not installed. Run: pipx install mcptube --python /opt/homebrew/bin/python3.12" >&2
  exit 127
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required." >&2
  exit 127
fi

load_env_file() {
  local file="$1"
  if [[ -f "$file" ]]; then
    set -a
    # shellcheck disable=SC1090
    . "$file"
    set +a
  fi
}

load_env_file ".env"
load_env_file ".env.local"
load_env_file ".env.gemini"

if [[ -z "${GOOGLE_API_KEY:-}" && -n "${GEMINI_API_KEY:-}" ]]; then
  export GOOGLE_API_KEY="$GEMINI_API_KEY"
fi

timestamp="$(date +%Y%m%d-%H%M%S)"
video_id="$(printf '%s' "$url" | sed -nE 's#.*(v=|youtu\.be/|shorts/|embed/)([A-Za-z0-9_-]{11}).*#\2#p' | head -n 1)"
if [[ -z "$slug" ]]; then
  slug="${video_id:-$timestamp}"
fi

safe_brand="$(printf '%s' "$brand" | sed -E 's/[^A-Za-z0-9._-]+/-/g; s/^-+|-+$//g')"
safe_slug="$(printf '%s' "$slug" | sed -E 's/[^A-Za-z0-9._-]+/-/g; s/^-+|-+$//g')"
run_dir="$out_root/${safe_brand}-${safe_slug}-${timestamp}"

export MCPTUBE_DATA_DIR="${MCPTUBE_DATA_DIR:-$out_root/.mcptube}"
mkdir -p "$run_dir" "$MCPTUBE_DATA_DIR"

mcptube_cmd=(mcptube add "$url")
if [[ "$mode" == "text" ]]; then
  mcptube_cmd+=(--text-only)
fi

export_cmd=(mcptube wiki export --format markdown --output "$run_dir/mcptube-wiki")
highlight_cmd=(python3 -m scripts.yt_highlights "$url" --out "$run_dir/yt-highlights")

echo "Run dir: $run_dir"
echo "MCPTUBE_DATA_DIR: $MCPTUBE_DATA_DIR"
echo "Mode: $mode"

if [[ -z "${ANTHROPIC_API_KEY:-}" && -z "${OPENAI_API_KEY:-}" && -z "${GOOGLE_API_KEY:-}" ]]; then
  echo "Warning: no LLM API key found for mcptube. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_API_KEY." >&2
fi

if [[ "$dry_run" -eq 1 ]]; then
  printf 'DRY RUN:'
  printf ' %q' "${mcptube_cmd[@]}"
  printf '\n'
  printf 'DRY RUN:'
  printf ' %q' "${export_cmd[@]}"
  printf '\n'
  if [[ "$skip_highlights" -eq 0 ]]; then
    printf 'DRY RUN:'
    printf ' %q' "${highlight_cmd[@]}"
    printf '\n'
  fi
else
  "${mcptube_cmd[@]}" >"$run_dir/mcptube-add.log" 2>&1
  mcptube_status=$?
  if [[ "$mcptube_status" -ne 0 ]]; then
    echo "Warning: mcptube add failed with status $mcptube_status. See $run_dir/mcptube-add.log" >&2
  fi

  "${export_cmd[@]}" >"$run_dir/mcptube-export.log" 2>&1
  export_status=$?
  if [[ "$export_status" -ne 0 ]]; then
    echo "Warning: mcptube export failed with status $export_status. See $run_dir/mcptube-export.log" >&2
  fi

  if [[ "$skip_highlights" -eq 0 ]]; then
    "${highlight_cmd[@]}" >"$run_dir/yt-highlights.log" 2>&1
    highlights_status=$?
    if [[ "$highlights_status" -ne 0 ]]; then
      echo "Warning: yt_highlights failed with status $highlights_status. See $run_dir/yt-highlights.log" >&2
    fi
  fi
fi

cat >"$run_dir/NEXT_STEPS.md" <<EOF
# YouTube Carousel Research

- URL: $url
- Brand: $brand
- Mode: $mode
- MCPTube data dir: $MCPTUBE_DATA_DIR

## 캐러셀 제작 사용법

1. \`mcptube-wiki/\`에서 컴파일된 wiki 페이지를 읽는다.
2. \`yt-highlights/highlights.json\`에서 timestamp별 핵심 구간을 읽는다.
3. \`yt-highlights/frames/\`는 원본 영상 프레임 재사용이 안전할 때만 쓴다.
4. 최종 캐러셀은 \`docs/content/carousel-...\` 또는 \`brands/$brand/${brand}_carousel_...\` 아래에 만든다.

## Commands Run

\`\`\`bash
$(printf '%q ' "${mcptube_cmd[@]}")
$(printf '%q ' "${export_cmd[@]}")
$(if [[ "$skip_highlights" -eq 0 ]]; then printf '%q ' "${highlight_cmd[@]}"; fi)
\`\`\`
EOF

echo "Done: $run_dir"
