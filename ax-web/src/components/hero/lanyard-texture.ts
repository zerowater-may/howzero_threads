// card.glb UV 기준: 1376×1376 정사각 텍스처, 앞면 ≈ x 0~688 영역. (레퍼런스 CardTemplate 좌표 계승)
// 실명 금지 — 스펙 §3. 문구는 Founder 크리덴셜만.
const SIZE = 1376;

export function makeHowzeroCardTexture(): string {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, SIZE, SIZE);

  const RIGHT = SIZE / 2 - 55;

  ctx.fillStyle = "#f97316";
  ctx.font = "800 110px 'Pretendard Variable', sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("howzero", 55, 190);

  ctx.fillStyle = "#9a9aa0";
  ctx.font = "500 40px 'IBM Plex Mono', monospace";
  ctx.fillText("AX EXECUTION PARTNER", 55, 280);

  ctx.textAlign = "right";
  ctx.fillStyle = "#ffffff";
  ctx.font = "600 52px 'IBM Plex Mono', monospace";
  ctx.fillText("FOUNDER", RIGHT, SIZE - 460);
  ctx.fillStyle = "#9a9aa0";
  ctx.font = "500 40px 'Pretendard Variable', sans-serif";
  ctx.fillText("연매출 10억 SaaS 운영자", RIGHT, SIZE - 396);

  ctx.fillStyle = "#f97316";
  ctx.fillRect(55, SIZE - 340, 200, 6);

  ctx.textAlign = "center";
  ctx.fillStyle = "#f97316";
  ctx.font = "800 72px 'Pretendard Variable', sans-serif";
  ctx.fillText("howzero", 1030, 640);

  return canvas.toDataURL("image/png");
}
