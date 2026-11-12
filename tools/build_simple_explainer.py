# Simple version of the explainer (Olly 2026-11-12): relate -> why it hasn't worked -> what you need -> the thing -> how -> outcome.
# Copy rule: every pain point comes from the best client, the core argument, then applicants / Feeling Finder (never invented).
# Reuses every drawing helper from build_argument_explainer.py (exec'd below), then builds its own slides.
# Run from heartattractor/:  python tools/build_simple_explainer.py  -> training/meet-your-person-simple.html
import re, pathlib
ns = {}
exec(open('tools/build_argument_explainer.py', encoding='utf-8').read(), ns)   # also rebuilds the long version (unchanged)
g = ns
fig, scribble, heart, floathearts, slide, note, pill = g['fig'], g['scribble'], g['heart'], g['floathearts'], g['slide'], g['note'], g['pill']
loopcard, eqcard, op, couple, strikepill, okpill, beliefloop = g['loopcard'], g['eqcard'], g['op'], g['couple'], g['strikepill'], g['okpill'], g['beliefloop']
icon_thought, icon_heart, icon_repeat, belief_icon, HEART = g['icon_thought'], g['icon_heart'], g['icon_repeat'], g['belief_icon'], g['HEART']


# ---- SLIDES (v2, 2026-11-12) ----
# Every line is sourced, in Olly's order: the best client (primary avatar file) > core argument v6 (argument_sheet) > applicants / Feeling Finder.
# v6 rules kept: "the right people start showing up" (never "you'll meet someone"), never frequency/manifesting, "feel it first, and the belief follows".
# ---- date scene helpers (acting from doubt vs belief) ----
def date_scene(mode):
    """Side view: two people sat on chairs facing each other across a cafe table. Thoughts sit above the LEFT person."""
    doubt = mode == 'doubt'
    def person(face):
        # side-view seated stick figure facing right (same drawing as the training's desk figure)
        mouth = {'frown': 'M224 112 Q231 107 238 112', 'smile': 'M224 108 Q231 114 238 108', 'flat': 'M225 110 H237'}[face]
        return ('<path class="furn" d="M150 120 V262 H232 M160 262 V350 M226 262 V350"/>'
                '<circle class="fig" cx="212" cy="96" r="30" fill="var(--tint)"/>'
                '<circle cx="228" cy="92" r="4.5" fill="var(--ink)"/>'
                f'<path d="{mouth}" fill="none" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/>'
                '<path class="fig" d="M206 127 L196 250 L292 252 L300 348 L326 348"/>'
                '<path class="fig" d="M204 158 L262 206 L306 214"/>')
    out = '<svg viewBox="0 0 700 390" role="img" aria-label="%s">' % (
        'Side view of a first date: two people sat facing each other at a cafe table. The person on the left is frowning, with worried thoughts above their head'
        if doubt else
        'Side view of a first date: two people sat facing each other at a cafe table, both smiling. The person on the left is calm, with a glowing heart, and hearts float between them')
    out += '<line x1="0" y1="380" x2="700" y2="380" stroke="#d9c7f0" stroke-width="4"/>'
    if not doubt:
        out += ('<defs><radialGradient id="dsGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f472b6" stop-opacity=".42"/>'
                '<stop offset=".6" stop-color="#f472b6" stop-opacity=".16"/><stop offset="1" stop-color="#f472b6" stop-opacity="0"/></radialGradient></defs>'
                '<ellipse class="glowpulse" cx="205" cy="230" rx="150" ry="150" fill="url(#dsGlow)"/>')
    out += '<g transform="translate(42 70) scale(.88)">'
    # table between them
    out += '<path class="furn" d="M296 222 H404 M318 222 V350 M382 222 V350"/>'
    out += '<path d="M318 222 h16 l-2 -16 h-12 z M366 222 h16 l-2 -16 h-12 z" fill="#fff" stroke="#9b86b8" stroke-width="3"/>'
    # left person (the one we follow) and their date, mirrored to face them
    out += person('frown' if doubt else 'smile')
    out += '<g transform="translate(700 0) scale(-1 1)">' + person('flat' if doubt else 'smile') + '</g>'
    if not doubt:
        out += f'<g transform="translate(206 150) scale(1)"><path class="heartpulse" d="{HEART}" fill="#ec4899"/></g>'
    out += '</g>'
    # thoughts above the LEFT person only (head is at about x228, y154)
    if doubt:
        out += scribble(222, 126, 40, 12, 18)
        out += ('<g class="bob"><rect x="60" y="12" width="170" height="42" rx="21" fill="#fff" stroke="var(--redline)" stroke-width="3"/>'
                '<text x="145" y="39" text-anchor="middle" font-size="17" font-weight="700" fill="var(--red)">Am I too much?</text></g>'
                '<g class="bob" style="animation-delay:-1.2s"><rect x="110" y="62" width="226" height="42" rx="21" fill="#fff" stroke="var(--redline)" stroke-width="3"/>'
                '<text x="223" y="89" text-anchor="middle" font-size="17" font-weight="700" fill="var(--red)">They&rsquo;ll lose interest</text></g>'
                '')
    else:
        out += ('<g class="bob" style="animation-delay:0s"><rect x="40" y="8" width="190" height="40" rx="20" fill="#fff" stroke="var(--greenline)" stroke-width="3"/>'
                '<text x="135" y="34" text-anchor="middle" font-size="16" font-weight="700" fill="var(--green)">I&rsquo;m enjoying this</text></g>'
                '<g class="bob" style="animation-delay:-1.1s"><rect x="236" y="8" width="190" height="40" rx="20" fill="#fff" stroke="var(--greenline)" stroke-width="3"/>'
                '<text x="331" y="34" text-anchor="middle" font-size="16" font-weight="700" fill="var(--green)">I can just be me</text></g>'
                '<g class="bob" style="animation-delay:-2.2s"><rect x="90" y="56" width="250" height="40" rx="20" fill="#fff" stroke="var(--greenline)" stroke-width="3"/>'
                '<text x="215" y="82" text-anchor="middle" font-size="16" font-weight="700" fill="var(--green)">Whatever happens, I&rsquo;m okay</text></g>'
                '<circle cx="205" cy="108" r="6" fill="#fff" stroke="var(--greenline)" stroke-width="2.5"/><circle cx="214" cy="122" r="4" fill="#fff" stroke="var(--greenline)" stroke-width="2"/>')
        out += floathearts([(330, 200, .8, 0), (360, 150, .7, -1.5), (390, 210, .9, -2.6), (350, 110, .6, -3.4)])
    return out + '</svg>'

