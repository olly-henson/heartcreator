"""Exercise sheets for The Emotional Resonance Method (Olly 2026-11-23), linked below each training in Skool.
Phone-shaped PDF pages (1080x1920) in the slide design. CSS + drawings are pulled straight from the built trainings
(erm-N-*.html), so run build_emotional_resonance_method.py first, then:
    python build_worksheets.py          -> pdfs/<training>-exercise-sheet.html + .pdf  (Trainings 2, 3, 4 and 6)
    python build_worksheets.py 3        -> just one
No sheet for 1 (Welcome) or 5 (the meditation itself; Olly records it).
"""
import os, re, sys, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
EXPORT = os.path.join(HERE, '..', 'tools', 'export_pdf.js')

def deck(fname):
    src = open(os.path.join(HERE, fname), encoding='utf-8').read()
    return {'css': re.search(r'<style>(.*?)</style>', src, re.S).group(1),
            'fonts': re.search(r'<link rel="stylesheet"[^>]+>', src).group(0),
            'slides': dict(re.findall(r'<section class="slide" data-n="(\d+)">(.*?)</section>', src, re.S))}

ARROW = '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v15M6 13l6 6 6-6"/></svg>'

WS_CSS = """
@page { size:1080px 1920px; margin:0; }
html, body { background:#fff; height:auto; }
.page { width:1080px; height:1920px; position:relative; overflow:hidden; background:#fff; padding:64px 64px 0; box-sizing:border-box;
  page-break-after:always; break-after:page; font-family:var(--body); color:var(--ink); }
.page:last-child { page-break-after:auto; break-after:auto; }
.page * { box-sizing:border-box; animation:none !important; }
.top { display:flex; justify-content:space-between; align-items:baseline; border-bottom:3px solid var(--line); padding-bottom:18px; }
.top .eyebrow { font-size:19px; }
.top .pg { font-size:19px; font-weight:700; color:#9a86b8; letter-spacing:.1em; }
.page h1 { font-family:var(--display); font-weight:900; font-size:66px; line-height:1.05; margin:30px 0 0; }
.page h1 em, .page h2 em { font-style:normal; color:var(--purple); }
.lead { font-size:28px; line-height:1.4; color:var(--soft); margin:16px 0 0; }
.page h2 { font-family:var(--display); font-weight:900; font-size:40px; line-height:1.1; margin:38px 0 16px; }
.page h2 small { display:block; font-family:var(--body); font-size:18px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--purple); margin-bottom:8px; }
.belief { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
.belief .side { padding:24px 26px; gap:8px; } .belief .eq { font-size:25px; grid-template-columns:116px 1fr; }
.belief .eq.res span { font-size:29px; }
.chain3 { display:flex; flex-direction:column; gap:6px; }
.chain3 .box { border-radius:20px; background:var(--tint); border:2px solid #e2d4f4; padding:18px 26px; display:flex; gap:20px; align-items:center; }
.chain3 .box b { flex:none; width:50px; height:50px; border-radius:50%; background:var(--purple); color:#fff; font:700 24px var(--body); display:grid; place-items:center; }
.chain3 .box strong { font-family:var(--display); font-size:31px; } .chain3 .box span { font-size:24px; color:var(--soft); margin-left:auto; text-align:right; }
.chain3 .box.end { background:var(--purple); border-color:var(--purple); color:#fff; } .chain3 .box.end b { background:#fff; color:var(--purple); } .chain3 .box.end span { color:#f1e8fd; }
.chain3 .arrow { width:34px; height:34px; color:var(--violet); align-self:center; margin:-4px 0; }
.bul { list-style:none; padding:0; margin:0; display:grid; grid-template-columns:1fr 1fr; grid-template-rows:repeat(3,auto); grid-auto-flow:column; gap:14px 24px; font-size:25px; line-height:1.3; }
.bul li { position:relative; padding-left:30px; } .bul li::before { content:""; position:absolute; left:0; top:.45em; width:12px; height:12px; border-radius:50%; background:var(--violet); }
.rule { margin-top:22px; border-radius:20px; background:var(--tint); border-left:8px solid var(--violet); padding:20px 26px; font-size:25px; line-height:1.4; }
.rule b { color:var(--purple); }
.big { border-radius:22px; background:var(--tint); padding:30px 36px; margin-top:28px; }
.big p { font-family:var(--display); font-weight:900; font-size:38px; line-height:1.2; margin:0; } .big p em { font-style:normal; color:var(--purple); }
.big small { display:block; font-size:24px; line-height:1.4; color:var(--soft); margin-top:12px; }
/* exercise step cards with a drawing (sheet 3) */
.steps { display:grid; grid-template-columns:1fr 1fr; gap:16px 20px; margin-top:8px; }
.st { border-radius:20px; border:2px solid #e2d4f4; background:#fff; overflow:hidden; display:flex; flex-direction:column; }
.st .pic { position:relative; background:var(--tint); height:210px; }
.st .pic svg { width:100%; height:100%; display:block; }
.st .pic i { position:absolute; left:12px; top:12px; font-style:normal; width:44px; height:44px; border-radius:50%; background:var(--purple); color:#fff; font:700 22px var(--body); display:grid; place-items:center; }
.st .tx { padding:12px 18px 14px; } .st strong { display:block; font-family:var(--display); font-size:29px; line-height:1.1; }
.st span { display:block; font-size:23px; line-height:1.3; margin-top:5px; color:var(--soft); }
.eyes { margin-top:16px; border-radius:20px; background:var(--purple); color:#fff; padding:20px 28px; display:flex; gap:22px; align-items:center; }
.eyes i { flex:none; font-style:normal; width:52px; height:52px; border-radius:50%; background:#fff; color:var(--purple); font:700 24px var(--body); display:grid; place-items:center; }
.eyes strong { display:block; font-family:var(--display); font-size:31px; } .eyes span { display:block; font-size:23px; line-height:1.3; color:#f1e8fd; margin-top:3px; }
/* numbered step blocks (sheets 2, 4, 6) */
.blk { display:flex; gap:22px; border-radius:20px; border:2px solid #e2d4f4; background:#fff; padding:22px 26px; margin-top:14px; }
.blk > i { flex:none; font-style:normal; width:54px; height:54px; border-radius:50%; background:var(--purple); color:#fff; font:700 25px var(--body); display:grid; place-items:center; }
.blk strong { display:block; font-family:var(--display); font-size:32px; line-height:1.1; }
.blk small { display:block; font-size:16px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--purple); margin-bottom:4px; }
.blk .d { font-size:24px; line-height:1.35; color:var(--soft); margin-top:6px; }
.blk ol { margin:10px 0 0; padding:0; list-style:none; counter-reset:r; }
.blk ol li { counter-increment:r; position:relative; padding-left:40px; font-size:25px; line-height:1.35; margin-top:8px; }
.blk ol li::before { content:counter(r); position:absolute; left:0; top:1px; width:30px; height:30px; border-radius:50%; border:2px solid var(--violet); color:var(--purple); font:700 16px var(--body); display:grid; place-items:center; }
.numrows { list-style:none; padding:0; margin:0; counter-reset:n; border-radius:22px; background:var(--tint); padding:22px 30px; }
.numrows li { counter-increment:n; position:relative; padding-left:62px; font-size:27px; line-height:1.3; margin:12px 0; min-height:44px; display:flex; align-items:center; }
.numrows li::before { content:counter(n); position:absolute; left:0; top:50%; transform:translateY(-50%); width:44px; height:44px; border-radius:50%; background:#fff; border:2px solid var(--violet); color:var(--purple); font:700 20px var(--body); display:grid; place-items:center; }
.ticks { display:grid; grid-template-columns:1fr 1fr; gap:14px 24px; }
.ticks div { display:flex; gap:14px; align-items:center; font-size:25px; line-height:1.3; }
.ticks div::before { content:"\\2713"; flex:none; width:40px; height:40px; border-radius:50%; background:#fff; border:3px solid var(--violet); color:var(--purple); font-size:20px; font-weight:700; display:grid; place-items:center; }
/* the worksheet page example (sheet 2) */
.sheetpaper .paper { transform:none; padding:30px 28px; }
.sheetpaper .wgrid { grid-template-columns:1fr 170px 1fr; gap:22px; }
.sheetpaper .wcol b { font-size:34px; } .sheetpaper .wcol p { font-size:21px; font-style:normal; }
.sheetpaper .wcol li { font-size:23px; line-height:1.25; margin-bottom:8px; padding-left:32px; }
.sheetpaper .wcol li.pick { padding:3px 16px 3px 44px; margin-left:-14px; } .sheetpaper .wcol li.pick::before { left:16px; }
.sheetpaper .sym svg { width:170px; height:170px; margin-top:40px; }
.s2 .blk { padding:18px 24px; margin-top:10px; } .s2 .big { padding:24px 32px; margin-top:22px; } .s2 h2 { margin-top:30px; }
.s4 .blk { padding:28px 30px; margin-top:20px; } .s4 .blk strong { font-size:38px; } .s4 .blk .d { font-size:26px; } .s4 .blk ol li { font-size:28px; margin-top:12px; } .s4 .big { margin-top:30px; }
/* day examples (sheet 6) */
.page .days { height:auto; grid-template-rows:auto; gap:16px; }
.page .day svg { height:190px; flex:none; } .page .day span { font-size:22px; padding:12px 16px; }
.foot { position:absolute; left:64px; right:64px; bottom:34px; font-size:18px; color:#9a86b8; display:flex; justify-content:space-between; }
"""

