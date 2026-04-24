import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

// braveyong size: 1080x1440
await page.setViewport({ width: 1080, height: 1440, deviceScaleFactor: 2 });

const htmlPath = resolve(__dirname, 'slides.html');
await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));

const slideCount = await page.$$eval('[id^="slide-"]', els => els.length);

for (let i = 1; i <= slideCount; i++) {
  const slide = await page.$(`#slide-${i}`);
  await slide.screenshot({
    path: resolve(__dirname, `slide-${i}.png`),
    type: 'png',
  });
  console.log(`slide-${i}.png`);
}

console.log(`\ntotal ${slideCount} slides`);
await browser.close();
