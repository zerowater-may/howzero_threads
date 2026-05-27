// HTML 파일을 960×360 (deviceScaleFactor 2 → 1920×720 px 실제) PNG로 렌더한다.
// content_carousel/capture.mjs 패턴 단순화 버전.
// Usage: node capture.mjs <html-path> <out-png-path>
import path from "path";
import fs from "fs";
import puppeteer from "puppeteer";

async function main() {
  const [, , htmlPath, outPath] = process.argv;
  if (!htmlPath || !outPath) {
    console.error("Usage: node capture.mjs <html-path> <out-png-path>");
    process.exit(1);
  }
  const url = `file://${path.resolve(htmlPath)}`;
  const launchArgs = process.getuid?.() === 0
    ? ["--no-sandbox", "--disable-setuid-sandbox"]
    : [];
  const browser = await puppeteer.launch({ headless: "new", args: launchArgs });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 960, height: 360, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.evaluateHandle("document.fonts.ready");
    fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
    await page.screenshot({
      path: path.resolve(outPath),
      type: "png",
      clip: { x: 0, y: 0, width: 960, height: 360 },
    });
    console.log(`captured ${outPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
