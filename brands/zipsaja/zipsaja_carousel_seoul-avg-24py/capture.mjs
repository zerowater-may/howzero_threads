import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, 'html');
mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1440, deviceScaleFactor: 2 });

const htmlPath = resolve(__dirname, 'slides.html');
await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));

const ids = await page.$$eval('[id^="slide-"]', els => els.map(e => e.id));
for (const id of ids) {
  const el = await page.$(`#${id}`);
  await el.screenshot({ path: resolve(outDir, `${id}.png`), type: 'png' });
  console.log(`html/${id}.png`);
}
await browser.close();
