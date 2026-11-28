"""Builds the two bonus trainings (Olly, 2026-11-27), same Google Vids frame as The Emotional Resonance Method:
  training/talk-to-the-heart.html   (mind and heart coherence: talk to your heart in the present tense)
  training/embody-your-symbol.html  (keep your R in the centre of your chest and let it melt in, eyes open or closed)
Exercise wording = Olly's words (2026-11-27). Frame/CSS/JS come from the-emotional-resonance-method.html (build that first).
Run: python training/build_bonus_trainings.py"""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, 'the-emotional-resonance-method.html'), encoding='utf-8').read()
head = src[:src.index('<div class="stage" id="stage">')]
tail = src[src.index('<button class="fsbtn"'):]
head = head.replace('</style>', '''
/* bonus trainings (2026-11-27) */
.settle { transform-box:fill-box; transform-origin:center; animation:breathe 4.5s ease-in-out infinite; }
.spread { transform-box:fill-box; transform-origin:center; animation:flow 4.5s ease-out infinite; }
.spread.d2 { animation-delay:1.5s; } .spread.d3 { animation-delay:3s; }
.melt { animation:melt 5s ease-in-out infinite; }
@keyframes melt { 0%,100% { opacity:1; } 55% { opacity:.3; } }
.days.d3 { grid-template-columns:repeat(3,1fr); grid-template-rows:1fr; }
.days.d3 span { font-size:23px; padding:12px 18px; }
.says { display:flex; flex-direction:column; gap:16px; justify-content:center; height:100%; border-radius:22px; background:var(--tint); padding:0 50px; }
.says div { font-family:var(--display); font-weight:700; font-size:30px; line-height:1.25; color:var(--ink); padding-left:28px; border-left:5px solid var(--violet); }
</style>''', 1)

# the R symbol from the worksheet (same as Part 2 of the method)
_fer = open(os.path.join(HERE, 'find-your-emotional-resonance.html'), encoding='utf-8').read()
_i = _fer.index('<div class="ws-circle-wrap">')
SYMBOL = _fer[_fer.index('<svg', _i):_fer.index('</svg>', _i) + 6]
SYMBOL = (SYMBOL.replace('stroke="#000"', 'stroke="#6b21a8"').replace('stroke="rgba(0,0,0,.35)"', 'stroke="#c4a8e8"')
          .replace('font-family="EB Garamond"', 'font-family="Playfair Display, Georgia, serif"').replace('fill="#000"', 'fill="#6b21a8"'))
assert SYMBOL.startswith('<svg viewBox="0 0 200 200"')


def sym(x, y, size, cls=''):
    """the R symbol drawn inside a scene, centred on x,y"""
    svg = SYMBOL.replace('<svg viewBox="0 0 200 200"', '<svg x="%d" y="%d" width="%d" height="%d" viewBox="0 0 200 200"'
                         % (x - size / 2, y - size / 2, size, size), 1)
    disc = '<circle cx="%d" cy="%d" r="%d" fill="#fff"/>' % (x, y, size * .4)   # keeps the body line from running through the R
    return '<g%s>%s%s</g>' % (' class="%s"' % cls if cls else '', disc, svg)


def slide(eyebrow, title, sub, board, note=''):
    s = '  <!-- %s -->\n  <section class="slide">\n    <div class="cam">Webcam</div>\n    <div class="head">\n' % (note or re.sub('<[^>]+>', '', title))
    s += '      <div class="eyebrow">%s</div>\n      <h1>%s</h1>\n' % (eyebrow, title)
    if sub: s += '      <p class="sub">%s</p>\n' % sub
    return s + '    </div>\n    <div class="board">%s</div>\n  </section>\n' % board


def statement(p, small=''):
    return '<div class="statement"><p>%s</p>%s</div>' % (p, '<small>%s</small>' % small if small else '')


def rows(items, cls='rows'):
    return '<div class="%s">%s</div>' % (cls, ''.join('<div><i>%d</i><span>%s</span></div>' % (i + 1, t) for i, t in enumerate(items)))


