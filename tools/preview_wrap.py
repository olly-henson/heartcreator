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

doc = ('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
       '<style>html,body{margin:0;padding:0;}</style></head><body>' + page + '</body></html>')
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
<p class="n">The real page at desktop width (1280px, shrunk to fit) and phone width (390px). Forms are switched off in this preview.</p>
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