def page(eyebrow, inner, n, total, cls=''):
    return ('<section class="page '+cls+'">\n  <div class="top"><span class="eyebrow">%s</span><span class="pg">Exercise Sheet</span></div>\n%s\n'
            '  <div class="foot"><span>The Heart Attractor Program</span><span>%d / %d</span></div>\n</section>') % (eyebrow, inner, n, total)

def blk(num, title, items=None, desc='', label=''):
    return ('<div class="blk"><i>%s</i><div>%s<strong>%s</strong>%s%s</div></div>'
            % (num, '<small>%s</small>' % label if label else '', title, '<div class="d">%s</div>' % desc if desc else '',
               '<ol>%s</ol>' % ''.join('<li>%s</li>' % x for x in items) if items else ''))

# ---------------------------------------------------------------- sheets
def sheet2():
    d = deck('erm-2-confirm-your-emotional-resonance.html')
    b = d['slides']['6']; paper = b[b.index('<div class="paper">'):b.index('<div class="note">')]
    inner = """  <h1>Confirm Your <em>Emotional Resonance</em></h1>
  <p class="lead">Grab a pen and paper. Follow these 4 steps.</p>
  <div class="big"><p>It&rsquo;s the emotion you&rsquo;ll feel <em>with your person.</em></p><small>When you feel it now, before they arrive, you start to attract the person who matches it.</small></div>
  <h2><small>The Steps</small>Make <em>Your Page</em></h2>
  %s%s%s%s
  <h2><small>Example</small>Your Page <em>Will Look Like This</em></h2>
  <div class="sheetpaper">%s</div>""" % (
        blk(1, 'Choose Your Symbol', desc='Draw a capital &lsquo;R&rsquo; for your relationship. Circle it with two wavy lines. Put it in the middle of your page. It holds your intentions, so you can bring them all back in a second.'),
        blk(2, 'Write Your Intentions', desc='On the left, write your 4 to 5 absolute must-haves: who they are, how they treat you, your life together.'),
        blk(3, 'Write Your Emotions', desc='Imagine you&rsquo;re already together. On the right, write every emotion you feel.'),
        blk(4, 'Find Your Emotional Resonance', desc='Read your intentions again. Circle the one emotion you feel most strongly. That&rsquo;s your Emotional Resonance.'),
        paper)
    return d, 'Confirm Your Emotional Resonance', [page('The Emotional Resonance Method &middot; Part 2', inner, 1, 1, 's2')]

