# Release & Let Go — Delivery System

> This document covers the full program structure, tracking system, and automation logic for the Release & Let Go 30-Day Program. Read this before making any changes to the delivery infrastructure.

---

## Program Structure

### Release & Let Go 30-Day Program
A self-paced program about helping people let go of their past so that they can step into their chosen future. Includes structured weekly tracking and automated progress reporting.

**What's included:**
- Access to private Skool Classroom with daily practice
- Baseline score submission on day 1 (4 wellbeing metrics, 1–10 scale)
- Weekly check-in form sent every 7 days for weeks 1–3
- Final check-in form sent at week 4 (includes usual scores + 4 qualitative questions)
- Automated progress report sent to client and Olly after each check-in
- Final summary report at week 4 comparing start vs. end scores

---

## Tracking System — Google Sheets

**Sheet name:** Release & Let Go Tracking Sheet (Active)

**Tabs:**

| Tab | Purpose |
|-----|---------|
| `Baseline Responses` | Linked to Baseline Google Form natively. Captures day-1 scores. |
| `Weekly Responses` | Linked to Weekly Check-in Google Form natively. Captures weekly scores + meditation count + wins + needs. Used for weeks 1–3 only. |
| `Final Responses` | Linked to Final Check-in Google Form natively. Used for week 4 only. Captures scores + meditations + 4 qualitative questions. |
| `Sent Log` | Auto-managed by script. Tracks when weekly reminder emails were sent to prevent duplicates. |
| `Master` | Auto-created by script. Live dashboard of all active clients. |
| `Completed Program` | Auto-created by script. Archive of clients who finished week 4. |

> **No Zapier required.** Each Google Form is linked directly to its sheet tab via Google Forms (Responses > Link to Sheets). The script polls for new rows — no Zapier setup needed.

### Master Tab Columns
Name | Email | Start Date | Program End Date | Next Check-In | Status | Week | Sense of Lightness | Energy | Calmness | Clarity of Mind | Total Meditations to Date | Wins This Week | Needs Help With

- Score columns show **baseline scores** until the first check-in, then switch to **delta values** (e.g. `-2`, `+5`) colour-coded green/red/yellow
- Total Meditations to Date accumulates across all weeks
- Dates display as `d MMMM yyyy` (e.g. 24 June 2026) — set automatically by the script

### Completed Program Tab Columns
Name | Email | Start Date | Program End Date | Completion Date | Sense of Lightness | Energy | Calmness | Clarity of Mind | Total Meditations | How do you feel now? | Biggest positive | Would you recommend? | Improvements

- Score columns show **delta values** from baseline with the same colour coding as Master tab
- Qualitative answers come from the Final Check-in form

### Colour Coding

| Colour | Meaning |
|--------|---------|
| `#66bb6a` bright green | Improved |
| `#e57373` bright red | Declined |
| `#fff176` bright yellow | No change |

---

## Tracking Metrics (4 total, scored 1–10)

All four metrics are "higher is better."

| Metric | Scale |
|--------|-------|
| Sense of Lightness | 1 = very heavy, 10 = completely light |
| Energy | 1 = none, 10 = full |
| Calmness | 1 = none, 10 = very calm |
| Clarity of Mind | 1 = foggy, 10 = crystal clear |

---

## Google Forms

> **Linking forms to sheets:** In Google Forms, go to Responses > click the Sheets icon > link to an existing spreadsheet (the tracking sheet) and name each tab exactly as shown below. The script reads from these tab names.

### Form 1 — Baseline Results
Submitted by client on day 1 of the program.

**Responses tab name:** `Baseline Responses`

**Questions in this exact order:**
1. Email
2. Full Name
3. Sense of Lightness (1–10)
4. Energy (1–10)
5. Calmness (1–10)
6. Clarity of Mind (1–10)

### Form 2 — Weekly Check-in (Weeks 1–3)
Used for weeks 1–3 only — week 4 uses the Final Check-in form.

**Responses tab name:** `Weekly Responses`

**Questions in this exact order:**
1. Email
2. Full Name
3. Sense of Lightness (1–10)
4. Energy (1–10)
5. Calmness (1–10)
6. Clarity of Mind (1–10)
7. How many meditations did you do this week?
8. Wins this week
9. Anything you need help with?

### Form 3 — Final Check-in (Week 4 only)
Sent at week 4 instead of the regular weekly form. Includes the usual scores and meditations plus 4 qualitative questions.

**Responses tab name:** `Final Responses`

**Questions in this exact order:**
1. Email
2. Full Name
3. Sense of Lightness (1–10)
4. Energy (1–10)
5. Calmness (1–10)
6. Clarity of Mind (1–10)
7. How many meditations did you do this week?
8. How do you feel now compared to when you started this program?
9. What's your biggest positive to take from completing this program?
10. Would you recommend this program to others?
11. Is there anything you think could make this program better?

> **Important:** The column order in each Responses tab must match the COLS / FINAL_COLS constants in the script exactly. The tab name must match CONFIG exactly (case-sensitive).

---

## Apps Script Automation

**Script file:** `C:\Users\Olly\AI OS\Delivery\heal-and-let-go-tracker.gs`

### How it works

**Polling (every 5 minutes):**
The script polls three tabs — Baseline Responses, Weekly Responses, and Final Responses — for new rows it hasn't processed yet. Row position is stored in Script Properties: `lastBaselineRow`, `lastWeeklyRow`, `lastFinalRow`.

**Daily trigger (9am):**
Checks the Master tab for any client whose Next Check-In date matches today. Sends the weekly form link for weeks 1–3, or the final form link at week 4.

### Email flows

