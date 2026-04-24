import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

await page.setViewport({ width: 1200, height: 1500, deviceScaleFactor: 2 });

const htmlPath = resolve(__dirname, 'slides.html');
await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
// 폰트 로딩 대기
await new Promise(r => setTimeout(r, 800));

const slideCount = await page.$$eval('[id^="slide-"]', els => els.length);

for (let i = 1; i <= slideCount; i++) {
  const slide = await page.$(`#slide-${i}`);
  await slide.screenshot({
    path: resolve(__dirname, `slide-${String(i).padStart(2, '0')}.png`),
    type: 'png',
  });
  console.log(`✅ slide-${String(i).padStart(2, '0')}.png`);
}

console.log(`\n🎉 ${slideCount}장 전체 생성 완료!`);
await browser.close();
