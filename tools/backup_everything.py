"""Back up everything that lives in the cloud (GHL + Business Hub data) to a local folder.

Usage:  python tools/backup_everything.py
Output: heartattractor/backups/<YYYY-MM-DD>/   (git-ignored: contacts + private data, the repo is public)

What it saves (2026-11-13):
  GHL   contacts (every field + tags), tags, custom fields, custom values, workflow list,
        campaigns, email templates (HTML of each), URL redirects
  Hub   every Cloudflare KV key (to-dos, calendars, plans, share links, stats).
        Images (img:*, planimg:*) go to backups/kv-images/ once and are reused (they never change).
  Local copies of marketing/.env and Claude's memory folder, so one folder holds the lot.

GHL can't export workflow steps, funnel pages or forms through the API with this token.
The relaunch skill (skills_relaunch.md) rebuilds those from the local source files instead.
Read by the relaunch skill: skills_relaunch.md
"""
import datetime, json, os, time, pathlib, shutil, subprocess, sys, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "reels"))
import ghl_poster as g  # noqa: E402

HUB = ROOT / "business management" / "business hub" / "hub-site"
NS = "f6ae5047d04c492d9409f74cdb3bb920"
DAY = datetime.date.today().isoformat()
OUT = ROOT / "backups" / DAY
IMG = ROOT / "backups" / "kv-images"
MEMORY = pathlib.Path.home() / ".claude" / "projects" / "C--Users-Olly" / "memory"


def save(name, data):
    p = OUT / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding="utf-8")
    n = len(data) if isinstance(data, list) else ""
    print(f"  saved {name} {n}")


def ghl():
    print("GHL")
    contacts, after = [], None
    while True:
        q = "/contacts/?locationId={loc}&limit=100" + (f"&startAfter={after[0]}&startAfterId={after[1]}" if after else "")
        d = g.call("GET", q)
        contacts += d.get("contacts", [])
        m = d.get("meta", {})
        if not m.get("nextPage") or not d.get("contacts"):
            break
        after = (m["startAfter"], m["startAfterId"])
    save("ghl/contacts.json", contacts)
    for name, path, key in [
        ("tags", "/locations/{loc}/tags", "tags"),
        ("custom-fields", "/locations/{loc}/customFields", "customFields"),
        ("custom-values", "/locations/{loc}/customValues", "customValues"),
        ("workflows", "/workflows/?locationId={loc}", "workflows"),
        ("campaigns", "/campaigns/?locationId={loc}", "campaigns"),
    ]:
        save(f"ghl/{name}.json", g.call("GET", path).get(key, []))
    reds, off = [], 0
    while True:
        d = g.call("GET", f"/funnels/lookup/redirect/list?locationId={{loc}}&limit=20&offset={off}").get("data", [])
        reds += d
        if len(d) < 20:
            break
        off += 20
    save("ghl/redirects.json", reds)
    temps, off = [], 0
    while True:
        d = g.call("GET", f"/emails/builder?locationId={{loc}}&limit=100&offset={off}").get("builders", [])
        temps += d
        if len(d) < 100:
            break
        off += 100
    save("ghl/email-templates.json", temps)
    td = OUT / "ghl" / "email-templates"
    td.mkdir(parents=True, exist_ok=True)
    for t in temps:
        if not t.get("previewUrl"):
            continue
        safe = "".join(c if c.isalnum() or c in " -_" else "_" for c in t["name"])[:80]
        try:
            with urllib.request.urlopen(t["previewUrl"], timeout=60) as r:
                (td / f"{safe} ({t['id']}).html").write_bytes(r.read())
        except Exception as e:
            print("  template HTML failed:", t["name"], e)
    print(f"  saved {len(temps)} template HTML files")


def wrangler(*a, out=None):
    w = sorted(pathlib.Path(os.environ["LOCALAPPDATA"], "npm-cache", "_npx").glob("*/node_modules/wrangler/bin/wrangler.js"))
    cmd = ["node", str(w[-1])] if w else ["npx", "wrangler"]
    r = subprocess.run(cmd + ["kv", *a, "--namespace-id", NS, "--remote"], cwd=HUB, capture_output=True, shell=not w)
    if r.returncode:
        raise RuntimeError(r.stderr.decode("utf-8", "replace")[-400:])
    return r.stdout


def hub():
    print("Hub (Cloudflare KV)")
    keys = [k["name"] for k in json.loads(wrangler("key", "list"))]
    binary = [k for k in keys if k.split(":")[0] in ("img", "planimg")]
    text = [k for k in keys if k not in binary]
    vals, tmp = {}, OUT / "_keys.json"
    for i in range(0, len(text), 100):
        tmp.write_text(json.dumps(text[i:i + 100]), encoding="utf-8")
        got = json.loads(wrangler("bulk", "get", str(tmp)))
        vals.update(got)
    tmp.unlink()
    save("hub/kv.json", vals)
    IMG.mkdir(parents=True, exist_ok=True)
    new, failed = 0, []
    for k in binary:
        f = IMG / (k.replace(":", "__") + ".bin")
        if f.exists():
            continue
        for attempt in range(4):
            try:
                data = wrangler("key", "get", k)
                f.write_bytes(data)
                new += 1
                break
            except Exception:
                time.sleep(5 * (attempt + 1))
        else:
            failed.append(k)
    print(f"  images: {len(binary)} total, {new} new (in backups/kv-images/)")
    if failed:
        print(f"  ⚠ {len(failed)} images failed, run the backup again to fetch them: {failed[:5]}")


def local():
    print("Local copies")
    shutil.copy2(ROOT / "marketing" / ".env", OUT / "env-backup.txt")
    if MEMORY.exists():
        shutil.copytree(MEMORY, OUT / "claude-memory", dirs_exist_ok=True)
    print("  saved .env + Claude memory")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    ghl()
    hub()
    local()
    (OUT / "DONE.txt").write_text(f"Backup finished {datetime.datetime.now():%Y-%m-%d %H:%M}\n", encoding="utf-8")
    print("Done:", OUT)
