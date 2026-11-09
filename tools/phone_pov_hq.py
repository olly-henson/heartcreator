"""Sharp phone POV image (hand holding a phone) with a purple outline + curved arrow on one area of the screen.
Twin of laptop_pov_hq.py. Base photo: marketing/assets/sales-video/pov phone.jpg (plain #00FF00 screen).
Usage (from heartattractor/):  python -I tools/phone_pov_hq.py SHOT.png OUT.jpg "x0,y0,x1,y1" [left|right] [base photo, default 'pov phone sofa']
Env CROP="x0,y0,x1,y1" (fractions) = zoomed crop at full resolution instead of a 1400px thumbnail.
SHOT = a phone screenshot (e.g. 1170x2532); the box is in SHOT pixels; the arrow comes in from the given side (default left)."""
import sys, math
from PIL import Image, ImageDraw, ImageFilter
R = 'C:/Users/Olly/AI OS/heartattractor/'
src = open(R + 'tools/pov_composite.py', encoding='utf-8').read(); ns = {'__name__': 'x'}
exec(src.split("phone, pq, pm, pn = base(")[0], ns)
shot, out = sys.argv[1], sys.argv[2]
box = tuple(map(int, sys.argv[3].split(','))) if len(sys.argv) > 3 and sys.argv[3] else None
side = sys.argv[4] if len(sys.argv) > 4 else 'left'
BASE = sys.argv[5] if len(sys.argv) > 5 else 'pov phone sofa'   # base photo name in sales-video/
K = 2; P = (124, 58, 237)
bg, q, m, n = ns['base'](BASE)
bg = bg.resize((bg.width * K, bg.height * K), Image.LANCZOS)
m = m.filter(ImageFilter.MinFilter(3)).resize(bg.size, Image.BILINEAR)
q = [(x * K, y * K) for x, y in q]
(tlx, tly), (trx, try_), (brx, bry), (blx, bly) = q
qa = ((trx - tlx) + (brx - blx)) / ((bly - tly) + (bry - try_))   # screen width / height
sh = Image.open(shot).convert('RGB')
if sh.width < 1100:   # small phone screenshots (e.g. 828 wide): upscale + sharpen so text stays crisp after the warp
    f = 1170 / sh.width; sh = sh.resize((1170, int(sh.height * f)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 80, 2))
    box = tuple(int(v * f) for v in box) if box else box
w, h = sh.size
H = min(h, int(w / qa)); sh = sh.crop((0, 0, w, H))              # keep the top of the page
d = ImageDraw.Draw(sh)
if box:
    d.rounded_rectangle(box, radius=24, outline='white', width=22); d.rounded_rectangle(box, radius=24, outline=P, width=13)
cf = ns['coeffs'](q, [(0, 0), (w, 0), (w, H), (0, H)])
warped = sh.transform(bg.size, Image.PERSPECTIVE, cf, Image.BICUBIC)
im = bg.copy(); im.paste(warped, (0, 0), m)
import numpy as np
a = np.asarray(im).astype(int); lim = np.maximum(a[..., 0], a[..., 2]) + 8
a[..., 1] = np.where(a[..., 1] > lim, lim, a[..., 1]); im = Image.fromarray(a.clip(0, 255).astype('uint8'))
fw = ns['coeffs']([(0, 0), (w, 0), (w, H), (0, H)], q)
def fwd(x, y):
    a1, b1, c1, d1, e1, f1, g1, h1 = fw; den = g1 * x + h1 * y + 1
    return ((a1 * x + b1 * y + c1) / den, (d1 * x + e1 * y + f1) / den)
U = bg.width / 900; dd = ImageDraw.Draw(im)
import os
if box and not os.environ.get('NOARROW'):   # NOARROW=1 = outline only (for tight crops)
    x0, y0, x1, y1 = box
    if side == 'right':
        tx, ty = fwd(x1, (y0 + y1) / 2); sx, sy = tx + 150 * U, ty - 130 * U; cx_, cy_ = sx - 8 * U, ty - 8 * U
    else:
        tx, ty = fwd(x0, (y0 + y1) / 2); sx, sy = tx - 150 * U, ty - 130 * U; cx_, cy_ = sx + 8 * U, ty - 8 * U
    pts = [((1 - t) ** 2 * sx + 2 * (1 - t) * t * cx_ + t * t * tx, (1 - t) ** 2 * sy + 2 * (1 - t) * t * cy_ + t * t * ty) for t in [i / 40 for i in range(41)]]
    ang = math.atan2(pts[-1][1] - pts[-5][1], pts[-1][0] - pts[-5][0]); ex, ey = pts[-1]
    def head(L, aa=0.5): return [(ex + 6 * U * math.cos(ang), ey + 6 * U * math.sin(ang)), (ex - L * math.cos(ang - aa), ey - L * math.sin(ang - aa)), (ex - L * math.cos(ang + aa), ey - L * math.sin(ang + aa))]
    dd.line(pts, fill='white', width=int(14 * U), joint='curve'); dd.polygon(head(32 * U), fill='white')
    dd.line(pts, fill=P, width=int(7 * U), joint='curve'); dd.polygon(head(22 * U), fill=P)
import os
if os.environ.get('CROP'):   # CROP="x0,y0,x1,y1" as fractions of the full image: zoom on the phone at full resolution
    c = [float(v) for v in os.environ['CROP'].split(',')]; W, Hh = im.size
    im = im.crop((int(c[0]*W), int(c[1]*Hh), int(c[2]*W), int(c[3]*Hh)))
else:
    im.thumbnail((1400, 1400))
im.save(out, quality=92)
print('saved', out, im.size)
