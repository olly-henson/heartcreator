"""Click-through slideshow Artifact for any slide deck (sales video, trainings, plans).

Olly's rule (2026-11-21): every slide deck shown to him as an artifact is a slideshow he clicks through,
one slide at a time, like presenting it. NO phone preview, no side panel.

Usage (from heartattractor/):  python -I tools/slides_artifact.py SLIDES.html OUT.html
- Images (src="img/...", or any relative src) are embedded as data URIs so the artifact is one file.
- Only the Full screen button on screen (no Back/Next, no counter): arrow keys, space and clicking the slide move it. --nav adds Back / Next buttons.
- Works on decks built like vsl-women.html (<section class="slide"> at 1280x720 inside #stage, own script).
Then publish OUT.html with the Artifact tool (same OUT path keeps the same link).
"""
import sys, os, re, base64, mimetypes

src_path, out_path = sys.argv[1], sys.argv[2]
base = os.path.dirname(os.path.abspath(src_path))
page = open(src_path, encoding="utf-8").read()

def embed(m):
    rel = m.group(1)
    if re.match(r"(https?:|data:|//)", rel):
        return m.group(0)
    p = os.path.join(base, rel)
    if not os.path.exists(p):
        return m.group(0)
    mt = mimetypes.guess_type(p)[0] or "image/jpeg"
    return 'src="data:' + mt + ';base64,' + base64.b64encode(open(p, "rb").read()).decode() + '"'

page = re.sub(r'src="([^"]+\.(?:jpe?g|png|webp|gif|svg))"', embed, page)

nav = """
<style>
.ssnav { position:fixed; left:50%; bottom:14px; transform:translateX(-50%); z-index:50; display:flex; gap:10px; align-items:center;
  background:rgba(29,21,39,.82); color:#fff; border-radius:999px; padding:6px 8px; font:600 14px Inter,system-ui,sans-serif; }
.ssnav button { border:0; border-radius:999px; background:#6b21a8; color:#fff; font:700 14px Inter,system-ui,sans-serif; padding:9px 16px; cursor:pointer; min-width:44px; min-height:40px; }
.ssnav button:disabled { opacity:.35; cursor:default; }
.ssnav span { min-width:64px; text-align:center; }
#count { display:none !important; }
/* recording (Olly 2026-11-21): no slide number, and the buttons fade out 2.5s after the mouse stops */
.ssnav { transition:opacity .4s; }
body.idle .ssnav { opacity:0; pointer-events:none; }
</style>
<div class="ssnav" id="ssnav"><button type="button" id="ssprev">&larr; Back</button><button type="button" id="ssnext">Next &rarr;</button></div>
<script>
(function(){
  var slides = [].slice.call(document.querySelectorAll('.slide'));
  function cur(){ for (var n = 0; n < slides.length; n++) if (slides[n].classList.contains('on')) return n; return 0; }
  function key(k){ document.dispatchEvent(new KeyboardEvent('keydown', { key:k, bubbles:true })); upd(); }
  function upd(){ var i = cur(); document.getElementById('ssprev').disabled = i === 0; document.getElementById('ssnext').disabled = i === slides.length - 1; }
  document.getElementById('ssprev').addEventListener('click', function(e){ e.stopPropagation(); key('ArrowLeft'); });
  document.getElementById('ssnext').addEventListener('click', function(e){ e.stopPropagation(); key('ArrowRight'); });
  new MutationObserver(upd).observe(document.body, { subtree:true, attributes:true, attributeFilter:['class'] });
  upd();
})();
</script>
"""
# Olly 2026-11-21 (recording): NOTHING on screen by default. Arrow keys / space / click move the slides.
# Pass --nav as a 3rd argument to add the Back / Next buttons back.
if "--nav" in sys.argv[3:]:
    page = page.replace("</body>", nav + "</body>", 1)
else:
    page = page.replace("</body>", "<style>#count { display:none !important; }</style></body>", 1)
open(out_path, "w", encoding="utf-8").write(page)
print(f"{os.path.getsize(out_path)/1e6:.2f} MB, {len(re.findall(r'<section class=\"slide', page))} slides -> {out_path}")