def exercise(svg_body, label, how_items, extra=''):
    return ('<div class="ex"><div class="scene"><svg viewBox="0 0 700 390" role="img" aria-label="%s">'
            '<line x1="0" y1="352" x2="700" y2="352" stroke="#d9c7f0" stroke-width="4"/>%s</svg></div>'
            '<div class="note"><small>How</small>%s%s</div></div>') % (label, svg_body, rows(how_items, 'rows ex-rows'), extra)


def compare(prob, sol):
    def side(cls, pill, strong, text, wave):
        return '<div class="side %s"><span class="pill">%s</span><strong>%s</strong><span>%s</span><span class="wave">%s</span></div>' % (cls, pill, strong, text, wave)
    return '<div class="compare">%s%s</div>' % (side('prob', *prob), side('sol', *sol))


# ---------- the stick figure, front view (700x390 scene, ground y=352) ----------
HEART = 'M0 -6 c0-11-17-15-17-3c0 9 17 18 17 22c0-4 17-13 17-22c0-12-17-8-17 3z'


def heart_glow(x, y, big=False):
    r = 40 if big else 30
    return ('<circle cx="%d" cy="%d" r="%d" fill="var(--violet)" opacity=".28" class="wallglow"/>'
            '<circle class="ripple" cx="%d" cy="%d" r="%d" fill="none" stroke="var(--violet)" stroke-width="3"/>'
            '<path d="%s" transform="translate(%d %d)" fill="#ec4899"/>') % (x, y, r, x, y, r, HEART, x, y)


def figure(cx, eyes='closed', hand=None, chest=''):
    """chest = what sits over the centre of the chest (heart glow / symbol), drawn under the hand"""
    s = '<circle class="fig" cx="%d" cy="88" r="34" fill="var(--tint)"/>' % cx
    if eyes == 'closed':
        s += '<path d="M%d 86 q7 6 14 0 M%d 86 q7 6 14 0" fill="none" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/>' % (cx - 21, cx + 7)
    else:
        s += '<circle cx="%d" cy="84" r="4.5" fill="var(--ink)"/><circle cx="%d" cy="84" r="4.5" fill="var(--ink)"/>' % (cx - 12, cx + 12)
    s += '<path d="M%d 103 q10 7 20 0" fill="none" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/>' % (cx - 10)
    s += '<path class="fig" d="M%d 122 V250 M%d 165 Q%d 150 %d 165 M%d 250 L%d 348 M%d 250 L%d 348 M%d 165 L%d 268"/>' % (
        cx, cx - 57, cx, cx + 57, cx, cx - 30, cx, cx + 30, cx - 57, cx - 70)
    s += chest
    if hand == 'hand':
        s += '<path class="fig" d="M%d 165 L%d 234 L%d 196"/><ellipse cx="%d" cy="192" rx="17" ry="13" fill="var(--ink)"/>' % (cx + 57, cx + 76, cx + 16, cx + 6)
    elif hand == 'fingers':
        s += ('<path class="fig" d="M%d 165 L%d 234 L%d 198"/><circle cx="%d" cy="198" r="8" fill="var(--ink)"/>'
              '<path d="M%d 196 L%d 186 M%d 200 L%d 194" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/>') % (
            cx + 57, cx + 76, cx + 22, cx + 22, cx + 20, cx + 2, cx + 20, cx + 2)
    else:
        s += '<path class="fig" d="M%d 165 L%d 268"/>' % (cx + 57, cx + 70)
    return s


def label(x, text):
    return '<text x="%d" y="380" text-anchor="middle" font-size="24" font-weight="700" fill="var(--purple)">%s</text>' % (x, text)


def bubble(x, y, w, text):
    return ('<rect x="%d" y="%d" width="%d" height="56" rx="28" fill="#fff" stroke="var(--violet)" stroke-width="3"/>'
            '<text x="%d" y="%d" text-anchor="middle" font-size="21" font-weight="600" fill="var(--ink)">%s</text>') % (
        x, y, w, x + w / 2, y + 36, text)


