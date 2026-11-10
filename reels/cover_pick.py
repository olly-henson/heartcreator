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
EMO = ["neutral", "happiness", "surprise", "sadness", "anger", "disgust", "fear", "contempt"]
STEP = 0.2  # seconds between frames looked at


def frame_1080(img):
    """Same framing as the editor: scale to cover 1080x1920, centre crop."""
    h, w = img.shape[:2]
    k = max(ed.W / w, ed.H / h)
    img = cv2.resize(img, (round(w * k), round(h * k)), interpolation=cv2.INTER_AREA)
    h, w = img.shape[:2]
    x, y = (w - ed.W) // 2, (h - ed.H) // 2
    return img[y:y + ed.H, x:x + ed.W]


def score_frame(img):
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
    s = (3.0 * e["happiness"] + 1.0 * e["neutral"] - 0.5 * e["surprise"]
         - 2.5 * (e["sadness"] + e["anger"] + e["disgust"] + e["contempt"] + e["fear"]))
    s += 0.8 if len(eyes) >= 2 else (-0.3 if len(eyes) == 1 else -1.5)
    s += min(0.4, sharp / 1500.0)
    # a hand in shot (Olly gestures a lot): skin-coloured pixels beside the face, from eye level down
    ycc = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    skin = cv2.inRange(ycc, (0, 135, 85), (255, 180, 135)) > 0
    cx, half = x + w // 2, int(w * 0.95)
    side = np.concatenate([skin[y + h // 3:, : max(0, cx - half)].ravel(), skin[y + h // 3:, cx + half:].ravel()])
    hand = float(side.mean()) if side.size else 0.0
    s -= min(2.0, hand * 25)
    info = {"hand": round(hand, 3), "happy": round(e["happiness"], 2), "neutral": round(e["neutral"], 2),
            "negative": round(e["sadness"] + e["anger"] + e["disgust"] + e["contempt"] + e["fear"], 2),
            "eyes": int(min(len(eyes), 2)), "sharp": round(float(sharp))}
    return float(s), info


SCAN_W, SCAN_H = 540, 960  # frames are scored at half size (fast); the winner is pulled again at full size


def vf(w, h):
    return f"scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h}"  # the editor's framing


def pick(raw, t0, t1):
    """Speed (Olly 2026-11-10: "that takes way too long"): ffmpeg decodes ONLY the clip's keyframes (-skip_frame nokey,
    roughly one a second on an iPhone, a fraction of the decoding work), already framed 1080x1920. Each is scored on a
    half-size copy and the best full-size frame is kept as it is, so nothing is decoded twice."""
    start, end = t0 + 0.5, max(t0 + 0.6, t1 - 0.5)
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-skip_frame", "nokey", "-ss", f"{start:.3f}", "-t", f"{end - start:.3f}", "-i", raw,
                          "-vf", vf(ed.W, ed.H), "-fps_mode", "passthrough", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
                         stdout=subprocess.PIPE, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
    size = ed.W * ed.H * 3
    best, n, prev = None, 0, None
    while True:
        buf = p.stdout.read(size)
        if len(buf) < size:
            break
        full = np.frombuffer(buf, np.uint8).reshape(ed.H, ed.W, 3)
        f = cv2.resize(full, (SCAN_W, SCAN_H), interpolation=cv2.INTER_AREA)
        s, info = score_frame(f)
        small = cv2.resize(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY), (108, 192)).astype(np.float32)
        if prev is not None:  # moving (a gesture, the phone shifting) between this look and the last one
            mv = float(np.abs(small - prev).mean())
            s -= min(1.5, mv / 10.0); info["move"] = round(mv, 1)
        prev = small
        if best is None or s > best[0]:
            best = (s, n, full.copy(), info)  # n = which keyframe
        n += 1
    p.wait()
    return best


def make_cover(raw, t0, t1, hook_text):
    """The cover still (best frame + hook) as a PNG path, or None. Used by reel_editor.py inside its one encode."""
    best = pick(raw, t0, t1)
    if not best or best[0] <= -99:
        print("cover: no face found, keeping the first frame"); return None, None
    s, n, frame, info = best
    print(f"cover: keyframe {n} score {s:.2f} {info}")
    return cover_image(frame, hook_text, os.path.join(tempfile.mkdtemp(prefix="cover_"), "cover.png")), {"keyframe": n, "score": round(s, 2), **info}


def cover_image(frame, hook_text, path):
    tmp = tempfile.mkdtemp(prefix="cover_")
    hp = os.path.join(tmp, "hook.png")
    ed.hook_png(hook_text, hp)
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
