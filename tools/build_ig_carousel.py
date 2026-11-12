# Instagram carousel (pinned post) from the approved 14-slide "Meet your person" explainer (Olly 2026-11-12).
# Reuses the exact slides from build_simple_explainer.py, restyled for 1080x1350 portrait + phone reading,
# animations frozen into stills, plus a final CTA slide (Comment EMOTION -> The Feeling Finder).
# Run from heartattractor/:
#   python tools/build_ig_carousel.py                      -> marketing/carousels/meet-your-person/carousel.html
#   node tools/export_carousel.js marketing/carousels/meet-your-person/carousel.html marketing/carousels/meet-your-person
import re, pathlib

# build the simple explainer in memory only (don't rewrite the approved files)
_wt = pathlib.Path.write_text
pathlib.Path.write_text = lambda self, *a, **k: None
ns = {'__name__': 'ig'}
exec(open('tools/build_simple_explainer.py', encoding='utf-8').read(), ns)
pathlib.Path.write_text = _wt
g = ns
A = ns['g']   # the long explainer's namespace (icons, couple, math)
S, slide, fig, heart, floathearts, HEART = g['S'], g['slide'], g['fig'], g['heart'], g['floathearts'], g['HEART']
S = list(S)

# ---- per-slide portrait tweaks ----
# wide 1200x390 scenes: crop the viewBox to the part that matters so the drawing fills the tall frame
def crop(i, old, new):
    assert old in S[i], (i, old)
    S[i] = S[i].replace(old, new, 1)
crop(0, 'viewBox="0 0 1200 390"', 'viewBox="330 20 540 360"')       # title couple
crop(3, 'viewBox="0 0 1200 390"', 'viewBox="60 40 1080 340"')       # friends + crossed-out pills
crop(11, 'viewBox="0 0 1200 390"', 'viewBox="40 40 1130 340"')      # unfold naturally
crop(12, 'viewBox="0 0 1200 390"', 'viewBox="330 20 540 360"')      # nothing to fix: couple has met

# ---- portrait redraws: same drawings + same words, stacked so text reads on a phone ----
def rebody(i, body):
    """Swap a slide's board for a portrait version; eyebrow, title and sub stay exactly as approved."""
    new, n = re.subn(r'<div class="board">.*</div>\n  </section>', lambda m: '<div class="board">' + body + '</div>\n  </section>', S[i], flags=re.S)
    assert n == 1, i
    S[i] = new
ico = lambda inner, vb='-62 -62 124 124': f'<svg viewBox="{vb}" aria-hidden="true">{inner}</svg>'
def eqstack(theme, rows, er=False):
    """Vertical equation: thought + feeling + repetition = belief. rows = [(icon, title, line)], last row = the belief."""
    c = {'red': '#b42318', 'green': '#1a7f37', 'pink': '#db2777'}[theme]
    sym = lambda t, col=c: f'<div class="eqop" style="color:{col}">{t}</div>'
    card = lambda r, end=False: (f'<div class="eqrow {theme}{" end" if end else ""}"><div class="eqi">{ico(r[0])}</div>'
                                 f'<div><b>{r[1]}</b><span>{r[2]}</span></div></div>')
    parts = card(rows[0]) + sym('+') + card(rows[1]) + sym('+') + card(rows[2])
    if er:
        parts = f'<div class="erband"><div class="ertag">Emotional Resonance</div>{parts}</div>'
    return f'<div class="eqs">{parts}{sym("=", "var(--purple)" if er else c)}{card(rows[3], True)}</div>'
M = A['math']
th, hi, rp = A['thought_icon'], A['heart_icon'], A['repeat_icon']
R, G_, P = '#b42318', '#1a7f37', '#db2777'
# 8 Where You Lost Your Belief (wording = build_simple_explainer.py)
rebody(7, eqstack('red', [(th(R), 'The Thought', '&ldquo;I never seem to meet the right person&rdquo;'), (hi(R), 'The Feeling', 'Worry and hopelessness'),
                          (rp(R), 'Repetition', 'You repeat this over and over'), (A['cross_icon'], 'The Belief', '&ldquo;I&rsquo;m someone who can&rsquo;t find love&rdquo;')]))
