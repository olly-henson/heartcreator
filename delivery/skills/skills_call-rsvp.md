# Skill — Call RSVP System

## Metadata

- **Skill name:** Call RSVP System
- **Owner:** Olly Henson — Olly Henson Coaching
- **Department:** Delivery
- **Version:** 1.0
- **Date:** 2026-06-25

---

## 1. Purpose

Build and maintain the weekly Coaching Q&A Call RSVP system. Allows clients to register for the call, logs attendance to Google Sheets, notifies Olly by email, and serves a branded confirmation page with calendar links.

---

## 2. System Architecture

| Component | File | Purpose |
|-----------|------|---------|
| Cloudflare Worker | `call-rsvp-worker.js` | Serves branded confirmation page, enforces timeout, calls Apps Script in background |
| Google Apps Script | `call-rsvp.gs` | Logs RSVP to Sheet, sends email notification to Olly |
| Google Sheet | Call Attendance Tracking | One row per call date, names comma-separated in Attendees column |
| GHL Workflow | Q&A Coaching Call RSVP | Scheduler trigger — every Tuesday 11am UK time, filtered to tag `heart creator community` |

---

## 3. RSVP Link Format

```
https://rsvp.ollyhenson.com/call?first_name={{contact.first_name}}&last_name={{contact.last_name}}&id={{contact.id}}
```

- Merge tags only work inside GHL emails — never in Skool event descriptions
- Worker serves branded page directly (not a redirect to Apps Script)
- Apps Script is called in background via `ctx.waitUntil(fetch(...))` — do NOT fire and forget without waitUntil or the Worker exits before the fetch completes

---

## 4. Call Schedule

- **Day:** Every Wednesday
- **Time:** 7pm BST / 8pm SAST / 10pm GST / 2pm EDT / 1pm CDT / 11am PDT
- **Skool link:** `https://www.skool.com/live/hKJmFBDh2Zk`
- **RSVP window:** Tuesday (all day) + Wednesday until 3pm BST
- **Cutoff logic:** Hardcoded in Worker — `isRsvpOpen()` returns true only on day===2 (Tuesday) or day===3 + hour<15 (Wednesday before 3pm)

---

## 5. Google Sheet Logic

- Sheet: `Call Attendance Tracking` | Tab: `Sheet1`
- One row per call date — names appended comma-separated in column B
- Script calculates next Wednesday from click date — so Tuesday clicks log under Wednesday correctly
- Header row auto-created if sheet is empty

---

## 6. Email Notification

- Sent via `MailApp` in Apps Script
- Subject: `📋 Call RSVP: [Full Name]`
- Body: `[Name] has registered for the Q&A Coaching Call on [Day] [Date].`
- Uses `callDate` (next Wednesday) not `now` for the date in the email

---

## 7. Timezone Email Updates

The GHL email lists timezones manually. Update on these dates:

| Date | Change |
|------|--------|
| 26 Oct 2026 | UK: BST→GMT. Update to: 7pm GMT · 3pm EST · 2pm CST · 12pm PST |
| 1 Nov 2026 | US: EDT→EST. Confirm US times settled |
| 8 Mar 2027 | US: EST→EDT. Revert to: 2pm EDT · 1pm CDT · 11am PDT |
| 29 Mar 2027 | UK: GMT→BST. Revert to: 7pm BST |

Reminders are in Google Calendar and `priorities.md`.

---

## 8. Deployment Process

### Apps Script changes
1. Open **Call Attendance Tracking** in Google Sheets
2. **Extensions → Apps Script**
3. Paste full contents of `call-rsvp.gs`
4. Save
5. Deploy → Manage deployments → edit → New version → Deploy

### Worker changes
1. Cloudflare dashboard → Workers & Pages → `call-rsvp` → Edit code
2. Paste full contents of `call-rsvp-worker.js`
3. Deploy

---

## 9. Rules and Constraints

