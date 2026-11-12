import re, random, math, pathlib
src = pathlib.Path('training/how-to-control-your-mental-attention.html').read_text(encoding='utf-8')
head_css = re.search(r'<style>(.*?)</style>', src, re.S).group(1)
script = re.search(r'<script>\n\(function\(\)\{.*?</script>', src, re.S).group(0)
HEART = "M0 4 C-2 -4 -14 -4 -14 6 C-14 14 -4 18 0 24 C4 18 14 14 14 6 C14 -4 2 -4 0 4Z"
random.seed(3)

def fig(cx, hy, eyes='open', mouth='flat', arms='down', s=1.0, fill='var(--tint)'):
    """Front-facing stick figure. hy = head centre y."""
    t = f'<g transform="translate({cx} {hy}) scale({s})">'
    t += '<circle class="fig" cx="0" cy="0" r="30" fill="%s"/>' % fill
    if eyes == 'open':
        t += '<circle cx="-11" cy="-4" r="4" fill="var(--ink)"/><circle cx="11" cy="-4" r="4" fill="var(--ink)"/>'
    else:
        t += '<path d="M-17 -4 Q-11 2 -5 -4 M5 -4 Q11 2 17 -4" fill="none" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round"/>'
    if mouth == 'smile':
        t += '<path d="M-9 11 Q0 18 9 11" fill="none" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round"/>'
    elif mouth == 'frown':
        t += '<path d="M-9 15 Q0 9 9 15" fill="none" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round"/>'
    else:
        t += '<path d="M-8 13 H8" fill="none" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round"/>'
    t += '<path class="fig" d="M0 30 V150 M-50 70 Q0 56 50 70 M0 150 L-30 235 M0 150 L30 235"/>'
    if arms == 'down':
        t += '<path class="fig" d="M-50 70 L-62 165 M50 70 L62 165"/>'
    elif arms == 'head':
        t += '<path class="fig" d="M-50 70 L-58 20 L-30 -18 M50 70 L58 20 L30 -18"/>'
    elif arms == 'heart':
        t += '<path class="fig" d="M-50 70 L-62 165 M50 70 L66 128 L10 100"/>'
    t += '</g>'
    return t

def scribble(cx, cy, rx=70, ry=34, n=26):
    # messy tangle: random walk of curves inside an ellipse
    x, y = cx, cy; pts = []
    for k in range(n * 2):
        a = random.uniform(0, 2 * math.pi); r = random.uniform(.5, 1)
        x, y = cx + rx * r * math.cos(a), cy + ry * r * math.sin(a)
        pts.append(f'{x:.0f},{y:.0f}')
    d = 'M' + pts[0] + ''.join(f' Q{pts[i]} {pts[i+1]}' for i in range(1, len(pts)-1, 2))
    return f'<path class="jitter" d="{d}" fill="none" stroke="var(--red)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>'

def heartglow(cx, cy, r=70, scale=1.4):
    return (f'<g opacity=".25"><circle class="glowpulse" cx="{cx}" cy="{cy}" r="{r}" fill="#f472b6"/></g>'
            f'<circle class="ripple" cx="{cx}" cy="{cy}" r="{r*.6:.0f}" fill="none" stroke="#ec4899" stroke-width="3"/>')

def heart(cx, cy, scale):
    return f'<g transform="translate({cx} {cy - 12*scale:.0f}) scale({scale})"><path class="heartpulse" d="{HEART}" fill="#ec4899"/></g>'

def floathearts(spots):
    return ''.join(f'<g transform="translate({x} {y}) scale({s})"><path class="floatup" style="animation-delay:{d}s" d="{HEART}" fill="#ec4899" opacity=".75"/></g>' for x, y, s, d in spots)

def slide(n, eyebrow, title, body, sub=''):
    sub_html = f'\n      <p class="sub">{sub}</p>' if sub else ''
    return f'''  <section class="slide" data-n="{n}">
    <div class="head">
      <div class="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>{sub_html}
    </div>
    <div class="board">{body}</div>
  </section>
'''

def note(rows=None, text=None, label='How'):
    inner = ''
    if text: inner += f'<p>{text}</p>'
    if rows: inner += '<div class="rows ex-rows">' + ''.join(f'<div><i>{i}</i><span>{r}</span></div>' for i, r in enumerate(rows, 1)) + '</div>'
    return f'<div class="note"><small>{label}</small>{inner}</div>'

arrow = '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M13 6l6 6-6 6"/></svg>'
S = []

# 1 Title
S.append(slide(1, 'Step-By-Step Guide', 'A Step-By-Step Guide To Meeting Someone You Can <em>Settle Down And Build Your Life With</em>',
  '<div class="scene"><svg viewBox="0 0 1200 390" role="img" aria-label="A calm stick figure with eyes closed and a glowing heart, standing holding hands with their partner, inside a soft pink glow with hearts floating up">'
  + '<line x1="40" y1="372" x2="1160" y2="372" stroke="#d9c7f0" stroke-width="4"/>'
  + '<defs><radialGradient id="s1glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f472b6" stop-opacity=".45"/><stop offset=".6" stop-color="#f472b6" stop-opacity=".2"/><stop offset="1" stop-color="#f472b6" stop-opacity="0"/></radialGradient></defs>'
  + '<ellipse class="glowpulse" cx="600" cy="205" rx="250" ry="185" fill="url(#s1glow)"/>'
  + fig(530, 128, eyes='closed', mouth='smile', s=.9) + fig(670, 128, mouth='smile', s=.9)
  + '<path class="fig" d="M586 276 L614 276"/><circle cx="600" cy="276" r="9" fill="var(--ink)"/>'
  + heart(530, 200, 1.1)
  + floathearts([(440, 110, .8, 0), (600, 70, .9, -1.7), (760, 120, .7, -3), (420, 240, .7, -2.2), (785, 250, .8, -.9)])
  + '</svg></div>',
  ))

# 2 Where you are / where you want to be (one big box each)
def mini(inner):
    return f'<svg class="mini" viewBox="0 0 480 255" aria-hidden="true">{inner}</svg>'
def solo(cls, pill_txt, title, text, pic):
    return (f'<div class="side {cls} solo"><div class="solotext">' + (f'<span class="pill">{pill_txt}</span>' if pill_txt else '') + (f'<strong>{title}</strong>' if title else '') + f'<span>{text}</span></div>'
            f'<svg class="solopic" viewBox="0 0 480 300" aria-hidden="true">{pic}</svg></div>')
