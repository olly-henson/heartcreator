"""Reel editor: raw iPhone clip -> finished Reel in Olly's style.

What it does (and nothing else; the middle of the video is never cut):
  1. Trims the start (just before the first word) and the end (just after the last word).
  2. Hook = the first spoken sentence, as a 2-line white box with a red heart, while he says it.
  3. Captions: white rounded box, bold black text, a few words at a time, ~y=289 on 1080x1920.
  4. Highlights in green (#10D05D): "intellectualization" / "emotional resonance" on their own
     caption when the term is named ("called X") or said as its own sentence; "feeling" after DM/comment (up to 5 words before it).

Usage:  py reel_editor.py <raw video> [<output.mp4>]
Needs:  ffmpeg on PATH, pip faster-whisper pillow numpy
"""
import json, os, re, subprocess, sys, tempfile, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(HERE, "fonts", "Figtree.ttf")
EMOJI = "C:/Windows/Fonts/seguiemj.ttf"
W, H = 1080, 1920
BOX_TOP = 289          # caption box top (px)
BOX_H = 120            # single-line caption box height
PAD_X = 24             # text inset from box edge
RADIUS = 18
STRIP_Y, STRIP_H = 240, 320   # captions only ever sit in this band; overlay just this strip (much faster)
FONT_PX = 66
WEIGHT = 850
GREEN = (16, 208, 93)
MAX_CHARS = 22         # caption chunk length
PAUSE_SPLIT = 0.35     # a pause this long starts a new caption
HIDE_GAP = 0.6         # a pause this long hides the caption
TERMS = ["intellectualization", "emotional resonance"]
CTA_WORDS = {"feeling", "emotion", "video", "attract", "scale"}  # keywords: green when comment / DM / message is up to 3 words before


def font(px):
    f = ImageFont.truetype(FONT, px)
    vals = []
    for a in f.get_variation_axes():
        vals.append(WEIGHT if "eight" in str(a["name"]) else a["default"])
    f.set_variation_by_axes(vals)
    return f


F = font(FONT_PX)
FE = ImageFont.truetype(EMOJI, 109)  # Segoe emoji only renders at 109px; scaled down after


# ---------- audio + transcript ----------
def run(cmd):
    # no console window pops up for ffmpeg when the upload server runs hidden
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
                   creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))


def load_wav(p):
    w = wave.open(p)
    return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768


