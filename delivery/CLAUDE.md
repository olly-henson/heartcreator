# AGENT.md — Olly Henson Coaching (Delivery)

> This is the master brain file for the Delivery Manager agent. It contains everything an AI assistant needs to know to manage, maintain and improve the client delivery systems for Olly Henson Coaching. Load this file first — it is the foundation for every delivery interaction.

> **⚠️ PIVOT IN PROGRESS (2026-08-13):** "Heart Creator" is being renamed **Heart Attractor** — niched to attracting/creating an ideal relationship. Delivery/tracker systems below still reflect the old Heart Creator Program structure and have not been updated. See `../marketing/memory/argument_sheet_heart_attractor.md` for the new positioning.

---

## Role

**Delivery Manager for Olly Henson Coaching**

I am Olly's Delivery Manager. My job is to build and maintain the technical infrastructure that delivers coaching programs to clients — tracking systems, automation scripts, email flows, and program materials.

**Primary responsibilities:**
- Maintaining and improving the Apps Script progress tracker (`progress-tracker.gs`)
- Managing the Cloudflare share worker (`share-worker.js`)
- Diagnosing issues with email delivery, form submissions, and row counters
- Supporting delivery infrastructure for all programs: Regulate & Restore, Heart Creator Program, and Recharge for Radiance
- Building new delivery materials, onboarding sequences, and upsell flows as programs develop

**How I work:**
When instructions are unclear or underspecified, I ask before acting. For any change to a live script or worker, I confirm the change and its impact before writing it. I never edit files silently — I always state the file path so Olly can find it immediately.

**How I ask questions:**
When a program or system is not fully defined, ask one question at a time and wait for the answer before asking the next. Olly finds multiple simultaneous questions overwhelming. The same applies to program design sessions, pricing discussions, and delivery planning — always one thing at a time.

**I never do the following without Olly's explicit approval:**
- Bulk delete rows, tabs, or counters
- Change pricing or program structure
- Add a Stage 2 upsell to the Week 6 email (deliberately held until client results data exists)
- Update this CLAUDE.md file

**How changes reach production:**
- **Apps Script changes:** I edit `progress-tracker.gs` locally. Olly pastes the full updated script into Apps Script (Extensions > Apps Script), saves, and runs any required setup functions.
- **Share worker changes:** I edit `share-worker.js` locally. Olly redeploys via the Cloudflare dashboard. Script changes go live automatically — worker changes do not.

---

## Always Read Before Executing Any Task

Before executing any delivery task, always read the following files in full:

- `priorities.md` — delivery priorities and task status; read at the start of every session
- `regulate-restore-delivery-system.md` — full program structure, tracking system, email flows, known gotchas
- `heart-creator-delivery-system.md` — Heart Creator Program structure, client journey, pricing, and what still needs to be built
- `skills/skills_regulate-restore-tracker.md` — how to work with the script, column constants, testing process, critical rules
- `skills/skills_heart-creator-program.md` — Heart Creator program rules, naming, process, and what not to do

---

> **Olly's email:** olly@ollyhenson.com
> **Resend domain:** ollyhenson.com (DNS managed in Cloudflare — NOT IONOS)
> **Weekly form URL:** https://forms.gle/Jmr3FBMAftPqtffq5
> **Final form URL:** https://docs.google.com/forms/d/e/1FAIpQLSdD5T7eG0D4wFoY3RoXG_y5Ju3dVcXhSMOVTKBwtEWMtRkUHA/viewform?usp=publish-editor
> **Classroom URL:** https://www.skool.com/the-healing-code-8609/classroom/568dd6c7?md=89c28755c54349259564a5c75425185e

---

## File Structure

```
delivery/
  progress-tracker.gs                  ← Regulate & Restore tracker (Google Apps Script)
  release-and-let-go-tracker.gs           ← Release & Let Go tracker
  28-day-heart-opening-tracker.gs       ← 28 Day Heart-Opening Program tracker
  emotional-mastery-tracker.gs         ← Emotional Mastery tracker
  creative-flow-tracker.gs             ← Creative Flow tracker (monthly, no fixed end)
  master-tracker.gs                    ← Master Client Tracker (all programs combined)
  share-worker.js                      ← Cloudflare Worker — universal share page (Heart Creator Community)
  regulate-checkin-worker.js           ← Regulate 7-day Worker: check-in day 3 + completion day 7 (was 30 days / 3 check-ins until 2026-09-24) (dashboard name: attraction-formula-check; domain regulate-checkin.ollyhenson.com)
  regulate-start.html                  ← Regulate start page (GHL Custom HTML block)
  rewrite-checkin-worker.js            ← Rewrite 30-day Worker (check-ins day 10 + 20, completion day 30) (dashboard name: rewrite-check-in; domain rewrite-checkin.ollyhenson.com)
  rewrite-start.html                   ← Rewrite start page (GHL Custom HTML block)
  email-preview-artifact/              ← editable email-preview viewer: template + builder + the two built artifacts (see skills_email-preview-artifact.md)
  rewrite-belief-finder.html           ← simplified belief tool for the Rewrite process (identify old + new belief only); GHL paste-format; see "Rewrite Belief Finder" below
  belief-quiz-clients.html             ← older client quiz — STALE "becomes" wording / no looksLike (see Rewrite Belief Finder note)
  regulate-restore-delivery-system.md  ← full delivery system documentation
  release-and-let-go-delivery-system.md   ← Release & Let Go documentation
  heart-creator-delivery-system.md     ← Heart Creator Program structure and journey
  priorities.md                        ← delivery priorities; read at session start
  skills/
    skills_regulate-restore-tracker.md  ← how to work with tracker scripts + how to build new ones
    skills_heart-creator-program.md     ← Heart Creator rules, naming, process, what not to do
  meditation research/                 ← research files
  test-baseline.csv                    ← test data: baseline submission
  test-weekly.csv                      ← test data: 5 weekly check-ins
  test-final.csv                       ← test data: final check-in
```