S.append(slide(2, 'Your Starting Point', "Where You're At <em>Right Now</em>",
  solo('prob', '', '', 'Overthinking, worrying, doubting and believing you have to fix yourself before you can meet your person.',
       scribble(240, 50, 70, 28, 24) + fig(240, 118, mouth='frown', arms='head', s=.72))))
S.append(slide(0, "Where You're Going", 'Where You <em>Want To Be</em>',
  solo('sol', '', '', 'Feeling calm and truly believing you&rsquo;ll meet your person, so it actually happens.',
       heartglow(240, 172, r=70) + fig(240, 118, eyes='closed', mouth='smile', s=.72) + heart(240, 172, 1.1)
       + floathearts([(150, 120, .7, 0), (340, 100, .8, -1.6), (330, 230, .6, -2.8)]))))

# 3 Where it starts
def loopcard(x, y, n, title, l1, l2, end=False):
    bg, st, tc, nc, lc = ('var(--purple)', 'var(--purple)', '#fff', '#e3d2fb', '#f1e8fd') if end else ('var(--tint)', '#e2d4f4', 'var(--ink)', 'var(--purple)', 'var(--soft)')
    fs = 28 if len(title) > 14 else 32
    return (f'<g transform="translate({x} {y})"><rect x="-165" y="-62" width="330" height="124" rx="20" fill="{bg}" stroke="{st}" stroke-width="2.5"/>'
            f'<text x="-140" y="-30" font-size="15" font-weight="700" fill="{nc}">{n}</text>'
            f'<text x="-140" y="4" font-family="Playfair Display, Georgia, serif" font-weight="900" font-size="{fs}" fill="{tc}">{title}</text>'
            f'<text x="-140" y="30" font-size="17" fill="{lc}">{l1}</text><text x="-140" y="51" font-size="17" fill="{lc}">{l2}</text></g>')
loopsvg = ('<div class="scene"><svg viewBox="0 0 1200 390" role="img" aria-label="A loop that keeps going round: lack of belief leads to discomfort, discomfort leads to intellectualization, and intellectualization leads back to lack of belief">'
  + '<defs><marker id="lpA" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="var(--violet)"/></marker></defs>'
  + '<path class="loopdash" d="M772 80 C900 80 950 150 930 220" fill="none" stroke="var(--violet)" stroke-width="5" stroke-linecap="round" marker-end="url(#lpA)"/>'
  + '<path class="loopdash" d="M725 318 C640 350 560 350 475 318" fill="none" stroke="var(--violet)" stroke-width="5" stroke-linecap="round" marker-end="url(#lpA)"/>'
  + '<path class="loopdash" d="M270 220 C250 150 300 80 428 80" fill="none" stroke="var(--violet)" stroke-width="5" stroke-linecap="round" marker-end="url(#lpA)"/>'
  + loopcard(600, 72, '1', 'Lack Of Belief', 'We don\'t believe what we', 'want will happen')
  + loopcard(895, 300, '2', 'Discomfort', 'That lack of belief feels', 'uncomfortable')
  + loopcard(305, 300, '3', 'Intellectualization', 'The analytical mind kicks in', 'to try and fix it', end=True)
  + fig(600, 205, mouth='frown', arms='head', s=.38)
  + '<text x="600" y="320" text-anchor="middle" font-size="14" font-weight="700" letter-spacing="2" fill="var(--purple)">ROUND AND ROUND</text>'
  + '</svg></div>')
S.append(slide(3, 'Where It Starts', 'The Problem: <em>Intellectualization</em>',
  loopsvg,
  sub="<span style='display:block;font-size:21px;line-height:1.4'>Intellectualization is a term psychiatrists use for trying to think our way out of an uncomfortable feeling. When we haven&rsquo;t found a quality relationship for a while, we start to doubt it will ever happen for us. That doubt feels uncomfortable, so we decide something must be wrong with us. Our analytical mind then goes into overdrive, trying to &lsquo;fix&rsquo; it.</span>"))

# 4 Learning our way out
def book(x, y, c): return f'<g transform="translate({x} {y})"><rect x="-24" y="-30" width="48" height="60" rx="5" fill="{c}"/><rect x="-24" y="-30" width="9" height="60" rx="3" fill="#1d1527" opacity=".25"/></g>'
def phones(x, y): return f'<g transform="translate({x} {y})" fill="none" stroke="#7c3aed" stroke-width="6" stroke-linecap="round"><path d="M-24 6 A24 24 0 0 1 24 6"/><rect x="-30" y="4" width="12" height="22" rx="4" fill="#7c3aed"/><rect x="18" y="4" width="12" height="22" rx="4" fill="#7c3aed"/></g>'
def pdf(x, y): return f'<g transform="translate({x} {y})"><path d="M-22 -30 H10 L22 -18 V30 H-22 Z" fill="#fff" stroke="#b42318" stroke-width="4" stroke-linejoin="round"/><path d="M-12 -6 H12 M-12 4 H12 M-12 14 H4" stroke="#e8907e" stroke-width="4" stroke-linecap="round"/></g>'
def mail(x, y): return f'<g transform="translate({x} {y})"><rect x="-28" y="-20" width="56" height="40" rx="5" fill="#fff" stroke="#6b21a8" stroke-width="4"/><path d="M-26 -17 L0 4 L26 -17" fill="none" stroke="#6b21a8" stroke-width="4" stroke-linejoin="round"/></g>'
def medit(x, y): return f'<g transform="translate({x} {y})"><circle r="26" fill="#ede4fb"/><path d="M-8 -12 L12 0 L-8 12 Z" fill="#7c3aed"/></g>'
def pill(x, y, t, c='var(--purple)', bg='#fff', line='#e2d4f4', fs=19):
    w = len(t) * fs * .56 + 34
    return (f'<g transform="translate({x} {y})"><rect x="{-w/2:.0f}" y="-20" width="{w:.0f}" height="40" rx="20" fill="{bg}" stroke="{line}" stroke-width="3"/>'
            f'<text x="0" y="7" text-anchor="middle" font-size="{fs}" font-weight="700" fill="{c}">{t}</text></g>')
