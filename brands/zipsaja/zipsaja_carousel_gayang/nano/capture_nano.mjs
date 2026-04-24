import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1440, deviceScaleFactor: 2 });
await page.goto(`file://${resolve(__dirname, 'nano_slides.html')}`, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1200));
const ids = await page.$$eval('[id^="slide-"]', els => els.map(e => e.id));
for (const id of ids) {
  const el = await page.$(`#${id}`);
  await el.screenshot({ path: resolve(__dirname, `nano-${id}.png`), type: 'png' });
  console.log(`nano-${id}.png`);
}
await browser.close();
