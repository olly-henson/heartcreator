# Regulate & Restore Tracker — Skills File

> This file tells Claude exactly how to work with the Regulate & Restore delivery system — how to edit the script, update the share worker, test changes, and what never to do. Read this before making any changes.

---

## Key File Paths

Always share these paths with Olly so he can find files immediately:

| File | Path |
|------|------|
| Apps Script | `C:\Users\Olly\AI OS\Delivery\progress-tracker.gs` |
| Share Worker | `C:\Users\Olly\AI OS\Delivery\share-worker.js` |
| Delivery System Docs | `C:\Users\Olly\AI OS\Delivery\regulate-restore-delivery-system.md` |
| Test Baseline CSV | `C:\Users\Olly\AI OS\Delivery\test-baseline.csv` |
| Test Weekly CSV | `C:\Users\Olly\AI OS\Delivery\test-weekly.csv` |
| Test Final CSV | `C:\Users\Olly\AI OS\Delivery\test-final.csv` |

**Rule:** Always state the full file path after every edit so Olly can copy it immediately. Never bury paths in explanatory text.

---

## How the System Works

**Stack:** Google Sheets + Google Apps Script + Resend API + Cloudflare Worker

**Sheet:** Regulate & Restore Tracking Sheet (Active)

| Tab | Purpose |
|-----|---------|
| Baseline Responses | Day 1 scores — append only, linked via Zapier |
| Weekly Responses | Weekly check-ins weeks 1–5 — append only, linked via Zapier |
| Final Responses | Week 6 check-in — append only, linked via Zapier |
| Sent Log | Auto-managed — tracks reminder emails to prevent duplicates |
| Master | Auto-created by script — live dashboard of active clients |
| Completed Program | Auto-created by script — archive of finished clients |

**Two triggers run the system:**
- `checkNewSubmissions` — polls every 5 minutes for new form rows
- `sendWeeklyReminders` — fires daily at 9am to send check-in reminder emails

---

## Script Structure

### CONFIG (top of file)
All URLs, email addresses, sheet names and API keys live here. Change values here only — never hardcode them elsewhere in the script.

### Column Constants

**COLS** — Baseline Responses and Weekly Responses tabs (0-based index):
`TIMESTAMP(0), EMAIL(1), NAME(2), PAIN(3), ENERGY(4), ANXIETY(5), CALMNESS(6), SLEEP(7), DEPRESSIVE(8), FOCUS(9), MOOD(10), RESILIENCE(11), MEDITATIONS(12), WINS(13), NEEDS(14)`

**FINAL_COLS** — Final Responses tab (0-based index):
`TIMESTAMP(0), EMAIL(1), NAME(2), PAIN(3)–RESILIENCE(11), MEDITATIONS(12), HOW_FEEL(13), BIGGEST_POS(14), RECOMMEND(15), IMPROVEMENTS(16)`

**MC** — Master sheet (0-based index):
`NAME(0), EMAIL(1), START_DATE(2), END_DATE(3), NEXT_CHECKIN(4), STATUS(5), CURRENT_WEEK(6), PAIN(7)–RESILIENCE(15), MEDITATIONS(16), WINS(17), NEEDS(18)`

> **Critical:** If a column is ever added or removed from a sheet, MC/COLS/FINAL_COLS must be updated to match. All script logic references these constants — never hardcode column numbers.

### METRICS Array
Defines all 9 tracked metrics with their `direction` (`up` = higher is better, `down` = lower is better). This drives colour coding and status calculation across the whole script. If a metric is ever added or renamed, update this array.

---

## Email Flows

### What gets sent and to whom

| Trigger | Client receives | Olly receives |
|---------|----------------|---------------|
| Baseline submitted | Confirmation email | Notification with client name + email |
| Weekly check-in (weeks 1–5) | Progress report with metrics table, status, wins, needs | Same report with improved/declined counts, status, flagging if 3+ declined |
| Final check-in (week 6) | Final report with metrics table, Your Experience section, share link | Final report with Client Experience section, share links, qualitative answers |
| Daily trigger (week 1–5 due) | Weekly check-in reminder with form link | Nothing |
| Daily trigger (week 6 due) | Final check-in reminder with final form link | Nothing |

### Status labels (Olly's report only — never shown to client)
- 🟢 Going Well — more metrics improved than declined
- 🟡 Stayed the Same — improved and declined counts are equal
- 🔴 Needs Help — more metrics declined than improved

### Flagging
If 3 or more metrics decline vs baseline, Olly's report shows a red ⚠️ flag suggesting a personal check-in.

### Email sender
All emails sent via Resend API (`olly@ollyhenson.com`). DNS managed in Cloudflare — NOT IONOS. If emails stop delivering, check the Resend dashboard and Cloudflare DNS records.

---

## Share Worker — URL Types

**File:** `C:\Users\Olly\AI OS\Delivery\share-worker.js`
**Deployed to:** `share.ollyhenson.com` via Cloudflare Workers

