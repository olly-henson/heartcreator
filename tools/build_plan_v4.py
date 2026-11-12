# Plan of action v4 builder (Olly 2026-11-12): one personal plan per applicant, as 20 page images.
#   cover (photo template) -> 7 stick-figure pages written as THEIR diagnosis -> junction -> 8 photo steps (personalised)
#   -> "What I Need From You" -> personal note -> closing.
# The words come from a per-person spec JSON that Claude writes from their GHL answers (skill: funnel/skills/skills_plan-v4.md).
# PRIVATE DATA: specs and outputs live in the scratchpad (or funnel/applicant-guides/, git-ignored), never in this public repo.
#
# Usage (from heartattractor/):
#   python tools/build_plan_v4.py SPEC.json OUTDIR            -> OUTDIR/preview.html (+ page images in OUTDIR/kv/)
#   python tools/build_plan_v4.py SPEC.json OUTDIR --upload   -> also stores the pages in the Hub (KV) and prints their link
import json, re, sys, os, subprocess, secrets, io, base64, pathlib, glob
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
CAROUSEL = ROOT / 'marketing/carousels/meet-your-person/carousel.html'
TEMPLATE = ROOT / 'funnel/plan-of-action.html'
IMG_DIR = ROOT / 'business management/business hub/hub-site/public/plan-img'
HUB = ROOT / 'business management/business hub/hub-site'
NS = 'f6ae5047d04c492d9409f74cdb3bb920'
TOTAL = 20
E = lambda t: (t.replace('&', '&amp;').replace("'", '&rsquo;').replace('"', '&quot;'))  # for stick pages (HTML)

spec_path, out = sys.argv[1], pathlib.Path(sys.argv[2])
upload = '--upload' in sys.argv
S = json.loads(open(spec_path, encoding='utf-8').read())
out.mkdir(parents=True, exist_ok=True)
for d in ('stick', 'plan', 'kv'): (out / d).mkdir(exist_ok=True)

def rep(t, a, b):
    assert a in t, 'not found: ' + a[:90]
    return t.replace(a, b, 1)

def q(t):  # straight quotes in the spec -> curly quotes on the page
    t = E(t)
    return re.sub(r'&quot;(.*?)&quot;', r'&ldquo;\1&rdquo;', t)

