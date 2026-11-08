// Export a personalised science guide (funnel/applicant-guides/<name>/guide.html) to <name>.pdf + <name>-page-1..N.png (1080x1350).
// Also prints whether each page's text fits. Usage: node tools/export_guide.js funnel/applicant-guides/<name>/guide.html
const path = require('path');
const pp = require(path.join('C:/Users/Olly/AI OS/heartattractor/funnel/node_modules/puppeteer'));
const file = path.resolve(process.argv[2]); const dir = path.dirname(file); const base = path.basename(file, '.html');
(async () => {
  const b = await pp.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  const p = await b.newPage(); await p.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
  await p.goto(require('url').pathToFileURL(file).href, { waitUntil: 'networkidle0' }); await p.evaluate(() => document.fonts.ready);
  console.log(await p.evaluate(() => [...document.querySelectorAll('.pg')].map((g, i) => 'p' + (i + 1) + (g.scrollHeight > g.clientHeight ? ' OVERFLOW ' + (g.scrollHeight - g.clientHeight) + 'px' : ' fits (' + Math.round(g.querySelector('.foot').getBoundingClientRect().top - g.querySelector('.foot').previousElementSibling.getBoundingClientRect().bottom) + 'px spare)')).join('\n')));
  const pages = await p.$$('.pg');
  for (let i = 0; i < pages.length; i++) await pages[i].screenshot({ path: path.join(dir, base + '-page-' + (i + 1) + '.png') });
  await p.emulateMediaType('print');
  await p.pdf({ path: path.join(dir, base + '.pdf'), width: '540px', height: '675px', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await b.close(); console.log('saved to ' + dir);
})();