# ---- centred 3-step loop (triangle layout, all text centred, arrows edge to edge) ----
def cloopcard(x, y, n, title, l1, l2, end=False):
    bg, st, tc, nc, lc = ('var(--purple)', 'var(--purple)', '#fff', '#e3d2fb', '#f1e8fd') if end else ('#fff', '#e2d4f4', 'var(--ink)', 'var(--purple)', 'var(--soft)')
    return (f'<g transform="translate({x} {y})"><rect x="-150" y="-58" width="300" height="116" rx="20" fill="{bg}" stroke="{st}" stroke-width="2.5"/>'
            f'<circle cx="0" cy="-58" r="17" fill="{"#fff" if end else "var(--purple)"}" stroke="{st}" stroke-width="2.5"/>'
            f'<text x="0" y="-52" text-anchor="middle" font-size="16" font-weight="800" fill="{"var(--purple)" if end else "#fff"}">{n}</text>'
            f'<text x="0" y="-6" text-anchor="middle" font-family="Playfair Display, Georgia, serif" font-weight="900" font-size="30" fill="{tc}">{title}</text>'
            f'<text x="0" y="22" text-anchor="middle" font-size="17" fill="{lc}">{l1}</text>'
            f'<text x="0" y="43" text-anchor="middle" font-size="17" fill="{lc}">{l2}</text></g>')
