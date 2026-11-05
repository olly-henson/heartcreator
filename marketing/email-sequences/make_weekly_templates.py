# Creates the 12 "Weekly NN · subject" email templates in GHL (2026-11-05): Olly's Daily Email Template HTML with each
# final weekly email's text inside (weekly-email-final/wNN.json). The GHL AI builder can attach templates by name but
# can't fill their text, so the workflow steps then just point at these.
# Run: python make_weekly_templates.py [--only 1] [--dry]
import json, os, re, sys, html, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "reels"))
import ghl_poster as gp   # call(): the 'Claude agent' Private Integration token in marketing\.env

DAILY_ID = "66f1cc527624784089e4ae77"
LOC = "LRqVZmxns8f3xcJLHzBK"
OLLY_USER = "bHBaRQ4MROqMcbSUeKXm"
TPL_FILE = sys.argv[sys.argv.index("--tpl") + 1] if "--tpl" in sys.argv else None

def daily_html():
    d = gp.call("GET", "/emails/builder?locationId={loc}&limit=50")
    b = next(x for x in d["builders"] if x["id"] == DAILY_ID)
    with urllib.request.urlopen(b["previewUrl"], timeout=30) as r:
        return r.read().decode("utf-8")

def paras(h):
    """Final saved email html -> list of paragraph inner-html (keeps <b>/<i>/<a>)."""
    out = []
    for p in re.findall(r"<p[^>]*>(.*?)</p>", h, flags=re.S):
        p = p.strip()
        if re.sub(r"<[^>]+>|&nbsp;|\s", "", p):
            out.append(p.replace("&nbsp;", " ").strip())
    return out

def body(ps):
    return "".join('<p style="line-height: 1.5;"><span style="font-size: 18px">%s</span></p>' % p for p in ps)

def fill(tpl, ps):
    start = tpl.index('style="font-family:arial, helvetica, sans-serif;font-size:14px;line-height:1.25;text-align:left;color:#000000;"')
    gt = tpl.index(">", start) + 1
    end = tpl.index("</div>", gt)
    return tpl[:gt] + body(ps) + tpl[end:]

def main():
    only = int(sys.argv[sys.argv.index("--only") + 1]) if "--only" in sys.argv else None
    tpl = open(TPL_FILE, encoding="utf-8").read() if TPL_FILE else daily_html()
    have = {b["name"]: b["id"] for b in gp.call("GET", "/emails/builder?locationId={loc}&limit=100").get("builders", [])}
    for n in range(1, 13):
        if only and n != only:
            continue
        d = json.load(open(os.path.join(HERE, "weekly-email-final", "w%02d.json" % n), encoding="utf-8"))
        name = "Weekly %02d · %s" % (n, d["subject"].strip())
        page = fill(tpl, paras(d["html"]))
        if "--dry" in sys.argv:
            open(os.path.join(HERE, "weekly-template-preview-%02d.html" % n), "w", encoding="utf-8").write(page)
            print("dry", name); continue
        tid = have.get(name)
        if not tid:
            r = gp.call("POST", "/emails/builder", {"locationId": LOC, "type": "html", "name": name, "title": name, "builderVersion": "2", "updatedBy": OLLY_USER})
            tid = r.get("id") or r.get("templateId") or (r.get("template") or {}).get("id")
            if not tid:
                print("create failed", name, str(r)[:300]); continue
        r = gp.call("POST", "/emails/builder/data", {"locationId": LOC, "templateId": tid, "updatedBy": OLLY_USER,
                    "html": page, "editorType": "html", "previewText": "", "isPlainText": False, "dnd": {"elements": [], "attrs": {}, "templateSettings": {}}})
        print("saved", name, tid, str(r)[:160])

if __name__ == "__main__":
    main()
