# Skills File — Attribution & Tracking
# Trigger phrase: "Attribution please" or "Check attribution setup"

> This file documents the full attribution system for Olly Henson Coaching. It covers GA4 tracking, UTM parameters, GHL custom fields, upgrade path tracking, and conversion events. Reference this file whenever adding new pages, links or traffic sources.

---

## Overview

The attribution system tracks:
1. **Where leads come from** (UTM source) — stored in GA4 and GHL contact record
2. **What converted them** (conversion events) — tracked in GA4
3. **What prompted them to upgrade** (upgrade path) — stored in GHL contact record

---

## GA4 Setup

**Property ID:** 539372524
**Measurement ID:** G-1VR8T0WKYZ (stored in `.env` — never hardcode in public files)

### GA4 Tracking Snippet
Added to GHL in two places:
- **Website** (Sites → Olly Heart Site → Settings → Head tracking code)
- **Funnel** (Funnels → meditation funnel → Settings → Head tracking code)

For pages that are standalone HTML blocks (e.g. application-thank-you), the GA4 snippet is embedded directly at the top of the HTML file.

### Conversion Events

| Event Name | Where it fires | What it means |
|---|---|---|
| `generate_lead` | `/thank-you` page on load | Someone opted in for the meditation |
| `application_submitted` | `/application-thank-you` page on load | Someone submitted a coaching application |
| `pdf_download` | Click on PDF button on `/meditation-access` | Someone downloaded the practice guide |

All three are marked as **Key Events** in GA4 → Admin → Events.

### Where to see attribution in GA4
- **Realtime** — live activity and events
- **Reports → Acquisition → Traffic Acquisition** — visits by source/medium
- **Key events column** — conversions tied back to source

---

## GHL Custom Fields

All stored on the **Contact** record. Go to GHL → Settings → Custom Fields → Contact to view.

| Field Name | What it stores |
|---|---|
| UTM Source | Platform that sent the lead (e.g. `instagram`, `youtube`, `email`) |
| UTM Medium | Placement within platform (e.g. `bio`, `manychat`, `description`) |
| UTM Campaign | What was being promoted (e.g. `meditation`, `coaching`) |
| UTM Content | Specific content piece (e.g. video title, `email-3`) |
| Upgrade Path | What prompted them to apply (e.g. `Applied from meditation page`) |

### How UTM fields get populated
The opt-in form (`opt-in.html`) reads UTM parameters from the URL and sends them to the GHL webhook on form submission. The webhook workflow maps them to the contact record.

The application form (`funnel-application.html`) does the same — captures UTMs from the URL and sends them to GHL.

### How Upgrade Path gets populated
Each upgrade CTA link has a `?ref=` parameter. When someone submits the application form, the `ref` value is sent to GHL and stored in the Upgrade Path field.

---

## Upgrade Path Tags

| Page | CTA | Ref tag |
|---|---|---|
| `/thank-you` | Heart Creator Program button | `Applied from thank you page` |
| `/meditation-access` | Heart Creator Program button | `Applied from meditation page` |
| Practice Guide PDF | Link at bottom of PDF | `Applied from PDF guide` |

---

## UTM Parameter System

See `C:\Users\Olly\AI OS\marketing\skills\skills_utm-links.md` for the full UTM link creation process (this is a Marketing Assistant task, not a Funnel Builder task) and `C:\Users\Olly\AI OS\marketing\memory\utm-link-log.md` for the log of all links created.

### Quick reference

| Source | Medium | Campaign | Content |
|---|---|---|---|
| `instagram` | `bio`, `manychat`, `manychat_story` | `meditation` or `coaching` | — |
| `youtube` | `bio`, `description`, `pinned_comment` | `meditation` or `coaching` | Video title in kebab-case |
| `email` | `nurture` | `meditation` or `coaching` | `email-1`, `email-2` etc. |
| `email` | `broadcast` | `meditation` or `coaching` | `broadcast-[topic]` |
| `website` | `homepage` | `meditation` or `coaching` | — |

---

## Files that contain tracking code

