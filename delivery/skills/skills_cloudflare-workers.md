---
name: cloudflare-workers
description: Building and deploying Cloudflare Workers for this project (email/notification senders like meditation-summary-worker.js, call-rsvp-worker.js, share-worker.js) — secret naming, deploy/debug workflow
---

# Cloudflare Worker Skill

## Scope
Any `*-worker.js` file in `delivery/` deployed to Cloudflare Workers to handle a form/tool submission server-side (sending email via Resend, notifying Olly, etc.) — `meditation-summary-worker.js`, `call-rsvp-worker.js`, `share-worker.js`, `regulate-checkin-worker.js`, `rewrite-checkin-worker.js`. Read before building or debugging any of these. For the email-preview Artifact used to review a check-in Worker's copy, also read `skills_email-preview-artifact.md`.

**This project runs several Workers at once.** Before any deploy walkthrough, tell Olly how many Workers the change touches and what each one does — he has lost track mid-session before ("I thought there was only one?"). Name each Worker three ways so the wrong one can't be opened: its Cloudflare **name**, its `*.workers.dev` URL, and its custom domain/route.

## Rules and Constraints

**A Cloudflare secret's name in the dashboard must match `env.<NAME>` in the code exactly, character for character.** Root cause of a real incident this session: `meditation-summary-worker.js` used `env.RESEND_API_KEY`, but the secret in Cloudflare's Settings → Variables and Secrets was named `meditation_summary`. The actual key *value* was correct, but Resend's API returned a generic 401 "API key is invalid" — nothing in the error pointed at a naming mismatch. **Never assume a 401/invalid-key error means the key value is wrong** — check the secret's exact name against the code's `env.` reference first, before asking Olly to re-generate or re-paste the key.

**Never ship a debug route that exposes a full secret value.** When diagnosing the above, a temporary `/debug` route was added that reported only the key's length and first few characters (enough to confirm identity without exposing it) — remove it once the issue is confirmed fixed, don't leave a secret-introspection endpoint live.

**Send separate, differently-scoped emails for separate audiences, not one email cc'd or duplicated.** `meditation-summary-worker.js` sends two distinct Resend calls — a full personalized summary to the visitor's own email (`data.email`), and a separate, shorter *notification* email to Olly (`OLLY_EMAIL` constant) — not a copy of the client email. Keep coach-facing and client-facing email templates as separate functions (`buildEmailHtml()` vs `buildCoachEmailHtml()`) so wording/length can diverge without cross-contamination.

**Never trust "deployed" — verify every deploy by hitting the endpoint.** Real incident this session: told Olly to paste `share-worker.js` into "the Worker serving `share.ollyhenson.com`" and the code went into the `attraction-formula-check` Worker instead. The signup page then failed with the page's generic catch-all error, and the mismatch was only found by `curl`-ing the Worker URL and seeing it return the *share page HTML* instead of the check-in Worker's `{"ok":true}` JSON. After **every** deploy, curl the Worker and confirm the response body is what *that* Worker should produce (expected JSON shape, or expected `<h1>`), not just a 200.

**Resend `scheduled_at` — confirmed behaviour (verified this session):**
- Accepts an ISO 8601 timestamp (`date.toISOString()`). Scheduling ~30 days ahead works.
- **Rejects any past timestamp** with HTTP 422 `validation_error`: "The `scheduled_at` field must be a future date." You therefore *cannot* preview a scheduled email by back-dating a signup — see the preview technique in Examples instead.
- Scheduled sends show in the Resend dashboard (Emails → status **Scheduled**) and can be deleted there. Use this to confirm a signup scheduled the right *number* of emails, and to clear test runs.
- The Worker throws on any non-OK Resend response, so a `{"ok":true}` return means every immediate **and** scheduled send was accepted — a missing/misnamed secret surfaces here as a thrown Resend auth error, not a silent failure.

**Every test signup schedules real future emails.** Each run of a signup against a scheduling Worker queues the full set of future sends (Regulate: 2 per signup since the 7-day change, Rewrite: 6 per signup). After ~4 test signups Olly had ~12 real emails queued to himself. Always clear the Resend Scheduled queue between test runs, and before any "clean" signup Olly wants to keep.

