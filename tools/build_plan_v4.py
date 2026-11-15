# Plan of action v4 builder (Olly 2026-11-12): one personal plan per applicant, as 20 page images.
#   cover (photo template) -> 7 stick-figure pages written as THEIR diagnosis -> junction -> 8 photo steps (personalised)
#   -> "What I Need From You" -> personal note -> closing.
# The words come from a per-person spec JSON that Claude writes from their GHL answers (skill: funnel/skills/skills_plan-v4.md).
# PRIVATE DATA: specs and outputs live in the scratchpad (or funnel/applicant-guides/, git-ignored), never in this public repo.
#
# Usage (from heartattractor/):
#   python tools/build_plan_v4.py SPEC.json OUTDIR            -> OUTDIR/preview.html (+ page images in OUTDIR/kv/)
#   python tools/build_plan_v4.py SPEC.json OUTDIR --upload   -> also stores the pages in the Hub (KV) and prints their link
# Plan requests (DM form, tag "plan request"; Olly 2026-11-13): spec "kind": "request" (or --request) makes TWO plans:
#   part 1 = cover + the 7 diagnosis pages + "What I'd Do If I Were You" (3 short steps, no program) + closing with one soft
#            line offering the program details (10 pages, link /p/<code>). Olly: they should read it and think "he knows me".
#   part 2 = the program: 'Here's How We'd Do This Together' + junction + 8 steps + What I Need From You + note + closing (13 pages, own link, KV id <contactId>-program)
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