topics = [(130, 70, 'Attachment styles'), (575, 70, 'Boundaries'), (110, 165, 'Red flags'), (590, 165, 'Inner child work'),
          (125, 265, 'Avoidant partners'), (585, 265, 'Manifestation'), (350, 335, 'Dating rules')]
items = [book(130, 110, '#c4a8ef'), phones(560, 80), pdf(150, 290), mail(560, 290), medit(600, 190), book(100, 200, '#f3c1bd')]
bob = ''.join(f'<g class="bob" style="animation-delay:{-i*0.7:.1f}s">{it}</g>' for i, it in enumerate(items))
S.append(slide(4, 'So We Try To Learn Our Way Out', 'We Try And <em>&lsquo;Fix&rsquo; What&rsquo;s Wrong With Us</em>',
  '<div class="ex"><div class="scene"><svg viewBox="0 0 700 390" role="img" aria-label="A stressed stick figure surrounded by floating topics: attachment styles, boundaries, red flags, inner child work, avoidant partners, manifestation, dating rules">'
  + '<line x1="0" y1="372" x2="700" y2="372" stroke="#d9c7f0" stroke-width="4"/>'
  + scribble(350, 40, 58, 22, 22) + fig(350, 104, mouth='frown', arms='head', s=.82) + ''.join(f'<g class="bob" style="animation-delay:{-i*0.6:.1f}s">{pill(x, y, t)}</g>' for i, (x, y, t) in enumerate(topics))
  + '</svg></div>' + note(['Reading the books', 'Taking the courses', 'Listening to the podcasts', 'Doing the meditations', 'Downloading the PDFs', 'Joining all of the newsletters', 'Watching social media content'], label='We Try:') + '</div>'))

# 5 Still don't believe it
stack = ''.join(f'<rect x="{270+o}" y="{y}" width="{160-2*o}" height="26" rx="5" fill="{c}"/>' for o, y, c in [(0, 330, '#c4a8ef'), (8, 304, '#f3c1bd'), (2, 278, '#ede4fb'), (12, 252, '#c4a8ef')])
sitting = ('<g transform="translate(350 128) scale(.8)"><circle class="fig" cx="0" cy="0" r="30" fill="var(--tint)"/>'
           '<circle cx="-11" cy="-4" r="4" fill="var(--ink)"/><circle cx="11" cy="-4" r="4" fill="var(--ink)"/>'
           '<path d="M-9 15 Q0 9 9 15" fill="none" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round"/>'
           '<path class="fig" d="M0 30 V150 M-50 70 Q0 56 50 70 M-50 70 L-60 150 M50 70 L60 150 M0 150 L-34 160 L-38 222 M0 150 L34 160 L38 222"/></g>')
S.append(slide(5, 'But Even After All That', "We Still Don't Believe <em>It Can Happen For Us</em>",
  '<div class="ex"><div class="scene"><svg viewBox="0 0 700 390" role="img" aria-label="The stick figure sitting on a pile of books, a question mark in a thought bubble">'
  + '<line x1="0" y1="356" x2="700" y2="356" stroke="#d9c7f0" stroke-width="4"/>' + stack + sitting
  + '<g class="bob"><circle cx="510" cy="80" r="46" fill="#fff" stroke="#e2d4f4" stroke-width="4"/><circle cx="452" cy="130" r="9" fill="#fff" stroke="#e2d4f4" stroke-width="3"/><circle cx="426" cy="148" r="5" fill="#fff" stroke="#e2d4f4" stroke-width="3"/><text x="510" y="100" text-anchor="middle" font-size="58" font-weight="800" fill="var(--red)">?</text></g>'
  + '</svg></div>' + note(text='Even after all our learning and the work we\'ve done on ourselves, we still don\'t really believe this can happen for us.', label='The Truth') + '</div>'))

# 6 The trap
nodes = [(600, 62, 'Doubt'), (820, 195, 'Discomfort'), (600, 328, 'Overthinking'), (380, 195, 'More Learning')]
loop = ''.join(f'<rect x="{x-95}" y="{y-26}" width="190" height="52" rx="26" fill="#fff8f7" stroke="var(--redline)" stroke-width="3"/><text x="{x}" y="{y+8}" text-anchor="middle" font-size="23" font-weight="700" fill="var(--red)">{t}</text>' for x, y, t in nodes)
S.append(slide(6, 'The Intellectualization Trap', 'It Can Keep Us <em>Stuck Forever</em>',
  '<div class="scene"><svg viewBox="0 0 1200 390" role="img" aria-label="A loop going round and round: doubt, discomfort, overthinking, more learning, back to doubt, with the stick figure stuck in the middle">'
  + '<ellipse cx="600" cy="195" rx="220" ry="133" fill="none" stroke="#f3c1bd" stroke-width="5"/>'
  + '<ellipse class="spin" cx="600" cy="195" rx="220" ry="133" fill="none" stroke="var(--red)" stroke-width="5" stroke-dasharray="18 26" stroke-linecap="round"/>'
  + loop + fig(600, 160, mouth='frown', s=.42)
  + '</svg></div>',
  sub='If we\'re not careful, this loop keeps going round and round.'))

# 6b The proof: friends and family weren't doing any of this
def struck(inner):
    return f'<g opacity=".55">{inner}</g>'
def strikepill(x, y, t):
    w = len(t) * 20 * .56 + 34
    return pill(x, y, t, c='#8a7f99', bg='#fff', line='#e2d4f4', fs=20) + f'<path d="M{x-w/2+10:.0f} {y} H{x+w/2-10:.0f}" stroke="var(--red)" stroke-width="2.5" stroke-linecap="round" opacity=".85"/>'
nope = ''.join(strikepill(600, y, t) for y, t in [(95, 'Attachment styles'), (150, 'Boundaries'), (205, 'Red flags'), (260, 'Inner child work'), (315, 'Dating rules')])
def couple(cx):
    return (fig(cx-64, 128, mouth='smile', s=.85) + fig(cx+64, 128, mouth='smile', s=.85)
            + f'<g transform="translate({cx} 70) scale(1.5)"><path class="heartpulse" d="{HEART}" fill="#ec4899"/></g>')
