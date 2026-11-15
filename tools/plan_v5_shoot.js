// Plan v5 (2026-11-15): render each section of an applicant page file at 1080x1350 (deviceScaleFactor 2) and print the gap above each footer (0 or negative = check it visually).
// Usage: node tools/plan_v5_shoot.js <pages-folder> [file=pages.html] [outdir=out] [selector=.pg]   e.g. short.html short-out | og.html og-out .og
const path = require('path'), fs = require('fs');
const puppeteer = require('C:/Users/Olly/AI OS/heartattractor/funnel/node_modules/puppeteer');
const dir = process.argv[2], file = process.argv[3] || 'pages.html', outdir = process.argv[4] || 'out', sel = process.argv[5] || '.pg';
const img = 'file:///C:/Users/Olly/AI OS/heartattractor/business management/business hub/hub-site/public/plan-img';
(async () => {
  const html = fs.readFileSync(path.join(dir, file), 'utf8').split('src="IMG/').join('src="' + img + '/');
  fs.writeFileSync(path.join(dir, '_render_' + file), html);
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  const p = await b.newPage();
  await p.setViewport({ width: 700, height: 900, deviceScaleFactor: 2 });
  await p.goto('file:///' + path.join(dir, '_render_' + file).split(path.sep).join('/'), { waitUntil: 'networkidle0' });
  await p.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 600));
  const over = await p.evaluate((sel) => [...document.querySelectorAll(sel)].map((s, i) => {
    const f = s.querySelector('.foot');
    const kids = [...s.children].filter(c => c !== f);
    const last = Math.max(...kids.map(c => c.getBoundingClientRect().bottom));
    return f ? [i + 1, Math.round(f.getBoundingClientRect().top - last)] : [i + 1, 'n/a'];
  }), sel);
  console.log('gap above footer (negative = overlap):', JSON.stringify(over));
  const pgs = await p.$$(sel);
  fs.mkdirSync(path.join(dir, outdir), { recursive: true });
  for (let i = 0; i < pgs.length; i++)
    await pgs[i].screenshot({ path: path.join(dir, outdir, String(i + 1).padStart(2, '0') + '.jpg'), type: 'jpeg', quality: 88 });
  await b.close();
})();
