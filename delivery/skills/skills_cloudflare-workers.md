---
name: cloudflare-workers
description: Building and deploying Cloudflare Workers for this project (email/notification senders like meditation-summary-worker.js, call-rsvp-worker.js, share-worker.js) — secret naming, deploy/debug workflow
---

# Cloudflare Worker Skill

## Scope
Any `*-worker.js` file in `delivery/` deployed to Cloudflare Workers to handle a form/tool submission server-side (sending email via Resend, notifying Olly, etc.) — `meditation-summary-worker.js`, `call-rsvp-worker.js`, `share-worker.js`, `attraction-formula-checkin-worker.js`. Read before building or debugging any of these.

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

**Every test signup schedules real future emails.** Each run of a signup against a scheduling Worker queues the full set of future sends (the check-in Worker: 3 per signup). After ~4 test signups Olly had ~12 real emails queued to himself. Always clear the Resend Scheduled queue between test runs, and before any "clean" signup Olly wants to keep.

**A stateless up-front-scheduling Worker is a valid pattern — don't add a sheet back.** `attraction-formula-checkin-worker.js` has no Google Sheet, no Apps Script, no daily trigger: on signup it sends the immediate emails and schedules *all* future check-ins in one request via `scheduled_at`. This was a deliberate, twice-corrected decision (see `../CLAUDE.md` Attraction Formula section). Never reintroduce sheet-based tracking or a polling trigger to a Worker built this way without Olly explicitly asking.

**A Worker's Cloudflare dashboard name can permanently disagree with its local filename and purpose — restate all three identifiers every time, not just once.** Real confusion this session: `regulate-checkin-worker.js` is deployed under the dashboard name `attraction-formula-check` (never renamed after the 2026-09-10 rebrand). Having named it three ways once early in the session wasn't enough — Olly still asked "regulate-check-in worker?" later on. Repeat the full name + `workers.dev` URL + custom domain every time you point Olly at that Worker to redeploy, even the fifth time in one session.

**Editing the local `.js` file changes nothing live until it's pasted into the dashboard and deployed.** Real incident this session: several rounds of copy edits were made locally, Olly tested a real signup, and the *old* subject line came through — because the edits hadn't been redeployed yet. This isn't a one-time caveat — say it explicitly every time you finish editing a Worker file, before Olly goes to test anything against it, not only the first time in a session.

**On any rename/rebrand request, grep the whole `delivery/` folder for the old term before calling the task done — don't fix only the instances Olly quoted.** Real incident this session: "Program" → "Meditation" was fixed instance-by-instance across several follow-up messages (subjects, then body copy, then the start page's lede/button, then generic lowercase "program" mentions in the date hint and success screen, then the plain-text fallback, then the preview file) because each fix only covered what was pointed out, not the whole surface. One `grep -i "regulate program"` across the folder at the start of a rename would have caught all of it in one pass — including the plain-text fallback and the preview file, which are easy to forget because they're not what renders in a browser preview.

**After a rename sweep, grep for constants that were declared but never referenced — that's a sign of incomplete wiring, not dead code to ignore.** `SHARE_BASE_URL` sat declared and unused in `regulate-checkin-worker.js` while the confirmation email linked straight to `COMMUNITY_URL` instead — the share page's `type=started` view (with its own heading built for exactly this moment) was never actually being used. Caught only because Olly asked for the link to go through the worker URL. Check for unused declared constants as a matter of course, don't wait to be asked.

**When a Worker template has multiple named `type`/variant branches, a new branch is incomplete until every derived value has an entry for it, not just the one that prompted it.** `share-worker.js`'s `type=started` branch had a `heading` but no pre-written `text` (unlike `type=intro`, which has `INTRO_MSG`) — so the share page rendered with nothing in the box to copy. When adding or reviewing a `type === X ? … : …` chain, check every derived variable (`heading`, `subheading`, `buttonText`, `text`, etc.) has a considered value for every branch, not just the ones actively being edited.

## Never

- **Never** tell Olly to deploy without naming the target Worker by name + `workers.dev` URL + custom domain — restate this every time you reference that Worker in the session, not just the first time.
- **Never** let Olly test a Worker's live behaviour right after a local edit without first stating plainly that the edit isn't live yet and needs redeploying.
- **Never** consider a rename/rebrand request finished after fixing only the quoted instances — grep the whole folder (HTML, plain-text fallbacks, preview files included) for the old term first.
- **Never** read `scheduled_at` failures as a code bug before checking the timestamp is in the future (422 = past date).
- **Never** run a test signup against a scheduling Worker without clearing the Resend Scheduled queue afterwards.
- **Never** conclude "the key value is wrong" from a 401/auth error — check the secret *name* against `env.<NAME>` first (Cloudflare labels the field **Key**, it is case-sensitive, and it cannot be renamed — delete and re-add).
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

## Examples

**Previewing Worker-generated emails without deploying.** Because `scheduled_at` rejects past dates, you can't fire a scheduled email early to see it. Instead, render the Worker's own template functions locally: write a short `.mjs` in the scratchpad that copies the Worker's *pure* functions (`wrapHtml`, `link`, `firstName`, the date helpers, every `*EmailHtml()`), calls each with sample data + realistic dates, and writes one standalone HTML file showing every email with its subject line and a "when this sends" caption. Send that file to Olly for copy approval before he redeploys. Used this session to iterate the Attraction Formula check-in copy across ~6 rounds with zero deploys per round.

---

## Changelog

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
