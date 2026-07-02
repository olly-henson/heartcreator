# Regulate & Restore — Delivery System

> This document covers the full program structure, tracking system, and automation logic for the Regulate & Restore 6-Week Intensive. Read this before making any changes to the delivery infrastructure.

---

## Program Structure

### Stage 1 — Regulate & Restore 6-Week Intensive ($397)
A self-paced program with structured weekly tracking and live group support.

**What's included:**
- Access to private Skool Classroom with daily progressive meditation practice
- Baseline score submission on day 1 (9 health metrics, 1–10 scale)
- Weekly check-in form sent every 7 days for weeks 1–5
- Final check-in form sent at week 6 (includes usual scores + 4 qualitative questions)
- Automated progress report sent to client and Olly after each check-in
- Final summary report at Week 6 comparing start vs. end scores
- Weekly group Q&A calls

**Core argument behind the program:**
The reason clients aren't getting better is not lack of effort — it's that their nervous system is stuck in survival mode. Stage 1 teaches self-regulation. The body can then do what it was designed to do: heal.

### Stage 2 — Membership ($150/month or $1,500/year)
For clients who complete Stage 1 and want to go deeper.

**What's included:**
- Subconscious reprogramming work
- Identity-level change (so clients don't need to white-knuckle self-regulation every day)
- Ongoing community and calls

**The logic:** Stage 1 creates belief ("this works"). Stage 2 creates transformation ("I am different"). One naturally sells the other — results do the convincing.

> **Note:** The Stage 2 upsell has NOT been added to the Week 6 final email yet. It was deliberately left out pending proof of concept. Add it once client results data exists.

---

## Tracking System — Google Sheets

**Sheet name:** Regulate & Restore Tracking Sheet (Active)

**Tabs:**

| Tab | Purpose |
|-----|---------|
| `Baseline Responses` | Linked to Baseline Results Google Form via Zapier. Captures day-1 scores. |
| `Weekly Responses` | Linked to Weekly Check-in Google Form via Zapier. Captures weekly scores + meditation count + wins + needs. Used for weeks 1–5 only. |
| `Final Responses` | Linked to Final Check-in Google Form via Zapier. Used for week 6 only. Captures scores + meditations + 4 qualitative questions. |
| `Sent Log` | Auto-managed by script. Tracks when weekly reminder emails were sent to prevent duplicates. |
| `Master` | Auto-created by script. Live dashboard of all active clients. |
| `Completed Program` | Auto-created by script. Archive of clients who finished Week 6. |

### Master Tab Columns
Name | Email | Start Date | Program End Date | Next Check-In | Week | Pain | Energy | Anxiety | Calmness | Sleep | Depressive Thoughts | Focus | Mood | Stress Resilience | Total Meditations to Date | Wins This Week | Needs Help With

- Score columns (Pain through Stress Resilience) show **baseline scores** until the first check-in, then switch to **delta values** (e.g. `-3`, `+5`) colour-coded green/red/yellow
- Total Meditations to Date accumulates across all weeks — script reads existing value and adds each week's count on top
- Dates display as `d MMMM yyyy` (e.g. 19 May 2026) — set automatically by the script

### Completed Program Tab Columns
Name | Email | Start Date | Program End Date | Completion Date | Pain | Energy | Anxiety | Calmness | Sleep | Depressive Thoughts | Focus | Mood | Stress Resilience | Total Meditations | How do you feel now? | Biggest positive | Would you recommend? | Improvements

- Score columns show **delta values** from baseline (e.g. `-7`, `+6`) with the same colour coding as Master tab
- Qualitative answers come from the Final Check-in form
- All date columns formatted as `d MMMM yyyy` automatically

### Colour Coding

| Colour | Meaning |
|--------|---------|
| `#66bb6a` bright green | Improved (direction-aware — lower is better for Pain, Anxiety, Depressive Thoughts) |
| `#e57373` bright red | Declined |
| `#fff176` bright yellow | No change |

---

## Tracking Metrics (9 total, scored 1–10)

| Metric | Direction | Scale |
|--------|-----------|-------|
| Pain | Lower is better | 1 = none, 10 = severe |
| Energy | Higher is better | 1 = none, 10 = full |
| Anxiety | Lower is better | 1 = none, 10 = severe |
| Calmness | Higher is better | 1 = none, 10 = very calm |
| Sleep | Higher is better | 1 = terrible, 10 = excellent |
| Depressive Thoughts | Lower is better | 1 = none, 10 = severe |
| Focus | Higher is better | 1 = none, 10 = sharp |
| Mood | Higher is better | 1 = very low, 10 = excellent |
| Stress Resilience | Higher is better | 1 = none, 10 = very high |

---

## Google Forms

### Form 1 — Baseline Results
Submitted by client on day 1 of the program. Linked to sheet via Zapier.

**Questions in this exact order:**
1. Email
2. Full Name
3. Pain (1–10)
4. Energy (1–10)
5. Anxiety (1–10)
6. Calmness (1–10)
7. Sleep (1–10)
8. Depressive Thoughts (1–10)
9. Focus (1–10)
10. Mood (1–10)
11. Stress Resilience (1–10)

Responses linked to → `Baseline Responses` tab

### Form 2 — Weekly Check-in (Weeks 1–5)
**URL:** https://forms.gle/Jmr3FBMAftPqtffq5

Linked to sheet via Zapier. Used for weeks 1–5 only — week 6 uses the Final Check-in form.

**Questions in this exact order:**
1. Email
2. Full Name
3. Pain (1–10)
4. Energy (1–10)
5. Anxiety (1–10)
6. Calmness (1–10)
7. Sleep (1–10)
8. Depressive Thoughts (1–10)
9. Focus (1–10)
10. Mood (1–10)
11. Stress Resilience (1–10)
12. How many meditations did you do this week?
13. Wins this week
14. Anything you need help with?

Responses linked to → `Weekly Responses` tab

### Form 3 — Final Check-in (Week 6 only)
**URL:** https://docs.google.com/forms/d/e/1FAIpQLSdD5T7eG0D4wFoY3RoXG_y5Ju3dVcXhSMOVTGBwtEWMtRkUHA/viewform?usp=publish-editor

Linked to sheet via Zapier. Sent at week 6 instead of the regular weekly form. Includes the usual scores and meditations plus 4 qualitative questions.

**Questions in this exact order:**
1. Email
2. Full Name
3. Pain (1–10)
4. Energy (1–10)
5. Anxiety (1–10)
6. Calmness (1–10)
7. Sleep (1–10)
8. Depressive Thoughts (1–10)
9. Focus (1–10)
10. Mood (1–10)
11. Stress Resilience (1–10)
12. How many meditations did you do this week?
13. How do you feel now compared to when you started this program?
14. What's your biggest positive to take from completing this program?
15. Would you recommend this program to others?
16. Is there anything you think could make this program better?

Responses linked to → `Final Responses` tab

> **Important:** The column order in the Final Responses tab must match `FINAL_COLS` in the script exactly. If Zapier maps columns in a different order, update `FINAL_COLS` to match.

---

## Apps Script Automation

**Script file:** `C:\Users\Olly\AI OS\Delivery\progress-tracker.gs`

### How it works

**Polling (every 5 minutes):**
The script polls three tabs — Baseline Responses, Weekly Responses, and Final Responses — for new rows it hasn't processed yet. Row position is stored in Script Properties: `lastBaselineRow`, `lastWeeklyRow`, `lastFinalRow`.

**Daily trigger (9am):**
Checks the Master tab for any client whose Next Check-In date matches today. Sends the weekly form link for weeks 1–5, or the final form link at week 6.

### Email flows

| Trigger | Emails sent |
|---------|------------|
| New baseline submission | Confirmation to client + notification to Olly |
| New weekly check-in (weeks 1–5) | Progress report to client + progress report to Olly |
| New final check-in (week 6) | Final summary report to client + final report to Olly, then client moved to Completed Program tab |
| Daily check (9am), weeks 1–5 | Weekly check-in reminder with regular form link |
| Daily check (9am), week 6 | Final check-in reminder with final form link |

### Email subjects

| Email | Subject |
|-------|---------|
| Baseline confirmation (client) | `Regulate & Restore starts now` |
| Baseline notification (Olly) | `[Name] has started Regulate & Restore` |
| Weekly reminder (client) | `Your week X check-in — Regulate & Restore Program` |
| Final check-in reminder (client) | `Your final check-in — Regulate & Restore Program` |
| Weekly progress report (client) | `Your week X progress report — Regulate & Restore Program` |
| Final progress report (client) | `Your final progress report — Regulate & Restore Program` |
| Weekly progress report (Olly) | `[Progress report] Name — Week X` |
| Final progress report (Olly) | `[Final report] Name — 6-week summary` |

### Key CONFIG values

```javascript
OLLY_EMAIL:        'olly@ollyhenson.com'
RESEND_API_KEY:    'PASTE_YOUR_RESEND_API_KEY_HERE'  // replace with actual key from resend.com
WEEKLY_FORM_URL:   'https://forms.gle/Jmr3FBMAftPqtffq5'
FINAL_FORM_URL:    'https://docs.google.com/forms/d/e/1FAIpQLSdD5T7eG0D4wFoY3RoXG_y5Ju3dVcXhSMOVTGBwtEWMtRkUHA/viewform?usp=publish-editor'
CLASSROOM_URL:     'https://www.skool.com/the-healing-code-8609/classroom/568dd6c7?md=89c28755c54349259564a5c75425185e'
SKOOL_PROFILE_URL: 'https://www.skool.com/@olly-henson'
BASELINE_SHEET:    'Baseline Responses'
WEEKLY_SHEET:      'Weekly Responses'
FINAL_SHEET:       'Final Responses'
SENT_LOG_SHEET:    'Sent Log'
MASTER_SHEET:      'Master'
COMPLETED_SHEET:   'Completed Program'
TOTAL_WEEKS:       6
```

---

## Setup Instructions (run in this order)

1. Open the correct Google Sheet
2. Go to **Extensions > Apps Script**
3. Paste the full script from `progress-tracker.gs` and save
4. Run **`initializeTracking()`** — sets the starting rows so existing data is ignored
5. Run **`setupTriggers()`** — approve all permissions when prompted
6. Submit a test baseline entry and wait up to 5 minutes for emails to arrive
7. Check Executions tab in Apps Script to confirm `checkNewSubmissions` ran successfully

### Test functions available

| Function | What it tests |
|----------|--------------|
| `testBaselineConfirmation` | Sends baseline confirmation email to Olly's inbox |
| `testWeeklyReminder` | Sends Week 1 reminder email to Olly's inbox |
| `testFinalReminder` | Sends the final check-in reminder email to Olly's inbox |
| `testReport` | Sends a mid-program progress report (Week 3) to Olly's inbox |
| `testFinalReport` | Sends the Week 6 final summary report to Olly's inbox |
| `debugTracking` | Logs all counter values vs actual sheet row counts — run this first when troubleshooting |

### Test CSV files (for bypassing Zapier during testing)

| File | Purpose |
|------|---------|
| `test-baseline.csv` | One baseline row for olly@ollyhenson.com |
| `test-weekly.csv` | Five weekly rows (weeks 1–5) for olly@ollyhenson.com |
| `test-final.csv` | One final check-in row for olly@ollyhenson.com |

Paste rows directly into the relevant sheet tab — no Zapier tasks consumed.

---

## Email Delivery — Resend Integration

All emails are sent via **Resend** (resend.com) using `UrlFetchApp` to call the Resend API. This replaced `MailApp` and `GmailApp` which both failed to deliver to Hotmail/Outlook addresses.

### Why Resend
- `MailApp` and `GmailApp` send through Google's generic infrastructure — Hotmail/Outlook rejects these
- Resend sends with proper DKIM authentication tied to the verified `ollyhenson.com` domain
- Emails now deliver reliably to Gmail, Hotmail, and any other inbox

### DNS Setup
- Domain: `ollyhenson.com`
- DNS managed by: **Cloudflare** (nameservers: `james.ns.cloudflare.com`, `mariah.ns.cloudflare.com`)
- IONOS is the domain registrar but DNS is NOT managed there — records added to IONOS are inactive
- DKIM records for Resend were added in Cloudflare
- Domain verified in Resend dashboard

---

## Known Gotchas

**appendRow strips the "+" from positive delta values**
Google Sheets interprets `+6` as the number `6` when written via `appendRow`. All metric delta values must be written cell by cell using `setValue` to preserve the `+` prefix. This applies to both the Master tab and the Completed Program tab.

**Row counter drift during testing**
If rows are deleted from a response tab during testing, the `lastXxxRow` counter can end up ahead of the actual row count, causing new submissions to be silently skipped. The script has a self-healing guard that auto-resets when it detects this, but if it happens manually, run `debugTracking` and correct the counter in Script Properties.

**Re-testing with the same email**
`getClientBaseline` always returns the most recent baseline row for an email address, so the same email can be reused. But the client must not already exist in the Master tab — delete their Master row before re-testing. Reset the relevant counter in Script Properties by 1 if needed.

**Final form counter already advanced**
If the script runs and finds the client missing from Master (already moved to Completed Program by a previous run), `processFinalRow` returns early without writing anything. To re-test: clear the Completed Program row, manually add the client back to Master, reset `lastFinalRow` to one less than the actual final sheet row count, then run `checkNewSubmissions`.

---

## Decisions Made & Reasons

| Decision | Reason |
|----------|--------|
| Separate final form for week 6 | Week 6 needs qualitative feedback questions that don't belong in the regular check-in — cleaner UX and cleaner data |
| Weekly form skips week 6 | If a week 6 row arrives via the weekly form, the script ignores it — final form handles completion |
| Completed Program tab shows deltas, not raw start/end | Colour-coded deltas give an instant visual of overall result — raw scores still available in Baseline Responses tab |
| Total Meditations accumulates across weeks | Running total is more meaningful than single-week count — script reads existing value and adds each week's count |
| Script sets date format automatically | `d MMMM yyyy` format applied by script on every date cell it writes — no manual formatting needed |
| Polling instead of form submit trigger | Form submit trigger is unreliable when forms are linked via Zapier rather than native Google Forms linking |
| No Stage 2 upsell in Week 6 email | Proof of concept first — add the upsell once results data validates the program |
| $397 launch price | Below the $500 psychological barrier, accessible for the audience. To be raised to $497 once client results data exists |
| Clients moved to Completed Program at Week 6 | Keeps Master tab clean and focused on active clients only |
| Switched from GmailApp to Resend API | GmailApp deliverability to Hotmail/Outlook failed — Resend with verified domain solves this permanently |
| Response tabs are append-only | Never delete rows from response tabs — the row counter does not reset when rows are deleted |

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| No emails sent after form submission | Counter ahead of sheet rows | Run `debugTracking`. If counter > sheet rows, update the counter in Script Properties to match actual row count |
| "Client already in Master" in logs | Client exists from a previous run | Delete from Master, reset counter by 1 in Script Properties, re-run `checkNewSubmissions` |
| Emails not arriving at Hotmail | Resend API key missing or wrong in CONFIG | Check `RESEND_API_KEY` in script, run `testBaselineConfirmation` and check Resend dashboard |
| Final form processed but nothing written to Completed Program | Client was already moved to Completed Program by a previous run | Clear Completed Program row, re-add client to Master manually, reset `lastFinalRow` by 1, re-run `checkNewSubmissions` |
| "+" missing from delta values in Completed Program | appendRow strips "+" — fixed in current script | Ensure metric cells are written via `setValue` not via `appendRow` |
| Dates showing wrong format | Column not formatted, or script didn't apply format | Script auto-applies `d MMMM yyyy` — if still wrong, manually format the cell |

---

## Important Operating Rules

- **Never delete rows from Baseline Responses, Weekly Responses, or Final Responses tabs.** These are append-only.
- **Never manually edit metric cells in the Master tab after Week 1.** The script overwrites them on each check-in.
- **Leave the Completed Program tab blank on first setup.** The script creates the header row when the first client finishes week 6.
- **Do not use `appendRow` for delta values.** Always use `setValue` cell by cell to preserve the `+` prefix.

---

## What's Still To Build

- [ ] Stage 2 upsell email at Week 6 (pending proof of concept)
- [ ] Sales page for the 6-week intensive
- [ ] Onboarding sequence (between purchase and baseline form submission)
- [ ] ManyChat automation linking to the baseline form for new buyers
