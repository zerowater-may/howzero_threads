// Captures each .slide div inside the rendered HTML as a separate PNG.
// Usage: node capture.mjs <html-path> <out-dir>
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import puppeteer from "puppeteer";

async function main() {
  const [, , htmlPath, outDir] = process.argv;
  if (!htmlPath || !outDir) {
    console.error("Usage: node capture.mjs <html-path> <out-dir>");
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });
  const absHtml = path.resolve(htmlPath);
  const url = `file://${absHtml}`;

  const launchArgs = process.getuid?.() === 0
    ? ["--no-sandbox", "--disable-setuid-sandbox"]
    : [];
  const browser = await puppeteer.launch({ headless: "new", args: launchArgs });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.evaluateHandle("document.fonts.ready");

  const count = await page.evaluate(() => document.querySelectorAll(".slide").length);
  console.log(`found ${count} slides`);

  for (let i = 0; i < count; i++) {
    const handle = await page.evaluateHandle((idx) => document.querySelectorAll(".slide")[idx], i);
    const slide = handle.asElement();
    const file = path.join(outDir, `slide-${String(i + 1).padStart(2, "0")}.png`);
    await slide.screenshot({ path: file });
    console.log(`captured ${file}`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