def sheet3():
    d = deck('erm-3-how-to-feel-your-emotional-resonance.html')
    sv = lambda n: re.search(r'<div class="scene">(<svg.*?</svg>)</div>', d['slides'][str(n)], re.S).group(1)
    belief = re.search(r'<div class="compare"[^>]*>(.*?)</div>\s*<p class="research">', d['slides']['2'], re.S).group(1)
    STEPS = [(6, 'Notice Where Your Hand Is', 'Hand on the centre of your chest. Notice where it is. Take it away and notice where it was.'),
             (7, 'A Spot On The Wall', 'Sit at a desk or table. Rest your attention on one small spot on the wall.'),
             (8, 'The Whole Wall', 'Let your attention widen from the spot to the whole wall.'),
             (9, 'The Wall To Your Left', 'Head still, facing forward. Move your attention to the wall on your left.'),
             (10, 'The Wall To Your Right', 'Head still, facing forward. Move your attention to the wall on your right.'),
             (11, 'The Ceiling Above You', 'Head still, facing forward. Move your attention to the ceiling above you.'),
             (12, 'The Wall Behind You', 'Head still, facing forward. Move your attention to the wall behind you.'),
             (13, 'The Space Around You', 'Sense the whole space around you, all at once.')]
    steps = ''.join('<div class="st"><div class="pic">%s<i>%d</i></div><div class="tx"><strong>%s</strong><span>%s</span></div></div>'
                    % (sv(n), k + 1, t, x) for k, (n, t, x) in enumerate(STEPS))
    p1 = """  <h1>How To Feel Your <em>Emotional Resonance</em></h1>
  <p class="lead">Keep this on your phone. Read page 1 once, then use page 2 every time you practice.</p>
  <h2><small>Before We Start</small>What A Belief <em>Actually Is</em></h2>
  <div class="belief">%s</div>
  <h2><small>Why We Start With Attention</small>It All Starts With <em>Your Attention</em></h2>
  <div class="chain3">
    <div class="box"><b>1</b><strong>Control Your Attention</strong><span>Choose the thought you come back to</span></div>%s
    <div class="box"><b>2</b><strong>Feel The Outcome</strong><span>Feel it as already real</span></div>%s
    <div class="box end"><b>3</b><strong>Unshakeable Belief</strong><span>Repeat until it feels true</span></div>
  </div>
  <h2><small>Why These Exercises Work</small>They Quiet <em>The Analytical Mind</em></h2>
  <ul class="bul"><li>Focus your attention on one thing</li><li>Your analytical mind slows down</li><li>Brainwaves shift to alpha and theta</li><li>You enter the present moment</li><li>More access to your subconscious</li><li>You stay fully focused</li></ul>
  <p class="rule" style="margin-top:34px">Harvard research: the more you imagine an emotional future, the more likely it feels. <b>Every time you feel it, you&rsquo;re building the belief.</b></p>""" % (belief, ARROW, ARROW)
    p2 = """  <div class="rule"><b>Every step:</b> feel like you&rsquo;re touching it with your mind. Soft and steady, not forced. When your mind wanders, bring it back.</div>
  <div class="steps">%s</div>
  <div class="eyes"><i>9</i><div><strong>Now Do It With Your Eyes Closed</strong><span>Close your eyes and sense steps 1 to 8 again, one at a time.</span></div></div>""" % steps
    return d, 'How To Feel Your Emotional Resonance', [page('The Emotional Resonance Method &middot; Part 3', p1, 1, 2),
                                                       page('Exercise 1 &middot; Train Your Attention', p2, 2, 2)]

