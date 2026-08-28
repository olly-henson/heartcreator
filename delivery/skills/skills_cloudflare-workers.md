---
name: cloudflare-workers
description: Building and deploying Cloudflare Workers for this project (email/notification senders like meditation-summary-worker.js, call-rsvp-worker.js, share-worker.js) — secret naming, deploy/debug workflow
---

# Cloudflare Worker Skill

## Scope
Any `*-worker.js` file in `delivery/` deployed to Cloudflare Workers to handle a form/tool submission server-side (sending email via Resend, notifying Olly, etc.) — `meditation-summary-worker.js`, `call-rsvp-worker.js`, `share-worker.js`. Read before building or debugging any of these.

## Rules and Constraints

**A Cloudflare secret's name in the dashboard must match `env.<NAME>` in the code exactly, character for character.** Root cause of a real incident this session: `meditation-summary-worker.js` used `env.RESEND_API_KEY`, but the secret in Cloudflare's Settings → Variables and Secrets was named `meditation_summary`. The actual key *value* was correct, but Resend's API returned a generic 401 "API key is invalid" — nothing in the error pointed at a naming mismatch. **Never assume a 401/invalid-key error means the key value is wrong** — check the secret's exact name against the code's `env.` reference first, before asking Olly to re-generate or re-paste the key.

**Never ship a debug route that exposes a full secret value.** When diagnosing the above, a temporary `/debug` route was added that reported only the key's length and first few characters (enough to confirm identity without exposing it) — remove it once the issue is confirmed fixed, don't leave a secret-introspection endpoint live.

**Send separate, differently-scoped emails for separate audiences, not one email cc'd or duplicated.** `meditation-summary-worker.js` sends two distinct Resend calls — a full personalized summary to the visitor's own email (`data.email`), and a separate, shorter *notification* email to Olly (`OLLY_EMAIL` constant) — not a copy of the client email. Keep coach-facing and client-facing email templates as separate functions (`buildEmailHtml()` vs `buildCoachEmailHtml()`) so wording/length can diverge without cross-contamination.

## Process / Steps

1. Write the Worker locally in `delivery/`, using `env.<NAME>` for every secret it needs.
2. Deploy via Cloudflare's dashboard "Quick Edit" browser-based code editor (paste-in, this project doesn't use `wrangler` CLI deploys).
3. In Settings → Variables and Secrets, add each secret with a name that matches the code's `env.<NAME>` **exactly** — copy-paste the name, don't retype it.
4. In Settings → Domains & Routes, attach the custom domain/route the calling page's `fetch()` targets.
5. If a call fails with an auth-looking error (401/invalid key) despite a correct-looking key value, check the secret name match (see Rules above) before regenerating the key.
6. CORS: include the appropriate `Access-Control-Allow-Origin` headers for any Worker called via cross-origin `fetch()` from a `website/sections/` or `funnel/sections/` page — both are on different origins from the Worker's own domain.

---

## Changelog

**2026-08-28 — Initial skill file, post-session review (meditation-summary-worker.js build + debug)**
- Created this file — no dedicated skill previously existed for the `*-worker.js` Cloudflare Worker pattern used across `delivery/`, despite three of these files existing (`call-rsvp-worker.js`, `share-worker.js`, `meditation-summary-worker.js`).
- Documented the real incident this session: a Cloudflare secret named `meditation_summary` instead of the code's required `env.RESEND_API_KEY`, producing a generic "API key is invalid" 401 that had nothing to do with the key's actual value — cost a full debug cycle (temporary `/debug` route added then removed) before the mismatch was found. New standing rule: always check secret-name-vs-code-reference first on any Worker auth error.
- Documented the separate-client-and-coach-email pattern (two distinct Resend calls, two distinct template functions) as the correct shape for any future notification Worker in this folder.