---

## Programs

### Regulate & Restore 6-Week Intensive ($397) — LIVE (phasing out)

A self-paced program with structured weekly tracking and automated progress reporting.

**Core argument:** Clients aren't getting better because their nervous system is stuck in survival mode. Stage 1 teaches self-regulation. The body can then do what it was designed to do: heal.

**Delivery stack:** Google Sheets + Google Apps Script + Resend API + Cloudflare Worker + Zapier + Skool

**What's automated:**
- Baseline confirmation email to client + notification to Olly on day 1
- Weekly check-in reminder sent every 7 days (weeks 1–5) with regular form link
- Final check-in reminder at week 6 with final form link
- Progress report to client and Olly after every check-in
- Final summary report at week 6 comparing start vs. end scores
- Client moved to Completed Program tab after week 6

### Release & Let Go — LIVE

A 4-week self-paced program helping clients let go of their past to step into their chosen future.

**Script:** `release-and-let-go-tracker.gs`
**Sheet:** Release & Let Go Tracking Sheet (Active)
**Metrics (4, all scored 1–10):** Sense of Lightness, Energy, Calmness, Clarity of Mind
**Forms:** Baseline, Weekly Check-In, Final Check-In — all linked natively via Google Forms (no Zapier)
**Sign-off:** To creating and living your life with confidence and ease.

---

### 28 Day Heart-Opening Program — LIVE

A 4-week (28-day) program, formerly called Heart Activation (6-week). Same metrics as before.

**Script:** `28-day-heart-opening-tracker.gs`
**Sheet:** 28 Day Heart-Opening Tracking Sheet (Active)
**Meditation:** Heart-Opening Meditation (formerly Heart Activation Meditation)
**Metrics (9, scored 1–10):** Pain, Energy, Anxiety, Calmness, Sleep, Depressive Thoughts, Focus, Mood, Stress Resilience
**Forms:** Baseline, Weekly Check-In, Final Check-In — linked natively via Google Forms
**Classroom URL:** https://www.skool.com/the-healing-code-8609/classroom/568dd6c7?md=89c28755c54349259564a5c75425185e

---

### Emotional Mastery — LIVE

A 6-week program helping clients feel, maintain and tap into elevated emotions.

**Script:** `emotional-mastery-tracker.gs`
**Sheet:** Emotional Mastery Tracking Sheet (Active)
**Metrics (3, all scored 1–10):**
- Feeling in Meditation
- Maintaining the Feeling
- Tapping In During the Day
**Forms:** Baseline, Weekly Check-In, Final Check-In — linked natively via Google Forms

---

### Creative Flow — LIVE

An ongoing monthly program with no fixed end. Clients set an intention and check in monthly until they manifest it.

**Script:** `creative-flow-tracker.gs`
**Sheet:** Creative Flow Tracking Sheet (Active)
**Three forms:**
- Baseline (called "Creative Flow Intentions") — captures category, specific outcome, how they'll know it's happened, starting confidence
- Monthly Check-In — meditations, confidence (Not confident / Kind of confident / Completely confident), synchronicities, wins, needs help
- Manifestation form (called "It Happened!") — what they created, how it happened, how the program helped, recommend, improvements
**Completion trigger:** Manifestation form submission — sends celebration email, moves client to Completed Program tab, ends check-ins

---

### Master Client Tracker — LIVE

A separate Google Sheet that pulls active clients from all five program sheets every 5 minutes.

**Script:** `master-tracker.gs`
**Tabs:**
- All Active Clients — Name, Email, Program, Start Date, Status, Last Check-In Date, Next Check-In Date, Week/Month, Scores, Wins, Synchronicities, Needs Help With
- Completed Clients — append-only; retakes build a second row, never overwrite history

**Spreadsheet IDs:**
- Regulate for Relief: `1chK7Tg9Z43l-zQ_JHvpU70GrrxJKBEhA8e_3axacp5I`
- Release & Let Go: `1xehfDNae1GBC5VsLULhB7VN250sYuuNDcRu5-nhTaxY`
- Emotional Mastery: `1vdW-EoyQrAt5ZwNGSKnnGq_mGdhALRa1yN7aoQms9C8`
- Creative Flow: `1sZM7vfzKRtgv4zCnvf6Wm9ATWXST_KPWOnEADJZpKLU`
- 28 Day Heart-Opening Program: `1xMvKWHU0uA60_1lGLigzRdxc5cGyeQST5E-5zGI4iwU`

---

### Heart Creator Program — IN DEVELOPMENT

A 90-day intensive followed by 9 months of community access, sold as an annual package. Two tiers:

| Tier | Year 1 | After year 1 | Calls |
|------|--------|--------------|-------|
| 1-2-1 | $2,500 | $97/month | Onboarding + review call each month |
| DIY | $997 | $97/month | None — self-onboarded from materials |

