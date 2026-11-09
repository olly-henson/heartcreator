"""Desktop + phone preview Artifact page for the sales-video (VSL) slides.

Usage (from heartattractor/):  python -I tools/vsl_preview.py SLIDES.html OUT.html [SLIDE_NO|all] ["Title"]
- Every slide (or one) in a row: desktop on the left, the phone video page on the right
  (slide in the player, Join button under it), so text size on a phone can be judged honestly.
- Images (img/...) are embedded once as data URIs; the phone copies are cloned in the browser.
- The dashed square marks where Olly's Google Vids webcam sits. It is not on the real slide.
Then publish OUT.html with the Artifact tool (same OUT path keeps the same link).
"""
import sys, os, re, base64, html

src_path, out_path = sys.argv[1], sys.argv[2]
which = sys.argv[3] if len(sys.argv) > 3 else "all"
title = sys.argv[4] if len(sys.argv) > 4 else "Sales Video Preview"
base = os.path.dirname(os.path.abspath(src_path))
page = open(src_path, encoding="utf-8").read()

def embed(m):
    p = os.path.join(base, m.group(1))
    if not os.path.exists(p):
        return m.group(0)
    return 'src="data:image/jpeg;base64,' + base64.b64encode(open(p, "rb").read()).decode() + '"'

css = re.search(r"<style>(.*?)</style>", page, re.S).group(1)
css = re.sub(r"html, body \{[^}]*\}", "", css).replace(".stage {", ".stage-x {")
fonts = re.search(r'<link rel="stylesheet"[^>]*>', page).group(0)
slides = re.findall(r'(<section class="slide[^"]*" data-n="(\d+)">.*?</section>)', page, re.S)
if which != "all":
    slides = [s for s in slides if s[1] == which]

rows = []
for sec, n in slides:
    sec = re.sub(r'src="(img/[^"]+)"', embed, sec).replace('class="slide', 'class="slide on', 1)
    rows.append(f'''<div class="row"><div class="lbl">Slide {n}</div><div class="pair2">
  <div class="desk"><div class="fit">{sec}</div></div>
  <div class="phone"><div class="screen"><div class="pg"><div class="k">The Heart Attractor Program</div>
    <h3>Let's Help You Find Your Person</h3><div class="fit ph" data-n="{n}"><button class="fs" type="button" onclick="goFS(this.parentNode)" aria-label="Full screen">&#x26F6; Full screen</button></div>
    <a class="join" href="#" onclick="return false">Join The Heart Attractor Program</a></div></div></div>
</div></div>''')

out = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title>
{fonts}
<style>
{css}
:root {{ --bg:#f4f1f8; --fg:#1d1527; --muted:#6b5f7d; }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg:#0f0a17; --fg:#efe8f7; --muted:#a497b5; }} }}
:root[data-theme="dark"] {{ --bg:#0f0a17; --fg:#efe8f7; --muted:#a497b5; }}
html, body {{ margin:0; background:var(--bg); color:var(--fg); font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif; }}
body .cam {{ display:grid; }}
.top {{ max-width:1400px; margin:0 auto; padding:20px 16px 0; }}
.top h1 {{ font:900 26px "Playfair Display",Georgia,serif; margin:0; color:var(--fg); }}
.top p {{ color:var(--muted); font-size:14px; margin:6px 0 0; }}
.row {{ max-width:1400px; margin:0 auto; padding:18px 16px 8px; }}
.lbl {{ font-size:13px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }}
.pair2 {{ display:flex; gap:24px; align-items:flex-start; flex-wrap:wrap; }}
.desk {{ flex:1 1 600px; min-width:0; max-width:960px; }}
.fit {{ position:relative; width:100%; aspect-ratio:16/9; overflow:hidden; border-radius:10px; background:#fff; }}
.fit .slide {{ position:absolute; left:0; top:0; transform-origin:0 0; transform:scale(var(--s,1)); box-shadow:none; }}
.phone {{ width:340px; max-width:100%; flex:none; }}
.screen {{ border:9px solid #1c1424; border-radius:36px; background:#fff; overflow:hidden; }}
.pg {{ padding:34px 12px 18px; color:#1d1527; }}
.pg .k {{ font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:#6b21a8; font-weight:700; }}
.pg h3 {{ font:900 19px "Playfair Display",Georgia,serif; margin:5px 0 12px; }}
.fs {{ position:absolute; right:8px; bottom:8px; z-index:5; border:0; border-radius:8px; background:rgba(29,21,39,.78); color:#fff; font:600 11px Inter,system-ui,sans-serif; padding:6px 9px; cursor:pointer; }}
.fit:fullscreen {{ background:#000; display:grid; place-items:center; border-radius:0; }}
.join {{ display:block; margin-top:14px; text-align:center; background:#6b21a8; color:#fff; font-weight:700; font-size:15px; padding:13px; border-radius:12px; text-decoration:none; }}
</style></head><body>
<div class="top"><h1>{html.escape(title)}</h1><p>Desktop on the left, the phone video page on the right. The dashed square is your webcam spot (not on the real slide).</p></div>
{"".join(rows)}
<script>
document.querySelectorAll('.fit.ph').forEach(function(ph){{
  var src = document.querySelector('.desk .slide[data-n="' + ph.dataset.n + '"]');
  ph.appendChild(src.cloneNode(true));
}});
function goFS(el){{ try {{ (el.requestFullscreen||el.webkitRequestFullscreen).call(el); if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function(){{}}); }} catch(e) {{}} setTimeout(scale, 300); }}
document.addEventListener('fullscreenchange', function(){{ setTimeout(scale, 100); }});
function scale(){{ document.querySelectorAll('.fit').forEach(function(f){{ var k = Math.min(f.clientWidth / 1280, f.clientHeight / 720); f.style.setProperty('--s', k); var sl = f.querySelector('.slide'); if (sl) {{ sl.style.left = ((f.clientWidth - 1280*k)/2) + 'px'; sl.style.top = ((f.clientHeight - 720*k)/2) + 'px'; }} }}); }}
addEventListener('resize', scale); scale();
</script>
</body></html>'''
open(out_path, "w", encoding="utf-8").write(out)
print(round(len(out) / 1e6, 2), "MB,", len(rows), "slides ->", out_path)