def stuckloop():
    red = 'var(--red)'
    a = lambda d: f'<path class="loopdash" d="{d}" fill="none" stroke="{red}" stroke-width="5" stroke-linecap="round" marker-end="url(#slA)"/>'
    return ('<div class="scene"><svg viewBox="0 0 1200 390" role="img" aria-label="A loop: doubt leads to discomfort, discomfort leads to overthinking and trying to fix yourself, which feeds the doubt again">'
      + '<defs><marker id="slA" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="var(--red)"/></marker></defs>'
      + a('M760 86 C860 86 905 150 905 222')          # doubt -> discomfort
      + a('M740 312 C680 352 520 352 462 312')        # discomfort -> overthinking
      + a('M295 222 C295 150 340 86 440 86')          # overthinking -> doubt
      + cloopcard(600, 86, '1', 'Doubt', 'Part of you still doesn&rsquo;t', 'believe it can happen')
      + cloopcard(905, 300, '2', 'Discomfort', 'Worry, dread and a tight', 'feeling in your chest')
      + cloopcard(295, 300, '3', 'Overthinking', 'You try to learn and', '&lsquo;fix&rsquo; your way out', end=True)
      + fig(600, 186, mouth='frown', arms='head', s=.34)
      + '<text x="600" y="296" text-anchor="middle" font-size="14" font-weight="800" letter-spacing="2.5" fill="var(--red)">ROUND AND ROUND</text>'
      + '</svg></div>')

S = []

# 1 Title (Olly's own title)
S.append(slide(1, 'Step-By-Step Guide', 'A Step-By-Step Guide To Meeting Someone You Can <em>Settle Down And Build Your Life With</em>',
  '<div class="scene"><svg viewBox="0 0 1200 390" role="img" aria-label="A calm stick figure with a glowing heart holding hands with their partner">'
  + '<line x1="40" y1="372" x2="1160" y2="372" stroke="#d9c7f0" stroke-width="4"/>'
  + '<defs><radialGradient id="t1glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f472b6" stop-opacity=".45"/><stop offset=".6" stop-color="#f472b6" stop-opacity=".2"/><stop offset="1" stop-color="#f472b6" stop-opacity="0"/></radialGradient></defs>'
  + '<ellipse class="glowpulse" cx="600" cy="205" rx="250" ry="185" fill="url(#t1glow)"/>'
  + fig(530, 128, eyes='closed', mouth='smile', s=.9) + fig(670, 128, mouth='smile', s=.9)
  + '<path class="fig" d="M586 276 L614 276"/><circle cx="600" cy="276" r="9" fill="var(--ink)"/>' + heart(530, 200, 1.1)
  + floathearts([(440, 110, .8, 0), (600, 70, .9, -1.7), (760, 120, .7, -3), (420, 240, .7, -2.2), (785, 250, .8, -.9)])
  + '</svg></div>'))

# 2 Relate (best client x2, argument pain + bleeding neck, applicants)
S.append(slide(0, 'Where You Are Right Now', 'Does This <em>Sound Like You?</em>',
  '<div class="ex"><div class="scene"><svg viewBox="0 0 700 390" role="img" aria-label="A tired, worried stick figure with a tangle of overthinking above their head">'
  + '<line x1="0" y1="372" x2="700" y2="372" stroke="#d9c7f0" stroke-width="4"/>'
  + scribble(350, 46, 70, 26, 24) + fig(350, 112, mouth='frown', arms='head', s=.9)
  + '</svg></div>'
  + note(['You&rsquo;ve done the work, but love is the one area that hasn&rsquo;t shifted',
          'There&rsquo;s always something else to fix',
          'Your friends are settling down and nothing is happening for you',
          'You&rsquo;ve been single longer than you ever expected',
          'Part of you thinks: &ldquo;Maybe it can happen for others, but not for me&rdquo;'], label='You Might Be Feeling')
  + '</div>'))

# 3 Tried everything (the best client's own list + argument point 5)
topics = [(140, 78, 'Attachment styles'), (560, 78, 'Boundaries'), (140, 168, 'Red flags'), (560, 168, 'Healing your wounds'),
          (140, 258, 'Manifestation'), (560, 258, 'Not chasing'), (350, 342, 'Nervous system work')]
def tpill(x, y, t):
    w = 236
    return (f'<g transform="translate({x} {y})"><rect x="{-w/2:.0f}" y="-21" width="{w}" height="42" rx="21" fill="#fff" stroke="#e2d4f4" stroke-width="3"/>'
            f'<text x="0" y="7" text-anchor="middle" font-size="19" font-weight="700" fill="var(--purple)">{t}</text></g>')