The `type` URL parameter controls what the share page shows:

| type | Heading | Button | Used for |
|------|---------|--------|----------|
| `win` | Share your win | Share in Community | Client weekly wins |
| `help` | Ask for help in the community | Get help in the community | Client needs help |
| `coach` | Your client needs help with | Respond in Community | Olly responding to client needs |
| `results` | Share client results | Share results | Olly sharing client results |
| `final` | Share Your Results | Share with the community | Client sharing final results |

**To add a new type:** Add a new condition to both the `heading` and `buttonText` ternary chains in `share-worker.js`, then redeploy to Cloudflare.

> **Important:** After editing `share-worker.js`, Olly must redeploy it in the Cloudflare dashboard. Script changes go live automatically when pasted into Apps Script — worker changes do not.

---

## Testing Process

### Standard test flow
1. Run `debugTracking` — confirm all counters match actual sheet row counts
2. Paste test CSV rows into the relevant sheet tab (Baseline, Weekly, or Final Responses)
3. Run `checkNewSubmissions` manually — no need to wait for the trigger
4. Check inbox and Master tab for results

### Test CSV files
- `test-baseline.csv` — Marcus Webb (poor results test client), `olly@ollyhenson.com`
- `test-weekly.csv` — 5 weekly rows for Marcus Webb showing declining/stagnant scores
- `test-final.csv` — Final check-in for Marcus Webb with honest qualitative answers

### Counter management
Counters (`lastBaselineRow`, `lastWeeklyRow`, `lastFinalRow`) live in Script Properties. They track the last processed row number in each response tab.

- **To re-process a row:** Set the counter to N-1 (one less than the row number), then run `checkNewSubmissions`
- **To skip all existing rows:** Run `initializeTracking` — sets all counters to current row counts
- **Self-healing guard:** If a counter is ahead of actual rows (e.g. after deleting test data), the script resets it automatically on the next run

### Re-testing with the same email
The script uses email address as the unique client identifier. To re-test with the same email:
1. Delete the client's row from the Master tab
2. Reset the relevant counter by 1 in Script Properties
3. Run `checkNewSubmissions`

### Master tab gotcha
The Master tab header row is only written when the tab doesn't exist at all. If you clear the rows but leave the tab, the script will append data without headers. **Always delete the entire Master tab** when resetting for a test, not just the rows.

---

## Critical Rules — Never Break These

1. **Never delete rows from Baseline Responses, Weekly Responses, or Final Responses.** These tabs are append-only. Deleting rows causes the counter to skip new submissions.
2. **Never use appendRow for delta values.** Google Sheets strips the `+` prefix. Always use `setValue` cell by cell for metric cells.
3. **processWeeklyRow skips week 6.** Week 6 is handled exclusively by processFinalRow. If a week 6 row arrives via the weekly form, it is silently ignored.
4. **Never manually edit metric cells in Master after week 1.** The script overwrites them on each check-in.
5. **Resend daily quota.** If the quota is exceeded, emails fail silently (`muteHttpExceptions: true`) — sheet operations still complete. Check the Resend dashboard if emails stop arriving.
6. **Never instruct Olly to manually create response tabs.** Google Forms creates them automatically when a form is linked to a sheet. Telling Olly to create them manually causes confusion and duplicate tabs.
7. **Never include the baseline form URL in CONFIG.** The baseline form links natively to the sheet — the script reads from the sheet, not the form. Only forms that are sent to clients as links (weekly, final, monthly, manifestation) belong in CONFIG.
8. **Never use paragraph text as test data for multiple-choice questions.** Test functions must use the exact option text the form presents (e.g. "Not confident" not "I'm not very confident at all"). Mismatched test data produces misleading results.
9. **Never describe a program in days when TOTAL_WEEKS drives the end date.** TOTAL_WEEKS=4 means the final check-in fires at day 28, not day 30. Use weeks in all email copy to match. If the program is described in days, confirm with Olly which is correct before writing email wording.
10. **Never clear the Completed Clients tab in the Master Sheet.** It is append-only so retakes build a second row rather than overwriting history.
11. **Always write "program" not "programme".** Olly uses American spelling. This applies to all files — scripts, docs, email copy, comments, everything.
12. **When renaming a program, search for all hardcoded name variants in email body HTML — not just CONFIG values.** A global find-replace on the program name will catch subjects, comments, and variable values but will miss hardcoded strings buried inside HTML email bodies (e.g. a meditation name written as prose). After any rename, grep the full script for the old name and any related phrases before closing.

---

## Building a New Program Tracker

All new program trackers follow the Regulate & Restore pattern. When building a new one:

### Form column order — always
Olly always puts **Full Name first, Email second** on every form. COLS must reflect this:
`TIMESTAMP(0), NAME(1), EMAIL(2), [metrics...]`
Never build scripts with Email before Name — this has been corrected multiple times.