def sheet4():
    d = deck('erm-4-how-to-do-the-emotional-resonance-meditation.html')
    inner = """  <h1>How To Do The <em>Emotional Resonance Meditation</em></h1>
  <p class="lead">10 minutes a day, three parts. Have your page close by.</p>
  %s%s%s
  <div class="big"><p>Once a day, <em>every day.</em></p><small>Each time you feel it, you build the belief that it&rsquo;s going to happen.</small></div>""" % (
        blk(1, 'Slow Down', ['Sit or lie down, spine neutral, and close your eyes', 'Keep your legs and arms uncrossed', 'Soften your body from head to toe',
                             'Sense the space around you, like you learned in Part 3', 'Keep the touch soft and steady, not forced'],
            desc='Turn down the overthinking mind and gather your attention.', label='Part 1'),
        blk(2, 'Focus On Your Intentions', ['Bring your symbol to mind', 'Run through your intentions one by one', 'Get into each one, as if it&rsquo;s already happening',
                                            'Your mind is calmer now, so this is easier to enjoy'],
            desc='Recall your intentions and get into them.', label='Part 2'),
        blk(3, 'Feel It Now', ['Recall your Emotional Resonance', 'Feel it as if you&rsquo;re with your person right now', 'Breathe it in and out of your heart',
                               'Give thanks and come back to your body'],
            desc='Feel your Emotional Resonance as if it&rsquo;s real right now.', label='Part 3'))
    return d, 'How To Do The Emotional Resonance Meditation', [page('The Emotional Resonance Method &middot; Part 4', inner, 1, 1, 's4')]