**A stateless up-front-scheduling Worker is a valid pattern — don't add a sheet back.** `regulate-checkin-worker.js` and `rewrite-checkin-worker.js` have no Google Sheet, no Apps Script, no daily trigger: on signup they send the immediate emails and schedule *all* future check-ins in one request via `scheduled_at`. This was a deliberate, twice-corrected decision (see `../CLAUDE.md` Attraction Formula / Rewrite sections). Never reintroduce sheet-based tracking or a polling trigger to a Worker built this way without Olly explicitly asking.

**A Worker's Cloudflare dashboard name can permanently disagree with its local filename and purpose — restate all three identifiers every time, not just once.** Real confusion this session: `regulate-checkin-worker.js` is deployed under the dashboard name `attraction-formula-check` (never renamed after the 2026-09-10 rebrand). Having named it three ways once early in the session wasn't enough — Olly still asked "regulate-check-in worker?" later on. Repeat the full name + `workers.dev` URL + custom domain every time you point Olly at that Worker to redeploy, even the fifth time in one session.

**Editing the local `.js` file changes nothing live until it's pasted into the dashboard and deployed.** Real incident this session: several rounds of copy edits were made locally, Olly tested a real signup, and the *old* subject line came through — because the edits hadn't been redeployed yet. This isn't a one-time caveat — say it explicitly every time you finish editing a Worker file, before Olly goes to test anything against it, not only the first time in a session.

**On any rename/rebrand request, grep the whole `delivery/` folder for the old term before calling the task done — don't fix only the instances Olly quoted.** Real incident this session: "Program" → "Meditation" was fixed instance-by-instance across several follow-up messages (subjects, then body copy, then the start page's lede/button, then generic lowercase "program" mentions in the date hint and success screen, then the plain-text fallback, then the preview file) because each fix only covered what was pointed out, not the whole surface. One `grep -i "regulate program"` across the folder at the start of a rename would have caught all of it in one pass — including the plain-text fallback and the preview file, which are easy to forget because they're not what renders in a browser preview.

**After a rename sweep, grep for constants that were declared but never referenced — that's a sign of incomplete wiring, not dead code to ignore.** `SHARE_BASE_URL` sat declared and unused in `regulate-checkin-worker.js` while the confirmation email linked straight to `COMMUNITY_URL` instead — the share page's `type=started` view (with its own heading built for exactly this moment) was never actually being used. Caught only because Olly asked for the link to go through the worker URL. Check for unused declared constants as a matter of course, don't wait to be asked.

**When a Worker template has multiple named `type`/variant branches, a new branch is incomplete until every derived value has an entry for it, not just the one that prompted it.** `share-worker.js`'s `type=started` branch had a `heading` but no pre-written `text` (unlike `type=intro`, which has `INTRO_MSG`) — so the share page rendered with nothing in the box to copy. When adding or reviewing a `type === X ? … : …` chain, check every derived variable (`heading`, `subheading`, `buttonText`, `text`, etc.) has a considered value for every branch, not just the ones actively being edited.

**`share-worker.js` is shared by every program — its built-in defaults are program-specific hidden surfaces.** Real incident (2026-09-24): the new Rewrite confirmation email's "here" link opened a page saying "I've just started The **Regulate** Meditation" because `type=started` defaults to `STARTED_MSG` (same for `INTRO_MSG` and the `subheading`). Olly's report: "the worker is showing info for the Regulate not Rewrite Meditation." **When cloning a program, grep the shared Worker's defaults as well as the copied files.** And before building another share Worker or editing the shared one, check for an override: the page already honours `?text=`, so the program's own email link can carry its wording (`?type=started&text=…`) — no new Worker, no redeploy of the shared one, Regulate untouched. Give Olly that option first, with the alternative and its risk, and let him choose.