### Google Forms linking (not Zapier)
All new programs use native Google Forms → Google Sheets linking. No Zapier setup needed. The polling pattern (`checkNewSubmissions` every 5 minutes) is unchanged — it reads from the linked sheet tab automatically.

### Response tabs
Google Forms creates response tabs automatically when a form is linked to a sheet. Never instruct Olly to create them manually.

### Share worker
The share worker at `share.ollyhenson.com` is universal — it uses "Heart Creator Community" branding and works across all programs. No program-specific worker changes are needed for new builds.

### Step-by-step setup sequence for Olly
Always take Olly through these steps one at a time, waiting for confirmation at each:
1. Create the Google Sheet with correct tab names
2. Create and link each Google Form (Google Forms creates response tabs automatically)
3. Paste script into Apps Script, add Resend API key
4. Run `initializeTracking`
5. Run `setupTriggers`
6. Run `testBaselineConfirmation` — verify email arrives
7. Run `testWeeklyReminder` (or equivalent)
8. Run `testMonthlyReport` / `testWeeklyReport` — verify progress report
9. Run `testFinalReport` / `testManifestationCelebration` — verify completion email

### Master Sheet — dynamic header finding
The Master Client Tracker uses `findCol()` with multiple candidate names because each program has different column headers. When adding a new program to the Master Sheet:
- Add it to the `PROGRAMMES` array with correct `sheetId`, `masterTab`, `completedTab`, `interval` (weekly/monthly), and `scoreFields`
- `scoreFields` must match the exact lowercase header names in that program's Master tab

---

## How to Make Script Changes

1. Edit `C:\Users\Olly\AI OS\Delivery\progress-tracker.gs` locally
2. Tell Olly the file path so he can find it immediately
3. Olly pastes the full updated script into Apps Script (Extensions > Apps Script), saves, and runs any required setup functions
4. For share worker changes: edit `C:\Users\Olly\AI OS\Delivery\share-worker.js` locally, then Olly redeploys via Cloudflare dashboard

### When adding new Master columns
If a column is added to the Master sheet:
- Update `MC` constants (shift all subsequent indices by +1)
- Update `addToMaster` header row and data row
- Update any other functions that write to those columns
- Tell Olly to delete the entire Master tab before re-testing so headers regenerate correctly

---

## Working With Olly — Preferences

- **Always share file paths** after every edit — on their own line, easy to copy
- **Confirm before bulk deletes** — e.g. clearing multiple sheet sections or resetting multiple counters at once
- **debugTracking first** — always run this before re-testing to confirm counter state
- **One change at a time when debugging** — don't reset multiple counters or delete multiple tabs at once; isolate variables
- **Be specific about which tab** — always name the exact sheet tab, not just "the sheet"

---

## What's Still To Build

- [ ] Onboarding email sequence (between purchase and baseline form submission)
- [ ] Stage 2 upsell email at Week 6 (held pending real client results data)
- [ ] Sales page for the 6-week intensive
- [ ] ManyChat automation linking to the baseline form for new buyers
- [ ] Price raise to $497 once client results data exists

## Programs Now Live (as of 2026-06-24)

| Program | Script | Interval | Metrics |
|-----------|--------|----------|---------|
| Regulate for Relief | `progress-tracker.gs` | Weekly (6 weeks) | 9 metrics (1–10) |
| Release & Let Go | `release-and-let-go-tracker.gs` | Weekly (4 weeks) | 4 metrics (1–10) |
| Heart Activation | `heart-activation-tracker.gs` | Weekly (6 weeks) | 9 metrics (1–10) |
| Emotional Mastery | `emotional-mastery-tracker.gs` | Weekly (6 weeks) | 3 metrics (1–10) |
| Creative Flow | `creative-flow-tracker.gs` | Monthly (ongoing) | Confidence (text), Synchronicities, Wins |
| Master Client Tracker | `master-tracker.gs` | Syncs every 5 min | All 5 programs combined |

---

## Changelog

### 2026-07-01 — Program rename session: Heal & Let Go → Release & Let Go
- Added never rule 11: always write "program" not "programme" (American spelling — Olly corrected this directly)
- Added never rule 12: when renaming a program, grep for all old name variants including prose inside email HTML bodies — a global find-replace misses hardcoded strings like meditation names
- Updated Programs Now Live table: Heal & Let Go → Release & Let Go, old filename → release-and-let-go-tracker.gs

### 2026-06-24 — New program builds + Master Sheet
- Added 5 new never rules (6–10): response tabs, baseline URL in CONFIG, test data for multiple choice, days vs weeks wording, completed tab append-only
- Added "Building a New Program Tracker" section with form column order rule, Google Forms linking guidance, setup sequence, and Master Sheet dynamic header finding
- Added "Programs Now Live" table listing all 5 live trackers and the Master Sheet
- Lessons source: building Heal & Let Go, Heart Activation, Emotional Mastery, Creative Flow, and Master Client Tracker in a single session