spec_path, out = sys.argv[1], pathlib.Path(sys.argv[2]).resolve()   # absolute: wrangler runs from the Hub folder
upload = '--upload' in sys.argv
S = json.loads(open(spec_path, encoding='utf-8').read())
REQ = '--request' in sys.argv or S.get('kind') == 'request'
SIMPLE = '--simple' in sys.argv or S.get('kind') == 'simple'
# Applicants (Olly 2026-11-14): the simple diagnosis + the program steps in ONE plan (spec "program": true or --program):
# 8 simple pages, then junction + 8 steps + What I Need From You + note + closing = 20 pages.
PROG = SIMPLE and (S.get('program') or '--program' in sys.argv)
NPAGES = 20 if PROG else 10
# Simple plan (Olly 2026-11-14: "I've been overcomplicating the PDFs"): told me -> the belief -> how it shows up ->
# ONE core page ("you need to feel <feeling> every day, and that builds the belief") -> the new belief -> what changes ->
# things unfold -> note -> closing. 10 pages, no program steps.
STICK_TOTAL = NPAGES if SIMPLE else 10 if REQ else TOTAL
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
KEEP = [1, 7, 8, 9, 10, 11] if SIMPLE else [1, 7, 8, 9, 10, 11, 13]
PAGE_NO = {1: 2, 7: 3, 8: 4, 9: 6, 10: 7, 11: 8} if SIMPLE else {}
name = S['name']
D, SH, B, C, U, R = S['diagnosis'], S['shows_up'], S['build'], S['changes'], S['unfold'], S['resonance']
pages = []
for n, i in enumerate(KEEP, 2):
    n = PAGE_NO.get(i, n)
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
        for a, b in [('Change The Thought And The Feeling', 'The Belief You Need'), ('How To <em>Reverse It</em>', 'The Belief <em>You&rsquo;ll Build</em>' if (REQ or (SIMPLE and not PROG)) else 'The Belief You&rsquo;ll Build <em>In The Program</em>'),
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
        # Olly 2026-11-13: long pill text overlapped the pill edge. Widen all 3 pills together (same width, centred)
        # so the longest line fits at full size; the scene is 950 wide, so up to 900. Shrink the font only past that.
        longest = max(len(re.sub(r'&[a-z]+;', "'", x)) for x in [q(U['pills'][0]), q(U['pills'][1]), 'Time wasters lose appeal'])
        need = 84 + longest * 18 + 36
        if need > 660:
            W = min(900, need); d = (W - 660) / 2
            fs = 32 if need <= 900 else max(24, int(32 * (900 - 120) / (need - 120)))
            def shift(m): return f'{m.group(1)}{float(m.group(2)) - d:g}'
            t = t.replace('x="-330" y="-38" width="660"', f'x="{-W / 2:g}" y="-38" width="{W:g}"')
            t = t.replace('<circle cx="-284" cy="0" r="22"', f'<circle cx="{-284 - d:g}" cy="0" r="22"')
            t = t.replace('d="M-295 0 L-287 9 L-273 -9"', f'd="M{-295 - d:g} 0 L{-287 - d:g} 9 L{-273 - d:g} -9"')
            t = t.replace('<text x="-246" y="11" font-size="32"', f'<text x="{-246 - d:g}" y="11" font-size="{fs}"')
    if i == 13:
        for a, b in [('How You Build The Belief', 'How It Works' if REQ else 'How We&rsquo;ll Do It Together'), ('Meet <em>Emotional Resonance</em>', 'How You&rsquo;ll Build <em>' + q(R['title_word']) + '</em>'),
                     ('You choose to feel the feeling of it', 'You choose to feel ' + q(R['feeling'])),
                     ('&ldquo;I&rsquo;m someone who finds love&rdquo;', q('"' + B['belief'] + '"'))]:
            t = rep(t, a, b)
        t = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">' + q(R['intro']) + '</p>', t, count=1, flags=re.S)
    # speech bubbles stretch to fit their text (Olly 2026-11-13: "Is this going anywhere?" spilled out of its pill)
    def fitpill(m):
        x, y, w, rest, tx, ttag, txt = m.group(1), m.group(2), float(m.group(3)), m.group(4), float(m.group(5)), m.group(6), m.group(7)
        plain = re.sub(r'&[a-z]+;', "'", txt)
        need = len(plain) * 15.5 + 56
        w0 = w
        if need > w: w = need; x = str(round(tx - w / 2))
        if need <= 560:   # one line up to ~32 characters (fits the scenes); only longer thoughts wrap
            tx2 = m.group(5)
            if float(x) < -262:   # keep a stretched pill inside the scene's left edge (viewBox starts at -270)
                sh = -262 - float(x); x = '-262'; tx2 = f'{tx + sh:g}'
            return f'<rect x="{x}" y="{y}" width="{round(w)}"{rest}<text x="{tx2}"{ttag}>{txt}</text>'
        # Olly 2026-11-13: a long thought ran across both heads. Wrap it into lines that stay left of the
        # thought dots (scene x -265..150), growing upwards from the pill's original bottom edge.
        L, R, cw, lh = -265, 150, 14.4, 31
        words, lines, cur = txt.split(' '), [], ''
        for wd in words:
            tt = (cur + ' ' + wd).strip()
            if len(re.sub(r'&[a-z]+;', "'", tt)) * cw + 48 <= R - L: cur = tt
            else: lines.append(cur); cur = wd
        lines.append(cur)
        n = len(lines); plen = lambda s: len(re.sub(r'&[a-z]+;', "'", s))
        for lim in range(-(-plen(txt) // n), 200):   # balance: shortest line limit that still gives n lines (no orphan word)
            bl, cur = [], ''
            for wd in words:
                tt = (cur + ' ' + wd).strip()
                if plen(tt) <= lim or not cur: cur = tt
                else: bl.append(cur); cur = wd
            bl.append(cur)
            if len(bl) <= n: lines = bl; break
        w = max(plen(l) for l in lines) * cw + 48
        cx = R - w / 2; h = len(lines) * lh + 24; top = float(y) + 60 - h
        if top < 42: print('WARNING: wrapped bubble taller than the scene:', plain)
        ttag2 = re.sub(r'font-size="\d+"', 'font-size="26"', ttag)
        spans = ''.join(f'<tspan x="{round(cx)}" dy="{lh if i else 0}">{l}</tspan>' for i, l in enumerate(lines))
        rest2 = re.sub(r'height="60"', f'height="{round(h)}"', rest)
        return f'<rect x="{round(cx - w / 2)}" y="{round(top)}" width="{round(w)}"{rest2}<text x="{round(cx)}" y="{round(top + 12 + lh * 0.78)}"{re.sub(r" y=\"[\d.]+\"", "", ttag2)}>{spans}</text>'
    t = re.sub(r'<rect x="(-?[\d.]+)" y="([\d.]+)" width="([\d.]+)"( height="60" rx="30"[^>]*/>)<text x="(-?[\d.]+)"([^>]*)>([^<]*)</text>', fitpill, t)
    t = re.sub(r'<div class="foot">.*?</div>', f'<div class="foot"><span>{E(name)}&rsquo;s Plan</span><span>Page {n} of {STICK_TOTAL}</span></div>', t, count=1, flags=re.S)
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
       '.commit-pg .clist p{margin:0;font-size:16px;line-height:1.45;color:#1d1527}.commit-pg .clist b{color:#6b21a8}'
       '.sum-pg .clist{gap:9px;margin-top:14px}.sum-pg .clist>div{padding:10px 14px;gap:12px}.sum-pg .clist p{font-size:14px;line-height:1.4}.sum-pg .clist i{width:26px;height:26px;font-size:13px}\n</style>')
k = p.index('</style>'); p = p[:k] + css + p[k + len('</style>'):]
if REQ:  # part 1 ends with a short "what I'd do" + a soft offer (Olly 2026-11-13: no program, no screenshots, just what to do)
    fl = S['feeling'].lower(); neg = D['feeling'].lower()
    # Olly 2026-11-13: a first-person summary in his order (belief -> daily practice -> anchor -> act from it -> meet someone from a good place).
    # spec "request_summary": [[title, text] x5] overrides it per person (written in their words).
    rs = S.get('request_summary') or [
        ['Build a new belief.', f'I&rsquo;d rewire a new subconscious belief: {q(chr(34) + B["belief"] + chr(34))}.'],
        ['Practice it every day.', f'To do that, I&rsquo;d think {q(chr(34) + B["thought"] + chr(34))} and feel {E(fl)}, and repeat it as part of a daily meditation practice.'],
        ['Anchor it when the doubt comes up.', f'Whenever the {E(neg)} come back, or {q(chr(34) + D["thought"] + chr(34))} pops into my head, I&rsquo;d bring that feeling of {E(fl)} straight back.'],
        ['Act from that place.', 'As I built confidence and felt more aligned, I&rsquo;d start taking action from there. I&rsquo;d feel better about myself and more like the real me.'],
        ['Meet someone from a good place.', 'So when I meet someone, I&rsquo;m not worrying whether it will happen or whether they&rsquo;re the right person. I&rsquo;m in the moment, and we build it from a really good place.']]
    nxt = f'''      <section class="pg commit-pg sum-pg">
        <div class="eyebrow">Your next steps</div>
        <h2 class="sm">What I&rsquo;d Do If I Were <em>You</em></h2>
        <div class="clist">
          {''.join(f'<div><i>{k}</i><p><b>{t}</b> {x}</p></div>' for k, (t, x) in enumerate(rs, 1))}
        </div>
        <div class="foot"><span>Page 9 of 10</span><span>The Heart Attractor Program</span></div>
      </section>
'''
    end1 = '''      <section class="pg closing">
        <div class="eyebrow">Your plan</div>
        <h2><span data-v="name"></span>, Does This Sound Like <em>Your Situation?</em></h2>
        <div class="journey"><div class="to"><div class="head">Where we're going</div><span data-v="wantYou"></span></div></div>
        <p class="steptext">This is what I'd do, and these are the steps. Let me know your thoughts.</p>
        <p class="steptext" style="margin-top:12px">If you'd like some help with this, I have a program that takes you through it step by step, and I can send you more information about it. Just let me know if that's something you're interested in.</p>
        <div class="signoff"><img data-img="olly.jpg" alt="Olly Henson"><div><b>Olly Henson</b><span>The Heart Attractor Program</span></div></div>
        <div class="foot"><span>Page 10 of 10</span><span>The Heart Attractor Program</span></div>
      </section>
'''
    k = p.index('<section class="pg closing">'); k = p.index('</section>', k) + len('</section>\n')
    open2 = '''      <section class="pg closing">
        <div class="eyebrow">Part 2 of your plan</div>
        <h2><span data-v="name"></span>, Here's How We'd Do This <em>Together</em></h2>
        <div class="journey"><div class="to"><div class="head">Where we're going</div><span data-v="wantYou"></span></div></div>
        <p class="steptext">You've seen your plan and the steps I'd take in your shoes. This is how we'd do it together, step by step, inside The Heart Attractor Program.</p>
        <div class="signoff"><img data-img="olly.jpg" alt="Olly Henson"><div><b>Olly Henson</b><span>The Heart Attractor Program</span></div></div>
        <div class="foot"><span>Page 1 of 13</span><span>The Heart Attractor Program</span></div>
      </section>
'''
    p = p[:k] + nxt + end1 + open2 + p[k:]
if SIMPLE:
    fl, neg = S['feeling'].lower(), D['feeling'].lower()
    cs = S.get('core') or {}
    core = f'''      <section class="pg commit-pg">
        <div class="eyebrow">What needs to happen</div>
        <h2 class="sm">You Need To Feel <em>{E(fl.capitalize())}</em> Every Day</h2>
        <p class="steptext">{cs.get('intro') or f'To create the relationship you want, you need to feel {E(fl)} every day. Not just think about it. Actually feel it.'}</p>
        <div class="clist">
          <div><i>1</i><p><b>Feel {E(fl)} every day.</b> {q(R['intro'])}</p></div>
          <div><i>2</i><p><b>There&rsquo;s less room for {E(neg)}.</b> Every time you feel {E(fl)}, you&rsquo;re not feeling {E(neg)}.</p></div>
          <div><i>3</i><p><b>It builds the belief.</b> A thought and a feeling repeated every day become a belief: {q(chr(34) + B['belief'] + chr(34))}.</p></div>
        </div>
        <p class="steptext" style="margin-top:16px">{cs.get('outro') or 'That&rsquo;s what makes this work. Everything else in this plan comes from this one thing.'}</p>
        <div class="foot"><span>Page 5 of {NPAGES}</span><span>The Heart Attractor Program</span></div>
      </section>
'''
    k = p.index('<section class="pg closing">'); k = p.index('</section>', k) + len('</section>\n')
    p = p[:k] + core + p[k:]
(out / 'plan.html').write_text(p, encoding='utf-8')
shoot = (ROOT / 'tools/plan_v4_shoot.js')
senv = dict(os.environ)
if REQ:
    m = {'0': ['p01', ''], '15': ['next1', 'Page 9 of 10'], '16': ['end1', 'Page 10 of 10'], '17': ['q00', 'Page 1 of 13']}
    for j in range(12): m[str(3 + j)] = ['q%02d' % (j + 1), 'Page %d of 13' % (j + 2)]
    senv['PV4_MAP'] = json.dumps(m)
if SIMPLE:
    if PROG:
        m = {'0': ['p01', ''], '15': ['core', 'Page 5 of 20']}
        for j in range(12): m[str(3 + j)] = ['p%02d' % (9 + j), 'Page %d of 20' % (9 + j)]
        senv['PV4_MAP'] = json.dumps(m)
    else:
        senv['PV4_MAP'] = json.dumps({'0': ['p01', ''], '15': ['core', 'Page 5 of 10'], '13': ['note', 'Page 9 of 10'], '14': ['close', 'Page 10 of 10']})
r = subprocess.run(['node', str(shoot), str(out)], capture_output=True, text=True, env=senv)
print('photo pages:', (r.stdout + r.stderr).strip()[-300:])

# ---------- 4. preview + page images ----------
stick = [out / f'stick/{i:02d}.jpg' for i in range(1, 7 if SIMPLE else 8)]
if SIMPLE:
    tailpgs = [out / f'plan/p{n:02d}.jpg' for n in range(9, 21)] if PROG else [out / 'plan/note.jpg', out / 'plan/close.jpg']
    PARTS = [('kv', [out / 'plan/p01.jpg'] + stick[:3] + [out / 'plan/core.jpg'] + stick[3:] + tailpgs)]
elif REQ:
    PARTS = [('kv', [out / 'plan/p01.jpg'] + stick + [out / 'plan/next1.jpg', out / 'plan/end1.jpg']), ('kv2', [out / f'plan/q{n:02d}.jpg' for n in range(0, 13)])]
else:
    PARTS = [('kv', [out / 'plan/p01.jpg'] + stick + [out / f'plan/p{n:02d}.jpg' for n in range(9, 21)])]
imgs = []
for kdir, files in PARTS:
    (out / kdir).mkdir(exist_ok=True)
    if REQ: imgs.append('<h2 style="margin:18px 0 0;font-size:18px">' + ('Part 1: their plan (send first)' if kdir == 'kv' else 'Part 2: the program (only once they ask how)') + '</h2>')
    for k, f in enumerate(files, 1):
        im = Image.open(f).convert('RGB').resize((1080, 1350), Image.LANCZOS); im.save(out / f'{kdir}/{k:02d}.jpg', 'JPEG', quality=86)
        b = io.BytesIO(); im.save(b, 'JPEG', quality=84)
        imgs.append(f'<img src="data:image/jpeg;base64,{base64.b64encode(b.getvalue()).decode()}" alt="Page {k}" loading="lazy">')
html = ('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        f'<title>{E(name)} Plan Preview</title><style>:root{{--bg:#2a2233;--ink:#f4eefc;--muted:#c9bcd9}}'
        '@media (prefers-color-scheme: light){:root:not([data-theme="dark"]){--bg:#efe9f6;--ink:#241b30;--muted:#5d5070}}'
        ':root[data-theme="light"]{--bg:#efe9f6;--ink:#241b30;--muted:#5d5070}'
        'body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,Segoe UI,Arial,sans-serif}'
        'header{max-width:540px;margin:0 auto;padding:20px 16px 4px}h1{font-size:20px;margin:0 0 4px}p{margin:0;color:var(--muted);font-size:14px}'
        'main{max-width:540px;margin:0 auto;padding:12px 16px 40px;display:flex;flex-direction:column;gap:18px}'
        'img{width:100%;height:auto;display:block;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.25)}</style></head><body>'
        f'<header><h1>{E(name)}&rsquo;s plan of action (preview)</h1><p>' + ('Plan request: part 1 (10 pages) then part 2 (13 pages)' if REQ else f'{NPAGES} pages (simple plan' + (' + program steps)' if PROG else ')') if SIMPLE else '20 pages') + ', exactly as they will see them.</p></header><main>'
        + ''.join(imgs) + '</main></body></html>')
(out / 'preview.html').write_text(html, encoding='utf-8')
print('preview:', out / 'preview.html')

# ---------- 5. upload to the Hub (their tracked /p/<code> link) ----------
if upload:
    cid = S['contact_id']
    W = sorted(glob.glob('C:/Users/Olly/AppData/Local/npm-cache/_npx/*/node_modules/wrangler/bin/wrangler.js'))[-1]
    def kv(*a):
        r = subprocess.run(['node', W, 'kv', 'key', *a, '--namespace-id', NS, '--remote'], cwd=HUB, capture_output=True, text=True, encoding='utf-8', errors='replace')
        return (r.stdout or '') + (r.stderr or '')
    def put_plan(pid, kdir, n):
        got = kv('get', 'plan:' + pid)
        try: old = json.loads(got[got.index('{'):got.rindex('}') + 1])
        except Exception: old = {}
        code = old.get('_code') or ''.join(secrets.choice('abcdefghijkmnpqrstuvwxyz23456789') for _ in range(10))
        rec = dict(old); rec.update(preset); rec['_code'] = code
        (out / kdir / 'plan.json').write_text(json.dumps(rec), encoding='utf-8')
        for k in range(1, n + 1): kv('put', f'planimg:{pid}:{k:02d}', '--path', str(out / f'{kdir}/{k:02d}.jpg'))
        kv('put', 'plan:' + pid, '--path', str(out / kdir / 'plan.json'))
        kv('put', 'share:' + code, pid)
        if not old.get('_code'):
            kv('put', 'planview:' + pid, 'x', '--metadata', json.dumps({'opens': 0, 'first': None, 'last': None, 'pdf': 0, 'code': code}))
        # link preview thumbnail (Olly, 2026-11-14): the top of their cover (name + title + Olly's photo) at 1200x630,
        # served at /p/<code>/og.jpg so WhatsApp/email/iMessage show a picture instead of a bare link
        Image.open(out / f'{kdir}/01.jpg').convert('RGB').crop((3, 30, 1077, 597)).resize((1200, 630), Image.LANCZOS).save(out / kdir / 'og.jpg', quality=85)
        kv('put', 'planog:' + pid, '--path', str(out / kdir / 'og.jpg'))
        kv('put', 'planimgs:' + pid, str(n))
        return code
    if REQ:
        print('LIVE part 1: https://hub.ollyhenson.com/p/' + put_plan(cid, 'kv', 10))
        print('LIVE part 2 (program): https://hub.ollyhenson.com/p/' + put_plan(cid + '-program', 'kv2', 13))
    else:
        print('LIVE: https://hub.ollyhenson.com/p/' + put_plan(cid, 'kv', NPAGES if SIMPLE else TOTAL))