| File | What's in it |
|---|---|
| `funnel/sections/opt-in.html` | UTM capture + send to webhook |
| `funnel/sections/thank-you.html` | `generate_lead` GA4 event + upgrade path ref tag |
| `funnel/sections/meditation-access.html` | `pdf_download` GA4 event + upgrade path ref tag |
| `funnel/sections/funnel-application.html` | UTM capture + upgrade path capture + send to webhook |
| `funnel/sections/application-thank-you.html` | GA4 snippet + `application_submitted` event |
| `funnel/sections/practice-guide.html` | Upgrade path ref tag in PDF link |
| `website/sections/homepage.html` | UTM-tagged CTAs |
| `website/sections/links.html` | UTM-tagged CTAs (Instagram bio page) |

---

## GHL Workflows with attribution mapping

### Heart Activation Meditation Download Sequence
- Trigger: Inbound Webhook
- Create Contact maps: First name, Last name, Email, UTM Source, UTM Medium, UTM Campaign, UTM Content

### Heart Creator Application Autoresponder
- Trigger: Inbound Webhook
- Create Contact maps: All application fields + UTM Source, UTM Medium, UTM Campaign, UTM Content, Upgrade Path

---

## GHL Dashboard

**Sheet URL:** https://docs.google.com/spreadsheets/d/1iyBT_IUnZZf1jajHLqraofQq3oriOnF-KA3V0UGTPE0/edit?gid=1648689867#gid=1648689867
**Sync script:** `C:\Users\Olly\AI OS\funnel\references\ghl-dashboard-apps-script.js` — paste into Google Sheet → Extensions → Apps Script → run `syncAll()`

### GHL custom field IDs
| Field | ID |
|---|---|
| UTM Source | O468O9YO86rNRlzVDFvn |
| UTM Medium | 0zyrJerhiHpiUOBriIny |
| UTM Campaign | qcflgCMJt4hmosuySJa0 |
| UTM Content | zFmOgHptnUj3uxT7l1cL |
| Upgrade Path | WF9bTjccdEhBYkkFOeTZ |

### To update the dashboard
1. Open the Google Sheet → Extensions → Apps Script → run `syncAll()`
2. Charts update automatically on the dashboard tab

### Still to build
- Opt-in page conversion rate scorecard (needs GA4 page view data via API)
- Application page conversion rate scorecard (needs GA4 page view data via API)

---

## GHL Dashboard — Known Issues & Rules

### GA4 timezone bug (discovered 2026-06-22)
`ga4DateStr()` converts dates to UTC, but the Google Sheet runs in BST (UTC+1). This means dynamic date starts (month, year) resolve one day early in GA4, inflating page visit counts.

**Fix applied:** Hardcode GA4 start dates to `"2026-06-17"` (funnel go-live) for month, year and all-time calls. See `memory/dashboard-ga4-timezone-fix.md` for full detail and July revert instructions.

**Rule:** Never use `ga4DateStr()` for period starts that align with or are close to the funnel go-live date — always hardcode `"2026-06-17"` for those calls.

### Lead tracking — tag removal risk
Leads are tracked via the "meditation download" tag. If any workflow removes this tag, the contact drops out of the lead count in the dashboard permanently.

**Rule:** Never use "Remove contact tag: meditation download" in any workflow. Use "Remove from workflow" instead to pull someone out of a sequence without losing their lead attribution.

**Rule:** If a contact needs to be removed from broadcast emails, remove the "broadcast" tag — not the "meditation download" tag.

### Opt-in tracking — source of truth
The dashboard counts leads via GHL contacts tagged "meditation download" (form submissions via webhook). GHL's native Stats tab shows `-` for opt-ins because it only tracks native form submissions, not webhooks. The dashboard figure is always the correct one.

