"""GHL auto-poster for finished Reels (2026-11-04). Used by upload_server.py.

Olly approves a finished Reel on the upload page -> this books the next free posting slot, uploads the mp4 to the GHL
media library, and creates one scheduled Social Planner post per platform with that platform's own caption.

- Slots (Windhoek time, UTC+2, no daylight saving), filled in this order each day: 18:00, 19:30, 21:00 (his audience's
  peak), 08:00, then 23:30, 11:00, 13:30, 16:00, 05:00, 02:00. Max 6 a day (MAX_A_DAY); a matched Reel goes on its calendar date
  first (or the next day with a free slot). Never sooner than 20 minutes from now.
- Captions exactly as the Hub's per-platform templates (Olly: keep the layout). YouTube title = the hook.
- Key: GHL_PIT_TOKEN + GHL_LOCATION_ID in marketing\\.env ('Claude agent' Private Integration: socialplanner post +
  account, medias). userId = Olly's GHL user (the createdBy on files he uploads himself; the key can't list users).
- Accounts were connected 2026-11-04 with messages/comments off where possible, so ManyChat keeps the keyword replies.
"""
import json, os, re, subprocess, time, urllib.request, uuid
from datetime import datetime, timedelta, timezone, date

HERE = os.path.dirname(os.path.abspath(__file__))
ENV = os.path.join(HERE, "..", "marketing", ".env")
API = "https://services.leadconnectorhq.com"
USER_ID = "bHBaRQ4MROqMcbSUeKXm"
WH = timezone(timedelta(hours=2))
# (posting times: see SPREAD below)
LEAD = timedelta(minutes=20)
PLATS = ["instagram", "facebook", "tiktok", "youtube"]
_acc = {"t": 0, "d": None}


def env():
    out = {}
    for line in open(ENV, encoding="utf-8"):
        m = re.match(r"\s*([A-Z_]+)\s*=\s*(.*?)\s*$", line)
        if m:
            out[m.group(1)] = m.group(2).strip('"').strip("'")
    return out


