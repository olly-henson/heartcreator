"""Best cover still (Olly, 2026-11-10: "a rule that ... chooses the best photo/still of me with the hook. Some of the
expressions are a bit too awful").

Instagram's cover is the video's first frame and GHL can't set a cover (see skills_reel-editor.md). So:
  1. scan the raw clip between the trim points (every ~0.2 s),
  2. score Olly's expression on each frame,
  3. draw the best frame the way the editor does (1080x1920 crop) with the same hook box on top,
  4. make that the finished video's first frame. One frame (1/30 s) is invisible when the Reel plays.

Expression score: FER+ emotion model (models/emotion-ferplus-8.onnx, NOT in git (35 MB): download from
https://github.com/onnx/models/raw/main/validated/vision/body_analysis/emotion_ferplus/model/emotion-ferplus-8.onnx; runs on onnxruntime):
  happiness counts most, neutral is fine; sad / angry / disgust / contempt / fear count against, surprise a little.
  Eyes open (both eyes found by OpenCV; closed or mid-blink eyes aren't) is required for a good score, and a blurry
  face (motion) scores lower. A hand beside the face (skin colour) or movement since the last look scores lower. The first and last half second are skipped (reaching for the phone).

LOOKS v2 (Olly 2026-11-26: "choose the best looking position, the photo I look best in, with the hook above my head"):
  the FER+ score picked a mid-word frame (mouth open, eyelids half down) as "happy 0.91". The look is now read with
  MediaPipe's face landmarker (models/face_landmarker.task, 3.7 MB, NOT in git: download from
  https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task;
  pip install mediapipe): eyes fully open, mouth closed (not mid-word, no "oo"/"o" shapes), a smile, no worried brow
  or frown, looking into the lens, face straight on. Pass 1 scores every keyframe (~1 a second); pass 2 looks at 10
  frames a second around the 6 best moments and keeps the best of those. The cover's hook is placed from the chosen
  frame's own head, so it always sits above his head.

Usage: python cover_pick.py FINISHED.mp4 RAW.mov [--dry]   (writes FINISHED.mp4 in place; --dry only saves the still)
"""
import json, os, subprocess, sys, tempfile
import cv2
import numpy as np
import onnxruntime as ort
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import reel_editor as ed  # hook_png, W, H, STRIP_Y: the cover's hook is drawn exactly like the video's

CASC = cv2.data.haarcascades
FACE = cv2.CascadeClassifier(os.path.join(CASC, "haarcascade_frontalface_default.xml"))
EYES = cv2.CascadeClassifier(os.path.join(CASC, "haarcascade_eye_tree_eyeglasses.xml"))
FER = ort.InferenceSession(os.path.join(HERE, "models", "emotion-ferplus-8.onnx"))
FER_IN = FER.get_inputs()[0].name
import math
import mediapipe as mp
from mediapipe.tasks.python import vision as _mpv, BaseOptions as _mpBase
FL = _mpv.FaceLandmarker.create_from_options(_mpv.FaceLandmarkerOptions(
    base_options=_mpBase(model_asset_path=os.path.join(HERE, "models", "face_landmarker.task")),
    output_face_blendshapes=True, output_facial_transformation_matrixes=True, num_faces=1))
GAZE = ["eyeLookDownLeft", "eyeLookDownRight", "eyeLookUpLeft", "eyeLookUpRight", "eyeLookOutLeft", "eyeLookOutRight", "eyeLookInLeft", "eyeLookInRight"]


