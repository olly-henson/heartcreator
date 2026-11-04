"""Best stills from Olly's Instagram Reels for the Carousel maker (2026-10-30).

Usage: python tools/reel_stills.py CODE:MODE [CODE:MODE ...]
  MODE = bottom (captions low on the screen, Sep 1-20 Reels) or top (caption box above his head, Sep 21 on).
Downloads the 1080p video, takes 48 candidate frames (after the hook), crops out the burned-in captions to 3:4,
keeps the 12 best (both eyes open, sharp, spread through the video) and writes
marketing/reel-stills/<code>/01.jpg..12.jpg + thumb.jpg, then rebuilds marketing/reel-stills/manifest.json.
The video is deleted afterwards (they're 60-200 MB each).
"""
import sys, os, json, glob, subprocess, pathlib, csv
import cv2, numpy as np

ROOT = pathlib.Path(r"C:\Users\Olly\AI OS\heartattractor\marketing")
OUT, HQ = ROOT / "reel-stills", ROOT / "reel-stats" / "hq"
CROP = {"bottom": (54, 0, 972, 1296), "top": (48, 608, 984, 1312)}  # x, y, w, h on a 1080x1920 frame
face_cc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
eye_cc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")

def stats():
    out = {}
    for f in glob.glob(str(ROOT / "reel-stats" / "*.csv")):
        for r in csv.DictReader(open(f, encoding="utf-8-sig")):
            m, d, y = r["Publish time"][:10].split("/")
            out[r["Permalink"].rstrip("/").split("/")[-1]] = {"date": f"{y}-{m}-{d}", "views": int(r["Views"] or 0)}
    return out

def score(img):
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cc.detectMultiScale(g, 1.1, 5, minSize=(200, 200))
    if not len(faces): return -1
    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
    top = g[y:y + h // 2, x:x + w]
    eyes = eye_cc.detectMultiScale(top, 1.1, 6, minSize=(w // 10, w // 10))
    sharp = cv2.Laplacian(g[y:y + h, x:x + w], cv2.CV_64F).var()
    return (100 if len(eyes) >= 2 else 0) + min(sharp, 400) / 4

def run(code, mode):
    vid = HQ / f"{code}.mp4"
    HQ.mkdir(parents=True, exist_ok=True)
    if not vid.exists():
        subprocess.run([sys.executable, "-m", "yt_dlp", "-q", "--no-warnings", "-f", "bv*[height=1920]/bv*", "-o", str(HQ / f"{code}.%(ext)s"),
                        f"https://www.instagram.com/reel/{code}/"], check=True)
    cap = cv2.VideoCapture(str(vid)); fps = cap.get(cv2.CAP_PROP_FPS) or 30; n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    x, y, w, h = CROP[mode]; cands = []
    for k in range(48):
        t = 8 + (n / fps - 13) * k / 47
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000); ok, fr = cap.read()
        if not ok: continue
        if fr.shape[1] != 1080: fr = cv2.resize(fr, (1080, int(fr.shape[0] * 1080 / fr.shape[1])))
        im = cv2.resize(fr[y:y + h, x:x + w], (810, 1080), interpolation=cv2.INTER_AREA)
        cands.append((score(im), k, im))
    cap.release()
    keep = []
    for s, k, im in sorted(cands, key=lambda c: -c[0]):
        if s < 0 or any(abs(k - k2) < 3 for _, k2, _ in keep): continue
        keep.append((s, k, im))
        if len(keep) == 12: break
    keep.sort(key=lambda c: c[1])
    d = OUT / code; d.mkdir(parents=True, exist_ok=True)
    for f in d.glob("*.jpg"): f.unlink()
    for i, (_, _, im) in enumerate(keep):
        cv2.imwrite(str(d / f"{i + 1:02d}.jpg"), im, [cv2.IMWRITE_JPEG_QUALITY, 82])
    best = max(keep, key=lambda c: c[0])[2]
    cv2.imwrite(str(d / "thumb.jpg"), cv2.resize(best, (240, 320), interpolation=cv2.INTER_AREA), [cv2.IMWRITE_JPEG_QUALITY, 80])
    vid.unlink()
    print(code, mode, len(keep), "stills")

def manifest():
    st = stats(); items = []
    for d in sorted(OUT.iterdir()):
        if not d.is_dir(): continue
        stills = sorted(p.name for p in d.glob("[0-9][0-9].jpg"))
        if stills: items.append({"code": d.name, **st.get(d.name, {}), "thumb": f"reel-stills/{d.name}/thumb.jpg", "stills": [f"reel-stills/{d.name}/{s}" for s in stills]})
    items.sort(key=lambda i: i.get("date", ""), reverse=True)
    (OUT / "manifest.json").write_text(json.dumps(items, indent=1), encoding="utf-8")
    print("manifest:", len(items), "Reels")

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for a in sys.argv[1:]:
        c, m = a.rsplit(":", 1); run(c, m)
    manifest()