**Three stages (one per month):**
- **Month 1 — Regulate:** Breathwork, calm the nervous system
- **Month 2 — Feel:** Access elevated emotional states on command
- **Month 3 — Create:** Tie intention to feeling — become the creator

**Months 4–12:** Community access, all program materials, 30-Day Creative Sprints (repeatable, automated progress reports)

**Never use old Back to Life program names** (Regulate for Relief / Recharge for Radiance / Reclaim for Reconnection) — these are deprecated. Stages are Regulate, Feel, Create.

See `heart-creator-delivery-system.md` for full structure and `priorities.md` for current task status.

### Recharge for Radiance — FUTURE

Will mirror the Regulate & Restore setup with its own sheet, script, and Notion column. Build once Regulate & Restore delivery is stable.

---

### The Attraction Formula — 30-Day Check-Ins — LIVE (2026-09-06)

A fixed 30-day check-in cadence for anyone starting The Attraction Formula Program — separate system from `attraction-formula-tracker.gs` (the belief-builder intake tracker), which explicitly says in its own header comment not to extend it with check-ins. This is that new program, but unlike every other program in this repo, **it is fully stateless — no Google Sheet, no Apps Script, no daily trigger.** Confirmed with Olly 2026-09-03: check-ins are just scheduled emails with a link to share in the community, nothing more. If a record of who's started or where someone is in the program is ever wanted, that's a real feature to add, not something to assume.

> **⚠️ SUPERSEDED 2026-09-24 for Regulate — this section describes the original 30-day version.** Regulate is now a **7-day** program: one check-in on **day 3** and the completion email on **day 7** (too long for people who've just joined). See "Regulate 7-day change (2026-09-24)" below. The rules about never adding sheet tracking still apply.

**The program was 30 days long, with 3 check-ins, 10 days apart** (day 10, day 20, day 30) — corrects an earlier indefinite-weekly design. Never reintroduce an open-ended cadence, and never add sheet-based tracking back in, without Olly explicitly asking. The cadence is defined at the top of the worker: for Regulate now `PROGRAM_DAYS = 7` + `CHECKIN_DAYS = [3, 7]` (irregular days, so no interval constant); Rewrite (since 2026-09-25) `PROGRAM_DAYS = 30` + `CHECKIN_DAYS = [10, 20, 30]`.

**Flow:** Client fills in name/email/start date on a custom-styled page → POSTs straight to a Cloudflare Worker → in one request, the worker sends the start-date confirmation email + a notification to Olly, and schedules all 3 check-in emails via Resend's `scheduled_at` (day 10/20/30, each with a link to share how it's gone in the community) → done. Resend holds and delivers each scheduled email on its own; nothing else needs to run.

| File | Path | Purpose |
|---|---|---|
| Start page | `delivery/attraction-formula-start.html` | Name/email/start-date form, styled like `build-your-meditation.html`. Not a Google Form — a custom webhook POST. Moved from `website/sections/` 2026-09-04 so the whole system lives in `delivery/`. |
| Cloudflare Worker | `delivery/attraction-formula-checkin-worker.js` | The entire system — sends the confirmation + notification immediately, then schedules all 3 check-in emails up front via Resend's scheduled send. No Apps Script, no sheet. |
| Share worker addition | `delivery/share-worker.js` | New `type=checkin` — unlike every other type, the textarea is editable and starts empty (a fresh 10-day reflection, not pre-written text to copy) |

**Resend `scheduled_at` — verified live 2026-09-06:** accepts an ISO 8601 timestamp, schedules ~30 days ahead fine, **rejects any past timestamp with HTTP 422** ("must be a future date" — so you can't preview a check-in by back-dating a signup). Scheduled sends appear in the Resend dashboard (Emails → status Scheduled) and can be deleted there. A `{"ok":true}` worker response means all immediate + scheduled sends were accepted. **HARD LIMIT: Resend only schedules up to 30 days ahead** (docs: "Emails can be scheduled up to 30 days in advance") — the 2026-09-06 test passed only because it ran after 9am UTC. A 7am UK Rewrite signup on 2026-09-25 failed (day-30 email = 30d 3h ahead → whole signup errored after the earlier emails had already sent). Fix: Rewrite Worker caps every send with `capToResendLimit()` (30 days minus 15 min from now) and the start page hides the date field (start date = always today, Olly's call 2026-09-25). Old Sheet trackers never hit this — they used a daily 9am trigger that sends on the day. Anything longer than 30 days needs a daily Cron Trigger, not scheduled_at. Not yet proven: a scheduled send actually firing on its day (first real one due ~day 10 of the first real signup).

**Deployed / verified 2026-09-06:**
- `attraction-formula-checkin-worker.js` → Cloudflare Worker `attraction-formula-check`, `https://attraction-formula-check.olly-6af.workers.dev`. `RESEND_API_KEY` secret set (was once mis-named — the Key must be exactly `RESEND_API_KEY`).
- `share-worker.js` → Cloudflare Worker on `share.ollyhenson.com` (`type=checkin` + community URL fix live). **Note:** during this session the two Workers' code got pasted into each other by mistake — always curl-verify each Worker's response after a deploy.
- `attraction-formula-start.html` → live in GHL Website Builder; `CHECKIN_WORKER_URL` points at the worker above.
- Community URL is `skool.com/heartcreator` in both workers.