### Never
- Never say "Apps Script" without saying "Extensions → Apps Script in Google Sheets" — Olly accesses it through Sheets, not script.google.com
- Never fire a background fetch in a Cloudflare Worker without `ctx.waitUntil()` — the Worker exits before the fetch completes
- Never redirect to Apps Script for the confirmation page — serve HTML directly from the Worker for full design control and responsiveness
- Never use `justify-content: space-between` for card layouts — creates huge gap between top and bottom content
- Never proxy Apps Script responses through the Worker — use redirect or serve HTML directly
- Never use today's date for the call date — always calculate next Wednesday so Tuesday clicks log correctly
- Never hardcode the Apps Script URL in the Worker — store in `APPS_SCRIPT_URL` environment variable
- Never add real API keys or tokens to code files — use environment variables only

### Always
- Always provide the full file path when asking Olly to paste code: `C:\Users\Olly\AI OS\delivery\call-rsvp.gs`
- Always use `ctx.waitUntil()` for background tasks in Cloudflare Workers
- Always add `oauthScopes` to `appsscript.json` when using `MailApp` — without it the permission prompt never appears
- Always use First Name + Last Name in the RSVP link — avoids duplicate first name ambiguity in the Sheet
- Always calculate next Wednesday in both the Worker (for calendar links) and Apps Script (for Sheet logging) independently

### Design
- Brand colours, fonts and button style from `C:\Users\Olly\AI OS\funnel\brand\brand-guidelines.md`
- Dark cosmic background: `linear-gradient(160deg, #2d0a5e, #1a0535, #080010)`
- Card: `rgba(255,255,255,0.04)` with `border: 1px solid rgba(168,85,247,0.2)`
- Heading: Playfair Display 900, `#f8f4ff`
- Body: Inter, `#c4b5fd`
- Buttons: each calendar brand colour, pill shape `border-radius: 50px`
- Font sizes: use `clamp()` for responsive scaling

---

## 10. Testing

| Test | How |
|------|-----|
| Full RSVP flow | Visit `https://rsvp.ollyhenson.com/call?first_name=Olly&last_name=Henson&id=test123` |
| Closed page | Temporarily change `15` to current hour in `isRsvpOpen()`, redeploy, test, revert |
| Email permission | Add `testEmail()` function, run manually from Apps Script editor to trigger auth |
| Merge tags | Send workflow to yourself as a real GHL contact — test sends show raw tags not values |

---

## 11. Known Gotchas

- **Apps Script iframe:** Pages served from Apps Script are inside Google's iframe — `100vh` and full-height layouts don't work reliably. Serve the confirmation page from the Cloudflare Worker instead.
- **MailApp permissions:** Adding `oauthScopes` to `appsscript.json` alone is not enough — you must run a function that calls `MailApp` manually to trigger the auth prompt. Add a `testEmail()` function and run it.
- **Worker background fetch:** Without `ctx.waitUntil()`, the Worker response fires and the runtime terminates before the Apps Script fetch completes. The Sheet never gets written.
- **GHL merge tags in test sends:** `{{contact.first_name}}` shows blank or raw in test/preview sends. Always test with a real contact record.
- **Scheduler trigger in GHL:** GHL's Scheduler trigger fires globally — it is not contact-based. Always add an If/Else condition after the trigger to filter by tag, otherwise it sends to everyone.
- **Google Calendar scope:** The Google refresh token in `.env` was created for Google Analytics — it does not have Calendar scope. Use the ICS file import method for Calendar events.

---

## Changelog

### 2026-06-25 — v1.0 Initial build
- Built full RSVP system from scratch: Cloudflare Worker + Apps Script + Google Sheet + GHL workflow
- Key lessons: Apps Script iframe limitations led to moving page to Worker; `ctx.waitUntil()` required for background fetches; `oauthScopes` + manual function run required for MailApp; GHL Scheduler needs If/Else tag filter
- Timezone handling: hardcoded Wednesday as call day, next-Wednesday calculation in both Worker and Apps Script
- RSVP window: Tuesday all day + Wednesday before 3pm BST