# ---------- 1. stick-figure pages (from the approved carousel) ----------
s = CAROUSEL.read_text(encoding='utf-8')
secs = re.findall(r'<section class="slide.*?</section>', s, re.S)
head, tail = s[:s.index(secs[0])], s[s.index(secs[-1]) + len(secs[-1]):]
KEEP = [1, 7, 8, 9, 10, 11, 13]
name = S['name']
D, SH, B, C, U, R = S['diagnosis'], S['shows_up'], S['build'], S['changes'], S['unfold'], S['resonance']
pages = []
for n, i in enumerate(KEEP, 2):
    t = secs[i]
    if i == 1:
        t = rep(t, 'Where You Are Right Now', 'Where You Are Right Now, ' + E(name))
        t = rep(t, 'Does This <em>Sound Like You?</em>', 'This Is What <em>You Told Me</em>')
        t = rep(t, '<small>You Might Be Feeling</small>', '<small>In Your Words</small>')
        t = re.sub(r'<div class="rows ex-rows">.*?</div></div></div>', '<div class="rows ex-rows">' + ''.join(
            f'<div><i>{k}</i><span>{q(r)}</span></div>' for k, r in enumerate(S['told_me'], 1)) + '</div></div>', t, count=1, flags=re.S)
    if i == 7:
        for a, b in [('How It Happened', 'What I&rsquo;m Hearing From You'),
                     ('Where You <em>Lost Your Belief</em>', 'The Belief That&rsquo;s <em>Holding You Back</em>'),
                     ('&ldquo;I never seem to meet the right person&rdquo;', q('"' + D['thought'] + '"')),
                     ('Worry and hopelessness', q(D['feeling'])), ('You repeat this over and over', q(D['repetition'])),
                     ('&ldquo;I&rsquo;m someone who can&rsquo;t find love&rdquo;', q('"' + D['belief'] + '"'))]:
            t = rep(t, a, b)
        t = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">' + q(D['intro']) + '</p>', t, count=1, flags=re.S)
    if i == 8:
        for a, b in [('What It Looks Like', 'How It Shows Up For You'), ('When You Act From <em>The Negative Belief</em>', q(SH['title_a']) + ' <em>' + q(SH['title_b']) + '</em>'),
                     ('Am I too much?', q(SH['bubbles'][0])), ('They&rsquo;ll lose interest', q(SH['bubbles'][1])),
                     ('<small>On The Date</small>', '<small>What&rsquo;s Happening</small>')]:
            t = rep(t, a, b)
        for a, b in zip(['You go into every date braced for it to go wrong', 'You wonder: &ldquo;Am I too much? Am I not enough?&rdquo;',
                         'You hold back so you don&rsquo;t get hurt again', 'You&rsquo;re drawn to people who keep you guessing'], SH['rows']):
            t = rep(t, a, q(b))
        t = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">' + q(SH['intro']) + '</p>', t, count=1, flags=re.S)
    if i == 9:
        for a, b in [('Change The Thought And The Feeling', 'The Belief You Need'), ('How To <em>Reverse It</em>', 'The Belief You&rsquo;ll Build <em>In The Program</em>'),
                     ('&ldquo;I&rsquo;m with my person&rdquo;', q('"' + B['thought'] + '"')), ('Safe and at peace', q(B['feeling'])),
                     ('You repeat this over and over', 'Every day, for 10 minutes'), ('&ldquo;I&rsquo;m someone who finds love&rdquo;', q('"' + B['belief'] + '"'))]:
            t = rep(t, a, b)
        t = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">' + q(B['intro']) + '</p>', t, count=1, flags=re.S)
    if i == 10:
        for a, b in [('What It Looks Like', 'What It Looks Like For You'), ('When You Act From <em>The Positive Belief</em>', q(C['title_a']) + ' <em>' + q(C['title_b']) + '</em>'),
                     ('I&rsquo;m enjoying this', q(C['bubbles'][0])), ('I can just be me', q(C['bubbles'][1])), ('Whatever happens, I&rsquo;m okay', q(C['bubbles'][2])),
                     ('<small>On The Date</small>', '<small>What Changes</small>')]:
            t = rep(t, a, b)
        for a, b in zip(['You show up relaxed and fully yourself', 'You feel safe being open and vulnerable',
                         'You notice the people who are consistent and available', 'You lose interest in the ones who keep you guessing'], C['rows']):
            t = rep(t, a, q(b))
        t = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">Same you, same dating. Now ' + q('"' + B['belief'] + '"') + ' decides how you show up.</p>', t, count=1, flags=re.S)
    if i == 11:
        t = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">' + q(U['intro']) + '</p>', t, count=1, flags=re.S)
        t = rep(t, '>Relaxed and yourself<', '>' + q(U['pills'][0]) + '<')
        t = rep(t, '>You notice the right people<', '>' + q(U['pills'][1]) + '<')
    if i == 13:
        for a, b in [('How You Build The Belief', 'How We&rsquo;ll Do It Together'), ('Meet <em>Emotional Resonance</em>', 'How You&rsquo;ll Build <em>' + q(R['title_word']) + '</em>'),
                     ('You choose to feel the feeling of it', 'You choose to feel ' + q(R['feeling'])),
                     ('&ldquo;I&rsquo;m someone who finds love&rdquo;', q('"' + B['belief'] + '"'))]:
            t = rep(t, a, b)
        t = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">' + q(R['intro']) + '</p>', t, count=1, flags=re.S)
    t = re.sub(r'<div class="foot">.*?</div>', f'<div class="foot"><span>{E(name)}&rsquo;s Plan</span><span>Page {n} of {TOTAL}</span></div>', t, count=1, flags=re.S)
    pages.append(t)
(out / 'stick.html').write_text(head + '\n'.join(pages) + tail, encoding='utf-8')
for f in glob.glob(str(out / 'stick' / '*')): os.remove(f)
env = dict(os.environ, JPG='1')
r = subprocess.run(['node', str(ROOT / 'tools/export_carousel.js'), str(out / 'stick.html'), str(out / 'stick')], env=env, capture_output=True, text=True)
print('stick pages:', r.stdout.strip().splitlines()[-1] if r.stdout else r.stderr[-300:])