S.append(slide(0, 'And You&rsquo;ve Done The Work', 'You&rsquo;ve Tried <em>Everything</em>',
  '<div class="ex"><div class="scene"><svg viewBox="0 0 700 390" role="img" aria-label="A stick figure surrounded by everything they have tried">'
  + '<line x1="0" y1="372" x2="700" y2="372" stroke="#d9c7f0" stroke-width="4"/>'
  + scribble(350, 40, 58, 22, 22) + fig(350, 104, mouth='frown', arms='head', s=.82)
  + ''.join(f'<g class="bob" style="animation-delay:{-i*0.6:.1f}s">{tpill(x, y, t)}</g>' for i, (x, y, t) in enumerate(topics))
  + '</svg></div>'
  + note(text='It&rsquo;s helped you grow in so many areas. But none of it has changed <b class="p">how you feel about love.</b>', label='The Truth')
  + '</div>'))

# 5 The crack (argument + the best client's own words about her friends)
S.append(slide(0, 'The Proof', 'Your Friends <em>Didn&rsquo;t Need Any Of This</em>',
  '<div class="scene"><svg viewBox="0 0 1200 390" role="img" aria-label="Two happy couples, and between them the things they never needed, crossed out">'
  + '<line x1="40" y1="372" x2="1160" y2="372" stroke="#d9c7f0" stroke-width="4"/>'
  + couple(230) + ''.join(strikepill(600, y, t) for y, t in [(110, 'Attachment styles'), (175, 'Healing every wound'), (240, 'Red flags'), (305, 'Dating rules')]) + couple(970)
  + '</svg></div>',
  sub='Your friends and family haven&rsquo;t done half the work you have. Yet they met their person and built a life together.'))

# 5b The reveal: it's belief
S.append(slide(0, 'So What&rsquo;s Really Going On?', 'It&rsquo;s Not What You Know. <em>It&rsquo;s What You Believe.</em>',
  '<div class="ex"><div class="scene"><svg viewBox="0 0 700 390" role="img" aria-label="The stick figure sitting on a pile of books with a question mark: they know it all, but do not believe it">'
  + '<line x1="0" y1="356" x2="700" y2="356" stroke="#d9c7f0" stroke-width="4"/>' + g['stack'] + g['sitting']
  + '<g class="bob"><circle cx="510" cy="80" r="46" fill="#fff" stroke="#e2d4f4" stroke-width="4"/><circle cx="452" cy="130" r="9" fill="#fff" stroke="#e2d4f4" stroke-width="3"/><circle cx="426" cy="148" r="5" fill="#fff" stroke="#e2d4f4" stroke-width="3"/><text x="510" y="100" text-anchor="middle" font-size="58" font-weight="800" fill="var(--red)">?</text></g>'
  + '</svg></div>'
  + note(text='You know exactly what you want. <b class="p">But part of you still doesn&rsquo;t believe it can happen.</b>', label='The Real Problem')
  + '</div>'))


# 4 Why it hasn't worked (argument: real cause, how it shows up, intellectualization)
S.append(slide(0, 'You&rsquo;re Stuck In Your Head', 'That&rsquo;s Why Learning <em>Hasn&rsquo;t Helped</em>',
  stuckloop(),
  sub='Psychiatrists call it intellectualization. Here, it means trying to think or learn your way out of the lack of belief. But learning more doesn&rsquo;t make you truly believe it can happen, so the loop keeps going.'))

# 6b Why belief matters
S.append(slide(0, 'Why Belief Matters', 'Your Belief Shapes <em>What Happens</em>',
  '<div class="scene">' + beliefloop() + '</div>',
  sub='What you believe decides what you notice, what you think and what you do. And that shapes the people you meet and the relationships you end up in.'))


# 7 How the negative belief got built (argument bleeding neck + Feeling Finder top emotions: hopelessness, impatience, worry)
S.append(g['beliefeq']('red', 'How It Happened', 'Where You <em>Lost Your Belief</em>',
  ('&ldquo;I never seem to meet', 'the right person&rdquo;'), ('Worry and', 'hopelessness'), ('&ldquo;I&rsquo;m someone who', 'can&rsquo;t find love&rdquo;'), g['cross_icon'],
  'It started as a thought. You felt the worry of it, again and again. And the longer you stayed single, the stronger this belief got, until it became who you think you are.'))

