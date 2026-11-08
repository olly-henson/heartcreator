"""Build the Hub's Plan of action page from the approved template.

Source:  funnel/plan-of-action.html  (the design + wording Olly signs off; example data only)
Output:  business management/business hub/hub-site/public/plan.html  (opened from a Sales card: /plan.html?id=<contactId>)

The Hub page fills every box from the applicant's GHL answers (/api/applicants), loads any saved edits
(/api/plan), and adds Save / Send on WhatsApp (share sheet with the page images) / Download PDF.
Re-run after ANY change to the template, then deploy the Hub (tools/deploy-hub.sh).
Usage:  python -I tools/build_hub_plan.py
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'funnel', 'plan-of-action.html')
OUT = os.path.join(ROOT, 'business management', 'business hub', 'hub-site', 'public', 'plan.html')

s = open(SRC, encoding='utf-8').read()

HEAD = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
'''
s = HEAD + s.replace('<title>Plan of Action</title>', '<title>Plan of Action · Hub</title>', 1)
s = s.replace('<style>', '<style>\n:root { padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }\n[hidden] { display: none !important; }\nbody { margin: 0; font-size: 14px; }\n.miss { border-color: #f59e0b !important; background: color-mix(in srgb, #f59e0b 12%, var(--ui-field)) !important; }\n.back { font-size: 13px; color: var(--ui-accent); text-decoration: none; font-weight: 600; }\n.status { font-size: 12px; color: var(--ui-muted); min-height: 1em; margin: 0; }\n.linkbox { display: flex; flex-direction: column; gap: 8px; padding: 12px; border: 1px solid var(--ui-line); border-radius: 10px; background: var(--ui-field); }\n.linkbox small { font-size: 12px; color: var(--ui-muted); }\n.linkbox code { font-size: 13px; word-break: break-all; color: var(--ui-fg); }\n.lbtn { font: 600 14px var(--body); border-radius: 50px; padding: 10px 18px; color: #fff; background: #25a35a; text-decoration: none; }\n.lbtn.ghostl { background: transparent; color: var(--ui-fg); border: 1px solid var(--ui-line); }\n', 1)

# header: back link + title
s = s.replace('<h1>Plan of action for an applicant</h1>', '<a class="back" href="/">← Back to the Hub</a>\n    <h1>Plan of action</h1>', 1)
s = s.replace('<p class="lead">Fill in their answers from the application and Feeling Finder, in their own words. The 5 pages update as you type.</p>',
              '<p class="lead">Filled in from their application and Feeling Finder. Check the boxes, edit anything, then save and send.</p>', 1)
s = s.replace('<div class="note" id="exampleNote">This is filled in with an example. Swap in their answers. Nothing you type here is saved.</div>',
              '<div class="note" id="exampleNote">Loading their answers…</div>', 1)

# buttons
old_btns = re.search(r'<div class="btns">.*?</p>', s, flags=re.S).group(0)
new_btns = '''<div class="btns">
      <button type="button" id="linkPlan">Make their link</button>
      <button type="button" class="ghost" id="savePlan">Save changes</button>
      <button type="button" id="sharePlan">Send on WhatsApp</button>
      <button type="button" class="ghost" id="pdfPlan">Download PDF</button>
      <button type="button" class="ghost" id="makeImgs">Save images</button>
    </div>
    <p class="status" id="planStatus"></p>
    <div class="linkbox" id="linkBox" hidden>
      <small>Their private link (opens and PDF downloads show on their Sales card)</small>
      <code id="linkUrl"></code>
      <small>The message that goes with it</small>
      <textarea id="linkMsgText" rows="9" style="font-size:14px;line-height:1.5"></textarea>
      <small>Edit the wording here if it needs it. The buttons send what's in the box.</small>
      <div class="btns"><a id="linkWa" class="lbtn" target="_blank" rel="noopener">Send on WhatsApp</a><a id="linkEm" class="lbtn" style="background:#7b4fd6">Send by email</a><button type="button" id="linkMsg">Copy message</button><button type="button" class="ghost" id="linkCopy">Copy link only</button><a id="linkView" class="lbtn ghostl" target="_blank" rel="noopener">Preview</a></div>
    </div>'''
s = s.replace(old_btns, new_btns, 1)
s = s.replace('<button type="button" class="ghost" id="reset">Clear</button>', '', 1)

# the template's Clear handler targets #reset, which no longer exists: guard it
s = s.replace("document.getElementById('reset').addEventListener(", "(document.getElementById('reset') || document.createElement('i')).addEventListener(", 1)

LOADER = r'''
<script>
/* Hub loader: fill from GHL, saved edits, save, share, PDF (2026-11-08). */
(function () {
  var id = new URLSearchParams(location.search).get('id') || '';
  try { localStorage.setItem('hubOwner', '1'); } catch (e) {}
  var note = document.getElementById('exampleNote'), status = document.getElementById('planStatus');
  var inputs = [].slice.call(document.querySelectorAll('[data-k]'));
  var who = '';
  function say(t) { status.textContent = t; }
  function low(v) { v = String(v || '').trim(); return /^I\b/.test(v) ? v : v.charAt(0).toLowerCase() + v.slice(1); }
  function cap(v) { v = String(v || '').trim(); return v.charAt(0).toUpperCase() + v.slice(1); }
  function you(v) { return String(v || '').replace(/\bmyself\b/gi, 'yourself').replace(/\bme\b/gi, 'you').replace(/\bmy\b/gi, 'your').replace(/\bI'm\b/g, "you're").replace(/\bI am\b/g, 'you are'); }
  function andList(a) { a = a.filter(Boolean); return a.length < 2 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function ans(a, re) { var k = Object.keys(a.fields || {}).filter(function (n) { return re.test(n); })[0]; return k ? String(a.fields[k] || '').trim() : ''; }
  function sentences(t, max) { var p = String(t || '').match(/[^.!?]+[.!?]*/g) || []; var out = ''; for (var i = 0; i < p.length; i++) { if ((out + p[i]).length > max && out) break; out += p[i]; } return out.trim(); }
  function auto(a) {
    var tried = ans(a, /^HA Tried/i).split(/\s*,\s*/).map(low).filter(Boolean);
    var ints = ans(a, /^FF Intentions/i).split(/\s*[·|]\s*/).map(function (x) { return low(you(x)); }).filter(Boolean);
    var res = low(ans(a, /^FF Resonance/i));
    var want = ans(a, /^HA Relationship Wanted/i);
    var apps = tried.some(function (t) { return /dating app/i.test(t); });
    return {
      name: cap(a.firstName || ''),
      now: sentences(ans(a, /^HA Feelings About Love/i), 170),
      want: want ? cap(want).replace(/([^.!?])$/, '$1.') : '',
      tried: andList(tried),
      q1: ints[0] || '', q2: ints[1] || '', q3: ints[2] || '', q4: ints[3] || '',
      feels: res, feel1: res,
      oldfeel: low(ans(a, /^FF Current Emotion/i)),
      moments: 'catching yourself overthinking about love' + (apps ? ', and opening a dating app' : '')
    };
  }
  function mark() { inputs.forEach(function (el) { el.classList.toggle('miss', !el.value.trim() && el.dataset.k !== 'q4'); }); }
  function apply(v) {
    inputs.forEach(function (el) { el.value = v[el.dataset.k] != null ? v[el.dataset.k] : ''; });
    inputs[0].dispatchEvent(new Event('input')); note.hidden = false; mark();
  }
  inputs.forEach(function (el) { el.addEventListener('input', mark); });
  if (!id) { note.textContent = 'Open this from an applicant card in the Sales tab.'; apply({}); return; }
  Promise.all([
    fetch('/api/applicants', { cache: 'no-store' }).then(function (r) { return r.json(); }),
    fetch('/api/plan?id=' + encodeURIComponent(id), { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; })
  ]).then(function (res) {
    var a = ((res[0] && res[0].applicants) || []).filter(function (x) { return x.id === id; })[0];
    if (!a) { note.textContent = "Couldn't find this applicant in GHL. Go back to the Hub and refresh the Sales tab."; apply({}); return; }
    who = cap(a.firstName || 'them'); phone = String(a.phone || '').replace(/[^\d]/g, ''); mail = String(a.email || '').trim();
    var saved = res[1] && res[1].plan;
    var v = auto(a); if (saved) Object.keys(saved).forEach(function (k) { if (k.charAt(0) !== '_') v[k] = saved[k]; });
    apply(v);
    document.title = who + "'s Plan of Action";
    note.textContent = saved ? 'Your saved version for ' + who + '. Orange boxes are still empty.' : 'Filled in from ' + who + "'s answers. Check the anchor moments line and anything in orange, then save.";
  }).catch(function () { note.textContent = "Couldn't reach GHL. If you've been away a while, reload to log in again."; apply({}); });

  var phone = '', mail = '';
  function save() {
    var body = {}; inputs.forEach(function (el) { body[el.dataset.k] = el.value; });
    return fetch('/api/plan?id=' + encodeURIComponent(id), { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); }).then(function (d) { if (!d || !d.ok) throw new Error('save'); return d; });
  }
  document.getElementById('savePlan').addEventListener('click', function () {
    say('Saving…');
    save().then(function () { say('Saved ✓'); }, function () { say('Not saved. Check your connection and try again.'); });
  });
  document.getElementById('linkPlan').addEventListener('click', function () {
    if (!id) return;
    say('Saving and making their link…');
    save().then(function () { return fetch('/api/plan?id=' + encodeURIComponent(id), { method: 'POST' }).then(function (r) { return r.json(); }); })
      .then(function (d) {
        if (!d || !d.ok) throw new Error('link');
        var url = location.origin + '/p/' + d.code;
        document.getElementById('linkUrl').textContent = url;
        // Olly's message, word for word (2026-11-08). Only the first name and the link change.
        var goal = (document.querySelector('[data-k="want"]').value || '').trim().replace(/[.!]+$/, '');
        goal = goal ? goal.charAt(0).toLowerCase() + goal.slice(1) : 'where you want to be with your person';
        var msg = 'Hey ' + (who || 'there') + ', so I\u2019ve just reviewed your application and it all looks good.\n\nSo I\u2019ve put together a plan of action of how we can get you to ' + goal + '.\n\n' + url + '\n\nHave a look and let me know if you think this is possible for you.';
        document.getElementById('linkMsgText').value = msg; setLinks();

        document.getElementById('linkView').href = url + '?preview=1';
        document.getElementById('linkBox').hidden = false;
        say('Their link is ready. It only counts as sent when you tap Send on WhatsApp, Send by email or one of the Copy buttons. Later edits show on the same link once you save.');
      })
      .catch(function () { say("Couldn't make the link. Check your connection and try again."); });
  });
  function setLinks() {
    var msg = document.getElementById('linkMsgText').value;
    var wa = document.getElementById('linkWa');
    wa.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(msg); wa.hidden = !phone;
    var em = document.getElementById('linkEm');
    em.href = 'mailto:' + mail + '?subject=' + encodeURIComponent('Your plan of action') + '&body=' + encodeURIComponent((msg + '\n\nOlly').replace(/\n/g, '\r\n')); em.hidden = !mail;
  }
  document.getElementById('linkMsgText').addEventListener('input', setLinks);
  function markSent() { fetch('/api/plan?id=' + encodeURIComponent(id) + '&sent=1', { method: 'POST' }).catch(function () {}); }
  document.getElementById('linkWa').addEventListener('click', markSent);
  document.getElementById('linkEm').addEventListener('click', markSent);
  document.getElementById('linkMsg').addEventListener('click', function () {
    var b = this, t = document.getElementById('linkMsgText').value;
    markSent();
    function done() { b.textContent = 'Copied ✓'; setTimeout(function () { b.textContent = 'Copy message'; }, 1200); }
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, function () { document.getElementById('linkMsgText').select(); }); else done();
  });
  document.getElementById('linkCopy').addEventListener('click', function () {
    markSent();
    var b = this, t = document.getElementById('linkUrl').textContent;
    function done() { b.textContent = 'Copied ✓'; setTimeout(function () { b.textContent = 'Copy link only'; }, 1200); }
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, function () { window.getSelection().selectAllChildren(document.getElementById('linkUrl')); }); else done();
  });

  async function pageFiles() {
    await document.fonts.ready;
    var off = document.getElementById('offscreen'), pages = document.querySelectorAll('#stage .pg'), files = [];
    for (var i = 0; i < pages.length; i++) {
      off.innerHTML = ''; var c = pages[i].cloneNode(true); c.style.margin = '0'; c.style.boxShadow = 'none'; off.appendChild(c);
      var canvas = await html2canvas(c, { scale: 2, backgroundColor: '#080010', logging: false });
      var blob = await new Promise(function (ok) { canvas.toBlob(ok, 'image/png'); });
      files.push(new File([blob], (who || 'plan').toLowerCase() + '-plan-' + (i + 1) + '.png', { type: 'image/png' }));
    }
    off.innerHTML = ''; return files;
  }
  function download(files) {
    files.forEach(function (f, i) { setTimeout(function () { var u = URL.createObjectURL(f), l = document.createElement('a'); l.href = u; l.download = f.name; document.body.appendChild(l); l.click(); l.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000); }, i * 400); });
  }
  document.getElementById('sharePlan').addEventListener('click', async function () {
    if (!window.html2canvas) { say('Image maker did not load. Reload and try again.'); return; }
    var b = this; b.disabled = true; say('Making the images…');
    try {
      var files = await pageFiles();
      if (navigator.canShare && navigator.canShare({ files: files })) {
        say('Pick WhatsApp in the share sheet.');
        await navigator.share({ files: files });
        say('Shared ✓');
      } else { download(files); say("This browser can't share images straight to WhatsApp, so they've downloaded instead. Send them in order."); }
    } catch (e) { say(e && e.name === 'AbortError' ? 'Share cancelled.' : 'Something went wrong. Try Save images instead.'); }
    b.disabled = false;
  });
  document.getElementById('pdfPlan').addEventListener('click', function () { say('In the print window, choose Save as PDF.'); window.print(); });
  // "Save images" downloads the PNGs (the template's own button only shows them on the page)
  var mk = document.getElementById('makeImgs'), mk2 = mk.cloneNode(true); mk.parentNode.replaceChild(mk2, mk);
  mk2.addEventListener('click', async function () {
    if (!window.html2canvas) { say('Image maker did not load. Reload and try again.'); return; }
    mk2.disabled = true; say('Making the images…');
    try { download(await pageFiles()); say('Downloaded ✓ Send them in order.'); } catch (e) { say('Something went wrong. Try again.'); }
    mk2.disabled = false;
  });
})();
</script>
'''
s = s.rstrip() + '\n' + LOADER + '</html>\n'
s = s.replace('<div class="wrap">', '</head>\n<body>\n<div class="wrap">', 1)
assert s.count('<div class="wrap">') == 1
s = s.replace('</html>\n', '</body>\n</html>\n')
open(OUT, 'w', encoding='utf-8').write(s)
print('built', OUT)

# ---------- the applicant-facing page: /p/<code> serves public/plan-view.html ----------
t = open(SRC, encoding='utf-8').read()
head = t[:t.index('<div class="wrap">')].replace('<title>Plan of Action</title>', '<title>Your Plan of Action</title>', 1)
stage = t[t.index('<div class="stage" id="stage">'):t.index('<div class="outbox"')].rstrip()
VIEW_CSS = '''<style>
:root { padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }
[hidden] { display: none !important; }
html, body { background: #080010 !important; margin: 0; color: #f8f4ff; }
.bar { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding-block: 12px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); background: rgba(8, 0, 16, .92); border-bottom: 1px solid rgba(196, 181, 253, .15); font-family: var(--body); }
body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: #080010; }
.bar b { font-family: var(--display); font-size: 17px; }
.bar button { font: 600 14px var(--body); border: 0; border-radius: 50px; padding: 10px 18px; cursor: pointer; color: #fff; background: linear-gradient(135deg, #d946ef, #6b21a8); white-space: nowrap; }
.viewwrap { display: flex; justify-content: center; padding-block: 18px 48px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
.msg { text-align: center; padding: 60px 16px; font-family: var(--body); color: #c4b5fd; }
@media print { .bar, body::before { display: none !important; } .viewwrap { padding: 0; display: block; } }
/* Readable on screen (Olly, 2026-11-08: "MUCH bigger ... anyone with visual issues"): one flowing column, large text in rem,
   follows the iPhone's own text-size setting. Print/PDF keeps the fixed designed pages. */
html { font-size: 112.5%; }
@supports (font: -apple-system-body) { html { font: -apple-system-body; } }
@media screen {
  .viewwrap .stage { width: 100%; max-width: 680px; zoom: 1 !important; }
  .viewwrap .pg { width: 100%; height: auto; padding: 2rem 1.25rem 1.5rem; border-radius: 16px; }
  .viewwrap .pg + .pg { margin-top: 1.25rem; }
  .viewwrap .pg .eyebrow { font-size: .85rem; letter-spacing: .1em; }
  .viewwrap .solpill { font-size: .85rem; letter-spacing: .08em; padding: .45rem .9rem; }
  .viewwrap .pg h2, .viewwrap .pg h2.sm { font-size: 2rem; line-height: 1.15; }
  .viewwrap .cover h2 { font-size: 2.5rem; margin-top: 1.25rem; }
  .viewwrap .pg p, .viewwrap .cover .sub, .viewwrap .journey > div, .viewwrap .modes > div, .viewwrap .pg .tl p,
  .viewwrap .stages div, .viewwrap .warn, .viewwrap .support li, .viewwrap .pg p.close { font-size: 1.15rem; line-height: 1.6; }
  .viewwrap .cover .sub { max-width: none; }
  .viewwrap .journey { margin-top: 1.5rem; gap: .5rem; }
  .viewwrap .journey > div { padding: 1rem 1.1rem; }
  .viewwrap .journey .head, .viewwrap .modes .head, .viewwrap .qlabel, .viewwrap .support .head { font-size: .85rem; letter-spacing: .08em; }
  .viewwrap .quote { font-size: 1.3rem; line-height: 1.45; }
  .viewwrap .stack, .viewwrap .stack.tight { gap: 1.1rem; margin-top: 1.25rem; }
  .viewwrap .modes { grid-template-columns: minmax(0, 1fr); gap: .6rem; }
  .viewwrap .modes > div { padding: .9rem 1rem; }
  .viewwrap .modes .ttl { font-size: 1.3rem; margin-bottom: .3rem; }
  .viewwrap .tl { gap: 1.4rem; margin-top: 1.25rem; }
  .viewwrap .tl::before { display: none; }
  .viewwrap .tl li { grid-template-columns: minmax(0, 1fr); gap: .4rem; }
  .viewwrap .tl .when { justify-self: start; font-size: .85rem; padding: .3rem .9rem; }
  .viewwrap .tl h3 { font-size: 1.25rem; margin: 0 0 .25rem; }
  .viewwrap .pg .tl p.you, .viewwrap .pg .tl p.keyline { margin-top: .4rem; }
  .viewwrap .stages { gap: .6rem; margin-top: 1.25rem; }
  .viewwrap .stages .dot { width: .7rem; height: .7rem; }
  .viewwrap .warn { padding: 1rem 1.1rem; margin-top: 1.25rem; }
  .viewwrap .support { margin-top: 1.25rem; }
  .viewwrap .support ul { gap: .5rem; padding-left: 1.3rem; }
  .viewwrap .sign { font-size: 1.5rem; }
  .viewwrap .pg .foot { font-size: .8rem; margin-top: 1.75rem; padding-top: 0; }
  .viewwrap .pg .foot b { font-size: 1rem; }
  .bar b { font-size: 1.15rem; }
  .bar button { font-size: 1rem; padding: .7rem 1.2rem; }
  .msg { font-size: 1.15rem; }
}
</style>
'''
VIEW_JS = r'''
<script>
(function () {
  var code = (location.pathname.split('/')[2] || ''), preview = /[?&]preview/.test(location.search);
  try { if (localStorage.getItem('hubOwner')) preview = true; } catch (e) {}
  var stage = document.getElementById('stage'), msg = document.getElementById('msg');
  function seen(w) { if (preview) return; try { fetch('/p/' + code + '/seen', { method: 'POST', body: w, keepalive: true }); } catch (e) {} }
  function fit() {}
  window.addEventListener('resize', fit);
  function set(k, v) { document.querySelectorAll('[data-v="' + k + '"]').forEach(function (s) { s.textContent = v; }); }
  fetch('/p/' + code + '/data', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
    if (!d || !d.ok) throw new Error('missing');
    var p = d.plan;
    Object.keys(p).forEach(function (k) { set(k, String(p[k] || '').trim()); });
    set('qlist', [p.q1, p.q2, p.q3, p.q4].map(function (x) { return String(x || '').trim(); }).filter(Boolean).join(' · '));
    document.querySelectorAll('[data-show]').forEach(function (s) { s.hidden = !String(p[s.dataset.show] || '').trim(); });
    if (p.name) document.title = p.name + "'s Plan of Action";
    msg.hidden = true; stage.hidden = false; fit();
    seen('open');
  }).catch(function () { msg.textContent = "This plan couldn't load. Please ask Olly for a new link."; });
  document.getElementById('pdfBtn').addEventListener('click', function () { seen('pdf'); window.print(); });
})();
</script>
'''
view = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="robots" content="noindex, nofollow">\n'
        + head + VIEW_CSS + '</head>\n<body>\n<div class="bar"><b>Your plan</b><button type="button" id="pdfBtn">Download PDF</button></div>\n'
        + '<p class="msg" id="msg">Loading your plan…</p>\n<div class="viewwrap">\n' + stage.replace('<div class="stage" id="stage">', '<div class="stage" id="stage" hidden>', 1) + '\n</div>\n'
        + VIEW_JS + '</body>\n</html>\n')
# The Hub editor shows the same large-text column (Olly, 2026-11-08: the editor's shrunk pages were too small on his phone)
_read = VIEW_CSS[VIEW_CSS.index('/* Readable on screen'):VIEW_CSS.index('</style>')]
ed = open(OUT, encoding='utf-8').read()
ed = ed.replace('</style>', _read + '</style>', 1).replace('<div class="pages">', '<div class="pages viewwrap">', 1)
open(OUT, 'w', encoding='utf-8').write(ed)
VOUT = os.path.join(os.path.dirname(OUT), 'plan-view.html')
open(VOUT, 'w', encoding='utf-8').write(view)
print('built', VOUT)