def write(fname, title, S):
    body = '<div class="stage" id="stage">\n\n' + '\n'.join(S) + '\n</div>\n'
    page = head.replace('<title>The Emotional Resonance Method</title>', '<title>%s</title>' % title) + body + tail
    n = [0]
    def num(m):
        n[0] += 1; return '<section class="slide" data-n="%d">' % n[0]
    page = re.sub(r'<section class="slide"(?: data-n="\d+")?>', num, page)
    open(os.path.join(HERE, fname), 'w', encoding='utf-8').write(page)
    print('%s: %d slides' % (fname, n[0]))


# ======================= TALK TO THE HEART =======================
T = []
T.append(slide('Bonus Training', 'Talk To <em>The Heart</em>', 'Get your mind and your heart to agree on what you want.',
               statement('A simple practice to <em>connect with yourself.</em>',
                         'You&rsquo;ll imprint your subconscious with what you want, so your mind and heart are aligned.'), 'Cover'))
T.append(slide('What It Is', 'Mind And Heart <em>Coherence</em>', '',
               statement('Your mind and your heart <em>agree on what you want.</em>',
                         'When they&rsquo;re aligned about what you want to change or create, it starts to feel real and normal to you.')))
T.append(slide('Why It Matters', 'When They <em>Don&rsquo;t Agree</em>', '',
               compare(('Intellectualization', 'Only In Your Head', 'Your mind knows what you want, but your heart still feels doubt, worry or fear. The two pull against each other.', 'Mind and heart split'),
                       ('Coherence', 'Mind And Heart Aligned', 'Your heart feels what your mind wants as if you already have it. You show up like it&rsquo;s already yours.', 'Mind and heart as one'))))
T.append(slide('Exercise · Step 1', 'Close Your Eyes And <em>Find Your Heart</em>', '',
               exercise(figure(350, chest=heart_glow(350, 190)) +
                        '<line class="sight" x1="350" y1="128" x2="350" y2="160"/>',
                        'A stick figure with eyes closed, attention on a glowing heart in the centre of the chest',
                        ['Close your eyes', 'Bring your attention to your heart'])))
T.append(slide('Exercise · Step 2', 'Place Your Hand <em>Over Your Heart</em>', '',
               exercise(figure(190, hand='hand', chest=heart_glow(190, 190)) + label(190, 'Your hand') +
                        figure(500, hand='fingers', chest=heart_glow(500, 190)) + label(500, 'Or two fingers'),
                        'Two stick figures, one with a hand over the heart, one with two fingers over the heart',
                        ['Place your hand or two fingers over your heart', 'Keep your attention there'])))
T.append(slide('Exercise · Step 3', 'Talk To <em>Your Heart</em>', '',
               exercise(figure(150, hand='hand', chest=heart_glow(150, 190)) +
                        bubble(290, 62, 380, 'I have a partner who loves me') + bubble(290, 162, 380, 'We feel safe and relaxed together') +
                        bubble(290, 262, 380, 'We&rsquo;re building a family together') +
                        '<line class="sight" x1="286" y1="90" x2="190" y2="182"/><line class="sight" x1="286" y1="190" x2="194" y2="192"/>'
                        '<line class="sight" x1="286" y1="290" x2="190" y2="202"/>',
                        'A stick figure with a hand on the heart, speech bubbles of present tense intentions flowing into the heart',
                        ['Act like you&rsquo;re having a conversation with your heart', 'Talk to it in the present tense', 'State what you already have',
                         '<b class="p">Keep your attention on your heart as you do it</b>'])))
T.append(slide('Present Tense', 'Say It Like <em>You Already Have It</em>', '',
               compare(('Not Like This', '&ldquo;I Want&hellip;&rdquo;', '&ldquo;I want to meet someone who loves me.&rdquo; Your heart hears that you don&rsquo;t have it yet.', 'Still waiting'),
                       ('Like This', '&ldquo;I Have&hellip;&rdquo;', '&ldquo;I have a partner who loves me unconditionally.&rdquo; Your heart feels it as if it&rsquo;s real now.', 'Already yours'))))