# ---------- 2. personalised phone text (Step 6 photo) ----------
def text_msg(dst, msg, src):
    k = 3
    im = Image.open(src).convert('RGB'); big = im.resize((im.width * k, im.height * k), Image.LANCZOS); d = ImageDraw.Draw(big)
    d.rectangle([248 * k, 300 * k, 750 * k, im.height * k], fill=(255, 255, 255))
    ft = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 37 * k)
    lines, cur = [], ''
    for wd in msg.split():
        tt = (cur + ' ' + wd).strip()
        if ft.getlength(tt) <= 376 * k: cur = tt
        else: lines.append(cur); cur = wd
    lines.append(cur)
    padx, top, lh = 26 * k, 22 * k, 47 * k
    x0, y0 = 260 * k, 307 * k
    d.rounded_rectangle([x0, y0, x0 + max(ft.getlength(l) for l in lines) + 2 * padx, y0 + len(lines) * lh + 2 * top], radius=30 * k, fill=(233, 233, 235))
    for j, l in enumerate(lines): d.text((x0 + padx, y0 + top + j * lh), l, font=ft, fill=(0, 0, 2))
    big.resize(im.size, Image.LANCZOS).save(dst, quality=92)
g = 'male' if str(S.get('gender', '')).lower().startswith('m') else 'female'
text_msg(out / 'partner-text.jpg', S['text_message'], IMG_DIR / f'partner-text-{g}.jpg')

# ---------- 3. photo pages from the plan template ----------
p = TEMPLATE.read_text(encoding='utf-8')
P = S['plan']
preset = {'name': name, 'gender': S.get('gender', 'female'), 'now': P['now'], 'want': P['want'], 'tried': P.get('tried', ''),
          'feels': S['feeling'], 'feel1': S['feeling'].lower(), 'note': S['note']}
p = rep(p, 'var PRESET = null;', 'var PRESET = ' + json.dumps(preset) + ';')
p = rep(p, '<script src="https://cdnjs', '<script>window.PLAN_IMG_BASE="' + IMG_DIR.as_uri() + '/";</script>\n<script src="https://cdnjs')
p = rep(p, """<h2><span data-v="name"></span>'s Plan To Meet <em><span data-v="pron">Your</span> Person</em></h2>""",
        """<h2><span data-v="name"></span>, Here's Your Plan Of Action To Meet <em>Your Person</em></h2>""")
ST = S['steps']
p = rep(p, "These Are The Exact Steps We're Going To Follow <em>To Make This Work For You</em>", "These Are The Exact Steps We're Going To Follow <em>" + ST['junction'] + "</em>")
steps_html = re.findall(r'(<section class="pg step-pg">.*?</section>)', p, re.S)
assert len(steps_html) == 8, len(steps_html)
for k, sec in enumerate(steps_html, 1):
    new = re.sub(r'<p class="steptext">.*?</p>', lambda m: '<p class="steptext">' + ST[str(k)] + '</p>', sec, count=1, flags=re.S)
    if ST.get(f'{k}_title'): new = re.sub(r'<h2 class="sm">.*?</h2>', '<h2 class="sm">' + ST[f'{k}_title'] + '</h2>', new, count=1, flags=re.S)
    p = p.replace(sec, new, 1)
commit = f'''      <section class="pg commit-pg">
        <div class="eyebrow">Before we agree to anything</div>
        <h2 class="sm">What I Need <em>From You</em></h2>
        <p class="steptext">As your coach, there are three things I need from you before we work together:</p>
        <div class="clist">
          <div><i>1</i><p><b>This is the biggest priority in your life right now.</b> {S['commit_priority_line']}</p></div>
          <div><i>2</i><p><b>You can give 10 minutes a day</b> to The Attraction Formula Meditation.</p></div>
          <div><i>3</i><p><b>You'll reach out and ask for help</b> whenever you need it, {S['commit_help_line']}</p></div>
        </div>
        <div class="foot"><span>Page 18 of 20</span><span>The Heart Attractor Program</span></div>
      </section>

'''
p = rep(p, '      <!-- Personal note (Olly 2026-11-11)', commit + '      <!-- Personal note (Olly 2026-11-11)')
css = ('.commit-pg .clist{display:flex;flex-direction:column;gap:14px;margin-top:18px}'
       '.commit-pg .clist>div{display:flex;gap:14px;align-items:flex-start;background:#f6f1fc;border:1px solid #e2d4f4;border-radius:14px;padding:14px 16px}'
       '.commit-pg .clist i{flex:none;width:30px;height:30px;border-radius:50%;background:#7c3aed;color:#fff;font-style:normal;font-weight:700;display:grid;place-items:center;font-size:15px}'
       '.commit-pg .clist p{margin:0;font-size:16px;line-height:1.45;color:#1d1527}.commit-pg .clist b{color:#6b21a8}\n</style>')