def transcribe(audio):
    from faster_whisper import WhisperModel
    m = WhisperModel("small.en", device="cpu", compute_type="int8")
    def run_once(**kw):
        segs, _ = m.transcribe(audio, word_timestamps=True, **kw)
        return [{"w": w.word.strip(), "s": float(w.start), "e": float(w.end)} for s in segs for w in s.words]
    words = run_once()
    # small.en sometimes returns lowercase text with no punctuation, which breaks hook + caption splitting.
    # A punctuated prompt reliably brings the punctuation back, so retry once with it.
    if words and sum(bool(re.search(r"[.!?]$", w["w"])) for w in words) < max(1, len(words) // 60):
        words = run_once(initial_prompt="Hello. You don't need a plan to find your person. Here's what you need instead.")
    return words


def speech_onset(audio, sr, near):
    """First moment of real voice near whisper's first word, measured against THIS clip's background noise.
    (2026-11-04: outdoors the wind/traffic sat above the old fixed level, so 1s of noise was kept before the hook.
    Olly: the hook must be heard the instant the video starts.) Needs 60ms above the level, so a click or gust
    isn't taken for speech; starts 50ms before it so the first consonant isn't clipped."""
    hop = int(sr * 0.01)
    a, b = max(0, int((near - 1.5) * sr)), int((near + 0.6) * sr)
    seg = audio[a:b]
    rms = np.sqrt(np.convolve(seg ** 2, np.ones(hop) / hop, "same"))[::hop]
    noise, peak = np.percentile(rms, 20), rms.max()
    thr = max(0.02, noise * 3, noise + (peak - noise) * 0.25)
    above = rms > thr
    for k in range(len(above) - 6):
        if above[k:k + 6].all():
            return max(0.0, a / sr + k * 0.01 - 0.05)
    return max(0.0, near - 0.1)


# ---------- caption plan ----------
def clean(t):
    return re.sub(r"[.!?]+$", "", t)


def plan(words):
    """Returns hook (text, start, end) and a list of captions [{'parts':[(text,green)], 's','e'}]."""
    # hook = first sentence
    i = 0
    while i < len(words) and not re.search(r"[.!?]$", words[i]["w"]):
        i += 1
    i = min(i, len(words) - 1)
    if i > 13:  # no sentence end found early (missing punctuation): cut at the longest pause in words 4-14
        i = max(range(3, min(14, len(words) - 1)), key=lambda k: words[k + 1]["s"] - words[k]["e"])
    hook_words = words[: i + 1]
    hook_words[0] = dict(hook_words[0], w=hook_words[0]["w"][:1].upper() + hook_words[0]["w"][1:])
    hook = (" ".join(clean(w["w"]).rstrip(",;:") if k == len(hook_words) - 1 else w["w"] for k, w in enumerate(hook_words)),
            0.0, words[i + 1]["s"] if i + 1 < len(words) else words[i]["e"])
    rest = words[i + 1:]

    # mark terms that get their own green caption
    low = [re.sub(r"[^a-z]", "", w["w"].lower()) for w in rest]
    solo = {}  # start index -> length
    terms_at = {}  # start index -> the term in Olly's spelling (US z: "intellectualization")
    zs = lambda ws: [x.replace("z", "s") for x in ws]  # whisper writes "intellectualisation" too (2026-11-04)
    for term in TERMS:
        tw = term.split()
        for j in range(len(rest) - len(tw) + 1):
            if zs(low[j:j + len(tw)]) != zs(tw):
                continue
            terms_at[j] = term
            prev = rest[j - 1]["w"] if j else "."
            named = low[j - 1] == "called" if j else False
            own_sentence = re.search(r"[.!?]$", prev) and re.search(r"[.!?]$", rest[j + len(tw) - 1]["w"])
            if named or own_sentence:
                solo[j] = len(tw)

    caps, cur = [], []

    def flush():
        if cur:
            caps.append(list(cur))
            cur.clear()

    j = 0
    while j < len(rest):
        if j in solo:
            flush()
            caps.append([(terms_at[j], rest[j:j + solo[j]])])
            j += solo[j]
            continue
        w = rest[j]
        text = " ".join(x["w"] for x in cur + [w])
        if cur and (len(text) > MAX_CHARS or w["s"] - cur[-1]["e"] > PAUSE_SPLIT):
            flush()
        cur.append(w)
        if re.search(r"[.!?]$", w["w"]):
            flush()
        j += 1
    flush()

    # Keyword CTA words go green when "comment" / "DM" / "message" came up to 3 words before, across caption boxes
    # (2026-11-04: "just comment | feeling" split over two boxes, and "DM me feeling" has a word between, so neither went green)
    green = set()
    for j, x in enumerate(rest):
        # 5 words back (Olly 2026-11-05): "send me a DM with the word feeling" has DM 4 words before the keyword, so the
        # DM keyword wasn't green while the comment one was. Both must always be highlighted.
        if low[j] in CTA_WORDS and any(low[k] in ("dm", "dms", "comment", "message") for k in range(max(0, j - 5), j)):
            green.add(id(x))
    # Every mention of a TERM is green too (Olly 2026-11-04: "always highlighted even if mentioned more than once"):
    # "something called X" / its own sentence gets its own caption box (solo, above); any other mention is green in line
    for j, term in terms_at.items():
        for x in rest[j:j + len(term.split())]:
            green.add(id(x))

    out = []
    for c in caps:
        if isinstance(c[0], tuple):
            ws = c[0][1]
            parts = [(c[0][0], True)]   # the term in Olly's spelling, not whisper's
        else:
            ws = c
            parts = []
            for k, x in enumerate(ws):
                t = clean(x["w"]) if k == len(ws) - 1 else x["w"]
                g = id(x) in green
                if g:
                    t = t.rstrip(",")
                    t = re.sub(r"(?i)intellectualisation", lambda m: m.group(0).replace("s", "z").replace("S", "Z"), t)  # Olly's US spelling
                if g and parts:
                    parts[-1] = (parts[-1][0].rstrip(","), parts[-1][1])
                parts.append((t, g))
        out.append({"parts": parts, "s": ws[0]["s"], "e": ws[-1]["e"]})
    return hook, out


# ---------- drawing ----------
def text_w(t):
    return F.getlength(t)


def emoji_img(ch, size):
    im = Image.new("RGBA", (140, 140), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((0, 0), ch, font=FE, embedded_color=True)
    im = im.crop(im.getbbox())
    r = size / im.height
    return im.resize((int(im.width * r), size), Image.LANCZOS)


def draw_line(canvas, y, parts, heart=False, box=True, text=True, f=None):
    """One caption line centred at y (box top). parts = [(text, green)]. f = a smaller font for a long hook."""
    f = f or F
    tw_ = lambda t: f.getlength(t)
    d = ImageDraw.Draw(canvas)
    sp = tw_(" ")
    tw = sum(tw_(t) for t, _ in parts) + sp * (len(parts) - 1)
    hw = 0
    if heart:
        heart_im = emoji_img(heart if isinstance(heart, str) else "\u2764\ufe0f", round(46 * f.size / FONT_PX))
        hw = sp + heart_im.width
    bw = tw + hw + PAD_X * 2
    x0 = (W - bw) / 2
    if box:
        d.rounded_rectangle([x0, y, x0 + bw, y + BOX_H], RADIUS, fill="white")
    if not text:
        return x0, bw
    asc, desc = f.getmetrics()
    ty = y + BOX_H / 2 - (asc + desc) / 2 + 4
    x = x0 + PAD_X
    for t, g in parts:
        d.text((x, ty), t, font=f, fill=GREEN if g else "black")
        x += tw_(t) + sp
    if heart:
        canvas.alpha_composite(heart_im, (int(x), int(y + BOX_H / 2 - heart_im.height / 2 + 2)))
    return x0, bw


def caption_png(parts, path):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw_line(im, BOX_TOP, parts)
    im.crop((0, STRIP_Y, W, STRIP_Y + STRIP_H)).save(path)


MAX_LEN = 179.0     # every Reel fits YouTube Shorts + Instagram Reels (3:00) with a second spare (Olly 2026-11-04)
KEEP_PAUSE = 0.25   # a shortened pause keeps this much silence


def fit_length(words, length):
    """Over MAX_LEN: shorten the longest pauses (never words; not in the first 4s = the hook, nor the last 8s = the CTA)
    down to KEEP_PAUSE, longest first, only until it fits. Still over: a tiny even speed-up. Returns (keep segments, speed)
    or (None, 1.0) when it already fits. Olly: "always make sure it's cut within the time limit ... even a 'tiny' cut"."""
    if length <= MAX_LEN:
        return None, 1.0
    need = length - MAX_LEN + 0.05
    gaps = sorted(((words[i + 1]["s"] - words[i]["e"], i) for i in range(len(words) - 1)
                   if words[i]["e"] > 4.0 and words[i + 1]["s"] < length - 8), reverse=True)
    cuts = []
    for g, i in gaps:
        if need <= 0 or g <= KEEP_PAUSE + 0.05:
            break
        rem = min(g - KEEP_PAUSE, need)
        a = words[i]["e"] + KEEP_PAUSE / 2
        cuts.append((a, a + rem))
        need -= rem
    keep, t = [], 0.0
    for a, b in sorted(cuts):
        keep.append((t, a))
        t = b
    keep.append((t, length))
    return keep, max(1.0, sum(b - a for a, b in keep) / MAX_LEN)


def remap(t, keep, speed):
    """A time on the original timeline -> the shortened one (a time inside a cut snaps to the cut)."""
    out = 0.0
    for a, b in keep:
        if t < a:
            return out / speed
        if t <= b:
            return (out + t - a) / speed
        out += b - a
    return out / speed


def merge_hook(spoken, calendar):
    """On-screen hook = the words he actually said (he sometimes skips or adds a word), but each word the transcript
    heard slightly differently ("While" for "Why") takes the calendar's spelling, and the calendar's end emoji is kept.
    Olly 2026-11-04: "the hook always needs to default to what's said in the video ... sometimes I miss a word"."""
    import difflib
    own = END_EMOJI.search(calendar)
    emo = own.group(1) if own else ""
    cal_text = calendar[:own.start()].rstrip() if own else calendar.strip()
    sw, cw = spoken.split(), cal_text.split()
    key = lambda w: re.sub(r"[^a-z0-9]", "", w.lower().replace("’", "'"))
    out = []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, [key(w) for w in sw], [key(w) for w in cw], autojunk=False).get_opcodes():
        if op == "equal":
            out += cw[j1:j2]
        elif op == "replace" and i2 - i1 == j2 - j1:
            out += [c if difflib.SequenceMatcher(None, key(s), key(c)).ratio() >= 0.5 else s for s, c in zip(sw[i1:i2], cw[j1:j2])]
        elif op in ("replace", "delete"):
            out += sw[i1:i2]   # extra / different words he said stay ("delete" = only in the spoken words)
        # "insert" = calendar words he didn't say: left out
    text = " ".join(out).strip().rstrip(",;:.-–— ")
    text = text[:1].upper() + text[1:]
    return text + (" " + emo if emo else "")


END_EMOJI = re.compile(r"\s*((?:[☀-➿\U0001F000-\U0001FAFF][️‍]?)+)\s*$")


def hook_png(text, path):
    # a calendar hook can carry its own end emoji (Olly 2026-11-04: the emoji drives the first-3-second click):
    # use it as the box's end emoji instead of the default rule below
    own = END_EMOJI.search(text)
    if own:
        text = text[:own.start()].rstrip()
    words = text.replace("'", "’").split()
    lines, f = hook_fit(words)
    # end emoji, as on Olly's posted Reels: test tube when the hook says "scientifically"/"science", else red heart
    emo = own.group(1) if own else "🧪" if re.search(r"scien", text, re.I) else "❤️"
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    step = 75
    for box, text in ((True, False), (False, True)):
        for n, ln in enumerate(lines):
            draw_line(im, BOX_TOP - 4 + step * n, [(ln, False)], heart=emo if n == len(lines) - 1 else False, box=box, text=text, f=f)
    im.crop((0, STRIP_Y, W, STRIP_Y + STRIP_H)).save(path)


HOOK_MAX = 780   # widest hook line incl. the end emoji. Instagram/TikTok crop ~100px off each side on tall phones
                 # (Olly 2026-11-04: 940 sat "right tight on the edge"), so the box keeps ~125px clear of each edge
HOOK_MIN_PX = 54  # a long hook's text may shrink to this (from 66) to stay two lines inside the safe width


def hook_lines(words, f=None):
    """ALWAYS two lines (Olly 2026-11-04: three starts covering his head). Returns (lines, is_pyramid, fits).
    Inverted pyramid where it fits: top line at least as wide as the bottom one (which counts its end emoji), both
    within HOOK_MAX, most balanced split wins. Else the fitting split with the least extra width at the bottom."""
    f = f or F
    ew = f.getlength(" ") + 46 * f.size / FONT_PX   # the end emoji
    wd = lambda ws, last: f.getlength(" ".join(ws)) + (ew if last else 0)
    if len(words) < 2:
        return [" ".join(words)], True, wd(words, True) <= HOOK_MAX
    best, near = None, None
    for k in range(1, len(words)):
        a, b = wd(words[:k], False), wd(words[k:], True)
        if a > HOOK_MAX or b > HOOK_MAX:
            continue
        if a >= b and (best is None or a - b < best[0]):
            best = (a - b, k)
        if near is None or b - a < near[0]:
            near = (b - a, k)
    k = (best or near or (0, len(words) // 2))[1]
    return [" ".join(words[:k]), " ".join(words[k:])], best is not None, (best or near) is not None


def hook_fit(words):
    """Full size if a two-line pyramid fits; otherwise shrink the text a step at a time (to HOOK_MIN_PX) until one does.
    No pyramid at any size: the largest size where two lines fit at all (same idea as Olly squeezing it by hand)."""
    fallback = None
    for px in range(FONT_PX, HOOK_MIN_PX - 1, -2):
        f = F if px == FONT_PX else font(px)
        lines, pyramid, fits = hook_lines(words, f)
        if pyramid:
            return lines, f
        if fits and fallback is None:
            fallback = (lines, f)
    return fallback or (lines, f)


# ---------- main ----------
def encoder():
    """Intel Quick Sync if this PC has it, else software x264."""
    try:
        run(["ffmpeg", "-f", "lavfi", "-i", "color=c=black:s=256x256:d=0.2", "-c:v", "h264_qsv", "-f", "null", "-"])
        return ["-c:v", "h264_qsv", "-global_quality", "20", "-preset", "medium"]
    except subprocess.CalledProcessError:
        return ["-c:v", "libx264", "-preset", "veryfast", "-crf", "18"]


def main(src, out, hook_text=None, words_only=False):
    ENC = encoder()
    tmp = tempfile.mkdtemp(prefix="reel_")
    wav = os.path.join(tmp, "a.wav")
    run(["ffmpeg", "-y", "-i", src, "-vn", "-ac", "1", "-ar", "16000", wav])
    audio = load_wav(wav)
    dur = len(audio) / 16000
    cache = os.path.splitext(src)[0] + ".words.json"
    if os.path.exists(cache):
        words = json.load(open(cache))
    else:
        words = transcribe(audio)
        json.dump(words, open(cache, "w"))
    if not words:
        sys.exit("No speech found")
    if words_only:  # upload_server.py matches the video to a Hub calendar hook from its opening words
        print("FIRSTWORDS " + json.dumps(" ".join(w["w"] for w in words[:30])))
        return
    t0 = speech_onset(audio, 16000, words[0]["s"])
    t1 = min(dur, words[-1]["e"] + 0.35)
    for w in words:
        w["s"] -= t0; w["e"] -= t0
    for w in words:
        w["s"] = max(0.0, w["s"])
    length = t1 - t0
    src_len = length
    keep, speed = fit_length(words, length)
    if keep:  # over the limit: words move to the shortened timeline so captions stay in sync
        for w in words:
            w["s"], w["e"] = remap(w["s"], keep, speed), remap(w["e"], keep, speed)
        length = sum(b - a for a, b in keep) / speed
        print(f"fit to {MAX_LEN}s: {src_len:.2f}s -> {length:.2f}s ({len(keep) - 1} pauses shortened, speed x{speed:.3f})")
    hook, caps = plan(words)
    if hook_text:  # what he SAID, spelled like the calendar where it's the same word (Olly 2026-11-04), + calendar emoji
        hook = (merge_hook(hook[0], hook_text), hook[1], hook[2])
    json.dump({"trim": [t0, t1], "length": length, "speed": speed, "hook": hook, "captions": caps}, open(out + ".plan.json", "w"), indent=1)

    blank = os.path.join(tmp, "blank.png")
    Image.new("RGBA", (W, STRIP_H), (0, 0, 0, 0)).save(blank)
    hp = os.path.join(tmp, "hook.png")
    hook_png(hook[0], hp)
    timeline = [(hp, 0.0, hook[2])]
    for k, c in enumerate(caps):
        nxt = caps[k + 1]["s"] if k + 1 < len(caps) else length
        end = nxt if nxt - c["e"] < HIDE_GAP else c["e"] + 0.2
        p = os.path.join(tmp, f"c{k:04d}.png")
        caption_png(c["parts"], p)
        timeline.append((p, max(c["s"], timeline[-1][2] if timeline else 0), min(end, length)))

    lines, t = ["ffconcat version 1.0"], 0.0
    for p, s, e in timeline:
        if s > t + 0.01:
            lines += [f"file '{blank}'", f"duration {s - t:.3f}"]
            t = s
        if e > t:
            lines += [f"file '{p}'", f"duration {e - t:.3f}"]
            t = e
    lines += [f"file '{blank}'", f"duration {max(0.1, length - t):.3f}", f"file '{blank}'"]
    lst = os.path.join(tmp, "caps.ffconcat")
    open(lst, "w").write("\n".join(l.replace("\\", "/") for l in lines))

    pre, vin, ain = "", "[0:v]", "0:a"
    if keep:  # keep-segments joined back together (+ a tiny speed-up only if the pauses weren't enough)
        for i, (a, b) in enumerate(keep):
            pre += (f"[0:v]trim=start={a:.3f}:end={b:.3f},setpts=PTS-STARTPTS[v{i}];"
                    f"[0:a]atrim=start={a:.3f}:end={b:.3f},asetpts=PTS-STARTPTS[a{i}];")
        pre += "".join(f"[v{i}][a{i}]" for i in range(len(keep))) + f"concat=n={len(keep)}:v=1:a=1[vk][ak];"
        if speed > 1.0005:
            pre += f"[vk]setpts=PTS/{speed:.5f}[vs];[ak]atempo={speed:.5f}[as];"
            vin, ain = "[vs]", "[as]"
        else:
            vin, ain = "[vk]", "[ak]"
    run(["ffmpeg", "-y", "-ss", f"{t0:.3f}", "-t", f"{src_len:.3f}", "-i", src,
         "-f", "concat", "-safe", "0", "-i", lst,
         "-filter_complex", pre + f"{vin}scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps=30[v];"
                            f"[1:v]fps=30,format=rgba[c];[v][c]overlay=0:{STRIP_Y}:shortest=0:eof_action=pass,format=nv12[o]",
         "-map", "[o]", "-map", ain, "-t", f"{length:.3f}",
         *ENC, "-c:a", "aac", "-b:a", "192k",
         "-movflags", "+faststart", out])
    print(f"done: {out}  trim {t0:.2f}s -> {t1:.2f}s  hook '{hook[0]}'  {len(caps)} captions")


if __name__ == "__main__":
    for _s in (sys.stdout, sys.stderr):  # emoji in calendar hooks: Windows' cp1252 console encoding crashed the final print
        try:
            _s.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
    # reel_editor.py RAW [OUT] [--hook "calendar hook"] [--words-only]
    args, hook_text, words_only = [], None, False
    a = sys.argv[1:]
    while a:
        x = a.pop(0)
        if x == "--hook":
            hook_text = a.pop(0)
        elif x == "--words-only":
            words_only = True
        else:
            args.append(x)
    src = args[0]
    out = args[1] if len(args) > 1 else os.path.splitext(src)[0] + " - edited.mp4"
    main(src, out, hook_text, words_only)