# 10 How To Reverse It
rebody(9, eqstack('green', [(th(G_), 'The Thought', '&ldquo;I&rsquo;m with my person&rdquo;'), (hi(G_), 'The Feeling', 'Safe and at peace'),
                            (rp(G_), 'Repetition', 'You repeat this over and over'), (g['belief_icon'], 'The Belief', '&ldquo;I&rsquo;m someone who finds love&rdquo;')]))
# 14 Meet Emotional Resonance (bracket becomes a pink band around the first three)
rebody(13, eqstack('pink', [(th(P), 'The Thought', 'You choose to think &ldquo;I&rsquo;m with my person&rdquo;'), (hi(P), 'The Feeling', 'You choose to feel the feeling of it'),
                            (rp(P), 'Repetition', 'You do this every day'), (g['belief_icon'], 'The Belief', '&ldquo;I&rsquo;m someone who finds love&rdquo;')], er=True))

# 6 That's Why Learning Hasn't Helped: the loop stacked top to bottom, arrow back up the side
def vcard(y, n, title, l1, l2, end=False):
    bg, st, tc, lc, nb, nc = ('var(--purple)', 'var(--purple)', '#fff', '#f1e8fd', '#fff', 'var(--purple)') if end else ('#fff', '#e2d4f4', 'var(--ink)', 'var(--soft)', 'var(--purple)', '#fff')
    return (f'<g transform="translate(0 {y})"><rect x="20" y="0" width="790" height="176" rx="24" fill="{bg}" stroke="{st}" stroke-width="3"/>'
            f'<circle cx="88" cy="88" r="34" fill="{nb}" stroke="{st}" stroke-width="3"/><text x="88" y="101" text-anchor="middle" font-size="34" font-weight="800" fill="{nc}">{n}</text>'
            f'<text x="150" y="64" font-family="Playfair Display, Georgia, serif" font-weight="900" font-size="48" fill="{tc}">{title}</text>'
            f'<text x="150" y="110" font-size="31" fill="{lc}">{l1}</text><text x="150" y="148" font-size="31" fill="{lc}">{l2}</text></g>')
red_arrow = lambda d: f'<path d="{d}" fill="none" stroke="var(--red)" stroke-width="7" stroke-linecap="round" stroke-dasharray="16 14" marker-end="url(#vlA)"/>'
rebody(5, '<div class="scene"><svg viewBox="0 0 950 690" role="img" aria-label="A loop: doubt leads to discomfort, discomfort leads to overthinking and trying to fix yourself, which feeds the doubt again">'
  '<defs><marker id="vlA" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="var(--red)"/></marker></defs>'
  + vcard(14, '1', 'Doubt', 'Part of you still doesn&rsquo;t', 'believe it can happen')
  + red_arrow('M415 196 V236') + vcard(256, '2', 'Discomfort', 'Worry, dread and a tight', 'feeling in your chest')
  + red_arrow('M415 438 V478') + vcard(498, '3', 'Overthinking', 'You try to learn and', '&lsquo;fix&rsquo; your way out', end=True)
  + red_arrow('M815 586 H858 Q890 586 890 554 V134 Q890 102 858 102 H832')
  + '<text transform="translate(928 344) rotate(90)" text-anchor="middle" font-size="24" font-weight="800" letter-spacing="3" fill="var(--red)">ROUND AND ROUND</text>'
  + '</svg></div>')

# 3 You've Tried Everything: figure on top, the list as big pills underneath
def bigpill(x, y, t, w=420):
    return (f'<g transform="translate({x} {y})"><rect x="{-w/2}" y="-36" width="{w}" height="72" rx="36" fill="#fff" stroke="#e2d4f4" stroke-width="3"/>'
            f'<text x="0" y="11" text-anchor="middle" font-size="31" font-weight="700" fill="var(--purple)">{t}</text></g>')