def looks(img):
    """How good he looks in this frame (higher = better), or None with no face. See LOOKS v2 above."""
    r = FL.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))))
    if not r.face_landmarks:
        return None, {}
    b = {c.category_name: c.score for c in r.face_blendshapes[0]}
    m = np.array(r.facial_transformation_matrixes[0])[:3, :3]
    pose = (math.degrees(math.atan2(-m[2, 0], math.hypot(m[0, 0], m[1, 0]))), math.degrees(math.atan2(m[2, 1], m[2, 2])), math.degrees(math.atan2(m[1, 0], m[0, 0])))
    blink = max(b["eyeBlinkLeft"], b["eyeBlinkRight"])
    smile = (b["mouthSmileLeft"] + b["mouthSmileRight"]) / 2
    gaze = max(b[k] for k in GAZE)
    s = (4.0 * smile                                   # a smile (closed or soft) is what looks best
         - 6.0 * max(0.0, blink - 0.12)                # eyes fully open; half-closed lids look tired
         - 6.0 * b["jawOpen"]                          # mouth open = caught mid-word
         - 4.0 * max(b["mouthFunnel"], b["mouthPucker"], b["mouthRollLower"] * 0.5)   # "oo" / "o" mouth shapes
         - 2.0 * b["browInnerUp"] - 2.0 * (b["mouthFrownLeft"] + b["mouthFrownRight"])  # worried / frowning
         - 2.5 * max(0.0, gaze - 0.3)                  # looking into the lens, not away
         - 0.1 * sum(max(0.0, abs(a) - 6) for a in pose))  # face straight on, not turned or tilted
    return float(s), {"blink": round(blink, 2), "smile": round(smile, 2), "jaw": round(b["jawOpen"], 2), "gaze": round(gaze, 2), "pose": [round(a) for a in pose]}
EMO = ["neutral", "happiness", "surprise", "sadness", "anger", "disgust", "fear", "contempt"]
STEP = 0.2  # seconds between frames looked at
# The template Reel (Olly 2026-11-16: "How to stop doubting that you'll meet someone", 64k views): covers are picked to
# match ITS expression, and the hook sits the same distance above his head as on it. Made by make_cover_template.py.
TPL_PATH = os.path.join(HERE, "reference", "cover_template.json")
TPL = json.load(open(TPL_PATH, encoding="utf-8")) if os.path.exists(TPL_PATH) else None
DY_MIN, DY_MAX = -50, 260
GAP_EXTRA = 30   # the face box sits lower on his hair than the template measure; this keeps the template's clear gap (checked on 2 Reels 2026-11-16)   # how far the hook may move: up 50px at most (Instagram's top bar), down to stay off his face


def frame_1080(img):
    """Same framing as the editor: scale to cover 1080x1920, centre crop."""
    h, w = img.shape[:2]
    k = max(ed.W / w, ed.H / h)
    img = cv2.resize(img, (round(w * k), round(h * k)), interpolation=cv2.INTER_AREA)
    h, w = img.shape[:2]
    x, y = (w - ed.W) // 2, (h - ed.H) // 2
    return img[y:y + ed.H, x:x + ed.W]