T.append(slide('Examples', 'What You Might <em>Say</em>', 'Use your own intentions, in the present tense.',
               '<div class="says">%s</div>' % ''.join('<div>&ldquo;%s&rdquo;</div>' % t for t in [
                   'I have a partner who is emotionally available.',
                   'We share the same values and a future together.',
                   'I feel safe, relaxed and playful with them.',
                   'We&rsquo;re ready to marry and build a family together.'])))
T.append(slide('Exercise · Step 4', 'Let It <em>Settle In You</em>', '',
               exercise('<circle class="spread" cx="350" cy="190" r="40" fill="var(--violet)" opacity=".25"/>'
                        '<circle class="spread d2" cx="350" cy="190" r="40" fill="var(--violet)" opacity=".25"/>'
                        '<circle class="spread d3" cx="350" cy="190" r="40" fill="var(--violet)" opacity=".25"/>' +
                        figure(350, hand='hand', chest=heart_glow(350, 190, big=True)),
                        'A stick figure with a hand on the heart, a soft glow spreading out from the chest',
                        ['Allow what you said to settle in you', 'No need to breathe in or out in any special way',
                         '<b class="p">Just let it settle</b>'])))
T.append(slide('Exercise · Step 5', 'Carry On With <em>Your Day</em>', '',
               exercise('<line x1="40" y1="352" x2="660" y2="352" stroke="#c4a8e8" stroke-width="5" stroke-dasharray="26 16"/>'
                        '<circle cx="324" cy="178" r="26" fill="var(--violet)" opacity=".25" class="wallglow"/>'
                        '<path d="%s" transform="translate(324 178) scale(.8)" fill="#ec4899"/>' % HEART +
                        '<circle class="fig" cx="334" cy="88" r="32" fill="var(--tint)"/><circle cx="350" cy="84" r="4.5" fill="var(--ink)"/>'
                        '<path d="M342 102 q8 5 14 -1" fill="none" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/>'
                        '<path class="fig" d="M330 120 L318 244 M318 244 L280 346 M318 244 L364 340 M326 150 L284 206 M326 150 L372 200"/>',
                        'A stick figure walking on with eyes open, a small glowing heart in the chest',
                        ['Open your eyes', 'Carry on with your day'])))
T.append(slide('The Whole Exercise', 'It&rsquo;s <em>That Simple</em>', '',
               rows(['Close your eyes and bring your attention to your heart', 'Place your hand or two fingers over your heart',
                     'Talk to your heart in the present tense, stating what you already have', 'Allow it to settle in you',
                     'Carry on with your day'])))
# 'Message Me Any Time' close removed (Olly 2026-11-27)
write('talk-to-the-heart.html', 'Talk To The Heart', T)


# ======================= EMBODY YOUR SYMBOL =======================
def mini_fig(x, y0=0, cls='fig', r_sym=True):
    """small standing figure for the 240x150 day scenes, symbol on the chest"""
    s = ('<circle class="%s" cx="%d" cy="40" r="13" fill="#fff"/><path class="%s" d="M%d 53 V98 M%d 98 L%d 134 M%d 98 L%d 134 M%d 64 L%d 90 M%d 64 L%d 90"/>'
         % (cls, x, cls, x, x, x - 12, x, x + 12, x, x - 12, x, x + 12))
    if r_sym:
        s = '<circle cx="%d" cy="72" r="17" fill="var(--violet)" fill-opacity=".18" class="wallglow"/>' % x + s + sym(x, 72, 30)
    return s


