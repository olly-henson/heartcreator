# Priorities — Delivery

> Read this at the start of every delivery session. Update it as tasks are completed or added.

**Last updated:** 2026-09-25

---

## REWRITE + REGULATE CHECK-INS (built 2026-09-24 — read first)

Workers, share links and previews are documented in `CLAUDE.md` (Rewrite section) and `skills/skills_email-preview-artifact.md`.

- [x] **Regulate 7-day version DEPLOYED** (confirmed 2026-09-25: live Worker matches local file, share.ollyhenson.com serves the updated page, a real client has started on the day-3 schedule)
- [ ] Regulate: confirm the GHL start page shows the 7-day / "3 days later" wording; review the 4 emails in the Regulate viewer (https://claude.ai/artifact/UudKANQGDEdboN6rbNUguM); any test signup — clear ONLY the test's scheduled emails from Resend, a real client's day 3/7 emails are in the queue
- [x] GitHub push done 2026-09-25 (`ad37781` + Regulate 7-day + Rewrite 30-day, commit `9f14f62`)
- [ ] Delete or archive the stale `regulate-email-preview.html` (old static preview, superseded by the viewer)
- [x] **Rewrite shortened to 30 days (2026-09-25)** — check-ins day 10 + 20, completion day 30 ("ready to start the Rehearse Meditation" share link). Worker + start page + viewer updated; old saved viewer edits cleared (already applied / for removed emails)
- [x] Resend 30-day cap fix (2026-09-25): `capToResendLimit()` in the Rewrite Worker, date picker removed (start = today), start/end dates on both confirmation screens
- [ ] Olly: redeploy the LATEST `rewrite-checkin-worker.js` (30-day cap + shorter confirmation), re-paste `rewrite-start.html` AND `regulate-start.html` in GHL, then a Rewrite test signup: click every link from the inbox, check the confirmation screen dates, then cancel ONLY that test's 3 scheduled emails in Resend
- [ ] Review the 5 emails in the Rewrite viewer (https://claude.ai/artifact/XE6ev4MY8whXzti4jETWpd)
- [ ] Optional: the confirmation email still says "install new core beliefs"; asked whether to make it singular like the start page, no answer yet
- [ ] Olly to review the Regulate viewer copy (nothing edited yet)
- [ ] Rewrite start page: confirm it is live in GHL at the intended path (`/start-rewrite` suggested) (intro now "install your new belief", 2026-09-25)
- [ ] **Rewrite Belief Finder** (`rewrite-belief-finder.html`, preview https://claude.ai/artifact/MC9pEuxZ48PWaxQfcr79Y8): Olly to decide where it sits in the Rewrite process (GHL page / Rewrite training link / start page) and what they do with the two beliefs next; then paste into GHL and wire the link
- [ ] Decide whether to sync the stale belief wording in `belief-quiz-clients.html` and `training/rewrite.html` to the canonical wording (funnel quiz / build-your-meditation) — Olly's call; the Rewrite video wording may already be recorded
- [ ] Build the Rehearse check-in the same way (Rewrite day 30 promises to unlock it) — copy the Rewrite pattern, run the builder for its preview
- [ ] `../CLAUDE.md`-adjacent: the Attraction Formula section in this folder's `CLAUDE.md` still uses the old filenames — tidy when Olly next touches it

---

## Current focus

All five program trackers are live. Master Client Tracker is live. Next focus is The Heart Creator Program delivery materials.

---

## PROGRAMME TRACKERS (all live as of 2026-06-24)

| Program | Script | Status |
|-----------|--------|--------|
| Regulate for Relief | `progress-tracker.gs` | Live — phasing out |
| Heal & Let Go | `heal-and-let-go-tracker.gs` | Live |
| Heart Activation | `heart-activation-tracker.gs` | Live |
| Emotional Mastery | `emotional-mastery-tracker.gs` | Live |
| The Heart Creator Program | `heart-creator-program-tracker.gs` | Live |
| Master Client Tracker | `master-tracker.gs` | Live |

---

## HEART CREATOR PROGRAM (in development)

- [x] Finalise program structure — 90-day intensive (Regulate → Feel → Create) + 9-month community, $2,500/year
- [x] Define how Skool community fits — included for HCP clients months 4–12; also DIY downsell at $97/mo or $997/yr
- [ ] Build onboarding materials for each of the three stages (what does the client do each month?)
- [ ] Build check-in system for the 90-day intensive
- [ ] Build 30-Day Creative Sprint — structure, check-ins, automated progress reports
- [ ] Build 12-month rollover tracker — notify Olly 30 days before each client's renewal date
- [ ] Build GHL onboarding workflow — triggered on payment, delivers access and books onboarding call
- [ ] GHL → Skool integration — auto-add clients to community on purchase

---

## TIMEZONE EMAIL UPDATES (recurring — do not miss)

The weekly RSVP email (`Q&A Coaching Call RSVP` in GHL) lists timezones manually and must be updated when clocks change.

| Date | What changes |
|------|-------------|
| 26 Oct 2026 | UK clocks back: BST → GMT. Update email: 7pm GMT. US times shift +1 hour (3pm EST · 2pm CST · 12pm PST) |
| 1 Nov 2026 | US clocks back: EDT/CDT/PDT → EST/CST/PST. Update email to reflect US change |
| 8 Mar 2027 | US clocks forward: EST/CST/PST → EDT/CDT/PDT |
| 29 Mar 2027 | UK clocks forward: GMT → BST. Update email: 7pm BST. Revert US times |

**Note:** 26 Oct – 1 Nov 2026 is a gap week where UK has changed but US hasn't — US times will be 1 hour off. Consider sending a manual note to clients that week.

---

## CLIENT MANAGEMENT

- [ ] New customer welcome and onboarding automations — GHL workflows (backlog)
- [ ] GHL integration with Skool — auto-add customers to community on purchase (backlog)
- [ ] GHL integration with Stripe — trigger workflows on payment (backlog)

---

## Scripts & Tools

| Script | Purpose |
|--------|---------|
| `progress-tracker.gs` | Regulate & Restore progress tracker |
| `heal-and-let-go-tracker.gs` | Heal & Let Go progress tracker |
| `heart-activation-tracker.gs` | Heart Activation progress tracker |
| `emotional-mastery-tracker.gs` | Emotional Mastery progress tracker |
| `heart-creator-program-tracker.gs` | The Heart Creator Program monthly tracker |
| `master-tracker.gs` | Master Client Tracker — all programs combined |
| `share-worker.js` | Cloudflare Worker — universal share page |
