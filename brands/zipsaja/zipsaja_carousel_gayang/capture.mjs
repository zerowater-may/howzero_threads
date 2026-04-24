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

const slideCount = await page.$$eval('[id^="slide-"]', els => els.length);

for (let i = 1; i <= slideCount; i++) {
  const slide = await page.$(`#slide-${i}`);
  await slide.screenshot({
    path: resolve(outDir, `slide-${i}.png`),
    type: 'png',
  });
  console.log(`html/slide-${i}.png`);
}

console.log(`\ntotal ${slideCount} slides`);
await browser.close();