S.append(slide(0, 'The Proof', 'They <em>Didn\'t Do Any Of This</em>',
  '<div class="scene"><svg viewBox="0 0 1200 390" role="img" aria-label="Two happy couples with hearts above them, and in the middle the books, podcasts, PDFs and newsletters crossed out">'
  + '<line x1="40" y1="372" x2="1160" y2="372" stroke="#d9c7f0" stroke-width="4"/>'
  + couple(230) + nope + couple(970)
  + '</svg></div>',
  sub='Think about your friends and family who are happily together. They weren\'t studying attachment styles, boundaries or red flags when they met their person. That\'s proof you don\'t need to either.'))

# 6d The real shift: you don't need to learn your way to love
S.append(slide(0, 'The Real Shift', 'You Don\'t Need To Learn <em>Your Way To Love</em>',
  '<div class="shift"><div class="statement"><p>You just need to <em>believe it can actually happen for you.</em></p></div>'
  + '<div class="scene"><svg viewBox="0 0 480 390" role="img" aria-label="A calm stick figure with a glowing heart, a small pile of books set aside next to them">'
  + '<defs><radialGradient id="shiftGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f472b6" stop-opacity=".45"/><stop offset=".6" stop-color="#f472b6" stop-opacity=".18"/><stop offset="1" stop-color="#f472b6" stop-opacity="0"/></radialGradient></defs>'
  + '<line x1="20" y1="372" x2="460" y2="372" stroke="#d9c7f0" stroke-width="4"/>'
  + '<ellipse class="glowpulse" cx="250" cy="205" rx="170" ry="170" fill="url(#shiftGlow)"/>'
  + '<g opacity=".45">' + ''.join(f'<rect x="{50+o}" y="{y}" width="{90-2*o}" height="20" rx="4" fill="{c}"/>' for o, y, c in [(0, 352, '#c4a8ef'), (6, 332, '#f3c1bd'), (2, 312, '#ede4fb')]) + '</g>'
  + fig(270, 128, eyes='closed', mouth='smile', s=.9) + heart(270, 200, 1.1)
  + floathearts([(180, 150, .8, 0), (370, 120, .9, -1.6), (340, 250, .7, -2.9)])
  + '</svg></div></div>'))

# 6e Your beliefs shape what you experience (loop + same moment, two beliefs)
def beliefloop():
    labels = ['Your Belief', 'What You Notice', 'What You Think', 'What You Do', 'What Happens']
    cx, cy, rx, ry = 225, 200, 132, 150
    out = ('<defs><marker id="blA" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="var(--violet)"/></marker></defs>'
           f'<ellipse class="loopdash" cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="none" stroke="var(--violet)" stroke-width="4" opacity=".7"/>')
    pts = []
    for k, t in enumerate(labels):
        a = -math.pi / 2 + k * 2 * math.pi / 5
        pts.append((cx + rx * math.cos(a), cy + ry * math.sin(a), t))
    for k in range(5):
        a = -math.pi / 2 + (k + .5) * 2 * math.pi / 5
        x, y = cx + rx * math.cos(a), cy + ry * math.sin(a)
        ang = math.degrees(a) + 90
        out += f'<path d="M-7 -7 L5 0 L-7 7" transform="translate({x:.0f} {y:.0f}) rotate({ang:.0f})" fill="none" stroke="var(--violet)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>'
    for k, (x, y, t) in enumerate(pts):
        w = len(t) * 9.6 + 30
        bg, fg, st = ('var(--purple)', '#fff', 'var(--purple)') if k == 0 else ('#fff', 'var(--purple)', '#e2d4f4')
        out += (f'<g transform="translate({x:.0f} {y:.0f})"><rect x="{-w/2:.0f}" y="-20" width="{w:.0f}" height="40" rx="20" fill="{bg}" stroke="{st}" stroke-width="2.5"/>'
                f'<text x="0" y="6" text-anchor="middle" font-size="17" font-weight="700" fill="{fg}">{t}</text></g>')
    return '<svg viewBox="0 0 460 400" class="bloop" role="img" aria-label="A loop: your belief, what you notice, what you think, what you do, what happens, back to your belief">' + out + '</svg>'
def moment(cls, belief, rows):
    r = ''.join(f'<div class="mrow"><b>{k}</b><span>{v}</span></div>' for k, v in rows)
    return f'<div class="side {cls} mside"><span class="pill">{belief}</span>{r}</div>'
S.append(slide(0, 'Why Belief Matters', 'Your Beliefs Shape <em>What You Experience</em>',
  '<div class="scene">' + beliefloop() + '</div>',
  sub="Your belief decides what you notice, what you think and what you do. Research on rejection sensitivity found people who expect rejection act in ways that bring it about."))

# 6c How belief is actually built: thought + feeling + repetition
def icon_thought():
    return ('<g fill="#fff" stroke="var(--violet)" stroke-width="5"><ellipse cx="0" cy="-8" rx="52" ry="36"/>'
            '<circle cx="-34" cy="38" r="9"/><circle cx="-48" cy="56" r="5"/></g>'
            '<path d="M-26 -14 H26 M-26 2 H12" stroke="var(--violet)" stroke-width="5" stroke-linecap="round"/>')
def icon_heart():
    return (f'<circle class="glowpulse" r="46" fill="#f472b6" opacity=".22"/>'
            f'<g transform="translate(0 -26) scale(2.2)"><path class="heartpulse" d="{HEART}" fill="#ec4899"/></g>')
def icon_repeat():
    return ('<g class="spinicon"><path d="M-34 -10 A36 36 0 0 1 30 -18" fill="none" stroke="var(--violet)" stroke-width="7" stroke-linecap="round"/>'
            '<path d="M18 -32 L32 -18 L14 -8" fill="none" stroke="var(--violet)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>'
            '<path d="M34 10 A36 36 0 0 1 -30 18" fill="none" stroke="var(--violet)" stroke-width="7" stroke-linecap="round"/>'
            '<path d="M-18 32 L-32 18 L-14 8" fill="none" stroke="var(--violet)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>')