**`type=checkin` on the share page takes a starter and stays editable (changed 2026-09-24 — this replaces the old "starts empty, unused by emails" behaviour).** `?type=checkin&text=Rewrite Meditation, Day 10 Update: ` opens an editable box pre-filled with that text, cursor at the end, no auto-copy; every other type is read-only and auto-copies. Use `checkin` for check-in links (client writes in their own words) and `final` for completion links (bare fixed message). A Worker branch must not silently change another program's behaviour: verify the Regulate links after touching `share-worker.js`.

**Text a client will post into the community must name the program.** Every program posts into the one Skool feed, so "Day 20 update:" alone is ambiguous. Olly corrected it to **"Rewrite Meditation, Day 20 Update: "** (program name first, capital "Update"). Applies to every share starter and pre-written message.

**Pre-written share text is a bare first-person fact — nothing extra.** I drafted "…🎉 60 days of rewriting the core beliefs that were holding me back in love." and "…Ready for The Rehearse Meditation next." and Olly deleted both, leaving "I've just completed The Rewrite Meditation!". Don't add benefit claims, emoji or next-step teasers to text a client will post as their own words. If I must draft client-facing copy Olly hasn't given me, say plainly that it's a draft for his edit.

**Body copy about what a program *does* comes from Olly, not from me.** My confirmation-email body ("rewrite the core beliefs… feeling safe, worthy and open to love") was replaced wholesale by his own wording (new core beliefs that attract your perfect soulmate; noticing changes from day 21; days 21–60 wire it in). When a new program's emails need mechanism/promise copy, either ask Olly one question for his positioning or mark the draft as a placeholder — don't invent claims and present them as finished.

**Link only the word "here", never the whole sentence.** Olly changed "Come and let us know you've started in the community here →" (whole line linked) to "Come and let us know that you've started so we can support you → **here**" with only "here" linked. Same convention as his broadcast emails. Applies to every call-to-action link in these Workers.

**When cadence or length changes, sweep for hardcoded duration text and special-cased branches.** Going 30 → 60 days at the same 10-day interval meant every "30 days"/"4 weeks" string, the `checkinNumber === 2` "20 days in" special case (→ `> 1` with `${n * CHECKIN_INTERVAL_DAYS}`), the plain-text fallbacks, the start page copy and header comments all needed changing, and one start-page line ("reset your nervous system to a new baseline") was Regulate mechanism copy that no longer fit. Grep for `30`, `20 days`, `weeks`, `=== 2`, `TOTAL_CHECKINS` after any length change (extends the days-vs-weeks rule in `skills_regulate-restore-tracker.md`).

**`node --check` does NOT prove a Worker file is valid — actually load it and call `fetch()` locally before telling Olly to deploy.** Real near-miss (2026-09-24): I changed `share-worker.js`'s textarea placeholder to `"How's it going?…"` inside a single-quoted JS string; the apostrophe ended the string, `node --check` still printed "parse" (exit 0), and it would have broken the shared share page for every program on deploy. It was caught only when I imported the file. Reliable pre-deploy test (no temp files, no network): `import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'))`, then `await mod.default.fetch(new Request('https://share.ollyhenson.com/?type=checkin&text=…'))` and read the returned HTML/JSON — for a page Worker check the `<h1>` and `<textarea>` for every `type` you touched **plus** one untouched type; for a POST Worker the builder script's import already exercises the template functions. Never write an apostrophe or backslash into a JS string via an edit without re-running this test — reword to avoid the apostrophe.

**Irregular check-in days need an explicit day list, not an interval × count.** Shortening Regulate to 7 days with check-ins on day 3 and day 7 broke the `CHECKIN_INTERVAL_DAYS × TOTAL_CHECKINS` model (no interval fits). Pattern now used in `regulate-checkin-worker.js`: `PROGRAM_DAYS` + `CHECKIN_DAYS = [3, 7]` (last must equal `PROGRAM_DAYS`), loop over the array, `checkinNumber` stays 1-based as an index into it, and the end date/first-check-in date come from those constants. Even spacing (Rewrite) can keep interval + count. When a program's length changes, also drop per-number special cases (`=== 2` "20 days in") that only made sense for the old schedule.

