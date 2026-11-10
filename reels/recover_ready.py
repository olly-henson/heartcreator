"""Give Reels that were edited before cover_pick.py existed the best-still cover (2026-11-10).
Usage: python recover_ready.py   -> every Reel that's 'ready' or 'editing' (waits for edits to finish) and has no
cover yet in its plan. Scheduled / posted Reels are left alone (they're already uploaded to GHL)."""
import json, os, sys, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
for _s in (sys.stdout, sys.stderr):
    try: _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception: pass
import cover_pick

STATE = os.path.join(HERE, "ready", "reels.json")
done = set()
for _ in range(120):  # up to ~2 hours of waiting for edits in progress
    items = json.load(open(STATE, encoding="utf-8"))
    todo = [i for i in items if i["status"] == "ready" and i["id"] not in done]
    waiting = [i for i in items if i["status"] in ("editing",) and i["id"] not in done]
    for it in todo:
        out = os.path.join(HERE, "ready", it["id"] + ".mp4")
        plan = out + ".plan.json"
        if not os.path.exists(out) or not os.path.exists(plan) or "cover" in json.load(open(plan, encoding="utf-8")):
            done.add(it["id"]); continue
        cur = next((x for x in json.load(open(STATE, encoding="utf-8")) if x["id"] == it["id"]), {})
        if cur.get("status") != "ready":  # approved meanwhile: leave it to the poster
            done.add(it["id"]); continue
        print(time.strftime("%H:%M"), it["id"], flush=True)
        try:
            cover_pick.apply(out, it["raw"])
        except Exception as e:
            print("  failed:", e, flush=True)
        done.add(it["id"])
    if not waiting and not todo:
        break
    time.sleep(60)
print("finished", len(done), flush=True)
