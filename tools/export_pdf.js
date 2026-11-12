// Print a page of 1080x1350 .slide sections to a PDF, one slide per page (vector text, small file).
// Usage: node tools/export_pdf.js PAGE.html OUT.pdf
const path = require('path');
const puppeteer = require(path.join('C:/Users/Olly/AI OS/heartattractor/funnel/node_modules/puppeteer'));
const [page, out] = process.argv.slice(2);
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  const p = await b.newPage();
  await p.goto('file:///' + path.resolve(page), { waitUntil: 'networkidle0' });
  await p.evaluateHandle('document.fonts.ready');
  await p.pdf({ path: out, width: '1080px', height: '1350px', printBackground: true, preferCSSPageSize: true });
  console.log('->', out); await b.close();
})();
