// HTML 파일을 PNG로 렌더한다.
// Usage: node capture.mjs <html-path> <out-png-path> [width] [height] [scale]
// 기본값: 960 × 360 viewport, deviceScaleFactor 2 → 1920×720 PNG
import path from "path";
import fs from "fs";
import puppeteer from "puppeteer";

async function main() {
  const [, , htmlPath, outPath, widthArg, heightArg, scaleArg] = process.argv;
  if (!htmlPath || !outPath) {
    console.error("Usage: node capture.mjs <html-path> <out-png-path> [width] [height] [scale]");
    process.exit(1);
  }
  const width = widthArg ? parseInt(widthArg, 10) : 960;
  const height = heightArg ? parseInt(heightArg, 10) : 360;
  const deviceScaleFactor = scaleArg ? parseInt(scaleArg, 10) : 2;
  const url = `file://${path.resolve(htmlPath)}`;
  const launchArgs = process.getuid?.() === 0
    ? ["--no-sandbox", "--disable-setuid-sandbox"]
    : [];
  const browser = await puppeteer.launch({ headless: "new", args: launchArgs });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor });
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.evaluateHandle("document.fonts.ready");
    fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
    await page.screenshot({
      path: path.resolve(outPath),
      type: "png",
      clip: { x: 0, y: 0, width, height },
    });
    console.log(`captured ${outPath} (${width * deviceScaleFactor}×${height * deviceScaleFactor})`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
