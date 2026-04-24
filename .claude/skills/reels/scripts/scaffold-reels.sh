#!/usr/bin/env bash
# 신규 브랜드용 Remotion 릴스 프로젝트 스캐폴드
# Usage: scaffold-reels.sh <brand>
# 예시: scaffold-reels.sh howzero

set -euo pipefail

BRAND="${1:-}"
if [[ -z "$BRAND" ]]; then
  echo "Usage: $0 <brand>   (예: howzero, braveyong)"
  exit 1
fi

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
TEMPLATE="$REPO_ROOT/.claude/skills/carousel/brands/zipsaja/reels"
TARGET="$REPO_ROOT/.claude/skills/carousel/brands/$BRAND/reels"

if [[ ! -d "$TEMPLATE" ]]; then
  echo "Error: 템플릿($TEMPLATE) 없음. 먼저 zipsaja/reels가 있어야 함"
  exit 1
fi

if [[ -d "$TARGET" ]]; then
  echo "Error: $TARGET 이미 존재. 기존 프로젝트 지우거나 다른 브랜드 이름 사용"
  exit 1
fi

# BrandName: 첫 글자만 대문자 (Howzero, Braveyong)
BRAND_PASCAL="$(echo "${BRAND:0:1}" | tr '[:lower:]' '[:upper:]')${BRAND:1}"

echo "▶ 템플릿 복사: $TEMPLATE → $TARGET"
mkdir -p "$(dirname "$TARGET")"
# node_modules, out 제외하고 복사
rsync -a --exclude='node_modules' --exclude='out' --exclude='package-lock.json' \
  "$TEMPLATE/" "$TARGET/"

echo "▶ public/slides 비우기"
rm -f "$TARGET/public/slides/"*.png
rm -f "$TARGET/public/"mascot-*.png 2>/dev/null || true

echo "▶ 파일명·클래스명 치환 (Zipsaja → $BRAND_PASCAL)"

# ZipsajaReel.tsx → <Brand>Reel.tsx
if [[ -f "$TARGET/src/ZipsajaReel.tsx" ]]; then
  mv "$TARGET/src/ZipsajaReel.tsx" "$TARGET/src/${BRAND_PASCAL}Reel.tsx"
fi

# 네이티브 커버 파일은 제거 — 브랜드별로 다시 만들어야 함
rm -f "$TARGET/src/slides/Slide1Cover.tsx"

# 코드 내 식별자 치환
find "$TARGET/src" -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e "s/ZipsajaReel/${BRAND_PASCAL}Reel/g" \
  -e "s/zipsaja/${BRAND}/g" {} +

# package.json 이름 치환
sed -i '' "s/zipsaja-reels/${BRAND}-reels/g" "$TARGET/package.json"
sed -i '' "s/zipsaja-gayang/${BRAND}-out/g" "$TARGET/package.json"

echo "▶ 메인 컴포지션을 PNG-only 모드로 단순화 (네이티브 커버 제거)"
cat > "$TARGET/src/${BRAND_PASCAL}Reel.tsx" <<EOF
import { AbsoluteFill, Img, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";

export const FPS = 30;

const SLIDE_DURATION = 75; // 2.5s @ 30fps
const TRANSITION_DURATION = 18;

// 실제 슬라이드 개수는 public/slides/ 안의 PNG 개수와 일치해야 함.
// /reels 커맨드가 자동 업데이트함.
const SLIDE_COUNT = 12;

export const TOTAL_FRAMES =
  SLIDE_DURATION * SLIDE_COUNT +
  TRANSITION_DURATION * (SLIDE_COUNT - 1);

const BG_COLOR = "#ffffff";

const PngSlide: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const kenBurns = interpolate(frame, [0, SLIDE_DURATION], [1.0, 1.035], {
    easing: Easing.inOut(Easing.ease),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG_COLOR,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          transform: \`scale(\${kenBurns})\`,
          width: 1080,
          height: 1920,
          filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.12))",
        }}
      >
        <Img
          src={staticFile(\`slides/slide-\${index}.png\`)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const ${BRAND_PASCAL}Reel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG_COLOR }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SLIDE_DURATION}>
          <PngSlide index={1} />
        </TransitionSeries.Sequence>

        {Array.from({ length: SLIDE_COUNT - 1 }, (_, i) => i + 2).map((idx) => (
          <>
            <TransitionSeries.Transition
              key={\`t-\${idx}\`}
              presentation={slide({ direction: "from-right" })}
              timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
            />
            <TransitionSeries.Sequence
              key={\`s-\${idx}\`}
              durationInFrames={SLIDE_DURATION}
            >
              <PngSlide index={idx} />
            </TransitionSeries.Sequence>
          </>
        ))}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
EOF

echo "▶ Root.tsx를 PNG-only 모드로 단순화"
cat > "$TARGET/src/Root.tsx" <<EOF
import { Composition } from "remotion";
import { ${BRAND_PASCAL}Reel, FPS, TOTAL_FRAMES } from "./${BRAND_PASCAL}Reel";

export const Root: React.FC = () => {
  return (
    <Composition
      id="${BRAND_PASCAL}Reel"
      component={${BRAND_PASCAL}Reel}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};
EOF

# slides 디렉토리가 비어있으면 빈 상태 유지 (carousel-to-reels.sh가 채움)

echo "▶ 의존성 설치 (npm install, 30초~1분)"
(cd "$TARGET" && npm install --silent)

echo ""
echo "✅ 스캐폴드 완료: $TARGET"
echo ""
echo "다음 단계:"
echo "  1. docs/content/carousel-${BRAND}-<콘텐츠>/ 카러셀 준비"
echo "  2. ./.claude/skills/reels/scripts/carousel-to-reels.sh docs/content/carousel-${BRAND}-<콘텐츠>/"
echo ""
echo "네이티브 커버 추가하려면 src/slides/Slide1Cover.tsx 새로 작성 후"
echo "${BRAND_PASCAL}Reel.tsx에서 <PngSlide index={1} /> 자리에 <Slide1Cover /> 대체."
