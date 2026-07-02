import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(__dirname, 'sections', 'practice-guide.html');
const outputPath = join(__dirname, 'Heart Activation Practice Guide.pdf');

const browser = await puppeteer.launch();
const page = await browser.newPage();

await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });

// Measure exact content height
const height = await page.evaluate(() => document.querySelector('.page').getBoundingClientRect().height);
const width = await page.evaluate(() => document.querySelector('.page').getBoundingClientRect().width);

await page.pdf({
  path: outputPath,
  width: `${width}px`,
  height: `${height + 1}px`,
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});

await browser.close();
console.log(`PDF saved to: ${outputPath}`);
