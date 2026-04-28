// Capture each slides/*.html as 1080x1440 PNG to exports/.
// Usage: node lib/export_png.js <output_folder>
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const folder = process.argv[2];
  if (!folder) { console.error('usage: node export_png.js <folder>'); process.exit(1); }
  const slidesDir = path.join(folder, 'slides');
  const outDir = path.join(folder, 'exports');
  fs.mkdirSync(outDir, { recursive: true });

  const files = fs.readdirSync(slidesDir).filter(f => f.endsWith('.html')).sort();
  if (files.length === 0) { console.error('no slides'); process.exit(1); }

  const browser = await puppeteer.launch({ headless: 'new' });
  for (const f of files) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1440, deviceScaleFactor: 2 });
    const url = 'file://' + path.resolve(slidesDir, f);
    await page.goto(url, { waitUntil: 'networkidle0' });
    const out = path.join(outDir, f.replace('.html', '.png'));
    await page.screenshot({ path: out, type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1440 } });
    await page.close();
    console.log('wrote ' + out);
  }
  await browser.close();
})();
