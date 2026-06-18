// Capture an element from an HTML file as PNG at exact dimensions.
// Usage: node capture.mjs <html-path> <out-path> [width] [height] [scale] [selector]
import path from "path";
import fs from "fs";
import puppeteer from "puppeteer";

async function main() {
  const [, , htmlPath, outPath, wArg, hArg, sArg, selArg] = process.argv;
  if (!htmlPath || !outPath) {
    console.error("Usage: node capture.mjs <html-path> <out-path> [width] [height] [scale] [selector]");
    process.exit(1);
  }
  const width = Number(wArg) || 2000;
  const height = Number(hArg) || 400;
  const scale = Number(sArg) || 2;
  const selector = selArg || ".banner";
  const absHtml = path.resolve(htmlPath);
  const url = `file://${absHtml}`;
  const outAbs = path.resolve(outPath);
  fs.mkdirSync(path.dirname(outAbs), { recursive: true });

  const launchArgs = process.getuid?.() === 0
    ? ["--no-sandbox", "--disable-setuid-sandbox"]
    : [];
  const browser = await puppeteer.launch({ headless: "new", args: launchArgs });
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: scale });
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.evaluateHandle("document.fonts.ready");

  const handle = await page.$(selector);
  if (!handle) {
    console.error(`ERR: '${selector}' element not found`);
    process.exit(2);
  }
  await handle.screenshot({ path: outAbs, type: "png", omitBackground: false });
  console.log(`captured ${outAbs} (${width}x${height} @${scale}x = ${width * scale}x${height * scale}px)`);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
