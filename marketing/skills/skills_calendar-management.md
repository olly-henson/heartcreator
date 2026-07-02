# Skill: Calendar Management — Olly Henson Coaching

> Load this skill whenever you are asked to add, update, or remove events on the Olly Henson Coaching Google Calendar.

---

## Purpose

Maintain a clean, protected weekly schedule that ensures P1 tasks are always done first, P2 blocks are used for deep production work, and P3 batch sessions handle community and campaign output — all without overloading the day.

---

## Credentials

All credentials are in `C:\Users\Olly\AI OS\marketing\.env`.

| Key | Used For |
|-----|----------|
| `GA_CLIENT_ID` | Google OAuth client ID |
| `GA_CLIENT_SECRET` | Google OAuth client secret |
| `GA_REFRESH_TOKEN` | Refresh token (never expires unless revoked) |

**Calendar ID:** `c_c0683a57e70958985b6a031952c860c858a5f1e6b354e340e3c30152c0ec342b@group.calendar.google.com`

**Timezone:** `Africa/Johannesburg` (SAST, UTC+2) — always set this on every event.

**Package:** `googleapis` is installed at `C:\Users\Olly\AI OS\marketing\node_modules`. Require it with `require('./node_modules/googleapis')`.

---

## Priority Framework & Colours

| Priority | Description | Colour | Google colorId |
|----------|-------------|--------|----------------|
| P1 | Must happen daily — protected time | Red (Tomato) | `11` |
| P1 (Low) | Weekend light-touch tasks | Pink (Flamingo) | `4` |
| P2 | Important, scheduled after P1 | Blue (Blueberry) | `9` |
| P3 | Batch when time allows | Pink (Flamingo) | `4` |

Use the emoji prefix in event names: 🔴 for P1, 🔵 for P2, 🩷 for P3/P1 Low.

---

## Weekly Schedule Structure

### Monday (metrics day — P1s start 30 mins later)

| Time | Event |
|------|-------|
| 9:15–9:45am | 🔴 P1 — Metrics Review |
| 9:45–10:00am | 🔴 P1 — Sales Conversations |
| 10:00–10:15am | 🔴 P1 — Client Management |
| 10:15–11:00am | 🔴 P1 — Instagram Reels x3 (Hook & Caption) |
| 11:00am–1:00pm | 🔵 P2 — YouTube Long-Form |
| 1:00–2:00pm | Lunch |
| 2:00–3:00pm | 🩷 P3 — Batch Posting (YouTube Community, Skool, Email) |
| 3:00–3:30pm | Business Development |
| 3:30–4:00pm | 🔴 P1 — Sales Conversation Review |

### Tuesday–Thursday

| Time | Event |
|------|-------|
| 9:15–9:30am | 🔴 P1 — Sales Conversations |
| 9:30–9:45am | 🔴 P1 — Client Management |
| 9:45–10:30am | 🔴 P1 — Instagram Reels x3 (Hook & Caption) |
| 10:30am–1:00pm | 🔵 P2 — YouTube Long-Form |
| 1:00–2:00pm | Lunch |
| 2:00–3:00pm | 🩷 P3 — Batch Posting (YouTube Community, Skool, Email) |
| 3:00–3:30pm | Business Development |
| 3:30–4:00pm | 🔴 P1 — Sales Conversation Review |

### Friday (half day — done by 1pm)

| Time | Event |
|------|-------|
| 9:15–9:30am | 🔴 P1 — Sales Conversations |
| 9:30–9:45am | 🔴 P1 — Client Management |
| 9:45–10:30am | 🔴 P1 — Instagram Reels x3 (Hook & Caption) |
| 10:30–11:00am | 🔴 P1 — Sales Conversation Review |
| 11:00–11:30am | 🔴 P1 — Content Review |
| 11:30am–1:00pm | 🩷 P3 — Batch Posting (YouTube Community, Skool, Email) |
| **1pm onwards** | **Afternoon off** |

### Saturday (light touch)

| Time | Event |
|------|-------|
| 9:00–10:00am | 🩷 P1 (Low) — Instagram Reel, Sales Conversations & DMs |

---

## Recurring Event IDs (do not delete these)

| Event | Recurring ID | Days |
|-------|-------------|------|
| P1 — Sales Conversations | `raul7g27oo98gvdtrlu5da0qus` | Tue–Fri |
| P1 — Client Management | `oqqimna61hjom17q016gm0rqq8` | Tue–Fri |
| P1 — Instagram Reels x3 | `qdg4u36v6b4253bfarfje9cc98` | Tue–Fri |
| P1 — Sales Conversation Review | `s64knc3u990k0ev13j0e8t2vo8` | Mon–Thu |
| P1 — Metrics Review (Mon) | `06qb7svjpbt5514e1dli7fuge0` | Mon only |
| P1 — Sales Conversations (Mon) | `l9rj1bh7inptub8mpd1as0155o` | Mon only |
| P1 — Client Management (Mon) | `r7g2hag9fp3u8k66mqme7vdkoo` | Mon only |
| P1 — Instagram Reels x3 (Mon) | `qms7uv7v0utcq5334n8bi5bft4` | Mon only |
| P2 — YouTube Long-Form (Mon) | `hkj4nl2jotg88fjusd0pcv6olg` | Mon only |
| P2 — YouTube Long-Form (Tue–Fri) | `ljo6i22aic5mm9jhjqir9g444k` | Tue–Fri |
| P3 — Batch Posting | `qpr1ojk0rvqshn795ltt0vm0rs` | Mon–Thu |
| Coaching Q&A Call | `hcgsfefetl10msou2e42vreqt4` | Wed only |

---

## Rules

1. **Always use `Africa/Johannesburg` timezone** on every event — never omit it.
2. **Recurring events start from 2 June 2026** — for any dates before this, create one-off events matching the correct day's structure.
3. **Mondays are different** — P1s shift 30 mins later due to Metrics Review; YouTube Long-Form starts at 11am not 10:30am.
4. **Fridays are different** — no afternoon blocks; done by 1pm. Sales Conversation Review and Content Review are in the morning.
5. **No YouTube Long-Form on Fridays** — Olly removed this intentionally.
6. **When modifying a recurring event**, always fetch the master event first with `calendar.events.get`, update the field, then call `calendar.events.update`. Never reconstruct the event object from scratch.
7. **To change one day of a recurring series** — update the recurrence rule to exclude that day (e.g. `BYDAY=TU,WE,TH,FR`) and create a separate day-specific recurring event.
8. **Content Review (Friday)** — this is a P1 block where Olly shares content and messaging with Claude to strengthen the marketing. Treat it as a strategic input session.

---

## Code Template

```javascript
const { google } = require('./node_modules/googleapis');

const auth = new google.auth.OAuth2(
  process.env.GA_CLIENT_ID,
  process.env.GA_CLIENT_SECRET
);
auth.setCredentials({ refresh_token: process.env.GA_REFRESH_TOKEN });

const calendar = google.calendar({ version: 'v3', auth });
const calId = 'c_c0683a57e70958985b6a031952c860c858a5f1e6b354e340e3c30152c0ec342b@group.calendar.google.com';
const tz = 'Africa/Johannesburg';
```
