---
name: dashboard-ga4-timezone-fix
description: GA4 timezone bug in Apps Script — root cause fixed 2026-07-07 (ga4DateStr now uses script timezone, not hardcoded UTC)
metadata:
  type: project
---

## RESOLVED 2026-07-07

Root cause fixed properly this time. `ga4DateStr()` in `C:\Users\Olly\AI OS\heartcreator\marketing\ghl-dashboard-apps-script.js` (two copies, lines ~212 and ~734) was hardcoded to format dates in UTC:
```js
function ga4DateStr(d) { return Utilities.formatDate(d, "UTC", "yyyy-MM-dd"); }
```
But `todayStart`/`weekStart` (used elsewhere in the script, e.g. `getPeriodStarts()`) are built with plain `new Date(...)`, which Apps Script interprets using the **project's script timezone** (Windhoek, GMT+2) — not UTC. The 2-hour offset shifted the GA4 date boundary, pulling an extra day into "Today" and "This Week" figures (Opt-in Page Visits mismatched against GHL-sourced Leads, producing skewed conversion rates like 25%/77.8% vs a steady ~51%).

**Fix applied:** changed both copies to:
```js
function ga4DateStr(d) { return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd"); }
```
This keeps GA4 date formatting in sync with whatever the project's timezone is set to (works regardless of the actual zone — confirmed working with Windhoek GMT+2), so no seasonal DST hardcoding or manual reverting needed again.

**Why the June fix wasn't durable:** the 2026-06-22 patch only hardcoded "This Month"/"This Year" to a fixed date string, which masked the symptom for those periods but left "Today"/"This Week" (and the underlying UTC-vs-local mismatch) unfixed. This time the actual root cause (UTC hardcoding vs local Date construction) was corrected instead of patched around.

---

## GA4 Timezone Bug — Dashboard Apps Script

**File:** `C:\Users\Olly\AI OS\funnel\references\ghl-dashboard-apps-script.js`

### The problem
`ga4DateStr()` formats dates in UTC, but the Google Sheet runs in UK time (BST = UTC+1). This means `new Date(2026, 5, 17)` (midnight BST) becomes `2026-06-16 23:00 UTC`, so GA4 gets `"2026-06-16"` — picking up an extra day of data vs the hardcoded `"2026-06-17"` used for All Time.

### The fix applied (2026-06-22)
Hardcoded `"2026-06-17"` for both "This Month" and "This Year" GA4 calls, so they match All Time:

- `medVisits.month` and `medVisits.year` → `"2026-06-17"`
- `appVisits.month` and `appVisits.year` → `"2026-06-17"`
- `pageMonth` and `pageYear` → `"2026-06-17"`

### ACTION REQUIRED IN JULY
When Olly re-runs the script in July, revert the "This Month" lines back to dynamic dates:

```js
month: fetchGA4PageVisitors("/meditation", ga4DateStr(ms)),
month: fetchGA4PageVisitors("/coaching-application", ga4DateStr(ms)),
const pageMonth = fetchGA4AllPages(ga4DateStr(ms));
```

Keep "This Year" hardcoded to `"2026-06-17"` permanently (funnel go-live date).

The timezone offset will no longer cause a problem for "This Month" once we're in July, because June 1st won't be the month start — the extra day picked up was specific to the launch month straddling the go-live date.

**Why:** BST offset causes midnight local = previous day UTC, so GA4 date ranges start one day early when using dynamic date conversion.