def eqcard(x, icon, title, line, end=False):
    bg, st, tc, lc = ('var(--purple)', 'var(--purple)', '#fff', '#f1e8fd') if end else ('#fff', '#e2d4f4', 'var(--ink)', 'var(--soft)')
    return (f'<g transform="translate({x} 0)"><rect x="-110" y="20" width="220" height="350" rx="22" fill="{bg}" stroke="{st}" stroke-width="3"/>'
            f'<g transform="translate(0 130)">{icon}</g>'
            f'<text x="0" y="262" text-anchor="middle" font-family="Playfair Display, Georgia, serif" font-weight="900" font-size="34" fill="{tc}">{title}</text>'
            f'<text x="0" y="304" text-anchor="middle" font-size="19" fill="{lc}">{line[0]}</text>'
            f'<text x="0" y="330" text-anchor="middle" font-size="19" fill="{lc}">{line[1]}</text></g>')
def op(x, t):
    return f'<text x="{x}" y="215" text-anchor="middle" font-size="64" font-weight="800" fill="var(--violet)">{t}</text>'
belief_icon = ('<circle class="glowpulse" r="50" fill="#fff" opacity=".18"/>'
               '<path d="M-30 2 L-8 26 L34 -24" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>')
S.append(slide(0, 'How Belief Is Actually Built', 'Thought + Feeling <em>+ Repetition</em>',
  '<div class="scene"><svg viewBox="0 0 1200 390" role="img" aria-label="An equation: a thought, plus a feeling, plus repetition, equals belief">'
  + eqcard(120, icon_thought(), 'A Thought', ('You have a thought', ''))
  + op(270, '+') + eqcard(420, icon_heart(), 'A Feeling', ('You have a', 'corresponding feeling'))
  + op(570, '+') + eqcard(720, icon_repeat(), 'Repetition', ('You repeat this', 'over and over'))
  + op(890, '=') + eqcard(1060, belief_icon, 'Belief', ('Until it feels', 'true'), end=True)
  + '</svg></div>',
  sub="Your beliefs are built when you think a thought and feel the emotion of it being real, again and again."))

# 8a Doubt and belief as their own equation slides (same layout as Thought + Feeling + Repetition)
def eqcard2(x, icon, title, line, theme, end=False):
    col = {'red': ('var(--red)', '#fff8f7', 'var(--redline)'), 'green': ('var(--green)', '#f6fcf8', 'var(--greenline)')}[theme]
    bg, st, tc, lc = (col[0], col[0], '#fff', '#fff') if end else (col[1], col[2], 'var(--ink)', 'var(--soft)')
    fs = 30 if len(title) < 12 else 26
    return (f'<g transform="translate({x} 0)"><rect x="-110" y="20" width="220" height="350" rx="22" fill="{bg}" stroke="{st}" stroke-width="3"/>'
            f'<g transform="translate(0 130)">{icon}</g>'
            f'<text x="0" y="262" text-anchor="middle" font-family="Playfair Display, Georgia, serif" font-weight="900" font-size="{fs}" fill="{tc}">{title}</text>'
            f'<text x="0" y="304" text-anchor="middle" font-size="19" fill="{lc}">{line[0]}</text>'
            f'<text x="0" y="330" text-anchor="middle" font-size="19" fill="{lc}">{line[1]}</text></g>')
def op2(x, t, c):
    return f'<text x="{x}" y="215" text-anchor="middle" font-size="64" font-weight="800" fill="{c}">{t}</text>'
def heart_icon(c):
    return (f'<circle class="glowpulse" r="46" fill="{c}" opacity=".16"/>'
            f'<g transform="translate(0 -26) scale(2.2)"><path class="heartpulse" d="{HEART}" fill="{c}"/></g>')
cross_icon = ('<circle class="glowpulse" r="50" fill="#fff" opacity=".18"/>'
              '<path d="M-24 -24 L24 24 M24 -24 L-24 24" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/>')
def thought_icon(c):
    return (f'<g fill="#fff" stroke="{c}" stroke-width="5"><ellipse cx="0" cy="-8" rx="52" ry="36"/>'
            f'<circle cx="-34" cy="38" r="9"/><circle cx="-48" cy="56" r="5"/></g>'
            f'<path d="M-26 -14 H26 M-26 2 H12" stroke="{c}" stroke-width="5" stroke-linecap="round"/>')
def repeat_icon(c):
    return (f'<g class="spinicon" fill="none" stroke="{c}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">'
            '<path d="M-34 -10 A36 36 0 0 1 30 -18"/><path d="M18 -32 L32 -18 L14 -8"/>'
            '<path d="M34 10 A36 36 0 0 1 -30 18"/><path d="M-18 32 L-32 18 L-14 8"/></g>')
def beliefeq(theme, eyebrow, title, thought, feeling, belief, end_icon, sub):
    c = '#b42318' if theme == 'red' else '#1a7f37'
    return slide(0, eyebrow, title,
      '<div class="scene"><svg viewBox="0 0 1200 390" role="img" aria-label="An equation: a thought, plus a feeling, plus repetition, equals a belief">'
      + eqcard2(120, thought_icon(c), 'The Thought', thought, theme)
      + op2(270, '+', c) + eqcard2(420, heart_icon(c), 'The Feeling', feeling, theme)
      + op2(570, '+', c) + eqcard2(720, repeat_icon(c), 'Repetition', ('You repeat this', 'over and over'), theme)
      + op2(890, '=', c) + eqcard2(1060, end_icon, 'The Belief', belief, theme, end=True)
      + '</svg></div>', sub=sub)
S.append(beliefeq('red', 'How Doubt Gets Built', 'The Negative <em>Belief</em>',
  ('&ldquo;I&rsquo;ll end up', 'alone&rdquo;'), ('Fear and', 'heaviness'), ('&ldquo;It&rsquo;ll never', 'happen for me&rdquo;'), cross_icon,
  'Think it, feel it, repeat it and doubt becomes your belief. This is the loop most people are stuck in.'))
S.append(beliefeq('green', 'How Belief Gets Built', 'The Positive <em>Belief</em>',
  ('&ldquo;I&rsquo;m with', 'my person&rdquo;'), ('Warmth and', 'calm'), ('&ldquo;It&rsquo;s going', 'to happen&rdquo;'), belief_icon,
  'The same three steps, pointed where you want to go. This is the loop you build with Emotional Resonance.'))