def sheet6():
    d = deck('erm-6-how-to-maintain-emotional-resonance-during-your-day.html')
    days = next(re.search(r'(<div class="days">.*)</div>\s*$', b, re.S).group(1) for b in d['slides'].values() if 'class="days"' in b)
    inner = """  <h1>How To Maintain <em>Emotional Resonance</em> During Your Day</h1>
  <div class="big"><p>The meditation sets your state. <em>Your day is where you keep it.</em></p></div>
  <h2><small>Emotional Anchoring</small>Bring It <em>Back</em></h2>
  <ul class="numrows"><li>Sense the space around you, eyes open or closed</li><li>Keep going until you relax into the present moment</li>
    <li>Recall one or more of your intentions. Let yourself get into it</li><li>Recall the emotion (expand on it if you want)</li>
    <li>Get into the feeling and breathe it in and out of your heart</li></ul>
  <h2><small>Through Your Day</small>When To <em>Use It</em></h2>
  <div class="ticks"><div>Whenever you want the feeling</div><div>Whenever it&rsquo;s worn off</div><div>Whenever the old emotion shows up</div><div>For as long as you like</div></div>
  <h2><small>Examples</small>Anchor It <em>Through Your Day</em></h2>
  %s""" % days
    return d, 'How To Maintain Emotional Resonance During Your Day', [page('The Emotional Resonance Method &middot; Part 6', inner, 1, 1)]

# ---- bonus trainings (Olly 2026-11-27): built from talk-to-the-heart.html / embody-your-symbol.html (build_bonus_trainings.py)
BONUS_CSS = """
.steps.c3 { grid-template-columns:repeat(3,1fr); } .steps.c3 .pic { height:250px; } .steps.big3 .pic { height:330px; }
.page .days.d3 .day svg { height:250px; } .page .days.d3 .day span { font-size:24px; }
.page .rule { margin-top:34px; font-size:27px; }
.say { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:12px; }
.say li { font-family:var(--display); font-weight:700; font-size:30px; line-height:1.25; padding-left:24px; border-left:5px solid var(--violet); }
.vs { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-bottom:18px; }
.vs div { border-radius:20px; padding:18px 24px; font-size:24px; line-height:1.35; }
.vs b { display:block; font-size:16px; letter-spacing:.14em; text-transform:uppercase; margin-bottom:6px; }
.vs .no { background:#fdf3f2; border:2px solid #f3c5c0; } .vs .no b { color:#b42318; }
.vs .yes { background:#f2faf4; border:2px solid #b9e2c4; } .vs .yes b { color:#1b7a3a; }
"""

def _cards(d, steps, cls=''):
    sv = lambda n: re.search(r'<div class="scene">(<svg.*?</svg>)</div>', d['slides'][str(n)], re.S).group(1)
    return '<div class="steps %s">%s</div>' % (cls, ''.join(
        '<div class="st"><div class="pic">%s<i>%d</i></div><div class="tx"><strong>%s</strong><span>%s</span></div></div>'
        % (sv(n), k + 1, t, x) for k, (n, t, x) in enumerate(steps)))

