# Creates the "Plan request: bonus training" email template in GHL (2026-11-13). Sent on day 1 by the
# "Plan Of Action Requests" workflow to plan requesters who aren't on the list yet and haven't done the Feeling Finder.
# Olly: the bonus is the video training (they've usually done the Feeling Finder before they reply in the DM).
# Run: python make_plan_request_bonus.py [--dry]
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import make_weekly_templates as mw

NAME = "Plan request: bonus training"
SUBJECT = "a bonus to go with your plan"
LINK = "https://youtu.be/PPiqFhUhypo"
PARAS = [
    "Hey {{contact.first_name}},",
    "I know I've been putting together your personal plan of action.",
    "Whether it's with you already or I'm still putting it together, I want to give you a bonus to go with it.",
    "It's my free training: How To Attract Your Person, Scientifically.",
    "In it I show you:",
    "➡️ why more inner work hasn't helped you find someone to settle down with<br>➡️ why changing your emotional state is the key to finding someone you can marry and have children with",
    "This training will make it really clear about what's been going wrong and how you can begin to change things, quickly.",
    'You can watch it ===&gt; <a href="%s" target="_blank">here</a>' % LINK,
    "Speak soon,",
    "Olly",
]


def main():
    page = mw.fill(mw.daily_html(), PARAS)
    if "--dry" in sys.argv:
        open(os.path.join(HERE, "plan-request-bonus-preview.html"), "w", encoding="utf-8").write(page)
        print("dry ok"); return
    have = {b["name"]: b["id"] for b in mw.gp.call("GET", "/emails/builder?locationId={loc}&limit=100").get("builders", [])}
    tid = have.get(NAME)
    if not tid:
        r = mw.gp.call("POST", "/emails/builder", {"locationId": mw.LOC, "type": "html", "name": NAME, "title": NAME, "builderVersion": "2", "updatedBy": mw.OLLY_USER})
        tid = r.get("id") or r.get("templateId") or (r.get("template") or {}).get("id")
        if not tid: sys.exit("create failed: " + str(r)[:300])
    r = mw.gp.call("POST", "/emails/builder/data", {"locationId": mw.LOC, "templateId": tid, "updatedBy": mw.OLLY_USER,
                   "html": page, "editorType": "html", "previewText": "", "isPlainText": False, "dnd": {"elements": [], "attrs": {}, "templateSettings": {}}})
    print("saved", NAME, tid, str(r)[:160])


if __name__ == "__main__":
    main()
