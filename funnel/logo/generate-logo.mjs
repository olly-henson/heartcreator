import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(__dirname, 'heart-logo.html');
const outputPath = join(__dirname, 'heart-logo.png');

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 800, height: 800, deviceScaleFactor: 2 });
await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });

await page.screenshot({
  path: outputPath,
  fullPage: false,
  clip: { x: 0, y: 0, width: 800, height: 800 },
});

await browser.close();
console.log(`Logo saved to: ${outputPath}`);