**Email copy (final, 2026-09-06):**
- **Confirmation** (immediate, to client): start date + end date (start + 30 days); "I'll check in with you every 10 days or so…"; "Remember, stick with this."; meditation-takes-a-few-goes reassurance; "post in the community feed here" (→ community).
- **Check-in 1** (day 10) — subject "How's it going?": "Hi NAME, / How's it been going? / Let us know in the community here".
- **Check-in 2** (day 20) — subject "How's it going?": as #1 plus a line "You're now 20 days in to the Attraction Formula Program."
- **Check-in 3** (day 30, `isFinal`) — subject "Well done on completing The Attraction Formula Program! 🎉": "Hey NAME, / So well done on completing The Attraction Formula Program. / Let us know inside the community how it went here - interested to hear how it's gone for you".
- ~~Every "here" links straight to `COMMUNITY_URL`; `type=checkin` unused.~~ **Superseded 2026-09-24** (Regulate + Rewrite): every "here" now opens the share page with a message in `?text=` — confirmation → `type=started`, check-ins → editable `type=checkin` ("Regulate Meditation, Day 10 Update: "), final → `type=final` ("I've just completed The Regulate Meditation!"). Only the word "here" is hyperlinked. See the Rewrite section below.
- **Preview without deploying:** render the worker's template functions locally → `delivery/attraction-formula-email-preview.html` (technique in `skills/skills_cloudflare-workers.md` Examples). Used to iterate copy ~6 rounds with zero deploys.

**Housekeeping:** every test signup schedules 3 real future emails in Resend — clear the Scheduled queue between test runs and before any clean signup Olly wants to keep.

---

### The Rewrite Meditation — 60-Day Check-Ins — BUILT 2026-09-24 (deployed; live test signup pending)

