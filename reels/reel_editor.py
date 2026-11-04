"""Reel editor: raw iPhone clip -> finished Reel in Olly's style.

What it does (and nothing else; the middle of the video is never cut):
  1. Trims the start (just before the first word) and the end (just after the last word).
  2. Hook = the first spoken sentence, as a 2-line white box with a red heart, while he says it.
  3. Captions: white rounded box, bold black text, a few words at a time, ~y=289 on 1080x1920.
  4. Highlights in green (#10D05D): "intellectualization" / "emotional resonance" on their own
     caption when the term is named ("called X") or said as its own sentence; "feeling" after DM/comment.

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
CTA_WORDS = {"feeling"}  # green when right after DM / comment


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
    """First moment of real voice within ±0.7s of whisper's first word."""
    hop = int(sr * 0.01)
    a, b = max(0, int((near - 0.7) * sr)), int((near + 0.5) * sr)
    seg = audio[a:b]
    rms = np.sqrt(np.convolve(seg ** 2, np.ones(hop) / hop, "same"))[::hop]
    thr = max(0.02, rms.max() * 0.12)
    idx = np.argmax(rms > thr)
    return max(0.0, (a / sr) + idx * 0.01 - 0.06)


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
    for term in TERMS:
        tw = term.split()
        for j in range(len(rest) - len(tw) + 1):
            if low[j:j + len(tw)] != tw:
                continue
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
            caps.append([("solo", rest[j:j + solo[j]])])
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

    out = []
    for c in caps:
        if isinstance(c[0], tuple):
            ws = c[0][1]
            parts = [(clean(" ".join(x["w"] for x in ws)).rstrip(",").lower(), True)]
        else:
            ws = c
            parts = []
            for k, x in enumerate(ws):
                t = clean(x["w"]) if k == len(ws) - 1 else x["w"]
                prevw = re.sub(r"[^a-z]", "", ws[k - 1]["w"].lower()) if k else ""
                g = re.sub(r"[^a-z]", "", x["w"].lower()) in CTA_WORDS and prevw in ("dm", "comment")
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


def draw_line(canvas, y, parts, heart=False, box=True, text=True):
    """One caption line centred at y (box top). parts = [(text, green)]."""
    d = ImageDraw.Draw(canvas)
    sp = text_w(" ")
    tw = sum(text_w(t) for t, _ in parts) + sp * (len(parts) - 1)
    hw = 0
    if heart:
        heart_im = emoji_img(heart if isinstance(heart, str) else "\u2764\ufe0f", 46)
        hw = sp + heart_im.width
    bw = tw + hw + PAD_X * 2
    x0 = (W - bw) / 2
    if box:
        d.rounded_rectangle([x0, y, x0 + bw, y + BOX_H], RADIUS, fill="white")
    if not text:
        return x0, bw
    asc, desc = F.getmetrics()
    ty = y + BOX_H / 2 - (asc + desc) / 2 + 4
    x = x0 + PAD_X
    for t, g in parts:
        d.text((x, ty), t, font=F, fill=GREEN if g else "black")
        x += text_w(t) + sp
    if heart:
        canvas.alpha_composite(heart_im, (int(x), int(y + BOX_H / 2 - heart_im.height / 2 + 2)))
    return x0, bw


def caption_png(parts, path):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw_line(im, BOX_TOP, parts)
    im.crop((0, STRIP_Y, W, STRIP_Y + STRIP_H)).save(path)


def hook_png(text, path):
    words = text.replace("'", "’").split()
    best = 1  # fill line 1 like Instagram does (greedy, max ~760px of text)
    while best < len(words) - 1 and text_w(" ".join(words[:best + 1])) <= 760:
        best += 1
    l1, l2 = " ".join(words[:best]), " ".join(words[best:])
    # end emoji, as on Olly's posted Reels: test tube when the hook says "scientifically"/"science", else red heart
    emo = "\U0001F9EA" if re.search(r"scien", text, re.I) else "❤️"
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    step = 75
    for box, text in ((True, False), (False, True)):
        draw_line(im, BOX_TOP - 4, [(l1, False)], box=box, text=text)
        draw_line(im, BOX_TOP - 4 + step, [(l2, False)], heart=emo, box=box, text=text)
    im.crop((0, STRIP_Y, W, STRIP_Y + STRIP_H)).save(path)


# ---------- main ----------
def encoder():
    """Intel Quick Sync if this PC has it, else software x264."""
    try:
        run(["ffmpeg", "-f", "lavfi", "-i", "color=c=black:s=256x256:d=0.2", "-c:v", "h264_qsv", "-f", "null", "-"])
        return ["-c:v", "h264_qsv", "-global_quality", "20", "-preset", "medium"]
    except subprocess.CalledProcessError:
        return ["-c:v", "libx264", "-preset", "veryfast", "-crf", "18"]


def main(src, out):
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
    t0 = speech_onset(audio, 16000, words[0]["s"])
    t1 = min(dur, words[-1]["e"] + 0.35)
    for w in words:
        w["s"] -= t0; w["e"] -= t0
    for w in words:
        w["s"] = max(0.0, w["s"])
    length = t1 - t0
    hook, caps = plan(words)
    json.dump({"trim": [t0, t1], "hook": hook, "captions": caps}, open(out + ".plan.json", "w"), indent=1)

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

    run(["ffmpeg", "-y", "-ss", f"{t0:.3f}", "-t", f"{length:.3f}", "-i", src,
         "-f", "concat", "-safe", "0", "-i", lst,
         "-filter_complex", f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps=30[v];"
                            f"[1:v]fps=30,format=rgba[c];[v][c]overlay=0:{STRIP_Y}:shortest=0:eof_action=pass,format=nv12[o]",
         "-map", "[o]", "-map", "0:a", "-t", f"{length:.3f}",
         *ENC, "-c:a", "aac", "-b:a", "192k",
         "-movflags", "+faststart", out])
    print(f"done: {out}  trim {t0:.2f}s -> {t1:.2f}s  hook '{hook[0]}'  {len(caps)} captions")


if __name__ == "__main__":
    src = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.splitext(src)[0] + " - edited.mp4"
    main(src, out)
