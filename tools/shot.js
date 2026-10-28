// Screenshot a page (file path or http URL) at one or more widths, to check layout. Outside requests are blocked
// (no tracking hits, no webhooks) except Google Fonts and YouTube thumbnails.
// Usage: node shot.js PAGE OUTPREFIX [widths=1280,390]
//   -> OUTPREFIX-1280.png, OUTPREFIX-390.png, and prints any page errors / sideways overflow.
const path = require('path');
const puppeteer = require(path.join('C:/Users/Olly/AI OS/heartattractor/funnel/node_modules/puppeteer'));
const [page, prefix, widths = '1280,390'] = process.argv.slice(2);
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.dismiss());
  await p.setRequestInterception(true);
  const home = /^https?:\/\//.test(page) ? new URL(page).origin : null;
  p.on('request', r => { const u = r.url();
    if (u.startsWith('file:') || (home && u.startsWith(home)) || /fonts\.(googleapis|gstatic)|i\.ytimg\.com/.test(u)) return r.continue();
    r.respond({ status: 204, body: '' }); });
  for (const w of widths.split(',').map(Number)) {
    await p.setViewport({ width: w, height: w > 600 ? 900 : 844 });
    await p.goto(/^https?:/.test(page) ? page : 'file:///' + path.resolve(page), { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));
    const over = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    await p.screenshot({ path: `${prefix}-${w}.png` });
    console.log(`${w}px -> ${prefix}-${w}.png${over ? '  (SIDEWAYS OVERFLOW)' : ''}`);
  }
  console.log(errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no page errors'); await b.close();
})();