# 7 Emotional Resonance
S.append(slide(7, 'The Way Out', 'Emotional <em>Resonance</em>',
  '<div class="ex"><div class="scene"><svg viewBox="0 0 700 390" role="img" aria-label="The stick figure with eyes closed and a hand on the heart, inside a warm glowing field with hearts floating up">'
  + '<defs><radialGradient id="arField" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f472b6" stop-opacity=".5"/><stop offset=".6" stop-color="#f472b6" stop-opacity=".2"/><stop offset="1" stop-color="#f472b6" stop-opacity="0"/></radialGradient></defs>'
  + '<g class="breathe"><ellipse cx="350" cy="200" rx="250" ry="185" fill="url(#arField)"/></g>'
  + '<line x1="0" y1="372" x2="700" y2="372" stroke="#d9c7f0" stroke-width="4"/>'
  + fig(350, 112, eyes='closed', mouth='smile', arms='heart', s=.9) + heart(356, 196, 1.1)
  + floathearts([(200, 250, .9, 0), (500, 230, 1, -1.5), (240, 140, .8, -2.8), (470, 120, .9, -2.1), (150, 190, .7, -3.6), (560, 170, .8, -.8)])
  + '</svg></div>' + note(text='Emotional Resonance builds <b class="p">the unshakeable belief</b> you need to attract someone special that you can build your life with.', label='What It Does') + '</div>'))

# 7b Where Emotional Resonance comes in: it covers thought + feeling + repetition
def ercard(x, icon, title, l1, l2, end=False):
    if end:
        bg, st, tc, lc = 'var(--purple)', 'var(--purple)', '#fff', '#f1e8fd'
    else:
        bg, st, tc, lc = '#fff', '#f9a8d4', 'var(--ink)', 'var(--soft)'
    return (f'<g transform="translate({x} 0)"><rect x="-110" y="72" width="220" height="300" rx="22" fill="{bg}" stroke="{st}" stroke-width="3"/>'
            f'<g transform="translate(0 160) scale(.85)">{icon}</g>'
            f'<text x="0" y="272" text-anchor="middle" font-family="Playfair Display, Georgia, serif" font-weight="900" font-size="28" fill="{tc}">{title}</text>'
            f'<text x="0" y="310" text-anchor="middle" font-size="18" fill="{lc}">{l1}</text>'
            f'<text x="0" y="334" text-anchor="middle" font-size="18" fill="{lc}">{l2}</text></g>')
pinkc = '#db2777'
erbody = ('<div class="scene"><svg viewBox="0 0 1200 390" role="img" aria-label="Emotional Resonance spans the thought, the feeling and the repetition, which together build the belief">'
  + '<defs><linearGradient id="erBand" x1="0" x2="1"><stop offset="0" stop-color="#f472b6" stop-opacity=".16"/><stop offset="1" stop-color="#a78bfa" stop-opacity=".16"/></linearGradient></defs>'
  + '<rect class="glowpulse" x="0" y="52" width="840" height="336" rx="26" fill="url(#erBand)"/>'
  + '<path d="M14 46 V30 Q14 20 24 20 H816 Q826 20 826 30 V46" fill="none" stroke="' + pinkc + '" stroke-width="4" stroke-linecap="round"/>'
  + '<rect x="255" y="2" width="330" height="38" rx="19" fill="' + pinkc + '"/><text x="420" y="28" text-anchor="middle" font-size="18" font-weight="800" letter-spacing="1.5" fill="#fff">EMOTIONAL RESONANCE</text>'
  + ercard(120, thought_icon(pinkc), 'The Thought', 'You choose to think', '&ldquo;I&rsquo;m with my person&rdquo;')
  + op2(270, '+', pinkc) + ercard(420, heart_icon(pinkc), 'The Feeling', 'You choose to feel', 'the feeling of it')
  + op2(570, '+', pinkc) + ercard(720, repeat_icon(pinkc), 'Repetition', 'You do this', 'every day')
  + op2(890, '=', 'var(--purple)') + ercard(1060, belief_icon, 'The Belief', '&ldquo;It&rsquo;s going', 'to happen&rdquo;', end=True)
  + '</svg></div>')
S.append(slide(0, 'How It Builds Your Belief', 'Where Emotional Resonance <em>Comes In</em>', erbody,
  sub="Emotional Resonance is where you consciously choose to think and feel like you&rsquo;re already in your chosen relationship, consistently, so you believe it to be true."))

# 8 Telling body and mind
ups = ''.join(f'<circle class="pulseout" style="animation-delay:{-i*0.8:.1f}s" cx="350" cy="190" r="40" fill="none" stroke="#ec4899" stroke-width="4"/>' for i in range(3))
S.append(slide(8, 'What Happens', 'You Tell Your Body <em>It\'s Already Real</em>',
  '<div class="ex"><div class="scene"><svg viewBox="0 0 700 390" role="img" aria-label="Warm waves spreading out from the glowing heart through the head and the body">'
  + '<line x1="0" y1="372" x2="700" y2="372" stroke="#d9c7f0" stroke-width="4"/>'
  + ups + fig(350, 112, eyes='closed', mouth='smile', s=.9) + heart(350, 196, 1.2)
  + '<text x="560" y="92" font-size="24" font-weight="700" fill="var(--purple)">Your mind</text><path d="M552 86 H400" stroke="var(--violet)" stroke-width="3" stroke-dasharray="4 8" stroke-linecap="round"/>'
  + '<text x="560" y="290" font-size="24" font-weight="700" fill="var(--purple)">Your body</text><path d="M552 284 H380" stroke="var(--violet)" stroke-width="3" stroke-dasharray="4 8" stroke-linecap="round"/>'
  + '</svg></div>' + note(text='When you do this, you\'re telling your body and your mind that you\'re <b class="p">already in the relationship you want.</b>', label='Why It Works') + '</div>'))

