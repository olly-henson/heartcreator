"""Skool post images for the two bonus trainings (Olly 2026-11-27): 1600x900, slide style, title + steps left, the key
drawing from the deck right. Run after build_bonus_trainings.py:
    python training/build_bonus_thumbnails.py   then   node tools/export_carousel.js training/bonus-thumbnails.html "training/bonus thumbnails"
"""
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))


def deck(fname):
    src = open(os.path.join(HERE, fname), encoding='utf-8').read()
    return {'css': re.search(r'<style>(.*?)</style>', src, re.S).group(1),
            'fonts': re.search(r'<link rel="stylesheet"[^>]+>', src).group(0),
            'slides': dict(re.findall(r'<section class="slide" data-n="(\d+)">(.*?)</section>', src, re.S))}


def scene(d, n):
    return re.search(r'<div class="scene">(<svg.*?</svg>)</div>', d['slides'][str(n)], re.S).group(1)


T = deck('talk-to-the-heart.html')
E = deck('embody-your-symbol.html')

CSS = """
html, body { margin:0; height:auto; background:#fff; }
.slide.thumb { display:grid !important; position:relative; left:auto; top:auto; transform:none; margin:0; width:1600px; height:900px; overflow:hidden; background:#fff; display:grid; grid-template-columns:760px 1fr;
  gap:40px; padding:70px 70px; box-sizing:border-box; font-family:var(--body); color:var(--ink); }
.thumb * { animation:none !important; }
.thumb .l { display:flex; flex-direction:column; justify-content:center; }
.thumb .tag { align-self:flex-start; font-size:20px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:#fff; background:var(--purple);
  border-radius:999px; padding:10px 22px; }
.slide.thumb h1 { font-family:var(--display); font-weight:900; font-size:104px; line-height:1; margin:28px 0 0; }
.thumb h1 em { font-style:normal; color:var(--purple); }
.thumb .sub { font-size:30px; line-height:1.35; color:var(--soft); margin:22px 0 0; }
.thumb ol { list-style:none; padding:0; margin:36px 0 0; counter-reset:s; display:flex; flex-direction:column; gap:14px; }
.thumb li { counter-increment:s; display:flex; gap:18px; align-items:center; font-size:27px; font-weight:600; }
.thumb li::before { content:counter(s); flex:none; width:44px; height:44px; border-radius:50%; border:3px solid var(--violet); color:var(--purple);
  font-size:20px; font-weight:700; display:grid; place-items:center; background:#fff; }
.thumb .r { border-radius:32px; background:var(--tint); display:flex; align-items:flex-end; justify-content:center; overflow:hidden; align-self:center; padding:50px 30px 0; width:100%; box-sizing:border-box; }
.thumb .r svg.tall { width:auto; height:560px; }
.thumb .r svg { width:100%; height:auto; display:block; }
.thumb .brand { position:absolute; left:70px; bottom:30px; font-size:19px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#9a86b8; }
"""


def thumb(title, sub, steps, svg):
    return ('<section class="slide thumb"><div class="l"><span class="tag">New Bonus Exercise</span><h1>%s</h1><p class="sub">%s</p><ol>%s</ol></div>'
            '<div class="r">%s</div><div class="brand">The Heart Attractor Program</div></section>'
            % (title, sub, ''.join('<li>%s</li>' % s for s in steps), svg))


pages = [
    thumb('Talk To <em>The Heart</em>', 'Get your mind and heart to agree on what you want.',
          ['Close your eyes, attention on your heart', 'Hand or two fingers over your heart', 'Talk to it in the present tense',
           'Let it settle in you'], scene(T, 6).replace('viewBox="0 0 700 390"', 'viewBox="70 36 630 324"', 1)),
    thumb('Embody <em>Your Symbol</em>', 'Feel your Emotional Resonance all day long.',
          ['Feel your R in the centre of your chest', 'Bring your attention to it', 'Let it melt into you'], scene(E, 4).replace('viewBox="0 0 700 390"', 'viewBox="130 0 440 390"', 1)),
]
html = ('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Bonus thumbnails</title>' + T['fonts'] +
        '<style>' + T['css'] + E['css'] + CSS + '</style></head><body>' + '\n'.join(pages) + '</body></html>')
open(os.path.join(HERE, 'bonus-thumbnails.html'), 'w', encoding='utf-8').write(html)
print('ok')
