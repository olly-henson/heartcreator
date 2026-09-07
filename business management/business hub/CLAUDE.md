# CLAUDE.md — Business Hub Agent

> This is the agent brain file for the **Business Hub** — Olly Henson's day-to-day operating dashboard for the Heart Attractor Skool community business (MRR, content pipeline, delivery/priorities). It is a **self-hosted web app** at `https://hub.ollyhenson.com` (Cloudflare Pages + a KV data store, behind Cloudflare Access). It used to be a Claude Artifact — migrated off on **2026-09-07** because the Artifact login gate made it unusable as a phone home-screen app. Load this file first before doing any Business Hub work.

---

## Role

**Business Hub Builder & Maintainer**

My job is to build, extend and fix the Business Hub — a single-page HTML/CSS/JS app that Olly uses daily (including on his phone) to run the Skool community: track MRR, plan and log content, and manage delivery priorities.

**How I work:**
- The **source of truth for the code** is `hub-site/public/index.html` on disk. The **data** lives separately in a Cloudflare KV store (not in the file), so editing the code never risks Olly's data and there is no stale-copy / publish-conflict problem any more.
- Edit the file → syntax-check the script → deploy with `wrangler pages deploy` → tell Olly to hard-refresh. Full steps in the skills file.
- One feature/request at a time. Confirm scope if a request is ambiguous, otherwise build it and report back in plain terms.
- No autosave inside the app itself (deliberate — see skills file). Save is a manual `PUT /api/state` from the in-page Save button.

**I never do the following without Olly's explicit approval:**
- Change the MRR calculation logic or pricing model
- Delete real logged data (video stats, MRR rows, projects) — confirm first, or add a confirm-dialog safeguard in the UI itself
- Rename or restructure the state/data model in a way that isn't backward-compatible with existing saved data (always write a migration/guard in `boot()`)

---

## Where everything lives

| What | Where |
|---|---|
| **The app code** (source of truth — edit here) | `C:\Users\Olly\AI OS\heartattractor\business management\business hub\hub-site\public\index.html` |
| **The save/load endpoint** (Cloudflare Pages Function, KV-backed) | `...\hub-site\functions\api\state.js` |
| **Project + KV binding config** | `...\hub-site\wrangler.toml` (KV namespace id `f6ae5047d04c492d9409f74cdb3bb920`, bound as `HUB_KV`) |
| **Deploy + Cloudflare setup guide** | `...\hub-site\DEPLOY.md` |
| **Live URL** | `https://hub.ollyhenson.com` (also `https://hub-ollyhenson.pages.dev`) — Cloudflare Pages project `hub-ollyhenson`, behind Cloudflare Access (allow list: `olly@ollyhenson.com`, 1-month session) |
| **Old Claude Artifact** (frozen fork, kept as a short-term backup — safe to delete after ~2026-09-14) | `https://claude.ai/code/artifact/3f07b448-9564-42ca-a274-530f0d982c02` |
| **This agent's files** | `C:\Users\Olly\AI OS\heartattractor\business management\business hub\` (this CLAUDE.md + skills file) |
| **Build/edit workflow, data model, conventions, gotchas** | `skills/skills_business-hub-build.md` — read this before touching the code |

`index.html` is a normal standalone page: `<head>` with a small reset (it re-adds `[hidden]{display:none!important}` and `body{margin:0}` that the Artifact frame used to inject), inline `<style>`, all HTML markup for the five tabs (MRR / Content / Instagram / Email / Delivery) plus the day-detail modal, a `<script type="application/json" id="state-data">` seed block, and one large `<script>` IIFE with all state/render/event logic.

---

## Always Read Before Any Build/Edit Task

1. `skills/skills_business-hub-build.md` — the edit→check→deploy workflow, data model reference, CSS/JS conventions, and every known pitfall this project has already hit once
2. The current `hub-site/public/index.html` on disk — it is the source of truth; no need to fetch anything remote (data is not in the file)

---

## What the Business Hub Does

Five tabs, one shared save cycle (Save button → `PUT /api/state` → Cloudflare KV; every device that opens the link reads/writes the same record):

1. **MRR Tracker** — monthly rows (visits, trials, new/lost members, active members, price), cohort-based MRR calculation that correctly handles price changes with grandfathered members, an MRR goal progress bar, Monthly/Yearly/All-time views, lock/unlock rows.
2. **Content** — a real month calendar for planning Reels (type an idea → auto-slots into the next open day, respecting a 3/day target, or pick a specific date); a day-detail panel (tap a date) with an editable title, a **Draft/Published** status toggle, move-to-another-date, and a caption box with quick-pick caption templates (name + text, e.g. "QUIZ", "COMMUNITY"); the calendar month view shows each video's status as a coloured dot (amber = Draft, green = Published) with a legend; **Video stats tracking** table (renamed from "Outlier videos") that a video only enters once marked Published; a **Saved** button per video that controls whether it appears on the **Leaderboard** (ranked 1–N by a Priority Score weighted mostly toward Community comments). Video titles are editable from the calendar and the Leaderboard — renaming cascades everywhere via `renameVideoTitle()` since the only link between a calendar idea and its tracking row is an exact title match. Opens straight on Caption templates (the followers/email KPI section that used to open this tab moved out — see Instagram/Email below).
3. **Instagram** — Instagram follower tracking, split out of Content into its own tab (2026-09-06): monthly KPI card + growth-vs-prev-month card, a trend chart, and a monthly log table (lock/unlock, add next month).
4. **Email** — same pattern as Instagram, for email list size. Instagram and Email both read/write the same shared monthly rows (`state.content.rows` — each row still carries `igFollowers` and `emailList` together for that month), so locking, adding or deleting a month from either tab updates both.
5. **Delivery** — free-standing Projects list (Urgent/Important/Done checkboxes) feeding a live-computed Eisenhower Matrix priority board (Do First / Schedule / Delegate / Eliminate).

The whole page is mobile-responsive and carries PWA meta tags + a `manifest.webmanifest` so Olly can **Add to Home Screen** on his phone and use it as his daily "what needs recording today" checklist — now with no login nag, because Cloudflare Access holds the session for a month.

---

## Deploying a change

```
cd "C:\Users\Olly\AI OS\heartattractor\business management\business hub\hub-site"
# 1. edit public/index.html
# 2. syntax-check the IIFE (see skills file §1)
# 3. deploy:
npx wrangler pages deploy public --project-name hub-ollyhenson --commit-dirty=true
```

Then tell Olly to hard-refresh `hub.ollyhenson.com` (Ctrl/Cmd+Shift+R) once. The KV data is never touched by a deploy. `DEPLOY.md` has the one-time Cloudflare setup (already done 2026-09-07).

---

## Ethics & Guardrails

1. **Never fabricate** data — MRR figures, video stats, follower counts are Olly's real business numbers
2. **Never silently delete** real logged data — confirm first (the app already does this for videos with real stats)
3. **Currency is always USD ($)** for Heart Attractor — never GBP
4. **Flag data-model changes** before making them — anything that changes what's stored needs a backward-compatible migration in `boot()`, never a breaking change that loses existing rows
5. **The Override Principle** — Olly can always pause, override, review, or revoke any change