def call(method, path, body=None, headers=None, raw=None):
    e = env()
    h = {"Authorization": "Bearer " + e["GHL_PIT_TOKEN"], "Version": "2021-07-28", "Accept": "application/json",
         "User-Agent": "ReelUpload/1.0"}
    data = raw
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        h["Content-Type"] = "application/json"
    h.update(headers or {})
    req = urllib.request.Request(API + path.replace("{loc}", e["GHL_LOCATION_ID"]), data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            return json.loads(r.read().decode("utf-8") or "{}")
    except urllib.error.HTTPError as err:
        raise RuntimeError(f"GHL {method} {path.split('?')[0]} -> {err.code}: {err.read().decode('utf-8', 'replace')[:300]}")


def accounts():
    """{platform: accountId} for the connected Social Planner accounts (cached 10 min)."""
    if _acc["d"] and time.time() - _acc["t"] < 600:
        return _acc["d"]
    d = call("GET", "/social-media-posting/{loc}/accounts")
    out = {}
    for a in d.get("results", {}).get("accounts", []):
        if a.get("platform") in PLATS and not a.get("isExpired") and a.get("platform") not in out:
            out[a["platform"]] = a["id"]
    _acc.update(t=time.time(), d=out)
    return out


MIN_A_DAY = 4  # Olly 2026-11-04: minimum 4 a day
MAX_A_DAY = 6  # Olly 2026-11-07: maximum 6 a day (was 10), so a batch of recordings lasts longer. A full day pushes to the next.

# Spacing by how many Reels the day has (Olly 2026-11-04: "space out the reels better depending on how many are
# scheduled ... still with an emphasis on the US time zones"). Windhoek = US Eastern +7h, Pacific +10h (Nov).
# US windows in Windhoek time: 14-16 East morning, 19-20 East lunch (his 18-21 peak), 01-05 East evening, 04-08 West
# evening. A posting day runs 06:00 -> 06:00, so "+1" slots are the small hours after that calendar date.
SPREAD = {
    1: ["19:00"],
    2: ["19:00", "02:00+1"],
    3: ["15:00", "19:00", "02:00+1"],
    4: ["15:00", "19:00", "23:00", "02:00+1"],
    5: ["15:00", "19:00", "22:00", "01:00+1", "04:00+1"],
    6: ["12:00", "15:00", "19:00", "22:00", "01:00+1", "04:00+1"],
    7: ["09:00", "12:00", "15:00", "18:00", "21:00", "00:00+1", "03:00+1"],
    8: ["08:00", "11:00", "14:00", "17:00", "19:30", "22:00", "01:00+1", "04:00+1"],
    9: ["07:00", "10:00", "13:00", "15:30", "18:00", "20:00", "22:00", "00:30+1", "03:00+1"],
    10: ["06:30", "09:00", "11:30", "14:00", "16:00", "18:00", "20:00", "22:00", "00:30+1", "03:00+1"],
}
SLOTS = sorted({t.split("+")[0] for v in SPREAD.values() for t in v})   # every time used anywhere (for reference)


def day_of(iso):
    """The posting day a slot belongs to (06:00 -> 06:00 Windhoek)."""
    dt = datetime.strptime(iso, "%Y-%m-%dT%H:%M:%S.000Z").replace(tzinfo=timezone.utc).astimezone(WH)
    return (dt - timedelta(hours=6)).date()


def day_slots(d, n):
    """The n spread-out slots for posting day d, as UTC ISO strings in time order."""
    out = []
    for t in SPREAD[max(1, min(MAX_A_DAY, n))]:
        hhmm, plus = (t.split("+") + ["0"])[:2]
        hh, mm = map(int, hhmm.split(":"))
        dd = d + timedelta(days=int(plus))
        out.append(datetime(dd.year, dd.month, dd.day, hh, mm, tzinfo=WH).astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z"))
    return sorted(out)


def next_slot(taken, want_date=None, now=None, targets=None, counts=None):
    """The Hub calendar decides: a matched Reel books its own calendar day; that day's slots are spread for
    max(the day's Reel number, Reels on it). A Reel whose day has passed, or with no match, tops up the first day
    that has fewer booked than its number (rest days skipped). Never sooner than 20 minutes from now."""
    now = now or datetime.now(WH)
    targets, counts = targets or {}, counts or {}
    today = (now - timedelta(hours=6)).date()
    on_time = bool(want_date) and date.fromisoformat(want_date) >= today
    d = date.fromisoformat(want_date) if on_time else today
    per_day = {}
    for t in taken:
        per_day[day_of(t)] = per_day.get(day_of(t), 0) + 1
    for _ in range(90):
        tgt = int(targets.get(d.isoformat(), MIN_A_DAY))
        n = min(MAX_A_DAY, max(tgt, int(counts.get(d.isoformat(), 0))))
        if per_day.get(d, 0) >= MAX_A_DAY:
            d += timedelta(days=1)
            continue
        if not on_time and (tgt == 0 or per_day.get(d, 0) >= n):
            d += timedelta(days=1)
            continue
        for iso in day_slots(d, min(MAX_A_DAY, max(n, per_day.get(d, 0) + 1))):
            dt = datetime.strptime(iso, "%Y-%m-%dT%H:%M:%S.000Z").replace(tzinfo=timezone.utc)
            if dt > now + LEAD and iso not in taken:
                return iso
        d += timedelta(days=1)
    raise RuntimeError("no free slot in the next 90 days")


def nice_slot(iso):
    dt = datetime.strptime(iso, "%Y-%m-%dT%H:%M:%S.000Z").replace(tzinfo=timezone.utc).astimezone(WH)
    return dt.strftime("%a %d %b %H:%M").replace(" 0", " ")


def cover(path):
    """The very first frame (the hook is on screen from 0s) as a JPEG next to the video: every post's cover (Olly 2026-11-04)."""
    out = path + ".cover.jpg"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", path, "-frames:v", "1", "-q:v", "2", out],
                   creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0), check=True)
    return out


def upload(path, ctype="video/mp4"):
    """Upload a file to the GHL media library -> public URL."""
    b = "----reel" + uuid.uuid4().hex
    name = os.path.basename(path)
    head = (f"--{b}\r\nContent-Disposition: form-data; name=\"name\"\r\n\r\nreel-{name}\r\n"
            f"--{b}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{name}\"\r\nContent-Type: {ctype}\r\n\r\n").encode()
    with open(path, "rb") as f:
        data = head + f.read() + f"\r\n--{b}--\r\n".encode()
    d = call("POST", "/medias/upload-file", raw=data, headers={"Content-Type": "multipart/form-data; boundary=" + b})
    if not d.get("url"):
        raise RuntimeError("GHL upload gave no url: " + json.dumps(d)[:200])
    return d["url"], d.get("fileId", "")


def post_body(platform, acc, url, caption, title, slot, thumb=""):
    media = {"url": url, "type": "video/mp4"}
    if thumb:
        media["thumbnail"] = media["defaultThumb"] = thumb
    b = {"accountIds": [acc], "summary": caption, "media": [media], "status": "scheduled",
         "scheduleDate": slot, "type": "reel", "userId": USER_ID}
    if platform == "tiktok":
        b["type"] = "post"
        b["tiktokPostDetails"] = {"privacyLevel": "PUBLIC_TO_EVERYONE", "enableComment": True, "enableDuet": True,
                                  "enableStitch": True, "videoDisclosure": False, "promoteOtherBrand": False,
                                  "promoteYourBrand": False}
    if platform == "youtube":
        b["youtubePostDetails"] = {"title": title[:100], "privacyLevel": "public", "type": "short"}
    # Cover = first frame (Olly 2026-11-04). GHL has no cover option in its API: media.thumbnail is dropped, and
    # instagramPostDetails.coverUrl / youtubePostDetails.thumbnail are REJECTED (422) on scheduled posts (drafts allowed
    # them, which fooled the first test). Instagram's own default cover is the first frame; the hook is on screen for
    # the first 2-3 seconds, so TikTok / YouTube early frames show it too.
    return b


