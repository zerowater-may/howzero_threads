import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const puppeteer = (await import('../../../scripts/content_carousel/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js')).default;
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
await page.goto(`file://${resolve(__dirname, 'slides.html')}`, { waitUntil: 'networkidle0' });
await new Promise((resolveDelay) => setTimeout(resolveDelay, 1600));

const slideCount = await page.$$eval('[id^="slide-"]', (slides) => slides.length);
for (let i = 1; i <= slideCount; i += 1) {
  const slide = await page.$(`#slide-${i}`);
  await slide.screenshot({
    path: resolve(__dirname, `slide-${String(i).padStart(2, '0')}.png`),
    type: 'png',
  });
  console.log(`slide-${String(i).padStart(2, '0')}.png`);
}

console.log(`total ${slideCount} slides`);
await browser.close();