# 8b Acting from doubt (argument: braced for it, too much / not enough, people who keep you guessing; best client: fear of being hurt again)
S.append(slide(0, 'What It Looks Like', 'When You Act From <em>The Negative Belief</em>',
  '<div class="ex"><div class="scene">' + date_scene('doubt') + '</div>'
  + note(['You go into every date braced for it to go wrong',
          'You wonder: &ldquo;Am I too much? Am I not enough?&rdquo;',
          'You hold back so you don&rsquo;t get hurt again',
          'You&rsquo;re drawn to people who keep you guessing'], label='On The Date')
  + '</div>',
  sub='Same you, same date. But &ldquo;I&rsquo;m someone who can&rsquo;t find love&rdquo; decides how you show up.'))

# 7b How to reverse it (Feeling Finder: safety is the most wanted feeling)
S.append(g['beliefeq']('green', 'Change The Thought And The Feeling', 'How To <em>Reverse It</em>',
  ('&ldquo;I&rsquo;m with', 'my person&rdquo;'), ('Safe and', 'at peace'), ('&ldquo;I&rsquo;m someone who', 'finds love&rdquo;'), belief_icon,
  'Change the thought and the feeling, repeat it, and you build a new belief.'))

# 8c Acting from belief (argument: what to expect; best client: fully vulnerable and fully myself)
S.append(slide(0, 'What It Looks Like', 'When You Act From <em>The Positive Belief</em>',
  '<div class="ex"><div class="scene">' + date_scene('belief') + '</div>'
  + note(['You show up relaxed and fully yourself',
          'You feel safe being open and vulnerable',
          'You notice the people who are consistent and available',
          'You lose interest in the ones who keep you guessing'], label='On The Date')
  + '</div>',
  sub='Same you, same date. Now &ldquo;I&rsquo;m someone who finds love&rdquo; decides how you show up.'))

# 10 What to expect (argument point 12)
S.append(slide(0, 'What To Expect', 'Then Things Start <em>To Unfold Naturally</em>',
  '<div class="scene"><svg viewBox="0 0 1200 390" role="img" aria-label="A calm stick figure; from them come being relaxed and yourself, noticing the right people, losing interest in time wasters; the right person walks in">'
  + '<defs><radialGradient id="chGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f472b6" stop-opacity=".42"/><stop offset=".6" stop-color="#f472b6" stop-opacity=".18"/><stop offset="1" stop-color="#f472b6" stop-opacity="0"/></radialGradient></defs>'
  + '<line x1="40" y1="372" x2="1160" y2="372" stroke="#d9c7f0" stroke-width="4"/>'
  + '<ellipse class="glowpulse" cx="230" cy="210" rx="170" ry="170" fill="url(#chGlow)"/>'
  + fig(230, 128, mouth='smile', s=.9) + heart(230, 200, 1.1)
  + '<path class="flowdash" d="M360 200 H420" fill="none" stroke="var(--violet)" stroke-width="5" stroke-linecap="round"/>'
  + okpill(600, 110, 'Relaxed and yourself') + okpill(600, 195, 'You notice the right people') + okpill(600, 280, 'Time wasters lose appeal')
  + '<path class="flowdash" d="M790 200 H850" fill="none" stroke="var(--violet)" stroke-width="5" stroke-linecap="round"/>'
  + '<g class="walkin2">' + fig(980, 128, mouth='smile', s=.9) + '</g>'
  + floathearts([(905, 120, .8, 0), (1060, 100, .9, -1.6), (1000, 60, .7, -2.9)])
  + '<text x="980" y="364" text-anchor="middle" font-size="20" font-weight="700" fill="var(--purple)">The right people start showing up</text>'
  + '</svg></div>',
  sub='You show up relaxed and fully yourself, without faking it or thinking about how to act. And dating feels fun again, not a chore.'))

