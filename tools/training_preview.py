import base64, re, sys, pathlib
src = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2])
h = src.read_text(encoding='utf-8')
h = re.sub(r'src="(how to control your mental attention images/[^"]+\.jpe?g)"',
  lambda m: 'src="data:image/jpeg;base64,' + base64.b64encode((src.parent/m.group(1)).read_bytes()).decode() + '"', h)
css = re.search(r'<style>(.*?)</style>', h, re.S).group(1)
css = css.replace('html, body { margin:0; height:100%; background:var(--letterbox); font-family:var(--body); color:var(--ink); }', '').replace('.stage {', '.stage-x {').replace('body.all .stage', 'body.all .stage-x')
name = re.sub(r'<[^>]+>','',re.search(r'<section class="slide" data-n="1">.*?<h1>(.*?)</h1>',h,re.S).group(1)).strip()
slides = re.findall(r'<section class="slide" data-n="(\d+)">(.*?)</section>', h, re.S)
extra = '''
:root { --bg:#f4f1f8; --fg:#1d1527; --muted:#6b5f7d; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg:#0f0a17; --fg:#efe8f7; --muted:#a497b5; } }
:root[data-theme="dark"] { --bg:#0f0a17; --fg:#efe8f7; --muted:#a497b5; }
html, body { margin:0; background:var(--bg); color:var(--fg); font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif; }
body .cam { display:grid; }
.top { max-width:1400px; margin:0 auto; padding:20px 16px 0; }
.top h1 { font:900 26px "Playfair Display",Georgia,serif; margin:0; color:var(--fg); }
.top p { color:var(--muted); font-size:14px; margin:6px 0 0; }
.row { max-width:1400px; margin:0 auto; padding:18px 16px 8px; }
.lbl { font-size:13px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
.pair2 { display:flex; gap:24px; align-items:flex-start; flex-wrap:wrap; }
.desk { flex:1 1 600px; min-width:0; max-width:960px; }
.fit { position:relative; width:100%; aspect-ratio:16/9; overflow:hidden; border-radius:10px; background:#fff; }
.fit .slide { position:absolute; left:0; top:0; transform-origin:0 0; transform:scale(var(--s,1)); box-shadow:none; }
.phone { width:340px; max-width:100%; flex:none; }
.screen { border:9px solid #1c1424; border-radius:36px; background:#fff; overflow:hidden; }
.pg { padding:34px 12px 18px; color:#1d1527; }
.pg .k { font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:#6b21a8; font-weight:700; }
.pg h3 { font:900 19px "Playfair Display",Georgia,serif; margin:5px 0 12px; }
.fs { position:absolute; right:8px; bottom:8px; z-index:5; border:0; border-radius:8px; background:rgba(29,21,39,.78); color:#fff; font:600 11px Inter,system-ui,sans-serif; padding:6px 9px; cursor:pointer; }
.fit:fullscreen { background:#000; display:grid; place-items:center; border-radius:0; }
.join { display:block; margin-top:14px; text-align:center; background:#6b21a8; color:#fff; font-weight:700; font-size:15px; padding:13px; border-radius:12px; text-decoration:none; }
@media (max-width:640px){ .desk{flex-basis:100%} }
'''
rows = []
for n, body in slides:
    rows.append(f'''<div class="row"><div class="lbl">Slide {n}</div><div class="pair2">
  <div class="desk"><div class="fit"><section class="slide on" data-n="{n}">{body}</section></div></div>
  <div class="phone"><div class="screen"><div class="pg"><div class="k">The Heart Attractor Program</div>
    <h3>{name}</h3><div class="fit ph" data-n="{n}"><button class="fs" type="button" onclick="goFS(this.parentNode)" aria-label="Full screen">&#x26F6; Full screen</button></div>
    <a class="join" href="#" onclick="return false">Mark As Complete</a></div></div></div>
</div></div>''')
page = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{name}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700&display=swap">
<style>{css}{extra}</style></head><body>
<div class="top"><h1>{name}</h1><p>All {len(slides)} slides. Desktop on the left, the phone video page on the right. The dashed square is your webcam spot (not on the real slide).</p></div>
{chr(10).join(rows)}
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
out.write_text(page, encoding='utf-8'); print(len(slides), 'slides', len(page), 'bytes')
