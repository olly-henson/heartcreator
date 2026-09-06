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

## Never

- **Never** tell Olly to deploy without naming the target Worker by name + `workers.dev` URL + custom domain, and never move on from a deploy without curl-verifying the endpoint's response body.
- **Never** read `scheduled_at` failures as a code bug before checking the timestamp is in the future (422 = past date).
- **Never** run a test signup against a scheduling Worker without clearing the Resend Scheduled queue afterwards.
- **Never** conclude "the key value is wrong" from a 401/auth error — check the secret *name* against `env.<NAME>` first (Cloudflare labels the field **Key**, it is case-sensitive, and it cannot be renamed — delete and re-add).
- **Never** write files outside `AI OS/` (e.g. to the Desktop) for convenience — keep all output inside the project unless Olly asks otherwise.

## Process / Steps

1. Write the Worker locally in `delivery/`, using `env.<NAME>` for every secret it needs.
2. If the change spans more than one Worker, list them for Olly first (name + `workers.dev` URL + custom domain + what each does), then walk one Worker at a time, waiting for confirmation before the next.
3. Deploy via Cloudflare's dashboard browser-based code editor (Edit code / Quick Edit — paste-in, this project doesn't use `wrangler` CLI deploys).
4. In Settings → Variables and Secrets, add each secret with a **Key** that matches the code's `env.<NAME>` **exactly** — copy-paste it, all caps, case-sensitive. A secret cannot be renamed later; a wrong name means delete and re-add.
5. In Settings → Domains & Routes, attach the custom domain/route the calling page's `fetch()` targets.
6. **Verify the deploy immediately:** `curl` the Worker's live URL (a `POST` with a representative body for a webhook Worker, a `GET` for a page Worker) and confirm the response body is what *this specific* Worker should return — not just a 200, and not another Worker's output.
7. If a call fails with an auth-looking error (401/invalid key) despite a correct-looking key value, check the secret name match (see Rules above) before regenerating the key.
8. CORS: include the appropriate `Access-Control-Allow-Origin` headers for any Worker called via cross-origin `fetch()` from a `website/sections/` or `funnel/sections/` page — both are on different origins from the Worker's own domain. A cross-origin `fetch()` to a Worker that returns no CORS headers fails in the browser and surfaces as the calling page's generic catch-all error — check the Worker actually has CORS headers before assuming the page JS is broken.

## Examples

**Previewing Worker-generated emails without deploying.** Because `scheduled_at` rejects past dates, you can't fire a scheduled email early to see it. Instead, render the Worker's own template functions locally: write a short `.mjs` in the scratchpad that copies the Worker's *pure* functions (`wrapHtml`, `link`, `firstName`, the date helpers, every `*EmailHtml()`), calls each with sample data + realistic dates, and writes one standalone HTML file showing every email with its subject line and a "when this sends" caption. Send that file to Olly for copy approval before he redeploys. Used this session to iterate the Attraction Formula check-in copy across ~6 rounds with zero deploys per round.

---

## Changelog

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
