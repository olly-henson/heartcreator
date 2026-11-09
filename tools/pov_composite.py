import glob, numpy as np
from PIL import Image, ImageFilter
R = 'C:/Users/Olly/AI OS/heartattractor/'
SRC = R + 'marketing/assets/sales-video/'
OUT = R + 'business management/business hub/hub-site/public/plan-img/'
S = 'C:/Users/Olly/AppData/Local/Temp/claude/6c624929a4b08647/a6cf9527-9a23-486d-87b7-6d015339199d/scratchpad/'

def find(name):
    f = [x for x in glob.glob(SRC + '*') if x.lower().replace('\\', '/').split('/')[-1].startswith(name)]
    return f[0]

def coeffs(dst, src):
    A = []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); A.append([0, 0, 0, x, y, 1, -v * x, -v * y])
    b = np.array(src).reshape(8)
    return np.linalg.solve(np.array(A, float), b).tolist()

def base(name):
    im = Image.open(find(name)).convert('RGB'); a = np.asarray(im).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = (g > 150) & (g > r + 60) & (g > b + 60)
    ys, xs = np.nonzero(m)
    pts = np.stack([xs, ys], 1)
    if 'laptop' in name:
        x0, x1, y0, y1 = np.percentile(xs, 0.5), np.percentile(xs, 99.5), np.percentile(ys, 0.5), np.percentile(ys, 99.5)
        tl, tr, br, bl = (x0, y0), (x1, y0), (x1, y1), (x0, y1)
    else:
        tl = pts[np.argmin(xs + ys)]; br = pts[np.argmax(xs + ys)]; tr = pts[np.argmax(xs - ys)]; bl = pts[np.argmin(xs - ys)]
    mask = Image.fromarray((m * 255).astype('uint8')).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
    return im, [tuple(tl), tuple(tr), tuple(br), tuple(bl)], mask, int(m.sum())

def place(bg, quad, mask, shot_path, out):
    im = bg.copy(); sh = Image.open(shot_path).convert('RGB')
    w, h = sh.size
    c = coeffs(quad, [(0, 0), (w, 0), (w, h), (0, h)])
    warped = sh.transform(im.size, Image.PERSPECTIVE, c, Image.BICUBIC)
    im.paste(warped, (0, 0), mask)
    im.thumbnail((900, 900)); im.save(OUT + out, quality=82)
    return im

phone, pq, pm, pn = base('pov phone'); lap, lq, lm, ln = base('pov laptop')
print('phone screen', pq, pn, '| laptop screen', lq, ln)
done = []
for shot, out, kind in [('DM blurred.png', 'dm.jpg', 'p'), ('meditaiton on phone.PNG', 'meditation.jpg', 'p'), ('Training preview.PNG', 'training.jpg', 'p'),
                        ('Join Page Preview.png', 'join.jpg', 'l'), ('Classroom.png', 'classroom.jpg', 'l')]:
    bg, q, m = (phone, pq, pm) if kind == 'p' else (lap, lq, lm)
    done.append(place(bg, q, m, SRC + shot, out))
sheet = Image.new('RGB', (sum(x.width * 300 // x.height for x in done) + 40, 300), 'white'); x = 0
for d in done:
    t = d.resize((d.width * 300 // d.height, 300)); sheet.paste(t, (x, 0)); x += t.width + 8
sheet.save(S + 'pov_sheet.jpg', quality=70)