SCENES = [
    ('At your desk at work',
     '<path class="furn" d="M54 52 V100 H92 M58 100 V134 M88 100 V134 M118 92 H212 M126 92 V134 M204 92 V134 M146 92 H182 L190 62"/>'
     '<circle cx="80" cy="70" r="17" fill="var(--violet)" fill-opacity=".18" class="wallglow"/>'
     '<circle class="fig" cx="80" cy="40" r="13" fill="#fff"/><path class="fig" d="M79 53 L77 98 L120 100 L124 134 M78 66 L106 84 L140 88"/>' + sym(80, 70, 30)),
    ('On the sofa at home',   # front-on: sat facing you (Olly 2026-11-27)
     '<line x1="10" y1="135" x2="230" y2="135" stroke="#d9c7f0" stroke-width="4"/>'
     '<rect class="furn" x="44" y="50" width="152" height="56" rx="12" style="fill:#efe6fa"/>'
     '<rect class="furn" x="26" y="78" width="28" height="50" rx="9" style="fill:#efe6fa"/><rect class="furn" x="186" y="78" width="28" height="50" rx="9" style="fill:#efe6fa"/>'
     '<rect class="furn" x="54" y="98" width="132" height="28" rx="7" style="fill:#fff"/><path class="furn" d="M60 128 V134 M180 128 V134"/>'
     '<circle class="fig" cx="120" cy="40" r="13" fill="#fff"/>'
     '<path class="fig" d="M120 53 V98 M120 64 L104 84 L106 104 M120 64 L136 84 L134 104 M114 98 L106 106 V134 M126 98 L134 106 V134"/>'
     '<circle cx="120" cy="72" r="17" fill="var(--violet)" fill-opacity=".18" class="wallglow"/>' + sym(120, 72, 30)),
    ('Out with friends',
     '<line x1="10" y1="135" x2="230" y2="135" stroke="#d9c7f0" stroke-width="4"/>' +
     mini_fig(48, cls='furn', r_sym=False) + mini_fig(192, cls='furn', r_sym=False) + mini_fig(120)),
]


def scenes():
    return '<div class="days d3">' + ''.join(
        '<div class="day"><svg viewBox="0 0 240 150" preserveAspectRatio="xMidYMid meet" role="img" aria-label="%s">%s</svg><span>%s</span></div>' % (t, svg, t)
        for t, svg in SCENES) + '</div>'


INT = ['An emotionally available partner', 'Unconditional love', 'Shared values and a future together', 'Feeling safe, relaxed and playful together', 'Ready to marry and build a family together']
EMO = ['Love', 'Joy', 'Gratitude', 'Excitement']


def sheet():
    def col(h, items, prompt='', circled=None):
        li = ''.join('<li%s>%s</li>' % (' class="pick"' if t == circled else '', t) for t in items)
        return '<div class="wcol"><b>%s</b>%s<ol>%s</ol></div>' % (h, '<p>%s</p>' % prompt if prompt else '', li)
    return ('<div class="paper"><div class="wgrid">%s<div class="sym">%s</div>%s</div></div>'
            % (col('Intention', INT), SYMBOL, col('Emotions', EMO, 'The emotions I would feel are&hellip;', 'Love')))


E = []
E.append(slide('Bonus Training', 'Embody <em>Your Symbol</em>', 'Keep your Emotional Resonance with you all day.',
               statement('Your symbol holds everything you want. <em>Now let it become part of you.</em>',
                         'A practice you can use anywhere, with your eyes open or closed.'), 'Cover'))
E.append(slide('Your Symbol', 'Remember <em>Your R?</em>', 'The symbol you made in Confirm Your Emotional Resonance.',
               '<div class="ex">%s<div class="note"><small>What It Holds</small>%s</div></div>' % (sheet(), rows(
                   ['Every one of your intentions', 'The emotions you want to feel', 'Your Emotional Resonance'], 'rows ex-rows'))))
E.append(slide('What It Does', 'Feel It <em>Without Trying</em>', '',
               statement('Recondition the feeling <em>without having to think about it.</em>',
                         'Your symbol carries all of your intentions, so you don&rsquo;t have to actively run through them one by one.')))
# ---- Embody Your Symbol exercise steps: a torso crop (mid-neck to just above the belly button), Olly 2026-11-27:
# "we need to see more of a human anatomy ... so they can see the centre of the chest". R sits on the breastbone.
SX, SY = 350, 168   # centre of the chest, on the breastbone


def _mirror(d):
    """mirror an absolute path (M/C/Q/L x y pairs) across x=350"""
    out, toks = [], d.split()
    for t in toks:
        if ',' in t:
            x, y = t.split(',')
            out.append('%g,%s' % (700 - float(x), y))
        else:
            out.append(t)
    return ' '.join(out)