def score_frame(img, use_template=True):
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    small = cv2.resize(g, (g.shape[1] // 2, g.shape[0] // 2))
    faces = FACE.detectMultiScale(small, 1.1, 6, minSize=(small.shape[1] // 6, small.shape[1] // 6))
    if len(faces) == 0:
        return -99.0, {"face": 0}
    x, y, w, h = [int(v) * 2 for v in max(faces, key=lambda f: f[2] * f[3])]
    face = g[y:y + h, x:x + w]
    x64 = cv2.resize(face, (64, 64)).astype(np.float32).reshape(1, 1, 64, 64)
    raw = FER.run(None, {FER_IN: x64})[0][0]
    p = np.exp(raw - raw.max()); p /= p.sum()
    e = dict(zip(EMO, p.tolist()))
    eyes = EYES.detectMultiScale(face[: int(h * 0.55)], 1.1, 8, minSize=(w // 10, w // 10))
    sharp = cv2.Laplacian(face, cv2.CV_64F).var()
    lk, lki = looks(img)   # LOOKS v2 replaces the FER+ / template / eye-cascade score (FER+ kept for make_cover_template)
    if lk is None:
        return -99.0, {"face": 0}
    s = lk + min(0.4, sharp / 1500.0)
    # a hand in shot (Olly gestures a lot): skin-coloured pixels beside the face, from eye level down
    ycc = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    skin = cv2.inRange(ycc, (0, 135, 85), (255, 180, 135)) > 0
    cx, half = x + w // 2, int(w * 0.95)
    side = np.concatenate([skin[y + h // 3:, : max(0, cx - half)].ravel(), skin[y + h // 3:, cx + half:].ravel()])
    hand = float(side.mean()) if side.size else 0.0
    s -= min(4.0, hand * 25) + (4.0 if hand > 0.2 else 0.0)   # a hand clearly in shot (2026-11-16) almost rules a frame out   # 2026-11-16: raised from 2 so the expression bonus can't pick a frame with his hand up
    k = ed.H / img.shape[0]   # head position in the finished 1080x1920 frame
    info = {"face": 1, "emo": [round(v, 4) for v in p.tolist()], "head": round((y - 0.28 * h) * k, 1),   # top of his hair (checked on 4 clips 2026-11-16)
            "hand": round(hand, 3), "happy": round(e["happiness"], 2), "neutral": round(e["neutral"], 2),
            "negative": round(e["sadness"] + e["anger"] + e["disgust"] + e["contempt"] + e["fear"], 2),
            "eyes": int(min(len(eyes), 2)), "sharp": round(float(sharp)), **lki}
    return float(s), info


SCAN_W, SCAN_H = 540, 960  # frames are scored at half size (fast); the winner is pulled again at full size


def vf(w, h):
    return f"scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h}"  # the editor's framing


def pick(raw, t0, t1):
    """Speed (Olly 2026-11-10: "that takes way too long"): ffmpeg decodes ONLY the clip's keyframes (-skip_frame nokey,
    roughly one a second on an iPhone, a fraction of the decoding work), already framed 1080x1920. Each is scored on a
    half-size copy and the best full-size frame is kept as it is, so nothing is decoded twice."""
    start, end = t0 + 0.5, max(t0 + 0.6, t1 - 0.5)
    logf = tempfile.TemporaryFile()
    p = subprocess.Popen(["ffmpeg", "-v", "info", "-skip_frame", "nokey", "-ss", f"{start:.3f}", "-t", f"{end - start:.3f}", "-i", raw,
                          "-vf", "showinfo," + vf(ed.W, ed.H), "-fps_mode", "passthrough", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
                         stdout=subprocess.PIPE, stderr=logf, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
    cands = []
    size = ed.W * ed.H * 3
    best, n, prev, heads = None, 0, None, []
    while True:
        buf = p.stdout.read(size)
        if len(buf) < size:
            break
        full = np.frombuffer(buf, np.uint8).reshape(ed.H, ed.W, 3)
        f = cv2.resize(full, (SCAN_W, SCAN_H), interpolation=cv2.INTER_AREA)
        s, info = score_frame(f)
        if info.get("face"): heads.append((n, info["head"]))
        small = cv2.resize(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY), (108, 192)).astype(np.float32)
        if prev is not None:  # moving (a gesture, the phone shifting) between this look and the last one
            mv = float(np.abs(small - prev).mean())
            s -= min(1.5, mv / 10.0); info["move"] = round(mv, 1)
        prev = small
        cands.append((s, n))
        if best is None or s > best[0]:
            best = (s, n, full.copy(), info)  # n = which keyframe
        n += 1
    p.wait()
    logf.seek(0)
    import re as _re
    times = [start + float(x) for x in _re.findall(rb"pts_time:\s*([-0-9.]+)", logf.read())]
    if best is not None:
        best = refine(raw, start, end, cands, times, best)
    if best is not None:  # where his head usually is in this Reel (the median, so one lean doesn't move the hook)
        best[3]["head_med"] = round(float(np.median([h for _, h in heads])), 1) if heads else None
        # the hook only shows for the first few seconds: place it from where his head is THEN (first ~5 keyframes ≈ 5 s)
        early = [h for k, h in heads if k < 5]
        best[3]["head_hook"] = round(float(np.median(early)), 1) if early else best[3]["head_med"]
    return best


def refine(raw, start, end, cands, times, best, top=6, win=0.6, fps=10):
    """Pass 2: the best moments are rarely exactly on a keyframe. Look at 10 frames a second for 0.6 s either side of
    the 6 best keyframes (at least 2 apart) and keep the best frame found."""
    if len(times) < len(cands):
        print(f"cover: pass 2 skipped ({len(times)} times for {len(cands)} keyframes)"); return best
    chosen = []
    for s, k in sorted(cands, reverse=True):
        if s <= -99 or len(chosen) >= top: break
        if all(abs(k - c) >= 2 for c in chosen): chosen.append(k)
    size = ed.W * ed.H * 3
    for k in chosen:
        a = max(start, times[k] - win)
        p = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", f"{a:.3f}", "-t", f"{2 * win:.3f}", "-i", raw,
                              "-vf", f"fps={fps}," + vf(ed.W, ed.H), "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
                             stdout=subprocess.PIPE, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
        while True:
            buf = p.stdout.read(size)
            if len(buf) < size: break
            full = np.frombuffer(buf, np.uint8).reshape(ed.H, ed.W, 3)
            s, info = score_frame(cv2.resize(full, (SCAN_W, SCAN_H), interpolation=cv2.INTER_AREA))
            if s > best[0]:
                info["head_med"], info["head_hook"] = best[3].get("head_med"), best[3].get("head_hook")
                best = (s, k, full.copy(), info)
        p.wait()
    return best


def make_cover(raw, t0, t1, hook_text):
    """The cover still (best frame + hook) as a PNG path, or None. Used by reel_editor.py inside its one encode."""
    best = pick(raw, t0, t1)
    if not best or best[0] <= -99:
        print("cover: no face found, keeping the first frame"); return None, None
    s, n, frame, info = best
    if False:  # (2026-11-16) placement moved to reel_editor.place(), used for the hook AND the captions
        # Olly 2026-11-16: "a nice even symmetrical space between my head and the [top of the] reel": the hook block is
        # centred between the top of the video and the top of his head (block height = its lines), every Reel.
        import re as _re
        words = ed.END_EMOJI.sub("", hook_text).replace("'", "’").split()
        n = len(ed.hook_fit(words)[0]) if words else 1
        block_h = 75 * (n - 1) + 70
        top = (info["head_med"] - block_h) / 2
        top = max(60, min(top, info["head_med"] - block_h - 20))
        dy = int(round(top - (ed.BOX_TOP - 4)))
    info = {k: v for k, v in info.items() if k != "emo"}
    hh = info.get("head_hook")
    if info.get("head") and hh: hh = min(hh, info["head"])   # LOOKS v2: the hook clears his head on THIS frame
    hook_top = ed.place(hook_text, info.get("head_med"), hh)[0]
    print(f"cover: keyframe {n} score {s:.2f} hook top {hook_top}px {info}")
    return cover_image(frame, hook_text, os.path.join(tempfile.mkdtemp(prefix="cover_"), "cover.png"), hook_top), {"keyframe": n, "score": round(s, 2), "hook_top": hook_top, **info}


def cover_image(frame, hook_text, path, hook_top=None):
    tmp = tempfile.mkdtemp(prefix="cover_")
    hp = os.path.join(tmp, "hook.png")
    ed.hook_png(hook_text, hp, hook_top)
    base = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)).convert("RGBA")
    base.alpha_composite(Image.open(hp).convert("RGBA"), (0, ed.STRIP_Y))
    base.convert("RGB").save(path)
    return path


def apply(video, raw, dry=False):
    plan_path = video + ".plan.json"
    plan = json.load(open(plan_path, encoding="utf-8"))
    t0, t1 = plan["trim"]
    hook = plan["hook"][0]
    still, info = make_cover(raw, t0, t1, hook)
    if not still:
        return None
    if dry:
        return still
    out = video + ".covered.mp4"
    subprocess.run(["ffmpeg", "-y", "-i", video, "-i", still,
                    "-filter_complex", "[0:v][1:v]overlay=0:0:enable='lt(t,0.03)',format=nv12[o]",
                    "-map", "[o]", "-map", "0:a", *ed.encoder(), "-c:a", "copy", "-movflags", "+faststart", out],
                   check=True, capture_output=True)
    os.replace(out, video)
    if os.path.exists(video + ".cover.jpg"):  # ghl_poster makes a fresh one from the new first frame
        os.remove(video + ".cover.jpg")
    plan["cover"] = info
    json.dump(plan, open(plan_path, "w"), indent=1)
    return still


if __name__ == "__main__":
    a = [x for x in sys.argv[1:] if not x.startswith("--")]
    apply(a[0], a[1], dry="--dry" in sys.argv)