# 11 Ideology close
S.append(slide(0, 'Feel It First', 'Nothing To Fix. <em>Nothing More To Learn.</em>',
  '<div class="scene"><svg viewBox="0 0 1200 390" role="img" aria-label="Two stick figures walk towards each other, meet in the middle and hold hands, with a heart appearing above them">'
  + '<line x1="40" y1="372" x2="1160" y2="372" stroke="#d9c7f0" stroke-width="4"/>'
  + '<defs><radialGradient id="mtGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f472b6" stop-opacity=".45"/><stop offset=".6" stop-color="#f472b6" stop-opacity=".2"/><stop offset="1" stop-color="#f472b6" stop-opacity="0"/></radialGradient></defs>'
  + '<g class="meetglow"><ellipse cx="600" cy="205" rx="250" ry="185" fill="url(#mtGlow)"/></g>'
  + '<g class="meetL">' + fig(530, 128, mouth='smile', s=.9) + '</g>'
  + '<g class="meetR">' + fig(670, 128, mouth='smile', s=.9) + '</g>'
  + '<g class="handjoin"><path class="fig" d="M586 276 L614 276"/><circle cx="600" cy="276" r="9" fill="var(--ink)"/></g>'
  + '<g class="popheart"><g transform="translate(600 40) scale(2)"><path d="' + HEART + '" fill="#ec4899"/></g></g>'
  + floathearts([(440, 120, .8, 0), (760, 120, .7, -1.6), (420, 240, .7, -2.9), (785, 250, .8, -.9)])
  + '</svg></div>',
  sub='You simply believe it can happen, so it does. Just like it&rsquo;s happened for your friends and family.'))


# 8 The thing (Emotional Resonance bracket, reused from the long version)
S.append(slide(0, 'How You Build The Belief', 'Meet <em>Emotional Resonance</em>', g['erbody'].replace("ercard(1060, belief_icon, 'The Belief', '&ldquo;It&rsquo;s going', 'to happen&rdquo;', end=True)", '') if False else g['erbody'].replace('&ldquo;It&rsquo;s going', '&ldquo;I&rsquo;m someone').replace('to happen&rdquo;', 'who finds love&rdquo;'),
  sub='Emotional Resonance is a daily practice that helps you build the belief you need to meet your person, by choosing to consciously think and feel as if you&rsquo;re already in your perfect relationship.'))


page = g['page']
head, rest = page.split('<div class="stage" id="stage">', 1)
tail = rest[rest.index('</div>\n<button class="fsbtn"'):]
html = head.replace('<title>Intellectualization Trap Explainer</title>', '<title>Meet Your Person Explainer</title>') + '<div class="stage" id="stage">\n' + ''.join(S) + tail
c = [0]
def _dn(m):
    c[0] += 1; return 'class="slide" data-n="%d"' % c[0]
