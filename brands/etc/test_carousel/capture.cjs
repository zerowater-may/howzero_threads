const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const srcDir = '/Users/zerowater/Downloads/ui_kits 2/gayang-carousel';
const outDir = srcDir;
const tmpDir = '/tmp/gayang-fixed';

// Create temp dir with fixed HTML
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1440, deviceScaleFactor: 2 });

  const files = fs.readdirSync(srcDir)
    .filter(f => f.startsWith('slide-') && f.endsWith('.html'))
    .sort();

  for (const f of files) {
    // Read HTML and fix paths
    let html = fs.readFileSync(path.join(srcDir, f), 'utf8');
    html = html.replace(/\.\.\/\.\.\/assets\/mascots\//g, './assets/mascots/');
    
    // Write fixed HTML to temp
    const tmpFile = path.join(tmpDir, f);
    // But we need CSS too — use absolute path for CSS
    html = html.replace('href="zipsaja.css"', 'href="file://' + path.join(srcDir, 'zipsaja.css') + '"');
    // Fix mascot paths to absolute
    html = html.replace(/\.\/assets\/mascots\//g, 'file://' + path.join(srcDir, 'assets/mascots/'));
    
    fs.writeFileSync(tmpFile, html);
    
    await page.goto('file://' + tmpFile, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 500));
    
    const outName = f.replace('.html', '.png');
    await page.screenshot({ path: path.join(outDir, outName), type: 'png' });
    console.log('✓ ' + outName);
  }

  await browser.close();
  console.log('\nDone! ' + files.length + ' slides captured.');
})();