def sheet_tth():
    d = deck('talk-to-the-heart.html')
    inner = """  <h1>Talk To <em>The Heart</em></h1>
  <p class="lead">Get your mind and your heart to agree on what you want.</p>
  <div class="big"><p>Your mind and your heart <em>agree on what you want.</em></p><small>That&rsquo;s mind and heart coherence. Talking to your heart imprints your subconscious with what you want.</small></div>
  <h2><small>The Steps</small>How To <em>Do It</em></h2>
  %s
  <div class="eyes"><i>5</i><div><strong>Carry On With Your Day</strong><span>Open your eyes and carry on with your day.</span></div></div>
  <h2><small>Present Tense</small>Say It Like <em>You Already Have It</em></h2>
  <div class="vs"><div class="no"><b>Not like this</b>&ldquo;I want to meet someone who loves me.&rdquo;</div><div class="yes"><b>Like this</b>&ldquo;I have a partner who loves me unconditionally.&rdquo;</div></div>""" % _cards(d, [
        (4, 'Close Your Eyes', 'Close your eyes and bring your attention to your heart.'),
        (5, 'Hand Over Your Heart', 'Place your hand or two fingers over your heart.'),
        (6, 'Talk To Your Heart', 'Like a conversation. In the present tense, state what you already have. Keep your attention on your heart.'),
        (9, 'Let It Settle In You', 'No need to breathe in or out in any special way. Just let it settle.')])
    d['css'] += BONUS_CSS
    return d, 'Talk To The Heart', [page('The Heart Attractor Program &middot; Bonus Training', inner, 1, 1)]

def sheet_eys():
    d = deck('embody-your-symbol.html')
    b = d['slides']['2']; paper = b[b.index('<div class="paper">'):b.index('<div class="note">')]
    days = next(re.search(r'(<div class="days d3">.*)</div>\s*$', s, re.S).group(1) for s in d['slides'].values() if 'class="days d3"' in s)
    inner = """  <h1>Embody <em>Your Symbol</em></h1>
  <p class="lead">Keep your Emotional Resonance with you all day. Eyes open or closed.</p>
  <div class="big"><p>Recondition the feeling <em>without having to think about it.</em></p><small>Your symbol holds all of your intentions and the emotions you want to feel.</small></div>
  <h2><small>The Steps</small>How To <em>Do It</em></h2>
  %s
  <h2><small>Anywhere</small>Use It <em>Through Your Day</em></h2>
  %s
  <div class="rule"><b>Whenever you want the feeling,</b> wherever you are: feel your symbol in the centre of your chest and let it melt into you.</div>""" % (_cards(d, [
        (4, 'Your Chest', 'Imagine your symbol, the letter R. Feel it right in the centre of your chest.'),
        (5, 'Attention On It', 'Bring your attention to your symbol and keep it there.'),
        (6, 'Melt Into You', 'It brings back the feeling and all your intentions. No need to think about them.')], 'c3 big3'), days)
    d['css'] += BONUS_CSS
    return d, 'Embody Your Symbol', [page('The Heart Attractor Program &middot; Bonus Training', inner, 1, 1)]

SHEETS = {'2': sheet2, '3': sheet3, '4': sheet4, '6': sheet6, 'tth': sheet_tth, 'eys': sheet_eys}
for key in (sys.argv[1:] or ['2', '3', '4', '6']):   # bonus sheets: python build_worksheets.py tth eys
    d, title, pages = SHEETS[key]()
    slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    out = os.path.join(HERE, 'pdfs', slug + '-exercise-sheet.html')
    html = ('<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n'
            '<title>' + title + ': Exercise Sheet</title>\n' + d['fonts'] + '\n<style>' + d['css'] + WS_CSS + '</style></head>\n<body>\n'
            + '\n'.join(pages) + '\n</body></html>\n')
    open(out, 'w', encoding='utf-8').write(html)
    subprocess.run(['node', EXPORT, out, out[:-5] + '.pdf'], check=True, stdout=subprocess.DEVNULL)
    print('sheet %s: %d page(s) -> %s' % (key, len(pages), out[:-5] + '.pdf'))