| Trigger | Emails sent |
|---------|------------|
| New baseline submission | Confirmation to client + notification to Olly |
| New weekly check-in (weeks 1–3) | Progress report to client + progress report to Olly |
| New final check-in (week 4) | Final summary report to client + final report to Olly, then client moved to Completed Program tab |
| Daily check (9am), weeks 1–3 | Weekly check-in reminder with regular form link |
| Daily check (9am), week 4 | Final check-in reminder with final form link |

### Email subjects

| Email | Subject |
|-------|---------|
| Baseline confirmation (client) | `Release & Let Go starts now` |
| Baseline notification (Olly) | `[Name] has started Release & Let Go` |
| Weekly reminder (client) | `Your week X check-in — Release & Let Go Program` |
| Final check-in reminder (client) | `Your final check-in — Release & Let Go Program` |
| Weekly progress report (client) | `Your week X progress report — Release & Let Go Program` |
| Final progress report (client) | `Your final progress report — Release & Let Go Program` |
| Weekly progress report (Olly) | `[Progress report] Name — Week X` |
| Final progress report (Olly) | `[Final report] Name — 30-day summary` |

### Key CONFIG values to fill in before going live

```javascript
RESEND_API_KEY:  // paste from resend.com — same key used for Regulate for Relief
WEEKLY_FORM_URL: // shareable link from Form 2 once created
FINAL_FORM_URL:  // shareable link from Form 3 once created
CLASSROOM_URL:   // Skool classroom URL once set up
```

---

## Setup Instructions (run in this order)

1. Create a new Google Sheet: **Release & Let Go Tracking Sheet (Active)**
2. Manually create these tabs: `Baseline Responses`, `Weekly Responses`, `Final Responses`, `Sent Log`
3. Create all three Google Forms with questions in the exact order above
4. Link each form to the sheet: Responses > Sheets icon > select the tracking sheet > name the tab exactly as above
5. Go to **Extensions > Apps Script** in the sheet
6. Paste the full script from `heal-and-let-go-tracker.gs` and save
7. Fill in `RESEND_API_KEY`, `WEEKLY_FORM_URL`, `FINAL_FORM_URL`, `CLASSROOM_URL` in CONFIG
8. Run **`initializeTracking()`** — sets the starting rows so existing data is ignored
9. Run **`setupTriggers()`** — approve all permissions when prompted
10. Submit a test baseline entry and wait up to 5 minutes for emails to arrive
11. Check Executions tab in Apps Script to confirm `checkNewSubmissions` ran successfully

### Test functions available

| Function | What it tests |
|----------|--------------|
| `testBaselineConfirmation` | Sends baseline confirmation email to Olly's inbox |
| `testWeeklyReminder` | Sends Week 1 reminder email to Olly's inbox |
| `testFinalReminder` | Sends the final check-in reminder email to Olly's inbox |
| `testReport` | Sends a mid-program progress report (Week 2) to Olly's inbox |
| `testFinalReport` | Sends the Week 4 final summary report to Olly's inbox |
| `debugTracking` | Logs all counter values vs actual sheet row counts — run this first when troubleshooting |

---

## Email Delivery — Resend Integration

All emails are sent via **Resend** (resend.com) using `UrlFetchApp` to call the Resend API. Same setup and API key as Regulate for Relief — domain `ollyhenson.com` is already verified in Resend and DNS is managed in Cloudflare.

---

## Status Thresholds (Master tab)

With 4 metrics, thresholds are adjusted from Regulate for Relief:

| Status | Condition |
|--------|-----------|
| 🟢 Going Well | 3 or more metrics improved |
| 🟡 Going Okay | 2 metrics improved |
| 🔴 Needs Help | 2 or more metrics declined |
| 🟠 Might Need Help | Otherwise |

Olly also receives a ⚠️ flag in his progress report email when 2 or more metrics have declined.

---

## Known Gotchas

**`appendRow` strips the "+" from positive delta values**
Google Sheets interprets `+6` as the number `6` when written via `appendRow`. All metric delta values must be written cell by cell using `setValue` to preserve the `+` prefix.

**Row counter drift during testing**
If rows are deleted from a response tab during testing, the counter can end up ahead of the actual row count, causing new submissions to be silently skipped. Run `debugTracking` and correct the counter in Script Properties if this happens.

**Re-testing with the same email**
`getClientBaseline` always returns the most recent baseline row for an email address, so the same email can be reused. But the client must not already exist in the Master tab — delete their Master row before re-testing.

**Tab names are case-sensitive**
The script looks for tab names exactly as defined in CONFIG. If the form creates a tab with a slightly different name, the script won't find it. Check the tab name matches CONFIG exactly.

**Native form linking creates a header row automatically**
When you link a form to a sheet, Google Forms writes a header row (row 1) with question titles. `initializeTracking()` sets `lastBaselineRow = 1` to skip this row — so run it after linking but before any real submissions arrive.

---

## Important Operating Rules

- **Never delete rows from Baseline Responses, Weekly Responses, or Final Responses tabs.** These are append-only.
- **Never manually edit metric cells in the Master tab after Week 1.** The script overwrites them on each check-in.
- **Leave the Completed Program tab blank on first setup.** The script creates the header row when the first client finishes week 4.
- **Do not use `appendRow` for delta values.** Always use `setValue` cell by cell to preserve the `+` prefix.
- **Do not delete rows from a response tab during testing.** Reset counters in Script Properties instead.

---

## What's Still To Build

- [ ] Three Google Forms (Baseline, Weekly, Final)
- [ ] Google Sheet with correct tab names
- [ ] Skool classroom for Release & Let Go
- [ ] Fill in CONFIG placeholders (form URLs, classroom URL, Resend key)
- [ ] Run setup functions and test the full flow
- [ ] Sales page
- [ ] Onboarding sequence (between purchase and baseline form submission)