html = re.sub(r'class="slide" data-n="\d+"', _dn, html)
html = html.replace('</style>', '.ex-rows:has(> div:nth-child(5)) { gap:8px; } .ex-rows:has(> div:nth-child(5)) div { font-size:20px; line-height:1.25; } .ex-rows:has(> div:nth-child(5)) i { width:36px; height:36px; font-size:16px; } </style>', 1)
# carousel controls: on-screen prev/next arrows, swipe on phones, dots
CAROUSEL = """
<style>
.navbtn { position:fixed; top:50%; transform:translateY(-50%); z-index:11; width:52px; height:52px; border-radius:50%; border:0; background:rgba(255,255,255,.92); color:#1d1527; font:700 26px var(--body); cursor:pointer; box-shadow:0 2px 12px rgba(0,0,0,.25); transition:opacity .4s; display:grid; place-items:center; }
.navbtn.prev { left:14px; } .navbtn.next { right:14px; }
.navbtn:disabled { opacity:.25; cursor:default; }
.dots { position:fixed; left:50%; bottom:20px; transform:translateX(-50%); z-index:11; display:flex; gap:8px; transition:opacity .4s; }
.dots span { width:9px; height:9px; border-radius:50%; background:rgba(255,255,255,.35); cursor:pointer; }
.dots span.on { background:#fff; }
body.idle .navbtn, body.idle .dots, :fullscreen .navbtn { opacity:0; pointer-events:none; }
@media (max-width:700px) { .navbtn { width:40px; height:40px; font-size:20px; } .dots { top:18px; bottom:auto; } }
</style>
<button class="navbtn prev" id="prevb" type="button" aria-label="Previous slide">&#8249;</button>
<button class="navbtn next" id="nextb" type="button" aria-label="Next slide">&#8250;</button>
<div class="dots" id="dots"></div>
<script>
(function(){
  var slides=[].slice.call(document.querySelectorAll('.slide')), dots=document.getElementById('dots');
  function cur(){ for(var k=0;k<slides.length;k++){ if(slides[k].classList.contains('on')) return k; } return 0; }
  function key(k){ window.dispatchEvent(new KeyboardEvent('keydown',{key:k})); }
  slides.forEach(function(_,k){ var d=document.createElement('span'); d.addEventListener('click',function(e){ e.stopPropagation(); var c=cur(); var step=k>c?'ArrowRight':'ArrowLeft'; for(var n=0;n<Math.abs(k-c);n++) key(step); sync(); }); dots.appendChild(d); });
  function sync(){ var c=cur(); [].forEach.call(dots.children,function(d,k){ d.classList.toggle('on',k===c); }); document.getElementById('prevb').disabled=c===0; document.getElementById('nextb').disabled=c===slides.length-1; }
  document.getElementById('prevb').addEventListener('click',function(e){ e.stopPropagation(); key('ArrowLeft'); sync(); });
  document.getElementById('nextb').addEventListener('click',function(e){ e.stopPropagation(); key('ArrowRight'); sync(); });
  addEventListener('keydown',function(){ setTimeout(sync,0); });
  document.getElementById('stage').addEventListener('click',function(){ setTimeout(sync,0); });
  var x0=null; addEventListener('touchstart',function(e){ x0=e.touches[0].clientX; },{passive:true});
  addEventListener('touchend',function(e){ if(x0===null) return; var dx=e.changedTouches[0].clientX-x0; x0=null; if(Math.abs(dx)>40){ key(dx<0?'ArrowRight':'ArrowLeft'); sync(); } },{passive:true});
  sync();
})();
</script>
"""
html = html.replace('</body>', CAROUSEL + '</body>', 1)
html = html.replace('</style>', '.meetL { animation:meetL 7s ease-in-out infinite; } .meetR { animation:meetR 7s ease-in-out infinite; } @keyframes meetL { 0% { transform:translateX(-330px); } 45%,100% { transform:translateX(0); } } @keyframes meetR { 0% { transform:translateX(330px); } 45%,100% { transform:translateX(0); } } .handjoin, .meetglow { animation:handjoin 7s ease-out infinite; opacity:0; } @keyframes handjoin { 0%,44% { opacity:0; } 52%,96% { opacity:1; } 100% { opacity:0; } } </style>', 1)
FILL = """
/* no webcam: header sizes to its content and the board fills the rest of the slide */
.slide.on, body.all .slide { display:flex !important; flex-direction:column; padding:46px 44px 40px; }
.slide .head { position:static !important; width:auto !important; height:auto !important; display:block; }
.slide .board { position:static !important; width:auto !important; height:auto !important; flex:1 1 auto; min-height:0; margin-top:26px; display:flex; }
.slide .board > * { flex:1 1 auto; min-width:0; height:auto !important; }
.slide h1 { font-size:62px !important; line-height:1.06 !important; }
.slide .eyebrow { font-size:19px; }
.head .sub { font-size:27px !important; line-height:1.38 !important; margin-top:12px !important; max-width:1150px; }
.ex { grid-template-columns:1.12fr 1fr !important; }
.ex .scene svg, .board > .scene svg { width:100%; height:100%; }
.note { padding:34px 40px !important; }
.note p { font-size:30px !important; line-height:1.4 !important; }
.note small { font-size:18px !important; }
.ex-rows div { font-size:25px !important; line-height:1.3 !important; }
.ex-rows i { width:44px !important; height:44px !important; font-size:19px !important; }
.ex-rows { gap:16px !important; }
.shift .statement p { font-size:56px !important; }
.compare { height:100%; }
"""
html = html.replace('</style>', FILL + '</style>', 1)
pathlib.Path('training/meet-your-person-simple.html').write_text(html, encoding='utf-8')
print(c[0], 'slides')
