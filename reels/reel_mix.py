"""Mix the Reel queue so posts next to each other are different (Olly, 2026-11-19: "I've just seen ... two basically
identical posts with slightly different hooks about life partner ... they need better moving around to create this
variation").

It never adds or removes slots: it only swaps which booked Reel goes in which slot, so every day keeps its number.
What counts as "too alike" next to each other (or one apart):
  - the same theme (life partner / settle down / family, giving up, worry and doubt, science, ...)
  - the same hook opener ("How to", "The fastest way", "Before you give up", ...)
  - lots of the same words
  - the same recording session (same outfit): a run of IMG numbers close together
It starts from the current order and only makes swaps that clearly help (small cost for moving a Reel far), so
running it again with nothing new changes nothing.

Run by hand to preview:  python reel_mix.py   (prints the current and mixed order, changes nothing)
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
STATE = os.path.join(HERE, "ready", "reels.json")

THEMES = {
    "life partner": r"life partner|settle down|settling down|marriage|married|marry|wedding|children|kids|family|husband|wife|\bthe one\b",
    "meeting someone": r"meet(ing)? someone|find(ing)? someone|your person|my person|right person|attract (a|the|someone)",
    "giving up": r"give up|giving up|tired of|exhausted|lost hope|hopeless",
    "worry and doubt": r"worr|doubt|anxious|anxiety|overthink|stress|scared|fear",
    "science": r"scien|brain|heart rhythm|nervous system|coheren",
    "being single": r"\bsingle\b|alone|lonely",
    "commitment": r"consistent|emotionally available|commit|stick around|last\b",
    "being yourself": r"be yourself|being yourself|understands you|seen|enough",
}
OPENERS = ["how to", "the fastest way", "the quickest way", "before you give up", "the key to", "the scientific way",
           "tired of", "why ", "stop ", "this is", "if you", "the reason", "what "]
STOP = set("a an the to of and or in on for with your you you're who is it that this how way try be someone".split())


def hook_of(it):
    return (it.get("hook") or it.get("match") or "").lower()


def img_no(it):
    m = re.search(r"(\d{3,})", it.get("name") or "")
    return int(m.group(1)) if m else None


def sessions(items):
    """id -> session number. Recordings in one sitting have IMG numbers close together; a gap of more than 8
    (or, with no IMG number, more than 3 hours between uploads) starts a new session."""
    out, sid, last = {}, 0, None
    for it in sorted(items, key=lambda i: (img_no(i) is None, img_no(i) or 0, i.get("uploaded") or 0)):
        key = img_no(it)
        if last is not None:
            if key is not None and last[0] is not None:
                if key - last[0] > 8:
                    sid += 1
            elif abs((it.get("uploaded") or 0) - (last[1] or 0)) > 3 * 3600:
                sid += 1
        out[it["id"]] = sid
        last = (key, it.get("uploaded") or 0)
    return out


def feats(it, sess):
    h = hook_of(it)
    return {
        "themes": {k for k, rx in THEMES.items() if re.search(rx, h)},
        "opener": next((o for o in OPENERS if h.startswith(o)), ""),
        "words": {w for w in re.findall(r"[a-z']+", h) if w not in STOP and len(w) > 2},
        "session": sess.get(it["id"]),
    }


def clash(a, b):
    """How alike two Reels feel back to back (0 = nothing in common)."""
    if a is None or b is None:
        return 0.0
    c = 3.0 * len(a["themes"] & b["themes"])
    if a["opener"] and a["opener"] == b["opener"]:
        c += 2.0
    if a["words"] and b["words"]:
        c += 3.0 * len(a["words"] & b["words"]) / len(a["words"] | b["words"])
    if a["session"] is not None and a["session"] == b["session"]:
        c += 1.0
    return c


def cost(seq, F, home):
    """seq = ids in time order. Next-door pairs count fully, one apart counts half, plus a small cost per slot moved."""
    t = 0.0
    for i in range(len(seq)):
        if i + 1 < len(seq):
            t += clash(F[seq[i]], F[seq[i + 1]])
        if i + 2 < len(seq):
            t += 0.5 * clash(F[seq[i]], F[seq[i + 2]])
        if seq[i] in home:
            t += 0.03 * abs(home[seq[i]] - i)
    return t


def plan(items, movable_ids, context_ids=()):
    """items: every Reel (for sessions). movable_ids: Reels whose slots may be swapped. context_ids: fixed Reels
    (already posted or about to go out) that sit in the same timeline. Returns {id: new_slot} for Reels that move."""
    by_id = {it["id"]: it for it in items}
    sess = sessions(items)
    timeline = sorted([i for i in set(movable_ids) | set(context_ids) if by_id.get(i, {}).get("slot")],
                      key=lambda i: by_id[i]["slot"])
    F = {i: feats(by_id[i], sess) for i in timeline}
    mov = set(movable_ids)
    pos = [k for k, i in enumerate(timeline) if i in mov]
    home = {i: k for k, i in enumerate(timeline) if i in mov}
    seq = list(timeline)
    best = cost(seq, F, home)
    for _ in range(300):
        gain, swap = 0.05, None
        for x in range(len(pos)):
            for y in range(x + 1, len(pos)):
                a, b = pos[x], pos[y]
                seq[a], seq[b] = seq[b], seq[a]
                c = cost(seq, F, home)
                seq[a], seq[b] = seq[b], seq[a]
                if best - c > gain:
                    gain, swap = best - c, (a, b)
        if not swap:
            break
        a, b = swap
        seq[a], seq[b] = seq[b], seq[a]
        best -= gain
    slots = [by_id[i]["slot"] for i in timeline]
    return {i: slots[k] for k, i in enumerate(seq) if i in mov and by_id[i]["slot"] != slots[k]}


def report(items, ids):
    by_id = {it["id"]: it for it in items}
    sess = sessions(items)
    F = {i: feats(by_id[i], sess) for i in ids}
    prev = None
    for i in ids:
        h = (by_id[i].get("hook") or by_id[i].get("match") or "").encode("ascii", "replace").decode()
        c = clash(F[prev], F[i]) if prev else 0
        print(f"  {by_id[i]['slot'][:16]}  s{F[i]['session']}  {'!' * int(c // 2):<4} {h[:70]}")
        prev = i


if __name__ == "__main__":
    from datetime import datetime, timedelta, timezone
    items = json.load(open(STATE, encoding="utf-8"))
    safe = (datetime.now(timezone.utc) + timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M:%S.000Z")
    mov = [it["id"] for it in items if it["status"] == "scheduled" and it.get("slot", "") > safe]
    ctx = [it["id"] for it in sorted((it for it in items if it.get("slot") and it["id"] not in mov and it["status"] != "post_failed"),
                                     key=lambda it: it["slot"]) if it["slot"] <= safe][-2:]
    by_id = {it["id"]: it for it in items}
    cur = sorted(ctx + mov, key=lambda i: by_id[i]["slot"])
    print("Now (! = too alike to the one before):")
    report(items, cur)
    moves = plan(items, mov, ctx)
    for i, s in moves.items():
        by_id[i]["slot"] = s
    print(f"\nMixed ({len(moves)} would move):")
    report(items, sorted(cur, key=lambda i: by_id[i]["slot"]))