**A *shared* Worker can hardcode one program's duration — sweep it too.** `share-worker.js` `type=checkin` had the heading "How did your last 10 days go?" and a matching placeholder; it was fine for 10-day check-ins and wrong for Regulate's day-3 and day-7 updates. Made them generic ("Share your update" / "How's it going? What shifted…") — which meant a share-worker redeploy (share worker first, then the program Worker). Grep the shared Worker for durations ("days", "10", "week") whenever any program's cadence changes.

**When a schedule change invalidates a claim in Olly's copy, delete it and flag it — don't reword it.** Regulate's confirmation email said "really strong research showing the power of maintaining a practice … over 4 weeks and seeing lasting change", which can't stand for a 7-day program. I removed the paragraph (the next line still reads on) and told Olly to supply replacement wording if he wants one, rather than inventing a new research claim. Same for start-page mechanism lines: change the number only and ask him to confirm the sentence still fits.

**Program changes don't reach people already signed up.** Resend stores each scheduled email's content at signup, so anyone who joined under the old cadence still gets their old day-10/20/30 emails after a redeploy. State this whenever a live program's schedule or copy changes.

**When a change is made for one program, offer to mirror it to its sibling programs — then mirror the mechanics, not the copy.** Olly asked "take these changes into account for the Regulate Meditation too." Mirror share-link/CTA structure, keep each program's own wording, subjects, length and check-in count, and state the assumption ("assumed 'these changes' = link/share mechanics only").

**Deploy order when Workers depend on each other: the shared Worker first, verify it, then the program Workers.** Share Worker → curl → program Worker → curl. Walk one at a time, restate name + URL + domain, and after each deploy `curl` the *behaviour that changed*, not just a 400/200 (e.g. the share page's `<textarea>` for a `type=checkin&text=…` URL, plus a Regulate `type=started` URL to prove nothing regressed). A `400 Missing or invalid fields` from a check-in Worker proves it is alive, **not** which code version is deployed — only a real test signup proves the links.

**Lead with a recommendation when Olly asks which option is better.** He asked "which would be better and more personal for clients?" — answer with the pick and the reason, then the tradeoff. Options-then-question was too slow; he wants judgement.

**If Olly pastes only a command, run it yourself.** He pasted the `curl` line instead of its output; running it directly (with `-i` and a grep on status/error) was faster than asking again. Run read-only checks against his own endpoints without being asked to re-paste.

**Editing tools: keep line endings and escapes intact.** Two self-caused problems: (1) a Python `open(...,'w')` rewrite on Windows turned an LF file into CRLF, so the whole file showed as changed in a diff — use the Edit tool, or read/write bytes, and compare against a copy before trusting a diff; (2) shell heredocs mangled backslashes (`’`, `\\`) twice — write files with the Write/Edit tools, not heredocs. Also never put scratch files in `%TEMP%` (outside `AI OS/`) — use the session scratchpad or a `data:` URL import.

**Resend `scheduled_at` is capped at 30 days ahead, so design every schedule around it.** Resend docs: "Emails can be scheduled up to 30 days in advance." Rewrite's day-30 email at 9am UTC was 30d 3h ahead for a 7am UK signup (2026-09-25) and Resend rejected it. The Worker sends in sequence, so the confirmation, notification and day 10/20 emails had **already gone** before the failure; the page only showed "Something went wrong". Every retry adds duplicates, so tell Olly to cancel them in Resend. The old 30-day Regulate had the same latent bug; it passed its one test only because the test ran after 9am UTC. Fix pattern: cap every send with `capToResendLimit()` (now + 30 days - 15 min) and give the start page no future start date (Rewrite's date field is hidden; start = today). Anything longer than 30 days needs a daily Cron Trigger + KV, not `scheduled_at`.

**When Olly pushes back with past experience ("it worked before"), find the concrete difference and show it; don't just restate the claim.** He challenged the 30-day limit twice: first "Regulate was 30 days and fine", then "the Sheet trackers scheduled months ahead". What convinced him was evidence: the current time vs the 9am send (06:04 UTC), and the old `.gs` trackers using a daily 9am `timeBased()` trigger (no `scheduled_at` at all). Lead with that evidence and a one-line proof test ("retry after 10am").

