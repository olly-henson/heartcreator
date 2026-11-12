// Plan v4 (2026-11-12): screenshot the photo pages of OUTDIR/plan.html (made by build_plan_v4.py) at 1080x1350.
// Usage: node tools/plan_v4_shoot.js OUTDIR
// Template sections: 0 cover, 1-2 old problem/solution (skipped), 3 junction, 4-11 steps, 12 commitment, 13 note, 14 closing.
const path = require('path');
const puppeteer = require('C:/Users/Olly/AI OS/heartattractor/funnel/node_modules/puppeteer');
const dir = path.resolve(process.argv[2]);
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.setViewport({ width: 1400, height: 1000, deviceScaleFactor: 2 });
  await p.goto('file:///' + path.join(dir, 'plan.html').split(path.sep).join('/'), { waitUntil: 'networkidle0' });
  await p.evaluateHandle('document.fonts.ready'); await new Promise(r => setTimeout(r, 800));
  const map = { 0: 1, 3: 9, 4: 10, 5: 11, 6: 12, 7: 13, 8: 14, 9: 15, 10: 16, 11: 17, 12: 18, 13: 19, 14: 20 };
  await p.evaluate(m => {
    if (window.planWording) planWording();
    [...document.querySelectorAll('#stage .pg')].forEach((x, i) => { const f = x.querySelector('.foot span'); if (m[i] && f && /Page/.test(f.textContent)) f.textContent = 'Page ' + m[i] + ' of 20'; x.classList.remove('emptynote'); });
    document.querySelectorAll('[contenteditable]').forEach(e => e.removeAttribute('contenteditable'));
    document.body.classList.remove('wording');
  }, map);
  await p.evaluate(u => { document.querySelectorAll('img').forEach(im => { if (/partner-text/.test(im.src)) im.src = u; }); }, 'file:///' + path.join(dir, 'partner-text.jpg').split(path.sep).join('/'));
  await new Promise(r => setTimeout(r, 800));
  const pgs = await p.$$('#stage .pg');
  if (pgs.length !== 15) console.log('WARNING: expected 15 template pages, got', pgs.length);
  for (const [i, n] of Object.entries(map)) await pgs[i].screenshot({ path: path.join(dir, 'plan', 'p' + String(n).padStart(2, '0') + '.jpg'), type: 'jpeg', quality: 88 });
  console.log(errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no page errors'); await b.close();
})();
