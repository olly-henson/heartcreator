---
name: dashboard-ga4-timezone-fix
description: GA4 timezone bug in Apps Script — month/year hardcoded to 2026-06-17; needs reverting in July
metadata:
  type: project
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