**Don't take away a control to fix a bug the code fix already covers, without asking.** I hid Rewrite's date picker *and* capped the send. Olly was confused, I restored it, then he decided to remove it after all. Offer the UI removal as a separate choice.

**Start pages show the start + end date on the confirmation screen** (both Regulate and Rewrite, 2026-09-25; Olly's request, because Rewrite clients no longer pick a date). The page computes end = start + `PROGRAM_DAYS` in its own JS: **keep that constant in sync with the Worker's** when a program length changes.

**A one-off link Olly wants to send a client = give him the working link, don't change a Worker.** I added short paths (`/regulate-complete`) to `share-worker.js`; he said it was a one-off and I reverted it. Offer "hyperlink it behind 'here'" instead.

## Never

- **Never** create a new share Worker, or edit the shared one, before checking whether `?text=` (or `type=checkin&text=`) already does the job.
- **Never** leave a shared Worker's program-specific defaults unswept when cloning a program.
- **Never** hyperlink a whole sentence when Olly's convention is a single "here".
- **Never** add emoji, benefit claims or teasers to pre-written client share text, or post-able text without the program name.
- **Never** present invented program-promise copy as final — mark it as a draft for Olly.
- **Never** rewrite a Worker file with a text-mode Python write or shell heredoc (line endings / escapes) — use Edit/Write.
- **Never** tell Olly a Worker is verified because it returned 400/200 — say what that proves and what only a test signup proves.
- **Never** tell Olly to deploy without naming the target Worker by name + `workers.dev` URL + custom domain — restate this every time you reference that Worker in the session, not just the first time.
- **Never** let Olly test a Worker's live behaviour right after a local edit without first stating plainly that the edit isn't live yet and needs redeploying.
- **Never** consider a rename/rebrand request finished after fixing only the quoted instances — grep the whole folder (HTML, plain-text fallbacks, preview files included) for the old term first.
- **Never** read `scheduled_at` failures as a code bug before checking the timestamp is in the future (422 = past date).
- **Never** run a test signup against a scheduling Worker without clearing the Resend Scheduled queue afterwards.
- **Never** conclude "the key value is wrong" from a 401/auth error — check the secret *name* against `env.<NAME>` first (Cloudflare labels the field **Key**, it is case-sensitive, and it cannot be renamed — delete and re-add).
- **Never** schedule a Resend send more than 30 days ahead: cap it (`capToResendLimit`) or use a daily trigger.
- **Never** write files outside `AI OS/` (e.g. to the Desktop) for convenience — keep all output inside the project unless Olly asks otherwise.

## Process / Steps

1. Write the Worker locally in `delivery/`, using `env.<NAME>` for every secret it needs.
2. If the change spans more than one Worker, list them for Olly first (name + `workers.dev` URL + custom domain + what each does), then walk one Worker at a time, waiting for confirmation before the next.
3. **For a rename/rebrand request specifically:** grep the whole `delivery/` folder for the old term (case-insensitive) before starting edits, so the fix list is complete up front rather than discovered one Olly-report at a time. Include HTML bodies, plain-text email fallbacks, subject lines, and any preview file.
4. Deploy via Cloudflare's dashboard browser-based code editor (Edit code / Quick Edit — paste-in, this project doesn't use `wrangler` CLI deploys). **Walk deploy steps one UI action at a time** (open dashboard → find Worker → Edit code → select-all+delete → paste → Save and Deploy), waiting for Olly's confirmation after each single action — don't bundle several clicks into one instruction, even if you already walked this exact sequence earlier in the session.
5. In Settings → Variables and Secrets, add each secret with a **Key** that matches the code's `env.<NAME>` **exactly** — copy-paste it, all caps, case-sensitive. A secret cannot be renamed later; a wrong name means delete and re-add.
6. In Settings → Domains & Routes, attach the custom domain/route the calling page's `fetch()` targets.
7. **Verify the deploy immediately:** `curl` the Worker's live URL (a `POST` with a representative body for a webhook Worker, a `GET` for a page Worker) and confirm the response body is what *this specific* Worker should return — not just a 200, and not another Worker's output.
8. If a call fails with an auth-looking error (401/invalid key) despite a correct-looking key value, check the secret name match (see Rules above) before regenerating the key.
9. CORS: include the appropriate `Access-Control-Allow-Origin` headers for any Worker called via cross-origin `fetch()` from a `website/sections/` or `funnel/sections/` page — both are on different origins from the Worker's own domain. A cross-origin `fetch()` to a Worker that returns no CORS headers fails in the browser and surfaces as the calling page's generic catch-all error — check the Worker actually has CORS headers before assuming the page JS is broken.
10. Before calling any Worker edit finished, check every `type`/variant branch in it has a considered value for every derived output (heading, subheading, button text, pre-written share text, etc.) — not just the branch that prompted the change.
11. **Preview before deploying:** for any check-in Worker, build the editable preview Artifact (`skills_email-preview-artifact.md`) so Olly reviews subjects, bodies and the real link addresses before anything is redeployed. Apply his saved edits to the Worker exactly, restoring the merge fields.
12. **Verify share links end to end after deploy:** `curl` the share page for each new link shape and grep the `<textarea>` (e.g. `curl -s "https://share.ollyhenson.com/?type=checkin&text=Rewrite%20Meditation%2C%20Day%2020%20Update%3A%20" | grep "<textarea"`) and one existing Regulate link to prove nothing regressed; then a real test signup, click each link from the inbox, and clear the Resend Scheduled queue.