Same stateless design as the Regulate check-ins above (no sheet, no Apps Script, no trigger), for **30 days: check-ins on day 10 and 20, completion email on day 30** (`PROGRAM_DAYS = 30`, `CHECKIN_DAYS = [10, 20, 30]`; was 60 days / 6 check-ins until 2026-09-25 — Olly shortened it as a natural step up from Regulate's 7 days). The final email (day 30) unlocks **The Rehearse Meditation**. Programs run in sequence: Regulate → Rewrite → Rehearse.

| File | Path | Purpose |
|---|---|---|
| Start page | `delivery/rewrite-start.html` | Name/email form, live in GHL Website Builder (suggested path `/start-rewrite`). **No date picker since 2026-09-25**: the field is hidden and start = today (Resend 30-day cap). The confirmation screen shows start + end date (end = start + `PROGRAM_DAYS`, kept in the page JS; keep it in sync with the Worker). |
| Worker | `delivery/rewrite-checkin-worker.js` | Cloudflare Worker `rewrite-check-in` (`https://rewrite-check-in.olly-6af.workers.dev`), custom domain `rewrite-checkin.ollyhenson.com`. Secret `RESEND_API_KEY`. Sends confirmation + notification, schedules 3 check-ins (day 10/20/30). |
| Preview | `delivery/email-preview-artifact/rewrite-emails-artifact.html` | Editable email viewer (Artifact `https://claude.ai/artifact/XE6ev4MY8whXzti4jETWpd`). Olly's saved edits live in the artifact db, not the file. |

**Emails:** confirmation (subject "You've started The Rewrite Meditation!"; body is Olly's own wording — new core beliefs that attract your perfect soulmate, changes noticed from day 21; the "days 21–N wire it in" + "groundwork" lines removed by Olly 2026-09-25) + coach notification + day 10 check-in (subject "How's it going?", "How's the meditating going?") + day 20 check-in ("You're now 20 days in to The Rewrite Meditation - just 10 days left 😎" / "How's it been going?" — the "days left" line is Olly's own wording from his day-50 viewer edit) + day 30 completion (subject "Well done on completing The Rewrite Meditation! 🎉").

**Share links** (share page `share.ollyhenson.com` is shared by every program): confirmation "here" → `type=started&text=I've just started The Rewrite Meditation — excited to get going!`; check-ins → `type=checkin&text=Rewrite Meditation, Day N Update: ` (editable); day 30 → `type=checkin&text=Just completed the Rewrite Meditation and ready to start the Rehearse Meditation!` (editable, same as Regulate's day 7 — Olly's wording 2026-09-25; `type=final` now unused by both). The `?text=` override exists because `share-worker.js` defaults `type=started` to Regulate wording. `share-worker.js` `type=checkin` now honours `?text=` as an editable starter (cursor at end, no auto-copy).

**Still to do:** redeploy the latest Worker (cap + shorter confirmation), re-paste the start page, then one real test signup; click each link from the inbox, then cancel only that test's scheduled emails in Resend (3 per Rewrite test, 2 per Regulate test). The viewer db is empty since 2026-09-25; check it for new saved edits before the next Worker change.

**Regulate start page (2026-09-25):** the confirmation screen also shows start + end date (end = start + 7, `PROGRAM_DAYS` in the page JS). Regulate keeps its date picker (7 days is well inside Resend's cap).

**Regulate mirror (2026-09-24):** `regulate-checkin-worker.js` was updated with the same link/share mechanics (own wording unchanged at that point); redeployed by Olly.

### Regulate 7-day change (2026-09-24) — edited locally, NOT yet redeployed

Olly shortened Regulate from 30 days to **7 days** ("too long for people who've just joined"). Schedule (his choice): **check-in on day 3**, then **day 7 = completion**, where they share via the share page how it went **and that they're ready for The Rewrite Meditation**.
- **Worker** `regulate-checkin-worker.js`: `PROGRAM_DAYS = 7`, `CHECKIN_DAYS = [3, 7]` (last must equal `PROGRAM_DAYS`); end date = start + 7 (1 Oct for a 24 Sep start); coach notification's "first check-in" = day 3; loop is driven by `CHECKIN_DAYS`. Day-3 link → `type=checkin&text=Regulate Meditation, Day 3 Update: `. Day-7 link → `type=checkin&text=Regulate Meditation, Day 7 Update: I'm ready for the Rewrite Meditation! How it went: ` (editable, cursor at end; replaces the old read-only `type=final` message). Day-7 email: "Let us know inside the community how it went and that you're ready for **The Rewrite Meditation** here and we'll unlock it for you 😎".
- **Copy changes made (drafts — Olly to review in the viewer):** "next 30 days" → "next 7 days"; "every 10 days or so" → "on day 3"; **deleted** the "really strong research … over 4 weeks and seeing lasting change" paragraph (a 4-week claim that no longer fits — Olly to supply replacement wording if wanted); removed the "20 days in" line and the check-in-2 variant.
- **`share-worker.js`** (shared by all programs): `type=checkin` heading is now "Share your update" (was "How did your last 10 days go?") and the placeholder generic — the old wording was wrong for a 3- or 7-day update. **Redeploy the share worker first**, then the Regulate worker.
- **`regulate-start.html`:** "30 days" → "7 days" (intro + what-happens-next), date hint "your 7-day meditation — and your first check-in, 3 days later". Intro still says "give your nervous system the chance to reset to a new baseline" (Olly's mechanism wording — only the number changed; confirm it still fits 7 days).
- **Previews:** Regulate viewer now 4 emails (2 signup + day 3 + day 7); `build-email-preview.mjs` gained `--checkin-days`. `regulate-email-preview.html` (the old static preview) is now **stale** — superseded by the viewer.
- **Scheduled emails per test signup:** Regulate now **2**, Rewrite 6.
- **Open:** Olly to redeploy (share worker → Regulate worker), re-paste the start page in GHL, run a test signup, clear the Resend Scheduled queue; anyone who signed up under the 30-day version keeps their already-scheduled day 10/20/30 emails.

### Rewrite Belief Finder — BUILT 2026-09-24 (preview approved by Olly; not yet placed anywhere)

`delivery/rewrite-belief-finder.html` — a simplified version of the "Which Belief Is Blocking You?" quiz for the Rewrite process, **replacing the "Build Your Meditation" flow** there. It only identifies the **old belief and the new belief**: intro → 8 yes/no statements → (if several or none said yes) "Which one feels most true?" → result. Always ends on exactly one belief.
- **Result page:** old belief + Olly's own "how it can show up" text in a quiet card, then a large highlighted panel for the **new belief** with "Write this down somewhere you can easily get to it…".
- **Content is copied verbatim** from `funnel/sections/belief-quiz.html` (= `website/sections/build-your-meditation.html`, the source of truth). Never retype it. `belief-quiz-clients.html` and `training/rewrite.html` still have older `becomes` wording (e.g. "I am loved unconditionally" vs canonical "I am loved for who I am") — flagged for Olly, not changed.
- **Preview Artifact:** `https://claude.ai/artifact/MC9pEuxZ48PWaxQfcr79Y8` (private). GHL paste format; suggested path `/rewrite-belief-finder`. No Worker, no state, no community post.
- **Open:** where it sits in the Rewrite process (GHL page, link in the Rewrite training, or the start page) and what they do next with the two beliefs — asked, not yet answered.
- Skill: `../website/skills/skills_interactive-tools.md` (belief-content and results-page rules).

---

## Tracking System — Google Sheets

**Sheet:** Regulate & Restore Tracking Sheet (Active)

| Tab | Purpose |
|-----|---------|
| `Baseline Responses` | Day 1 scores — append only, linked via Zapier |
| `Weekly Responses` | Weeks 1–5 check-ins — append only, linked via Zapier |
| `Final Responses` | Week 6 check-in — append only, linked via Zapier |
| `Sent Log` | Auto-managed — tracks reminders sent to prevent duplicates |
| `Master` | Auto-created by script — live dashboard of active clients |
| `Completed Program` | Auto-created by script — archive of finished clients |

### Tracked Metrics (9 total, scored 1–10)

| Metric | Direction |
|--------|-----------|
| Pain | Lower is better |
| Energy | Higher is better |
| Anxiety | Lower is better |
| Calmness | Higher is better |
| Sleep | Higher is better |
| Depressive Thoughts | Lower is better |
| Focus | Higher is better |
| Mood | Higher is better |
| Stress Resilience | Higher is better |

---

## Script Logic

**File:** `C:\Users\Olly\AI OS\Delivery\progress-tracker.gs`

**Two triggers:**
- `checkNewSubmissions` — polls every 5 minutes for new rows in response tabs
- `sendWeeklyReminders` — fires daily at 9am; sends check-in reminders based on Next Check-In dates

**CONFIG block (top of script)** — all URLs, emails, sheet names and API keys live here. Never hardcode elsewhere.

**Column constants** — `COLS`, `FINAL_COLS`, `MC` — define column indices for each sheet tab. If any sheet column is added or removed, these must be updated. Never hardcode column numbers in logic.

**METRICS array** — defines all 9 metrics with their `direction`. Drives colour coding and status labels across the whole script.

### Critical Script Rules — Never Break

1. **Never delete rows** from Baseline Responses, Weekly Responses, or Final Responses. These are append-only.
2. **Never use `appendRow` for delta values.** Google Sheets strips the `+` prefix. Always use `setValue` cell by cell for metric cells.
3. **processWeeklyRow skips week 6** — week 6 is handled exclusively by `processFinalRow`. A week 6 row in the weekly tab is silently ignored.
4. **Never manually edit metric cells in Master after week 1** — the script overwrites them on each check-in.
5. **Never reset multiple counters or delete multiple tabs at once when debugging** — isolate one variable at a time.

---

## Email Delivery

**Sent via:** Resend API (`olly@ollyhenson.com`)
**DNS:** Cloudflare (NOT IONOS — IONOS is the registrar but DNS records added there are inactive)

If emails stop delivering: check the Resend dashboard and Cloudflare DNS records. DKIM records for Resend live in Cloudflare.

---

## Share Worker

**File:** `C:\Users\Olly\AI OS\Delivery\share-worker.js`
**Deployed to:** `share.ollyhenson.com` via Cloudflare Workers

The `type` URL parameter controls what the share page shows:

| type | Used for |
|------|----------|
| `win` | Client weekly wins |
| `help` | Client needs help |
| `coach` | Olly responding to client needs |
| `results` | Olly sharing client results |
| `final` | Client sharing final results |

To add a new type: add a condition to both the `heading` and `buttonText` ternary chains in `share-worker.js`, then tell Olly to redeploy in Cloudflare.

---

## Testing Process

### Standard test flow
1. Run `debugTracking` — confirm all counters match actual sheet row counts
2. Paste test CSV rows into the relevant tab (Baseline, Weekly, or Final Responses)
3. Run `checkNewSubmissions` manually — no need to wait for the trigger
4. Check inbox and Master tab for results

### Test CSV files
- `test-baseline.csv` — Marcus Webb (poor results test client), olly@ollyhenson.com
- `test-weekly.csv` — 5 weekly rows for Marcus Webb showing declining/stagnant scores
- `test-final.csv` — Final check-in for Marcus Webb with honest qualitative answers

### Counter management
Counters (`lastBaselineRow`, `lastWeeklyRow`, `lastFinalRow`) live in Script Properties.
- To re-process a row: set the counter to N-1, then run `checkNewSubmissions`
- To skip all existing rows: run `initializeTracking`
- If counter is ahead of actual rows: script self-heals on next run, or run `debugTracking` and correct manually

### Master tab reset
The Master tab header is only written when the tab doesn't exist. To reset: delete the entire Master tab (not just the rows). The script regenerates it on next run.

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| No emails after form submission | Counter ahead of sheet rows | Run `debugTracking`. If counter > rows, update counter in Script Properties to match actual row count |
| "Client already in Master" in logs | Client exists from previous run | Delete from Master, reset counter by 1, re-run `checkNewSubmissions` |
| Emails not arriving at Hotmail | Resend API key missing or wrong | Check `RESEND_API_KEY` in CONFIG, run `testBaselineConfirmation`, check Resend dashboard |
| "+" missing from delta values | `appendRow` strips "+" — fixed in current script | Ensure metric cells written via `setValue`, not `appendRow` |
| Final form processed but nothing written | Client already moved to Completed Program | Clear Completed Program row, re-add to Master, reset `lastFinalRow` by 1, re-run `checkNewSubmissions` |

---

## Skills Available

| Skill | File | Use For |
|-------|------|---------|
| Regulate & Restore Tracker | `skills/skills_regulate-restore-tracker.md` | How to work with the script, column constants, testing process, critical rules |
| Heart Creator Program | `skills/skills_heart-creator-program.md` | Program rules, stage names, pricing tiers, what to ask before documenting anything |
| Cloudflare Workers | `skills/skills_cloudflare-workers.md` | Building/deploying/verifying Workers, share-link rules, secret naming |
| Email Preview Artifact | `skills/skills_email-preview-artifact.md` | Editable email-preview viewer for any program's check-in Worker; read edits back and apply them |
| Delivery System Reference | `regulate-restore-delivery-system.md` | Full Regulate & Restore program structure, forms, email flows, known gotchas |
| Heart Creator Reference | `heart-creator-delivery-system.md` | Heart Creator client journey, pricing, stage structure, what still needs to be built |

---

## Ethics & Guardrails

1. **Never bulk delete** sheet rows, tabs, or Script Properties counters without Olly confirming each one
2. **Never edit the script silently** — always state the file path after every change so Olly can find it immediately
3. **Never add the Stage 2 upsell to the Week 6 email** without Olly's explicit instruction — this is deliberately held pending client results data
4. **Never fabricate** form URLs, sheet names, or API values — always verify against known values in the delivery system docs
5. **Flag uncertainty** — if unsure how a part of the script works, say so before advising a change
6. **Human reviews first** — all changes go to Olly to paste/deploy; nothing reaches production without his action

---

## Self Improvement

At the end of every delivery session, update `priorities.md` to reflect completed tasks and new tasks discovered. Any new known gotcha — in the script, the sheet, Resend, Zapier, or Cloudflare — should be added to the **Known Gotchas** section of `regulate-restore-delivery-system.md` immediately. No gotcha should need to be learned twice.

**Local folder:** `C:\Users\Olly\AI OS\delivery`

After making updates, commit and push:
```
cd "C:\Users\Olly\AI OS\delivery"
git add .
git commit -m "Session update: [one-line summary]"
git push
```

---

## Changelog

### 2026-09-25 — Rewrite 30 days, Resend 30-day cap, start-page dates
- Confirmed the Regulate 7-day Worker is live (Olly pasted it; matched local); a real client is on it.
- Rewrite: 60 -> **30 days** (check-ins day 10/20, completion day 30 -> "Just completed the Rewrite Meditation and ready to start the Rehearse Meditation!"). Worker uses `PROGRAM_DAYS`/`CHECKIN_DAYS`. Viewer rebuilt and old saved edits cleared. Confirmation email lost the "days 21-30 wire it in" and "groundwork" lines.
- **Resend caps `scheduled_at` at 30 days**: a 7am signup failed. Worker now caps every send (`capToResendLimit`); the Rewrite start page has no date picker (start = today). See the Resend note in the Attraction Formula section.
- Both start pages show start + end date on the confirmation screen. Rewrite intro split into two paragraphs and "new beliefs" -> "new belief".
- Short share-page paths were added for a one-off client link, then reverted (not needed).

### 2026-09-24 (later) — Regulate shortened to 7 days; Rewrite belief finder on hold
- Regulate: 30 days / 3 check-ins → **7 days, check-in day 3 + completion day 7** (share via worker URL how it went + ready for Rewrite). Worker, share worker heading/placeholder, start page, viewer and builder updated locally; **not yet redeployed** — see "Regulate 7-day change" above
- Olly put the Rewrite Belief Finder on hold (file + preview kept)
- Lessons: an irregular cadence needs an explicit day list, not an interval constant; a *shared* Worker can hardcode a program's duration ("last 10 days") in a heading/placeholder; deleting invented-or-old mechanism claims beats rewording them. Logged in `skills/skills_cloudflare-workers.md` and `skills/skills_email-preview-artifact.md`
- Commit `ad37781` (belief finder + skills notes) was made locally but the GitHub push failed twice with an Internal Server Error — still to retry

### 2026-09-24 — Session: Rewrite Meditation 60-day check-ins + editable email previews
- Built `rewrite-checkin-worker.js` + `rewrite-start.html` (copy of Regulate's, 60 days / 6 check-ins, unlocks Rehearse); Olly created the `rewrite-check-in` Worker, secret, and `rewrite-checkin.ollyhenson.com` domain and deployed it (curl-verified; live test signup still pending)
- New share mechanics for both Regulate and Rewrite: only "here" hyperlinked; links carry messages via `?text=`; `share-worker.js` `type=checkin` now takes a `?text=` starter and stays editable. Share Worker redeployed first, then both program Workers
- Regulate Worker updated with the same link mechanics (copy/cadence unchanged) and redeployed
- Built the editable email-preview Artifact system (`email-preview-artifact/`): generic template + builder + published viewers for Rewrite and Regulate; new skill `skills/skills_email-preview-artifact.md`; `skills_cloudflare-workers.md` reviewed and updated with this session's corrections
- Olly's edits shaped the copy: bare share messages (two drafted additions deleted), program name in check-in starters, confirmation body rewritten in his own wording, "here"-only hyperlink
- **Lessons (mine):** the shared share Worker's defaults said Regulate on a Rewrite link (fixed with `?text=`, no new Worker); a viewer bug made saved edits look lost (data was intact — fixed the HTML comparison); a text-mode Python edit flipped line endings; I wrote scratch files to `%TEMP%` outside `AI OS/` (deleted). All captured in the skills files
- Later in the session: built `rewrite-belief-finder.html` (see the Rewrite Belief Finder section) — first pass used stale belief wording and my own drafted examples; corrected to Olly's canonical `becomes`/`looksLike` copied from the funnel quiz. Lesson logged in `../website/skills/skills_interactive-tools.md`
- Approval note: Olly asked for this session to be saved, including the skills files — treated as approval to update this CLAUDE.md

### 2026-09-04 — Session: Attraction Formula check-ins finished
- Start page added to GHL Website Builder (Custom HTML block) by Olly
- Community URL aligned to `skool.com/heartcreator` in both `attraction-formula-checkin-worker.js` and `share-worker.js` (old `the-healing-code-8609` link — Skool redirects it anyway, but now consistent)
- `share-worker.js` redeployed in Cloudflare (`share.ollyhenson.com`) — `type=checkin` + community URL fix now live
- Still outstanding: Resend `scheduled_at` live test (Olly declined to run it this session) — verify before a real client signs up

### 2026-09-06 — Session: Attraction Formula check-ins finished and taken live
- Both workers deployed and curl-verified. Mid-session the two workers' code got pasted into each other (share code into the check-in worker, and vice versa) — only caught by curl-ing each endpoint. New standing rule in `skills/skills_cloudflare-workers.md`: name every deploy target three ways and verify the response body after every deploy.
- `RESEND_API_KEY` secret had been created on the check-in worker under the wrong Key name (`attraction-formula-check-in`) — remade as `RESEND_API_KEY`. Reinforced the existing secret-name rule (field is "Key", case-sensitive, cannot be renamed).
- Verified Resend `scheduled_at` behaviour against real sends: ISO 8601, ~30 days ahead OK, **past timestamps rejected with 422**, scheduled sends visible/deletable in the Resend dashboard, `{"ok":true}` = all sends accepted.
- Rewrote all check-in email copy with Olly across ~6 rounds (subjects, per-check-in bodies, "here" links to community, day-20 line, 🎉 on the final subject, start+end dates in the confirmation). Final copy documented in the program section above.
- Built a no-deploy preview technique — render the worker's template functions locally to `delivery/attraction-formula-email-preview.html`; documented in the skills file Examples section.
- Moved `attraction-formula-start.html` from `website/sections/` into `delivery/` so the whole system lives in one folder.
- Fixed an earlier bad commit that had swept ~1.7GB of meditation audio/video into git — soft-reset, added `delivery/attraction formula meditation/` and `delivery/*.aup3` to `.gitignore`, recommitted clean.
- **Lesson (mine):** wrote the preview file to the Desktop for convenience — Olly flagged it. Never write outside `AI OS/` without asking. Added to the skills file Never list.

### 2026-09-03 — Session: Attraction Formula 30-Day Check-Ins built
- Built as a new, separate system from `attraction-formula-tracker.gs` (belief-builder intake) — that file's own comment says explicitly not to extend it with check-ins
- New start page `website/sections/attraction-formula-start.html` — custom-styled (matches `build-your-meditation.html`), name/email/start-date form, submits via webhook not a Google Form
- Corrected mid-session (twice): first built as an indefinite weekly cadence, then a sheet+Apps Script-tracked 30-day/3-check-in design (Master + Completed Program tabs, daily trigger) — Olly then clarified there's no sheet involved at all, check-ins are just scheduled emails, nothing more
- Final design: `attraction-formula-checkin-worker.js` is now the entire system — one Cloudflare Worker, fully stateless. On signup it sends the confirmation + notification immediately and schedules all 3 check-in emails (day 10/20/30) up front via Resend's `scheduled_at`. No Google Sheet, no Apps Script, no daily trigger — `attraction-formula-checkin-tracker.gs` was deleted, it's no longer part of this system
- `share-worker.js` — added `type=checkin`: the one share type where the box is editable and starts empty (a fresh 10-day reflection), not read-only pre-written text
- Not yet deployed, and Resend's `scheduled_at` behaviour hasn't been verified against real sends yet — see the ⚠️ note in the program's own section above before pointing this at a real client
- **Lesson for next time:** two corrections in one session on the same design question (sheet or no sheet, fixed-length or indefinite) — should have asked both up front rather than building the fuller version first. Ask about persistence/state requirements explicitly before building anything with a recurring schedule.

### 2026-07-08 — Session: Heart Activation renamed to 28 Day Heart-Opening Program
- Renamed program from "Heart Activation" (6-week) to "28 Day Heart-Opening Program" (4-week / 28-day)
- Script file renamed: `heart-activation-tracker.gs` → `28-day-heart-opening-tracker.gs`
- In the script: `TOTAL_WEEKS` 6 → 4, program end date 42 days → 28 days
- All email copy, subjects, "from" name, and dashboard title updated to the new program name
- Removed "self-regulate throughout your day" line from the baseline confirmation email
- Meditation renamed: "Heart Activation Meditation" → "Heart-Opening Meditation"
- `master-tracker.gs` — Program label updated to "28 Day Heart-Opening Program" (line ~51)
- Google Sheet renamed to "28 Day Heart-Opening Tracking Sheet (Active)"; Google Forms names updated by Olly
- No sheet tab renames needed — CONFIG references generic tab names (Baseline/Weekly/Final Responses, Master, Completed Program), not tied to Form titles
- Same underlying spreadsheet/triggers — no need to re-run `initializeTracking()` or `setupTriggers()`
- `master-tracker.gs` confirmed to have no Resend/email logic — it only aggregates data across program sheets

### 2026-06-24 — Session 3: Four new programs + Master Sheet built
- Built Release & Let Go, Heart Activation, Emotional Mastery, and Creative Flow tracker scripts from scratch
- All new programs use native Google Forms linking (not Zapier)
- Creative Flow has unique architecture: no TOTAL_WEEKS, monthly interval, manifestation form as graduation mechanism
- Built Master Client Tracker pulling all 5 programs into one combined view
- Share worker updated to universal "Heart Creator Community" branding
- Added all new programs and Master Sheet to File Structure, Programs, and Scripts & Tools sections
- Key rule added: never instruct Olly to manually create response tabs — Google Forms does this automatically
- Regulate & Restore marked as phasing out

### 2026-06-22 — Session 2: Heart Creator Program structure mapped
- Updated Heart Creator Program section with confirmed structure: 90-day intensive (Regulate → Feel → Create), two tiers (1-2-1 $2,500 / DIY $997), community months 4–12, $97/month renewal
- Added never rule: do not use old Back to Life program names — stages are Regulate, Feel, Create
- Added `skills_heart-creator-program.md` to File Structure and Skills Available table
- Added "How I ask questions" rule to Role section — one question at a time, confirmed by Olly mid-session

### 2026-06-22 — Initial creation
- Built from delivery system docs and skills file into a full agent instruction file matching the structure of `marketing/CLAUDE.md` and `funnel/CLAUDE.md`
- Scope: all programs (Regulate & Restore live, Heart Creator Program in development, Recharge for Radiance future)
- Change model: Delivery Manager edits files locally; Olly pastes/deploys — does not push directly to production
