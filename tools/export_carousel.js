// Export every .slide of a carousel page as its own PNG (exact element size, e.g. 1080x1350), plus a contact sheet.
// Usage: node tools/export_carousel.js PAGE.html OUTDIR  -> OUTDIR/01.png ... NN.png + OUTDIR/contact-sheet.png
const path = require('path'), fs = require('fs');
const puppeteer = require(path.join('C:/Users/Olly/AI OS/heartattractor/funnel/node_modules/puppeteer'));
const [page, outdir] = process.argv.slice(2);
(async () => {
  fs.mkdirSync(outdir, { recursive: true });
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.setViewport({ width: 1200, height: 1400, deviceScaleFactor: 1 });
  await p.goto('file:///' + path.resolve(page), { waitUntil: 'networkidle0' });
  await p.evaluateHandle('document.fonts.ready'); await new Promise(r => setTimeout(r, 600));
  const slides = await p.$$('.slide');
  const over = await p.evaluate(() => [...document.querySelectorAll('.slide')].map((s, i) => {
    const r = s.getBoundingClientRect(), bad = [];
    s.querySelectorAll('.head, .board, .note, .foot, .ctabox').forEach(e => { const q = e.getBoundingClientRect(); if (q.bottom > r.bottom + 1 || e.scrollHeight > e.clientHeight + 2) bad.push(e.className); });
    return bad.length ? `slide ${i + 1}: ${bad.join(', ')}` : null; }).filter(Boolean));
  const files = [];
  for (let i = 0; i < slides.length; i++) {
    const jpg = !!process.env.JPG;   // JPG=1: smaller files for web pages (the guide page), PNG for Instagram
    const f = path.join(outdir, String(i + 1).padStart(2, '0') + (jpg ? '.jpg' : '.png'));
    await slides[i].screenshot(jpg ? { path: f, type: 'jpeg', quality: 86 } : { path: f });
    files.push(f);
  }
  // contact sheet: 5 across, scaled down
  const cols = 5, w = 300, h = 375, gap = 16;
  const rows = Math.ceil(files.length / cols);
  const imgs = files.map((f, i) => `<figure><img src="data:image/${process.env.JPG ? 'jpeg' : 'png'};base64,${fs.readFileSync(f).toString('base64')}"><figcaption>${i + 1}</figcaption></figure>`).join('');
  const sp = await b.newPage();
  await sp.setViewport({ width: cols * (w + gap) + gap, height: rows * (h + 40 + gap) + gap });
  await sp.setContent(`<style>body{margin:0;padding:${gap}px;background:#2a2233;display:grid;grid-template-columns:repeat(${cols},${w}px);gap:${gap}px;font:700 18px Arial;color:#fff}figure{margin:0}img{width:${w}px;height:${h}px;display:block;border-radius:6px}figcaption{text-align:center;padding-top:6px}</style>${imgs}`, { waitUntil: 'load' });
  await sp.screenshot({ path: path.join(outdir, 'contact-sheet.png'), fullPage: true });
  console.log(files.length, 'slides ->', outdir);
  console.log(over.length ? 'OVERFLOW: ' + over.join(' | ') : 'no overflow');
  console.log(errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no page errors'); await b.close();
})();