# 9 Builds belief (circular: each loop makes it stronger)
S.append(slide(9, 'What It Builds', 'Unshakeable <em>Belief</em>',
  '<div class="scene"><svg viewBox="0 0 1200 390" role="img" aria-label="A loop that keeps going round: feel it on command, out of your head, unshakeable belief, and back to feeling it again, stronger each time">'
  + '<defs><marker id="ubA" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="var(--green)"/></marker>'
  + '<radialGradient id="ubGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f472b6" stop-opacity=".4"/><stop offset=".6" stop-color="#f472b6" stop-opacity=".15"/><stop offset="1" stop-color="#f472b6" stop-opacity="0"/></radialGradient></defs>'
  + '<ellipse class="glowpulse" cx="600" cy="215" rx="150" ry="120" fill="url(#ubGlow)"/>'
  + '<path class="loopdash" d="M772 80 C900 80 950 150 930 220" fill="none" stroke="var(--green)" stroke-width="5" stroke-linecap="round" marker-end="url(#ubA)"/>'
  + '<path class="loopdash" d="M725 318 C640 350 560 350 475 318" fill="none" stroke="var(--green)" stroke-width="5" stroke-linecap="round" marker-end="url(#ubA)"/>'
  + '<path class="loopdash" d="M270 220 C250 150 300 80 428 80" fill="none" stroke="var(--green)" stroke-width="5" stroke-linecap="round" marker-end="url(#ubA)"/>'
  + loopcard(600, 72, '1', 'Feel It On Command', 'Emotional Resonance, as if', 'it&rsquo;s already real')
  + loopcard(895, 300, '2', 'Out Of Your Head', 'The overthinking', 'quietens down')
  + loopcard(305, 300, '3', 'Unshakeable Belief', 'You know this can happen', 'for you', end=True)
  + fig(600, 205, eyes='closed', mouth='smile', s=.38) + heart(600, 233, .55)
  + '<text x="600" y="320" text-anchor="middle" font-size="14" font-weight="700" letter-spacing="2" fill="var(--green)">STRONGER EVERY TIME</text>'
  + '</svg></div>',
  sub='From this place, all your thoughts and actions line up with the belief that you know it will happen.'))

# 9b Actions come from the new belief
def okpill(x, y, t):
    w = 330
    return (f'<g transform="translate({x} {y})"><rect x="{-w/2:.0f}" y="-26" width="{w:.0f}" height="52" rx="26" fill="#f6fcf8" stroke="var(--greenline)" stroke-width="3"/>'
            f'<circle cx="{-w/2+28:.0f}" cy="0" r="15" fill="var(--greenbg)" stroke="var(--greenline)" stroke-width="2"/>'
            f'<path d="M{-w/2+21:.0f} 0 L{-w/2+26:.0f} 6 L{-w/2+35:.0f} -6" fill="none" stroke="var(--green)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<text x="{-w/2+52:.0f}" y="7" font-size="21" font-weight="700" fill="var(--ink)">{t}</text></g>')
S.append(slide(0, 'What Changes', 'Your Actions Come From <em>Your Belief</em>',
  '<div class="scene"><svg viewBox="0 0 1200 390" role="img" aria-label="A calm, confident stick figure with a glowing heart; from them come feeling confident, feeling good enough and showing up as yourself; on the right someone who resonates with that walks in">'
  + '<defs><radialGradient id="actGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f472b6" stop-opacity=".42"/><stop offset=".6" stop-color="#f472b6" stop-opacity=".18"/><stop offset="1" stop-color="#f472b6" stop-opacity="0"/></radialGradient></defs>'
  + '<line x1="40" y1="372" x2="1160" y2="372" stroke="#d9c7f0" stroke-width="4"/>'
  + '<ellipse class="glowpulse" cx="230" cy="210" rx="170" ry="170" fill="url(#actGlow)"/>'
  + fig(230, 128, mouth='smile', s=.9) + heart(230, 200, 1.1)
  + '<path class="flowdash" d="M360 200 H420" fill="none" stroke="var(--violet)" stroke-width="5" stroke-linecap="round"/>'
  + okpill(600, 110, 'You feel confident') + okpill(600, 195, 'You feel good enough') + okpill(600, 280, 'You show up as yourself')
  + '<path class="flowdash" d="M790 200 H850" fill="none" stroke="var(--violet)" stroke-width="5" stroke-linecap="round"/>'
  + '<g class="walkin2">' + fig(980, 128, mouth='smile', s=.9) + '</g>'
  + floathearts([(905, 120, .8, 0), (1060, 100, .9, -1.6), (1000, 60, .7, -2.9)])
  + '<text x="980" y="364" text-anchor="middle" font-size="20" font-weight="700" fill="var(--purple)">Someone who resonates with that</text>'
  + '</svg></div>',
  sub='When you believe it, your actions come from that belief. You feel confident and good enough and you meet someone who resonates with who you are.'))

# 10 Find your person
S.append(slide(10, 'This Is How You Find Your Person', 'You Don\'t Need To <em>Fix Yourself</em>',
  '<div class="scene"><svg viewBox="0 0 1200 390" role="img" aria-label="Two stick figures walking towards each other and a heart appearing between them">'
  + '<line x1="40" y1="372" x2="1160" y2="372" stroke="#d9c7f0" stroke-width="4"/>'
  + '<g class="walkin">' + fig(420, 128, mouth='smile', s=.9) + '</g>'
  + '<g class="walkin2">' + fig(780, 128, mouth='smile', s=.9) + '</g>'
  + '<g class="popheart"><circle cx="600" cy="150" r="52" fill="#f472b6" opacity=".22"/><g transform="translate(600 126) scale(2.2)"><path d="' + HEART + '" fill="#ec4899"/></g></g>'
  + floathearts([(540, 250, .8, 0), (660, 230, .9, -1.6), (600, 80, .7, -2.9)])
  + '</svg></div>',
  sub='You just need to believe it\'s possible.'))

