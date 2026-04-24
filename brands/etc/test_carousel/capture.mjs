import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });

const htmlPath = resolve(__dirname, 'slides.html');
await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

for (let i = 1; i <= 8; i++) {
  const slide = await page.$(`#slide-${i}`);
  await slide.screenshot({
    path: resolve(__dirname, `slide-${i}.png`),
    type: 'png',
  });
  console.log(`✅ slide-${i}.png`);
}

console.log('\n🎉 8장 전체 생성 완료!');
await browser.close();