### Tag management for pipeline progression
When a contact applies, the correct actions are:
1. Add tag: "heart creator applicant"
2. Remove from workflow: nurture sequence (removes from prospect emails without losing tag)
3. Remove tag: "broadcast" (removes from broadcast list if they've progressed past nurture)

Never remove "meditation download" tag on application — it breaks lead attribution.

### Pipeline stage counts are unreliable — always use tags
The `pipelineByPeriod()` function filters by a contact's **current** pipeline stage. Once a contact moves forward (e.g. from "Loom Video Sent" to "Offer Sent"), they disappear from the previous stage count. This makes historical counts wrong.

**Rule:** Never use `pipelineByPeriod()` to count pipeline activity. Always use a tag-based count via `contacts.filter(c => c.tags...)` instead. Tags persist permanently on the contact regardless of pipeline movement.

**Rule:** Every pipeline stage must have a corresponding tag. When a contact reaches a stage, add the tag manually (or via workflow). The tag is the source of truth for the dashboard count.

**Current pipeline tags (as of 2026-06-26):**
| Stage | Tag |
|---|---|
| Application Received | heart creator applicant |
| Loom Video Sent | loom sent |
| Offer Sent | offer sent |
| Joined 1-2-1 | heart creator 1-2-1 |
| Joined Community | heart creator community |
| Lost | lost |

### Revenue vs membership counts may diverge
Community members who joined for free (e.g. during setup/testing) will have the "heart creator community" tag but £0 monetary value on their opportunity. This causes the Community Sales count and Community Revenue to diverge.

**Rule:** This is expected behaviour — do not try to fix it in the script. Revenue reflects what was actually charged. If a member is genuinely free, their £0 is correct.

**Rule:** When a paying member joins, always set the monetary value on their GHL opportunity (£2,500 for 1-2-1, £997 for Community) before moving them to the relevant pipeline stage. Revenue pulls from `monetaryValue` on the opportunity record.

### Current pipeline structure and prices (as of 2026-06-26)
- Pipeline stages: Application Received → Loom Video Sent → Offer Sent → Joined 1-2-1 → Joined Community → Lost
- 1-2-1 price: $2,500
- Community price: $997
- Dashboard sections: Pipeline Overview (Looms + Offers), Pipeline 1-2-1, Pipeline Community
- Conv rate for sales is calculated against Offers Sent (not Applications), since the offer goes out after the Loom call

### Pages to exclude from website tracking
The following preview pages are excluded from the Website Pages section of the dashboard via the `EXCLUDED_PAGES` array in the script:
- All `/preview/` paths listed in the script
- Add new preview paths to `EXCLUDED_PAGES` whenever a new GHL preview URL is identified

---

## When adding a new page or traffic source

1. Add GA4 snippet to the page (either in GHL Head tracking code or directly in HTML)
2. If it's a conversion page — add the appropriate GA4 event script
3. If it's a new traffic source — ask Marketing Assistant to create UTM links using `skills_utm-links.md` (in marketing/skills/) and log in `memory/utm-link-log.md`
4. If it's a new upgrade CTA — add `?ref=` tag and map in the GHL workflow
5. Update this file

---

## Changelog

### 2026-06-22 (session 2 — file reorganisation)
- **Rule added:** UTM link *creation* is a Marketing Assistant task, not a Funnel Builder task. `skills_utm-links.md` stays in `marketing/skills/` — only attribution *tracking* belongs to this file.
- **Rule added:** The `.env` file does not travel with the Apps Script. The Apps Script has credentials hardcoded directly; `.env` is only needed by Node.js terminal scripts in the marketing folder.
- **Path updated:** `ghl-dashboard-apps-script.js` moved from `marketing/` to `funnel/references/` — all path references updated accordingly.
- **Cross-reference fixed:** UTM parameter system section now points to the correct path for `skills_utm-links.md` in the marketing folder, with a note that it's a Marketing Assistant task.

### 2026-06-26 — pipeline tag rules + offer structure update
- **Rule added:** Never use `pipelineByPeriod()` for dashboard counts — contacts leave the stage when they progress, breaking historical counts. Use tag-based filtering instead.
- **Rule added:** Every pipeline stage needs a corresponding tag; tag is the source of truth for all dashboard counts.
- **Rule added:** Revenue and membership counts will diverge for free/test members — this is expected, not a bug.
- **Rule added:** Always set monetary value on the GHL opportunity when a paying member joins.
- **Updated:** Pipeline structure changed from HCP/Downsell to 1-2-1 ($2,500) and Community ($997) as equal offers. Old stage names ("Joined HCP", "Offered Community") removed from script and replaced with "Joined 1-2-1", "Offer Sent", "Joined Community".
- **Updated:** Conv rate now calculated against Offers Sent (not Applications).

### 2026-06-22 (session 1 — dashboard rules)
- Added GA4 timezone bug section — `ga4DateStr()` resolves BST dates one day early in UTC; fix is to hardcode `"2026-06-17"` for month/year/all-time GA4 calls
- Added lead tracking tag removal risk rule — never remove "meditation download" tag in workflows; use "Remove from workflow" instead
- Added opt-in tracking source of truth note — dashboard uses webhook-based tag count, not GHL native stats
- Added tag management rules for pipeline progression — correct sequence when contact applies
- Added EXCLUDED_PAGES rule for preview URLs