k = p.index('</style>'); p = p[:k] + css + p[k + len('</style>'):]
(out / 'plan.html').write_text(p, encoding='utf-8')
shoot = (ROOT / 'tools/plan_v4_shoot.js')
r = subprocess.run(['node', str(shoot), str(out)], capture_output=True, text=True)
print('photo pages:', (r.stdout + r.stderr).strip()[-300:])

# ---------- 4. preview + page images ----------
files = [out / 'plan/p01.jpg'] + [out / f'stick/{i:02d}.jpg' for i in range(1, 8)] + [out / f'plan/p{n:02d}.jpg' for n in range(9, 21)]
imgs = []
for k, f in enumerate(files, 1):
    im = Image.open(f).convert('RGB').resize((1080, 1350), Image.LANCZOS); im.save(out / f'kv/{k:02d}.jpg', 'JPEG', quality=86)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=84); imgs.append(base64.b64encode(b.getvalue()).decode())
html = ('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        f'<title>{E(name)} Plan Preview</title><style>:root{{--bg:#2a2233;--ink:#f4eefc;--muted:#c9bcd9}}'
        '@media (prefers-color-scheme: light){:root:not([data-theme="dark"]){--bg:#efe9f6;--ink:#241b30;--muted:#5d5070}}'
        ':root[data-theme="light"]{--bg:#efe9f6;--ink:#241b30;--muted:#5d5070}'
        'body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,Segoe UI,Arial,sans-serif}'
        'header{max-width:540px;margin:0 auto;padding:20px 16px 4px}h1{font-size:20px;margin:0 0 4px}p{margin:0;color:var(--muted);font-size:14px}'
        'main{max-width:540px;margin:0 auto;padding:12px 16px 40px;display:flex;flex-direction:column;gap:18px}'
        'img{width:100%;height:auto;display:block;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.25)}</style></head><body>'
        f'<header><h1>{E(name)}&rsquo;s plan of action (preview)</h1><p>20 pages, exactly as they will see them.</p></header><main>'
        + ''.join(f'<img src="data:image/jpeg;base64,{d}" alt="Page {k}" loading="lazy">' for k, d in enumerate(imgs, 1)) + '</main></body></html>')
(out / 'preview.html').write_text(html, encoding='utf-8')
print('preview:', out / 'preview.html')

# ---------- 5. upload to the Hub (their tracked /p/<code> link) ----------
if upload:
    cid = S['contact_id']
    W = sorted(glob.glob('C:/Users/Olly/AppData/Local/npm-cache/_npx/*/node_modules/wrangler/bin/wrangler.js'))[-1]
    def kv(*a):
        r = subprocess.run(['node', W, 'kv', 'key', *a, '--namespace-id', NS, '--remote'], cwd=HUB, capture_output=True, text=True)
        return r.stdout + r.stderr
    got = kv('get', 'plan:' + cid)
    try: old = json.loads(got[got.index('{'):got.rindex('}') + 1])
    except Exception: old = {}
    code = old.get('_code') or ''.join(secrets.choice('abcdefghijkmnpqrstuvwxyz23456789') for _ in range(10))
    rec = dict(old); rec.update(preset); rec['_code'] = code
    (out / 'kv/plan.json').write_text(json.dumps(rec), encoding='utf-8')
    for k in range(1, TOTAL + 1): kv('put', f'planimg:{cid}:{k:02d}', '--path', str(out / f'kv/{k:02d}.jpg'))
    kv('put', 'plan:' + cid, '--path', str(out / 'kv/plan.json'))
    kv('put', 'share:' + code, cid)
    if not old.get('_code'):
        kv('put', 'planview:' + cid, 'x', '--metadata', json.dumps({'opens': 0, 'first': None, 'last': None, 'pdf': 0, 'code': code}))
    kv('put', 'planimgs:' + cid, str(TOTAL))
    print('LIVE: https://hub.ollyhenson.com/p/' + code)
