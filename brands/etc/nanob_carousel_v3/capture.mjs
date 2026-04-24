import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1440, deviceScaleFactor: 2 });
await page.goto(`file://${resolve(__dirname, 'slides.html')}`, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));
const n = await page.$$eval('[id^="slide-"]', els => els.length);
for (let i = 1; i <= n; i++) {
  const el = await page.$(`#slide-${i}`);
  await el.screenshot({ path: resolve(__dirname, `slide-${i}.png`), type: 'png' });
  console.log(`slide-${i}.png`);
}
await browser.close();