def schedule(item, path, taken, targets=None, counts=None):
    """Books a slot (keeps the item's slot on a retry), uploads once, creates the missing platform posts.
    Returns the fields to save on the item. Raises with the fields so far in .partial if a platform fails."""
    out = {"slot": item.get("slot") or next_slot(taken, item.get("date"), targets=targets, counts=counts),
           "ghl": dict(item.get("ghl") or {}), "media_url": item.get("media_url", "")}
    if not out["media_url"]:
        out["media_url"], out["media_id"] = upload(path)
    out["thumb_url"] = item.get("thumb_url", "")
    if not out["thumb_url"]:
        try:
            out["thumb_url"], _ = upload(cover(path), "image/jpeg")
        except Exception:
            out["thumb_url"] = ""   # no cover is better than no post
    accs = accounts()
    caps = item.get("captions") or {}
    title = item.get("hook") or item.get("match") or ""   # the on-screen hook = what he said (2026-11-04)
    errs = {}
    for pl in PLATS:
        if pl in out["ghl"] or pl not in accs:
            continue
        try:
            d = call("POST", "/social-media-posting/{loc}/posts",
                     post_body(pl, accs[pl], out["media_url"], caps.get(pl) or item.get("caption", ""), title, out["slot"], out["thumb_url"]))
            out["ghl"][pl] = d["results"]["post"]["_id"]
        except Exception as e:
            errs[pl] = str(e)[:300]
    if errs:
        err = RuntimeError("; ".join(f"{k}: {v}" for k, v in errs.items()))
        err.partial = out
        raise err
    return out


def unschedule(item):
    """Deletes the item's GHL posts that haven't gone out yet. Returns the platforms it couldn't remove."""
    left = {}
    for pl, pid in (item.get("ghl") or {}).items():
        try:
            st, _ = status(pid)
            if st == "published":
                left[pl] = pid
                continue
            call("DELETE", f"/social-media-posting/{{loc}}/posts/{pid}")
        except Exception:
            left[pl] = pid
    return left


def status(pid):
    p = call("GET", f"/social-media-posting/{{loc}}/posts/{pid}").get("results", {}).get("post", {})
    return p.get("status") or "", p.get("error") or ""


def check(item):
    """{platform: (status, error)} for a scheduled item's posts, plus item-level links via links_out.
    GHL REPLACES a scheduled post when it publishes it (2026-11-04, first live test): the scheduled one is marked
    deleted (status still 'scheduled') and a NEW post appears whose parentPostId = the scheduled post's _id, with
    status published/failed and the live link in previewLink. So a deleted post is followed to its child."""
    out, links = {}, {}
    kids = None
    for pl, pid in (item.get("ghl") or {}).items():
        try:
            p = call("GET", f"/social-media-posting/{{loc}}/posts/{pid}").get("results", {}).get("post", {})
            if not p.get("deleted"):
                out[pl] = (p.get("status") or "", p.get("error") or "")
                continue
            if kids is None:   # one listing of the day's posts serves every platform
                slot = datetime.strptime(item["slot"], "%Y-%m-%dT%H:%M:%S.000Z")
                kids = []
                for typ in ("published", "failed"):
                    d = call("POST", "/social-media-posting/{loc}/posts/list",
                             {"type": typ, "fromDate": (slot - timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                              "toDate": (slot + timedelta(days=2)).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                              "limit": "100", "skip": "0", "includeUsers": "false"})
                    kids += d.get("results", {}).get("posts", [])
            kid = next((k for k in kids if k.get("parentPostId") == pid), None)
            if kid:
                out[pl] = (kid.get("status") or "", kid.get("error") or "")
                if kid.get("previewLink"):
                    links[pl] = kid["previewLink"]
            else:
                # No published/failed child yet. Instagram and TikTok take a while to process a video, and GHL swaps the
                # post for its child only when that finishes, so a recent swap is still in progress (2026-11-05: an
                # Instagram Reel was wrongly marked "removed" 2 minutes after its slot). Only an old one counts as removed.
                gone = p.get("deletedAt") or ""
                try:
                    age = datetime.now(timezone.utc) - datetime.strptime(gone[:19], "%Y-%m-%dT%H:%M:%S").replace(tzinfo=timezone.utc)
                except ValueError:
                    age = timedelta(days=1)
                out[pl] = ("in_progress", "") if age < timedelta(hours=6) else ("deleted", "removed in GHL before it posted")
        except Exception as e:
            out[pl] = ("unknown", str(e)[:200])
    item["_links"] = links
    return out