m3 = re.search(r'<div class="scene"><svg viewBox="0 0 700 390" role="img" aria-label="A stick figure surrounded by everything they have tried">.*?</svg></div>', S[2], re.S)
assert m3
pills3 = [(250, 'Attachment styles'), (700, 'Boundaries'), (250, 'Red flags'), (700, 'Healing your wounds'), (250, 'Manifestation'), (700, 'Not chasing'), (475, 'Nervous system work')]
S[2] = S[2].replace(m3.group(0), '<div class="scene"><svg viewBox="0 0 950 600" role="img" aria-label="A stick figure surrounded by everything they have tried">'
  + A['scribble'](475, 34, 52, 20, 22) + fig(475, 92, mouth='frown', arms='head', s=.62)
  + ''.join(bigpill(x, 300 + 88 * (k // 2), t) for k, (x, t) in enumerate(pills3))
  + '</svg></div>')

# 7 Your Belief Shapes What Happens: same loop, drawn big
def bigloop():
    labels = ['Your Belief', 'What You Notice', 'What You Think', 'What You Do', 'What Happens']
    cx, cy, rx, ry = 475, 330, 300, 270
    out = f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="none" stroke="var(--violet)" stroke-width="6" stroke-dasharray="14 14" opacity=".7"/>'
    for k in range(5):
        a = -M.pi / 2 + (k + .5) * 2 * M.pi / 5
        x, y = cx + rx * M.cos(a), cy + ry * M.sin(a)
        out += f'<path d="M-12 -12 L8 0 L-12 12" transform="translate({x:.0f} {y:.0f}) rotate({M.degrees(a) + 90:.0f})" fill="none" stroke="var(--violet)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>'
    for k, t in enumerate(labels):
        a = -M.pi / 2 + k * 2 * M.pi / 5
        x, y = cx + rx * M.cos(a), cy + ry * M.sin(a)
        w = len(t) * 18.5 + 50
        bg, fg, st = ('var(--purple)', '#fff', 'var(--purple)') if k == 0 else ('#fff', 'var(--purple)', '#e2d4f4')
        out += (f'<g transform="translate({x:.0f} {y:.0f})"><rect x="{-w/2:.0f}" y="-34" width="{w:.0f}" height="68" rx="34" fill="{bg}" stroke="{st}" stroke-width="3"/>'
                f'<text x="0" y="11" text-anchor="middle" font-size="32" font-weight="700" fill="{fg}">{t}</text></g>')
    out += fig(475, 270, mouth='smile', s=.55)
    return '<div class="scene"><svg viewBox="0 0 950 650" role="img" aria-label="A loop: your belief, what you notice, what you think, what you do, what happens, back to your belief">' + out + '</svg></div>'
rebody(6, bigloop())

# 4 Your Friends Didn't Need Any Of This: two couples on top, crossed-out list below
def bigstrike(x, y, t, w=400):
    return (f'<g transform="translate({x} {y})"><rect x="{-w/2}" y="-36" width="{w}" height="72" rx="36" fill="#fff" stroke="#e2d4f4" stroke-width="3"/>'
            f'<text x="0" y="11" text-anchor="middle" font-size="31" font-weight="700" fill="#8a7f99">{t}</text>'
            f'<path d="M{-w/2+26} 0 H{w/2-26}" stroke="var(--red)" stroke-width="4" stroke-linecap="round" opacity=".85"/></g>')
rebody(3, '<div class="scene"><svg viewBox="0 0 950 640" role="img" aria-label="Two happy couples, and below them the things they never needed, crossed out">'
  '<line x1="30" y1="352" x2="920" y2="352" stroke="#d9c7f0" stroke-width="4"/>'
  + '<g transform="translate(0 -30)">' + A['couple'](240) + A['couple'](710) + '</g>'
  + bigstrike(255, 430, 'Attachment styles') + bigstrike(695, 430, 'Healing every wound')
  + bigstrike(255, 540, 'Red flags') + bigstrike(695, 540, 'Dating rules')
  + '</svg></div>')

# 12 Then Things Start To Unfold Naturally: you (top) -> three changes -> the right person walks in
def bigok(y, t):
    return (f'<g transform="translate(475 {y})"><rect x="-330" y="-38" width="660" height="76" rx="38" fill="#f6fcf8" stroke="var(--greenline)" stroke-width="3"/>'
            f'<circle cx="-284" cy="0" r="22" fill="var(--greenbg)" stroke="var(--greenline)" stroke-width="2.5"/>'
            f'<path d="M-295 0 L-287 9 L-273 -9" fill="none" stroke="var(--green)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<text x="-246" y="11" font-size="32" font-weight="700" fill="var(--ink)">{t}</text></g>')
rebody(11, '<div class="scene"><svg viewBox="0 0 950 660" role="img" aria-label="A calm stick figure; from them come being relaxed and yourself, noticing the right people, losing interest in time wasters; the right person walks in">'
  '<defs><radialGradient id="ufGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f472b6" stop-opacity=".42"/><stop offset=".6" stop-color="#f472b6" stop-opacity=".18"/><stop offset="1" stop-color="#f472b6" stop-opacity="0"/></radialGradient></defs>'
  '<ellipse cx="190" cy="140" rx="135" ry="135" fill="url(#ufGlow)"/>'
  + fig(190, 70, mouth='smile', s=.62) + heart(190, 120, .8)
  + '<path d="M330 140 H560" fill="none" stroke="var(--violet)" stroke-width="6" stroke-linecap="round" stroke-dasharray="14 12"/>'
  + '<g transform="translate(0 0)">' + fig(760, 70, mouth='smile', s=.62) + '</g>'
  + floathearts([(670, 60, .8, 0), (850, 50, .9, 0), (860, 170, .7, 0)])
  + '<text x="760" y="262" text-anchor="middle" font-size="22" font-weight="700" fill="var(--soft)">&nbsp;</text>'
  + bigok(340, 'Relaxed and yourself') + bigok(440, 'You notice the right people') + bigok(540, 'Time wasters lose appeal')
  + '<text x="475" y="640" text-anchor="middle" font-size="34" font-weight="800" fill="var(--purple)">The right people start showing up</text>'
  + '</svg></div>')

# 9 + 11 first-date scenes: bigger thought bubbles above the left person
def bigbubbles(svg, bubbles, col, line):
    svg = re.sub(r'<g class="bob"[^>]*><rect.*?</text></g>', '', svg, flags=re.S)
    svg = re.sub(r'<circle cx="20[0-9]" cy="1[0-2][0-9]" r="[46]"[^>]*/>', '', svg)
    add = ''.join(f'<g><rect x="{x - w/2:.0f}" y="{y - 30}" width="{w}" height="60" rx="30" fill="#fff" stroke="{line}" stroke-width="3.5"/>'
                  f'<text x="{x}" y="{y + 10}" text-anchor="middle" font-size="28" font-weight="700" fill="{col}">{t}</text></g>' for x, y, w, t in bubbles)
    dots = f'<circle cx="168" cy="150" r="7" fill="#fff" stroke="{line}" stroke-width="3"/><circle cx="186" cy="136" r="4.5" fill="#fff" stroke="{line}" stroke-width="2.5"/>'
    svg = svg.replace('<line x1="0" y1="380" x2="700"', '<line x1="-270" y1="380" x2="600"', 1)
    return svg.replace('viewBox="0 0 700 390"', 'viewBox="-270 40 870 350"', 1).replace('</svg>', add + dots + '</svg>')
for i, mode, bubbles, col, line in [
    (8, 'doubt', [(-60, 130, 270, 'Am I too much?'), (-60, 215, 340, 'They&rsquo;ll lose interest')], 'var(--red)', 'var(--redline)'),
    (10, 'belief', [(-70, 105, 300, 'I&rsquo;m enjoying this'), (-70, 185, 280, 'I can just be me'), (-55, 265, 410, 'Whatever happens, I&rsquo;m okay')], 'var(--green)', 'var(--greenline)')]:
    m = re.search(r'<svg viewBox="0 0 700 390" role="img" aria-label="Side view of a first date.*?</svg>', S[i], re.S)   # (scribble is random, so match, don't regenerate)
    assert m, i
    S[i] = S[i].replace(m.group(0), bigbubbles(m.group(0), bubbles, col, line))

# Slide 1 = grid hook: bigger title, 'swipe' cue
S[0] = S[0].replace('<section class="slide"', '<section class="slide hook"', 1)

# ---- CTA slide (Olly's wording) ----
cta_scene = ('<div class="scene"><svg viewBox="0 0 700 420" role="img" aria-label="A calm stick figure with a glowing heart, hearts floating up">'
  '<defs><radialGradient id="ctaGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f472b6" stop-opacity=".45"/><stop offset=".6" stop-color="#f472b6" stop-opacity=".18"/><stop offset="1" stop-color="#f472b6" stop-opacity="0"/></radialGradient></defs>'
  '<line x1="0" y1="400" x2="700" y2="400" stroke="#d9c7f0" stroke-width="4"/>'
  '<ellipse cx="350" cy="230" rx="210" ry="190" fill="url(#ctaGlow)"/>'
  + fig(350, 150, eyes='closed', mouth='smile', arms='heart', s=.95) + heart(350, 222, 1.2)
  + floathearts([(200, 150, .8, 0), (500, 120, .9, 0), (230, 300, .7, 0), (490, 290, .8, 0), (350, 40, .7, 0)])
  + '</svg></div>')
S.append('''  <section class="slide cta" data-n="15">
    <div class="head">
      <div class="eyebrow">Your Next Step</div>
      <h1>Want To Build Your Belief Using <em>Emotional Resonance?</em></h1>
      <p class="sub">Use my free tool, <b>The Feeling Finder</b>, to find the emotion that builds the belief you need to attract the relationship you want.</p>
    </div>
    <div class="board">''' + cta_scene + '''</div>
    <div class="ctabox"><div class="ctarow"><span>Comment or DM me</span><b>EMOTION</b><span>below</span></div><div class="ctasub">and I&rsquo;ll send it to you</div></div>
  </section>
''')

PDF_S = list(S[:-1])   # PDF follow-up for applicants (after their plan): the 14 slides, no EMOTION CTA, site footer
# closing page (Olly 2026-11-12): one line, no list of what's included, no call to action
_couple = re.search(r'<div class="scene">.*?</svg></div>', S[0], re.S).group(0).replace('t1glow', 'endglow')
PDF_S.append('''  <section class="slide closing" data-n="15">
    <div class="head">
      <div class="eyebrow">The Heart Attractor Program</div>
      <h1><em>Emotional Resonance</em> Is What We Build With You Personally</h1>
      <p class="sub">Inside The Heart Attractor Program, so you build the belief you need to meet your person.</p>
    </div>
    <div class="board">''' + _couple + '''</div>
  </section>
''')
for i in range(len(PDF_S)):
    PDF_S[i] = PDF_S[i].rsplit('</section>', 1)[0] + f'<div class="foot"><span>Olly Henson &middot; ollyhenson.com</span><span>{i+1} / {len(PDF_S)}</span></div>' + '\n  </section>\n'
N = len(S)
for i in range(N):   # footer: handle + page count + swipe arrow (not on the last slide)
    arrow = '' if i == N - 1 else ' <span class="sw">&rarr;</span>'
    foot = f'<div class="foot"><span>@attractwitholly</span><span>{i+1} / {N}{arrow}</span></div>'
    S[i] = S[i].rsplit('</section>', 1)[0] + foot + '\n  </section>\n'

page = g['html']   # simple explainer page (all its styles)
head, rest = page.split('<div class="stage" id="stage">', 1)
head = re.sub(r'<title>.*?</title>', '<title>Meet Your Person Carousel</title>', head)
css_extra = """
/* ===== Instagram portrait 1080x1350 (phone reading) ===== */
*, *::before, *::after { animation:none !important; transition:none !important; }
.handjoin, .meetglow { opacity:1 !important; }
.floatup { opacity:.75 !important; transform:none !important; }
html, body { background:#ece6f3; }
.stage { position:static !important; padding:24px 0; }
.slide, .slide.on { width:1080px !important; height:1350px !important; position:relative !important; left:auto !important; top:auto !important;
  transform:none !important; margin:0 auto 28px; display:flex !important; flex-direction:column; padding:84px 64px 40px !important; box-shadow:none; }
.slide .eyebrow { font-size:28px !important; letter-spacing:.14em; }
.slide h1 { font-size:80px !important; line-height:1.05 !important; margin-top:16px !important; }
.head .sub { font-size:38px !important; line-height:1.36 !important; margin-top:22px !important; max-width:none; color:#4a3d5c; }
.slide .board { margin-top:40px !important; flex-direction:column; }
.ex { display:flex !important; flex-direction:column; gap:28px; height:100%; }
.ex > .scene { flex:1 1 0; min-height:0; }
.ex > .note { flex:0 0 auto; }
.note { padding:36px 44px !important; }
.note small { font-size:24px !important; }
.note p { font-size:40px !important; line-height:1.35 !important; }
.ex-rows { gap:16px !important; margin-top:14px; }
.ex-rows div, .ex-rows:has(> div:nth-child(5)) div { font-size:34px !important; line-height:1.28 !important; }
.ex-rows i, .ex-rows:has(> div:nth-child(5)) i { width:50px !important; height:50px !important; font-size:23px !important; flex:0 0 auto; }
.ex-rows:has(> div:nth-child(5)) { gap:12px !important; }
.board > .scene { flex:1 1 0; min-height:0; }
.scene svg { width:100%; height:100%; }
.foot { display:flex; justify-content:space-between; align-items:center; margin-top:30px; font-size:27px; font-weight:700; color:#8b78a6; letter-spacing:.02em; }
.foot .sw { color:var(--purple); font-size:34px; margin-left:8px; }
/* slide 1 = the grid hook */
.hook { padding-top:110px !important; }
.hook h1 { font-size:96px !important; line-height:1.03 !important; }
.hook .eyebrow { font-size:32px !important; }
/* CTA */
.cta .sub b { color:var(--purple); }
.ctabox { margin-top:34px; border-radius:28px; background:var(--purple); color:#fff; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; padding:30px 20px 32px; line-height:1; }
.ctarow { display:flex; align-items:center; justify-content:center; gap:16px; }
.ctasub { font-size:36px; font-weight:500; color:#eadcfb; }
.ctabox span { font-size:44px; font-weight:600; }
.ctabox b { font-weight:800; font-size:56px; letter-spacing:.05em; margin-right:-.05em; }
.fsbtn, .count, .navbtn, .dots { display:none !important; }
/* vertical equation (slides 8, 10, 14) */
.eqs { display:flex; flex-direction:column; justify-content:center; gap:2px; height:100%; }
.eqrow { display:flex; align-items:center; gap:24px; border-radius:24px; padding:12px 28px; border:3px solid; }
.eqrow.red { background:#fff8f7; border-color:var(--redline); } .eqrow.green { background:#f6fcf8; border-color:var(--greenline); } .eqrow.pink { background:#fff; border-color:#f9a8d4; }
.eqrow.end.red { background:var(--red); border-color:var(--red); } .eqrow.end.green { background:var(--green); border-color:var(--green); } .eqrow.end.pink { background:var(--purple); border-color:var(--purple); }
.eqi { flex:0 0 78px; height:78px; } .eqi svg { width:100%; height:100%; display:block; overflow:visible; }
.eqrow b { display:block; font-family:var(--display); font-weight:900; font-size:41px; line-height:1.08; color:var(--ink); }
.eqrow span { display:block; font-size:30px; line-height:1.25; color:var(--soft); margin-top:4px; }
.eqrow.end b, .eqrow.end span { color:#fff; }
.eqop { text-align:center; font-size:42px; font-weight:800; line-height:1; }
.erband { position:relative; display:flex; flex-direction:column; gap:6px; border:4px solid #db2777; border-radius:30px; padding:36px 16px 14px; background:linear-gradient(90deg, rgba(244,114,182,.12), rgba(167,139,250,.12)); }
.ertag { position:absolute; top:-26px; left:50%; transform:translateX(-50%); background:#db2777; color:#fff; font-size:26px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; padding:10px 28px; border-radius:30px; white-space:nowrap; }
"""
html = head.replace('</style>', css_extra + '</style>', 1) + '<div class="stage" id="stage">\n' + ''.join(S) + '</div>\n</body></html>'
html = html.replace('<body>', '<body class="all">', 1)
out = pathlib.Path('marketing/carousels/meet-your-person'); out.mkdir(parents=True, exist_ok=True)
(out / 'carousel.html').write_text(html, encoding='utf-8')
print(N, 'slides ->', out / 'carousel.html')
# PDF version: same pages, printed at 1080x1350 (vector text). Export: node tools/export_pdf.js
pdf_css = '@page { size:1080px 1350px; margin:0; } html, body { background:#fff !important; } .stage { padding:0 !important; } .slide { margin:0 !important; break-after:page; }'
pdf = head.replace('<title>Meet Your Person Carousel</title>', '<title>Step-By-Step Guide</title>').replace('</style>', css_extra + pdf_css + '</style>', 1)
pdf += '<div class="stage" id="stage">\n' + ''.join(PDF_S) + '</div>\n</body></html>'
(out / 'guide-pdf.html').write_text(pdf.replace('<body>', '<body class="all">', 1), encoding='utf-8')
print(len(PDF_S), 'pages ->', out / 'guide-pdf.html')
