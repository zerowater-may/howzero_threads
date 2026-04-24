// Usage: node pdf_render.mjs <html-path> <pdf-out-path>
// Reuses puppeteer from sibling content_carousel package
import path from "path";
import fs from "fs";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Resolve puppeteer from sibling content_carousel package
const require = createRequire(path.resolve(__dirname, "../content_carousel/node_modules/package.json"));
const puppeteer = require("puppeteer");

async function main() {
  const [, , htmlPath, pdfPath] = process.argv;
  if (!htmlPath || !pdfPath) {
    console.error("Usage: node pdf_render.mjs <html-path> <pdf-out-path>");
    process.exit(1);
  }
  const absHtml = path.resolve(htmlPath);
  const url = `file://${absHtml}`;
  fs.mkdirSync(path.dirname(pdfPath), { recursive: true });

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.evaluateHandle("document.fonts.ready");
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "1.8cm", bottom: "1.8cm", left: "1.8cm", right: "1.8cm" },
  });
  await browser.close();
  console.log(`pdf written → ${pdfPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