extra_css = '''
/* argument explainer (2026-11-12) */
.mini { width:100%; height:138px; margin:4px 0 0; }
.glowpulse { transform-box:fill-box; transform-origin:center; animation:glowpulse 4s ease-in-out infinite; }
@keyframes glowpulse { 0%,100% { transform:scale(.92); } 50% { transform:scale(1.06); } }
.jitter { transform-box:fill-box; transform-origin:center; animation:jitter .5s steps(2) infinite; }
@keyframes jitter { 0% { transform:translate(0,0) rotate(0deg); } 50% { transform:translate(2px,-2px) rotate(3deg); } 100% { transform:translate(-2px,1px) rotate(-2deg); } }
.heartpulse { transform-box:fill-box; transform-origin:center; animation:heartpulse 2.4s ease-in-out infinite; }
@keyframes heartpulse { 0%,100% { transform:scale(.9); } 50% { transform:scale(1.15); } }
.bob { animation:bob 3s ease-in-out infinite; }
@keyframes bob { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
.spin { animation:spin 3s linear infinite; }
@keyframes spin { to { stroke-dashoffset:-176; } }
.pulseout { transform-box:fill-box; transform-origin:center; animation:pulseout 2.4s ease-out infinite; opacity:0; }
@keyframes pulseout { 0% { transform:scale(.5); opacity:.9; } 100% { transform:scale(4); opacity:0; } }
.walkin { animation:walkin 6s ease-in-out infinite; } .walkin2 { animation:walkin2 6s ease-in-out infinite; }
@keyframes walkin { 0% { transform:translateX(-160px); } 45%,100% { transform:translateX(0); } }
@keyframes walkin2 { 0% { transform:translateX(160px); } 45%,100% { transform:translateX(0); } }
.popheart { transform-box:fill-box; transform-origin:center; animation:popheart 6s ease-out infinite; }
@keyframes popheart { 0%,45% { transform:scale(0); opacity:0; } 55% { transform:scale(1.15); opacity:1; } 62%,100% { transform:scale(1); opacity:1; } }
.board > .scene { height:100%; }
.spinicon { transform-box:fill-box; transform-origin:center; animation:spinicon 6s linear infinite; }
@keyframes spinicon { to { transform:rotate(360deg); } }
.tkrow { display:flex; align-items:center; gap:16px; font-size:26px; margin-top:16px; }
.tk { flex:none; width:44px; height:44px; border-radius:50%; display:grid; place-items:center; font-size:24px; font-weight:800; }
.tk.ok { background:var(--greenbg); color:var(--green); border:2px solid var(--greenline); }
.tk.no { background:var(--redbg); color:var(--red); border:2px solid var(--redline); }
.prob .tkrow:has(.no) span:last-child { color:#8a7f99; }
.c3cmp { grid-template-columns:repeat(3,1fr) !important; gap:16px !important; }
.c3cmp .loop { padding:14px 22px; gap:5px; }
.c3cmp .pill { font-size:13px; padding:5px 12px; margin-bottom:2px; }
.c3cmp .eq { grid-template-columns:1fr; gap:0; font-size:19px; line-height:1.22; }
.c3cmp .eq b { font-size:13px; }
.c3cmp .eq.res { padding-top:7px; margin-top:2px; } .c3cmp .eq.res span { font-size:22px; }
.side.any { background:#faf7fe; border-color:#e2d4f4; }
.any .pill { background:var(--tint); color:var(--purple); border-color:#e2d4f4; }
.any .eq b { color:var(--purple); } .any .eq.res { border-color:#e2d4f4; }
.rep { width:100%; height:auto; display:block; margin:2px 0; }
.loopdash { stroke-dasharray:8 8; animation:loopdash 1s linear infinite; }
@keyframes loopdash { to { stroke-dashoffset:-16; } }
.fillbar { transform-box:fill-box; transform-origin:left center; animation:fillbar 6s ease-in-out infinite; }
@keyframes fillbar { 0% { transform:scaleX(.05); } 80%,100% { transform:scaleX(1); } }
.flowdash { stroke-dasharray:14 12; animation:flowdash 1.1s linear infinite; }
@keyframes flowdash { to { stroke-dashoffset:-26; } }
.shift { display:grid; grid-template-columns:1.5fr 1fr; gap:22px; height:100%; }
.shift .statement p { font-size:50px; }
.solo { display:grid !important; grid-template-columns:1.1fr 1fr; align-items:center; height:100%; padding:30px 44px !important; }
.solotext { display:flex; flex-direction:column; }
.solo strong { font-size:48px !important; margin-top:18px !important; }
.solo .solotext > span:last-child { font-size:28px !important; line-height:1.4; margin-top:14px; }
.solopic { width:100%; height:330px; }
.ex-rows:has(> div:nth-child(7)) { gap:7px; } .ex-rows:has(> div:nth-child(7)) div { font-size:21px; } .ex-rows:has(> div:nth-child(7)) i { width:34px; height:34px; font-size:15px; }
.shape { display:grid; grid-template-columns:440px 1fr; gap:20px; height:100%; }
.bloop { width:100%; height:100%; display:block; }
.mwrap { display:flex; flex-direction:column; gap:10px; min-height:0; }
.mhead { font-size:15px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--purple); }
.mwrap .compare { flex:1; gap:14px; min-height:0; }
.mside { padding:16px 18px !important; gap:4px; }
.mside .pill { font-size:13px !important; letter-spacing:.02em !important; text-transform:none !important; font-weight:700; margin-bottom:6px; }
.mrow { display:flex; flex-direction:column; margin-top:5px; }
.mrow b { font-size:12px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; }
.prob .mrow b { color:var(--red); } .sol .mrow b { color:var(--green); }
.mrow span { font-size:17px; line-height:1.28; }
/* no webcam in this explainer: the header uses the full width */
.head { width:1200px !important; }
'''
script2 = script.replace("fit(); show();", "fit(); show();\n  var pm = q.match(/[?&]play(?:=(\\d+))?/); if (pm) { var sec = +(pm[1] || 8); setInterval(function(){ if (i < slides.length - 1) { i++; show(); } }, sec * 1000); }")
page = ('<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n'
  '<title>Intellectualization Trap Explainer</title>\n'
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700;800&display=swap">\n'
  '<style>' + head_css + extra_css + '</style></head>\n<body>\n'
  '<!-- Argument explainer, same look as how-to-control-your-mental-attention.html but NO webcam space (Olly 2026-11-12). Built from scratchpad build_argument.py 2026-11-12.\n'
  '     Keys: right/space/click = next, left = back, F = full screen. ?all = every slide, ?s=N = start on slide N, ?cam = webcam box, ?play or ?play=6 = auto-advance like a video. -->\n'
  '<div class="stage" id="stage">\n' + ''.join(S) + '</div>\n'
  '<button class="fsbtn" id="fsbtn" type="button">&#x26F6; Full screen (F)</button>\n<div class="count" id="count"></div>\n'
  + script2 + '\n</body></html>')
c=[0]
def _dn(m):
    c[0]+=1; return 'class="slide" data-n="%d"'%c[0]
page=re.sub(r'class="slide" data-n="\d+"',_dn,page)
pathlib.Path('training/the-intellectualization-trap.html').write_text(page, encoding='utf-8')
print(len(S), 'slides')
