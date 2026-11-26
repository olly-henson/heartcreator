"""Make a desktop + phone preview Artifact page from a funnel page (Olly's rule: every page preview shows both).

Usage:  python preview_wrap.py PAGE.html OUT.html "Title"
- Blanks any GHL webhook URL (test sign-ups never reach GHL).
- Embeds YouTube thumbnails as data URIs (the Artifact viewer blocks outside images).
- Desktop = the page at 1280px in an iframe, scaled to fit. Phone = 390px phone frame.
Then publish OUT.html with the Artifact tool (same OUT path keeps the same link).
"""
import sys, re, html, base64, urllib.request

page_path, out_path = sys.argv[1], sys.argv[2]
title = sys.argv[3] if len(sys.argv) > 3 else "Page Preview"
page = open(page_path, encoding="utf-8").read()
page = re.sub(r"https://services\.leadconnectorhq\.com/hooks/[^'\"]*", "", page)

def embed(m):
    url = m.group(0)
    try:
        data = urllib.request.urlopen(url, timeout=15).read()
        return "data:image/jpeg;base64," + base64.b64encode(data).decode()
    except Exception:
        return url
page = re.sub(r"https://i\.ytimg\.com/vi/[A-Za-z0-9_-]+/[a-z]+\.jpg", embed, page)

# Skip-through (Olly 2026-11-25: "previews where I can skip through without actually having to input my answers").
# Before any Next/Submit/Continue click (or Enter), every visible empty field on screen gets a sample answer,
# so the page's own "please answer" checks pass. Works on any form without touching the live page.
SKIP = r'''<script>
window.OHC_PREVIEW = true;
(function(){
  function vis(el){ return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length); }
  function fill(){
    var groups = {};
    document.querySelectorAll('input, textarea, select').forEach(function(el){
      if (!vis(el) && !(el.type === 'radio' || el.type === 'checkbox')) return;
      var t = (el.type || '').toLowerCase();
      if (t === 'radio' || t === 'checkbox'){
        var box = el.closest('label') || el;
        if (!vis(box) || !el.name) return;
        if (!(el.name in groups)) groups[el.name] = document.querySelector('input[name="' + el.name + '"]:checked') ? null : el;
        return;
      }
      if (el.tagName === 'SELECT'){
        if (!el.value){ for (var i = 0; i < el.options.length; i++){ if (el.options[i].value && el.options[i].value !== 'other'){ el.value = el.options[i].value; break; } } el.dispatchEvent(new Event('change', {bubbles:true})); }
        return;
      }
      if (/hidden|submit|button|file/.test(t) || el.value) return;
      var key = (el.id + ' ' + el.name + ' ' + t + ' ' + (el.autocomplete || '')).toLowerCase();
      el.value = /mail/.test(key) ? 'preview@example.com' : /tel|phone|whatsapp/.test(key) ? '7911123456' : t === 'number' ? '1' : 'Preview answer';
      el.dispatchEvent(new Event('input', {bubbles:true}));
    });
    Object.keys(groups).forEach(function(n){ var el = groups[n]; if (el){ el.checked = true; el.dispatchEvent(new Event('change', {bubbles:true})); } });
  }
  function isForward(b){ var s = (b.textContent || b.value || '').trim(); return !/^(back|previous|prev)\b/i.test(s); }
  document.addEventListener('click', function(e){ var b = e.target.closest && e.target.closest('button, input[type=submit], [role=button]'); if (b && isForward(b)) fill(); }, true);
  document.addEventListener('keydown', function(e){ if (e.key === 'Enter') fill(); }, true);
})();
</script>'''

doc = ('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
       '<style>html,body{margin:0;padding:0;}</style>' + SKIP + '</head><body>' + page + '</body></html>')
src = html.escape(doc, quote=True)
out = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title>
<style>
:root{{ --bg:#0f0816; --text:#f3eafa; --muted:#a993bd; --line:rgba(225,166,255,.2); }}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,Segoe UI,sans-serif;padding:20px 16px 40px}}
h1{{font-size:18px;margin:0 0 4px}} p.n{{color:var(--muted);font-size:13px;margin:0 0 18px}}
.row{{display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start}}
.lab{{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:0 0 8px}}
.deskbox{{flex:1 1 600px;min-width:0}}
.deskclip{{width:100%;border:1px solid var(--line);border-radius:12px;overflow:hidden}}
.deskclip iframe{{width:1280px;height:900px;border:0;transform-origin:0 0;display:block}}
.phone{{width:390px;height:844px;border:10px solid #2a1838;border-radius:40px;overflow:hidden;background:#000;max-width:calc(100vw - 32px)}}
.phone iframe{{width:100%;height:100%;border:0;display:block}}
</style></head><body>
<h1>{html.escape(title)}: desktop and phone</h1>
<p class="n">The real page at desktop width (1280px, shrunk to fit) and phone width (390px). Forms are switched off in this preview. Skip-through is on: press Next without answering and sample answers fill in.</p>
<div class="row">
  <div class="deskbox"><p class="lab">Desktop</p><div class="deskclip" id="dc"><iframe id="df" title="Desktop preview" srcdoc="{src}"></iframe></div></div>
  <div><p class="lab">Phone</p><div class="phone"><iframe title="Phone preview" srcdoc="{src}"></iframe></div></div>
</div>
<script>
(function(){{ var dc=document.getElementById("dc"), df=document.getElementById("df");
  function fit(){{ var k=dc.clientWidth/1280; df.style.transform="scale("+k+")"; dc.style.height=(900*k)+"px"; }}
  window.addEventListener("resize",fit); fit(); }})();
</script>
</body></html>'''
open(out_path, "w", encoding="utf-8").write(out)
print("ok:", out_path)