# torso in a white crew-neck t-shirt (Olly 2026-11-27: "with a t-shirt on as well, rather than pure anatomy")
SHIRT = ('M 302,58 Q 350,98 398,58 Q 452,68 494,90 C 528,108 540,160 540,230 L 488,232 C 487,210 486,190 486,172 '
         'L 476,166 C 468,240 462,310 450,390 L 250,390 C 238,310 232,240 224,166 L 214,172 C 214,190 213,210 212,232 '
         'L 160,230 C 160,160 172,108 206,90 Q 248,68 302,58 Z')
_SKIN = ['M 322,0 C 322,30 318,48 302,58', 'M 160,230 L 156,390', 'M 212,232 L 206,390']   # neck, arms below the sleeves


def torso(chest, cls=''):
    s = '<path class="fig" style="fill:#fff" d="%s"/>' % SHIRT
    s += '<path class="furn" style="stroke-width:4" d="M 310,62 Q 350,90 390,62"/>'          # collar rib
    s += '<path class="furn" style="stroke-width:4" d="M 236,200 Q 246,230 244,262 M 464,200 Q 454,230 456,262"/>'   # soft folds
    s += ''.join('<path class="fig" d="%s"/><path class="fig" d="%s"/>' % (d, _mirror(d)) for d in _SKIN)
    return s + chest


def anatomy(svg_body, aria, how_items, extra=''):
    return ('<div class="ex"><div class="scene"><svg viewBox="0 0 700 390" role="img" aria-label="%s">%s</svg></div>'
            '<div class="note"><small>How</small>%s%s</div></div>') % (aria, svg_body, rows(how_items, 'rows ex-rows'), extra)


E.append(slide('Exercise · Step 1', 'Your Symbol In <em>The Centre Of Your Chest</em>', 'Eyes open or closed.',
               anatomy(torso('<circle cx="%d" cy="%d" r="56" fill="var(--violet)" fill-opacity=".18" class="wallglow"/>' % (SX, SY) + sym(SX, SY, 96)),
                       'A front view of the chest from the neck down, the R symbol on the breastbone in the centre of the chest',
                       ['Imagine your symbol, the letter R', 'Feel it right in the centre of your chest'])))
E.append(slide('Exercise · Step 2', 'Bring Your <em>Attention To It</em>', '',
               anatomy(torso('<circle cx="%d" cy="%d" r="58" fill="var(--violet)" fill-opacity=".18" class="wallglow"/>'
                             '<circle class="ripple" cx="%d" cy="%d" r="58" fill="none" stroke="var(--violet)" stroke-width="3"/>' % (SX, SY, SX, SY) + sym(SX, SY, 100)),
                       'The chest from the front, attention resting on the R symbol on the breastbone',
                       ['Bring your attention to your symbol', 'Keep it there'])))
E.append(slide('Exercise · Step 3', 'Let It <em>Melt Into You</em>', '',
               anatomy(torso(''.join('<circle class="spread%s" cx="%d" cy="%d" r="52" fill="var(--violet)" opacity=".25"/>' % (d, SX, SY) for d in ('', ' d2', ' d3')) +
                             sym(SX, SY, 100, 'melt')),
                       'The chest from the front, the R symbol on the breastbone softly melting into a glow that spreads through the chest',
                       ['Let your symbol melt into you', 'It brings back the feeling and all your intentions',
                        '<b class="p">No need to think about them</b>'])))
E.append(slide('Anywhere', 'Use It <em>Through Your Day</em>', 'Eyes open or closed. Keep your symbol in the centre of your chest.', scenes()))
E.append(slide('The Whole Exercise', 'It&rsquo;s <em>That Simple</em>', '',
               rows(['Imagine your symbol, the letter R, right in the centre of your chest', 'Bring your attention to it and keep it there',
                     'Let it melt into you', 'Do it anywhere, eyes open or closed'])))
# 'Message Me Any Time' close removed (Olly 2026-11-27)
write('embody-your-symbol.html', 'Embody Your Symbol', E)