## Examples

**Previewing Worker-generated emails without deploying.** Because `scheduled_at` rejects past dates, you can't fire a scheduled email early to see it. Instead, render the Worker's own template functions locally: write a short `.mjs` in the scratchpad that copies the Worker's *pure* functions (`wrapHtml`, `link`, `firstName`, the date helpers, every `*EmailHtml()`), calls each with sample data + realistic dates, and writes one standalone HTML file showing every email with its subject line and a "when this sends" caption. Send that file to Olly for copy approval before he redeploys. Used this session to iterate the Attraction Formula check-in copy across ~6 rounds with zero deploys per round. **Superseded for check-in Workers (2026-09-24) by the editable Artifact viewer** — `email-preview-artifact/build-email-preview.mjs` does the same render-from-the-Worker's-own-functions trick but publishes a viewer Olly can edit and save in; the static file technique remains fine for a one-off.

**The share links a check-in Worker builds (Rewrite, 2026-09-24):**
- Started: `…/?type=started&text=I've just started The Rewrite Meditation — excited to get going!` (read-only, auto-copies)
- Check-in N: `…/?type=checkin&text=Rewrite Meditation, Day N Update: ` (editable, pre-filled, cursor at end)
- Completed: `…/?type=final&text=I've just completed The Rewrite Meditation!` (read-only, auto-copies)
All built with `encodeURIComponent` in named constants/helpers at the top of the Worker (`STARTED_SHARE_URL`, `COMPLETED_SHARE_URL`, `checkinShareUrl(day)`).

---

## Changelog

**2026-09-25 — Rewrite cut to 30 days; Resend 30-day cap found; start page changes**
- **Olly:** Rewrite 60 -> 30 days, check-ins day 10 + 20, day 30 = share "Just completed the Rewrite Meditation and ready to start the Rehearse Meditation!" (editable `type=checkin`, same as Regulate day 7). Worker refactored to `PROGRAM_DAYS` + `CHECKIN_DAYS`. I'd said "same as Regulate" and he queried it (Regulate is day 3/7), so say "same *mechanism*, different days" explicitly.
- **Olly's test signup failed at 7am UK** -> Resend 30-day cap (rule above). He pushed back twice from past experience; the evidence won (rule above). Fixed with `capToResendLimit()` + no date picker (start = today).
- Start pages: confirmation screen now shows start + end date (Regulate + Rewrite). Rewrite intro split into two paragraphs, "new beliefs" -> "new belief", "Add your start date and details" -> "Add your details". Confirmation email: removed "Then days 21-30 truly wire it in" and the "groundwork" line (Olly).
- Confirmed the Regulate 7-day Worker is live (Olly pasted it; matched local; a real client is on the day-3 schedule). So never tell him to clear the whole Resend queue; a real client's emails are in it.
- Short share links added then reverted (one-off, rule above).
- **Mine:** wrote dry-run scripts + a backup to `%TEMP%` again (outside `AI OS/`), caught and deleted. Use a `data:` import or the session scratchpad. Also a bash heredoc with quotes failed again: write scripts with the Write tool.

**2026-09-24 (later) — Regulate shortened to 7 days (check-in day 3, completion day 7)**
- **Olly:** "too long for people who've just joined to do 30 days" → asked one question (check-in schedule) with a recommendation; he chose day 3 check-in + day 7 share of how it went and readiness for Rewrite. → Rules: irregular days need a `CHECKIN_DAYS` array; sweep the *shared* share Worker for hardcoded durations (its "last 10 days" heading/placeholder); delete-and-flag invalidated claims; changes don't reach existing signups.
- Day-7 link moved from the read-only `type=final` message to editable `type=checkin` with a starter that already says they're ready for Rewrite (they add how it went) — because Olly wants them to write how it went. `type=final` is currently unused by Regulate; Rewrite's day 60 still uses it.
- Scheduled-email counts updated (Regulate 2, Rewrite 6). Preview builder extended (`--checkin-days`) — see `skills_email-preview-artifact.md`.
- **Olly spotted "How did your last 10 days go?" in the preview** — it was the *live* share page (the local fix wasn't deployed yet). While confirming, I found my own new placeholder had a JS-breaking apostrophe that `node --check` had passed → new rule: load the Worker and call `fetch()` locally before any deploy instruction. Fixed by rewording ("How is it going?").
- Nothing removed. Still to do at time of writing: redeploy (share worker → Regulate worker), GHL re-paste, test signup.

**2026-09-24 — Post-session review (Rewrite 60-day check-in Worker + Regulate mirror)**
- **"The worker is showing info for the Regulate not Rewrite"** — the shared `share-worker.js` defaults `type=started` to Regulate wording. → New rule: shared-Worker defaults are hidden program-specific surfaces; grep them when cloning a program; use the `?text=` override instead of a new/edited share Worker.
- **Olly asked "do we need another share worker, or is there a workaround?" then "which is better and more personal?"** → Rules: offer the no-new-Worker option first with tradeoffs; lead with a recommendation when asked which is better.
- **Olly deleted two drafted additions from the completion share text, and corrected the check-in starter to include the program name + "Update"** → Rules: share text is a bare first-person fact and names the program; no emoji/teasers.
- **Olly rewrote the confirmation body wholesale and cut "Come and let us know…" down to a single hyperlinked "here"** → Rules: body/promise copy comes from Olly (mark drafts); link only "here".
- **Olly asked for cadence 60 days at the same 10-day interval** → Rule: sweep hardcoded durations and `=== 2` special cases; one stale Regulate mechanism line on the start page was caught this way.
- **Olly asked to take the changes into Regulate too** → Rule: offer to mirror to siblings; mirror mechanics, not copy; state the assumption.
- **`type=checkin` behaviour changed** (now honours `?text=`, editable, cursor at end) — this **overrides** the old "starts empty, not used by emails" note; `../CLAUDE.md` updated to match.
- **Deploy-order and verification rules** (shared Worker first; curl the changed *behaviour*; 400 ≠ proof of version) and Process steps 11–12 (preview first; verify share links end to end).
- **Self-caught tooling errors** (Python text-mode write flipped LF→CRLF; heredocs mangled backslashes; scratch files in `%TEMP%` outside `AI OS/`) → Rule + Never items; deleted the stray temp files.
- **Scope updated**: `attraction-formula-checkin-worker.js` no longer exists → `regulate-checkin-worker.js` and `rewrite-checkin-worker.js`; scheduled-email counts updated (3 / 6).
- **New companion skill:** `skills_email-preview-artifact.md`.

**2026-09-22 — Post-session review (Regulate Meditation rename across both Workers)**
- **Repeated "which Worker?" confusion** despite naming it three ways earlier in the session — added a rule + Process reminder that the three-way identification must be *restated every time*, not stated once and assumed to stick, since the dashboard name (`attraction-formula-check`) permanently disagrees with the local filename (`regulate-checkin-worker.js`) and the plain-English purpose ("Regulate Meditation").
- **Olly tested a live signup right after a local edit and got the old subject line** — the "local edit isn't live until redeployed" caveat existed implicitly in the "never trust deployed" rule but wasn't being restated after every edit round. Added as its own explicit rule + Never item.
- **A "Program" → "Meditation" rename took several follow-up rounds** because each fix only covered the instance Olly quoted (subject lines, then body copy, then the start page's lede, then generic lowercase "program" mentions, then the plain-text fallback, then the preview file). Added a rule + Process step 3: grep the whole folder for the old term before starting a rename, not after each report.
- **Found `SHARE_BASE_URL` declared but never used** — the confirmation email was linking straight to `COMMUNITY_URL` instead of through the `share-worker.js` page that had a `type=started` view built for exactly that moment. Added a rule to check for unused declared constants after a rename sweep.
- **`type=started` had a heading but no pre-written share text** — `type=intro` had `INTRO_MSG`, `type=started` had nothing, so the share page rendered with an empty box. Added a rule + Process step 10: when reviewing a `type === X ? … : …` branch chain, check every derived variable has a value for every branch, not just the one being actively edited.
- **"Sorry, step by step please"** — a deploy walkthrough moved faster than Olly wanted even though he'd done the exact same sequence minutes earlier. Reinforced in Process step 4: walk one UI action at a time regardless of repetition within the session.

**2026-09-06 — Post-session review (Attraction Formula 30-day check-in Worker)**
- **Wrong-Worker deploy** cost a debug cycle: instruction named the target Worker only by its custom domain, code went into a different Worker, and the signup page just showed its generic error. → New rule + Process step 6: name every deploy target three ways (name + `workers.dev` + custom domain), and curl-verify the endpoint's *response body* after every deploy. Also added the multi-Worker briefing rule (Scope + Process step 2) — Olly lost track of how many Workers exist mid-walkthrough.
- **Secret name bit again** — the 2026-08-28 rule already covered this, but Olly still created the Resend secret as `attraction-formula-check-in`. Reinforced in Process step 4: the Cloudflare field is labelled **Key**, it's case-sensitive/all-caps, and it can't be renamed (delete + re-add). Kept the existing 401-diagnosis rule.
- **Resend `scheduled_at` documented from real testing**: accepts ISO 8601, works ~30 days out, **rejects past timestamps with 422** (so no back-dated previews), scheduled sends are visible/deletable in the Resend dashboard, and a `{"ok":true}` return confirms every scheduled send was accepted. Added to Rules.
- **Test signups queue real emails** — added a rule + Never item to always clear the Resend Scheduled queue between test runs.
- **Stateless up-front-scheduling pattern** documented as valid (no sheet/trigger) with a "don't add a sheet back" guard, mirroring `../CLAUDE.md`.
- Added an **Examples** section: the local template-render preview technique used to iterate email copy ~6 rounds with no deploys.
- Added a **Never** list consolidating the above, including "never write outside `AI OS/`" after a Desktop write was flagged by Olly this session.
- Added `attraction-formula-checkin-worker.js` to Scope.

**2026-08-28 — Initial skill file, post-session review (meditation-summary-worker.js build + debug)**
- Created this file — no dedicated skill previously existed for the `*-worker.js` Cloudflare Worker pattern used across `delivery/`, despite three of these files existing (`call-rsvp-worker.js`, `share-worker.js`, `meditation-summary-worker.js`).
- Documented the real incident this session: a Cloudflare secret named `meditation_summary` instead of the code's required `env.RESEND_API_KEY`, producing a generic "API key is invalid" 401 that had nothing to do with the key's actual value — cost a full debug cycle (temporary `/debug` route added then removed) before the mismatch was found. New standing rule: always check secret-name-vs-code-reference first on any Worker auth error.
- Documented the separate-client-and-coach-email pattern (two distinct Resend calls, two distinct template functions) as the correct shape for any future notification Worker in this folder.
